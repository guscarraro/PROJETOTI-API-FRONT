import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

const ChartClientesAtrasos = ({ data }) => {
  // Formatar os nomes no eixo X para não exceder 15 caracteres
  const formatName = (name) =>
    name && name.length > 15 ? `${name.substring(0, 15)}...` : name;

  // Validar se o dado existe antes de renderizar
  const processedData = data.map((item) => ({
    nome: item.name || "Desconhecido",
    quantidade: item.quantidade || 0,
  }));
  const groupByClient = (details) => {
    const grouped = {};
    details.forEach((item) => {
      const cliente = item.cliente || "Desconhecido";
      grouped[cliente] = (grouped[cliente] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, quantidade]) => ({
      name,
      quantidade,
    }));
  };
  return (
    <div style={{ marginBottom: 20 }}>
    <h5>Gráfico de Pizza</h5>
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={groupByClient(modalData.details).slice(0, 5)} // Agrupar por cliente
          dataKey="quantidade"
          nameKey="name"
          outerRadius={100}
          fill="#8884d8"
          label={(entry) => `${entry.name}: ${entry.quantidade}`}
        >
          {groupByClient(modalData.details)
            .slice(0, 5)
            .map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
  
  );
};

export default ChartClientesAtrasos;
