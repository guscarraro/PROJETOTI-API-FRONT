import React, { useEffect, useState } from "react";
import Select from "react-select"; // Importa react-select
import ChartMotoristas from "./ChartMotoristas";
import ChartClientes from "./ChartClientes";
import ChartOcorrencias from "./ChartOcorrencias";
import LineOcorrenDias from "./LineOcorrenDias";
import apiLocal from "../../../services/apiLocal";
import { Box, CardStyle } from "./style";
import {
  FaChartLine,
  FaClock,
  FaDollarSign,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import { Button, Col, FormGroup, Input, Label, Row } from "reactstrap";
import ChartEscadaClientes from "./ChartEscadaClientes";
import ModalNaoCobranca from "./ModalNaocobranca";
import ModalNaoEntregue from "./ModalNaoEntregue";
import ChartDestinatarios from "./ChartDestinatarios";
import LoadingDots from "../../../components/Loading";
import NoData from "../../../components/NoData";
import ModalCteCobrado from "./ModalCteCobrados";

const Dashboard = () => {
  const [motoristasData, setMotoristasData] = useState([]);
  const [clientesData, setClientesData] = useState([]);
  const [ocorrenciasTipoData, setOcorrenciasTipoData] = useState([]);
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);
  const [destinatariosData, setDestinatariosData] = useState([]);

  const [qtdOcorrenciasAbertas, setQtdOcorrenciasAbertas] = useState(0);
  const [tempoMedioEntrega, setTempoMedioEntrega] = useState(0);
  const [mediaOcorrenciasPorDia, setMediaOcorrenciasPorDia] = useState(0);

  const [qtdOcorrenciasSemCobranca, setQtdOcorrenciasSemCobranca] = useState(0);
  const [qtdOcorrenciasNaoEntregues, setQtdOcorrenciasNaoEntregues] =
    useState(0);
  const [ocorrenciasSemCobranca, setOcorrenciasSemCobranca] = useState([]);
  const [qtdOcorrenciasVermelhas, setQtdOcorrenciasVermelhas] = useState(0);

  const [motoristasMap, setMotoristasMap] = useState({});
  const [clientesMap, setClientesMap] = useState({});
  const [destinatariosMap, setDestinatariosMap] = useState({});
  const [showModalNaoCobranca, setShowModalNaoCobranca] = useState(false);
  const [showModalCteCobrado, setShowModalCteCobrado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qtdCtesCobrados, setQtdCtesCobrados] = useState(0);
// no topo do Dashboard
const [ocorrenciasForaAcordo, setOcorrenciasForaAcordo] = useState([]);

  // Filtros
  const [motoristas, setMotoristas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);

  const [selectedMotoristas, setSelectedMotoristas] = useState([]);
  const [selectedClientes, setSelectedClientes] = useState([]);
  const [selectedDestinos, setSelectedDestinos] = useState([]);
  const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0]; // Primeiro dia do mês no formato YYYY-MM-DD
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0]; // Último dia do mês no formato YYYY-MM-DD
    return { firstDay, lastDay };
  };

  const { firstDay, lastDay } = getDefaultDates();

  const [dtInicio, setDtInicio] = useState(firstDay); // Inicializa com o primeiro dia do mês
  const [dtFinal, setDtFinal] = useState(lastDay);

  const handleOpenModalNaoCobranca = () => setShowModalNaoCobranca(true);
  const handleCloseModalNaoCobranca = () => setShowModalNaoCobranca(false);

  const [showModalNaoEntregue, setShowModalNaoEntregue] = useState(false);

  const handleOpenModalCteCobrado = () => setShowModalCteCobrado(true);
  const handleCloseModalCteCobrado = () => setShowModalCteCobrado(false);

  const handleOpenModalNaoEntregue = () => setShowModalNaoEntregue(true);
  const handleCloseModalNaoEntregue = () => setShowModalNaoEntregue(false);

  useEffect(() => {
    const filters = {
      dtInicio: firstDay,
      dtFinal: lastDay,
      motoristas: [],
      clientes: [],
      destinos: [],
    };
    fetchDashboardData(filters); // Busca os dados com os filtros iniciais
  }, []);
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const motoristasResp = await apiLocal.getMotoristas();
        const clientesResp = await apiLocal.getClientes();
        const destinosResp = await apiLocal.getDestinos();

        setMotoristas(
          motoristasResp.data.map((item) => ({
            value: item.id,
            label: item.nome,
          }))
        );
        setClientes(
          clientesResp.data.map((item) => ({
            value: item.id,
            label: `${item.nome}`,
            hr_permanencia: item.hr_perm, // <-- campo correto
            tde: item.tde,
            valor_permanencia: item.valor_permanencia,
          }))
        );

        setDestinos(
          destinosResp.data.map((item) => ({
            value: item.id,
            label: `${item.nome} - ${item.cidade || "Sem cidade"}`,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar dados para os filtros", error);
      }
    };

    fetchFilters();
  }, []);

 const fetchDashboardData = async (filters = {}) => {
  setIsLoading(true);
  try {
    // 1) Ocorrências (com filtros)
    const respOcorrencias = await apiLocal.getOcorrenciasFiltradas(filters);
    const ocorrencias = Array.isArray(respOcorrencias.data) ? respOcorrencias.data : [];
    setTodasOcorrencias(ocorrencias);

    // Se não tiver dados, zera e sai
    if (ocorrencias.length === 0) {
      setMotoristasData([]);
      setClientesData([]);
      setOcorrenciasTipoData([]);
      setDestinatariosData([]);
      setQtdOcorrenciasAbertas(0);
      setTempoMedioEntrega(0);
      setMediaOcorrenciasPorDia(0);
      setQtdOcorrenciasSemCobranca(0);
      setQtdOcorrenciasNaoEntregues(0);
      setOcorrenciasSemCobranca([]);
      setQtdOcorrenciasVermelhas(0);
      setQtdCtesCobrados(0);
      setOcorrenciasForaAcordo([]);
      return;
    }

    // 2) Carregar catálogos em paralelo
    const [respMotoristas, respClientes, respTipos, respDestinos] = await Promise.all([
      apiLocal.getMotoristas(),
      apiLocal.getClientes(),
      apiLocal.getNomesOcorrencias(),
      apiLocal.getDestinos(),
    ]);

    const motoristasList = respMotoristas.data || [];
    const clientesList   = respClientes.data   || [];
    const tiposList      = respTipos.data      || [];
    const destinosList   = respDestinos.data   || [];

    // 3) Maps (id -> nome/label)
    const tempMotoristasMap = {};
    motoristasList.forEach((m) => (tempMotoristasMap[m.id] = m.nome));
    setMotoristasMap(tempMotoristasMap);

    const tempClientesMap = {};
    clientesList.forEach((c) => (tempClientesMap[c.id] = c.nome));
    setClientesMap(tempClientesMap);

    const tempDestinatariosMap = {};
    destinosList.forEach((d) => {
      tempDestinatariosMap[d.id] = d.cidade ? `${d.nome} - ${d.cidade}` : d.nome;
    });
    setDestinatariosMap(tempDestinatariosMap);

    // === Helpers (iguais aos usados no modal) ===
    const parseHorasPermitidas = (str) => {
      if (!str) return 0;
      const [h, m] = String(str).split(":").map(Number);
      return (h || 0) + (m || 0) / 60;
    };

    const calcularTempoPermanencia = (chegada, saida, ocorren) => {
      const chegadaDate = new Date(chegada);
      const saidaDate   = new Date(saida);
      const ocorrenDate = new Date(ocorren);
      if (!ocorrenDate || !saidaDate || ocorrenDate > saidaDate)
        return { horas: 0, minutos: 0, formatado: "Indisponível" };

      const diffMs  = saidaDate - ocorrenDate;
      const diffMin = Math.floor(diffMs / 60000);
      const horas   = Math.floor(diffMin / 60);
      const minutos = diffMin % 60;
      return { horas, minutos, formatado: `${horas}h ${minutos}min` };
    };

    const calcularValorCobranca = (clienteInfo, tempoReal) => {
      const tde = (clienteInfo?.tde || "").toString().toUpperCase() === "SIM";
      // aceita hr_perm (backend) ou hr_permanencia (alguns lugares do front)
      const hrPermitida = parseHorasPermitidas(
        clienteInfo?.hr_perm ?? clienteInfo?.hr_permanencia
      );
      const valorHora = Number(clienteInfo?.valor_permanencia || 0);
      const tempoTotalHoras = tempoReal.horas + tempoReal.minutos / 60;

      if (tempoReal.formatado === "Indisponível" || !hrPermitida) {
        return { excedente: 0, valorCobrado: 0, dentroDoPrazo: true };
      }

      const excedente = tempoTotalHoras - hrPermitida;
      const dentroDoPrazo = excedente <= 0 || tde;

      return {
        excedente: excedente > 0 ? excedente : 0,
        valorCobrado: excedente > 0 ? excedente * valorHora : 0,
        dentroDoPrazo,
      };
    };

    // Config do cliente por ID para cálculo
    const clienteCfgById = {};
    (clientesList || []).forEach((c) => {
      clienteCfgById[c.id] = {
        nome: c.nome,
        hr_perm: c.hr_perm ?? c.hr_permanencia,
        tde: c.tde,
        valor_permanencia: c.valor_permanencia,
      };
    });

    // 4) Métricas específicas
    // Base: resolvido + sem cobrança adicional
    const ocorrenciasSemCobrancaData = ocorrencias.filter(
      (oc) => oc.status === "Resolvido" && oc.cobranca_adicional === "N"
    );
    setQtdOcorrenciasSemCobranca(ocorrenciasSemCobrancaData.length);
    setOcorrenciasSemCobranca(ocorrenciasSemCobrancaData);

    // Fora do acordado (mesma regra do modal)
    const foraAcordo = ocorrenciasSemCobrancaData.filter((item) => {
      const cfg = clienteCfgById[item.cliente_id] || {};
      const permanencia = calcularTempoPermanencia(
        item.horario_chegada,
        item.horario_saida,
        item.datainclusao
      );
      const cobranca = calcularValorCobranca(cfg, permanencia);
      return !cobranca.dentroDoPrazo && cobranca.excedente > 0;
    });
    setOcorrenciasForaAcordo(foraAcordo);
    setQtdOcorrenciasVermelhas(foraAcordo.length); // << agora o card bate com o modal

    const ctesCobrados = ocorrencias.filter(
      (oc) => oc.cobranca_adicional === "S" && oc.cte_gerado
    ).length;
    setQtdCtesCobrados(ctesCobrados);

    const ocorrenciasNaoEntregues = ocorrencias.filter((oc) => oc.status === "Não entregue");
    setQtdOcorrenciasNaoEntregues(ocorrenciasNaoEntregues.length);

    // 5) Motoristas (gráfico)
    const motoristasCountMap = {};
    ocorrencias.forEach((oc) => {
      const mId = oc.motorista_id;
      if (!motoristasCountMap[mId]) motoristasCountMap[mId] = 0;
      motoristasCountMap[mId]++;
    });

    const motoristasDataFinal = motoristasList.map((m) => {
      const details = ocorrencias
        .filter((oc) => oc.motorista_id === m.id)
        .map((oc) => ({
          NF: oc.nf,
          cliente: tempClientesMap[oc.cliente_id] || "Desconhecido",
          tipo: tiposList.find((t) => t.id === oc.tipoocorrencia_id)?.nome || "Desconhecido",
          data: new Date(oc.datainclusao).toLocaleDateString(),
        }));

      return {
        id: m.id,
        nome: m.nome,
        total: motoristasCountMap[m.id] || 0,
        details,
      };
    });
    setMotoristasData(motoristasDataFinal);

    // 6) Destinatários (gráfico)
    const destinatariosDataFinal = destinosList.map((d) => {
      const ocorrenciasDestino = ocorrencias.filter((oc) => oc.destino_id === d.id);
      const details = ocorrenciasDestino.map((oc) => ({
        NF: oc.nf,
        motorista: tempMotoristasMap[oc.motorista_id] || "Desconhecido",
        cliente: tempClientesMap[oc.cliente_id] || "Desconhecido",
        tipo: tiposList.find((t) => t.id === oc.tipoocorrencia_id)?.nome || "Desconhecido",
        data: new Date(oc.datainclusao).toLocaleDateString(),
      }));

      return {
        id: d.id,
        nome: d.nome,
        cidade: d.cidade,
        total: ocorrenciasDestino.length,
        details,
      };
    });
    setDestinatariosData(destinatariosDataFinal);

    // 7) Clientes (gráficos)
    const clientesDataFinal = clientesList.map((c) => {
      const ocorrenciasCliente = ocorrencias.filter((oc) => oc.cliente_id === c.id);
      const details = ocorrenciasCliente.map((oc) => ({
        NF: oc.nf,
        motorista: tempMotoristasMap[oc.motorista_id] || "Desconhecido",
        tipo: tiposList.find((t) => t.id === oc.tipoocorrencia_id)?.nome || "Desconhecido",
        data: new Date(oc.datainclusao).toLocaleDateString(),
      }));

      return {
        id: c.id,
        nome: c.nome,
        quantidade: ocorrenciasCliente.length,
        details,
      };
    });
    setClientesData(clientesDataFinal);

    // 8) Ocorrências por tipo
    const tipoCountMap = {};
    const tipoDetailsMap = {};
    ocorrencias.forEach((oc) => {
      const tId = oc.tipoocorrencia_id;
      if (!tipoCountMap[tId]) {
        tipoCountMap[tId] = 0;
        tipoDetailsMap[tId] = [];
      }
      tipoCountMap[tId]++;
      tipoDetailsMap[tId].push({
        NF: oc.nf,
        motorista: tempMotoristasMap[oc.motorista_id] || "Desconhecido",
        cliente: tempClientesMap[oc.cliente_id] || "Desconhecido",
      });
    });

    const ocorrenciasTipoFinal = (tiposList || [])
      .map((t) => ({
        nome: t.nome,
        quantidade: tipoCountMap[t.id] || 0,
        details: tipoDetailsMap[t.id] || [],
      }))
      .filter((item) => item.quantidade !== 0);
    setOcorrenciasTipoData(ocorrenciasTipoFinal);

    // 9) Métricas finais
    const pendentes = ocorrencias.filter((oc) => oc.status === "Pendente");
    setQtdOcorrenciasAbertas(pendentes.length);

    const resolvidas = ocorrencias.filter((oc) => oc.status === "Resolvido");
    if (resolvidas.length > 0) {
      let somaTempos = 0;
      resolvidas.forEach((oc) => {
        const horaChegada = new Date(oc.horario_chegada);
        const horaSaida = oc.horario_saida ? new Date(oc.horario_saida) : horaChegada;
        somaTempos += (horaSaida - horaChegada);
      });
      const mediaMs = somaTempos / resolvidas.length;
      setTempoMedioEntrega(Math.floor(mediaMs / 60000));
    } else {
      setTempoMedioEntrega(0);
    }

    if (ocorrencias.length > 0) {
      const distinctDays = new Set(
        ocorrencias.map((oc) => new Date(oc.datainclusao).toISOString().split("T")[0])
      );
      const totalDays = distinctDays.size || 1;
      setMediaOcorrenciasPorDia((ocorrencias.length / totalDays).toFixed(0));
    } else {
      setMediaOcorrenciasPorDia(0);
    }
  } catch (error) {
    console.error("Erro ao buscar dados para o dashboard", error);
  } finally {
    setIsLoading(false);
  }
};

