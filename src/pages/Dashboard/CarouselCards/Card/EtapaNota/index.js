import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import {
  Container,
  LinhaEtapa,
  Bolinha,
  LinhaVertical,
  TextoEtapa,
} from "./styles";

const fluxosPorTpVg = {
  ETPF: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO",
    "VIAGEM CRIADA",
    "EM ROTA",
    "CHEGADA NO LOCAL",
    "INICIO DE DESCARGA",
    "FIM DE DESCARGA",
  ],
  TRFBAS: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA",
    "VIAGEM CRIADA",
    "EM ROTA DE TRANSFERENCIA",
    "CHEGADA NA BASE",
    "EM ROTA",
    "CHEGADA NO LOCAL",
    "INICIO DE DESCARGA",
    "FIM DE DESCARGA",
  ],
  TRFFIL: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA",
    "VIAGEM CRIADA",
    "EM ROTA DE TRANSFERENCIA",
    "CHEGADA NA FILIAL",
    "MERCADORIA RECEBIDA NA FILIAL",
    "EM ROTA",
    "CHEGADA NO LOCAL",
    "INICIO DE DESCARGA",
    "FIM DE DESCARGA",
  ],
  FRA: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO",
    "VIAGEM CRIADA",
    "EM ROTA",
  ],
};

const EtapaNota = ({
  tipoViagem = "ETPF",
  ocorrencias = [],
  cte,
  dtCTE,
  Vg,
  TpVg,
  prevE,
}) => {
  const etapas = fluxosPorTpVg[tipoViagem] || [];

  const ocorrenciasMap = ocorrencias.reduce((map, o) => {
    map[o.tipo.toUpperCase()] = o.data;
    return map;
  }, {});

  const etapasRenderizadas = etapas.map((etapa, idx) => {
    const tipo = etapa.toUpperCase();
    let foiExecutada = false;
    let detalhe = null;

    if (tipo === "ENTRADA DE XML NO SISTEMA" && ocorrenciasMap[tipo]) {
      foiExecutada = true;
      detalhe = ocorrenciasMap[tipo];
    } else if (tipo === "DOCUMENTO EMITIDO" && cte) {
      foiExecutada = true;
      detalhe = `${cte} - ${dtCTE}`;
    } else if (tipo === "VIAGEM CRIADA" && Vg && Vg !== 0) {
      foiExecutada = true;
      detalhe = `${Vg} - ${TpVg}`;
    } else if (ocorrenciasMap[tipo]) {
      foiExecutada = true;
      detalhe = ocorrenciasMap[tipo];
    }

    return {
      nome: etapa,
      foiExecutada,
      detalhe,
      index: idx,
    };
  });

  const ultimaExecutadaIndex = etapasRenderizadas.reduce(
    (max, etapa) => (etapa.foiExecutada ? etapa.index : max),
    -1
  );

  const etapasComStatus = etapasRenderizadas.map((etapa, idx) => {
    let status = "branca";
    if (etapa.foiExecutada) {
      status = "verde";
    } else if (idx < ultimaExecutadaIndex) {
      status = "vermelha";
    }
    return {
      ...etapa,
      status,
    };
  });

  return (
    <Container>
      {prevE && (
        <p>
          <strong>Previsão de Entrega:</strong> {prevE}
        </p>
      )}

      {etapasComStatus.map((etapa, idx) => (
        <LinhaEtapa key={idx}>
          <Bolinha status={etapa.status}>
            {etapa.status === "verde" && <FaCheck size={9} />}
            {etapa.status === "vermelha" && <FaTimes size={9} />}
          </Bolinha>

          {idx < etapasComStatus.length - 1 && (
            <LinhaVertical status={etapa.status} />
          )}

          <TextoEtapa status={etapa.status}>
            <strong>{etapa.nome}</strong>
            {etapa.detalhe && <small>{etapa.detalhe}</small>}
          </TextoEtapa>
        </LinhaEtapa>
      ))}
    </Container>
  );
};

export default EtapaNota;
