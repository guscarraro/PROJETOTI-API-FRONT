import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

// --- utils ---
function onlyDigits(s) {
  return String(s || "").replace(/\D/g, "");
}

// DANFE geralmente é CODE_128 e às vezes o texto vem com lixo junto
function extractChave44(raw) {
  const text = String(raw || "");
  const m = text.match(/\d{44}/);
  if (m && m[0]) return m[0];

  const d = onlyDigits(text);
  if (d.length === 44) return d;

  return "";
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function CameraScannerInline({ active, disabled, onDetected }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const stopRef = useRef(false);

  const lastRef = useRef("");
  const onDetectedRef = useRef(onDetected);

  const [err, setErr] = useState("");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [deviceLabel, setDeviceLabel] = useState("");

  const [scanState, setScanState] = useState("searching"); // searching | partial | success
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  // torch/zoom (opcional, depende do celular)
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomMinMax, setZoomMinMax] = useState({ min: 1, max: 1 });

  const canRun = useMemo(() => !!active && !disabled, [active, disabled]);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const hardStop = useCallback(() => {
    stopRef.current = true;

    setErr("");
    setStatus("");
    setScanState("searching");
    setProgress(0);
    lastRef.current = "";

    setTorchSupported(false);
    setTorchOn(false);
    setZoomSupported(false);
    setZoom(1);
    setZoomMinMax({ min: 1, max: 1 });

    // para zxing
    try {
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
    } catch {}

    // mata tracks do vídeo (remove ícone de câmera ativa)
    try {
      const v = videoRef.current;
      const s = v?.srcObject;
      if (s && s.getTracks) {
        const tracks = s.getTracks();
        for (let i = 0; i < tracks.length; i++) {
          try {
            tracks[i].stop();
          } catch {}
        }
      }
    } catch {}

    // limpa video element
    try {
      if (videoRef.current) {
        videoRef.current.pause?.();
        videoRef.current.srcObject = null;
      }
    } catch {}
  }, []);

  const loadDevices = useCallback(async () => {
    try {
      const temp = new BrowserMultiFormatReader();
      const list = await temp.listVideoInputDevices();
      const arr = Array.isArray(list) ? list : [];
      setDevices(arr);

      if (!deviceId && arr.length) {
        // prefere traseira
        let preferred = arr[arr.length - 1]?.deviceId || arr[0]?.deviceId || "";
        for (let i = 0; i < arr.length; i++) {
          const lab = String(arr[i]?.label || "").toLowerCase();
          if (lab.includes("back") || lab.includes("rear") || lab.includes("environment")) {
            preferred = arr[i].deviceId;
            break;
          }
        }
        setDeviceId(preferred);
      }
    } catch {
      // labels podem vir vazios sem permissão
    }
  }, [deviceId]);

  // aplica torch/zoom se suportar
  const applyTrackControls = useCallback(async () => {
    try {
      const v = videoRef.current;
      const stream = v?.srcObject;
      const track = stream?.getVideoTracks?.()?.[0];
      if (!track) return;

      const caps = track.getCapabilities ? track.getCapabilities() : {};
      const suppTorch = !!caps.torch;
      setTorchSupported(suppTorch);

      const suppZoom = typeof caps.zoom === "object" && caps.zoom;
      if (suppZoom) {
        setZoomSupported(true);
        const min = Number(caps.zoom.min || 1);
        const max = Number(caps.zoom.max || 1);
        setZoomMinMax({ min, max });
        setZoom((z) => clamp(z, min, max));
      } else {
        setZoomSupported(false);
      }

      // aplica advanced constraints
      const adv = [];
      if (suppTorch) adv.push({ torch: !!torchOn });
      if (suppZoom) adv.push({ zoom: clamp(zoom, caps.zoom.min || 1, caps.zoom.max || 1) });

      if (adv.length) {
        await track.applyConstraints({ advanced: adv });
      }
    } catch {
      // silencioso (nem todo browser libera)
    }
  }, [torchOn, zoom]);

  const start = useCallback(async () => {
    if (!canRun) return;

    hardStop();
    stopRef.current = false;

    setErr("");
    setStatus("Ativando câmera...");
    setScanState("searching");
    setProgress(0);
    lastRef.current = "";

    try {
      // ✅ HINTS: trava pra 1D do DANFE (CODE_128) e try harder
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints, 120);
      readerRef.current = reader;

      await loadDevices();

      setStatus("Centralize o código no retângulo (DANFE 1D)...");
      const targetDeviceId = deviceId || undefined;

      await reader.decodeFromVideoDevice(targetDeviceId, videoRef.current, (result, error) => {
        if (stopRef.current) return;

        if (result) {
          const text = String(result.getText ? result.getText() : "");
          const chave = extractChave44(text);

          if (chave && chave !== lastRef.current) {
            lastRef.current = chave;

            setScanState("success");
            setProgress(100);
            setStatus("Chave 44 detectada ✅");

            if (onDetectedRef.current) onDetectedRef.current(chave);
            return;
          }

          // parcial (não é “confiança”, é “quantos dígitos consegui ver”)
          const digits = onlyDigits(text);
          const pct = clamp(Math.round((digits.length / 44) * 100), 5, 95);
          setScanState("partial");
          setProgress(pct);
          setStatus(`Lendo… (${digits.length}/44). Ajuste foco/luz.`);
          return;
        }

        const n = String(error?.name || "");
        if (error && n && n !== "NotFoundException") {
          setErr(String(error?.message || error));
        } else {
          if (scanState !== "success") {
            setScanState("searching");
            setProgress(0);
          }
        }
      });

      // depois que a câmera começou, tenta pegar label e suportes
      await loadDevices();

      try {
        if (Array.isArray(devices) && devices.length && deviceId) {
          for (let i = 0; i < devices.length; i++) {
            if (devices[i]?.deviceId === deviceId) {
              setDeviceLabel(String(devices[i]?.label || "Câmera selecionada"));
              break;
            }
          }
        }
      } catch {}

      // detecta torch/zoom e aplica
      setTimeout(() => {
        applyTrackControls();
      }, 250);
    } catch (e) {
      setErr(String(e?.message || e));
      setStatus("");
      hardStop();
    }
  }, [canRun, deviceId, devices, hardStop, loadDevices, scanState, applyTrackControls]);

  useEffect(() => {
    if (!canRun) {
      hardStop();
      return;
    }
    start();
    return () => hardStop();
  }, [canRun, start, hardStop]);

  // trocar câmera enquanto ativo => reinicia
  useEffect(() => {
    if (!canRun) return;
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  // quando mudar torch/zoom, tenta aplicar no track atual
  useEffect(() => {
    if (!canRun) return;
    applyTrackControls();
  }, [canRun, torchOn, zoom, applyTrackControls]);

  if (!active) return null;

  const borderColor =
    scanState === "success"
      ? "#16a34a"
      : scanState === "partial"
        ? "#2563eb"
        : "rgba(255,255,255,0.35)";

  return (
    <div
      style={{
        marginTop: 10,
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
        padding: 10,
        display: "grid",
        gap: 10,
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          {deviceLabel ? (
            <>
              Câmera: <b>{deviceLabel}</b>
            </>
          ) : (
            <>
              Câmera: <b>auto (traseira se possível)</b>
            </>
          )}
        </div>

        {devices && devices.length > 1 ? (
          <select
            value={deviceId}
            disabled={disabled}
            onChange={(e) => setDeviceId(e.target.value)}
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: 12,
            }}
          >
            {devices.map((d, idx) => (
              <option key={`${d.deviceId || idx}`} value={d.deviceId}>
                {String(d.label || `Câmera ${idx + 1}`)}
              </option>
            ))}
          </select>
        ) : null}

        {torchSupported ? (
          <button
            type="button"
            onClick={() => setTorchOn((p) => !p)}
            disabled={disabled}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.15)",
              background: torchOn ? "rgba(22,163,74,0.12)" : "white",
              fontSize: 12,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
            title="Liga/desliga flash (se o celular permitir)"
          >
            {torchOn ? "Flash ON" : "Flash OFF"}
          </button>
        ) : null}

        {zoomSupported ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, opacity: 0.9 }}>Zoom</span>
            <input
              type="range"
              min={zoomMinMax.min}
              max={zoomMinMax.max}
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
        ) : null}

        {status ? <div style={{ fontSize: 12, opacity: 0.9 }}>{status}</div> : null}

        {scanState === "partial" ? (
          <div style={{ fontSize: 12 }}>
            Progresso: <b>{progress}%</b>
          </div>
        ) : null}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 520,
          aspectRatio: "16/9",
          background: "#111",
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          // ✅ FUNDAMENTAL pro 1D: NÃO cortar a imagem
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />

        {/* overlay alvo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              width: "78%",
              height: "34%", // ✅ mais “achatado” (melhor pra código 1D)
              borderRadius: 14,
              border: `3px solid ${borderColor}`,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.28) inset",
              transition: "border-color 120ms ease",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              right: 10,
              fontSize: 12,
              color: "rgba(255,255,255,0.92)",
              background: "rgba(0,0,0,0.40)",
              padding: "6px 8px",
              borderRadius: 10,
            }}
          >
            {scanState === "success"
              ? "Detectado ✅"
              : scanState === "partial"
                ? `Lendo… ${progress}% (segure firme, evite reflexo)`
                : "DANFE 1D: aproxime até ficar nítido e preencha o retângulo."}
          </div>
        </div>
      </div>

      {err ? (
        <div style={{ fontSize: 12, color: "#c0392b" }}>{err}</div>
      ) : (
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          Se continuar “mudo”: aumente luz, incline levemente pra tirar reflexo e aproxime até o código ficar bem nítido.
          DANFE 1D geralmente só começa a ler quando o código ocupa boa parte do retângulo.
        </div>
      )}
    </div>
  );
}
