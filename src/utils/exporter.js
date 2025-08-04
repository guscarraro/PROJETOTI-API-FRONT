import * as XLSX from 'xlsx';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { groupByStatus } from '../utils/dataUtils';
import { parse } from "date-fns";

// export const exportarParaExcelPorCliente = (dados) => {
//   const agrupadoPorRemetente = {};

//   dados.forEach((item) => {
//     const remetente = item.remetente || "Desconhecido";
//     if (!agrupadoPorRemetente[remetente]) {
//       agrupadoPorRemetente[remetente] = [];
//     }

//     agrupadoPorRemetente[remetente].push({
//       CTE: item.cte,
//       Nota: item.nf,
//       Remetente: item.remetente,
//       Destinatário: item.destinatario,
//       Previsão: item.prevE,
//       Responsável: item.tom,
//       Status: item.status,
//       "Data do CTE": item.dtCTE,
//     });
//   });

//   Object.entries(agrupadoPorRemetente).forEach(([cliente, linhas]) => {
//     const ws = XLSX.utils.json_to_sheet(linhas);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Notas");

//     XLSX.writeFile(wb, `Notas_${cliente}.xlsx`);
//   });
// };

// export const exportarTudoSemClientes = (dados) => {
//   const linhas = dados.map((item) => ({
//     CTE: item.cte,
//     Nota: item.nf,
//     Remetente: item.remetente,
//     Destinatário: item.destinatario,
//     Previsão: item.prevE,
//     Responsável: item.tom,
//     Status: item.status,
//     "Data do CTE": item.dtCTE,
//   }));

//   const ws = XLSX.utils.json_to_sheet(linhas);
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "Notas");

//   XLSX.writeFile(wb, "TodasNotas.xlsx");
// };
// utils/exporter.js


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

function parseDate(dateString) {
  if (!dateString) return null;
  const [day, month, year] = dateString.split("/");
  return new Date(`${year}-${month}-${day}`);
}

function diasEntreHoje(dataString) {
  const data = parseDate(dataString);
  if (!data) return "-";
  const hoje = new Date();
  return Math.floor((hoje - data) / (1000 * 60 * 60 * 24));
}



// Função auxiliar para formatar data
const formatDateExcel = (dateString) => {
  if (!dateString) return "";
  const [day, month, year] = dateString.split("/");
  return new Date(`${year}-${month}-${day}`).toLocaleDateString("pt-BR");
};

