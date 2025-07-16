// EtapaNota/index.js
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
  ETPFRA: [
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
  TRANS: [
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

// Etapas fixas apenas para simulação visual
const etapasFixas = [
  { nome: "ENTRADA DE XML NO SISTEMA", status: "verde", data: "30/06/2025 09:27" },
  { nome: "DOCUMENTO EMITIDO", status: "verde", data: "30/06/2025 09:36" },
  { nome: "MERCADORIA SEPARADA/CONFERIDA", status: "vermelha", data: "01/07/2025 08:20" },
  { nome: "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA", status: "verde", data: "01/07/2025 10:00" },
  { nome: "EM ROTA DE TRANSFERENCIA", status: "verde", data: "02/07/2025 08:30" },
  { nome: "CHEGADA NA BASE/FILIAL", status: "verde", data: "02/07/2025 13:00" },
  { nome: "EM ROTA", status: "verde", data: "03/07/2025 07:40" },
  { nome: "CHEGADA NO LOCAL", status: "verde", data: "03/07/2025 10:15" },
  { nome: "INICIO DE DESCARGA", status: "branca", data: null },
  { nome: "FIM DE DESCARGA", status: "branca", data: null },
];

// Componente principal
const EtapaNota = ({ tipoViagem = "ETPFRA" }) => {
  const etapasDoFluxo = fluxosPorTpVg[tipoViagem] || [];

  // Filtra só as etapas do fluxo com base nas fixas (mock por enquanto)
  const etapasFiltradas = etapasFixas.filter((etapa) =>
    etapasDoFluxo.includes(etapa.nome)
  );

  return (
    <Container>
      {etapasFiltradas.map((etapa, idx) => (
        <LinhaEtapa key={idx}>
          <Bolinha status={etapa.status}>
            {etapa.status === "verde" && <FaCheck size={9} />}
            {etapa.status === "vermelha" && <FaTimes size={9} />}
          </Bolinha>

          {idx < etapasFiltradas.length - 1 && (
            <LinhaVertical status={etapa.status} />
          )}

          <TextoEtapa status={etapa.status}>
            <strong>{etapa.nome}</strong>
            {etapa.data && <small>{etapa.data}</small>}
          </TextoEtapa>
        </LinhaEtapa>
      ))}
    </Container>
  );
};

export default EtapaNota;
