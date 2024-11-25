import React, { useState, useEffect } from "react";
import { FaFolder, FaTruck, FaBoxOpen, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import { ContainerGeral, Card, Header, Etapas, LinhaCompleta, Etapa, IconWrapper, Box, LinhaCompletaBranca } from "./styles";
import { Col, Row } from "reactstrap";
import dadosFicticios from "./db/dadosFicticios";

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

const agruparPorRemetenteENF = (dados) => {
  const agrupado = {};
  dados.forEach((item) => {
    const chave = `${item.remetente}-${item.nf}`;
    if (!agrupado[chave]) {
      agrupado[chave] = {
        remetente: item.remetente,
        nf: item.nf,
        documentos: new Set(),
        etapas: [],
        dataXml: false,
        dataEmissaoCTE: false,
        filial: item.filial
      };
    }
    agrupado[chave].documentos.add(item.documento);
    agrupado[chave].etapas.push(item);

    if (item.data_xml) agrupado[chave].dataXml = true;
    if (item.data_emissao_cte) agrupado[chave].dataEmissaoCTE = true;
  });
  return Object.values(agrupado).map((item) => ({
    ...item,
    documentos: Array.from(item.documentos),
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
    const dadosAgrupados = agruparPorRemetenteENF(dadosFicticios);
    setDados(dadosAgrupados);

    let totalXml = 0,
      totalSeparacao = 0,
      totalEntrega = 0,
      countXml = 0,
      countSeparacao = 0,
      countEntrega = 0;

    dadosFicticios.forEach((dado) => {
      const diffXml = calcularDiferenca(dado.data_xml, dado.data_emissao_cte);
      if (diffXml) {
        totalXml += diffXml.horas * 60 + diffXml.minutos;
        countXml++;
      }

      const diffSeparacao = calcularDiferenca(dado.data_emissao_cte, dado.data);
      if (diffSeparacao) {
        totalSeparacao += diffSeparacao.horas * 60 + diffSeparacao.minutos;
        countSeparacao++;
      }

      const separacao = dadosFicticios.find((d) => d.tipo === "MERCADORIA SEPARADA/CONFERIDA")?.data;
      const entrega = dadosFicticios.find((d) => d.tipo === "ENTREGA CONFIRMADA")?.data;

      if (separacao && entrega) {
        const diffEntrega = calcularDiferenca(separacao, entrega);
        if (diffEntrega) {
          totalEntrega += diffEntrega.horas * 60 + diffEntrega.minutos;
          countEntrega++;
        }
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
  }, []);
  return (
    <ContainerGeral>
      <h1>Ciclo do Pedido</h1>
      <Row style={{ width: "100%", marginBottom: "10px" }}>
        <Col md="4">
          <Box style={{background:'rgba(255, 215, 0, 0.35)'}}>
            <h5 >Média geral Emissão de CTE</h5>
            <FaFileAlt style={{fontSize:30 }}/>
            <h2 >
              {mediaTempos.xml.horas}h {mediaTempos.xml.minutos}m
            </h2>
          </Box>
        </Col>
        <Col md="4">
          <Box style={{background:'rgba(255, 165, 0, 0.35)'}}>
            <h5 >Média geral Separação/Conferência</h5>
            <FaBoxOpen style={{fontSize:30}}/>
            <h2 >
              {mediaTempos.separacao.horas}h {mediaTempos.separacao.minutos}m
            </h2>
          </Box>
        </Col>
        <Col md="4">
          <Box style={{background:'rgba(0, 255, 127, 0.35)'}}>
            <h5 >Média geral Entrega</h5>
            <FaTruck style={{fontSize:30}}/>
            <h2 >
              {mediaTempos.entrega.horas}h {mediaTempos.entrega.minutos}m
            </h2>
          </Box>
        </Col>
      </Row>

      {dados.map((pedido, index) => {
        const etapasConcluidas = etapas.filter((etapa) => {
          if (etapa.tipo === "DATA XML IMPORTADO" && pedido.dataXml) return true;
          if (etapa.tipo === "EMISSAO DE CTE" && pedido.dataEmissaoCTE) return true;
          if (etapa.tipo === "ENTREGA CONFIRMADA" && pedido.etapas.find((d) => d.tipo === "ENTREGA CONFIRMADA")) return true;
          if (pedido.etapas.find((d) => d.tipo === etapa.tipo)) return true;
          return false;
        }).length;

        const progressoReal = (etapasConcluidas / etapas.length) * 100;

        return (
          <Row style={{ width: "100%" }} key={index}>
            <Col md="12">
              <Card>
                <Header>
                  <div>
                    <h5>{pedido.remetente}</h5>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                      <h5>NF: </h5>
                      <p>{pedido.nf}</p>
                      <h5>CTE: </h5>
                      <p>{pedido.documentos.join(", ")}</p>
                    </div>
                  </div>
                </Header>
                <Etapas>
                  <LinhaCompletaBranca></LinhaCompletaBranca>
                  <LinhaCompleta progresso={progressoReal} duracao={1} />
                  {etapas.map((etapa, idx) => {
                    const etapaConcluida =
                      (etapa.tipo === "DATA XML IMPORTADO" && pedido.dataXml) ||
                      (etapa.tipo === "EMISSAO DE CTE" && pedido.dataEmissaoCTE) ||
                      (etapa.tipo === "ENTREGA CONFIRMADA" && pedido.etapas.find((d) => d.tipo === "ENTREGA CONFIRMADA")) ||
                      pedido.etapas.find((d) => d.tipo === etapa.tipo);

                    return (
                      <Etapa key={idx}>
                        <IconWrapper concluido={etapaConcluida}>{etapa.icon}</IconWrapper>
                        <p>{etapa.label}</p>
                        <small>
                          {formatarData(
                            etapa.tipo === "DATA XML IMPORTADO"
                              ? pedido.etapas[0]?.data_xml
                              : etapa.tipo === "EMISSAO DE CTE"
                              ? pedido.etapas[0]?.data_emissao_cte
                              : etapa.tipo === "ENTREGA CONFIRMADA"
                              ? pedido.etapas.find((d) => d.tipo === "ENTREGA CONFIRMADA")?.data
                              : pedido.etapas.find((d) => d.tipo === etapa.tipo)?.data
                          )}
                        </small>
                      </Etapa>
                    );
                  })}
                </Etapas>
              </Card>
            </Col>
          </Row>
        );
      })}
    </ContainerGeral>
  );
}

export default CicloPedido;
