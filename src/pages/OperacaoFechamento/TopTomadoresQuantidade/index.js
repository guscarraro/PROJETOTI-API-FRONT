import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Box } from "../styles";
import { formatTomadorName } from "../../../helpers";

const TopTomadoresQuantidade = ({ data }) => {
  // Agrupando os dados por tomador e somando quantidade_volume
  const groupByTomador = (data) => {
    const grouped = {};
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const key = item.tomador_servico;
      if (!grouped[key]) {
        grouped[key] = { totalVol: 0 };
      }
      grouped[key].totalVol += item.quantidade_volume || 0;
    }

    return Object.entries(grouped).map(([tomador, values]) => ({
      tomador,
      totalVol: values.totalVol,
      tomadorFormatado: formatTomadorName(tomador),
    }));
  };

  // Processando os dados
  const groupedData = groupByTomador(data)
    .sort((a, b) => b.totalVol - a.totalVol) // Ordena por totalVol
    .slice(0, 10); // Mantém apenas o top 10

  return (
    <Box>
      <h5>Top 10 Tomadores por Volume</h5>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={groupedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => `${Math.round(value)}`} />
          <YAxis
            type="category"
            dataKey="tomadorFormatado"
            tick={{
              fontSize: 12,
              textAnchor: "end",
            }}
            tickLine={false}
            width={200}
            position="outside"
          />
          <Tooltip formatter={(value, name, props) => `${Math.round(value)} (${props.payload.tomador})`} />
          <Bar dataKey="totalVol" fill="#329835" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TopTomadoresQuantidade;
