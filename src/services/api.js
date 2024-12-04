import axios from 'axios';

// Atualize as URLs para HTTPS
const API_AUTH_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/authorization';
const API_INDICE_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/painel/IndiceAtendimentoPraca';

let token = null;
let tokenExpiration = null;

export const getAuthToken = async () => {
  try {
    const credentials = btoa('gustavo.carraro:hatuna10'); // Substitua com credenciais corretas
    const response = await axios.post(
      API_AUTH_URL,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    // Extraindo o token corretamente do array `retorno`
    const tokenData = response.data?.retorno?.[0]?.token;
    if (!tokenData) {
      throw new Error('Token não encontrado na resposta da API');
    }

    token = tokenData; // Salva o token
    tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // Define validade do token (24 horas)
    return token;
  } catch (error) {
    console.error('Erro ao obter token:', error.response?.data || error.message);
    throw new Error('Falha na autenticação');
  }
};

export const fetchIndiceAtendimento = async (dataInicial, dataFinal) => {
  try {
    // Obtenha um novo token se necessário
    if (!token || new Date() >= tokenExpiration) {
      await getAuthToken();
    }

    const response = await axios.get(API_INDICE_URL, {
      params: {
        dataInicial,
        dataFinal,
      },
      headers: {
        Authorization: `Bearer ${token}`, // Enviando o token no formato correto
      },
    });

    return response.data.indiceAtendimentoPraca; // Certifique-se de que o retorno da API corresponde
  } catch (error) {
    console.error('Erro ao buscar índice de atendimento:', error.response?.data || error.message);
    throw new Error('Falha ao buscar índice de atendimento');
  }
};
