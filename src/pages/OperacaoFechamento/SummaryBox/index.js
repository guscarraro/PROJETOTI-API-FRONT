import React from "react";
import { Card } from "reactstrap";
import { Box } from "../styles";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Paleta de cores para o gráfico de barras
const BAR_COLORS = [
  "#ffffff", // Branco Neon
  "#ffcc00", // Amarelo Neon
  "#d633ff", // Roxo Neon
  "#00e6e6", // Ciano Neon
  "#ff99cc", // Rosa claro Neon
  "#ff6347", // Vermelho Neon
  "#b3ff00", // Verde Neon claro
];

// Função de formatação de moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

// Função para contar o total de documentos (baseado no campo `numero`)
const countDocuments = (documentData) => {
  if (!documentData || documentData.length === 0) return 0;
  return documentData.reduce((total, item) => total + (item.numero ? 1 : 0), 0);
};

// Componente SummaryBox
const SummaryBox = ({ title, icon: Icon, bgColor, data, documentData }) => {
  // Calcula o total de documentos
  const totalDocuments = countDocuments(documentData);

  // Extraindo os dados para o gráfico de barras e percentuais
  const barData = data.barData || [];
  const percentages = data.percentages || [];

  return (
    <Box bgColor={bgColor}>
      <h4>
        {title} {Icon && <Icon style={{ float: "left" }} />}
      </h4>
      <h3>Qtde documentos: {totalDocuments}</h3>
      <Card className="customCard">
        <h5>Total Faturamento</h5>
        <h1>{formatCurrency(data.valorBruto)}</h1>
      </Card>
      <Card className="customCard">
        <h5>Total Mercadoria</h5>
        <h1>{formatCurrency(data.valorMercadoria)}</h1>
      </Card>
      <Card className="customCard">
        <h5>Faturamento por base/redespachador</h5>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#fff" }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 9, fill: "#fff" }}
              />
              <Tooltip
                formatter={(value, name, props) =>
                  [`${formatCurrency(value)}`, `Filial: ${props.payload.name}`]
                } // Personaliza o valor e o nome da filial
              />
              <Bar dataKey="value" fill={BAR_COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>Sem dados disponíveis.</p>
        )}
      </Card>
      <Card className="customCard">
        <h5>Percentual de Faturamento por Filial</h5>
        {percentages.length > 0 ? (
          <ul>
            {percentages.map(({ name, percent }) => (
              <li key={name}>
                {name}: {percent.toFixed(1)}%
              </li>
            ))}
          </ul>
        ) : (
          <p>Sem dados disponíveis.</p>
        )}
      </Card>
    </Box>
  );
};

export default SummaryBox;
