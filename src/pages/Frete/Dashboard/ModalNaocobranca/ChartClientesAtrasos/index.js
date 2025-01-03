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
    name.length > 15 ? `${name.substring(0, 15)}...` : name;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        {/* O eixo X será o nome do cliente com formatação */}
        <XAxis dataKey="name" type="category" tickFormatter={formatName} />
        {/* O eixo Y será a quantidade */}
        <YAxis type="number" allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="quantidade" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChartClientesAtrasos;