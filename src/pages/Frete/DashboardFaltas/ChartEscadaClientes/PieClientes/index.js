import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF", "#FF4560"];

// Mapeia os tipos de ocorrência para seus nomes legíveis
const typeMapping = {
  F: "Falta",
  I: "Inversão",
  A: "Avaria",
};

const PieClientes = ({ data }) => {
  // Adiciona os nomes legíveis aos dados antes de renderizar
  const mappedData = data.map((item) => ({
    ...item,
    name: typeMapping[item.name] || item.name, // Substitui pelo nome legível ou mantém o original
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={mappedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="#8884d8"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {mappedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value}`, `Tipo: ${name}`]}
            contentStyle={{ backgroundColor: "#333", borderColor: "#fff" }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieClientes;
