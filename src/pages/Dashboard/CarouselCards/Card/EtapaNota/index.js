// EtapaNota/index.js
import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import {
  Container,
  LinhaEtapa,
  Bolinha,
  LinhaVertical,
  TextoEtapa,
  TextoPrazo, // Adicione isso no seu styles se ainda não tiver
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
  TRFFIL: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA",
    "VIAGEM CRIADA",
    "EM ROTA DE TRANSFERENCIA",
    "CHEGADA NA BASE/FILIAL",
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

let encontrouEtapaConcluida = false;
let bloqueiaPendencias = false;

const etapasRenderizadas = etapas.map((etapa, idx) => {
  let status = "branca";
  let detalhe = null;
  const tipo = etapa.toUpperCase();

  let foiExecutada = false;

  if (tipo === "ENTRADA DE XML NO SISTEMA" && ocorrenciasMap[tipo]) {
    status = "verde";
    detalhe = ocorrenciasMap[tipo];
    foiExecutada = true;
  } else if (tipo === "DOCUMENTO EMITIDO" && cte) {
    status = "verde";
    detalhe = `${cte} - ${dtCTE}`;
    foiExecutada = true;
  } else if (tipo === "VIAGEM CRIADA" && Vg && Vg !== 0) {
    status = "verde";
    detalhe = `${Vg} - ${TpVg}`;
    foiExecutada = true;
  } else if (ocorrenciasMap[tipo]) {
    status = "verde";
    detalhe = ocorrenciasMap[tipo];
    foiExecutada = true;
  }

  return {
    nome: etapa,
    tipo,
    detalhe,
    foiExecutada,
    index: idx,
  };
});

// Descobre o maior índice de etapa executada
const maiorExecutada = Math.max(
  ...etapasRenderizadas
    .map((et, idx) => (et.foiExecutada ? idx : -1))
    .filter((idx) => idx !== -1)
);

// Marca os status finais com base nos critérios
let encontrouPrimeiraFalha = false;
const etapasComStatus = etapasRenderizadas.map((etapa, idx) => {
  if (etapa.foiExecutada) {
    return { ...etapa, status: "verde" };
  }

  if (idx < maiorExecutada) {
    // está entre etapas que já passaram, mas não foi feita
    return { ...etapa, status: "vermelha" };
  } else {
    // está no futuro (ainda pendente)
    return { ...etapa, status: "branca" };
  }
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

          {idx < etapasRenderizadas.length - 1 && (
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
