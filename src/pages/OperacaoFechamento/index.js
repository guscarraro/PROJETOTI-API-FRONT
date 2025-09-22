import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { MdDoneOutline } from "react-icons/md";
import { Box, LoadingContainer, Loader, LoadingText } from "./styles";
import PizzaTopDezDistrib from "./PizzaTopDezDistrib";
import SummaryBox from "./SummaryBox";
import LineChartToneladas from "./LineChartToneladas";
import { formatTomadorName } from "../../helpers";
import TopTomadores from "./TopTomadores";
import TopTomadoresQuantidade from "./TopTomadoresQuantidade";
import FilialChart from "./FilialChart";
import { StyledSelect } from "../../components/StyledSelect";
import apiLocal from "../../services/apiLocal";
import { useNavigate } from "react-router-dom";
import ModalAdd from "./ModalAdd";
import LineChartReceita from "./LineChartReceita";

/** Normaliza 'emissao' para YYYY-MM-DD, aceitando 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD/MM/YY', etc */
function parseEmissaoToISO(emissaoRaw) {
  if (!emissaoRaw) return null;
  const s = String(emissaoRaw).trim();

  // Já está ISO?
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // Formato brasileiro?
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    let [_, d, mth, y] = m;
    if (y.length === 2) y = (Number(y) > 70 ? "19" : "20") + y; // heurística
    const dd = String(d).padStart(2, "0");
    const mm = String(mth).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }

  // fallback: retorna o que der (mantendo 10 chars)
  return s.slice(0, 10);
}

/** Extrai YYYY-MM para filtros */
function getMonthKey(emissaoRaw) {
  const iso = parseEmissaoToISO(emissaoRaw);
  return iso ? iso.slice(0, 7) : "";
}

/** Converte um registro vindo do back (nomes snake_case) para os nomes usados no front */
function normalizeRow(r) {
  return {
    // campos já usados no front:
    status: r.status ?? null,
    numero: r.numero ?? null,
    tipo: r.tipo ?? null,
    remessa: r.remessa ?? null,
    tipo_servico: r.tipo_de_servico ?? r.tipo_servico ?? null,
    nota_fiscal: r.nota_fiscal ?? null,
    fil_dest: r.fil_dest ?? null,
    emissao: parseEmissaoToISO(r.emissao),
    valor_bruto: r.valor_bruto
      ? Number(String(r.valor_bruto).replace(",", "."))
      : 0,
    destinatario: r.destinatario ?? null,
    tomador_servico: r.tomador_do_servico ?? r.tomador_servico ?? null,
    coletado_em: r.coletado_em ?? null,
    prazo_d: r.prazo_d ?? null,
    peso: r.peso ? Number(String(r.peso).replace(",", ".")) : 0,
    quantidade_volume: r.quantidade_volume
      ? Number(String(r.quantidade_volume).replace(",", "."))
      : 0,
    valor_mercadoria: r.valor_de_mercadoria
      ? Number(String(r.valor_de_mercadoria).replace(",", "."))
      : 0,
    qtd: r.qtd ? Number(String(r.qtd).replace(",", ".")) : 0,
  };
}

const monthOptions = [
  { value: "2024-10", label: "Outubro 2024" },
  { value: "2024-11", label: "Novembro 2024" },
  { value: "2024-12", label: "Dezembro 2024" },
  { value: "2025-01", label: "Janeiro 2025" },
  { value: "2025-02", label: "Fevereiro 2025" },
  { value: "2025-03", label: "Março 2025" },
  { value: "2025-04", label: "Abril 2025" },
  { value: "2025-05", label: "Maio 2025" },
  { value: "2025-06", label: "Junho 2025" },
  { value: "2025-07", label: "Julho 2025" },
  { value: "2025-08", label: "Agosto 2025" },
  { value: "2025-09", label: "Setembro 2025" },
  { value: "2025-10", label: "Outubro 2025" },
  { value: "2025-11", label: "Novembro 2025" },
];

