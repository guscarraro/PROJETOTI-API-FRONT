import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend
} from "recharts";

// Cores para as fatias
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA46BE",
  "#F87A32",
  "#E9692C",
];

const ChartClientes = ({ data }) => {
  // 1) Filtra clientes com quantidade > 0, ordena desc, pega top 7
  const top7Data = data
    .filter((item) => item.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 7);

  // 2) Soma total para cálculo de porcentagem
  const total = top7Data.reduce((acc, item) => acc + item.quantidade, 0);

  // 3) Função para Legend customizada, mostrando "nome: quantidade (xx%)"
  const renderCustomLegend = ({ payload }) => {
    return (
      <ul style={{ listStyle: "none", margin: 0, padding: 0, color: "#fff" }}>
        {payload.map((entry, index) => {
          // Cada 'entry' tem `color` e `payload: { name, value }`
          const { color } = entry;
          let nome = entry.payload?.nome ?? "??";
          const quantidade = entry.payload?.quantidade ?? 0;
          const percent = total > 0 ? ((quantidade / total) * 100).toFixed(1) : 0;

          // Limitar o nome a 16 caracteres
          if (nome.length > 16) {
            nome = nome.slice(0, 16) + "...";
          }

          return (
            <li key={`legend-${index}`} style={{ marginBottom: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  backgroundColor: color,
                  marginRight: 6
                }}
              />
              {`${nome}: ${quantidade} (${percent}%)`}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <PieChart
          // Margin extra à direita para acomodar a legenda
          margin={{ top: 20, right: 120, left: 0, bottom: 20 }}
        >
          {/* Tooltip customizado */}
          <Tooltip
            contentStyle={{ backgroundColor: "#333", border: "1px solid #fff" }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value) => {
              const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${value} (${percent}%)`;
            }}
          />

          {/* Legend: usamos a função 'renderCustomLegend' */}
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ color: "#fff" }}
            content={renderCustomLegend}
          />

          <Pie
            data={top7Data}
            dataKey="quantidade" // Alterado para refletir o novo campo
            nameKey="nome"
            outerRadius={100}
            label={false}
            labelLine={false}
          >
            {top7Data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartClientes;
