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
const LineChartToneladas = ({ data, selectedTomadores }) => {
  const processLineChartData = (data, selectedTomadores) => {
    const allDates = generateOctoberDates();
    const grouped = {};

    // Filtrar apenas coletas no mês de outubro e pelos tomadores selecionados
    const filteredData = data.filter((item) => {
      const date = new Date(item.coletado_em);
      const isInOctober = date.getMonth() === 9 && date.getFullYear() === 2024;
      const isSelectedTomador =
        selectedTomadores.length === 0 ||
        selectedTomadores.includes(item.tomador_servico);
      return isInOctober && isSelectedTomador;
    });

    // Agrupando os dados por tomador e data
    filteredData.forEach((item) => {
      const date = new Date(item.coletado_em).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      const tomador = selectedTomadores.length > 0 ? item.tomador_servico : "Total Geral";

      if (!grouped[tomador]) {
        grouped[tomador] = {};
      }
      if (!grouped[tomador][date]) {
        grouped[tomador][date] = 0;
      }
      grouped[tomador][date] += item.peso || 0;
    });

    // Gerar os dados finais para o gráfico
    const finalData = allDates.map((date) => {
      const entry = { date };

      Object.keys(grouped).forEach((tomador) => {
        entry[tomador] = (grouped[tomador][date] || 0) / 1000; // Convertendo para toneladas
      });

      return entry;
    });

    return finalData;
  };

  const lineChartData = processLineChartData(data, selectedTomadores);

  const tomadoresKeys = selectedTomadores.length > 0
    ? selectedTomadores
    : ["Total Geral"];

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
        <Tooltip formatter={(value) => [`${value.toFixed(2)}t`, "Toneladas"]} />
        {selectedTomadores.length > 0 && <Legend />} {/* Mostrar a legenda apenas com seleção */}
        {tomadoresKeys.map((tomador, index) => (
          <Line
            key={tomador}
            type="monotone"
            dataKey={tomador}
            name={tomador}
            stroke={`hsl(${(index * 360) / tomadoresKeys.length}, 70%, 50%)`}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartToneladas;