const OperacaoFechamento = () => {
  const [data, setData] = useState([]); // sempre normalizado
  const [loading, setLoading] = useState(true);
  const [selectedTomadores, setSelectedTomadores] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  /** Busca do banco:
   * - Se não houver meses selecionados → GET /fechamento_op/ (tudo)
   * - Se houver meses → faz GET /fechamento_op/?mes=YYYY-MM para cada mês e concatena
   */
  const fetchData = async (months = []) => {
    setLoading(true);
    try {
      let rows = [];
      if (!months || months.length === 0) {
        const resp = await apiLocal.getFechamento(); // GET /fechamento_op/
        rows = Array.isArray(resp.data) ? resp.data : [];
      } else {
        const calls = months.map((m) => apiLocal.getFechamentoPorMes(m.value));
        const responses = await Promise.all(calls);
        rows = responses.flatMap((r) => (Array.isArray(r.data) ? r.data : []));
      }

      // normaliza todos os itens para o shape esperado no front
      const normalized = rows.map(normalizeRow);
      setData(normalized);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // primeira carga (sem filtro de mês → pega geral)
  useEffect(() => {
    fetchData([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // quando o usuário alterar meses, busca de novo
  useEffect(() => {
    fetchData(selectedMonths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonths]);

  const handleUploaded = async () => {
    // ao terminar import, refaz a busca respeitando meses selecionados
    await fetchData(selectedMonths);
    setIsModalOpen(false);
  };

  // ======= FILTROS EM MEMÓRIA =======
  const filteredData = useMemo(() => {
    const monthSet = new Set(selectedMonths.map((m) => m.value));
    const tomadorSet = new Set(selectedTomadores.map((t) => t.value));

    return data.filter((item) => {
      const itemMonth = getMonthKey(item.emissao);
      const isMonthSelected = monthSet.size === 0 || monthSet.has(itemMonth);
      const isTomadorSelected =
        tomadorSet.size === 0 || tomadorSet.has(item.tomador_servico);

      return (
        item.status === "Encerrado" &&
        item.tipo_servico === "Normal" &&
        isMonthSelected &&
        isTomadorSelected
      );
    });
  }, [data, selectedMonths, selectedTomadores]);


  const filteredDataReceita = useMemo(() => {
    const monthSet = new Set(selectedMonths.map((m) => m.value));
    const tomadorSet = new Set(selectedTomadores.map((t) => t.value));
    const out = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const itemMonth = getMonthKey(item.emissao);
      const isMonthSelected = monthSet.size === 0 || monthSet.has(itemMonth);
      const isTomadorSelected =
        tomadorSet.size === 0 || tomadorSet.has(item.tomador_servico);
      if (item.status === "Encerrado" && isMonthSelected && isTomadorSelected) {
        out.push(item);
      }
    }
    return out;
  }, [data, selectedMonths, selectedTomadores]);
  // opções de tomador baseadas nos dados carregados
  const tomadorOptions = useMemo(() => {
    const set = new Set(data.map((i) => i.tomador_servico).filter(Boolean));
    return Array.from(set).map((tomador) => ({
      value: tomador,
      label: formatTomadorName(tomador),
    }));
  }, [data]);

  // Agrupamentos e totais (usando os campos já normalizados)
  const groupByField = (field) => {
    const grouped = {};
    for (let i = 0; i < filteredData.length; i++) {
      const item = filteredData[i];
      const key = item[field] || "—";
      if (!grouped[key]) {
        grouped[key] = { totalPeso: 0, totalQtd: 0 };
      }
      grouped[key].totalPeso += (item.peso || 0) / 1000; // toneladas
      grouped[key].totalQtd += item.qtd || item.quantidade_volume || 0;
    }
    return grouped;
  };

  const groupedByTomador = useMemo(() => {
    return Object.entries(groupByField("tomador_servico"))
      .map(([tomador, values]) => ({
        tomador,
        tomadorFormatado: formatTomadorName(tomador),
        ...values,
      }))
      .sort((a, b) => b.totalPeso - a.totalPeso)
      .slice(0, 10);
  }, [filteredData]);

  const totalsByStatus = (status) => {
    let valorBrutoNormal = 0;
    let valorBrutoComplementar = 0;
    let valorMercadoriaTotal = 0;
    const pieData = {};

    for (const item of data) {
      const itemMonth = getMonthKey(item.emissao);
      const months = new Set(selectedMonths.map((m) => m.value));
      const tomadores = new Set(selectedTomadores.map((t) => t.value));

      const isMonthSelected = months.size === 0 || months.has(itemMonth);
      const isTomadorSelected =
        tomadores.size === 0 || tomadores.has(item.tomador_servico);

      if (item.status === status && isMonthSelected && isTomadorSelected) {
        if (item.tipo_servico === "Normal") {
          valorBrutoNormal += item.valor_bruto || 0;
          valorMercadoriaTotal += item.valor_mercadoria || 0;

          const key = item.fil_dest || "Não especificado";
          pieData[key] = (pieData[key] || 0) + (item.valor_bruto || 0);
        } else if (item.tipo_servico === "Complementar") {
          valorBrutoComplementar += item.valor_bruto || 0;
        }
      }
    }

    const valorBrutoTotal = valorBrutoNormal + valorBrutoComplementar;
    const barData = Object.entries(pieData).map(([name, value]) => ({
      name,
      value,
    }));
    const percentages = barData.map(({ name, value }) => ({
      name,
      percent: valorBrutoNormal > 0 ? (value / valorBrutoNormal) * 100 : 0,
    }));

    return {
      valorBruto: valorBrutoTotal,
      valorMercadoria: valorMercadoriaTotal,
      barData,
      percentages,
      valorBrutoNormal,
    };
  };

  const totalsEncerrado = totalsByStatus("Encerrado");

  return (
    <div className="boxGeneral">
      <ModalAdd
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploaded={handleUploaded}
      />
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
              <Col md="4" style={{ display: "flex", alignItems: "center" }}>
                <Button
                  onClick={() => navigate("/SAC")}
                  style={{ marginBottom: -15, background: "primary" }}
                >
                  Ir para SAC
                </Button>

                <Button
                  color="success"
                  onClick={() => setIsModalOpen(true)}
                  style={{ marginBottom: -15, marginLeft: 10 }}
                >
                  Importar Excel
                </Button>
                <Button
                  color="primary"
                  onClick={() => navigate("/Frete")}
                  style={{ marginBottom: -15, marginLeft: 10 }}
                >
                  Ir para Frete
                </Button>
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
                  documentData={filteredData}
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
              <Col md="12">
                <Box>
                  <h5>Receita diária por mês (com meta)</h5>
                  <LineChartReceita
                     // já vem filtrado por Encerrado  Normal
                    data={filteredDataReceita}
                    selectedTomadores={selectedTomadores.map((t) => t.value)}
                    selectedMonths={selectedMonths.map((m) => m.value)}
                    monthlyGoal={3_500_000} // meta mensal (R$)
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
