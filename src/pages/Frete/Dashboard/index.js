import React, { useEffect, useState } from "react";
import ChartMotoristas from "./ChartMotoristas";
import ChartClientes from "./ChartClientes";
import ChartOcorrencias from "./ChartOcorrencias";
import LineOcorrenDias from "./LineOcorrenDias";
import apiLocal from "../../../services/apiLocal";
import { Box, CardStyle } from "./style";
import { FaChartLine, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { Col, Row } from "reactstrap";

const Dashboard = () => {
  const [motoristasData, setMotoristasData] = useState([]);
  const [clientesData, setClientesData] = useState([]);
  const [ocorrenciasTipoData, setOcorrenciasTipoData] = useState([]);
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);

  const [qtdOcorrenciasAbertas, setQtdOcorrenciasAbertas] = useState(0);
  const [tempoMedioEntrega, setTempoMedioEntrega] = useState(0);
  const [mediaOcorrenciasPorDia, setMediaOcorrenciasPorDia] = useState(0);

  // Para exibir nomes de motorista/cliente no modal:
  const [motoristasMap, setMotoristasMap] = useState({});
  const [clientesMap, setClientesMap] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Carrega todas as ocorrências
      const respOcorrencias = await apiLocal.getOcorrencias();
      const { data: ocorrencias } = respOcorrencias;
      setTodasOcorrencias(ocorrencias);
  
      // Carrega motoristas
      const respMotoristas = await apiLocal.getMotoristas();
      const motoristasList = respMotoristas.data;
  
      // Carrega clientes
      const respClientes = await apiLocal.getClientes();
      const clientesList = respClientes.data;
  
      // Carrega tipos de ocorrência
      const respTipos = await apiLocal.getNomesOcorrencias();
      const tiposList = respTipos.data;
  
      // Mapear motoristas e clientes
      const tempMotoristasMap = {};
      motoristasList.forEach((m) => (tempMotoristasMap[m.id] = m.nome));
      setMotoristasMap(tempMotoristasMap);
  
      const tempClientesMap = {};
      clientesList.forEach((c) => (tempClientesMap[c.id] = c.nome));
      setClientesMap(tempClientesMap);
  
      // Monta dados para gráfico de Motoristas
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
            tipo: tiposList.find((tipo) => tipo.id === oc.tipoocorrencia_id)?.nome || "Desconhecido",
            data: new Date(oc.datainclusao).toLocaleDateString(),
          }));
  
        return {
          id: m.id,
          nome: m.nome,
          total: motoristasCountMap[m.id] || 0,
          details: details,
        };
      });
  
      setMotoristasData(motoristasDataFinal);
  
      // Monta dados para gráfico de Clientes
      const clientesCountMap = {};
      ocorrencias.forEach((oc) => {
        const cId = oc.cliente_id;
        if (!clientesCountMap[cId]) clientesCountMap[cId] = 0;
        clientesCountMap[cId]++;
      });
  
      const clientesDataFinal = clientesList.map((c) => ({
        id: c.id,
        nome: c.nome,
        valor: clientesCountMap[c.id] || 0,
      }));
      setClientesData(clientesDataFinal);
  
      // Monta dados para gráfico de Ocorrências por Tipo
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
  
      const ocorrenciasTipoFinal = tiposList.map((t) => ({
        nome: t.nome,
        quantidade: tipoCountMap[t.id] || 0,
        details: tipoDetailsMap[t.id] || [],
      })).filter((item) => item.quantidade !== 0);
  
      setOcorrenciasTipoData(ocorrenciasTipoFinal);
  
      // Calcula métricas adicionais
      const pendentes = ocorrencias.filter((oc) => oc.status === "Pendente");
      setQtdOcorrenciasAbertas(pendentes.length);
  
      const resolvidas = ocorrencias.filter((oc) => oc.status === "Resolvido");
      if (resolvidas.length > 0) {
        let somaTempos = 0;
        resolvidas.forEach((oc) => {
          const horaChegada = new Date(oc.horario_chegada);
          const horaSaida = oc.horario_saida
            ? new Date(oc.horario_saida)
            : horaChegada;
          somaTempos += horaSaida - horaChegada;
        });
        const mediaMs = somaTempos / resolvidas.length;
        setTempoMedioEntrega(Math.floor(mediaMs / 60000)); // em minutos
      } else {
        setTempoMedioEntrega(0);
      }
  
      if (ocorrencias.length > 0) {
        const distinctDays = new Set();
        ocorrencias.forEach((oc) => {
          const dayString = new Date(oc.datainclusao).toISOString().split("T")[0];
          distinctDays.add(dayString);
        });
  
        const totalDays = distinctDays.size || 1;
        setMediaOcorrenciasPorDia((ocorrencias.length / totalDays).toFixed(0));
      } else {
        setMediaOcorrenciasPorDia(0);
      }
    } catch (error) {
      console.error("Erro ao buscar dados para o dashboard", error);
    }
  };
  

  return (
    <Row style={{ display: "flex", flexDirection: "column", gap: 20, margin: 20 }}>
      {/* <h2>Dashboard</h2> */}

      {/* Cards de métricas */}
      <Row >
        {/* Card 1: Ocorrências em Aberto */}
        <Col  md={4}>
        <CardStyle bgColor="rgba(255, 99, 71, 0.2)" iconColor="#FF6347">
          {/* Exemplo: ícone de atenção */}
          <h3>
            <FaExclamationTriangle /> Ocorrências em Aberto
          </h3>
          <p style={{ fontSize: 28 }}>{qtdOcorrenciasAbertas}</p>
        </CardStyle>
        </Col>
        <Col  md={4}>
        {/* Card 2: Tempo Médio de Entrega */}
        <CardStyle bgColor="rgba(30, 144, 255, 0.2)" iconColor="#1E90FF">
          {/* Exemplo: ícone de relógio */}
          <h3>
            <FaClock /> Tempo Médio de Entrega
          </h3>
          <p style={{ fontSize: 28 }}>{tempoMedioEntrega} min</p>
        </CardStyle>
        </Col>
        {/* Card 3: Média Ocorrências/Dia */}
        <Col  md={4}>
        <CardStyle bgColor="rgba(154, 205, 50, 0.2)" iconColor="#9ACD32">
          {/* Exemplo: ícone de gráfico */}
          <h3>
            <FaChartLine /> Média Ocorrências/Dia
          </h3>
          <p style={{ fontSize: 28 }}>{mediaOcorrenciasPorDia}</p>
        </CardStyle>
        </Col>
      </Row>

      {/* Graficos */}
      <Col  md={12}>
        <Box >
          <h3>Ocorrências por Motorista</h3>
          <ChartMotoristas data={motoristasData} />
        </Box>
        </Col>
        <Row>
        <Col  md={7}>
        <Box >
          <h3>Ocorrências resolvidas/Não resolvidas por dia</h3>
          <LineOcorrenDias data={todasOcorrencias} />
        </Box>
        </Col>
        <Col  md={5}>
        <Box >
          <h3>Top 7 Clientes com mais ocorrências</h3>
          <ChartClientes data={clientesData} />
        </Box>
        </Col>
        </Row>
      

      {/* Gráfico de Escadas por Tipo de Ocorrência */}
      <Col  md={12}>
      <Box >
        <h3>Quantidade ocorrências por Tipo</h3>
        <ChartOcorrencias data={ocorrenciasTipoData} />
      </Box>
      </Col>
    </Row>
  );
};



export default Dashboard;
