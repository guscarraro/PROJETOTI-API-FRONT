
import axios from 'axios';

// Atualize as URLs para HTTPS
const API_AUTH_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/authorization';
const API_INDICE_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/painel/IndiceAtendimentoPraca';
const API_OCORRENCIAS_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/ocorrencia/ExportarOcorrencias';

let token = localStorage.getItem('token') || null;
let tokenExpiration = localStorage.getItem('tokenExpiration') || null;

export const getAuthToken = async () => {
  try {
    // Verifica se o token existe no localStorage e se ainda é válido
    if (!token || !tokenExpiration) {
      console.log("Token inexistente. Gerando um novo...");
      return await generateNewToken();
    }

    console.log("Reutilizando token existente:", token);
    return token;
  } catch (error) {
    console.error('Erro ao obter token:', error.response?.data || error.message);
    throw new Error('Falha na autenticação. Não foi possível obter o token.');
  }
};

const generateNewToken = async () => {
  try {
    const credentials = btoa('gustavo.carraro:hatuna10');
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

    // Atualiza o token e sua validade no localStorage
    token = tokenData;
    tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validade
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiration', tokenExpiration.toISOString());

    console.log("Novo token gerado:", token);
    return token;
  } catch (error) {
    console.error('Erro ao gerar novo token:', error.response?.data || error.message);
    throw new Error('Não foi possível gerar um novo token.');
  }
};



export const fetchIndiceAtendimento = async (dataInicial, dataFinal) => {
  try {
    let token = await getAuthToken(); // Obtém um token válido

    const response = await axios.get(API_INDICE_URL, {
      params: { dataInicial, dataFinal },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.indiceAtendimentoPraca || [];
  } catch (error) {
    if (
      error.response?.status === 401 &&
      error.response?.data?.retorno?.[0]?.mensagem === 'Token vencido'
    ) {
      console.warn('Token vencido. Tentando renovar o token...');

      try {
        const newToken = await generateNewToken(); // Gera um novo token
        const retryResponse = await axios.get(API_INDICE_URL, {
          params: { dataInicial, dataFinal },
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        return retryResponse.data.indiceAtendimentoPraca || [];
      } catch (retryError) {
        console.error(
          'Erro ao buscar índice de atendimento após renovar token:',
          retryError.response?.data || retryError.message
        );
        return [];
      }
    }

    console.error('Erro ao buscar índice de atendimento:', error.response?.data || error.message);
    return [];
  }
};






export const fetchOcorrencias = async (dataInicial) => {
  try {
    let token = await getAuthToken(); // Obtém um token válido

    const response = await axios.get(API_OCORRENCIAS_URL, {
      params: { dataInicial },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.ocorrencia || [];
  } catch (error) {
    if (
      error.response?.status === 401 &&
      error.response?.data?.retorno?.[0]?.mensagem === 'Token vencido'
    ) {
      console.warn('Token vencido. Tentando renovar o token...');

      try {
        const newToken = await generateNewToken(); // Gera um novo token
        const retryResponse = await axios.get(API_OCORRENCIAS_URL, {
          params: { dataInicial },
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        return retryResponse.data.ocorrencia || [];
      } catch (retryError) {
        console.error(
          'Erro ao buscar ocorrências após renovar token:',
          retryError.response?.data || retryError.message
        );
        return [];
      }
    }

    console.error('Erro ao buscar ocorrências:', error.response?.data || error.message);
    return [];
  }
};




