import { getPrazoEntregaStatus } from './dateUtils';
import { fluxosPorTpVg, TODAS_ETAPAS } from './fluxos';

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

  // Cria mapa de ocorrências por NF
  const ocorrenciasMap = {};
  for (const o of ocorrenciasPorNota) {
    const nfs = String(o.NF || "")
      .split(",")
      .map((nf) => nf.trim());

    for (const nf of nfs) {
      ocorrenciasMap[nf] = o;
    }
  }

  // 1. Processa os dados da API de índice de atendimento
  for (const item of data) {
    const nfList = Array.from(new Set(
      String(item.NF || item.nf || "")
        .split(",")
        .map((x) => x.trim())
    )).filter(Boolean);

    if (nfList.every((nf) => nfsAdicionadas.has(nf))) continue;

    const ocorrencia = nfList.map((nf) => ocorrenciasMap[nf]).find(Boolean);
    const entregueItem = item.cte_entregue !== 0;
    const entregueOcorrencia = ocorrencia?.cte_entregue !== undefined && ocorrencia.cte_entregue !== 0;
    if (entregueItem || entregueOcorrencia) continue;

    const ocorrencias = ocorrencia?.Ocorren || [];
    const apenasAgendamento =
      ocorrencias.length === 1 &&
      ocorrencias[0].tipo === 'AGUARDANDO AGENDAMENTO DO CLIENTE';

    const prevE = item.previsao_entrega;
    const remetenteOuTom = (item.remetente || ocorrencia?.tom || "").toUpperCase();
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

  // 2. Agora adiciona ao grupo `semPrevisao` as notas da API de ocorrências
  for (const ocorrencia of ocorrenciasPorNota) {
    const nfs = String(ocorrencia.NF || "")
      .split(",")
      .map((nf) => nf.trim())
      .filter(Boolean);

    const prevE = ocorrencia?.prevE;
    const remetenteOuTom = (ocorrencia.remetente || ocorrencia.tom || "").toUpperCase();
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

  filteredData.forEach((item) => {
    const nfs = String(item.NF || "")
      .split(",")
      .map((nf) => nf.trim());

    nfs.forEach((nf) => {
      const infoNota = ocorrenciasPorNota.find((o) =>
        String(o.NF).split(",").map((x) => x.trim()).includes(nf)
      );

      const isAguardando =
        infoNota?.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
        !infoNota?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

      if (!isAguardando) {
        nfsValidas.add(nf);
      }
    });
  });

  return nfsValidas.size;
};




// Agrupa por remetente
export const groupByRemetente = (data) => {
    const grupos = {};

    data.forEach((item) => {
        const remetente = item.remetente || "Desconhecido";
        if (!grupos[remetente]) {
            grupos[remetente] = [];
        }
        grupos[remetente].push(item);
    });

    return grupos;
};

// Aplica filtro por etapa e status da etapa
// se necessário

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
  let filteredData = [...data];

  // 🟡 Filtro por responsável → só mantém remetentes que ele atende
// 🟡 Filtro por responsável → só mantém remetentes que ele atende
if (selectedResponsavel !== 'Todos' && Array.isArray(remetentesResponsavel) && remetentesResponsavel.length > 0) {
  const remsUpper = remetentesResponsavel.map((r) =>
    (typeof r === 'string' ? r : r.remetente)?.toUpperCase()
  );
  filteredData = filteredData.filter((item) =>
    remsUpper.includes((item.remetente || '').toUpperCase())
  );
}
if (selectedPracaDestino) {
  filteredData = filteredData.filter((item) =>
    (item.praca_destino || "").toUpperCase() === selectedPracaDestino.toUpperCase()
  );
}



  // 🔵 Filtro por etapas + status
  if (etapasSelecionadas.length > 0 || statusEtapasSelecionados.length > 0) {

    filteredData = filteredData.filter((item) => {
      const notas = item.NF?.split(",").map((nf) => nf.trim()) || [];

      return notas.some((nf) => {
  const infoNota = ocorrenciasPorNota.find((o) =>
    String(o.NF).split(",").map((x) => x.trim()).includes(nf)
  );
  if (!infoNota || !infoNota.Ocorren) return true;


  const ocorrenciasMap = infoNota.Ocorren.reduce((map, o) => {
    map[o.tipo.toUpperCase()] = o.data;
    return map;
  }, {});

  const etapasFluxo = fluxosPorTpVg[infoNota?.TpVg || "ETPF"] || [];
  const etapas = etapasFluxo.map((etapa, idx) => {
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

    return { nome: etapa, foiExecutada, index: idx };
  });

  const ultimaExecutadaIndex = etapas.reduce(
    (max, etapa) => (etapa.foiExecutada ? etapa.index : max),
    -1
  );

  const etapasComStatus = etapas.map((etapa, idx) => {
    let status = "branca";
    if (etapa.foiExecutada) {
      status = "verde";
    } else if (idx < ultimaExecutadaIndex) {
      status = "vermelha";
    }
    return { nome: etapa.nome, status };
  });

  // Se o usuário selecionou etapas, todas elas devem existir e bater status (se houver status selecionado)
  const passaEtapas =
    etapasSelecionadas.length === 0 ||
    etapasSelecionadas.every((etapaNome) => {
      const etapa = etapasComStatus.find((et) => et.nome === etapaNome);
      if (!etapa) return false;
      if (statusEtapasSelecionados.length === 0) return true;
      return statusEtapasSelecionados.includes(etapa.status);
    });

  // Se o usuário selecionou só status (sem etapas), basta existir pelo menos uma etapa com um desses status
  const passaStatusApenas =
    etapasSelecionadas.length === 0 &&
    statusEtapasSelecionados.length > 0
      ? etapasComStatus.some((et) => statusEtapasSelecionados.includes(et.status))
      : true;

  return passaEtapas && passaStatusApenas;
});

    });
  }

  // 🔴 Filtro por remetente individual
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
