import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { VideoBox, Banner } from "../CameraVideo/style";
import bep from "../../../../sounds/beep-ok.mp3";
import beperr from "../../../../sounds/beep-error.mp3";

const beepOk = new Audio(bep);
const beepErr = new Audio(beperr);

export default function ItemScanner({ onScan, loading, expectedBars = [] }) {
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const [camOk, setCamOk] = useState(false);
  const [reading, setReading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const stopFnRef = useRef(null);
  const lastScanTsRef = useRef(0); // cooldown por tempo

  // --- USB SCANNER (modo teclado) ---
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    let buf = "";
    let tm = null;

    function flush() {
      const code = buf.trim();
      buf = "";
      if (code) handleCode(code);
      // mantém foco para o coletor
      setTimeout(() => { try { el.focus({ preventScroll: true }); } catch {} }, 0);
    }

    function onKey(e) {
      if (tm) clearTimeout(tm);
      if (e.key === "Enter") {
        flush();
      } else if (e.key.length === 1) {
        buf += e.key;
        tm = setTimeout(flush, 120);
      }
    }

    el.addEventListener("keydown", onKey);
    el.focus({ preventScroll: true });

    return () => {
      el.removeEventListener("keydown", onKey);
    };
  }, []);

  // --- ZXING CAMERA (stream constante) ---
  useEffect(() => {
    let active = true;
    const reader = new BrowserMultiFormatReader();

    (async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices || !devices.length) {
          setErrMsg("Nenhuma câmera encontrada.");
          setCamOk(false);
          return;
        }

        // escolhe traseira se possível
        let selected = devices[0];
        for (let i = 0; i < devices.length; i++) {
          const lbl = String(devices[i].label || "").toLowerCase();
          if (lbl.includes("back") || lbl.includes("rear") || lbl.includes("traseira")) {
            selected = devices[i];
            break;
          }
        }

        const controls = await reader.decodeFromVideoDevice(
          selected.deviceId,
          videoRef.current,
          (result) => {
            if (!active) return;
            if (result) {
              const code = String(result.getText() || "").trim();
              if (code) handleCode(code);
            }
          }
        );

        stopFnRef.current = controls.stop;
        setCamOk(true);
        setErrMsg("");
      } catch (err) {
        console.error("Erro ao inicializar câmera:", err);
        setCamOk(false);
        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
          setErrMsg("Use HTTPS para habilitar a câmera no navegador.");
        } else {
          setErrMsg("Erro ao acessar câmera. Verifique permissões.");
        }
      }
    })();

    return () => {
      active = false;
      try {
        if (stopFnRef.current) stopFnRef.current();
      } catch {}
    };
  }, []);

  // --- Processa cada leitura (USB/Câmera) ---
  async function handleCode(code) {
    if (!code) return;

    // cooldown de 300ms para não multiplicar no mesmo frame
    const now = Date.now();
    if (now - lastScanTsRef.current < 300) return;
    lastScanTsRef.current = now;

    setReading(true);

    // Beep de OK/ERR (apenas feedback)
    let exists = false;
    for (let i = 0; i < expectedBars.length; i++) {
      if (String(expectedBars[i]).trim() === code) { exists = true; break; }
    }
    try {
      if (exists) { beepOk.currentTime = 0; beepOk.play(); }
      else { beepErr.currentTime = 0; beepErr.play(); }
    } catch {}

    if (onScan) onScan(code);

    await new Promise((r) => setTimeout(r, 150));
    setReading(false);
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* USB input (fica acima da câmera) */}
      <div>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Leitor USB (modo teclado)</div>
        <input
          ref={inputRef}
          type="text"
          inputMode="none"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px dashed #94a3b8",
            background: loading ? "rgba(16,185,129,.08)" : "transparent",
            fontWeight: 600,
          }}
          placeholder="Aponte o leitor aqui (foco automático)"
        />
      </div>

      {/* CÂMERA — maior para o operador ver */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 800,
          aspectRatio: "16/9",
          borderRadius: 16,
          overflow: "hidden",
          background: "#111",
          marginInline: "auto",
        }}
      >
        <VideoBox style={{ position: "absolute", inset: 0 }}>
          <video
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            muted
            playsInline
          />
          {!camOk && <Banner>{errMsg || "Leitura por câmera não suportada."}</Banner>}
          {reading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.25)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 800,
              }}
            >
              Lendo código…
            </div>
          )}
        </VideoBox>
      </div>

      <div style={{ fontSize: 12, opacity: 0.65 }}>
        Dica: mantenha o código centralizado e use HTTPS no mobile.
      </div>
    </div>
  );
}
