import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
} from "reactstrap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Box,
  LoadingContainer,
  Loader,
  LoadingText,
} from "./styles";

const OperacaoFechamento = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://projetoti-api-production.up.railway.app/fechamento-operacao"
      );
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupByField = (field) => {
    return data.reduce((acc, item) => {
      const key = item[field];
      if (!acc[key]) acc[key] = { totalPeso: 0, totalQtd: 0 };
      acc[key].totalPeso += item.peso || 0;
      acc[key].totalQtd += item.qtd || 0;
      return acc;
    }, {});
  };

  const groupedByTomador = Object.entries(groupByField("tomador_servico"))
    .map(([tomador, values]) => ({ tomador, ...values }))
    .sort((a, b) => b.totalPeso - a.totalPeso) // Ordena pelo total de peso
    .slice(0, 10); // Top 10 por peso

  const groupedByQtd = Object.entries(groupByField("tomador_servico"))
    .map(([tomador, values]) => ({ tomador, ...values }))
    .sort((a, b) => b.totalQtd - a.totalQtd) // Ordena pelo total de quantidade
    .slice(0, 10); // Top 10 por quantidade

  const totalsByStatus = (status) => {
    const filtered = data.filter((item) => item.status === status);
    return filtered.reduce(
      (totals, item) => {
        totals.valorBruto += item.valor_bruto || 0;
        totals.valorMercadoria += item.valor_mercadoria || 0;
        return totals;
      },
      { valorBruto: 0, valorMercadoria: 0 }
    );
  };

  const totalsEncerrado = totalsByStatus("Encerrado");
  const totalsCancelado = totalsByStatus("Cancelado");

  return (
    <Container fluid>
      {loading ? (
        <LoadingContainer>
          <LoadingText>Carregando dados...</LoadingText>
          <Loader />
        </LoadingContainer>
      ) : (
        <>
          <Row>
            <Col md="6">
              <h5>Toneladas por Dia</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={groupedByTomador}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tomador" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalPeso" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
          </Row>

          <Row>
            <Col md="6">
              <h5>Top 10 Tomadores por Peso</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={groupedByTomador} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="tomador" />
                  <Tooltip />
                  <Bar dataKey="totalPeso" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
            <Col md="6">
              <h5>Top 10 Tomadores por Quantidade</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={groupedByQtd} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="tomador" />
                  <Tooltip />
                  <Bar dataKey="totalQtd" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
          </Row>

          <Row>
            <Col md="3">
              <Box bgColor="#007bff">
                <h5>Total Bruto (Encerrado)</h5>
                <p>R$ {totalsEncerrado.valorBruto.toFixed(2)}</p>
              </Box>
            </Col>
            <Col md="3">
              <Box bgColor="#00C49F">
                <h5>Total Mercadoria (Encerrado)</h5>
                <p>R$ {totalsEncerrado.valorMercadoria.toFixed(2)}</p>
              </Box>
            </Col>
            <Col md="3">
              <Box bgColor="#FF8042">
                <h5>Total Bruto (Cancelado)</h5>
                <p>R$ {totalsCancelado.valorBruto.toFixed(2)}</p>
              </Box>
            </Col>
            <Col md="3">
              <Box bgColor="#FF4500">
                <h5>Total Mercadoria (Cancelado)</h5>
                <p>R$ {totalsCancelado.valorMercadoria.toFixed(2)}</p>
              </Box>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default OperacaoFechamento;
