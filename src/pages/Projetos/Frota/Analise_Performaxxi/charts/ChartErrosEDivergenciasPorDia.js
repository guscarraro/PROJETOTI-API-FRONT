// src/pages/.../Analise_Performaxxi/charts/ChartErrosEDivergenciasPorDia.js
import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function formatXAxisDate(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

const COLOR_SLA = "#fb7185";
const COLOR_DEV = "#60a5fa";
const COLOR_MERC = "#34d399";

function rgba(hex, a) {
  const h = String(hex || "").replace("#", "").trim();
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

export default function ChartErrosEDivergenciasPorDia({
  data,
  onClickErroSla,
  onClickDevolucao,
  onClickMercadorias,
}) {
  const safeData = Array.isArray(data) ? data : [];
  const [theme, setTheme] = useState(() => readCssVars());

  useEffect(() => {
    setTheme(readCssVars());

    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const obs = new MutationObserver(() => {
      setTheme(readCssVars());
    });

    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // totais do período (sem reduce)
  const totals = useMemo(() => {
    let tSla = 0;
    let tDev = 0;
    let tMerc = 0;

    for (let i = 0; i < safeData.length; i++) {
      const d = safeData[i] || {};
      tSla += Number(d.erros_sla || 0);
      tDev += Number(d.erros_devolucoes || 0);
      tMerc += Number(d.erros_mercadorias || 0);
    }

    return {
      sla: Number.isFinite(tSla) ? tSla : 0,
      dev: Number.isFinite(tDev) ? tDev : 0,
      merc: Number.isFinite(tMerc) ? tMerc : 0,
    };
  }, [safeData]);

  const tooltipStyle = {
    background: theme.bgPanel2,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    color: theme.text,
    fontSize: 12,
  };

  const badgeBase = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    cursor: "default",
    color: theme.text,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ width: "100%", height: 340, marginTop: 10, paddingBottom: 15 }}>
      {/* Totais no topo (mesmo formato) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 10,
          alignItems: "center",
        }}
      >
        {/* Erro SLA */}
        <span
          title="Total de dias/ocorrências com SLA < 100% no período"
          style={{
            ...badgeBase,
            border: `1px solid ${rgba(COLOR_SLA, 0.35)}`,
            background: `linear-gradient(180deg, ${rgba(
              COLOR_SLA,
              0.18
            )}, ${rgba(COLOR_SLA, 0.06)})`,
          }}
        >
          <span>Erro SLA</span>
          <span
            style={{
              minWidth: 28,
              textAlign: "center",
              padding: "2px 8px",
              borderRadius: 999,
              background: rgba(COLOR_SLA, 0.22),
              border: `1px solid ${rgba(COLOR_SLA, 0.35)}`,
              fontWeight: 1000,
              fontSize: 12,
            }}
          >
            {totals.sla}
          </span>
        </span>

        {/* Devoluções */}
        <span
          title="Total de devoluções no período"
          style={{
            ...badgeBase,
            border: `1px solid ${rgba(COLOR_DEV, 0.35)}`,
            background: `linear-gradient(180deg, ${rgba(
              COLOR_DEV,
              0.18
            )}, ${rgba(COLOR_DEV, 0.06)})`,
          }}
        >
          <span>Devoluções</span>
          <span
            style={{
              minWidth: 28,
              textAlign: "center",
              padding: "2px 8px",
              borderRadius: 999,
              background: rgba(COLOR_DEV, 0.22),
              border: `1px solid ${rgba(COLOR_DEV, 0.35)}`,
              fontWeight: 1000,
              fontSize: 12,
            }}
          >
            {totals.dev}
          </span>
        </span>

        {/* Mercadorias */}
        <span
          title="Total de mercadorias < 100% no período"
          style={{
            ...badgeBase,
            border: `1px solid ${rgba(COLOR_MERC, 0.35)}`,
            background: `linear-gradient(180deg, ${rgba(
              COLOR_MERC,
              0.18
            )}, ${rgba(COLOR_MERC, 0.06)})`,
          }}
        >
          <span>Mercadorias</span>
          <span
            style={{
              minWidth: 28,
              textAlign: "center",
              padding: "2px 8px",
              borderRadius: 999,
              background: rgba(COLOR_MERC, 0.22),
              border: `1px solid ${rgba(COLOR_MERC, 0.35)}`,
              fontWeight: 1000,
              fontSize: 12,
            }}
          >
            {totals.merc}
          </span>
        </span>
      </div>

      <ResponsiveContainer>
        <BarChart
          data={safeData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          barSize={18}
          barGap={6}
          barCategoryGap={18}
        >
          <XAxis
            dataKey="data"
            tickFormatter={formatXAxisDate}
            tick={{ fontSize: 11, fill: theme.muted }}
            axisLine={{ stroke: theme.border }}
            tickLine={{ stroke: theme.border }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: theme.muted }}
            axisLine={{ stroke: theme.border }}
            tickLine={{ stroke: theme.border }}
          />

          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: theme.text }}
            itemStyle={{ color: theme.text }}
            labelFormatter={(label) => `Dia: ${formatXAxisDate(label)}`}
          />
          <Legend wrapperStyle={{ color: theme.muted, fontSize: 12 }} />

          {/* 1) Erro SLA */}
          <Bar
            dataKey="erros_sla"
            name="Erro SLA < 100%"
            fill={COLOR_SLA}
            radius={[8, 8, 0, 0]}
            style={{ cursor: onClickErroSla ? "pointer" : "default" }}
            onClick={(bar) => {
              const dayISO = bar?.payload?.data;
              if (dayISO && onClickErroSla) onClickErroSla(dayISO);
            }}
          />

          {/* 2) Devoluções */}
          <Bar
            dataKey="erros_devolucoes"
            name="Devoluções"
            fill={COLOR_DEV}
            radius={[8, 8, 0, 0]}
            style={{ cursor: onClickDevolucao ? "pointer" : "default" }}
            onClick={(bar) => {
              const dayISO = bar?.payload?.data;
              if (dayISO && onClickDevolucao) onClickDevolucao(dayISO);
            }}
          />

          {/* 3) Mercadorias < 100% */}
          <Bar
            dataKey="erros_mercadorias"
            name="Mercadorias < 100%"
            fill={COLOR_MERC}
            radius={[8, 8, 0, 0]}
            style={{ cursor: onClickMercadorias ? "pointer" : "default" }}
            onClick={(bar) => {
              const dayISO = bar?.payload?.data;
              if (dayISO && onClickMercadorias) onClickMercadorias(dayISO);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
