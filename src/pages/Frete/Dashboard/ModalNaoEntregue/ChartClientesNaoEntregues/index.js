import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const ChartClientesNaoEntregues = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, bottom: 50, left: 30, right: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          type="category"
          tickFormatter={(tick) =>
            tick.length > 15 ? `${tick.substring(0, 13)}...` : tick
          }
          interval={0}
          angle={-45} // Inclinação para evitar sobreposição
          textAnchor="end"
        />
        <YAxis type="number" allowDecimals={false} />
        <Tooltip />
        <Bar
          dataKey="quantidade"
          fill="url(#gradienteVermelho)"
        />
        <defs>
          <linearGradient id="gradienteVermelho" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#cc0000" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChartClientesNaoEntregues;
