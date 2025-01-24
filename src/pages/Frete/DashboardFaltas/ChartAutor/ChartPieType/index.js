import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const ChartPieType = ({ data }) => {
  // Agrupar os dados por tipo de ocorrência
  const groupedData = {};
  data.forEach((item) => {
    const tipo = item.tipo_ocorren || "Outro";
    if (!groupedData[tipo]) {
      groupedData[tipo] = 0;
    }
    groupedData[tipo] += 1;
  });

  // Converter os dados agrupados para o formato do gráfico
  const chartData = Object.entries(groupedData).map(([name, value]) => ({
    name: name === "F" ? "Falta" : name === "A" ? "Avaria" : "Inversão",
    value,
  }));

  const COLORS = ["#FF6347", "#00C49F", "#1E90FF"];

  return (
    <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartPieType;
