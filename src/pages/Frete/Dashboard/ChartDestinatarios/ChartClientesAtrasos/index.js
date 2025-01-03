import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const ChartClientesAtrasos = ({ data }) => {
  // Limita os nomes no eixo X a 15 caracteres
  const formatName = (name) =>
    name && name.length > 15 ? `${name.substring(0, 15)}...` : name;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          type="category"
          tickFormatter={formatName}
          tick={{ fill: "#333" }}
          axisLine={{ stroke: "#ccc" }}
          tickLine={{ stroke: "#ccc" }}
        />
        <YAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: "#333" }}
          axisLine={{ stroke: "#ccc" }}
          tickLine={{ stroke: "#ccc" }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #ddd" }}
          labelStyle={{ color: "#333" }}
        />
        <Bar dataKey="quantidade" fill="#4682B4" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChartClientesAtrasos;
