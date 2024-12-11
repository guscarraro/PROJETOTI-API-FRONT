import React, { useState, useEffect } from "react";
import { FaFolder, FaTruck, FaBoxOpen, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import {
  ContainerGeral,
  Card,
  Header,
  Etapas,
  LinhaCompleta,
  Etapa,
  IconWrapper,
  Box,
  LinhaCompletaBranca,
} from "./styles";
import { Col, Row } from "reactstrap";
import { fetchOcorrencias } from "../../services/api"; // API criada para consumir as ocorrências

function formatarData(data) {
  if (!data) return "-";
  const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(data).toLocaleString("pt-BR", options);
}

function calcularDiferenca(dataInicio, dataFim) {
  if (!dataInicio || !dataFim) return null;
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffMs = fim - inicio;
  if (diffMs < 0) return null;
  const diffMin = Math.floor(diffMs / 60000);
  const horas = Math.floor(diffMin / 60);
  const minutos = diffMin % 60;
  return { horas, minutos };
}

const agruparPorDocTransporte = (dados) => {
  const agrupado = {};
  dados.forEach((item) => {
    const chave = item.docTransporte;
    if (!agrupado[chave]) {
      agrupado[chave] = {
        remetente: item.remetente,
        docTransporte: item.docTransporte,
        notasFiscais: new Set(),
        etapas: [],
      };
    }
    agrupado[chave].notasFiscais.add(item.notaFiscal);
    agrupado[chave].etapas.push(item);
  });

  return Object.values(agrupado).map((item) => ({
    ...item,
    notasFiscais: Array.from(item.notasFiscais),
  }));
};

const etapas = [
  { tipo: "DATA XML IMPORTADO", label: "Data XML", icon: <FaFolder /> },
  { tipo: "EMISSAO DE CTE", label: "Emissão CTE", icon: <FaFileAlt /> },
  { tipo: "MERCADORIA SEPARADA/CONFERIDA", label: "Separação/Conferência", icon: <FaBoxOpen /> },
  { tipo: "EM ROTA", label: "Em Rota", icon: <FaTruck /> },
  { tipo: "ENTREGA CONFIRMADA", label: "Entrega Confirmada", icon: <FaCheckCircle /> },
];

function CicloPedido() {
  const [dados, setDados] = useState([]);
  const [mediaTempos, setMediaTempos] = useState({
    xml: { horas: 0, minutos: 0 },
    separacao: { horas: 0, minutos: 0 },
    entrega: { horas: 0, minutos: 0 },
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        const dataInicial = "2024-12-10"; // Ajuste conforme necessário
        const ocorrencias = await fetchOcorrencias(dataInicial);
  
        console.log("Ocorrências carregadas:", ocorrencias);
        const dadosAgrupados = agruparPorDocTransporte(ocorrencias);
        setDados(dadosAgrupados);
  
        calcularMediaTempos(dadosAgrupados);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  
    carregarDados();
  }, []);
  
  

  function calcularMediaTempos(dados) {
    let totalXml = 0,
      totalSeparacao = 0,
      totalEntrega = 0,
      countXml = 0,
      countSeparacao = 0,
      countEntrega = 0;

    dados.forEach((pedido) => {
      const xml = pedido.etapas.find((e) => e.tipo === "DATA XML IMPORTADO")?.data;
      const cte = pedido.etapas.find((e) => e.tipo === "EMISSAO DE CTE")?.data;
      const separacao = pedido.etapas.find((e) => e.tipo === "MERCADORIA SEPARADA/CONFERIDA")?.data;
      const entrega = pedido.etapas.find((e) => e.tipo === "ENTREGA CONFIRMADA")?.data;

      const diffXml = calcularDiferenca(xml, cte);
      if (diffXml) {
        totalXml += diffXml.horas * 60 + diffXml.minutos;
        countXml++;
      }

      const diffSeparacao = calcularDiferenca(cte, separacao);
      if (diffSeparacao) {
        totalSeparacao += diffSeparacao.horas * 60 + diffSeparacao.minutos;
        countSeparacao++;
      }

      const diffEntrega = calcularDiferenca(separacao, entrega);
      if (diffEntrega) {
        totalEntrega += diffEntrega.horas * 60 + diffEntrega.minutos;
        countEntrega++;
      }
    });

    setMediaTempos({
      xml: {
        horas: countXml > 0 ? Math.floor(totalXml / countXml / 60) : 0,
        minutos: countXml > 0 ? Math.floor(totalXml / countXml % 60) : 0,
      },
      separacao: {
        horas: countSeparacao > 0 ? Math.floor(totalSeparacao / countSeparacao / 60) : 0,
        minutos: countSeparacao > 0 ? Math.floor(totalSeparacao / countSeparacao % 60) : 0,
      },
      entrega: {
        horas: countEntrega > 0 ? Math.floor(totalEntrega / countEntrega / 60) : 0,
        minutos: countEntrega > 0 ? Math.floor(totalEntrega % 60) : 0,
      },
    });
  }

  return (
    <ContainerGeral>
      <h1>Ciclo do Pedido</h1>
      <Row style={{ width: "100%", marginBottom: "10px" }}>
        <Col md="4">
          <Box style={{ background: "rgba(255, 215, 0, 0.35)" }}>
            <h5>Média geral Emissão de CTE</h5>
            <FaFileAlt style={{ fontSize: 30 }} />
            <h2>
              {mediaTempos.xml.horas}h {mediaTempos.xml.minutos}m
            </h2>
          </Box>
        </Col>
        <Col md="4">
          <Box style={{ background: "rgba(255, 165, 0, 0.35)" }}>
            <h5>Média geral Separação/Conferência</h5>
            <FaBoxOpen style={{ fontSize: 30 }} />
            <h2>
              {mediaTempos.separacao.horas}h {mediaTempos.separacao.minutos}m
            </h2>
          </Box>
        </Col>
        <Col md="4">
          <Box style={{ background: "rgba(0, 255, 127, 0.35)" }}>
            <h5>Média geral Entrega</h5>
            <FaTruck style={{ fontSize: 30 }} />
            <h2>
              {mediaTempos.entrega.horas}h {mediaTempos.entrega.minutos}m
            </h2>
          </Box>
        </Col>
      </Row>

      {dados.map((pedido, index) => (
        <Row style={{ width: "100%" }} key={index}>
          <Col md="12">
            <Card>
              <Header>
                <div>
                  <h5>{pedido.remetente}</h5>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                    <h5>Notas Fiscais: </h5>
                    <p>{pedido.notasFiscais.join(", ")}</p>
                  </div>
                </div>
              </Header>
              <Etapas>
                <LinhaCompletaBranca></LinhaCompletaBranca>
                <LinhaCompleta progresso={(pedido.etapas.length / etapas.length) * 100} duracao={1} />
                {etapas.map((etapa, idx) => {
                  const etapaConcluida = pedido.etapas.some((e) => e.tipo === etapa.tipo);
                  return (
                    <Etapa key={idx}>
                      <IconWrapper concluido={etapaConcluida}>{etapa.icon}</IconWrapper>
                      <p>{etapa.label}</p>
                      <small>
                        {formatarData(pedido.etapas.find((e) => e.tipo === etapa.tipo)?.data)}
                      </small>
                    </Etapa>
                  );
                })}
              </Etapas>
            </Card>
          </Col>
        </Row>
      ))}
    </ContainerGeral>
  );
}

export default CicloPedido;
