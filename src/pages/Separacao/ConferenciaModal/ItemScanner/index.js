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
 * - loteSemEan?: boolean  -> se true: fluxo de lote é só LOTE + QTD (sem input de EAN)
 */
export default function ItemScanner({
  expectedBars = [],
  onScanEan,
  onScanLoteQuantidade,
  loteSemEan = false,
}) {
  const eanUnitRef = useRef(null);
  const loteRef = useRef(null);
  const eanLoteRef = useRef(null);
  const qtdRef = useRef(null);

  const [bufEANUnit, setBufEANUnit] = useState("");
  const [bufLote, setBufLote] = useState("");
  const [bufEANLote, setBufEANLote] = useState("");
  const [bufQTD, setBufQTD] = useState("");

  const unitTimerRef = useRef(null);
  const loteTimerRef = useRef(null);
  const eanLoteTimerRef = useRef(null);
  const qtdTimerRef = useRef(null);

  const lastUnitRef = useRef({ v: "", at: 0 });
  const lastLoteFinalizeRef = useRef({ key: "", at: 0 });

  useEffect(() => {
    setTimeout(() => {
      try {
        eanUnitRef.current?.focus({ preventScroll: true });
      } catch {}
    }, 0);

    return () => {
      clearTimeout(unitTimerRef.current);
      clearTimeout(loteTimerRef.current);
      clearTimeout(eanLoteTimerRef.current);
      clearTimeout(qtdTimerRef.current);
    };
  }, []);

  function normalizeEAN(s) {
    const txt = String(s || "").trim().toUpperCase();
    let out = "";
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      const isNum = c >= "0" && c <= "9";
      const isAlpha = c >= "A" && c <= "Z";
      if (isNum || isAlpha) out += c;
    }
    return out;
  }

  function normalizeLote(s) {
    return String(s || "").trim().toUpperCase();
  }

  function play(audio) {
    try {
      audio.currentTime = 0;
      audio.play();
    } catch {}
  }

  function focusRef(ref) {
    setTimeout(() => {
      try {
        ref.current?.focus({ preventScroll: true });
      } catch {}
    }, 0);
  }

  function schedule(fn, timerRef, delayMs = 120) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, delayMs);
  }

  function handleEANUnit(code) {
    const val = String(code != null ? code : bufEANUnit || "").trim();
    if (!val) return;
    if (bufLote) return;

    const normalized = normalizeEAN(val);
    if (!normalized) return;

    const now = Date.now();
    if (lastUnitRef.current.v === normalized && now - lastUnitRef.current.at < 700) {
      setBufEANUnit("");
      focusRef(eanUnitRef);
      return;
    }
    lastUnitRef.current = { v: normalized, at: now };

    let exists = false;
    for (let i = 0; i < expectedBars.length; i++) {
      const b = normalizeEAN(expectedBars[i]);
      if (b && b === normalized) {
        exists = true;
        break;
      }
    }

    play(exists ? beepOk : beepErr);

    setBufEANUnit("");
    if (onScanEan) onScanEan(normalized);

    focusRef(eanUnitRef);
  }

  async function handleLoteFinalize(lote, ean, qtdStr) {
    const loteVal = normalizeLote(lote);
    const eanVal = loteSemEan ? "" : normalizeEAN(String(ean || ""));
    const qtdVal = String(qtdStr || "").trim();
    const qn = parseInt(qtdVal, 10);

    // validação
    if (!loteVal || !qn || isNaN(qn) || qn <= 0) {
      play(beepErr);
      if (!loteVal) focusRef(loteRef);
      else focusRef(qtdRef);
      return;
    }

    // se NÃO for loteSemEan, aí sim exige ean
    if (!loteSemEan && !eanVal) {
      play(beepErr);
      focusRef(eanLoteRef);
      return;
    }

    const key = loteSemEan
      ? `${loteVal}::${qn}`
      : `${loteVal}::${eanVal}::${qn}`;

    const now = Date.now();
    if (lastLoteFinalizeRef.current.key === key && now - lastLoteFinalizeRef.current.at < 900) {
      setBufLote("");
      setBufEANLote("");
      setBufQTD("");
      focusRef(loteRef);
      return;
    }
    lastLoteFinalizeRef.current = { key, at: now };

    setBufLote("");
    setBufEANLote("");
    setBufQTD("");

    let ok = false;
    if (onScanLoteQuantidade) {
      try {
        ok = await Promise.resolve(
          onScanLoteQuantidade({
            lote: loteVal,
            ean: eanVal, // "" quando loteSemEan=true
            quantidade: qn,
          })
        );
      } catch {
        ok = false;
      }
    }
    play(ok ? beepOk : beepErr);

    focusRef(loteRef);
  }

  const UNIT_MIN_LEN = 8;
  const LOTE_MIN_LEN = 3;
  const EAN_LOTE_MIN_LEN = 8;
  const QTD_MAX_LEN = 6;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {/* ===== EAN UNITÁRIO ===== */}
      <div style={{ display: "grid", gap: 6 }}>
        <SmallLabel>Leitura por EAN (unitária)</SmallLabel>
        <input
          ref={eanUnitRef}
          value={bufEANUnit}
          onChange={(e) => {
            const raw = e.target.value;
            setBufEANUnit(raw);

            if (bufLote) return;

            const val = normalizeEAN(raw);
            schedule(() => {
              if (!bufLote && val && val.length >= UNIT_MIN_LEN) {
                handleEANUnit(val);
              }
            }, unitTimerRef, 120);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData?.getData("text") || "";
            const val = normalizeEAN(text);
            if (!val) return;

            setBufEANUnit(val);

            if (!bufLote) {
              schedule(() => handleEANUnit(val), unitTimerRef, 0);
            }
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === "Enter") {
              e.preventDefault();
              if (!bufLote) handleEANUnit(bufEANUnit);
            }

            if (e.key === "Tab") {
              if (!bufLote) {
                e.preventDefault();
                handleEANUnit(bufEANUnit);
              }
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
          desabilitado até finalizar o lote.
        </div>
      </div>

      {/* ===== FLUXO LOTE ===== */}
      <div style={{ display: "grid", gap: 6 }}>
        <SmallLabel>
          Leitura por LOTE {loteSemEan ? "(somente LOTE + QTD)" : "(LOTE + EAN + QTD)"}
        </SmallLabel>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: loteSemEan ? "1fr 140px" : "1fr 1fr 120px",
            gap: 8,
          }}
        >
          {/* LOTE */}
          <input
            ref={loteRef}
            value={bufLote}
            onChange={(e) => {
              const raw = e.target.value;
              setBufLote(raw);

              // reset do restante
              setBufEANLote("");
              setBufQTD("");

              const val = normalizeLote(raw);
              schedule(() => {
                if (val && val.length >= LOTE_MIN_LEN) {
                  // ✅ se for loteSemEan, pula direto pra QTD
                  if (loteSemEan) focusRef(qtdRef);
                  else focusRef(eanLoteRef);
                }
              }, loteTimerRef, 120);
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData?.getData("text") || "";
              const val = normalizeLote(text);
              if (!val) return;

              setBufLote(val);
              setBufEANLote("");
              setBufQTD("");

              if (loteSemEan) focusRef(qtdRef);
              else focusRef(eanLoteRef);
            }}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;

              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                const v = normalizeLote(bufLote);
                if (!v) return;

                if (loteSemEan) focusRef(qtdRef);
                else focusRef(eanLoteRef);
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

          {/* EAN do lote (só se precisar) */}
          {!loteSemEan && (
            <input
              ref={eanLoteRef}
              value={bufEANLote}
              onChange={(e) => {
                const raw = e.target.value;
                setBufEANLote(raw);

                const val = normalizeEAN(raw);
                schedule(() => {
                  if (val && val.length >= EAN_LOTE_MIN_LEN) {
                    focusRef(qtdRef);
                  }
                }, eanLoteTimerRef, 120);
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData?.getData("text") || "";
                const val = normalizeEAN(text);
                if (!val) return;

                setBufEANLote(val);
                focusRef(qtdRef);
              }}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey || e.altKey) return;

                if (e.key === "Enter" || e.key === "Tab") {
                  e.preventDefault();
                  focusRef(qtdRef);
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
          )}

          {/* QTD */}
          <input
            ref={qtdRef}
            value={bufQTD}
            onChange={(e) => {
              const raw = e.target.value;
              setBufQTD(raw);

              const digits = String(raw || "").replace(/\D/g, "");

              schedule(() => {
                const qn = parseInt(digits || "0", 10);
                if (qn > 0) {
                  handleLoteFinalize(bufLote, bufEANLote, digits);
                }
              }, qtdTimerRef, 140);

              if (digits.length > QTD_MAX_LEN) {
                setBufQTD(digits.slice(0, QTD_MAX_LEN));
              }
            }}
            placeholder="QTD"
            inputMode="numeric"
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData?.getData("text") || "";
              const digits = String(text || "").replace(/\D/g, "");
              if (!digits) return;
              setBufQTD(digits);

              schedule(() => handleLoteFinalize(bufLote, bufEANLote, digits), qtdTimerRef, 0);
            }}
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
          {loteSemEan ? (
            <>
              Fluxo: <strong>LOTE</strong> → <strong>QTD</strong>. Ao parar de bipar/digitar em cada campo, ele avança e finaliza sozinho.
            </>
          ) : (
            <>
              Fluxo: 1) <strong>LOTE</strong> → 2) <strong>EAN do lote</strong> → 3{" "}
              <strong>QTD</strong>. Ao parar de bipar/digitar em cada campo, ele avança sozinho.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SmallLabel({ children }) {
  return <div style={{ fontSize: 12, opacity: 0.8 }}>{children}</div>;
}
