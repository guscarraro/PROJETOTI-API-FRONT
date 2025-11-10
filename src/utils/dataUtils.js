import { getPrazoEntregaStatus } from './dateUtils';
import { fluxosPorTpVg } from './fluxos';

const tomadoresIgnorados = [
  "SC DISTRIBUICAO LTDA",
  "FAST SHOP",
  "RAIADROGASIL",
  "HEINZ",
  "HYPOFARMA INSTITUTO DE HYPODERMIA E FARMACIA LTDA"
];

export const groupByStatus = (data, ocorrenciasPorNota) => {
  if (!Array.isArray(data)) return {};

  const grouped = {
    today: [],
    tomorrow: [],
    inTwoDays: [],
    inThreeDays: [],
    overdue: [],
    aguardandoAgendamento: [],
    semPrevisao: [],
  };

  const nfsAdicionadas = new Set();

  const ocorrenciasMap = {};
  for (let i = 0; i < ocorrenciasPorNota.length; i++) {
    const o = ocorrenciasPorNota[i];
    const nfs = String(o.NF || "").split(",").map((nf) => nf.trim());
    for (let j = 0; j < nfs.length; j++) {
      const nf = nfs[j];
      ocorrenciasMap[nf] = o;
    }
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const nfList = Array.from(new Set(String(item.NF || item.nf || "").split(",").map((x) => x.trim()))).filter(Boolean);
    if (nfList.every((nf) => nfsAdicionadas.has(nf))) continue;

    let ocorrencia = null;
    for (let j = 0; j < nfList.length; j++) {
      const nf = nfList[j];
      if (ocorrenciasMap[nf]) {
        ocorrencia = ocorrenciasMap[nf];
        break;
      }
    }

    const entregueItem = item.cte_entregue !== 0;
    const entregueOcorrencia = ocorrencia?.cte_entregue !== undefined && ocorrencia.cte_entregue !== 0;
    if (entregueItem || entregueOcorrencia) continue;

    const ocorrencias = Array.isArray(ocorrencia?.Ocorren) ? ocorrencia.Ocorren : [];
    const apenasAgendamento =
      ocorrencias.length === 1 &&
      ocorrencias[0]?.tipo === 'AGUARDANDO AGENDAMENTO DO CLIENTE';

    const prevE = item.previsao_entrega;
    const remetenteOuTom = String(item.remetente || ocorrencia?.tom || "").toUpperCase();
    const ignorado = tomadoresIgnorados.some((t) => remetenteOuTom.includes(t));

    if (apenasAgendamento) {
      grouped.aguardandoAgendamento.push(item);
      nfList.forEach((nf) => nfsAdicionadas.add(nf));
    } else if ((!prevE || prevE.trim() === "") && !ignorado) {
      grouped.semPrevisao.push(item);
      nfList.forEach((nf) => nfsAdicionadas.add(nf));
    } else {
      const prazo = getPrazoEntregaStatus(prevE);
      if (prazo && grouped[prazo]) {
        grouped[prazo].push(item);
        nfList.forEach((nf) => nfsAdicionadas.add(nf));
      }
    }
  }

  for (let i = 0; i < ocorrenciasPorNota.length; i++) {
    const ocorrencia = ocorrenciasPorNota[i];
    const nfs = String(ocorrencia.NF || "")
      .split(",")
      .map((nf) => nf.trim())
      .filter(Boolean);

    const prevE = ocorrencia?.prevE;
    const remetenteOuTom = String(ocorrencia.remetente || ocorrencia.tom || "").toUpperCase();
    const ignorado = tomadoresIgnorados.some((t) => remetenteOuTom.includes(t));
    const entregue = ocorrencia.cte_entregue !== undefined && ocorrencia.cte_entregue !== 0;

    if (entregue || ignorado) continue;

    if (!prevE || prevE.trim() === "") {
      const jaAdicionadas = nfs.every((nf) => nfsAdicionadas.has(nf));
      if (!jaAdicionadas) {
        grouped.semPrevisao.push(ocorrencia);
        nfs.forEach((nf) => nfsAdicionadas.add(nf));
      }
    }
  }

  return grouped;
};

export const calcularTotalNotasDashboard = (filteredData, ocorrenciasPorNota) => {
  const nfsValidas = new Set();

  for (let i = 0; i < filteredData.length; i++) {
    const item = filteredData[i];
    const nfs = String(item.NF || "").split(",").map((nf) => nf.trim());

    for (let j = 0; j < nfs.length; j++) {
      const nf = nfs[j];
      let infoNota = null;
      for (let k = 0; k < ocorrenciasPorNota.length; k++) {
        const o = ocorrenciasPorNota[k];
        const arr = String(o.NF).split(",").map((x) => x.trim());
        if (arr.includes(nf)) {
          infoNota = o;
          break;
        }
      }

      const temAguardando = Array.isArray(infoNota?.Ocorren)
        ? infoNota.Ocorren.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE")
        : false;
      const temEntregAgendada = Array.isArray(infoNota?.Ocorren)
        ? infoNota.Ocorren.some((oc) => oc.tipo === "ENTREGA AGENDADA")
        : false;

      if (!(temAguardando && !temEntregAgendada)) {
        nfsValidas.add(nf);
      }
    }
  }

  return nfsValidas.size;
};

