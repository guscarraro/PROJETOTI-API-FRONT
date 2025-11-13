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

  // Leitura EAN unitário (modo leitor)
  useEffect(() => {
    const el = eanUnitRef.current;
    if (!el) return;

    let buf = "";
    let tm = null;

    function flush() {
      const code = buf.trim();
      buf = "";
      if (!code) return;
      if (bufLote) return; // com lote ativo, ignora EAN unitário
      handleEANUnit(code);
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
  }, [bufLote, expectedBars]);

  // Leitura do LOTE (modo leitor)
  useEffect(() => {
    const el = loteRef.current;
    if (!el) return;

    let buf = "";
    let tm = null;

    function flush() {
      const code = buf.trim();
      buf = "";
      if (!code) return;
      setBufLote(code);
      setBufEANLote("");
      setBufQTD("");
      setTimeout(() => {
        try {
          eanLoteRef.current?.focus({ preventScroll: true });
        } catch {}
      }, 0);
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

  // Leitura do EAN do lote (modo leitor)
  useEffect(() => {
    const el = eanLoteRef.current;
    if (!el) return;

    let buf = "";
    let tm = null;

    function flush() {
      const code = buf.trim();
      buf = "";
      if (!code) return;
      setBufEANLote(code);
      setTimeout(() => {
        try {
          qtdRef.current?.focus({ preventScroll: true });
        } catch {}
      }, 0);
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

  function play(audio) {
    try {
      audio.currentTime = 0;
      audio.play();
    } catch {}
  }

  function handleEANUnit(code) {
    const val = String(code || bufEANUnit || "").trim();
    if (!val) return;
    const exists = expectedBars.some((b) => String(b).trim() === val);
    play(exists ? beepOk : beepErr);
    setBufEANUnit("");
    if (onScanEan) onScanEan(val);
  }

  async function handleLoteFinalize(lote, ean, qtdStr) {
    const loteVal = String(lote || "").trim();
    const eanVal = String(ean || "").trim();
    const qtdVal = String(qtdStr || bufQTD || "").trim();
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
      <div style={{ display: "grid", gap: 6 }}>
        <SmallLabel>Leitura por EAN (unitária)</SmallLabel>
        <input
          ref={eanUnitRef}
          value={bufEANUnit}
          onChange={(e) => setBufEANUnit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !bufLote) handleEANUnit();
          }}
          placeholder={
            bufLote
              ? "Desabilitado: finalize o fluxo de LOTE"
              : "Aponte o leitor aqui para EAN..."
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
            placeholder="Bipe o LOTE aqui..."
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
            placeholder="Agora bipe o EAN do lote..."
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
          Fluxo: 1) <strong>LOTE</strong> → 2) <strong>EAN do lote</strong> → 3>{" "}
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
