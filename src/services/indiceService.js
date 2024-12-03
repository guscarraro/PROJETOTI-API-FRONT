import axios from 'axios';

const API_PROXY_URL = '/api/proxy'; // Caminho para a função serverless no Vercel
let token = null; // Token armazenado localmente
let tokenExpiration = null; // Validade do token

/**
 * Obtém o token de autenticação através do proxy.
 */
export const getAuthToken = async () => {
  try {
    if (token && new Date() < tokenExpiration) {
      return token; // Retorna o token atual se ainda for válido
    }

    const response = await axios.post(
      `${API_PROXY_URL}?path=authorization`,
      {}, // Corpo vazio para a autenticação
      {
        headers: {
          Authorization: `Basic ${btoa('gustavo.carraro:hatuna10')}`, // Credenciais
        },
      }
    );

    const tokenData = response.data?.retorno?.[0]?.token;
    if (!tokenData) {
      throw new Error('Token não encontrado na resposta da API');
    }

    // Atualiza o token e sua validade
    token = tokenData;
    tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // Validade de 24 horas

    return token;
  } catch (error) {
    console.error('Erro ao obter token:', error.response?.data || error.message);
    throw new Error('Falha na autenticação');
  }
};

/**
 * Busca os dados do índice de atendimento.
 * @param {string} dataInicial - Data inicial no formato dd/MM/yyyy.
 * @param {string} dataFinal - Data final no formato dd/MM/yyyy.
 */
export const fetchIndiceAtendimento = async (dataInicial, dataFinal) => {
  try {
    // Obtenha um token válido
    const authToken = await getAuthToken();

    const response = await axios.get(
      `${API_PROXY_URL}?path=operacional/painel/IndiceAtendimentoPraca`,
      {
        params: { dataInicial, dataFinal }, // Envia as datas como parâmetros
        headers: {
          Authorization: `Bearer ${authToken}`, // Envia o token como Bearer
        },
      }
    );

    return response.data.indiceAtendimentoPraca; // Retorna os dados da API
  } catch (error) {
    console.error('Erro ao buscar índice de atendimento:', error.response?.data || error.message);
    throw new Error('Falha ao buscar índice de atendimento');
  }
};

/**
 * Formata os dados recebidos do backend para o formato esperado no frontend.
 * @param {string} dataInicial - Data inicial no formato dd/MM/yyyy.
 * @param {string} dataFinal - Data final no formato dd/MM/yyyy.
 */
export const loadIndiceAtendimento = async (dataInicial, dataFinal) => {
  try {
    const data = await fetchIndiceAtendimento(dataInicial, dataFinal);

    return data.map((item) => ({
      data_emissao: item.dataEmissao,
      CTE: item.numeroDocTransporte,
      NF: item.notaFiscal,
      remetente: item.remetente,
      origem: item.origem,
      destinatario: item.destinatario,
      destino: item.destino,
      praça_destino: item.pracaDestino,
      previsao_entrega: item.previsaoEntrega,
      entregue_em: item.entregueEm,
      cte_entregue: item.cteEntregue,
      cte_no_prazo: item.cteNoPrazo,
      percentual_cte_no_prazo: `${item.percentualCteNoPrazo.toFixed(2)}`,
      atraso: item.atraso,
      percentual_cte_atraso: `${item.percentualCteAtraso.toFixed(2)}`,
      atraso_transportadora: item.atrasoTransportadora,
      cte_atraso_transportadora: `${item.percentualCteAtrasoTransportadora.toFixed(2)}`,
      atraso_cliente: item.atrasoCliente,
    }));
  } catch (error) {
    console.error('Erro ao carregar índice de atendimento:', error.message);
    throw error;
  }
};
