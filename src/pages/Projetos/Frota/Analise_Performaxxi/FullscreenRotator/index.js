import React, { useEffect, useMemo, useRef, useState } from "react";
import apiLocal from "../../../../../services/apiLocal";

import ChartRotasVsAlmoco from "../charts/ChartRotasVsAlmoco";
import ChartErrosEDivergenciasPorDia from "../charts/ChartErrosEDivergenciasPorDia";
import ChartRankingProblemas from "../charts/ChartRankingProblemas";
import ChartMotoristasViagensErros from "../charts/ChartMotoristasViagensErros";

const CD_BORDER_COLORS = [
  "#22d3ee",
  "#a78bfa",
  "#34d399",
  "#fb7185",
  "#f97316",
  "#60a5fa",
  "#facc15",
  "#ef4444",
];

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

function getThemeMode() {
  try {
    const t = document.documentElement.getAttribute("data-theme");
    return t === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function readCssVars() {
  const mode = typeof window !== "undefined" ? getThemeMode() : "light";

  const FALLBACK =
    mode === "dark"
      ? {
          bg: "#0b1220",
          bgPanel: "#0f172a",
          bgPanel2: "#0b1220",
          text: "#e5e7eb",
          muted: "#9ca3af",
          border: "rgba(148,163,184,0.25)",
        }
      : {
          bg: "#f8fafc",
          bgPanel: "#ffffff",
          bgPanel2: "#f1f5f9",
          text: "#0f172a",
          muted: "#64748b",
          border: "rgba(148,163,184,0.35)",
        };

  if (typeof window === "undefined") return FALLBACK;

  const root = document.documentElement;
  const cs = getComputedStyle(root);

  const pick = (name, fallback) => {
    const v = cs.getPropertyValue(name);
    const s = String(v || "").trim();
    return s || fallback;
  };

  return {
    mode,
    bg: pick("--bg", FALLBACK.bg),
    bgPanel: pick("--bg-panel", FALLBACK.bgPanel),
    bgPanel2: pick("--bg-panel-2", FALLBACK.bgPanel2),
    text: pick("--text", FALLBACK.text),
    muted: pick("--muted", FALLBACK.muted),
    border: pick("--border", FALLBACK.border),
    ok: pick("--ok", "rgb(34,197,94)"),
    warn: pick("--warn", "rgb(249,115,22)"),
    danger: pick("--danger", "rgb(239,68,68)"),
  };
}

function buildPiePath(cx, cy, r, ratioRemaining) {
  const ratio = Math.max(0, Math.min(1, ratioRemaining));
  if (ratio <= 0) return "";
  if (ratio >= 1) {
    return [
      `M ${cx} ${cy}`,
      `m 0 ${-r}`,
      `a ${r} ${r} 0 1 1 0 ${2 * r}`,
      `a ${r} ${r} 0 1 1 0 ${-2 * r}`,
      "Z",
    ].join(" ");
  }

  const startAng = -Math.PI / 2;
  const sweep = 2 * Math.PI * ratio;
  const endAng = startAng + sweep;

  const x1 = cx + r * Math.cos(startAng);
  const y1 = cy + r * Math.sin(startAng);

  const x2 = cx + r * Math.cos(endAng);
  const y2 = cy + r * Math.sin(endAng);

  const largeArc = sweep > Math.PI ? 1 : 0;

  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function getCacheKeyFromFilters(uk, baseFilters) {
  const f = baseFilters || {};
  return [
    String(uk || ""),
    String(f.data_ini || ""),
    String(f.data_fim || ""),
    String(f.meta_sla_pct || ""),
    String(f.motorista || ""),
    String(f.rota || ""),
    String(f.status_rota || ""),
  ].join("|");
}

export default function FullscreenRotator({
  open,
  onClose,
  users,
  intervalMs = 10000,
  baseFilters,
  displayCidade,
  onOpenErro,
  onOpenPendentes,
  onOpenGravissimo,
}) {
  const overlayRef = useRef(null);

  const [theme, setTheme] = useState(() => readCssVars());

  const [userIdx, setUserIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);

  const [loading, setLoading] = useState(false);

  const [dataByUser, setDataByUser] = useState(null);
  const [alertaFinalizando, setAlertaFinalizando] = useState({
    total: 0,
    items: [],
  });
  const [alertaSpeakToken, setAlertaSpeakToken] = useState(0);

  const cacheRef = useRef(new Map());

  const currentUkRef = useRef("");
  const reqIdRef = useRef(0);

  const [remainingMs, setRemainingMs] = useState(() =>
    Number(intervalMs || 60000)
  );
  const tickRef = useRef(null);
  const pollRef = useRef(null);
  const lastSwapAtRef = useRef(0);

  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900
  );

  const safeUsers = Array.isArray(users) ? users : [];
  const totalUsers = safeUsers.length;

  const current = useMemo(() => {
    if (totalUsers === 0) return null;
    const idx = Math.max(0, Math.min(userIdx, totalUsers - 1));
    return safeUsers[idx];
  }, [safeUsers, totalUsers, userIdx]);

  const currentUk = current?.usuario_key || "";

  useEffect(() => {
    currentUkRef.current = currentUk || "";
  }, [currentUk]);

  // ✅ NOVO: ao trocar de CD (usuario), mata qualquer fala pendurada
  useEffect(() => {
    if (!open) return;
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
  }, [open, currentUk]);

  // ✅ NOVO: ao sair do slide 1/4, mata fala (evita "continuar falando" no slide 2/4)
  useEffect(() => {
    if (!open) return;
    if (slideIdx !== 0) {
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}
    }
  }, [open, slideIdx]);

  const cdLabel = useMemo(() => {
    const uk = currentUk;
    const lbl = current?.usuario_label;
    const fallback = displayCidade?.(uk, "") || "-";
    return lbl || fallback;
  }, [current, currentUk, displayCidade]);

  const borderColor = useMemo(() => {
    if (totalUsers === 0) return CD_BORDER_COLORS[0];
    return CD_BORDER_COLORS[userIdx % CD_BORDER_COLORS.length];
  }, [userIdx, totalUsers]);

  function stopAllTimers() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function resetSlideTimer() {
    const dur = Number(intervalMs || 60000);
    lastSwapAtRef.current = Date.now();
    setRemainingMs(dur);
  }

  async function fetchIndicadores(uk) {
    if (!uk) return null;

    const params = {
      ...(baseFilters || {}),
      usuario_key: uk,
      max_rows: 120000,
      page_size: 5000,
    };

    const resp = await apiLocal.getAnaliseRotasIndicadores(params);
    return resp?.data || null;
  }

  async function fetchAlertaFinalizando(uk) {
    if (!uk) return { total: 0, items: [] };

    const params = {
      ...(baseFilters || {}),
      usuario_key: uk,
      max_rows: 120000,
      page_size: 5000,
      status_rota: "em_andamento",
      threshold_faltando: 2,
    };

    const resp = await apiLocal.getAnaliseRotasAlertaAlmocoFinalizando(params);
    const d = resp?.data || {};

    return {
      total: Number(d.total || 0),
      items: Array.isArray(d.items) ? d.items : [],
    };
  }

  function applyPayloadIfStillCurrent(uk, payload, opts) {
    if (String(uk) !== String(currentUkRef.current)) return;

    setDataByUser(payload?.data || null);
    setAlertaFinalizando(payload?.alerta || { total: 0, items: [] });

    if (opts?.announce && slideIdx === 0) {
      setAlertaSpeakToken((t) => t + 1);
    }
  }

  async function loadUserData(uk, opts) {
    const silent = !!opts?.silent;
    const allowCache = opts?.allowCache !== false;
    const announce = !!opts?.announce;

    if (!uk) return;

    const cacheKey = getCacheKeyFromFilters(uk, baseFilters);

    if (allowCache) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached?.data && cached?.alerta) {
        applyPayloadIfStillCurrent(uk, cached, { announce: false });
        if (silent) return;
      }
    }

    const myReqId = ++reqIdRef.current;

    if (!silent) setLoading(true);

    try {
      const [data, alerta] = await Promise.all([
        fetchIndicadores(uk),
        fetchAlertaFinalizando(uk),
      ]);

      if (reqIdRef.current !== myReqId) return;

      const payload = { data, alerta, ts: Date.now() };
      cacheRef.current.set(cacheKey, payload);

      applyPayloadIfStillCurrent(uk, payload, { announce });
    } catch {
      // mantém
    } finally {
      if (reqIdRef.current === myReqId && !silent) setLoading(false);
    }
  }

  async function warmCacheForUser(uk) {
    if (!uk) return;

    const cacheKey = getCacheKeyFromFilters(uk, baseFilters);
    const cached = cacheRef.current.get(cacheKey);
    if (cached?.data && cached?.alerta) return;

    const myReqId = ++reqIdRef.current;
    try {
      const [data, alerta] = await Promise.all([
        fetchIndicadores(uk),
        fetchAlertaFinalizando(uk),
      ]);
      if (reqIdRef.current !== myReqId) return;
      cacheRef.current.set(cacheKey, { data, alerta, ts: Date.now() });
    } catch {
      // ignora
    }
  }

  function nextStep() {
    setSlideIdx((prevSlide) => {
      const nextSlide = prevSlide + 1;

      if (nextSlide <= 3) {
        resetSlideTimer();
        return nextSlide;
      }

      if (totalUsers > 1) {
        const nextIdx = userIdx + 1 >= totalUsers ? 0 : userIdx + 1;
        const nextUk = safeUsers[nextIdx]?.usuario_key;

        warmCacheForUser(nextUk);
        setUserIdx(nextIdx);
      }

      resetSlideTimer();
      return 0;
    });
  }

  async function requestFullscreenOnRoot() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // ok
    }
  }

  async function exitFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ok
    }
  }

  useEffect(() => {
    setTheme(readCssVars());
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const obs = new MutationObserver(() => setTheme(readCssVars()));
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => setVh(window.innerHeight || 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("tv-mode");

    setUserIdx(0);
    setSlideIdx(0);

    cacheRef.current = new Map();
    reqIdRef.current = 0;

    setDataByUser(null);
    setAlertaFinalizando({ total: 0, items: [] });
    setLoading(false);

    resetSlideTimer();

    const t = setTimeout(() => requestFullscreenOnRoot(), 0);

    const onKey = (e) => {
      if (e.key === "Escape") {
        stopAllTimers();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      stopAllTimers();
      exitFullscreen();
      document.body.style.overflow = "";
      document.documentElement.classList.remove("tv-mode");

      // ✅ NOVO: ao fechar, cancela fala pendente
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}

      setDataByUser(null);
      setAlertaFinalizando({ total: 0, items: [] });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = overlayRef.current;
    if (!el) return;

    let last = 0;
    const handler = () => {
      const now = Date.now();
      if (now - last < 250) return;
      last = now;
      resetSlideTimer();
    };

    el.addEventListener("mousemove", handler);
    el.addEventListener("pointermove", handler);
    el.addEventListener("touchstart", handler, { passive: true });

    return () => {
      el.removeEventListener("mousemove", handler);
      el.removeEventListener("pointermove", handler);
      el.removeEventListener("touchstart", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, intervalMs]);

  useEffect(() => {
    if (!open) return;
    if (!currentUk) return;

    setDataByUser(null);
    setAlertaFinalizando({ total: 0, items: [] });

    const cacheKey = getCacheKeyFromFilters(currentUk, baseFilters);
    const cached = cacheRef.current.get(cacheKey);

    if (cached?.data && cached?.alerta) {
      setDataByUser(cached.data);
      setAlertaFinalizando(cached.alerta);
      setLoading(false);

      loadUserData(currentUk, {
        silent: true,
        allowCache: false,
        announce: false,
      });
    } else {
      loadUserData(currentUk, {
        silent: false,
        allowCache: false,
        announce: true,
      });
    }

    if (totalUsers > 1) {
      const nextIdx = userIdx + 1 >= totalUsers ? 0 : userIdx + 1;
      const nextUk = safeUsers[nextIdx]?.usuario_key;
      warmCacheForUser(nextUk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentUk]);

  useEffect(() => {
    if (!open) return;
    if (!currentUk) return;

    cacheRef.current = new Map();
    reqIdRef.current = 0;

    setDataByUser(null);
    setAlertaFinalizando({ total: 0, items: [] });

    loadUserData(currentUk, {
      silent: false,
      allowCache: false,
      announce: true,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    baseFilters?.data_ini,
    baseFilters?.data_fim,
    baseFilters?.meta_sla_pct,
    baseFilters?.motorista,
    baseFilters?.rota,
    baseFilters?.status_rota,
  ]);

  useEffect(() => {
    if (!open) return;

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    pollRef.current = setInterval(() => {
      const uk = currentUkRef.current;
      if (!uk) return;
      loadUserData(uk, { silent: true, allowCache: true, announce: false });
    }, 20000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    resetSlideTimer();

    const dur = Number(intervalMs || 60000);

    tickRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (lastSwapAtRef.current || now);
      const left = Math.max(0, dur - elapsed);

      setRemainingMs(left);

      if (left <= 0) nextStep();
    }, 120);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, intervalMs, userIdx]);

  const slideTitle = useMemo(() => {
    if (slideIdx === 0) return "Rotas x Pendência de Almoço";
    if (slideIdx === 1) return "Erros e divergências por dia";
    if (slideIdx === 2) return "Ranking — rotas com mais problemas";
    return "Motoristas — viagens x erros";
  }, [slideIdx]);

  const chartByDay = useMemo(() => {
    const byDay = Array.isArray(dataByUser?.by_day) ? dataByUser.by_day : [];
    const out = [];

    for (let i = 0; i < byDay.length; i++) {
      const d = byDay[i] || {};
      out.push({
        data: d.data,
        rotas_total: Number(d.rotas_total || 0),
        almoco_pendente: Number(d.almoco_pendente || 0),
        almoco_gravissimo: Number(d.almoco_gravissimo || 0),

        erros_sla: Number(d.erros_sla || 0),
        erros_devolucoes: Number(d.erros_devolucoes || 0),
        erros_mercadorias: Number(d.erros_mercadorias || 0),
      });
    }

    return out;
  }, [dataByUser]);

  const kpis = useMemo(() => {
    const arr = Array.isArray(dataByUser?.by_day) ? dataByUser.by_day : [];
    let totalRotas = 0;
    let totalPend = 0;
    let totalGrav = 0;

    for (let i = 0; i < arr.length; i++) {
      const d = arr[i] || {};
      totalRotas += Number(d.rotas_total || 0);
      totalPend += Number(d.almoco_pendente || 0);
      totalGrav += Number(d.almoco_gravissimo || 0);
    }

    const ineff = totalRotas > 0 ? (totalPend / totalRotas) * 100 : 0;
    const eff = Math.max(0, 100 - ineff);

    return {
      totalRotas: Number.isFinite(totalRotas) ? totalRotas : 0,
      totalPend: Number.isFinite(totalPend) ? totalPend : 0,
      totalGrav: Number.isFinite(totalGrav) ? totalGrav : 0,
      eff: Number.isFinite(eff) ? eff : 0,
    };
  }, [dataByUser]);

  const dur = Number(intervalMs || 60000);
  const ratioRemaining = dur > 0 ? remainingMs / dur : 0;

  const effOk = kpis.eff >= 99;

  const pie = useMemo(() => {
    const size = 36;
    const pad = 3;
    const r = size / 2 - pad;
    const cx = size / 2;
    const cy = size / 2;

    const path = buildPiePath(cx, cy, r, ratioRemaining);
    return { size, r, cx, cy, path };
  }, [ratioRemaining]);

  const chart1Height = useMemo(() => {
    const h = Math.floor(vh * 0.56);
    return Math.max(340, Math.min(640, h));
  }, [vh]);

  const canRenderContent = !!dataByUser;

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        padding: 18,
        boxSizing: "border-box",
        background: theme.bg,
        color: theme.text,
      }}
    >
      <style>{`
        html.tv-mode #app-navbar { display: none !important; }
        html.tv-mode body { overflow: hidden !important; }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 12,
          borderRadius: 22,
          border: `4px dashed ${rgba(borderColor, 0.9)}`,
          pointerEvents: "none",
          boxShadow: `0 0 0 1px ${rgba(theme.border, 0.65)}, 0 18px 60px ${rgba(
            borderColor,
            0.12
          )}`,
        }}
      />

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            title={`Troca em ${Math.ceil(
              remainingMs / 1000
            )}s (mover mouse reseta)`}
            style={{
              width: pie.size,
              height: pie.size,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              border: `1px solid ${rgba(theme.border, 0.9)}`,
              background: theme.bgPanel2,
            }}
          >
            <svg
              width={pie.size}
              height={pie.size}
              viewBox={`0 0 ${pie.size} ${pie.size}`}
            >
              <circle
                cx={pie.cx}
                cy={pie.cy}
                r={pie.r}
                fill={rgba(theme.border, 0.12)}
              />
              {pie.path ? (
                <path
                  d={pie.path}
                  fill={effOk ? rgba(theme.ok, 0.92) : rgba(theme.warn, 0.92)}
                />
              ) : null}
              <circle
                cx={pie.cx}
                cy={pie.cy}
                r={pie.r}
                fill="transparent"
                stroke={rgba(theme.border, 0.75)}
              />
            </svg>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${rgba(borderColor, 0.55)}`,
                  background: `linear-gradient(180deg, ${rgba(
                    borderColor,
                    0.16
                  )}, ${rgba(borderColor, 0.06)})`,
                  fontWeight: 1000,
                  color: theme.text,
                }}
              >
                <span style={{ fontSize: 12, opacity: 0.85 }}>CD</span>
                <span style={{ fontSize: 14 }}>{cdLabel}</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  ({currentUk || ""})
                </span>
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${rgba(theme.border, 0.95)}`,
                  background: theme.bgPanel2,
                  fontWeight: 1000,
                  color: theme.text,
                }}
              >
                <span style={{ fontSize: 12, opacity: 0.8 }}>Slide</span>
                <span style={{ fontSize: 14 }}>{slideIdx + 1}/4</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  • {slideTitle}
                </span>
              </span>

              <span
                title="Eficiência = 100% - (pendências/rotas)"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: effOk
                    ? `1px solid ${rgba(theme.ok, 0.45)}`
                    : `1px solid ${rgba(theme.warn, 0.45)}`,
                  background: effOk
                    ? `linear-gradient(180deg, ${rgba(theme.ok, 0.18)}, ${rgba(
                        theme.ok,
                        0.08
                      )})`
                    : `linear-gradient(180deg, ${rgba(
                        theme.warn,
                        0.18
                      )}, ${rgba(theme.warn, 0.08)})`,
                  fontWeight: 1000,
                  color: theme.text,
                }}
              >
                <span style={{ fontSize: 14 }}>{effOk ? "✓" : "!"}</span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>Eficiência</span>
                <span style={{ fontSize: 14 }}>{kpis.eff.toFixed(1)}%</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>meta 99–100</span>
              </span>
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                opacity: 0.78,
                color: theme.muted,
              }}
            >
              {totalUsers
                ? `CD ${userIdx + 1}/${totalUsers}`
                : "Sem CDs no filtro"}{" "}
              • troca automática a cada{" "}
              <b style={{ color: theme.text }}>{Math.round(dur / 1000)}s</b> •
              mouse reseta • sai no <b style={{ color: theme.text }}>ESC</b> ou{" "}
              <b style={{ color: theme.text }}>X</b>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {loading && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: `1px solid ${rgba(theme.border, 0.95)}`,
                background: theme.bgPanel2,
                fontWeight: 1000,
                fontSize: 12,
                opacity: 0.95,
                color: theme.text,
              }}
            >
              Atualizando...
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              stopAllTimers();
              onClose?.();
            }}
            title="Sair (ESC)"
            style={{
              borderRadius: 999,
              border: `1px solid ${rgba(theme.border, 0.95)}`,
              background: theme.bgPanel2,
              padding: "10px 14px",
              fontWeight: 1000,
              cursor: "pointer",
              color: theme.text,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}
      >
        <MiniPill
          theme={theme}
          label="Rotas (período)"
          value={kpis.totalRotas}
          color="#22d3ee"
        />
        <MiniPill
          theme={theme}
          label="Pendentes almoço"
          value={kpis.totalPend}
          color="#f97316"
        />
        <MiniPill
          theme={theme}
          label="Finalizado sem lançar"
          value={kpis.totalGrav}
          color="#ef4444"
        />
      </div>

      <div
        style={{
          marginTop: 12,
          height: "calc(100vh - 168px)",
          borderRadius: 20,
          border: `1px solid ${rgba(theme.border, 0.95)}`,
          background: theme.bgPanel,
          padding: 14,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 1000, fontSize: 14, color: theme.text }}>
              {slideTitle}
            </div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.82,
                marginTop: 4,
                color: theme.muted,
              }}
            >
              {slideIdx === 0 &&
                "Clique no ponto laranja do dia para abrir pendentes. O “!” abre Finalizado sem lançar."}
              {slideIdx === 1 && "Clique na barra para abrir o detalhe do dia."}
              {slideIdx === 2 && "Período completo. Top rotas por problema."}
              {slideIdx === 3 && "Período completo. Motoristas e performance."}
            </div>
          </div>
        </div>

        <div
          style={{ width: "100%", height: "calc(100% - 48px)", marginTop: 10 }}
        >
          {!canRenderContent ? (
            <div
              style={{
                height: "100%",
                display: "grid",
                placeItems: "center",
                borderRadius: 16,
                border: `1px dashed ${rgba(theme.border, 0.85)}`,
                background: theme.bgPanel2,
                color: theme.muted,
                fontWeight: 900,
                fontSize: 14,
              }}
            >
              Carregando dados do CD...
            </div>
          ) : (
            <>
              {slideIdx === 0 && (
                <div style={{ width: "100%", height: "100%" }}>
                  <ChartRotasVsAlmoco
                    key={`rotas-almoco-${currentUk}`} // ✅ remonta quando troca CD
                    data={chartByDay}
                    alertaFinalizando={alertaFinalizando}
                    alertaSpeakToken={alertaSpeakToken}
                    onClickPendencias={(dayISO) =>
                      onOpenPendentes?.(dayISO, false, currentUk)
                    }
                    onClickGravissimo={(dayISO) =>
                      onOpenGravissimo?.(dayISO, currentUk)
                    }
                    onOpenPendentesPeriod={() =>
                      onOpenPendentes?.(null, false, currentUk)
                    }
                    onOpenGravissimoPeriod={() =>
                      onOpenGravissimo?.(null, currentUk)
                    }
                    height={chart1Height}
                    usuarioKey={currentUk}
                  />
                </div>
              )}

              {slideIdx === 1 && (
                <ChartErrosEDivergenciasPorDia
                  data={chartByDay}
                  onClickErroSla={(dayISO) =>
                    onOpenErro?.(dayISO, "sla", currentUk)
                  }
                  onClickDevolucao={(dayISO) =>
                    onOpenErro?.(dayISO, "devolucao", currentUk)
                  }
                  onClickMercadorias={(dayISO) =>
                    onOpenErro?.(dayISO, "mercadorias", currentUk)
                  }
                />
              )}

              {slideIdx === 2 && (
                <ChartRankingProblemas
                  rankings={dataByUser?.rankings}
                  displayCidade={displayCidade}
                  metaSlaPct={baseFilters?.meta_sla_pct || 100}
                />
              )}

              {slideIdx === 3 && (
                <ChartMotoristasViagensErros
                  rankings={dataByUser?.rankings}
                  displayCidade={displayCidade}
                  metaSlaPct={baseFilters?.meta_sla_pct || 100}
                  dataIni={baseFilters?.data_ini}
                  dataFim={baseFilters?.data_fim}
                  usuarioKey={currentUk}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniPill({ theme, label, value, color }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        borderRadius: 999,
        border: `1px solid ${rgba(color, 0.35)}`,
        background: `linear-gradient(180deg, ${rgba(color, 0.14)}, ${rgba(
          color,
          0.06
        )})`,
        padding: "8px 12px",
        fontWeight: 900,
        color: theme.text,
      }}
    >
      <span style={{ fontSize: 12, opacity: 0.85 }}>{label}</span>
      <span
        style={{
          minWidth: 34,
          textAlign: "center",
          padding: "3px 10px",
          borderRadius: 999,
          background: rgba(color, 0.18),
          border: `1px solid ${rgba(color, 0.35)}`,
          fontWeight: 1000,
          fontSize: 12,
          color: theme.text,
        }}
      >
        {value}
      </span>
    </div>
  );
}