export const groupByRemetente = (data) => {
  const grupos = {};
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const remetente = item.remetente || "Desconhecido";
    if (!grupos[remetente]) grupos[remetente] = [];
    grupos[remetente].push(item);
  }
  return grupos;
};

export const applyEtapasStatusFilter = (
  data,
  ocorrenciasPorNota,
  {
    selectedResponsavel,
    selectedRemetente,
    etapasSelecionadas,
    statusEtapasSelecionados,
    remetentesResponsavel,
    selectedPracaDestino
  }
) => {
  let filteredData = data.slice();

  if (selectedResponsavel !== 'Todos' && Array.isArray(remetentesResponsavel) && remetentesResponsavel.length > 0) {
    const remsUpper = [];
    for (let i = 0; i < remetentesResponsavel.length; i++) {
      const r = remetentesResponsavel[i];
      const nome = (typeof r === 'string' ? r : r.remetente) || '';
      remsUpper.push(nome.toUpperCase());
    }
    filteredData = filteredData.filter((item) =>
      remsUpper.includes((item.remetente || '').toUpperCase())
    );
  }

  if (selectedPracaDestino) {
    filteredData = filteredData.filter((item) =>
      String(item.praca_destino || "").toUpperCase() === selectedPracaDestino.toUpperCase()
    );
  }

  if (etapasSelecionadas.length > 0 || statusEtapasSelecionados.length > 0) {
    filteredData = filteredData.filter((item) => {
      const notas = item.NF ? item.NF.split(",").map((nf) => nf.trim()) : [];

      for (let n = 0; n < notas.length; n++) {
        const nf = notas[n];
        let infoNota = null;
        for (let i = 0; i < ocorrenciasPorNota.length; i++) {
          const o = ocorrenciasPorNota[i];
          const arr = String(o.NF).split(",").map((x) => x.trim());
          if (arr.includes(nf)) {
            infoNota = o;
            break;
          }
        }
        if (!infoNota || !Array.isArray(infoNota.Ocorren)) return true;

        const ocorrenciasMap = {};
        for (let i = 0; i < infoNota.Ocorren.length; i++) {
          const o = infoNota.Ocorren[i];
          const key = String(o.tipo || "").toUpperCase();
          ocorrenciasMap[key] = o.data;
        }

        const etapasFluxo = fluxosPorTpVg[infoNota?.TpVg || "ETPF"] || [];
        const etapas = [];
        for (let i = 0; i < etapasFluxo.length; i++) {
          const etapa = etapasFluxo[i];
          const tipo = etapa.toUpperCase();
          let foiExecutada = false;

          if (tipo === "ENTRADA DE XML NO SISTEMA" && ocorrenciasMap[tipo]) {
            foiExecutada = true;
          } else if (tipo === "DOCUMENTO EMITIDO" && infoNota.cte) {
            foiExecutada = true;
          } else if (tipo === "VIAGEM CRIADA" && infoNota.Vg && infoNota.Vg !== 0) {
            foiExecutada = true;
          } else if (ocorrenciasMap[tipo]) {
            foiExecutada = true;
          }

          etapas.push({ nome: etapa, foiExecutada, index: i });
        }

        let ultimaExecutadaIndex = -1;
        for (let i = 0; i < etapas.length; i++) {
          if (etapas[i].foiExecutada && etapas[i].index > ultimaExecutadaIndex) {
            ultimaExecutadaIndex = etapas[i].index;
          }
        }

        const etapasComStatus = [];
        for (let i = 0; i < etapas.length; i++) {
          const etapa = etapas[i];
          let status = "branca";
          if (etapa.foiExecutada) {
            status = "verde";
          } else if (i < ultimaExecutadaIndex) {
            status = "vermelha";
          }
          etapasComStatus.push({ nome: etapa.nome, status });
        }

        const passaEtapas =
          etapasSelecionadas.length === 0 ||
          etapasSelecionadas.every((etapaNome) => {
            for (let i = 0; i < etapasComStatus.length; i++) {
              const et = etapasComStatus[i];
              if (et.nome === etapaNome) {
                if (statusEtapasSelecionados.length === 0) return true;
                return statusEtapasSelecionados.includes(et.status);
              }
            }
            return false;
          });

        const passaStatusApenas =
          etapasSelecionadas.length === 0 &&
          statusEtapasSelecionados.length > 0
            ? etapasComStatus.some((et) => statusEtapasSelecionados.includes(et.status))
            : true;

        if (passaEtapas && passaStatusApenas) return true;
      }

      return false;
    });
  }

  if (
    selectedRemetente &&
    Array.isArray(selectedRemetente) &&
    !selectedRemetente.includes("Todos")
  ) {
    filteredData = filteredData.filter((item) =>
      selectedRemetente.includes(item.remetente)
    );
  }

  return filteredData;
};
