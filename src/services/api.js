import axios from 'axios';

// Atualize as URLs para HTTPS
const API_AUTH_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/authorization';
const API_INDICE_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/painel/IndiceAtendimentoPraca';

let token = null;
let tokenExpiration = null;

export const getAuthToken = async () => {
  try {
    const credentials = btoa('gustavo.carraro:hatuna10'); // Credenciais básicas
    const response = await axios.post(
      API_AUTH_URL,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    // Verifica e salva o token
    const tokenData = response.data?.retorno?.[0]?.token;
    if (!tokenData) {
      throw new Error('Token não encontrado na resposta da API');
    }

    token = tokenData;
    tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // Validade do token (24 horas)
    return token;
  } catch (error) {
    console.error('Erro ao obter token:', error.response?.data || error.message);
    throw new Error('Falha na autenticação. Não foi possível obter o token.');
  }
};

export const fetchIndiceAtendimento = async (dataInicial, dataFinal) => {
  try {
    // Sempre renova o token se estiver próximo de expirar ou for inválido
    if (!token || new Date() >= tokenExpiration) {
      await getAuthToken();
    }

    const response = await axios.get(API_INDICE_URL, {
      params: {
        dataInicial,
        dataFinal,
      },
      headers: {
        Authorization: `Bearer ${token}`, // Envia o token válido
      },
    });

    return response.data.indiceAtendimentoPraca; // Certifique-se de que a resposta seja válida
  } catch (error) {
    if (error.response?.status === 401) {
      // Caso o token seja inválido, tenta atualizar e repetir a requisição
      console.warn('Token expirado. Tentando obter um novo token...');
      await getAuthToken();
      return fetchIndiceAtendimento(dataInicial, dataFinal); // Repete a chamada com o novo token
    }

    console.error('Erro ao buscar índice de atendimento:', error.response?.data || error.message);
    throw new Error('Falha ao buscar índice de atendimento.');
  }
};

