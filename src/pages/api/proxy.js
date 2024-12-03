import axios from 'axios';

export default async function handler(req, res) {
  const { path, ...queryParams } = req.query; // Recebe parâmetros da requisição
  const { method, body } = req; // Extrai método e corpo da requisição

  // Endpoint da API de destino
  const API_BASE_URL = 'http://cloud.escalasoft.com.br:8051/escalasoft';

  // Monta a URL da API com os parâmetros de consulta
  const targetUrl = `${API_BASE_URL}/${path}`;

  try {
    const response = await axios({
      url: targetUrl,
      method: method || 'GET', // Usa o método recebido (POST, GET, etc.)
      data: body, // Corpo da requisição (para POST/PUT)
      params: queryParams, // Parâmetros de consulta
      headers: req.headers, // Encaminha os headers do cliente
    });

    // Retorna a resposta do backend para o cliente
    res.status(response.status).json(response.data);
  } catch (error) {
    // Captura erros da API de destino e retorna para o cliente
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'Erro interno no proxy' };

    res.status(status).json(data);
  }
}
