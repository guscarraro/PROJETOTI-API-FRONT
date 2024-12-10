
import axios from 'axios';

// Atualize as URLs para HTTPS
const API_AUTH_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/authorization';
const API_INDICE_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/painel/IndiceAtendimentoPraca';
const API_OCORRENCIAS_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/ocorrencia/ExportarOcorrencias';

let token = null;
let tokenExpiration = null;

export const getAuthToken = async () => {
  try {
    // Verifica se o token no localStorage ainda é válido
    if (!token || !tokenExpiration || new Date() > new Date(tokenExpiration)) {
      console.log("Token expirado ou inexistente. Gerando um novo...");
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

      // Salva o token e a validade
      token = tokenData;
      tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // Expira em 1 hora
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiration', tokenExpiration.toISOString());
    } else {
      console.log("Reutilizando token existente...");
      token = localStorage.getItem('token');
      tokenExpiration = localStorage.getItem('tokenExpiration');
    }

    return token;
  } catch (error) {
    console.error('Erro ao obter token:', error.response?.data || error.message);
    throw new Error('Falha na autenticação. Não foi possível obter o token.');
  }
};


export const fetchIndiceAtendimento = async (dataInicial, dataFinal) => {
  try {
    const token = await getAuthToken(); // Garante que o token é válido
    const response = await axios.get(API_INDICE_URL, {
      params: { dataInicial, dataFinal },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.indiceAtendimentoPraca || [];
  } catch (error) {
    console.error('Erro ao buscar índice de atendimento:', error.response?.data || error.message);
    return [];
  }
};



export const fetchOcorrencias = async (dataInicial) => {
  try {
    const token = await getAuthToken(); // Garante que o token é válido
    const response = await axios.get(API_OCORRENCIAS_URL, {
      params: { dataInicial },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.ocorrencia || [];
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error.response?.data || error.message);
    return [];
  }
};




