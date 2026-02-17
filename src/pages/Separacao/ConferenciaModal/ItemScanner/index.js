// ItemScanner.jsx
import React, { useEffect, useRef, useState } from "react";
import bep from "../../../../sounds/beep-ok.mp3";
import beperr from "../../../../sounds/beep-error.mp3";

const beepOk = new Audio(bep);
const beepErr = new Audio(beperr);

/**
 * Props:
 * - expectedBars: string[]
 * - onScanEan: (ean:string) => void
 * - onScanLoteQuantidade: ({ lote:string, ean:string, quantidade:number }) => boolean|Promise<boolean>
 */
export default function ItemScanner({
  expectedBars = [],
  onScanEan,
  onScanLoteQuantidade,
}) {
  const eanUnitRef = useRef(null);
  const loteRef = useRef(null);
  const eanLoteRef = useRef(null);
  const qtdRef = useRef(null);

  const [bufEANUnit, setBufEANUnit] = useState("");
  const [bufLote, setBufLote] = useState("");
  const [bufEANLote, setBufEANLote] = useState("");
  const [bufQTD, setBufQTD] = useState("");

  useEffect(() => {
    setTimeout(() => {
      try {
        eanUnitRef.current?.focus({ preventScroll: true });
      } catch {}
    }, 0);
  }, []);

  function onlyDigits(s) {
    const txt = String(s || "");
    let out = "";
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      if (c >= "0" && c <= "9") out += c;
    }
    return out;
  }

  function play(audio) {
    try {
      audio.currentTime = 0;
      audio.play();
    } catch {}
  }

  function handleEANUnit(code) {
    const val = String(code != null ? code : bufEANUnit || "").trim();
    if (!val) return;
    if (bufLote) return; // com lote ativo, ignora EAN unitário

    const normalized = onlyDigits(val).trim();
    if (!normalized) return;

    const exists = expectedBars.some((b) => String(b).trim() === normalized);
    play(exists ? beepOk : beepErr);

    setBufEANUnit("");
    if (onScanEan) onScanEan(normalized);

    setTimeout(() => {
      try {
        eanUnitRef.current?.focus({ preventScroll: true });
      } catch {}
    }, 0);
  }

  async function handleLoteFinalize(lote, ean, qtdStr) {
    const loteVal = String(lote || "").trim().toUpperCase();
    const eanVal = onlyDigits(String(ean || "")).trim();
    const qtdVal = String(qtdStr || "").trim();
    const qn = parseInt(qtdVal, 10);

    if (!loteVal || !eanVal || !qn || isNaN(qn) || qn <= 0) {
      play(beepErr);
      return;
    }

    setBufLote("");
    setBufEANLote("");
    setBufQTD("");

    let ok = false;
    if (onScanLoteQuantidade) {
      try {
        ok = await Promise.resolve(
          onScanLoteQuantidade({ lote: loteVal, ean: eanVal, quantidade: qn })
        );
      } catch {
        ok = false;
      }
    }
    play(ok ? beepOk : beepErr);

    setTimeout(() => {
      try {
        loteRef.current?.focus({ preventScroll: true });
      } catch {}
    }, 0);
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {/* ===== EAN UNITÁRIO ===== */}
      <div style={{ display: "grid", gap: 6 }}>
        <SmallLabel>Leitura por EAN (unitária)</SmallLabel>
        <input
          ref={eanUnitRef}
          value={bufEANUnit}
          onChange={(e) => setBufEANUnit(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData?.getData("text") || "";
            const val = onlyDigits(text).trim();
            if (!val) return;

            setBufEANUnit(val);

            // colou -> já processa (se não estiver em fluxo de lote)
            if (!bufLote) {
              setTimeout(() => handleEANUnit(val), 0);
            }
          }}
          onKeyDown={(e) => {
            // não atrapalhar Ctrl+V / atalhos
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === "Enter") {
              e.preventDefault();
              if (!bufLote) handleEANUnit(bufEANUnit);
            }
          }}
          placeholder={
            bufLote
              ? "Desabilitado: finalize o fluxo de LOTE"
              : "Digite, cole (Ctrl+V) ou bipe o EAN..."
          }
          disabled={!!bufLote}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: `1px dashed ${bufLote ? "#cbd5e1" : "#94a3b8"}`,
            background: bufLote ? "#f1f5f9" : "#fff",
            fontWeight: 600,
          }}
        />
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          EAN isolado abate <strong>1</strong>. Com LOTE ativo, este campo fica
          desabilitado até finalizar LOTE → EAN → QTD.
        </div>
      </div>

      {/* ===== FLUXO LOTE ===== */}
      <div style={{ display: "grid", gap: 6 }}>
        <SmallLabel>Leitura por LOTE (caixa fechada)</SmallLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 120px",
            gap: 8,
          }}
        >
          <input
            ref={loteRef}
            value={bufLote}
            onChange={(e) => {
              setBufLote(e.target.value);
              setBufEANLote("");
              setBufQTD("");
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData?.getData("text") || "";
              const val = String(text || "").trim().toUpperCase();
              if (!val) return;

              setBufLote(val);
              setBufEANLote("");
              setBufQTD("");

              setTimeout(() => {
                try {
                  eanLoteRef.current?.focus({ preventScroll: true });
                } catch {}
              }, 0);
            }}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;

              if (e.key === "Enter") {
                e.preventDefault();
                const v = String(bufLote || "").trim();
                if (!v) return;
                setTimeout(() => {
                  try {
                    eanLoteRef.current?.focus({ preventScroll: true });
                  } catch {}
                }, 0);
              }
            }}
            placeholder="Digite/cole ou bipe o LOTE..."
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px dashed #94a3b8",
              fontWeight: 600,
            }}
          />

          <input
            ref={eanLoteRef}
            value={bufEANLote}
            onChange={(e) => setBufEANLote(e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData?.getData("text") || "";
              const val = onlyDigits(text).trim();
              if (!val) return;

              setBufEANLote(val);

              setTimeout(() => {
                try {
                  qtdRef.current?.focus({ preventScroll: true });
                } catch {}
              }, 0);
            }}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;

              if (e.key === "Enter") {
                e.preventDefault();
                setTimeout(() => {
                  try {
                    qtdRef.current?.focus({ preventScroll: true });
                  } catch {}
                }, 0);
              }
            }}
            placeholder="Digite/cole ou bipe o EAN do lote..."
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px dashed #94a3b8",
              fontWeight: 600,
            }}
          />

          <input
            ref={qtdRef}
            value={bufQTD}
            onChange={(e) => setBufQTD(e.target.value)}
            placeholder="QTD"
            inputMode="numeric"
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;

              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                handleLoteFinalize(bufLote, bufEANLote, bufQTD);
              }
            }}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px dashed #94a3b8",
              fontWeight: 700,
              textAlign: "center",
            }}
          />
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Fluxo: 1) <strong>LOTE</strong> → 2) <strong>EAN do lote</strong> → 3{" "}
          <strong>QTD</strong>. Só após a QTD o sistema abate ou aponta
          divergência.
        </div>
      </div>
    </div>
  );
}

function SmallLabel({ children }) {
  return <div style={{ fontSize: 12, opacity: 0.8 }}>{children}</div>;
}
