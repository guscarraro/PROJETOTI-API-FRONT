// src/pages/OperacaoFechamento/index.js
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
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

  // Caso já esteja em ISO
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(s)) {
    // Se vier só YYYY-MM, completa com -01
    if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
    return s.slice(0, 10);
  }

  // DD/MM/YYYY ou DD/MM/YY
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    let [, d, mth, y] = m;
    if (y.length === 2) y = (Number(y) > 70 ? "19" : "20") + y;
    const dd = String(d).padStart(2, "0");
    const mm = String(mth).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }

  // Fallback: se vier algo tipo '2025/07/15' etc.
  const guess = s.slice(0, 10);
  if (/^\d{4}-\d{2}$/.test(guess)) return `${guess}-01`;
  return guess;
}


/** Extrai YYYY-MM para filtros */
function getMonthKey(emissaoRaw) {
  const iso = parseEmissaoToISO(emissaoRaw);
  return iso ? iso.slice(0, 7) : "";
}

function toNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  return parseFloat(String(v).replace(",", ".")) || 0;
}

/** Converte/normaliza mantendo TODOS os campos vindos do backend */
function normalizeRow(r) {
  const out = { ...r };
  out.id = r.id ?? out.id ?? null;
  out.emissao = parseEmissaoToISO(r.emissao);
  out.tipo_servico = r.tipo_de_servico ?? r.tipo_servico ?? null;
  out.tomador_servico = r.tomador_do_servico ?? r.tomador_servico ?? null;
  out.valor_bruto = toNum(r.valor_bruto);
  out.peso = toNum(r.peso);
  out.quantidade_volume = toNum(r.quantidade_volume);
  out.valor_mercadoria = toNum(r.valor_de_mercadoria ?? r.valor_mercadoria);
  out.qtd = toNum(r.qtd);
  return out;
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
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // guard para aplicar somente o último fetch finalizado
  const lastReqId = useRef(0);

  /** Busca do banco:
   * - Se não houver meses selecionados → GET /fechamento_op/ (tudo)
   * - Se houver meses → GET /fechamento_op/?mes=YYYY-MM para cada mês (Promise.all)
   * Bloqueia render até finalizar (loading=true).
   */
  const fetchData = useCallback(async (months = []) => {
    const reqId = ++lastReqId.current;
    setLoading(true);
    setError(null);
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
      const normalized = rows.map(normalizeRow);
      if (lastReqId.current === reqId) {
        setData(normalized);
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      if (lastReqId.current === reqId) {
        setData([]);
        setError("Falha ao carregar os dados. Tente novamente.");
      }
    } finally {
      if (lastReqId.current === reqId) setLoading(false);
    }
  }, []);

  // único efeito: roda no mount e sempre que os meses mudarem
  useEffect(() => {
    fetchData(selectedMonths);
  }, [fetchData, selectedMonths]);

  const handleUploaded = async () => {
    await fetchData(selectedMonths);
    setIsModalOpen(false);
  };

  // ======= FILTROS EM MEMÓRIA =======
  const filteredData = useMemo(() => {
    const monthSet = new Set(selectedMonths.map((m) => m.value));
    const tomadorSet = new Set(selectedTomadores.map((t) => t.value));
    const allowedStatuses = new Set(["Encerrado", "Ativo"]);

    return data.filter((item) => {
      const itemMonth = getMonthKey(item.emissao);
      const isMonthSelected = monthSet.size === 0 || monthSet.has(itemMonth);
      const isTomadorSelected =
        tomadorSet.size === 0 || tomadorSet.has(item.tomador_servico);

      return (
        String(item.status).toLowerCase() !== "cancelado" &&
        item.tipo_servico === "Normal" &&
        isMonthSelected &&
        isTomadorSelected
      );
    });
  }, [data, selectedMonths, selectedTomadores]);

  const filteredDataReceita = useMemo(() => {
    const monthSet = new Set(selectedMonths.map((m) => m.value));
    const tomadorSet = new Set(selectedTomadores.map((t) => t.value));
    const allowedStatuses = new Set(["Encerrado", "Ativo"]);
    const out = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const itemMonth = getMonthKey(item.emissao);
      const isMonthSelected = monthSet.size === 0 || monthSet.has(itemMonth);
      const isTomadorSelected =
        tomadorSet.size === 0 || tomadorSet.has(item.tomador_servico);
      if (
String(item.status).toLowerCase() !== "cancelado" &&
(item.tipo_servico === "Normal" || item.tipo_servico === "Complementar") &&
isMonthSelected &&
isTomadorSelected

      ) {
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

  const totalsByNotCancelled = () => {
    let valorBrutoNormal = 0;
    let valorBrutoComplementar = 0;
    let valorMercadoriaTotal = 0;
    const pieData = {};

    const months = new Set(selectedMonths.map((m) => m.value));
    const tomadores = new Set(selectedTomadores.map((t) => t.value));

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const status = String(item.status || "").toLowerCase();
      if (status === "cancelado") continue;

      const itemMonth = getMonthKey(item.emissao);
      const isMonthSelected = months.size === 0 || months.has(itemMonth);
      const isTomadorSelected =
        tomadores.size === 0 || tomadores.has(item.tomador_servico);

      if (!isMonthSelected || !isTomadorSelected) continue;

      if (item.tipo_servico === "Normal") {
        valorBrutoNormal += item.valor_bruto || 0;
        valorMercadoriaTotal += item.valor_mercadoria || 0;
        const key = item.fil_dest || "Não especificado";
        pieData[key] = (pieData[key] || 0) + (item.valor_bruto || 0);
      } else if (item.tipo_servico === "Complementar") {
        valorBrutoComplementar += item.valor_bruto || 0;
      }
    }

    const valorBrutoTotal = valorBrutoNormal + valorBrutoComplementar;
    const barData = [];
    for (const k in pieData) {
      barData.push({ name: k, value: pieData[k] });
    }
    const percentages = [];
    for (let i = 0; i < barData.length; i++) {
      const it = barData[i];
      percentages.push({
        name: it.name,
        percent: valorBrutoNormal > 0 ? (it.value / valorBrutoNormal) * 100 : 0,
      });
    }

    return {
      valorBruto: valorBrutoTotal,
      valorMercadoria: valorMercadoriaTotal,
      barData,
      percentages,
      valorBrutoNormal,
    };
  };

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

  const totalsGeral = totalsByNotCancelled();

  // ========= RENDER: bloqueia tudo até loading=false =========
  if (loading) {
    return (
      <div className="boxGeneral">
        <Container fluid>
          <LoadingContainer>
            <LoadingText>Carregando dados...</LoadingText>
            <Loader />
          </LoadingContainer>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="boxGeneral">
        <Container fluid>
          <LoadingContainer>
            <LoadingText>{error}</LoadingText>
            <Button
              color="primary"
              onClick={() => fetchData(selectedMonths)}
              style={{ marginTop: 12 }}
            >
              Tentar novamente
            </Button>
          </LoadingContainer>
        </Container>
      </div>
    );
  }

  return (
    <div className="boxGeneral">
      <ModalAdd
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploaded={handleUploaded}
      />
      <Container fluid>
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
                valorBruto: totalsGeral.valorBruto,
                valorMercadoria: totalsGeral.valorMercadoria,
              }}
              documentData={filteredData}
            />
          </Col>
          <Col md="8">
            <FilialChart
              barData={totalsGeral.barData}
              percentages={totalsGeral.percentages}
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
                data={filteredDataReceita}
                selectedTomadores={selectedTomadores.map((t) => t.value)}
                selectedMonths={selectedMonths.map((m) => m.value)}
                monthlyGoal={3_500_000}
              />
            </Box>
          </Col>
        </Row>

        <Row>
          <Col md="12">
            <Box style={{ paddingBottom: 10 }}>
              {groupedByTomador.length > 0 ? (
                <>
                  <h5>Receita Top 10 Tomadores</h5>
                  <PizzaTopDezDistrib items={filteredDataReceita} topN={10} />
                </>
              ) : (
                <p>Sem dados disponíveis para o gráfico.</p>
              )}
            </Box>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <TopTomadores data={groupedByTomador} />
          </Col>
          <Col md="6">
            <TopTomadoresQuantidade data={filteredData} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OperacaoFechamento;
