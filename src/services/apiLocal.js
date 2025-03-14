import axios from "axios";
import qs from "qs";

const baseURL ="https://projetoti-api-production.up.railway.app";

const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

console.log("Axios está usando:", api.defaults.baseURL);
console.log("🚀 API Base URL:", process.env.NEXT_PUBLIC_API_URL);

const apiLocal = {
  getMotoristas: () => api.get("/motoristas"),
  createOrUpdateMotorista: (data) => api.post("/motoristas", data),
  deleteMotorista: (id) => api.delete(`/motoristas/${id}`),

  getClientes: () => api.get("/clientes"),
  createOrUpdateCliente: (data) => api.post("/clientes", data),
  deleteCliente: (id) => api.delete(`/clientes/${id}`),

  getNomesOcorrencias: () => api.get("/nomes-ocorrencias"),
  createOrUpdateNomeOcorrencia: (data) => api.post("/nomes-ocorrencias", data),
  deleteNomeOcorrencia: (id) => api.delete(`/nomes-ocorrencias/${id}`),

  getOcorrencias: () => api.get("/ocorrencias"),
  createOrUpdateOcorrencia: (data) => api.post("/ocorrencias", data),
  deleteOcorrencia: (id) => api.delete(`/ocorrencias/${id}`),
  getOcorrenciasFiltradas: (filters) => api.post("/ocorrencias/filtrar", filters),
  updateCobrancaAdicional: (data) => api.put("/ocorrencias/cobranca-adicional", data),

  getOcorrenciasSTH: () => api.get("/ocorren-sth"), 
  createOrUpdateOcorrenciaSTH: (data) => api.post("/ocorren-sth", data),
  deleteOcorrenciaSTH: (id) => api.delete(`/ocorren-sth/${id}`),
  getDashboardSTH: (filters) => api.post("/ocorren-sth/filtrar", filters),

  getFaltas: () => api.get("/faltas"),
  getFaltasFiltradas: (filters) => api.post("/faltas/filtrar", filters),
  createOrUpdateFalta: (data) => api.post("/faltas", data),
  deleteFalta: (id) => api.delete(`/faltas/${id}`),

  getDestinos: () => api.get("/destinos"),
  createOrUpdateDestino: (data) => api.post("/destinos", data),
  deleteDestino: (id) => api.delete(`/destinos/${id}`), 

  getControleEstoque: () => api.get("/estoque"), 
  createOrUpdateControleEstoque: (data) => api.post("/estoque", data),
  deleteControleEstoque: (id) => api.delete(`/estoque/${id}`), 
  getControleEstoqueFiltrado: (filters) => api.post("/controle-estoque/filtrar", filters),
  updateSetorControleEstoque: (data) => api.put("/controle-estoque/setor", data),

  getViagens: () => api.get("/viagens"),
  getViagemByNumero: (numero_viagem) => api.get(`/viagens/${numero_viagem}`),
  createOrUpdateViagem: (data) => api.post("/viagens", data),
  updateViagem: (data) => api.put("/viagens/update", data),
  deleteViagem: (numero_viagem) => api.delete(`/viagens/${numero_viagem}`),

  getDocumentoTransporte: (numero_cte) => api.get(`/documentos-transporte/${numero_cte}`),

  getCustosFrete: (filters) => api.get("/custos-frete", { params: filters }),
  createOrUpdateCustosFrete: (data) => api.post("/custos-frete", data),
  deleteCustosFrete: (id) => api.delete(`/custos-frete/${id}`),

  getCicloPedido: () => api.get("/processamento/ciclo-pedido"),
  getBalanceteCarraro: () => api.get("/processamento/balancete-carraro"),
  getFechamentoOperacao: () => api.get("/processamento/fechamento-operacao"),
};

export default apiLocal;
