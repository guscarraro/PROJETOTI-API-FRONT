import { fetchIndiceAtendimento } from './api';

export const loadIndiceAtendimento = async (dataInicial, dataFinal, existingData = []) => {
  try {
    const data = await fetchIndiceAtendimento(dataInicial, dataFinal);

    // Se a resposta não for válida ou não houver dados, mantém os dados existentes
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('Nenhum dado válido foi retornado do endpoint.');
      return existingData; // Retorna os dados existentes se não houver dados novos
    }

    // Formata os dados retornados
    const formattedData = data.map((item) => ({
      data_emissao: item.dataEmissao,
      CTE: item.numeroDocTransporte,
      NF: item.notaFiscal,
      remetente: item.remetente,
      origem: item.origem,
      destinatario: item.destinatario,
      destino: item.destino,
      praça_destino: item.pracaDestino, // Corrige o nome
      previsao_entrega: item.previsaoEntrega,
      entregue_em: item.entregueEm,
      cte_entregue: item.cteEntregue,
      cte_no_prazo: item.cteNoPrazo,
      percentual_cte_no_prazo: `${item.percentualCteNoPrazo.toFixed(2)}`, // Converte para string formatada
      atraso: item.atraso,
      percentual_cte_atraso: `${item.percentualCteAtraso.toFixed(2)}`, // Converte para string formatada
      atraso_transportadora: item.atrasoTransportadora,
      cte_atraso_transportadora: `${item.percentualCteAtrasoTransportadora.toFixed(2)}`, // Converte para string formatada
      atraso_cliente: item.atrasoCliente,
    }));

    return formattedData; // Retorna os dados formatados
  } catch (error) {
    console.error('Erro ao carregar índice de atendimento:', error.message);
    return existingData; // Em caso de erro, retorna os dados existentes
  }
};
