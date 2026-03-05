import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import { FiBarChart2, FiPieChart } from "react-icons/fi";
import { Grid, WavyCard, CardHead, CardTitle, CardSub, Hint } from "./style";

function ModernTooltip({ active, payload, label, formatterLabel, formatterValue }) {
  if (!active || !payload || !payload.length) return null;

  const p = payload[0];
  const name = formatterLabel ? formatterLabel(label) : label;
  const value = formatterValue ? formatterValue(p?.value) : p?.value;

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(148,163,184,0.35)",
        background: "rgba(2,6,23,0.55)",
        color: "#e5e7eb",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.30)",
        minWidth: 160,
      }}
    >
      <div style={{ fontWeight: 1000, fontSize: 12, opacity: 0.9 }}>{name}</div>
      <div style={{ marginTop: 6, fontWeight: 1000, fontSize: 14 }}>{value}</div>
    </div>
  );
}

export default function DreCharts({ chartByCfin, chartBySetor, formatBRL }) {
  const pieColors = useMemo(
    () => ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#22c55e", "#38bdf8", "#f472b6", "#f97316", "#94a3b8"],
    [],
  );

  return (
    <Grid>
      <WavyCard>
        <CardHead>
          <div>
            <CardTitle><FiBarChart2 /> Top CFIn por valor</CardTitle>
            <CardSub>Top 16 por valor_doc</CardSub>
          </div>
          <Hint>Passe o mouse pra detalhes</Hint>
        </CardHead>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartByCfin} margin={{ top: 10, right: 12, left: 0, bottom: 6 }}>
              <defs>
                <linearGradient id="dreBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.95} />
                  <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.9} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="var(--dre-grid)" strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--dre-tick)", fontSize: 11 }} hide />
              <YAxis tick={{ fill: "var(--dre-tick)", fontSize: 11 }} width={64} />
              <Tooltip
                content={<ModernTooltip formatterLabel={(lbl) => `CFIn: ${lbl}`} formatterValue={(v) => formatBRL(v)} />}
              />
              <Bar dataKey="value" fill="url(#dreBar)" radius={[10, 10, 10, 10]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </WavyCard>

      <WavyCard>
        <CardHead>
          <div>
            <CardTitle><FiPieChart /> Distribuição por setor</CardTitle>
            <CardSub>Top 10 por valor_doc</CardSub>
          </div>
          <Hint>Legenda sem poluir</Hint>
        </CardHead>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <PieChart>
              <Tooltip
                content={<ModernTooltip formatterLabel={(lbl) => `Setor: ${lbl}`} formatterValue={(v) => formatBRL(v)} />}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ color: "var(--dre-text)", fontSize: 12, opacity: 0.9 }}
              />
              <Pie
                data={chartBySetor}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={110}
                paddingAngle={2}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={1}
              >
                {chartBySetor.map((entry, idx) => (
                  <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </WavyCard>
    </Grid>
  );
}