import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF", "#FF4560",
  "#FF6384", "#36A2EB", "#FFCE56", "#9966FF", "#00A6B4", "#C9CBCF"
];

const MotoristaPieChart = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div style={{ width: "100%", height: 400, display: "flex" }}>
      {/* Legenda à esquerda */}
      <div style={{ flex: 1, padding: "10px 20px", overflowY: "auto" }}>
        <h6 style={{ marginBottom: 8 }}>Legenda:</h6>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 12 }}>
          {sortedData.map((entry, index) => (
            <li
              key={index}
              style={{
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: COLORS[index % COLORS.length],
                  marginRight: 8,
                  borderRadius: 2,
                }}
              />
              {entry.name}: {entry.value}
            </li>
          ))}
        </ul>
      </div>

      {/* Gráfico de pizza à direita */}
      <div style={{ flex: 1.5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sortedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}`, `${name}`]}
              contentStyle={{
                backgroundColor: "#f9f9f9",
                border: "1px solid #ccc",
                color: "#000",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#000", fontWeight: "bold" }}
              itemStyle={{ color: "#000" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MotoristaPieChart;
