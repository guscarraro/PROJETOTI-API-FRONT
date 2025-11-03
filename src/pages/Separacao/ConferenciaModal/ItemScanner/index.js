import React, { useEffect, useRef, useState } from "react";
import bep from "../../../../sounds/beep-ok.mp3";
import beperr from "../../../../sounds/beep-error.mp3";

const beepOk = new Audio(bep);
const beepErr = new Audio(beperr);

/**
 * Props:
 * - expectedBars: string[] (EANs esperados, usado só para beep “ok/erro”)
 * - onScanEan: (ean:string) => void
 * - onScanLoteQuantidade: ({ lote:string, quantidade:number }) => void
 */
export default function ItemScanner({ expectedBars = [], onScanEan, onScanLoteQuantidade }) {
  const eanRef = useRef(null);
  const loteRef = useRef(null);
  const qtdRef = useRef(null);

  const [bufEAN, setBufEAN] = useState("");
  const [bufLote, setBufLote] = useState("");
  const [bufQTD, setBufQTD] = useState("");

  // helper: foco
  useEffect(() => {
    setTimeout(() => {
      try { eanRef.current?.focus({ preventScroll: true }); } catch {}
    }, 0);
  }, []);

  // USB-like buffer por campo: EAN
  useEffect(() => {
    const el = eanRef.current;
    if (!el) return;

    let buf = "";
    let tm = null;
    function flush() {
      const code = buf.trim();
      buf = "";
      if (code) handleEAN(code);
    }
    function onKey(e) {
      if (tm) clearTimeout(tm);
      if (e.key === "Enter") flush();
      else if (e.key.length === 1) {
        buf += e.key;
        tm = setTimeout(flush, 120);
      }
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  // USB-like buffer por campo: LOTE
  useEffect(() => {
    const el = loteRef.current;
    if (!el) return;

    let buf = "";
    let tm = null;
    function flush() {
      const code = buf.trim();
      buf = "";
      if (code) {
        setBufLote(code);
        setTimeout(() => { try { qtdRef.current?.focus({ preventScroll: true }); } catch {} }, 0);
      }
    }
    function onKey(e) {
      if (tm) clearTimeout(tm);
      if (e.key === "Enter") flush();
      else if (e.key.length === 1) {
        buf += e.key;
        tm = setTimeout(flush, 120);
      }
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  // USB-like buffer por campo: QTD
  useEffect(() => {
    const el = qtdRef.current;
    if (!el) return;

    let buf = "";
    let tm = null;
    function flush() {
      const code = buf.trim();
      buf = "";
      if (code) {
        setBufQTD(code);
        handleLoteQtd(bufLote || "", code);
      }
    }
    function onKey(e) {
      if (tm) clearTimeout(tm);
      if (e.key === "Enter") flush();
      else if (e.key.length === 1) {
        buf += e.key;
        tm = setTimeout(flush, 120);
      }
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [bufLote]);

  // Handlers explícitos (permite digitar/manual também)
  function handleEAN(code) {
    const val = String(code || bufEAN || "").trim();
    if (!val) return;
    let exists = false;
    for (let i = 0; i < expectedBars.length; i++) {
      if (String(expectedBars[i]).trim() === val) { exists = true; break; }
    }
    try {
      if (exists) { beepOk.currentTime = 0; beepOk.play(); }
      else { beepErr.currentTime = 0; beepErr.play(); }
    } catch {}
    setBufEAN("");
    if (onScanEan) onScanEan(val);
  }

  function handleLoteQtd(lote, qtdStr) {
    const loteVal = String(lote || bufLote || "").trim();
    const qtdVal = String(qtdStr || bufQTD || "").trim();
    const qn = parseInt(qtdVal, 10);
    if (!loteVal) return;
    if (!qn || isNaN(qn) || qn <= 0) return;
    setBufLote("");
    setBufQTD("");
    if (onScanLoteQuantidade) onScanLoteQuantidade({ lote: loteVal, quantidade: qn });
    try { beepOk.currentTime = 0; beepOk.play(); } catch {}
    setTimeout(() => { try { loteRef.current?.focus({ preventScroll: true }); } catch {} }, 0);
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <SmallLabel>Leitura por EAN (unitária)</SmallLabel>
        <input
          ref={eanRef}
          value={bufEAN}
          onChange={(e) => setBufEAN(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleEAN(); }}
          placeholder="Aponte o leitor aqui para EAN..."
          style={{
            width: "100%", padding: 12, borderRadius: 10, border: "1px dashed #94a3b8",
            fontWeight: 600
          }}
        />
        <div style={{ fontSize: 12, opacity: .7 }}>
          Cada leitura de EAN abate <strong>1 unidade</strong>.
        </div>
      </div>

      <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
        <SmallLabel>Leitura por LOTE (caixa fechada)</SmallLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 8 }}>
          <input
            ref={loteRef}
            value={bufLote}
            onChange={(e) => setBufLote(e.target.value)}
            placeholder="Bipe o LOTE aqui..."
            style={{
              width: "100%", padding: 12, borderRadius: 10, border: "1px dashed #94a3b8",
              fontWeight: 600
            }}
          />
          <input
            ref={qtdRef}
            value={bufQTD}
            onChange={(e) => setBufQTD(e.target.value)}
            placeholder="QTD"
            inputMode="numeric"
            style={{
              width: "100%", padding: 12, borderRadius: 10, border: "1px dashed #94a3b8",
              fontWeight: 700, textAlign: "center"
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleLoteQtd(); }}
          />
        </div>
        <div style={{ fontSize: 12, opacity: .7 }}>
          1) Bipe o <strong>LOTE</strong> • 2) Bipe a <strong>QUANTIDADE</strong> (código numérico). O sistema abate a quantidade.
        </div>
      </div>
    </div>
  );
}

function SmallLabel({ children }) {
  return <div style={{ fontSize: 12, opacity: 0.8 }}>{children}</div>;
}
