import React from "react";
import { Card } from "reactstrap";
import { Box } from "../styles";

// Função de formatação de números grandes
const formatLargeNumber = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

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

// Calcula o peso total
const calculateTotalWeight = (documentData) => {
  if (!documentData || documentData.length === 0) return 0;
  return documentData.reduce((total, item) => total + (item.peso || 0), 0) / 1000; // Convertendo para toneladas
};

// Calcula a quantidade total de volumes
const calculateTotalVolumes = (documentData) => {
  if (!documentData || documentData.length === 0) return 0;
  return documentData.reduce(
    (total, item) => total + (item.quantidade_volume || 0),
    0
  );
};

// Calcula a quantidade total de Qtd
const calculateTotalQtd = (documentData) => {
  if (!documentData || documentData.length === 0) return 0;
  return documentData.reduce((total, item) => total + (item.qtd || 0), 0);
};

// Componente SummaryBox
const SummaryBox = ({ title, icon: Icon, bgColor, data, documentData }) => {
  const totalDocuments = countDocuments(documentData);
  const totalWeight = calculateTotalWeight(documentData);
  const totalVolumes = calculateTotalVolumes(documentData);
  const totalQtd = calculateTotalQtd(documentData);

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
        <h5>Total Peso (toneladas)</h5>
        <h1>{formatLargeNumber(totalWeight)} t</h1>
      </Card>
      <Card className="customCard">
        <h5>Total Volumes</h5>
        <h1>{formatLargeNumber(totalVolumes)}</h1>
      </Card>
      <Card className="customCard">
        <h5>Total Qtde</h5>
        <h1>{formatLargeNumber(totalQtd)}</h1>
      </Card>
    </Box>
  );
};

export default SummaryBox;