// Função auxiliar para calcular dias de atraso
const calcularDiasAtraso = (dataEntrega) => {
  if (!dataEntrega) return "";
  const hoje = new Date();
  const entregaDate = new Date(dataEntrega.split("/").reverse().join("-"));
  const diff = Math.floor((hoje - entregaDate) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : "";
};

// Estilos comuns
const applyCommonStyles = (worksheet, rowCount, colCount) => {
  // Aplicar bordas a todas as células
  for (let i = 1; i <= rowCount; i++) {
    const row = worksheet.getRow(i);
    for (let j = 1; j <= colCount; j++) {
      const cell = row.getCell(j);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  }

  // Congelar primeira linha (cabeçalho)
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
};
// Função auxiliar para unificar info da nota (índice + ocorrência)
const unificarNotaInfo = (notaNF, remetente, filteredData, ocorrenciasPorNota) => {
  const itemIndice = filteredData.find(d =>
    String(d.NF).split(",").map(nf => nf.trim()).includes(notaNF) &&
    d.remetente === remetente
  );

  const itemOcorrencia = ocorrenciasPorNota.find(o =>
    String(o.NF).split(",").map(nf => nf.trim()).includes(notaNF) &&
    o.tom === remetente
  );

  if (!itemIndice && !itemOcorrencia) return null;

  return {
    ...itemIndice,
    ...itemOcorrencia,
    NF: notaNF,
    Ocorren: itemOcorrencia?.Ocorren ?? itemIndice?.Ocorren ?? [],
    TpVg: itemIndice?.TpVg ?? itemOcorrencia?.TpVg ?? "ETPF",
    cte: itemIndice?.cte ?? itemOcorrencia?.cte,
    prevE: itemIndice?.previsao_entrega ?? itemOcorrencia?.prevE,
    destinatario: itemIndice?.destinatario ?? itemOcorrencia?.destinatario,
    praca_destino: itemIndice?.praca_destino ?? itemOcorrencia?.praca_destino,
  };
};

// Exportar para Excel por cliente com abas detalhadas

const etapasPadrao = [
  "ENTRADA DE XML NO SISTEMA",
  "DOCUMENTO EMITIDO",
  "MERCADORIA SEPARADA/CONFERIDA",
  "VIAGEM CRIADA",
  "EM ROTA DE TRANSFERENCIA",
  "CHEGADA NA BASE",
  "CHEGADA NA FILIAL",
  "MERCADORIA RECEBIDA NA FILIAL",
  "EM ROTA",
  "CHEGADA NO LOCAL",
  "INICIO DE DESCARGA",
  "FIM DE DESCARGA"
];

export const exportarParaExcelPorCliente = async (groupedDataByStatus, filteredData, ocorrenciasPorNota) => {
  const workbook = new ExcelJS.Workbook();

  const statusMap = {
    inThreeDays: "Entrega em 3 Dias",
    inTwoDays: "Entrega em 2 Dias",
    tomorrow: "Entrega em 1 Dia",
    today: "Entregas Hoje",
    overdue: "Atrasadas"
  };

  const nfsEmAgendamento = new Set();
  const nfsJaExportadas = new Set();

  for (const o of ocorrenciasPorNota) {
    const isAgendamento = o.Ocorren?.some(oc => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE");
    const isEntregue = o.Ocorren?.some(oc => oc.tipo === "ENTREGA AGENDADA");
    if (isAgendamento && !isEntregue) {
      const nfs = String(o.NF || "").split(",").map(nf => nf.trim());
      nfs.forEach(nf => nfsEmAgendamento.add(nf));
    }
  }

  for (const [statusKey, statusLabel] of Object.entries(statusMap)) {
    const worksheet = workbook.addWorksheet(statusLabel);

    worksheet.addRow([
      "Remetente", "Nota Fiscal", "CT-e",
      ...etapasPadrao,
      "Previsão Entrega", "Dias Atraso", "Status Viagem"
    ]);

    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCCE5FF" } };
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const statusData = groupedDataByStatus[statusKey] || [];

    for (const group of statusData) {
      const remetente = group?.remetente ?? "Desconhecido";
      const itens = Array.isArray(group)
        ? group
        : Array.isArray(group?.notas)
          ? group.notas.map(nf => ({ NF: nf }))
          : [group];

      for (const item of itens) {
        const nfString = item?.NF ?? item?.nf;
        const nfs = typeof nfString === "string"
          ? nfString.split(",").map(nf => nf.trim())
          : [String(nfString)];

        for (const nf of nfs) {
          if (nfsEmAgendamento.has(nf) || nfsJaExportadas.has(`${statusKey}:${nf}`)) continue;

          const notaInfo = unificarNotaInfo(nf, remetente, filteredData, ocorrenciasPorNota);
          if (!notaInfo) continue;

          const tipoViagem = notaInfo.TpVg || "ETPF";
          const etapasComStatus = getEtapasComStatus(notaInfo, tipoViagem);

          const isAgendadaPorNome = notaInfo.destinatario?.toUpperCase()?.includes("(AGENDADO)");
          const isAgendadaPorOcorrencia = notaInfo.Ocorren?.some(oc => oc.tipo === "ENTREGA AGENDADA");
          const isAgendada = isAgendadaPorNome || isAgendadaPorOcorrencia;
          const ehForaSJP = notaInfo.praca_destino?.toUpperCase() !== "SJP";

          const statusViagem =
            isAgendada && ehForaSJP ? "VIAGEM + AGENDADO" :
              isAgendada ? "AGENDADO" :
                ehForaSJP ? "VIAGEM" : "NORMAL";

          const row = [
            remetente,
            nf,
            notaInfo.cte || ""
          ];

          for (const etapaNome of etapasPadrao) {
            const etapa = etapasComStatus.find(e => e.nome === etapaNome);
            if (!etapa) {
              row.push("-");
            } else if (etapa.foiExecutada) {
              row.push(etapa?.detalhe || "Concluído");
            } else {
              row.push("");
            }
          }

          row.push(
            notaInfo.prevE || "",
            statusKey === "overdue" ? calcularDiasAtraso(notaInfo.prevE) : "",
            statusViagem
          );

          const newRow = worksheet.addRow(row);

          if (statusViagem === "VIAGEM + AGENDADO") {
            newRow.eachCell(cell => cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6E6FA" } });
          } else if (statusViagem === "AGENDADO") {
            newRow.eachCell(cell => cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFADD8E6" } });
          } else if (statusViagem === "VIAGEM") {
            newRow.eachCell(cell => cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFA07A" } });
          }

          etapasPadrao.forEach((etapaNome, idx) => {
            const etapa = etapasComStatus.find(e => e.nome === etapaNome);
            const cell = newRow.getCell(4 + idx);
            if (!etapa) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDDDDD" } }; // cinza
            } else if (etapa.foiExecutada) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF90EE90" } }; // verde
            }
          });

          nfsJaExportadas.add(`${statusKey}:${nf}`);
        }
      }
    }

    worksheet.columns.forEach(column => {
      const header = typeof column.header === "string" ? column.header : "";
      column.width = header.length < 12 ? 12 : header.length + 5;
    });

    applyCommonStyles(worksheet, worksheet.rowCount, worksheet.columnCount);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  saveAs(blob, `Relatorio_Entregas_Detalhado_${new Date().toLocaleDateString("pt-BR")}.xlsx`);
};





// Função auxiliar para obter etapas com status (similar ao componente EtapaNota)
export const getEtapasComStatus = (notaInfo, tipoViagem) => {
  const etapas = fluxosPorTpVg[tipoViagem] || [];
  const ocorrenciasMap = (notaInfo.Ocorren || []).reduce((map, o) => {
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
    } else if (tipo === "DOCUMENTO EMITIDO" && notaInfo.cte) {
      foiExecutada = true;
      detalhe = `${notaInfo.cte} - ${notaInfo.dtCTE}`;
    } else if (tipo === "VIAGEM CRIADA" && notaInfo.Vg && notaInfo.Vg !== 0) {
      foiExecutada = true;
      detalhe = `${notaInfo.Vg} - ${notaInfo.TpVg}`;
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

  return etapasRenderizadas.map((etapa, idx) => {
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
};

// Exportar tudo em uma única aba
export const exportarTudoSemClientes = async (groupedDataByStatus, filteredData, ocorrenciasPorNota) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Todas Notas");

  const etapasPadrao = [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "VIAGEM CRIADA",
    "EM ROTA DE TRANSFERENCIA",
    "CHEGADA NA BASE",
    "CHEGADA NA FILIAL",
    "MERCADORIA RECEBIDA NA FILIAL",
    "EM ROTA",
    "CHEGADA NO LOCAL",
    "INICIO DE DESCARGA",
    "FIM DE DESCARGA"
  ];

  worksheet.addRow([
    "Status",
    "Remetente/Tomador",
    "Nota Fiscal",
    "CT-e",
    "Destino",
    "Praça Destino",
    ...etapasPadrao,
    "Previsão Entrega",
    "Dias Atraso",
    "Dias Referência",
    "Status Viagem"
  ]);

  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCCE5FF" } };
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  for (const [statusKey, statusLabel] of Object.entries({
    aguardandoAgendamento: "Aguardando Agendamento",
    semPrevisao: "Sem Previsão",
    inThreeDays: "Entregas em 3 Dias",
    inTwoDays: "Entregas em 2 Dias",
    tomorrow: "Entregas em 1 Dia",
    today: "Entregas Hoje",
    overdue: "Atrasadas"
  })) {
    const statusData = groupedDataByStatus[statusKey] || [];

    for (const group of statusData) {
      const remetente = group?.remetente || group?.tom || "Desconhecido";
      const notas = Array.isArray(group?.notas) ? group.notas : [group];

      for (const item of notas) {
        const nfs = typeof item.NF === "string"
          ? item.NF.split(",").map(nf => nf.trim())
          : item.nf
            ? [String(item.nf).trim()]
            : [];

        for (const nf of nfs) {
          const notaInfo = unificarNotaInfo(nf, remetente, filteredData, ocorrenciasPorNota);
          if (!notaInfo) continue;

          const tipoViagem = notaInfo.TpVg || "ETPF";
          const etapasComStatus = getEtapasComStatus(notaInfo, tipoViagem);

          const isAgendada = notaInfo.destinatario?.includes("(AGENDADO)") ||
            (notaInfo.Ocorren || []).some(oc => oc.tipo === "ENTREGA AGENDADA");
          const ehForaSJP = notaInfo.praca_destino?.toUpperCase() !== "SJP";
          const statusViagem =
            isAgendada && ehForaSJP ? "VIAGEM + AGENDADO" :
              isAgendada ? "AGENDADO" :
                ehForaSJP ? "VIAGEM" : "NORMAL";

          const row = [
            statusLabel,
            remetente,
            nf,
            notaInfo.cte || "",
            notaInfo.destino || "",
            notaInfo.praca_destino || ""
          ];

          for (const etapaNome of etapasPadrao) {
            const etapa = etapasComStatus.find(e => e.nome === etapaNome);
            if (!etapa) {
              row.push("-"); // inexistente
            } else if (etapa.foiExecutada) {
              row.push(etapa?.detalhe || "Concluído");
            } else {
              row.push(""); // existente, mas não concluída
            }
          }

          row.push(
            notaInfo.prevE || "",
            statusKey === "overdue" ? calcularDiasAtraso(notaInfo.prevE) : "",
            diasEntreHoje(notaInfo.prevE),
            statusViagem
          );

          const rowObj = worksheet.addRow(row);

          if (statusKey === "overdue") {
            rowObj.eachCell(cell => cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFCCCB" } });
          } else if (statusKey === "today") {
            rowObj.eachCell(cell => cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFE0" } });
          } else if (statusViagem === "VIAGEM + AGENDADO") {
            rowObj.eachCell(cell => cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6E6FA" } });
          } else if (statusViagem === "AGENDADO") {
            rowObj.eachCell(cell => cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFADD8E6" } });
          } else if (statusViagem === "VIAGEM") {
            rowObj.eachCell(cell => cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFA07A" } });
          }

          etapasPadrao.forEach((etapaNome, idx) => {
            const etapa = etapasComStatus.find(e => e.nome === etapaNome);
            const cell = rowObj.getCell(7 + idx); // começa na 7ª col (Destino), então + idx
            if (!etapa) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDDDDD" } }; // cinza
            } else if (etapa.foiExecutada) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF90EE90" } }; // verde
            }
          });
        }
      }
    }
  }

  worksheet.columns.forEach(column => {
    const header = typeof column.header === "string" ? column.header : "";
    column.width = header.length < 12 ? 12 : header.length + 5;
  });

  applyCommonStyles(worksheet, worksheet.rowCount, worksheet.columnCount);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  saveAs(blob, `Relatorio_Entregas_GERAL_${new Date().toLocaleDateString("pt-BR")}.xlsx`);
};


// Adicione esta função no exporter.js
export const exportarExcelDetalhadoPorStatus = async (groupedDataByStatus, filteredData, ocorrenciasPorNota) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Detalhado por Status");

  // Cabeçalho
  worksheet.addRow([
    "Status",
    "Remetente/Tomador",
    "Nota Fiscal",
    "CT-e",
    "Destino",
    "Praça Destino",
    "Previsão Entrega",
    "Dias Atraso",
    "Status Viagem"
  ]);

  // Estilizar cabeçalho
  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFCCE5FF" },
    };
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Preencher dados
  for (const [statusKey, statusLabel] of Object.entries({
    aguardandoAgendamento: "Aguardando Agendamento",
    semPrevisao: "Sem Previsão",
    inThreeDays: "Entrega em 3 Dias",
    inTwoDays: "Entrega em 2 Dias",
    tomorrow: "Entrega em 1 Dia",
    today: "Entregas Hoje",
    overdue: "Atrasadas"
  })) {
    // Verifica se existe dados para este status
    if (!groupedDataByStatus[statusKey]) continue;

    const statusData = groupedDataByStatus[statusKey];

    // Verifica se statusData é um array e tem itens
    if (!Array.isArray(statusData)) continue;

    for (const group of statusData) {
      // Verifica se group tem a propriedade itens ou ocorrencias
      const itens = group?.notas ?? group?.itens ?? group?.ocorrencias ?? [];



      // Verifica se itens é um array
      if (!Array.isArray(itens)) continue;

      for (const item of itens) {
        // Verifica se item tem NF e é uma string válida
        const nfs = (item.NF && typeof item.NF === 'string') ?
          item.NF.split(",").map(nf => nf.trim()) : [];

        for (const nf of nfs) {
          const notaInfo = ocorrenciasPorNota.find(o =>
            o.NF && String(o.NF).split(",").map(x => x.trim()).includes(nf)) || item;

          // Verifica se notaInfo existe
          if (!notaInfo) continue;

          const isAgendada = notaInfo.destinatario?.includes("(AGENDADO)") ||
            (notaInfo.Ocorren || []).some(oc => oc.tipo === "ENTREGA AGENDADA");
          const ehForaSJP = notaInfo.praca_destino?.toUpperCase() !== "SJP";
          const statusViagem =
            isAgendada && ehForaSJP ? "VIAGEM + AGENDADO" :
              isAgendada ? "AGENDADO" :
                ehForaSJP ? "VIAGEM" : "NORMAL";

          worksheet.addRow([
            statusLabel,
            group.remetente || "",
            nf,
            notaInfo.cte || "",
            notaInfo.destino || "",
            notaInfo.praca_destino || "",
            notaInfo.prevE || "",
            statusKey === "overdue" ? calcularDiasAtraso(notaInfo.prevE) : "",
            statusViagem
          ]);
        }
      }
    }
  }

  // Ajustar largura das colunas
  worksheet.columns.forEach(column => {
    const header = typeof column.header === "string" ? column.header : "";
    column.width = header.length < 12 ? 12 : header.length + 5;
  });

  // Aplicar bordas a todas as células
  for (let i = 1; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    for (let j = 1; j <= worksheet.columnCount; j++) {
      const cell = row.getCell(j);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  }

  // Gerar arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  saveAs(blob, `Relatorio_Detalhado_${new Date().toLocaleDateString("pt-BR")}.xlsx`);
};