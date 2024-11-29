import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
} from "reactstrap";
import { MdOutlineCancelPresentation, MdOutlineDomainVerification  } from "react-icons/md";
import { VscVerifiedFilled } from "react-icons/vsc";
import { FaBoxes } from "react-icons/fa";


import { MdRemoveDone, MdDoneOutline, MdCancel   } from "react-icons/md";
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
import PizzaTopDezDistrib from './PizzaTopDezDistrib';
import SummaryBox from "./SummaryBox"; 
import LineChartToneladas from "./LineChartToneladas";

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
      acc[key].totalPeso += (item.peso || 0) / 1000;
      acc[key].totalQtd += item.qtd || 0;
      return acc;
    }, {});
  };

  const formatTomadorName = (tomador) => {
    if (!tomador) return '';

    const names = tomador.split(' ');
    const stopWords = ['de', 'da', 'do', '-'];

    if (stopWords.includes(names[1]?.toLowerCase())) {
      let filteredNames = [names[0]];

      for (let i = 1; i < names.length; i++) {
        if (!stopWords.includes(names[i]?.toLowerCase())) {
          filteredNames.push(names[i]);
          if (filteredNames.length === 2) break;
        }
      }

      const lastName = names[names.length - 1];
      if (!filteredNames.includes(lastName)) {
        filteredNames.push(lastName);
      }

      return filteredNames.join(' ');
    }

    return names.slice(0, 2).join(' ');
  };

  const groupedByTomador = Object.entries(groupByField("tomador_servico"))
    .map(([tomador, values]) => ({
      tomador,
      tomadorFormatado: formatTomadorName(tomador),
      ...values,
    }))
    .sort((a, b) => b.totalPeso - a.totalPeso)
    .slice(0, 10);

  const groupedByQtd = Object.entries(groupByField("tomador_servico"))
    .map(([tomador, values]) => ({
      tomador,
      tomadorFormatado: formatTomadorName(tomador),
      ...values,
    }))
    .sort((a, b) => b.totalQtd - a.totalQtd)
    .slice(0, 10);

    const totalsByStatus = (status) => {
      const filtered = data.filter((item) => item.status === status);
      const grouped = filtered.reduce(
        (totals, item) => {
          totals.valorBruto += item.valor_bruto || 0;
          totals.valorMercadoria += item.valor_mercadoria || 0;
          const key = item.fil_dest;
          if (!totals.pieData[key]) totals.pieData[key] = 0;
          totals.pieData[key] += item.valor_bruto || 0;
          return totals;
        },
        { valorBruto: 0, valorMercadoria: 0, pieData: {} }
      );
      return {
        valorBruto: grouped.valorBruto,
        valorMercadoria: grouped.valorMercadoria,
        pieData: Object.entries(grouped.pieData).map(([key, value]) => ({
          name: key,
          value,
        })),
      };
    };
    const getBarChartData = (data, status) => {
      const filteredData = data.filter((item) => item.status === status);
      const grouped = {};
    
      for (const item of filteredData) {
        const key = item.fil_dest;
        if (!grouped[key]) {
          grouped[key] = 0;
        }
        grouped[key] += item.valor_bruto || 0;
      }
    
      const result = [];
      for (const key in grouped) {
        result.push({ name: key, value: grouped[key] });
      }
    
      return result;
    };
    
    const getPercentages = (barData) => {
      let total = 0;
    
      for (const item of barData) {
        total += item.value;
      }
    
      const percentages = [];
      for (const { name, value } of barData) {
        percentages.push({ name, percent: (value / total) * 100 });
      }
    
      return percentages;
    };
    
    
    
    const pieDataEncerrado = getBarChartData(data, "Encerrado");
    const pieDataCancelado = getBarChartData(data, "Cancelado");
    const pieDataGeral = pieDataEncerrado.concat(pieDataCancelado);
    
    const percentagesEncerrado = getPercentages(pieDataEncerrado);
    const percentagesCancelado = getPercentages(pieDataCancelado);
    const percentagesGeral = getPercentages(pieDataGeral);
    
  
    const totalsEncerrado = totalsByStatus("Encerrado");
    const totalsCancelado = totalsByStatus("Cancelado");
    const totalsGeral = {
      valorBruto: totalsEncerrado.valorBruto + totalsCancelado.valorBruto,
      valorMercadoria:
        totalsEncerrado.valorMercadoria + totalsCancelado.valorMercadoria,
      pieData: [...totalsEncerrado.pieData, ...totalsCancelado.pieData],
    };
  

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  };
  return (
    <div className="boxGeneral">
      <Container fluid>
        {loading ? (
          <LoadingContainer>
            <LoadingText>Carregando dados...</LoadingText>
            <Loader />
          </LoadingContainer>
        ) : (
          <>
            <Row style={{ marginTop: 40 }}>
            <Col md="4">
            <SummaryBox
      title="Concluídos"
      icon={MdDoneOutline}
      bgColor="rgba(0, 255, 127, 0.35)"
      data={{
        valorBruto: totalsEncerrado.valorBruto,
        valorMercadoria: totalsEncerrado.valorMercadoria,
        barData: pieDataEncerrado,
        percentages: percentagesEncerrado,
      }}
      documentData={data.filter((item) => item.status === "Encerrado")}
    />
            </Col>
            <Col md="4">
            <SummaryBox
      title="Cancelados"
      icon={MdCancel}
      bgColor="rgba(255, 69, 0, 0.35)"
      data={{
        valorBruto: totalsCancelado.valorBruto,
        valorMercadoria: totalsCancelado.valorMercadoria,
        barData: pieDataCancelado,
        percentages: percentagesCancelado,
      }}
      documentData={data.filter((item) => item.status === "Cancelado")}
    />
            </Col>
            <Col md="4">
            <SummaryBox
      title="Total Geral"
      icon={FaBoxes}
      bgColor="rgba(255, 165, 0, 0.35)"
      data={{
        valorBruto: totalsGeral.valorBruto,
        valorMercadoria: totalsGeral.valorMercadoria,
        barData: pieDataGeral,
        percentages: percentagesGeral,
      }}
      documentData={data}
    />
            </Col>
          </Row>
            <Row>
            <Col md="12">
                <Box>
                  <h5>Toneladas Carregadas por Dia</h5>
                  <LineChartToneladas data={data} />
                </Box>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <Box>
                  <h5>Top 10 Tomadores por Peso</h5>
                  <ResponsiveContainer width="100%" height={390}>
                    <BarChart
                      data={groupedByTomador}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        tickFormatter={(value) => `${Math.round(value)}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="tomadorFormatado"
                        tick={{
                          angle: 0,
                          fontSize: 12,
                          textAnchor: "end",
                        }}
                        tickLine={false}
                        width={150}
                        position="outside"
                      />
                      <Tooltip
                        formatter={(value, name, props) =>
                          `${Math.round(value)}t (${props.payload.tomador})`
                        }
                      />
                      <Bar dataKey="totalPeso" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Col>

              <Col md="6">
                <Box style={{ paddingBottom: 10 }}>
                  {groupedByTomador.length > 0 ? (
                    <>
                      <h5>Distribuição Top 10 Tomadores</h5>
                      <PizzaTopDezDistrib data={groupedByTomador} />
                    </>
                  ) : (
                    <p>Sem dados disponíveis para o gráfico.</p>
                  )}
                </Box>
              </Col>
            </Row>

            <Row>
  <Col md="6">
    <Box>
      <h5>Top 10 Tomadores por Quantidade</h5>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={groupedByQtd.map((item) => ({
            ...item,
            tomadorFormatado: formatTomadorName(item.tomador),
          }))}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={(value) => `${Math.round(value)}`} // Exibe números inteiros no eixo X
          />
          <YAxis
            type="category"
            dataKey="tomadorFormatado"
            tick={{
              fontSize: 12, // Ajusta o tamanho da fonte
              textAnchor: "end", // Alinha o texto no fim
            }}
            tickLine={false} // Remove a linha de marcação no eixo Y
            width={200} // Define uma largura suficiente para os nomes
            position="outside" // Garante que o rótulo fique fora do gráfico
          />
          <Tooltip
            formatter={(value, name, props) =>
              `${Math.round(value)} (${props.payload.tomador})`
            } // Mostra o valor e o nome completo no tooltip
          />
          <Bar dataKey="totalQtd" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  </Col>
</Row>


           
          </>
        )}
      </Container>
    </div>
  );
};

export default OperacaoFechamento;
