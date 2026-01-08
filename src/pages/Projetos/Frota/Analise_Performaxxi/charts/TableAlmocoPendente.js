import React, { useEffect, useMemo, useRef, useState } from "react";

function rgba(hex, a) {
  const h = String(hex || "")
    .replace("#", "")
    .trim();
  if (h.length !== 6) return `rgba(148,163,184,${a})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function readCssVars() {
  if (typeof window === "undefined") {
    return {
      text: "#111827",
      muted: "#6b7280",
      border: "#e5e7eb",
      bgPanel: "#ffffff",
      bgPanel2: "#fafafa",
    };
  }
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const pick = (name, fallback) => {
    const v = cs.getPropertyValue(name);
    const s = String(v || "").trim();
    return s || fallback;
  };
  return {
    bgPanel: pick("--bg-panel", "#ffffff"),
    bgPanel2: pick("--bg-panel-2", "#fafafa"),
    text: pick("--text", "#111827"),
    muted: pick("--muted", "#6b7280"),
    border: pick("--border", "#e5e7eb"),
  };
}

function formatShortDate(isoOrAny) {
  const s = String(isoOrAny || "").trim();
  if (!s) return "-";
  const parts = s.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y && m && d) return `${d}/${m}`;
  }
  return s;
}

function shortDriverName(full) {
  const s = String(full || "").trim();
  if (!s || s === "-") return "-";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function normalizeRotaNumber(rota) {
  const s = String(rota || "").trim();
  if (!s || s === "-") return "-";
  const m = s.match(/\d{3,}/);
  return m ? m[0] : s;
}

function pickBestPtBrVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window))
    return null;

  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  const preferNames = ["Google português do Brasil"];

  const pt = [];
  for (let i = 0; i < voices.length; i++) {
    const v = voices[i];
    const lang = String(v.lang || "").toLowerCase();
    if (lang === "pt-br" || lang.startsWith("pt-br")) pt.push(v);
  }
  if (pt.length === 0) return null;

  for (let p = 0; p < preferNames.length; p++) {
    const target = preferNames[p].toLowerCase();
    for (let i = 0; i < pt.length; i++) {
      const name = String(pt[i].name || "").toLowerCase();
      if (name.includes(target)) return pt[i];
    }
  }

  return pt[0];
}

async function ensureAudioContextRunning() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {}
    }
    return ctx;
  } catch {
    return null;
  }
}

async function playBeepOnce() {
  try {
    const ctx = await ensureAudioContextRunning();
    if (!ctx) return false;

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.08;

    o.connect(g);
    g.connect(ctx.destination);

    o.start();

    await new Promise((r) => setTimeout(r, 220));

    try {
      o.stop();
    } catch {}
    try {
      await ctx.close();
    } catch {}

    return true;
  } catch {
    return false;
  }
}

function speakOrBeep(msg, opts, lastSpeakAtRef, audioEnabled) {
  const options = opts || {};
  const cooldownMs = Number(options.cooldownMs ?? 15000);
  const now = Date.now();

  if (lastSpeakAtRef && now - Number(lastSpeakAtRef.current || 0) < cooldownMs)
    return;
  if (lastSpeakAtRef) lastSpeakAtRef.current = now;

  // ✅ sem "audioEnabled", não tenta tocar (TV bloqueia e você acha que "quebrou")
  if (!audioEnabled) return;

  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;

      const speakNow = () => {
        const u = new SpeechSynthesisUtterance(msg);
        u.lang = "pt-BR";
        u.rate = Number(options.rate ?? 1.02);
        u.pitch = Number(options.pitch ?? 1.0);
        u.volume = Number(options.volume ?? 1.0);

        const v = pickBestPtBrVoice();
        if (v) u.voice = v;

        synth.cancel();
        synth.speak(u);
      };

      const voices = synth.getVoices();
      if (voices && voices.length) {
        speakNow();
      } else {
        const handler = () => {
          try {
            synth.removeEventListener("voiceschanged", handler);
          } catch {}
          speakNow();
        };
        try {
          synth.addEventListener("voiceschanged", handler);
        } catch {
          setTimeout(speakNow, 150);
        }
      }

      return;
    }
  } catch {}

  // fallback beep
  playBeepOnce();
}

export default function TableAlmocoPendente({
  items,
  height = 320,
  pulse = true,

  criticalWhenFaltandoLE = 0,
  listWhenFaltandoLE = 2,

  onRowClick,
  announceToken = 0,
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const [theme, setTheme] = useState(() => readCssVars());

  // ✅ NOVO: controle de permissão de áudio (clique)
  const [audioEnabled, setAudioEnabled] = useState(() => {
    try {
      return localStorage.getItem("tv_audio_enabled") === "1";
    } catch {
      return false;
    }
  });

  const pendingMsgRef = useRef(""); // guarda msg pra tocar quando ativar
  const prevCriticalRef = useRef(0);
  const lastSpeakAtRef = useRef(0);

  useEffect(() => {
    setTheme(readCssVars());
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const obs = new MutationObserver(() => setTheme(readCssVars()));
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  async function enableAudio() {
    // tenta “acordar” speech + audio
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.getVoices();
      }
    } catch {}

    // beep é o mais “real” pra validar liberação
    await playBeepOnce();

    try {
      localStorage.setItem("tv_audio_enabled", "1");
    } catch {}
    setAudioEnabled(true);

    // se tinha msg pendente, tenta tocar agora
    const msg = String(pendingMsgRef.current || "").trim();
    if (msg) {
      pendingMsgRef.current = "";
      speakOrBeep(msg, { cooldownMs: 0 }, lastSpeakAtRef, true);
    }
  }

  async function testAudio() {
    if (!audioEnabled) {
      await enableAudio();
      return;
    }
    await playBeepOnce();
  }

  const view = useMemo(() => {
    const out = [];
    let critical = 0;

    for (let i = 0; i < safeItems.length; i++) {
      const it = safeItems[i] || {};
      const p = it.progresso || {};
      const falt = Number(p.faltando ?? 999999);

      const isCritical =
        Number.isFinite(falt) && falt <= Number(criticalWhenFaltandoLE);
      if (isCritical) critical += 1;

      out.push({
        id: String(it.id || `${i}`),
        data: String(it.data || ""),
        motoristaFull: String(it.motorista || "-"),
        motoristaShort: shortDriverName(it.motorista),
        rotaRaw: String(it.rota || "-"),
        rotaNumber: normalizeRotaNumber(it.rota),
        progresso_txt: String(p.progresso_txt || "-"),
        faltando: Number.isFinite(falt) ? falt : null,
        isCritical,
      });
    }

    out.sort((a, b) => {
      if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;

      const fa = Number.isFinite(a.faltando) ? a.faltando : 999999;
      const fb = Number.isFinite(b.faltando) ? b.faltando : 999999;
      if (fa !== fb) return fa - fb;

      return String(a.motoristaShort).localeCompare(String(b.motoristaShort));
    });

    // (mantido, caso você queira usar depois)
    void listWhenFaltandoLE;

    return { rows: out, total: out.length, critical };
  }, [safeItems, criticalWhenFaltandoLE, listWhenFaltandoLE]);

  useEffect(() => {
    const cur = Number(view.critical || 0);

    if (cur <= 0) {
      pendingMsgRef.current = "";
    }
    const msg = `Atenção. Você possui ${cur} rota${
      cur === 1 ? "" : "s"
    } na última entrega sem lançar o almoço.`;

    // força anunciar no refresh
    if (announceToken > 0 && cur > 0) {
      if (!audioEnabled) {
        pendingMsgRef.current = msg;
      } else {
        speakOrBeep(msg, { cooldownMs: 0 }, lastSpeakAtRef, true);
      }
      prevCriticalRef.current = cur;
      return;
    }

    const prev = Number(prevCriticalRef.current || 0);
    if (cur > 0 && cur !== prev) {
      if (!audioEnabled) {
        pendingMsgRef.current = msg;
      } else {
        speakOrBeep(msg, { cooldownMs: 20000 }, lastSpeakAtRef, true);
      }
    }

    prevCriticalRef.current = cur;
  }, [view.critical, announceToken, audioEnabled]);

  const panelBg = `linear-gradient(180deg, ${rgba("#f97316", 0.18)}, ${rgba(
    "#f97316",
    0.06
  )})`;
  const panelBorder = `1px solid ${rgba("#f97316", 0.35)}`;

  return (
    <div
      style={{
        border: panelBorder,
        borderRadius: 14,
        padding: 10,
        background: panelBg,
        height,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>
        {`
          @keyframes almocoPulse {
            0% { box-shadow: 0 0 0 0 ${rgba("#f97316", 0.25)}; }
            70% { box-shadow: 0 0 0 12px ${rgba("#f97316", 0.0)}; }
            100% { box-shadow: 0 0 0 0 ${rgba("#f97316", 0.0)}; }
          }
        `}
      </style>

      {/* ✅ OVERLAY CENTRAL (blur fosco) - fica NO MEIO DA TABLE */}
      {!audioEnabled && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 999,
            display: "grid",
            placeItems: "center",
            background: "rgba(2,6,23,0.45)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              width: "min(520px, 92%)",
              borderRadius: 18,
              padding: 18,
              background: `linear-gradient(180deg, ${rgba(
                "#020617",
                0.88
              )}, ${rgba("#020617", 0.72)})`,
              border: `1px solid ${rgba("#22d3ee", 0.45)}`,
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 1000, color: "#e5e7eb" }}>
              🔊 Ativar alertas sonoros
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                opacity: 0.9,
                color: "#cbd5f5",
              }}
            >
              A TV bloqueia o áudio sem interação.
              <br />
              Clique abaixo para liberar o som.
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginTop: 14,
              }}
            >
              <button
                type="button"
                onClick={enableAudio}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${rgba("#22d3ee", 0.55)}`,
                  background: `linear-gradient(180deg, ${rgba(
                    "#22d3ee",
                    0.3
                  )}, ${rgba("#22d3ee", 0.12)})`,
                  color: "#e5e7eb",
                  fontWeight: 1000,
                  fontSize: 14,
                  padding: "12px 18px",
                  cursor: "pointer",
                }}
              >
                Ativar som
              </button>

              <button
                type="button"
                onClick={testAudio}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${rgba("#e5e7eb", 0.35)}`,
                  background: `linear-gradient(180deg, ${rgba(
                    "#e5e7eb",
                    0.14
                  )}, ${rgba("#e5e7eb", 0.06)})`,
                  color: "#e5e7eb",
                  fontWeight: 1000,
                  fontSize: 14,
                  padding: "12px 18px",
                  cursor: "pointer",
                }}
                title="Toca um beep para testar"
              >
                Testar
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          padding: "6px 8px",
          borderRadius: 12,
          border: `1px solid ${theme.border}`,
          background: theme.bgPanel2,
          animation: pulse
            ? "almocoPulse 1.6s ease-in-out infinite"
            : undefined,
        }}
      >
        <div style={{ fontWeight: 1000, fontSize: 12, color: theme.text }}>
          Finalizando sem almoço
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {view.critical > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 1000,
                background: rgba("#ef4444", 0.14),
                border: `1px solid ${rgba("#ef4444", 0.35)}`,
                color: theme.text,
                whiteSpace: "nowrap",
              }}
              title="Crítico (última entrega)"
            >
              <span style={{ color: "#ef4444" }}>⚠</span>
              <span>{view.critical}</span>
            </span>
          )}

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 1000,
              background: rgba("#f97316", 0.14),
              border: `1px solid ${rgba("#f97316", 0.35)}`,
              color: theme.text,
              whiteSpace: "nowrap",
            }}
            title="Total na lista"
          >
            <span style={{ color: "#f97316" }}>●</span>
            <span>{view.total}</span>
          </span>

          <button
            type="button"
            onClick={testAudio}
            style={{
              borderRadius: 999,
              border: `1px solid ${rgba(theme.border, 0.95)}`,
              background: theme.bgPanel2,
              padding: "6px 10px",
              fontWeight: 1000,
              cursor: "pointer",
              color: theme.text,
              fontSize: 11,
              opacity: 0.9,
            }}
            title="Testar som (beep)"
          >
            🔈 Testar
          </button>
        </div>
      </div>

      <div
        style={{
          height: "calc(100% - 54px)",
          overflow: "auto",
          marginTop: 8,
          paddingRight: 4,
        }}
      >
        {view.total === 0 ? (
          <div
            style={{
              fontSize: 12,
              opacity: 0.85,
              color: theme.text,
              padding: 8,
            }}
          >
            Nenhuma rota no limite.
          </div>
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr
                style={{ textAlign: "left", opacity: 0.9, color: theme.muted }}
              >
                <th style={{ padding: "8px 6px", width: 54 }}>Dia</th>
                <th style={{ padding: "8px 6px" }}>Motorista</th>
                <th style={{ padding: "8px 6px", width: 64 }}>Rota</th>
                <th
                  style={{ padding: "8px 6px", textAlign: "right", width: 74 }}
                >
                  Prog.
                </th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onRowClick?.(r)}
                  title={`${formatShortDate(r.data)} • ${
                    r.motoristaFull
                  } • Rota: ${r.rotaRaw}`}
                  style={{
                    borderTop: `1px solid ${rgba(theme.border, 0.9)}`,
                    cursor: onRowClick ? "pointer" : "default",
                    background: r.isCritical
                      ? rgba("#ef4444", 0.1)
                      : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "8px 6px",
                      color: theme.text,
                      fontWeight: 900,
                    }}
                  >
                    {formatShortDate(r.data)}
                  </td>

                  <td
                    style={{
                      padding: "8px 6px",
                      color: theme.text,
                      fontWeight: r.isCritical ? 1000 : 800,
                    }}
                  >
                    {r.isCritical ? (
                      <span style={{ color: "#ef4444", marginRight: 6 }}>
                        ⚠
                      </span>
                    ) : null}
                    {r.motoristaShort}
                  </td>

                  <td
                    style={{
                      padding: "8px 6px",
                      color: theme.text,
                      fontWeight: 900,
                    }}
                  >
                    {r.rotaNumber}
                  </td>

                  <td
                    style={{
                      padding: "8px 6px",
                      textAlign: "right",
                      fontWeight: 1000,
                      color: theme.text,
                    }}
                  >
                    {r.progresso_txt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
