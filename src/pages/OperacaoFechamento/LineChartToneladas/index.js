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

// Função para gerar os dias do mês
const generateDays = () => Array.from({ length: 31 }, (_, i) => (i + 1).toString());

// Componente LineChartToneladas
const LineChartToneladas = ({ data, selectedTomadores, selectedMonths }) => {
  const processLineChartData = (data, selectedTomadores, selectedMonths) => {
    const days = generateDays();
    const grouped = {};

    // Filtrar dados com base em meses e tomadores selecionados
    const filteredData = data.filter((item) => {
      const [year, month, day] = item.emissao.split("-");
      const itemMonth = `${year}-${month}`;
      const isMonthSelected =
        selectedMonths.length === 0 || selectedMonths.includes(itemMonth);
      const isTomadorSelected =
        selectedTomadores.length === 0 ||
        selectedTomadores.includes(item.tomador_servico);

      return isMonthSelected && isTomadorSelected;
    });

    // Agrupar os dados por mês e dia (se nenhum tomador for selecionado)
    if (selectedTomadores.length === 0) {
      filteredData.forEach((item) => {
        const [year, month, day] = item.emissao.split("-");
        const dayNumber = parseInt(day, 10);
        const monthLabel = `${month}/${year}`;
        const lineKey = `Total (${monthLabel})`;

        if (!grouped[lineKey]) {
          grouped[lineKey] = {};
        }

        if (!grouped[lineKey][dayNumber]) {
          grouped[lineKey][dayNumber] = 0;
        }

        grouped[lineKey][dayNumber] += item.peso || 0;
      });
    } else {
      // Agrupar os dados por tomador, mês e dia (quando tomadores são selecionados)
      filteredData.forEach((item) => {
        const [year, month, day] = item.emissao.split("-");
        const dayNumber = parseInt(day, 10);
        const monthLabel = `${month}/${year}`;
        const tomador = item.tomador_servico || "Total Geral";
        const lineKey = `${tomador} (${monthLabel})`;

        if (!grouped[lineKey]) {
          grouped[lineKey] = {};
        }

        if (!grouped[lineKey][dayNumber]) {
          grouped[lineKey][dayNumber] = 0;
        }

        grouped[lineKey][dayNumber] += item.peso || 0;
      });
    }

    // Gerar os dados finais para o gráfico
    const finalData = days.map((day) => {
      const dayNumber = parseInt(day, 10);
      const entry = { day };

      Object.keys(grouped).forEach((lineKey) => {
        entry[lineKey] = (grouped[lineKey][dayNumber] || 0) / 1000; // Convertendo para toneladas
      });

      return entry;
    });

    return finalData;
  };

  const lineChartData = processLineChartData(data, selectedTomadores, selectedMonths);

  // Obter todas as combinações de linhas (mês ou tomador + mês)
  const lineKeys = Object.keys(lineChartData[0] || {}).filter((key) => key !== "day");

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={lineChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: "#fff" }}
          interval={0} // Exibir todos os rótulos
          label={{
            value: "Dias do Mês",
            position: "insideBottom",
            offset: -5,
            fill: "#fff",
          }}
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
        {(lineKeys.length > 0) && (
  <Legend />
)} {/* Mostrar a legenda apenas se tomadores forem selecionados */}
        {lineKeys.map((lineKey, index) => (
          <Line
            key={lineKey}
            type="monotone"
            dataKey={lineKey}
            name={lineKey} // Nome formatado (Tomador + Mês ou Total Geral)
            stroke={`hsl(${(index * 360) / lineKeys.length}, 70%, 50%)`}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartToneladas;
