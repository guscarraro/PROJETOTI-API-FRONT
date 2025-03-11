import React, { useState, useEffect } from "react";
import Select from "react-select"; // Importa o Select
import {
  Container,
  Row,
  Col,
} from "reactstrap";
import { MdDoneOutline } from "react-icons/md";
import {
  Box,
  LoadingContainer,
  Loader,
  LoadingText,
} from "./styles";
import PizzaTopDezDistrib from './PizzaTopDezDistrib';
import SummaryBox from "./SummaryBox"; 
import LineChartToneladas from "./LineChartToneladas";
import { formatTomadorName } from "../../helpers";
import TopTomadores from "./TopTomadores";
import TopTomadoresQuantidade from "./TopTomadoresQuantidade";
import FilialChart from "./FilialChart";
import { StyledSelect } from "../../components/StyledSelect";

const OperacaoFechamento = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTomadores, setSelectedTomadores] = useState([]); // Armazena os tomadores selecionados
  const [selectedMonths, setSelectedMonths] = useState([]); // Armazena os meses selecionados

  const monthOptions = [
    { value: "2024-01", label: "Janeiro 2024" },
    { value: "2024-02", label: "Fevereiro 2024" },
    { value: "2024-03", label: "Março 2024" },
    { value: "2024-04", label: "Abril 2024" },
    { value: "2024-05", label: "Maio 2024" },
    { value: "2024-06", label: "Junho 2024" },
    { value: "2024-07", label: "Julho 2024" },
    { value: "2024-08", label: "Agosto 2024" },
    { value: "2024-09", label: "Setembro 2024" },
    { value: "2024-10", label: "Outubro 2024" },
    { value: "2024-11", label: "Novembro 2024" },
    { value: "2024-12", label: "Dezembro 2024" },
    { value: "2025-01", label: "Janeiro 2025" },
    { value: "2025-02", label: "Fevereiro 2025" },
  ];

  // Função para buscar dados
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

  useEffect(() => {
    fetchData();
  }, []);

  // Filtro baseado nos tomadores selecionados
  const filteredData = data.filter((item) => {
    const itemMonth = item.emissao.split("-").slice(0, 2).join("-");
    const isMonthSelected =
      selectedMonths.length === 0 ||
      selectedMonths.some((month) => month.value === itemMonth);
    const isTomadorSelected =
      selectedTomadores.length === 0 ||
      selectedTomadores.some((t) => t.value === item.tomador_servico);

    return (
      item.status === "Encerrado" &&
      item.tipo_servico === "Normal" &&
      isMonthSelected &&
      isTomadorSelected
    );
  });

  const tomadorOptions = [
    ...new Set(data.map((item) => item.tomador_servico)),
  ].map((tomador) => ({
    value: tomador,
    label: formatTomadorName(tomador),
  }));

  const groupByField = (field) => {
    const grouped = {};
    for (let i = 0; i < filteredData.length; i++) {
      const item = filteredData[i];
      const key = item[field];
      if (!grouped[key]) {
        grouped[key] = { totalPeso: 0, totalQtd: 0 };
      }
      grouped[key].totalPeso += (item.peso || 0) / 1000; // Convertendo para toneladas
      grouped[key].totalQtd += item.qtd || item.quantidade_volume || 0;
    }
    return grouped;
  };

  const groupedByTomador = Object.entries(groupByField("tomador_servico"))
    .map(([tomador, values]) => ({
      tomador,
      tomadorFormatado: formatTomadorName(tomador),
      ...values,
    }))
    .sort((a, b) => b.totalPeso - a.totalPeso)
    .slice(0, 10);

  const totalsByStatus = (status) => {
    const filtered = data.filter((item) => {
      const itemMonth = item.emissao.split("-").slice(0, 2).join("-");
      const isMonthSelected =
        selectedMonths.length === 0 ||
        selectedMonths.some((month) => month.value === itemMonth);

      return (
        item.status === status &&
        item.tipo_servico === "Normal" &&
        isMonthSelected &&
        (selectedTomadores.length === 0 ||
          selectedTomadores.some((t) => t.value === item.tomador_servico))
      );
    });

    const grouped = filtered.reduce(
      (totals, item) => {
        totals.valorBruto += item.valor_bruto || 0;
        totals.valorMercadoria += item.valor_mercadoria || 0;
        const key = item.fil_dest || "Não especificado";
        if (!totals.pieData[key]) totals.pieData[key] = 0;
        totals.pieData[key] += item.valor_bruto || 0;
        return totals;
      },
      { valorBruto: 0, valorMercadoria: 0, pieData: {} }
    );

    const barData = Object.entries(grouped.pieData).map(([key, value]) => ({
      name: key,
      value,
    }));

    const percentages = barData.map(({ name, value }) => ({
      name,
      percent: grouped.valorBruto > 0 ? (value / grouped.valorBruto) * 100 : 0,
    }));

    return {
      valorBruto: grouped.valorBruto,
      valorMercadoria: grouped.valorMercadoria,
      barData,
      percentages,
    };
  };

  const totalsEncerrado = totalsByStatus("Encerrado");

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
            <Row>
              <Col md="4">
                <StyledSelect
                  isMulti
                  options={tomadorOptions}
                  placeholder="Selecione os tomadores..."
                  onChange={setSelectedTomadores}
                  value={selectedTomadores}
                  style={{ padding: 0 }}
                />
              </Col>
              <Col md="4">
                <StyledSelect
                  isMulti
                  options={monthOptions}
                  placeholder="Selecione os meses..."
                  onChange={setSelectedMonths}
                  value={selectedMonths}
                />
              </Col>
            </Row>

            <Row style={{ marginTop: 40 }}>
              <Col md="4">
                <SummaryBox
                  title="Concluídos"
                  icon={MdDoneOutline}
                  bgColor="rgba(0, 255, 127, 0.35)"
                  data={{
                    valorBruto: totalsEncerrado.valorBruto,
                    valorMercadoria: totalsEncerrado.valorMercadoria,
                  }}
                  documentData={filteredData.filter(
                    (item) => item.status === "Encerrado"
                  )}
                />
              </Col>
              <Col md="8">
                <FilialChart
                  barData={totalsEncerrado.barData}
                  percentages={totalsEncerrado.percentages}
                />
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <Box>
                  <h5>Toneladas Carregadas por Dia</h5>
                  <LineChartToneladas
                    data={filteredData}
                    selectedTomadores={selectedTomadores.map((t) => t.value)}
                    selectedMonths={selectedMonths.map((m) => m.value)}
                  />
                </Box>
              </Col>
            </Row>

            <Row>
              <Col md="6">
                <TopTomadores data={groupedByTomador} />
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
                <TopTomadoresQuantidade data={filteredData} />
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default OperacaoFechamento;