const handleApplyFilters = () => {
  const filters = {
    dtInicio,
    dtFinal,
    motoristas: selectedMotoristas.map((m) => m.value),
    clientes: selectedClientes.map((c) => c.value),
    destinos: selectedDestinos.map((d) => d.value),
  };
  fetchDashboardData(filters);
};
console.log(todasOcorrencias)

return (
  <Row
  style={{
    display: "flex",
    flexDirection: "column",
        gap: 20,
        margin: 20,
        width: "100%",
      }}
    >
      <Row className="mb-4">
        {/* Campo de Data de Início */}
        <Col md={1}>
          <FormGroup>
            <Label for="dtInicio">Data Início</Label>
            <Input
              type="date"
              id="dtInicio"
              value={dtInicio}
              onChange={(e) => setDtInicio(e.target.value)}
            />
          </FormGroup>
        </Col>

        {/* Campo de Data Final */}
        <Col md={1}>
          <FormGroup>
            <Label for="dtFinal">Data Final</Label>
            <Input
              type="date"
              id="dtFinal"
              value={dtFinal}
              onChange={(e) => setDtFinal(e.target.value)}
            />
          </FormGroup>
        </Col>

        {/* Multiselect para Motoristas */}
        <Col md={2}>
          <FormGroup>
            <Label for="motoristas">Motoristas</Label>
            <Select
              id="motoristas"
              options={motoristas}
              isMulti
              value={selectedMotoristas}
              onChange={setSelectedMotoristas}
              placeholder="Selecione motoristas"
              styles={{
                option: (provided) => ({
                  ...provided,
                  color: "black", // Define a cor do texto como preto
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "black", // Texto selecionado preto
                }),
                multiValue: (provided) => ({
                  ...provided,
                  color: "black", // Texto em seleções múltiplas preto
                }),
              }}
            />
          </FormGroup>
        </Col>

        {/* Multiselect para Clientes */}
        <Col md={3}>
          <FormGroup>
            <Label for="clientes">Clientes</Label>
            <Select
              id="clientes"
              options={clientes}
              isMulti
              value={selectedClientes}
              onChange={setSelectedClientes}
              placeholder="Selecione clientes"
              styles={{
                option: (provided) => ({
                  ...provided,
                  color: "black", // Define a cor do texto como preto
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "black", // Texto selecionado preto
                }),
                multiValue: (provided) => ({
                  ...provided,
                  color: "black", // Texto em seleções múltiplas preto
                }),
              }}
            />
          </FormGroup>
        </Col>

        {/* Multiselect para Destinos */}
        <Col md={3}>
          <FormGroup>
            <Label for="destinos">Destinos</Label>
            <Select
              id="destinos"
              options={destinos}
              isMulti
              value={selectedDestinos}
              onChange={setSelectedDestinos}
              placeholder="Selecione destinos"
              styles={{
                option: (provided) => ({
                  ...provided,
                  color: "black", // Define a cor do texto como preto
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "black", // Texto selecionado preto
                }),
                multiValue: (provided) => ({
                  ...provided,
                  color: "black", // Texto em seleções múltiplas preto
                }),
              }}
            />
          </FormGroup>
        </Col>

        {/* Botão de Aplicar Filtros */}
        <Col
          md={1}
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            marginTop: "1%",
            justifyContent: "space-between",
          }}
        >
          <Button
            color="primary"
            onClick={handleApplyFilters}
            disabled={isLoading}
            style={{ minHeight: 38, minWidth: 120 }}
          >
            {isLoading ? <LoadingDots /> : "Aplicar Filtros"}
          </Button>
        </Col>
      </Row>
      {/* <h2>Dashboard</h2> */}
    {showModalNaoCobranca && (
  <ModalNaoCobranca
    data={ocorrenciasForaAcordo.map((oc) => {
      const clienteObj = clientes.find((c) => c.value === oc.cliente_id);
      return {
        nf: oc.nf,
        cliente: clienteObj?.label || "Desconhecido",
        cliente_id: oc.cliente_id,
        horario_chegada: oc.horario_chegada,
        horario_saida: oc.horario_saida,
        horario_ocorrencia: oc.datainclusao,
        motorista: motoristasMap[oc.motorista_id] || "Desconhecido",
        hr_permanencia: clienteObj?.hr_permanencia,
        tde: clienteObj?.tde,
        valor_permanencia: clienteObj?.valor_permanencia,
      };
    })}
    clientes={clientes}
    onClose={handleCloseModalNaoCobranca}
    onRefresh={fetchDashboardData}
  />
)}


      {showModalNaoEntregue && (
        <ModalNaoEntregue
          data={todasOcorrencias
            .filter((oc) => oc.status === "Não entregue")
            .map((oc) => ({
              nf: oc.nf,
              cliente: clientesMap[oc.cliente_id] || "Desconhecido",
              cliente_id: oc.cliente_id,
              destinatario: motoristasMap[oc.motorista_id] || "Desconhecido",
              horario_chegada: oc.horario_chegada,
              horario_saida: oc.horario_saida,
              horario_ocorrencia: oc.datainclusao,
              motorista: motoristasMap[oc.motorista_id] || "Desconhecido",
            }))}
          onClose={handleCloseModalNaoEntregue}
        />
      )}
      {showModalCteCobrado && (
        <ModalCteCobrado
          data={todasOcorrencias
            .filter((oc) => oc.cobranca_adicional === "S" && oc.cte_gerado)
            .map((oc) => ({
              nf: oc.nf,
              destinatario: destinatariosMap[oc.destino_id] || "Desconhecido",
              cliente: clientesMap[oc.cliente_id] || "Desconhecido",
              cte: oc.cte_gerado,
              horario_ocorrencia: oc.datainclusao,
              horario_saida: oc.horario_saida,
              motorista: motoristasMap[oc.motorista_id] || "Desconhecido",
            }))}
          onClose={handleCloseModalCteCobrado}
        />
      )}

      {/* Cards de métricas */}
      <Row>
        {/* Card 1: Ocorrências em Aberto */}
        <Col md={3}>
          <CardStyle bgColor="rgba(255, 99, 71, 0.2)" iconColor="#FF6347">
            <h3>
              <FaExclamationTriangle /> Ocorrências em Aberto
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
              {qtdOcorrenciasAbertas > 0 ? qtdOcorrenciasAbertas : "0"}
            </p>
          </CardStyle>
        </Col>

        <Col md={3}>
          <CardStyle bgColor="rgba(30, 144, 255, 0.2)" iconColor="#1E90FF">
            <h3>
              <FaClock /> Tempo Médio de Entrega
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
              {tempoMedioEntrega > 0 ? `${tempoMedioEntrega} min` : "0 min"}
            </p>
          </CardStyle>
        </Col>
        <Col md={3}>
          <CardStyle bgColor="rgba(30, 144, 255, 0.2)" iconColor="#1E90FF">
            <h3>
              <FaClock /> Total de ocorrências
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
              {qtdOcorrenciasSemCobranca > 0
                ? qtdOcorrenciasSemCobranca
                : "Sem Dados para essa informação"}
            </p>
          </CardStyle>
        </Col>

        <Col md={3}>
          <CardStyle bgColor="rgba(154, 205, 50, 0.2)" iconColor="#9ACD32">
            <h3>
              <FaChartLine /> Média Ocorrências/Dia
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
              {mediaOcorrenciasPorDia > 0 ? mediaOcorrenciasPorDia : "0"}
            </p>
          </CardStyle>
        </Col>
        <Col md={4}>
          <CardStyle
            bgColor="rgba(255, 215, 0, 0.2)"
            iconColor="#FFD700"
            onClick={handleOpenModalNaoCobranca}
            style={{ cursor: "pointer" }} // Adicionar cursor para indicar clicável
          >
            <h3>
              <FaDollarSign /> Ocorrências fora do acordado
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
              {qtdOcorrenciasVermelhas > 0
                ? qtdOcorrenciasVermelhas
                : "Sem Dados para essa informação"}
            </p>

            {qtdOcorrenciasSemCobranca > 0 && (
              <p style={{ fontSize: 12, fontStyle: "italic" }}>
                Clique para mais informações
              </p>
            )}
          </CardStyle>
        </Col>
        <Col md={4}>
          <CardStyle
            bgColor="rgba(72, 201, 176, 0.2)"
            iconColor="#48C9B0"
            onClick={handleOpenModalCteCobrado}
            style={{ cursor: "pointer" }} // 🔥 Indica que é clicável
          >
            <h3>
              <FaDollarSign /> CTEs Cobrados/Justificados
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
              {qtdCtesCobrados > 0 ? qtdCtesCobrados : "0"}
            </p>
            {qtdCtesCobrados > 0 && (
              <p style={{ fontSize: 12, fontStyle: "italic" }}>
                Clique para mais informações
              </p>
            )}
          </CardStyle>
        </Col>

        <Col md={4}>
          <CardStyle
            bgColor="rgba(255, 69, 0, 0.2)"
            iconColor="#FF4500"
            onClick={handleOpenModalNaoEntregue}
            style={{ cursor: "pointer" }}
          >
            <h3>
              <FaTimesCircle /> Chamados Não Entregues
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
              {qtdOcorrenciasNaoEntregues > 0
                ? qtdOcorrenciasNaoEntregues
                : "Sem Dados para essa informação"}
            </p>
            {qtdOcorrenciasNaoEntregues > 0 && (
              <p style={{ fontSize: 12, fontStyle: "italic" }}>
                Clique para mais informações
              </p>
            )}
          </CardStyle>
        </Col>
      </Row>

      {/* Graficos */}
      <Row>
        <Col md={7}>
          <Box>
            <h3>Ocorrências resolvidas/Não resolvidas por dia</h3>
            {todasOcorrencias.length > 0 ? (
              <LineOcorrenDias data={todasOcorrencias} />
            ) : (
              <NoData />
            )}
          </Box>
        </Col>

        <Col md={5}>
          <Box>
            <h3>Top 7 Clientes com mais ocorrências</h3>
            {clientesData.length > 0 ? (
              <ChartClientes data={clientesData} />
            ) : (
              <NoData />
            )}
          </Box>
        </Col>
      </Row>

      <Col md={12}>
        <Box>
          <h3>Top 15 Ocorrências por Destinatário</h3>
          {destinatariosData.length > 0 ? (
            <ChartDestinatarios data={destinatariosData} />
          ) : (
            <NoData />
          )}
        </Box>
      </Col>

      <Col md={12}>
        <Box>
          <h3>Ocorrências por Cliente</h3>
          {clientesData.length > 0 ? (
            <ChartEscadaClientes data={clientesData} />
          ) : (
            <NoData />
          )}
        </Box>
      </Col>

      <Col md={12}>
        <Box>
          <h3>Quantidade ocorrências por Tipo</h3>
          {ocorrenciasTipoData.length > 0 ? (
            <ChartOcorrencias data={ocorrenciasTipoData} />
          ) : (
            <NoData />
          )}
        </Box>
      </Col>

      <Col md={12}>
        <Box>
          <h3>Ocorrências por Motorista</h3>
          {motoristasData.length > 0 ? (
            <ChartMotoristas data={motoristasData} />
          ) : (
            <NoData />
          )}
        </Box>
      </Col>
    </Row>
  );
};

export default Dashboard;
