import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#1E90FF", "#FF6347", "#FFD700", "#9ACD32", "#FF69B4"];

const ChartPizzaTipoColaborador = ({ data }) => {
  const contagem = {};
  console.log("🍕 Dados do gráfico de pizza:", data);

  data.forEach((item) => {
    const tipo = item.tp_colaborador?.trim() || "Desconhecido";
    contagem[tipo] = (contagem[tipo] || 0) + 1;
  });

  const chartData = Object.entries(contagem).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartPizzaTipoColaborador;
