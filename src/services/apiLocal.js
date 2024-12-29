import axios from "axios";

// Configuração base do axios
const api = axios.create({
  baseURL: "https://projetoti-api-production.up.railway.app", // Substitua pelo URL do Railway após o deploy
});

// Endpoints do backend

const apiLocal = {
  // Motoristas
  getMotoristas: () => api.get("/motoristas"),
  createOrUpdateMotorista: (data) => api.post("/motoristas", data),
  deleteMotorista: (id) => api.delete(`/motoristas/${id}`),

  // Clientes
  getClientes: () => api.get("/clientes"),
  createOrUpdateCliente: (data) => api.post("/clientes", data),
  deleteCliente: (id) => api.delete(`/clientes/${id}`),

  // Tipos de Ocorrências
  getNomesOcorrencias: () => api.get("/nomes-ocorrencias"),
  createOrUpdateNomeOcorrencia: (data) => api.post("/nomes-ocorrencias", data),
  deleteNomeOcorrencia: (id) => api.delete(`/nomes-ocorrencias/${id}`),

  // Ocorrências
  getOcorrencias: () => api.get("/ocorrencias"),
  createOrUpdateOcorrencia: (data) => api.post("/ocorrencias", data),
  deleteOcorrencia: (id) => api.delete(`/ocorrencias/${id}`),
  
  // Ocorrências STH
  getOcorrenciasSTH: () => api.get("/ocorren-sth"), // Listar todas as ocorrências STH
  createOrUpdateOcorrenciaSTH: (data) => api.post("/ocorren-sth", data), // Criar ou atualizar uma ocorrência STH
  deleteOcorrenciaSTH: (id) => api.delete(`/ocorren-sth/${id}`), // Excluir uma ocorrência STH pelo ID

  // Faltas
  getFaltas: () => api.get("/faltas"),
  createOrUpdateFalta: (data) => api.post("/faltas", data),
  deleteFalta: (id) => api.delete(`/faltas/${id}`),

  // Destinos
  getDestinos: () => api.get("/destinos"),
  createOrUpdateDestino: (data) => api.post("/destinos", data),
  deleteDestino: (id) => api.delete(`/destinos/${id}`),


  getDadosNota: (nf) => api.get(`/dados-nota`, { params: { nf } }),
  // Outros endpoints (dados otimizados, ciclo pedido, etc.)
  // getDadosOtimizados: () => api.get("/dados-otimizados"),
  // getCicloPedido: () => api.get("/ciclo-pedido"),
  // getBalanceteCarraro: () => api.get("/balancete-carraro"),
  // getFechamentoOperacao: () => api.get("/fechamento-operacao"),
};

export default apiLocal;
