// src/pages/OperacaoFechamento/PizzaTopDezDistrib/index.js
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { formatTomadorName } from "../../../helpers";
import { color } from "echarts";

const COLORS = [
  "#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#F97316", "#84CC16", "#EC4899", "#14B8A6",
  "#A855F7", "#22C55E",
];

const currencyBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        padding: "8px 10px",
        borderRadius: 8,
        boxShadow: "0 6px 24px rgba(0,0,0,.08)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
      <div>{currencyBRL.format(d.valor)} — {d.percent.toFixed(1)}%</div>
    </div>
  );
}

const renderLegend = ({ payload }) => {
  if (!payload) return null;
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: "0 8px 0 0",
        display: "flex",
        flexDirection: "column", // << uma coluna
        gap: 8,
        fontSize: 13,
        maxHeight: 480,
        overflowY: "auto",
      }}
    >
      {payload.map((p) => {
        const d = p.payload || {};
        return (
          <li key={d.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 12,
                height: 12,
                background: p.color,
                display: "inline-block",
                borderRadius: 2,
              }}
            />
            <span>
              {d.label}: {currencyBRL.format(d.valor)} — {d.percent?.toFixed(1)}%
            </span>
          </li>
        );
      })}
    </ul>
  );
};


/**
 * items: Array de registros normalizados (use filteredDataReceita do pai)
 * topN:  quantos tomadores exibir (default 10)
 */
export default function PizzaTopDezDistrib({ items = [], topN = 10 }) {
  const { chartData, totalAll } = useMemo(() => {
    const map = new Map();
    let total = 0;

    for (const it of items) {
      if (!it) continue;
      // Nome do tomador (compatível com seu normalizador)
      const tomador = it.tomador_servico || it.tomador || "";
      if (!tomador) continue;
      // Considera somente receita (valor_bruto). Mantém a lógica de "Normal" se existir.
      if (it.tipo_servico && it.tipo_servico !== "Normal") continue;

      const v = Number(it.valor_bruto) || 0;
      if (v <= 0) continue;

      map.set(tomador, (map.get(tomador) || 0) + v);
      total += v;
    }

    const arr = Array.from(map, ([tomador, valor]) => ({ tomador, valor }));
    arr.sort((a, b) => b.valor - a.valor);
    const top = arr.slice(0, topN);

    const data = top.map((r, i) => ({
      key: r.tomador,
      label: formatTomadorName(r.tomador),
      valor: r.valor,
      percent: total > 0 ? (r.valor / total) * 100 : 0,
      fill: COLORS[i % COLORS.length],
    }));

    return { chartData: data, totalAll: total };
  }, [items, topN]);

  if (!chartData.length || totalAll <= 0) {
    return <p>Sem dados disponíveis para o gráfico.</p>;
    }

  return (
   <ResponsiveContainer width="100%" height={370}>
  <PieChart margin={{ right: 220 }}>
    <Pie
      data={chartData}
      dataKey="valor"
      nameKey="label"
      cx="50%"
      cy="42%"
      outerRadius={120}
      label={({ value }) => `${((value / totalAll) * 100).toFixed(1)}%`}
      isAnimationActive={false}
    >
      {chartData.map((d) => (
        <Cell key={d.key} fill={d.fill} />
      ))}
    </Pie>

    {/* Tooltip com texto preto */}
    <Tooltip content={<CustomTooltip />} wrapperStyle={{ color: "#000" }} />

    {/* Legenda à direita, lado a lado com o gráfico */}
    <Legend
      layout="vertical"
      align="right"
      verticalAlign="middle"
      content={renderLegend}
      wrapperStyle={{ right: 0 }}
    />
  </PieChart>
</ResponsiveContainer>

  );
}
