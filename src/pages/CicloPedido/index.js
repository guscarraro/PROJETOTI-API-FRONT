import React, { useState } from "react";
import { FaFolder, FaTruck, FaBoxOpen, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import { ContainerGeral, Card, Header, Etapas, LinhaCompleta, Etapa, IconWrapper } from "./styles";

function formatarData(data) {
  if (!data) return "-";
  const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(data).toLocaleString("pt-BR", options);
}

// Etapas definidas com seus respectivos ícones e rótulos
const etapas = [
  { tipo: "DATA XML IMPORTADO", label: "Data XML", icon: <FaFolder /> },
  { tipo: "EMISSAO DE CTE", label: "Emissão CTE", icon: <FaFileAlt /> },
  { tipo: "MERCADORIA SEPARADA/CONFERIDA", label: "Separação/Conferência", icon: <FaBoxOpen /> },
  { tipo: "EM ROTA", label: "Em Rota", icon: <FaTruck /> },
  { tipo: "ENTREGA CONFIRMADA", label: "Entrega Confirmada", icon: <FaCheckCircle /> },
];

// Dados fictícios com documentos variáveis
const dadosFicticios = [
  {
    situacao_nome: "Encerrada",
    numero: 899039,
    filial: "MTZ",
    data_emissao_cte: "2024-04-12T08:05:00",
    data_xml: "2024-04-11T08:05:00",
    data: "2024-07-12T16:27:00",
    tipo: "MERCADORIA SEPARADA/CONFERIDA",
    responsavel: "Motorista",
    remetente: "SANREMO SA - MTZ",
    destinatario: "COPAPEL COM E REPRES DE PAPEL LTDA",
    documento: 10929,
    nf: 173918,
    redespachador: null,
    prazo_d: 3,
    entregar_ate: "2024-07-10T14:30:00",
    entregue_em: null,
  },
  {
    situacao_nome: "Cadastrada",
    numero: 899039,
    filial: "MTZ",
    data_emissao_cte: "2024-04-12T08:05:00",
    data_xml: "2024-04-11T08:05:00",
    data: "2024-07-13T16:27:00",
    tipo: "EM ROTA",
    responsavel: "Motorista",
    remetente: "SANREMO SA - MTZ",
    destinatario: "COPAPEL COM E REPRES DE PAPEL LTDA",
    documento: 10930,
    nf: 173918,
    redespachador: null,
    prazo_d: 3,
    entregar_ate: "2024-07-10T14:30:00",
    entregue_em: null,
  },
  {
    situacao_nome: "Cadastrada",
    numero: 899039,
    filial: "MTZ",
    data_emissao_cte: "2024-04-12T08:05:00",
    data_xml: "2024-04-11T08:05:00",
    data: "2024-07-14T16:27:00",
    tipo: "ENTREGA CONFIRMADA",
    responsavel: "Motorista",
    remetente: "SANREMO SA - MTZ",
    destinatario: "COPAPEL COM E REPRES DE PAPEL LTDA",
    documento: 10930,
    nf: 173918,
    redespachador: null,
    prazo_d: 3,
    entregar_ate: "2024-07-10T14:30:00",
    entregue_em: "2024-07-14T16:27:00",
  },
];

// Função para agrupar dados por `remetente` e `nf`
function agruparPorRemetenteENF(dados) {
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
      };
    }
    agrupado[chave].documentos.add(item.documento);
    agrupado[chave].etapas.push(item);

    // Verificar se "Data XML" e "Emissão CTE" existem em qualquer ocorrência
    if (item.data_xml) agrupado[chave].dataXml = true;
    if (item.data_emissao_cte) agrupado[chave].dataEmissaoCTE = true;
  });
  return Object.values(agrupado).map((item) => ({
    ...item,
    documentos: Array.from(item.documentos), // Converte o conjunto para array
  }));
}

function CicloPedido() {
  const [dados, setDados] = useState(agruparPorRemetenteENF(dadosFicticios));

  return (
    <ContainerGeral>
      <h1>Ciclo do Pedido</h1>

      {dados.map((pedido, index) => {
        // Determinar progresso da linha
        const progresso =
          (etapas.filter((etapa) =>
            (etapa.tipo === "DATA XML IMPORTADO" && pedido.dataXml) ||
            (etapa.tipo === "EMISSAO DE CTE" && pedido.dataEmissaoCTE) ||
            pedido.etapas.find((d) => d.tipo === etapa.tipo)
          ).length /
            etapas.length) *
          100;

        return (
          <Card key={index}>
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
              <LinhaCompleta progresso={progresso} />
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
        );
      })}
    </ContainerGeral>
  );
}

export default CicloPedido;
