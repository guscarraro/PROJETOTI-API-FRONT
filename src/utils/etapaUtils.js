/**
 * Verifica se a nota está aguardando agendamento (tem ocorrência de "AGUARDANDO AGENDAMENTO DO CLIENTE"
 * e não tem "ENTREGA AGENDADA").
 */
export const isAguardandoAgendamento = (ocorrencias = []) => {
  const tipos = ocorrencias.map(o => o.tipo);
  return tipos.includes("AGUARDANDO AGENDAMENTO DO CLIENTE") &&
         !tipos.includes("ENTREGA AGENDADA");
};

/**
 * Determina o status de uma etapa com base nos critérios e dados disponíveis.
 * Exemplo: se a etapa foi concluída → verde, se não foi e já devia ter sido feita → vermelha.
 */
export const getStatusEtapa = ({ etapa, prevE, dtCTE }) => {
  if (!etapa) return "branca";

  const concluida = etapa.concluida === true;
  const anulada = etapa.anulada === true;
  const dataPrevista = prevE ? new Date(prevE) : null;
  const dataCTE = dtCTE ? new Date(dtCTE) : null;
  const hoje = new Date();

  if (anulada) return "vermelha";
  if (concluida) return "verde";

  // Se a data prevista já passou, considerar como vermelha
  if (dataPrevista && dataPrevista < hoje) {
    return "vermelha";
  }

  return "branca";
};

/**
 * Retorna as etapas relevantes para uma nota com base no tipo de viagem.
 */
export const getEtapasPorTipoViagem = ({ TpVg, ETPF, TRFFIL }) => {
  if (TpVg === "ETPF") {
    return ETPF || [];
  } else if (TpVg === "TRFFIL") {
    return TRFFIL || [];
  }
  return [];
};

/**
 * Exemplo de construção de objeto visual para exibir no componente EtapaNota.
 */
export const construirEtapasFormatadas = (nota) => {
  const etapas = getEtapasPorTipoViagem(nota);
  return etapas.map((etapa) => ({
    nome: etapa.nome,
    status: getStatusEtapa({
      etapa,
      prevE: nota.prevE,
      dtCTE: nota.dtCTE,
    }),
    data: etapa.data || null,
    infoAdicional: etapa.observacao || null
  }));
};
