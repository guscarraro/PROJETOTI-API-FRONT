import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

const ChartTopMotoristasBaixas = ({ data }) => {
  const contagem = {};

  data.forEach((item) => {
    if (item.tp_colaborador?.trim() === "MOTORISTA") {
      const nome = item.usuarioAlteracao?.trim() || "Desconhecido";
      contagem[nome] = (contagem[nome] || 0) + 1;
    }
  });

  const getTrophyEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  const top10 = Object.entries(contagem)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      display: `${getTrophyEmoji(index)} ${index + 1}º - ${item.nome}`,
    }));

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <BarChart
          data={top10}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fill: "#fff" }} />
          <YAxis dataKey="display" type="category" width={220} tick={{ fill: "#fff" }} interval={0} />

          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#48C9B0" name="Baixas confirmadas">
            <LabelList dataKey="total" position="insideLeft" fill="#fff" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartTopMotoristasBaixas;
