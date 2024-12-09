import axios from 'axios';

// Atualize as URLs para HTTPS
const API_AUTH_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/authorization';
const API_INDICE_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/painel/IndiceAtendimentoPraca';

let token = null;
let tokenExpiration = null;

export const getAuthToken = async () => {
  try {
    // Sempre gera um novo token, não verifica expiração para evitar problemas com token expirado
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

    const tokenData = response.data?.retorno?.[0]?.token;
    if (!tokenData) {
      throw new Error('Token não encontrado na resposta da API');
    }

    // Salva o novo token e sua data de expiração
    token = tokenData;
    tokenExpiration = new Date(Date.now() + 12 * 60 * 60 * 1000); // Validade do token (24 horas)

    return token;
  } catch (error) {
    console.error('Erro ao obter token:', error.response?.data || error.message);
    throw new Error('Falha na autenticação. Não foi possível obter o token.');
  }
};

export const fetchIndiceAtendimento = async (dataInicial, dataFinal) => {
  try {
    // Garante que um token válido seja usado
    const token = await getAuthToken();

    const response = await axios.get(API_INDICE_URL, {
      params: { dataInicial, dataFinal },
      headers: {
        Authorization: `Bearer ${token}`, // Usa o token renovado
      },
    });

    return response.data.indiceAtendimentoPraca; // Certifique-se de que a resposta seja válida
  } catch (error) {
    console.error('Erro ao buscar índice de atendimento:', error.response?.data || error.message);
    return []; // Em caso de erro, retorna uma lista vazia (não atualiza os dados)
  }
};
