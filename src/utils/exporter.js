import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
    "FIM DE DESCARGA"
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
    "FIM DE DESCARGA"
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
    "FIM DE DESCARGA"
  ],
  FRA: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO",
    "VIAGEM CRIADA",
    "EM ROTA"
  ]
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

const calcularDiasAtraso = (dataEntrega) => {
  if (!dataEntrega) return "";
  const hoje = new Date();
  const entregaDate = new Date(dataEntrega.split("/").reverse().join("-"));
  const diff = Math.floor((hoje - entregaDate) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : "";
};

const applyCommonStyles = (worksheet, rowCount, colCount) => {
  for (let i = 1; i <= rowCount; i++) {
    const row = worksheet.getRow(i);
    for (let j = 1; j <= colCount; j++) {
      const cell = row.getCell(j);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    }
  }
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
};

const unificarNotaInfo = (notaNF, remetente, filteredData, ocorrenciasPorNota) => {
  let itemIndice = null;
  for (let i = 0; i < filteredData.length; i++) {
    const d = filteredData[i];
    const arr = String(d.NF).split(",").map((nf) => nf.trim());
    if (arr.includes(notaNF) && d.remetente === remetente) {
      itemIndice = d;
      break;
    }
  }

  let itemOcorrencia = null;
  for (let i = 0; i < ocorrenciasPorNota.length; i++) {
    const o = ocorrenciasPorNota[i];
    const arr = String(o.NF).split(",").map((nf) => nf.trim());
    if (arr.includes(notaNF) && o.tom === remetente) {
      itemOcorrencia = o;
      break;
    }
  }

  if (!itemIndice && !itemOcorrencia) return null;

  return {
    ...itemIndice,
    ...itemOcorrencia,
    NF: notaNF,
    Ocorren: Array.isArray(itemOcorrencia?.Ocorren) ? itemOcorrencia.Ocorren : (Array.isArray(itemIndice?.Ocorren) ? itemIndice.Ocorren : []),
    TpVg: itemIndice?.TpVg || itemOcorrencia?.TpVg || "ETPF",
    cte: itemIndice?.cte || itemOcorrencia?.cte,
    prevE: itemIndice?.previsao_entrega || itemOcorrencia?.prevE,
    destinatario: itemIndice?.destinatario || itemOcorrencia?.destinatario,
    praca_destino: itemIndice?.praca_destino || itemOcorrencia?.praca_destino
  };
};

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

  for (let i = 0; i < ocorrenciasPorNota.length; i++) {
    const o = ocorrenciasPorNota[i];
    const isAgendamento = Array.isArray(o.Ocorren) ? o.Ocorren.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") : false;
    const isEntregue = Array.isArray(o.Ocorren) ? o.Ocorren.some((oc) => oc.tipo === "ENTREGA AGENDADA") : false;
    if (isAgendamento && !isEntregue) {
      const nfs = String(o.NF || "").split(",").map((nf) => nf.trim());
      for (let j = 0; j < nfs.length; j++) nfsEmAgendamento.add(nfs[j]);
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

    for (let g = 0; g < statusData.length; g++) {
      const group = statusData[g];
      const remetente = group?.remetente ?? "Desconhecido";
      const itens = Array.isArray(group)
        ? group
        : Array.isArray(group?.notas)
          ? group.notas.map((nf) => ({ NF: nf }))
          : [group];

      for (let it = 0; it < itens.length; it++) {
        const item = itens[it];
        const nfString = item?.NF ?? item?.nf;
        const nfs = typeof nfString === "string"
          ? nfString.split(",").map((nf) => nf.trim())
          : [String(nfString)];

        for (let n = 0; n < nfs.length; n++) {
          const nf = nfs[n];
          if (nfsEmAgendamento.has(nf) || nfsJaExportadas.has(`${statusKey}:${nf}`)) continue;

          const notaInfo = unificarNotaInfo(nf, remetente, filteredData, ocorrenciasPorNota);
          if (!notaInfo) continue;

          const tipoViagem = notaInfo.TpVg || "ETPF";
          const etapasComStatus = getEtapasComStatus(notaInfo, tipoViagem);

          const isAgendadaPorNome = String(notaInfo.destinatario || "").toUpperCase().includes("(AGENDADO)");
          const isAgendadaPorOcorrencia = Array.isArray(notaInfo.Ocorren) ? notaInfo.Ocorren.some((oc) => oc.tipo === "ENTREGA AGENDADA") : false;
          const isAgendada = isAgendadaPorNome || isAgendadaPorOcorrencia;
          const ehForaSJP = String(notaInfo.praca_destino || "").toUpperCase() !== "SJP";

          const statusViagem =
            isAgendada && ehForaSJP ? "VIAGEM + AGENDADO" :
            isAgendada ? "AGENDADO" :
            ehForaSJP ? "VIAGEM" : "NORMAL";

          const row = [
            remetente,
            nf,
            notaInfo.cte || ""
          ];

          for (let e = 0; e < etapasPadrao.length; e++) {
            const etapaNome = etapasPadrao[e];
            const etapa = etapasComStatus.find((x) => x.nome === etapaNome);
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
            newRow.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6E6FA" } }));
          } else if (statusViagem === "AGENDADO") {
            newRow.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFADD8E6" } }));
          } else if (statusViagem === "VIAGEM") {
            newRow.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFA07A" } }));
          }

          for (let e = 0; e < etapasPadrao.length; e++) {
            const etapaNome = etapasPadrao[e];
            const etapa = etapasComStatus.find((x) => x.nome === etapaNome);
            const cell = newRow.getCell(4 + e);
            if (!etapa) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDDDDD" } };
            } else if (etapa.foiExecutada) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF90EE90" } };
            }
          }

          nfsJaExportadas.add(`${statusKey}:${nf}`);
        }
      }
    }

    worksheet.columns.forEach((column) => {
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

export const getEtapasComStatus = (notaInfo, tipoViagem) => {
  const etapas = fluxosPorTpVg[tipoViagem] || [];
  const ocorrenciasMap = {};
  const arr = Array.isArray(notaInfo.Ocorren) ? notaInfo.Ocorren : [];
  for (let i = 0; i < arr.length; i++) {
    const o = arr[i];
    const key = String(o.tipo || "").toUpperCase();
    ocorrenciasMap[key] = o.data;
  }

  const etapasRenderizadas = [];
  for (let i = 0; i < etapas.length; i++) {
    const etapa = etapas[i];
    const tipo = etapa.toUpperCase();
    let foiExecutada = false;
    let detalhe = null;

    if (tipo === "ENTRADA DE XML NO SISTEMA" && ocorrenciasMap[tipo]) {
      foiExecutada = true;
      detalhe = ocorrenciasMap[tipo];
    } else if (tipo === "DOCUMENTO EMITIDO" && notaInfo.cte) {
      foiExecutada = true;
      detalhe = `${notaInfo.cte} - ${notaInfo.dtCTE || ""}`;
    } else if (tipo === "VIAGEM CRIADA" && notaInfo.Vg && notaInfo.Vg !== 0) {
      foiExecutada = true;
      detalhe = `${notaInfo.Vg} - ${notaInfo.TpVg || ""}`;
    } else if (ocorrenciasMap[tipo]) {
      foiExecutada = true;
      detalhe = ocorrenciasMap[tipo];
    }

    etapasRenderizadas.push({ nome: etapa, foiExecutada, detalhe, index: i });
  }

  let ultimaExecutadaIndex = -1;
  for (let i = 0; i < etapasRenderizadas.length; i++) {
    if (etapasRenderizadas[i].foiExecutada && etapasRenderizadas[i].index > ultimaExecutadaIndex) {
      ultimaExecutadaIndex = etapasRenderizadas[i].index;
    }
  }

  const saida = [];
  for (let i = 0; i < etapasRenderizadas.length; i++) {
    const etapa = etapasRenderizadas[i];
    let status = "branca";
    if (etapa.foiExecutada) {
      status = "verde";
    } else if (i < ultimaExecutadaIndex) {
      status = "vermelha";
    }
    saida.push({ ...etapa, status });
  }
  return saida;
};

export const exportarTudoSemClientes = async (groupedDataByStatus, filteredData, ocorrenciasPorNota) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Todas Notas");

  const etapasPadraoLocal = [
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
    ...etapasPadraoLocal,
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

  const mapaStatus = {
    aguardandoAgendamento: "Aguardando Agendamento",
    semPrevisao: "Sem Previsão",
    inThreeDays: "Entregas em 3 Dias",
    inTwoDays: "Entregas em 2 Dias",
    tomorrow: "Entregas em 1 Dia",
    today: "Entregas Hoje",
    overdue: "Atrasadas"
  };

  for (const [statusKey, statusLabel] of Object.entries(mapaStatus)) {
    const statusData = groupedDataByStatus[statusKey] || [];

    for (let g = 0; g < statusData.length; g++) {
      const group = statusData[g];
      const remetente = group?.remetente || group?.tom || "Desconhecido";
      const notas = Array.isArray(group?.notas) ? group.notas : [group];

      for (let it = 0; it < notas.length; it++) {
        const item = notas[it];
        const nfs = typeof item.NF === "string"
          ? item.NF.split(",").map((nf) => nf.trim())
          : item.nf
            ? [String(item.nf).trim()]
            : [];

        for (let n = 0; n < nfs.length; n++) {
          const nf = nfs[n];
          const notaInfo = unificarNotaInfo(nf, remetente, filteredData, ocorrenciasPorNota);
          if (!notaInfo) continue;

          const tipoViagem = notaInfo.TpVg || "ETPF";
          const etapasComStatus = getEtapasComStatus(notaInfo, tipoViagem);

          const isAgendada = String(notaInfo.destinatario || "").includes("(AGENDADO)") ||
            (Array.isArray(notaInfo.Ocorren) ? notaInfo.Ocorren.some((oc) => oc.tipo === "ENTREGA AGENDADA") : false);
          const ehForaSJP = String(notaInfo.praca_destino || "").toUpperCase() !== "SJP";
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

          for (let e = 0; e < etapasPadraoLocal.length; e++) {
            const etapaNome = etapasPadraoLocal[e];
            const etapa = etapasComStatus.find((x) => x.nome === etapaNome);
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
            diasEntreHoje(notaInfo.prevE),
            statusViagem
          );

          const rowObj = worksheet.addRow(row);

          if (statusKey === "overdue") {
            rowObj.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFCCCB" } }));
          } else if (statusKey === "today") {
            rowObj.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFE0" } }));
          } else if (statusViagem === "VIAGEM + AGENDADO") {
            rowObj.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6E6FA" } }));
          } else if (statusViagem === "AGENDADO") {
            rowObj.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFADD8E6" } }));
          } else if (statusViagem === "VIAGEM") {
            rowObj.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFA07A" } }));
          }

          for (let e = 0; e < etapasPadraoLocal.length; e++) {
            const etapaNome = etapasPadraoLocal[e];
            const etapa = etapasComStatus.find((x) => x.nome === etapaNome);
            const cell = rowObj.getCell(7 + e);
            if (!etapa) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDDDDD" } };
            } else if (etapa.foiExecutada) {
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF90EE90" } };
            }
          }
        }
      }
    }
  }

  worksheet.columns.forEach((column) => {
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

export const exportarExcelDetalhadoPorStatus = async (groupedDataByStatus, filteredData, ocorrenciasPorNota) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Detalhado por Status");

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

  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFCCE5FF" } };
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const mapaStatus = {
    aguardandoAgendamento: "Aguardando Agendamento",
    semPrevisao: "Sem Previsão",
    inThreeDays: "Entrega em 3 Dias",
    inTwoDays: "Entrega em 2 Dias",
    tomorrow: "Entrega em 1 Dia",
    today: "Entregas Hoje",
    overdue: "Atrasadas"
  };

  for (const [statusKey, statusLabel] of Object.entries(mapaStatus)) {
    const statusData = groupedDataByStatus[statusKey];
    if (!Array.isArray(statusData)) continue;

    for (let g = 0; g < statusData.length; g++) {
      const group = statusData[g];
      const itens = group?.notas ?? group?.itens ?? group?.ocorrencias ?? [];
      if (!Array.isArray(itens)) continue;

      for (let it = 0; it < itens.length; it++) {
        const item = itens[it];
        const nfs = (item.NF && typeof item.NF === "string") ? item.NF.split(",").map((nf) => nf.trim()) : [];

        for (let n = 0; n < nfs.length; n++) {
          const nf = nfs[n];
          const notaInfo = ocorrenciasPorNota.find((o) => o.NF && String(o.NF).split(",").map((x) => x.trim()).includes(nf)) || item;
          if (!notaInfo) continue;

          const isAgendada = String(notaInfo.destinatario || "").includes("(AGENDADO)") ||
            (Array.isArray(notaInfo.Ocorren) ? notaInfo.Ocorren.some((oc) => oc.tipo === "ENTREGA AGENDADA") : false);
          const ehForaSJP = String(notaInfo.praca_destino || "").toUpperCase() !== "SJP";
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

  worksheet.columns.forEach((column) => {
    const header = typeof column.header === "string" ? column.header : "";
    column.width = header.length < 12 ? 12 : header.length + 5;
  });

  for (let i = 1; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    for (let j = 1; j <= worksheet.columnCount; j++) {
      const cell = row.getCell(j);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  saveAs(blob, `Relatorio_Detalhado_${new Date().toLocaleDateString("pt-BR")}.xlsx`);
};
