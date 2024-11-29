import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Função para formatar toneladas
const formatToneladas = (value) => `${value.toFixed(2)}t`;

// Função para gerar todas as datas do mês de outubro
const generateOctoberDates = () => {
  const dates = [];
  const start = new Date(2024, 9, 1); // Outubro começa no índice 9
  const end = new Date(2024, 9, 31);

  while (start <= end) {
    dates.push(start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
    start.setDate(start.getDate() + 1);
  }

  return dates;
};

// Componente LineChartToneladas
const LineChartToneladas = ({ data }) => {
  const processLineChartData = (data) => {
    const grouped = {};

    // Filtrar apenas coletas no mês de outubro
    const filteredData = data.filter((item) => {
      const date = new Date(item.coletado_em);
      return date.getMonth() === 9 && date.getFullYear() === 2024; // Outubro é o mês 9 (índice zero-based)
    });

    // Agrupando os dados por data
    filteredData.forEach((item) => {
      const date = new Date(item.coletado_em).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      if (!grouped[date]) {
        grouped[date] = 0;
      }
      grouped[date] += item.peso || 0;
    });

    // Gerar todas as datas de outubro e preencher valores ausentes com 0
    const allDates = generateOctoberDates();
    return allDates.map((date) => ({
      date,
      toneladas: (grouped[date] || 0) / 1000, // Convertendo para toneladas
    }));
  };

  const lineChartData = processLineChartData(data);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={lineChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#fff" }}
          interval={0} // Exibir todos os rótulos
        />
        <YAxis
          tickFormatter={(value) => formatToneladas(value)}
          tick={{ fontSize: 12, fill: "#fff" }}
          label={{
            value: "Toneladas",
            angle: -90,
            position: "insideLeft",
            offset: -5,
            fill: "#fff",
          }}
        />
        <Tooltip
          formatter={(value) => [`${value.toFixed(2)}t`, "Toneladas"]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="toneladas"
          stroke="#329835"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartToneladas;
