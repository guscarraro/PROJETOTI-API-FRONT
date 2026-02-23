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

  // ✅ modo do fluxo em lote
  const LOTE_MODES = {
    LOTE: "LOTE",
    EAN_QTD: "EAN_QTD",
  };
  const [loteMode, setLoteMode] = useState(LOTE_MODES.LOTE);

  // ✅ tema (lê data-theme do DOM e reage a mudanças)
  const [isDark, setIsDark] = useState(false);

  const unitTimerRef = useRef(null);
  const loteTimerRef = useRef(null);
  const eanLoteTimerRef = useRef(null);
  const qtdTimerRef = useRef(null);

  const lastUnitRef = useRef({ v: "", at: 0 });
  const lastLoteFinalizeRef = useRef({ key: "", at: 0 });

  function readThemeIsDark() {
    try {
      const root = document.documentElement;
      const body = document.body;

      const t1 = root?.getAttribute("data-theme");
      if (t1) return String(t1).toLowerCase() === "dark";

      const t2 = body?.getAttribute("data-theme");
      if (t2) return String(t2).toLowerCase() === "dark";

      return false;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    setIsDark(readThemeIsDark());

    let obsRoot = null;
    let obsBody = null;

    try {
      obsRoot = new MutationObserver(() => setIsDark(readThemeIsDark()));
      obsRoot.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });
    } catch {}

    try {
      obsBody = new MutationObserver(() => setIsDark(readThemeIsDark()));
      obsBody.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });
    } catch {}

    return () => {
      try {
        obsRoot?.disconnect();
        obsBody?.disconnect();
      } catch {}
    };
  }, []);

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

  // ✅ estilos (light/dark)
  const colors = {
    bg: isDark ? "#0b1220" : "#ffffff",
    bgSoft: isDark ? "#0f172a" : "#f1f5f9",
    text: isDark ? "#e5e7eb" : "#111827",
    textSoft: isDark ? "#cbd5e1" : "#374151",
    border: isDark ? "rgba(148, 163, 184, 0.45)" : "#94a3b8",
    borderSoft: isDark ? "#334155" : "#cbd5e1",
  };

  const inputBaseStyle = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: `1px dashed ${colors.border}`,
    background: colors.bg,
    color: colors.text,
    fontWeight: 600,
    outline: "none",
  };

  const selectStyle = {
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px dashed ${colors.border}`,
    fontWeight: 700,
    background: colors.bg,
    color: colors.text,
    minWidth: 220,
    outline: "none",
  };

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
    const isEanQtd = loteMode === LOTE_MODES.EAN_QTD;

    const loteVal = isEanQtd ? "__SEM_LOTE__" : normalizeLote(lote);

    const eanVal = isEanQtd
      ? normalizeEAN(String(ean || ""))
      : loteSemEan
        ? ""
        : normalizeEAN(String(ean || ""));

    const qtdVal = String(qtdStr || "").trim();
    const qn = parseInt(qtdVal, 10);

    if (!qn || isNaN(qn) || qn <= 0) {
      play(beepErr);
      focusRef(qtdRef);
      return;
    }

    if (isEanQtd) {
      if (!eanVal) {
        play(beepErr);
        focusRef(eanLoteRef);
        return;
      }
    } else {
      if (!loteVal) {
        play(beepErr);
        focusRef(loteRef);
        return;
      }
      if (!loteSemEan && !eanVal) {
        play(beepErr);
        focusRef(eanLoteRef);
        return;
      }
    }

    const key = isEanQtd
      ? `${loteVal}::${eanVal}::${qn}`
      : loteSemEan
        ? `${loteVal}::${qn}`
        : `${loteVal}::${eanVal}::${qn}`;

    const now = Date.now();
    if (lastLoteFinalizeRef.current.key === key && now - lastLoteFinalizeRef.current.at < 900) {
      setBufLote("");
      setBufEANLote("");
      setBufQTD("");
      focusRef(isEanQtd ? eanLoteRef : loteRef);
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
            ean: eanVal,
            quantidade: qn,
          })
        );
      } catch {
        ok = false;
      }
    }
    play(ok ? beepOk : beepErr);

    focusRef(isEanQtd ? eanLoteRef : loteRef);
  }

  const UNIT_MIN_LEN = 8;
  const LOTE_MIN_LEN = 3;
  const EAN_LOTE_MIN_LEN = 8;
  const QTD_MAX_LEN = 6;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {/* ===== EAN UNITÁRIO ===== */}
      <div style={{ display: "grid", gap: 6 }}>
        <SmallLabel color={colors.textSoft}>Leitura por EAN (unitária)</SmallLabel>

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
            ...inputBaseStyle,
            border: `1px dashed ${bufLote ? colors.borderSoft : colors.border}`,
            background: bufLote ? colors.bgSoft : colors.bg,
            color: bufLote ? colors.textSoft : colors.text,
          }}
        />

        <div style={{ fontSize: 12, opacity: 0.8, color: colors.textSoft }}>
          EAN isolado abate <strong>1</strong>. Com LOTE ativo, este campo fica
          desabilitado até finalizar o lote.
        </div>
      </div>

      {/* ===== FLUXO LOTE ===== */}
      <div style={{ display: "grid", gap: 6 }}>
        <SmallLabel color={colors.textSoft}>
          Leitura em lote{" "}
          {loteMode === LOTE_MODES.EAN_QTD
            ? "(EAN + QTD, sem lote)"
            : loteSemEan
              ? "(LOTE + QTD)"
              : "(LOTE + QTD)"}
        </SmallLabel>

        {/* ✅ SELECT */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, opacity: 0.85, color: colors.textSoft }}>
            Modo do lote:
          </div>

          <select
            value={loteMode}
            onChange={(e) => {
              const v = e.target.value;

              setLoteMode(v);
              setBufLote("");
              setBufEANLote("");
              setBufQTD("");

              if (v === LOTE_MODES.EAN_QTD) focusRef(eanLoteRef);
              else focusRef(loteRef);
            }}
            style={selectStyle}
          >
            <option value={LOTE_MODES.LOTE}>Lote: LOTE + QTD (ou LOTE + QTD)</option>
            <option value={LOTE_MODES.EAN_QTD}>Sem lote: EAN + QTD</option>
          </select>
        </div>

        {/* ===== Inputs do modo selecionado ===== */}
        {loteMode === LOTE_MODES.EAN_QTD ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px",
              gap: 8,
            }}
          >
            {/* EAN (sem lote) */}
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
              placeholder="Digite/cole ou bipe o EAN..."
              style={inputBaseStyle}
            />

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
                    handleLoteFinalize("", bufEANLote, digits);
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

                schedule(() => handleLoteFinalize("", bufEANLote, digits), qtdTimerRef, 0);
              }}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey || e.altKey) return;

                if (e.key === "Enter" || e.key === "Tab") {
                  e.preventDefault();
                  handleLoteFinalize("", bufEANLote, bufQTD);
                }
              }}
              style={{
                ...inputBaseStyle,
                fontWeight: 700,
                textAlign: "center",
              }}
            />
          </div>
        ) : (
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

                setBufEANLote("");
                setBufQTD("");

                const val = normalizeLote(raw);
                schedule(() => {
                  if (val && val.length >= LOTE_MIN_LEN) {
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
              style={inputBaseStyle}
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
                style={inputBaseStyle}
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
                ...inputBaseStyle,
                fontWeight: 700,
                textAlign: "center",
              }}
            />
          </div>
        )}

        <div style={{ fontSize: 12, opacity: 0.85, color: colors.textSoft }}>
          {loteMode === LOTE_MODES.EAN_QTD ? (
            <>
              Fluxo: <strong>EAN</strong> → <strong>QTD</strong>. Finaliza sozinho ao parar de bipar/digitar.
            </>
          ) : loteSemEan ? (
            <>
              Fluxo: <strong>LOTE</strong> → <strong>QTD</strong>. Finaliza sozinho ao parar de bipar/digitar.
            </>
          ) : (
            <>
              Fluxo: 1) <strong>LOTE</strong> → 2) <strong>EAN do lote</strong> → 3{" "}
              <strong>QTD</strong>. Finaliza sozinho ao parar de bipar/digitar.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SmallLabel({ children, color }) {
  return <div style={{ fontSize: 12, opacity: 0.9, color: color || "#64748b" }}>{children}</div>;
}