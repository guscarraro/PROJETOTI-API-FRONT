import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from "recharts";

/** Util: 1..31 como strings */
const generateDays = () =>
  Array.from({ length: 31 }, (_, i) => (i + 1).toString());

/** YYYY-MM -> {year: number, month: number} (month: 1..12) */
const splitMonthKey = (ym) => {
  if (!ym) return null;
  const [y, m] = ym.split("-").map((x) => parseInt(x, 10));
  if (!y || !m) return null;
  return { year: y, month: m };
};

/** Conta os dias úteis (seg–sex) de um mês (YYYY, month 1..12) */
function countWeekdaysInMonth(year, month) {
  const monthIndex = month - 1;
  const d = new Date(year, monthIndex, 1);
  let count = 0;
  while (d.getMonth() === monthIndex) {
    const day = d.getDay(); // 0=dom..6=sáb
    if (day >= 1 && day <= 5) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

/** Se o dia (1..31) de um mês YYYY-MM é dia útil */
function isWeekday(year, month, day) {
  const dt = new Date(year, month - 1, day);
  if (dt.getMonth() !== month - 1) return false; // 30/31 inexistentes
  const dow = dt.getDay();
  return dow >= 1 && dow <= 5;
}

const formatCurrency = (value) =>
  (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

/** id seguro para <defs> */
const toId = (s) => s.replace(/[^a-zA-Z0-9_-]/g, "_");

/**
 * Gera os dados para o LineChart:
 * - Linhas de receita diária:
 *   * sem tomadores: 1 linha por mês -> "Total (MM/YYYY)"
 *   * com tomadores: 1 linha por tomador+mês -> "TOMADOR (MM/YYYY)"
 * - Linhas de meta por mês: "Meta (MM/YYYY)".
 *   Meta diária = monthlyGoal / dias_uteis(YYYY-MM).
 *   **Finais de semana = 0** (área até o eixo X).
 */
function useChartData(data, selectedTomadores, selectedMonths, monthlyGoal) {
  return useMemo(() => {
    const days = generateDays();

    // Filtra por meses/tomadores (pai já filtrou Encerrado/Normal)
    const filtered = data.filter((item) => {
      const iso = item.emissao || "";
      const [year, month] = iso.split("-");
      const itemMonth = `${year}-${month}`;
      const okMonth =
        selectedMonths.length === 0 || selectedMonths.includes(itemMonth);
      const okTomador =
        selectedTomadores.length === 0 ||
        selectedTomadores.includes(item.tomador_servico);
      return okMonth && okTomador;
    });

    // Agrupa receitas
    const grouped = {}; // lineKey -> { dayNumber -> somaReceita }
    const monthsPresent = new Set(); // YYYY-MM presentes

    if (selectedTomadores.length === 0) {
      for (const item of filtered) {
        if (!item.emissao) continue;
        const [year, month, day] = item.emissao.split("-");
        const dnum = parseInt(day, 10);
        const monthLabel = `${month}/${year}`;
        const lineKey = `Total (${monthLabel})`;
        const ym = `${year}-${month}`;
        monthsPresent.add(ym);
        if (!grouped[lineKey]) grouped[lineKey] = {};
        grouped[lineKey][dnum] =
          (grouped[lineKey][dnum] || 0) + (item.valor_bruto || 0);
      }
    } else {
      for (const item of filtered) {
        if (!item.emissao) continue;
        const [year, month, day] = item.emissao.split("-");
        const dnum = parseInt(day, 10);
        const monthLabel = `${month}/${year}`;
        const tom = item.tomador_servico || "Total Geral";
        const lineKey = `${tom} (${monthLabel})`;
        const ym = `${year}-${month}`;
        monthsPresent.add(ym);
        if (!grouped[lineKey]) grouped[lineKey] = {};
        grouped[lineKey][dnum] =
          (grouped[lineKey][dnum] || 0) + (item.valor_bruto || 0);
      }
    }

    // Linhas de META por mês: "Meta (MM/YYYY)" — finais de semana = 0
    for (const ym of monthsPresent) {
      const split = splitMonthKey(ym);
      if (!split) continue;
      const { year, month } = split;
      const monthLabel = `${String(month).padStart(2, "0")}/${year}`;
      const metaKey = `Meta (${monthLabel})`;

      const weekdays = countWeekdaysInMonth(year, month);
      const metaPerWeekday = weekdays > 0 ? monthlyGoal / weekdays : 0;

      grouped[metaKey] = grouped[metaKey] || {};
      for (let d = 1; d <= 31; d++) {
        grouped[metaKey][d] = isWeekday(year, month, d) ? metaPerWeekday : 0;
      }
    }

    // Monta dados finais
    const finalData = days.map((dStr) => {
      const d = parseInt(dStr, 10);
      const row = { day: dStr };
      for (const key of Object.keys(grouped)) {
        row[key] = grouped[key][d] ?? 0;
      }
      return row;
    });

    const lineKeys = Object.keys(finalData[0] || {}).filter((k) => k !== "day");
    const metaKeys = lineKeys.filter((k) => k.startsWith("Meta "));
    const valueKeys = lineKeys.filter((k) => !k.startsWith("Meta "));

    return { finalData, lineKeys, metaKeys, valueKeys };
  }, [data, selectedTomadores, selectedMonths, monthlyGoal]);
}

const LineChartReceita = ({
  data,
  selectedTomadores = [],
  selectedMonths = [],
  monthlyGoal = 4_000_000, // meta mensal por mês
}) => {
  const { finalData, metaKeys, valueKeys } = useChartData(
    data,
    selectedTomadores,
    selectedMonths,
    monthlyGoal
  );

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={finalData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: "#fff" }}
          interval={0}
          label={{
            value: "Dia do mês",
            position: "insideBottom",
            offset: -5,
            fill: "#fff",
          }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#fff" }}
          tickFormatter={formatCurrency}
          label={{
            value: "Receita (R$)",
            angle: -90,
            position: "insideLeft",
            offset: -5,
            fill: "#fff",
          }}
        />
        <Tooltip
          formatter={(value, name) => [
            value == null ? "-" : formatCurrency(value),
            name,
          ]}
        />
        {(metaKeys.length + valueKeys.length) > 0 && <Legend />}

        {/* Gradientes para cada linha de meta (verde moderno) */}
        <defs>
          {metaKeys.map((k) => {
            const id = `grad_${toId(k)}`;
            return (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                {/* topo: verde mais forte próximo à linha */}
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                {/* base: verde bem suave no eixo X */}
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.06" />
              </linearGradient>
            );
          })}
        </defs>

        {/* Faixa preenchida (degradê verde) do eixo X até a meta */}
        {metaKeys.map((k) => {
          const id = `grad_${toId(k)}`;
          return (
            <Area
              key={`area_${k}`}
              type="monotone"
              dataKey={k}
              stroke="none"
              fill={`url(#${id})`}
              fillOpacity={1}
              isAnimationActive={false}
            />
          );
        })}

        {/* Linha da meta (verde) por cima da faixa */}
        {metaKeys.map((k) => (
          <Line
            key={`line_meta_${k}`}
            type="monotone"
            dataKey={k}
            name={k}
            stroke="#16a34a"          // verde principal da linha
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />
        ))}

        {/* Linhas de valores alcançados (mês ou tomador+mês) */}
        {valueKeys.map((key, idx) => (
          <Line
            key={`line_val_${key}`}
            type="monotone"
            dataKey={key}
            name={key}
            stroke={`hsl(${(idx * 360) / Math.max(1, valueKeys.length)}, 70%, 50%)`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartReceita;
