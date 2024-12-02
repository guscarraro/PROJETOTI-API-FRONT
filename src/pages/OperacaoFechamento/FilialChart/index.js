import React from "react";
import { Box } from "../styles";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BAR_COLORS = [
  "#ffffff", // Branco Neon
  "#ffcc00", // Amarelo Neon
  "#d633ff", // Roxo Neon
  "#00e6e6", // Ciano Neon
  "#ff99cc", // Rosa claro Neon
  "#ff6347", // Vermelho Neon
  "#b3ff00", // Verde Neon claro
];

const PIE_COLORS = [
    "#99ff99",
  "#ff9999",
  "#66b3ff",
  "#ffcc99",
  "#c266ff",
  "#ff6666",
  "#80ffbf",
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

const FilialChart = ({ barData, percentages }) => {
  return (
    <Box>
      <h5>Faturamento por base/redespachador</h5>
      {barData && barData.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#fff" }} />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 9, fill: "#fff" }}
            />
            <Tooltip
              formatter={(value, name, props) =>
                [`${formatCurrency(value)}`, `Filial: ${props.payload.name}`]
              }
            />
            <Bar dataKey="value" fill={BAR_COLORS[1]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>Sem dados disponíveis.</p>
      )}
      <h5>Percentual de Faturamento por Filial</h5>
      {percentages && percentages.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={percentages}
              dataKey="percent"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={({ name, percent }) => `${name}: ${percent.toFixed(1)}%`}
            >
              {percentages.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Legend
              formatter={(value, entry) => {
                const { payload } = entry;
                return `${payload.name}: ${payload.percent.toFixed(1)}%`;
              }}
              wrapperStyle={{ fontSize: "12px", color: "#fff" }}
            />
            <Tooltip
              formatter={(value, name) =>
                [`${value.toFixed(1)}%`, `Filial: ${name}`]
              }
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p>Sem dados disponíveis.</p>
      )}
    </Box>
  );
};

export default FilialChart;
