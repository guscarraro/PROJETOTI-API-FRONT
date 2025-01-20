import axios from "axios";
import qs from "qs";
// Configuração base do axios
const api = axios.create({
  baseURL: "https://projetoti-api-production.up.railway.app",
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),  // Substitua pelo URL do Railway após o deploy
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
  updateCobrancaAdicional: (data) => api.put("/ocorrencias", data),
  getOcorrenciasFiltradas: (filters) =>
    api.post("/ocorrencias/filtrar", filters),
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

  getDashboardSTH: (filters) => api.post("/dashboard-sth/filtrar", filters),

};

export default apiLocal;
