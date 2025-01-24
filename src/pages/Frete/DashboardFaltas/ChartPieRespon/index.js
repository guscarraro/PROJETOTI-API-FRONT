import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Cores para o gráfico de pizza
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF", "#FF4560"];

// Componente para renderizar o gráfico de pizza baseado em "responsável"
const ChartPieRespon = ({ data, tipoOcorrencia }) => {
  // Filtrar os dados pelo tipo de ocorrência
  const filteredData = data.filter((item) => item.tipo_ocorren === tipoOcorrencia);

  // Agrupar os dados por "responsável" sem usar `reduce`
  const pieDataObj = {};
  filteredData.forEach((item) => {
    const responsavel = item.responsavel || "Não informado";
    if (!pieDataObj[responsavel]) {
      pieDataObj[responsavel] = 0;
    }
    pieDataObj[responsavel] += 1;
  });

  // Converter os dados agrupados para o formato esperado pelo Recharts
  const chartData = Object.entries(pieDataObj).map(([name, value]) => ({
    name,
    value,
  }));

  // Retorna o gráfico de pizza
  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="#8884d8"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} ocorrência(s)`, `Responsável: ${name}`]}
          />
          <Legend verticalAlign="bottom" height={20} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartPieRespon;
