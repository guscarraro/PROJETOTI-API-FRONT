import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { formatTomadorName } from "../../../helpers"; // Importa o helper

// Paleta de cores primárias
const COLORS = [
  "#FF0000", // Vermelho
  "#fFF", // Branco
  "#FFFF00", // Amarelo
  "#008000", // Verde
  "#FFA500", // Laranja
  "#800080", // Roxo
  "#00FFFF", // Ciano
  "#FFC0CB", // Rosa
  "#A52A2A", // Marrom
  "#808000", // Verde-oliva
];

const PieChartComponent = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>Sem dados disponíveis para o gráfico.</p>; // Fallback quando não há dados
  }

  const totalPeso = data.reduce((acc, entry) => acc + entry.totalPeso, 0); // Calcula o total de peso

  const formattedData = data.map((entry) => ({
    ...entry,
    tomador: formatTomadorName(entry.tomador), // Formata o nome usando o helper
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
        
      <PieChart>
        <Pie
          data={formattedData} // Usa os dados formatados
          dataKey="totalPeso"
          nameKey="tomador"
          cx="50%"
          cy="40%" // Ajusta a posição vertical do gráfico
          outerRadius={120}
          label={({ value }) => `${((value / totalPeso) * 100).toFixed(1)}%`} // Mostra a porcentagem
        >
          {formattedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]} // Aplica as cores da paleta
            />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => `${Math.round(value)}t (${formatTomadorName(name)})`} />
        <Legend
          layout="horizontal" // Configura a legenda para layout horizontal
          align="center" // Centraliza horizontalmente
          verticalAlign="bottom" // Posiciona abaixo do gráfico
          wrapperStyle={{
            paddingTop: "20px", // Adiciona um espaço entre o gráfico e a legenda
            fontSize: "12px", // Ajusta o tamanho do texto
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
