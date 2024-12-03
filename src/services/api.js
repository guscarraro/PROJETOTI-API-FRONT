const API_PROXY_URL = '/api/proxy';

export const getAuthToken = async () => {
  try {
    const response = await axios.post(
      `${API_PROXY_URL}?path=authorization`,
      {}, // Corpo da requisição
      {
        headers: {
          Authorization: `Basic ${btoa('gustavo.carraro:hatuna10')}`,
        },
      }
    );

    const tokenData = response.data?.retorno?.[0]?.token;
    if (!tokenData) {
      throw new Error('Token não encontrado na resposta da API');
    }

    return tokenData;
  } catch (error) {
    console.error('Erro ao obter token:', error.response?.data || error.message);
    throw new Error('Falha na autenticação');
  }
};

export const fetchIndiceAtendimento = async (dataInicial, dataFinal) => {
  try {
    const response = await axios.get(
      `${API_PROXY_URL}?path=operacional/painel/IndiceAtendimentoPraca`,
      {
        params: { dataInicial, dataFinal },
        headers: {
          Authorization: `Bearer ${token}`, // Certifique-se de ter gerenciado o token
        },
      }
    );

    return response.data.indiceAtendimentoPraca;
  } catch (error) {
    console.error('Erro ao buscar índice de atendimento:', error.response?.data || error.message);
    throw new Error('Falha ao buscar índice de atendimento');
  }
};
