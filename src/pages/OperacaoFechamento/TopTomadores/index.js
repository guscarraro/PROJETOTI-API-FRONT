import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Box } from "../styles";

const TopTomadoresPeso = ({ data }) => {
  return (
    <Box>
      <h5>Top 10 Tomadores por Peso</h5>
      <ResponsiveContainer width="100%" height={390}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={(value) => `${Math.round(value)}`}
          />
          <YAxis
            type="category"
            dataKey="tomadorFormatado"
            tick={{
              angle: 0,
              fontSize: 12,
              textAnchor: "end",
            }}
            tickLine={false}
            width={150}
            position="outside"
          />
          <Tooltip
            formatter={(value, name, props) =>
              `${Math.round(value)}t (${props.payload.tomador})`
            }
          />
          <Bar dataKey="totalPeso" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TopTomadoresPeso;
