// src/pages/.../Analise_Performaxxi/charts/ChartRotasVsAlmoco.js
import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
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

const COLOR_ROTAS = "#22d3ee";
const COLOR_PEND = "#f97316";
const COLOR_GRAV = "#ef4444";
const COLOR_OK = "#22c55e"; // verde

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

export default function ChartRotasVsAlmoco({
  data,
  onClickPendencias, // (dayISO) => abre pendentes do dia
  onClickGravissimo, // (dayISO) => abre gravíssimo do dia
  onOpenPendentesPeriod,
  onOpenGravissimoPeriod,
  pendentesCount,
  gravissimoCount,
  height = 320,
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

  // somatórios do período (sem reduce)
  const totals = useMemo(() => {
    let totalRotas = 0;
    let totalPend = 0;
    let totalGrav = 0;

    for (let i = 0; i < safeData.length; i++) {
      const d = safeData[i] || {};
      totalRotas += Number(d.rotas_total || 0);
      totalPend += Number(d.almoco_pendente || 0);
      totalGrav += Number(d.almoco_gravissimo || 0);
    }

    const inefPct = totalRotas > 0 ? (totalPend / totalRotas) * 100 : 0;
    const efPct = Math.max(0, 100 - inefPct);

    return {
      totalRotas: Number.isFinite(totalRotas) ? totalRotas : 0,
      totalPend: Number.isFinite(totalPend) ? totalPend : 0,
      totalGrav: Number.isFinite(totalGrav) ? totalGrav : 0,
      inefPct: Number.isFinite(inefPct) ? inefPct : 0,
      efPct: Number.isFinite(efPct) ? efPct : 0,
    };
  }, [safeData]);

  const pendCount =
    typeof pendentesCount === "number" ? pendentesCount : totals.totalPend;

  const gravCount =
    typeof gravissimoCount === "number" ? gravissimoCount : totals.totalGrav;

  const tooltipStyle = {
    background: theme.bgPanel2,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    color: theme.text,
    fontSize: 12,
  };

  // hitbox maior pra garantir clique sempre
  const HIT_R = 14;

  // meta 99-100%
  const isMetaOk = totals.efPct >= 99;

  const efficiencyBadgeBase = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    whiteSpace: "nowrap",
    border: `1px solid ${theme.border}`,
  };

  const efficiencyBadgeStyle = isMetaOk
    ? {
        ...efficiencyBadgeBase,
        background: `linear-gradient(180deg, ${rgba(
          COLOR_OK,
          0.18
        )}, ${rgba(COLOR_OK, 0.06)})`,
        border: `1px solid ${rgba(COLOR_OK, 0.35)}`,
        color: theme.text,
      }
    : {
        ...efficiencyBadgeBase,
        background: `linear-gradient(180deg, ${rgba(
          COLOR_PEND,
          0.16
        )}, ${rgba(COLOR_PEND, 0.05)})`,
        border: `1px solid ${rgba(COLOR_PEND, 0.35)}`,
        color: theme.text,
      };

  return (
    <div style={{ width: "100%", marginTop: 10 }}>
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
        {/* Pendentes (menor) */}
        <button
          type="button"
          onClick={() => onOpenPendentesPeriod?.()}
          title="Abrir tabela de pendências (período)"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            border: `1px solid ${rgba(COLOR_PEND, 0.35)}`,
            background: `linear-gradient(180deg, ${rgba(
              COLOR_PEND,
              0.16
            )}, ${rgba(COLOR_PEND, 0.05)})`,
            padding: "8px 12px",
            fontWeight: 900,
            cursor: "pointer",
            color: theme.text,
          }}
        >
          <span>Pendentes</span>

          <span
            style={{
              minWidth: 28,
              textAlign: "center",
              padding: "2px 8px",
              borderRadius: 999,
              background: rgba(COLOR_PEND, 0.22),
              border: `1px solid ${rgba(COLOR_PEND, 0.35)}`,
              fontWeight: 1000,
              fontSize: 12,
              color: theme.text,
            }}
          >
            {pendCount}
          </span>
        </button>

        {/* Finalizado sem lançar (menor) */}
        <button
          type="button"
          onClick={() => onOpenGravissimoPeriod?.()}
          title="Abrir tabela de Finalizado sem lançar (período)"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            border: `1px solid ${rgba(COLOR_GRAV, 0.35)}`,
            background: `linear-gradient(180deg, ${rgba(
              COLOR_GRAV,
              0.18
            )}, ${rgba(COLOR_GRAV, 0.05)})`,
            padding: "8px 12px",
            fontWeight: 900,
            cursor: "pointer",
            color: theme.text,
          }}
        >
          <span>Finalizado sem lançar</span>
          <span
            style={{
              minWidth: 28,
              textAlign: "center",
              padding: "2px 8px",
              borderRadius: 999,
              background: rgba(COLOR_GRAV, 0.22),
              border: `1px solid ${rgba(COLOR_GRAV, 0.35)}`,
              fontWeight: 1000,
              fontSize: 12,
              color: theme.text,
            }}
          >
            {gravCount}
          </span>
        </button>

        {/* Total de rotas no período */}
        <span
          title="Total de rotas lançadas no período selecionado"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 900,
            border: `1px solid ${rgba(COLOR_ROTAS, 0.35)}`,
            background: `linear-gradient(180deg, ${rgba(
              COLOR_ROTAS,
              0.14
            )}, ${rgba(COLOR_ROTAS, 0.04)})`,
            color: theme.text,
            whiteSpace: "nowrap",
          }}
        >
          <span>Total rotas</span>
          <span
            style={{
              minWidth: 28,
              textAlign: "center",
              padding: "2px 8px",
              borderRadius: 999,
              background: rgba(COLOR_ROTAS, 0.18),
              border: `1px solid ${rgba(COLOR_ROTAS, 0.28)}`,
              fontWeight: 1000,
              fontSize: 12,
              color: theme.text,
            }}
          >
            {totals.totalRotas}
          </span>
        </span>

        {/* Eficiência (100% - ineficiência). Meta 99-100% */}
        <span
          title="Eficiência = 100% - (Pendentes / Total rotas). Meta: 99-100%."
          style={efficiencyBadgeStyle}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: isMetaOk ? rgba(COLOR_OK, 0.22) : rgba(COLOR_PEND, 0.22),
              border: `1px solid ${
                isMetaOk ? rgba(COLOR_OK, 0.35) : rgba(COLOR_PEND, 0.35)
              }`,
              fontSize: 12,
              lineHeight: "18px",
              userSelect: "none",
            }}
          >
            {isMetaOk ? "✓" : "!"}
          </span>

          <span>
            Eficiência{" "}
            <b>
              {totals.efPct.toFixed(1)}%
            </b>
          </span>

          <span style={{ opacity: 0.8, fontWeight: 800 }}>
            (meta 99–100%)
          </span>
        </span>
      </div>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <ComposedChart
            data={safeData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fogRotas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={rgba(COLOR_ROTAS, 0.45)} />
                <stop offset="75%" stopColor={rgba(COLOR_ROTAS, 0.1)} />
                <stop offset="100%" stopColor={rgba(COLOR_ROTAS, 0)} />
              </linearGradient>

              <linearGradient id="fogPend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={rgba(COLOR_PEND, 0.55)} />
                <stop offset="75%" stopColor={rgba(COLOR_PEND, 0.12)} />
                <stop offset="100%" stopColor={rgba(COLOR_PEND, 0)} />
              </linearGradient>
            </defs>

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
              formatter={(value, name) => {
                if (name === "rotas_total") return [value, "Rotas"];
                if (name === "almoco_pendente") return [value, "Pendências almoço"];
                if (name === "almoco_gravissimo") return [value, "Finalizado sem lançar"];
                return [value, name];
              }}
            />

            <Legend wrapperStyle={{ color: theme.muted, fontSize: 12 }} />

            <Area
              type="monotone"
              dataKey="rotas_total"
              name="Rotas"
              stroke="transparent"
              fill="url(#fogRotas)"
              fillOpacity={1}
              isAnimationActive={false}
              dot={false}
              activeDot={false}
              tooltipType="none"
              legendType="none"
            />

            <Area
              type="monotone"
              dataKey="almoco_pendente"
              name="Pendências almoço"
              stroke="transparent"
              fill="url(#fogPend)"
              fillOpacity={1}
              isAnimationActive={false}
              dot={false}
              activeDot={false}
              tooltipType="none"
              legendType="none"
            />

            <Line
              type="monotone"
              dataKey="rotas_total"
              name="Total de rotas"
              stroke={COLOR_ROTAS}
              strokeWidth={3}
              dot={false}
              strokeLinecap="round"
              strokeLinejoin="round"
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="almoco_pendente"
              name="Pendência almoço"
              stroke={COLOR_PEND}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              isAnimationActive={false}
              // garante que dots cliquem mesmo com layers
              isFront
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (cx == null || cy == null) return null;

                const dayISO = payload?.data;
                if (!dayISO) return null;

                const pend = Number(payload?.almoco_pendente || 0);
                const grav = Number(payload?.almoco_gravissimo || 0);

                const commonGProps = {
                  style: { cursor: "pointer" },
                  pointerEvents: "visiblePainted",
                };

                if (grav > 0) {
                  return (
                    <g
                      {...commonGProps}
                      onClick={(e) => {
                        e?.stopPropagation?.();
                        if (onClickGravissimo) onClickGravissimo(dayISO);
                      }}
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={HIT_R}
                        fill="transparent"
                        style={{ pointerEvents: "all" }}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={7}
                        fill={rgba(COLOR_GRAV, 0.95)}
                        stroke={rgba("#ffffff", 0.35)}
                        strokeWidth={2}
                        style={{ pointerEvents: "none" }}
                      />
                      <text
                        x={cx}
                        y={cy + 3.5}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={1000}
                        fill={theme.bgPanel2}
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        !
                      </text>
                    </g>
                  );
                }

                const hasPend = pend > 0;
                return (
                  <g
                    {...commonGProps}
                    onClick={(e) => {
                      e?.stopPropagation?.();
                      if (onClickPendencias) onClickPendencias(dayISO);
                    }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={HIT_R}
                      fill="transparent"
                      style={{ pointerEvents: "all" }}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={hasPend ? 4 : 2}
                      fill={COLOR_PEND}
                      stroke="transparent"
                      style={{ pointerEvents: "none" }}
                    />
                  </g>
                );
              }}
              activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          opacity: 0.82,
          color: theme.muted,
        }}
      >
        Dica: clique no ponto laranja do dia para abrir os pendentes daquele dia.
        O “!” abre o Finalizado sem lançar do dia.
      </div>
    </div>
  );
}
