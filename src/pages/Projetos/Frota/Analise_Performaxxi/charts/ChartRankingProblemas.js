import React, { useEffect, useMemo, useState } from "react";

const COLORS = {
  gravissimo: "#ef4444",
  sla: "#fb7185",
  merc: "#34d399",
  dev: "#60a5fa",
};

function n(v) {
  return Number(v || 0);
}

function sum4(x) {
  return n(x?.almoco_gravissimo) + n(x?.erros_sla) + n(x?.erros_mercadorias) + n(x?.erros_devolucoes);
}

function getThemeMode() {
  try {
    const t = document.documentElement.getAttribute("data-theme");
    return t === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function buildUi(mode) {
  const isDark = mode === "dark";

  return {
    // container da tabela
    tableBg: isDark ? "rgba(2,6,23,0.35)" : "rgba(255,255,255,0.92)",
    tableBorder: isDark ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.35)",

    // header da tabela
    headBg: isDark ? "rgba(15,23,42,0.55)" : "rgba(241,245,249,0.9)",
    headText: isDark ? "rgba(226,232,240,0.95)" : "rgba(15,23,42,0.95)",

    // linhas
    rowHover: isDark ? "rgba(148,163,184,0.06)" : "rgba(2,6,23,0.04)",
    text: isDark ? "rgba(226,232,240,0.95)" : "rgba(15,23,42,0.95)",
    muted: isDark ? "rgba(148,163,184,0.92)" : "rgba(100,116,139,0.95)",

    // chips
    chipBg: isDark ? "rgba(2,6,23,0.55)" : "rgba(241,245,249,0.75)",
    chipBorder: isDark ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.35)",
  };
}

function Chip({ ui, color, label, value, title }) {
  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 999,
        border: `1px solid ${ui.chipBorder}`,
        background: ui.chipBg,
        fontSize: 11,
        fontWeight: 900,
        whiteSpace: "nowrap",
        color: ui.text,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: "inline-block" }} />
      <span style={{ opacity: 0.95 }}>{label}</span>
      <span style={{ opacity: 0.9 }}>{value}</span>
    </span>
  );
}

export default function ChartRankingProblemas({
  rankings,
  displayCidade,
  metaSlaPct,
  maxItems = 12,
}) {
  const [mode, setMode] = useState(() => getThemeMode());
  const ui = useMemo(() => buildUi(mode), [mode]);

  // observa troca de tema em tempo real (dark/light)
  useEffect(() => {
    const root = document.documentElement;
    const obs = new MutationObserver(() => setMode(getThemeMode()));
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const rotas = useMemo(() => {
    const arr = Array.isArray(rankings?.rotas_problemas) ? rankings.rotas_problemas : [];
    const list = arr.slice();

    list.sort((a, b) => sum4(b) - sum4(a));

    const lim = Math.max(1, Number(maxItems || 12));
    return list.slice(0, lim);
  }, [rankings, maxItems]);

  return (
    <div style={{ marginTop: 8, color: ui.text }}>
      {/* header compacto */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: 950, fontSize: 13, color: ui.text }}>
          Indicador — Rotas com problemas (Top {maxItems})
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.85, color: ui.muted }}>Legenda:</span>
          <Chip ui={ui} color={COLORS.gravissimo} label="G" value="" title="Gravíssimo (finalizada sem almoço)" />
          <Chip ui={ui} color={COLORS.sla} label="S" value="" title={`SLA (< ${metaSlaPct}%)`} />
          <Chip ui={ui} color={COLORS.merc} label="M" value="" title="Mercadorias (< 100%)" />
          <Chip ui={ui} color={COLORS.dev} label="D" value="" title="Devolução (> 0)" />
        </div>
      </div>

      {/* tabela */}
      <div
        style={{
          border: `1px solid ${ui.tableBorder}`,
          borderRadius: 14,
          overflow: "hidden",
          background: ui.tableBg,
        }}
      >
        {/* header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 90px 1.2fr 70px",
            gap: 10,
            padding: "10px 12px",
            fontSize: 12,
            fontWeight: 950,
            borderBottom: `1px solid ${ui.tableBorder}`,
            background: ui.headBg,
            color: ui.headText,
          }}
        >
          <div>CD • Rota</div>
          <div style={{ textAlign: "right" }}>Viagens</div>
          <div style={{ textAlign: "right" }}>Erros (G/S/M/D)</div>
          <div style={{ textAlign: "right" }}>Total</div>
        </div>

        {/* rows */}
        {rotas.map((x, idx) => {
          const cd = displayCidade?.(x.usuario_key, x.usuario_label) || "-";
          const g = n(x.almoco_gravissimo);
          const s = n(x.erros_sla);
          const m = n(x.erros_mercadorias);
          const d = n(x.erros_devolucoes);
          const total = g + s + m + d;

          return (
            <div
              key={`${x.usuario_key}|${x.rota}|${idx}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 90px 1.2fr 70px",
                gap: 10,
                padding: "10px 12px",
                borderBottom: idx === rotas.length - 1 ? "none" : `1px solid ${ui.tableBorder}`,
                alignItems: "center",
                color: ui.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = ui.rowHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ fontWeight: 950, fontSize: 12 }}>
                {cd} • <span style={{ opacity: 0.85, color: ui.muted }}>Rota</span> {x.rota}
              </div>

              <div style={{ textAlign: "right", fontWeight: 950, fontSize: 12 }}>
                {n(x.rotas_total)}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, flexWrap: "wrap" }}>
                <Chip ui={ui} color={COLORS.gravissimo} label="G" value={g} title="Gravíssimo" />
                <Chip ui={ui} color={COLORS.sla} label="S" value={s} title={`SLA < ${metaSlaPct}%`} />
                <Chip ui={ui} color={COLORS.merc} label="M" value={m} title="Mercadorias < 100%" />
                <Chip ui={ui} color={COLORS.dev} label="D" value={d} title="Devolução > 0" />
              </div>

              <div style={{ textAlign: "right", fontWeight: 950, fontSize: 12 }}>
                {total}
              </div>
            </div>
          );
        })}

        {rotas.length === 0 && (
          <div style={{ padding: 12, fontSize: 12, opacity: 0.8, color: ui.muted }}>
            Sem dados para esse filtro.
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: ui.muted }}>
        * Isso é só indicador (consulta rápida). Detalhe continua nos cliques dos gráficos/modais.
      </div>
    </div>
  );
}
