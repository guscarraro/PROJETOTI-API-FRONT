import axios from "axios";
import qs from "qs";

// ✅ Agora pegamos do `.env`
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://projetoti-api-production.up.railway.app";

const api = axios.create({
  baseURL: API_URL.replace("http://", "https://"), // 🔥 Substitui qualquer HTTP por HTTPS
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

const apiLocal = {
  getMotoristas: () => api.get("/motoristas/"),
  createOrUpdateMotorista: (data) => api.post("/motoristas/", data),
  deleteMotorista: (id) => api.delete(`/motoristas/${id}`),

  updateCamposCliente: (clienteId, data) =>
    api.put(`/clientes/${clienteId}/campos-opcionais`, data),

  getClientes: () => api.get("/clientes/"),
  createOrUpdateCliente: (data) => api.post("/clientes/", data),
  deleteCliente: (id) => api.delete(`/clientes/${id}`),

  getNomesOcorrencias: () => api.get("/nomes-ocorrencias/"),
  createOrUpdateNomeOcorrencia: (data) => api.post("/nomes-ocorrencias/", data),
  deleteNomeOcorrencia: (id) => api.delete(`/nomes-ocorrencias/${id}`),

  getOcorrencias: () => api.get("/ocorrencias/"),
  createOrUpdateOcorrencia: (data) => api.post("/ocorrencias/", data),
  deleteOcorrencia: (id) => api.delete(`/ocorrencias/${id}`),
  getOcorrenciasFiltradas: (filters) =>
    api.post("/ocorrencias/filtrar", filters),
  updateCobrancaAdicional: (data) =>
    api.put("/ocorrencias/cobranca-adicional", data),

  getOcorrenciasSTH: () => api.get("/ocorren-sth/"),
  createOrUpdateOcorrenciaSTH: (data) => api.post("/ocorren-sth/", data),
  deleteOcorrenciaSTH: (id) => api.delete(`/ocorren-sth/${id}`),
  getDashboardSTH: (filters) => api.post("/ocorren-sth/filtrar", filters),
  updateOcorrenciaStatus: (data) =>
    api.put("/ocorrencias/atualizar-status", data),
  getOcorrenciasPendentes: () => api.get("/ocorrencias/pendentes"),

  getFaltas: () => api.get("/faltas/"),
  getFaltasFiltradas: (filters) => api.post("/faltas/filtrar", filters),
  createOrUpdateFalta: (data) => api.post("/faltas/", data),
  deleteFalta: (id) => api.delete(`/faltas/${id}`),

  getDestinos: () => api.get("/destinos/"),
  createOrUpdateDestino: (data) => api.post("/destinos/", data),
  deleteDestino: (id) => api.delete(`/destinos/${id}`),
  updateCamposPaletizacaoDestino: (destinoId, data) =>
    api.patch(`/destinos/paletizacao/${destinoId}`, data),
  // 🔧 Paletizado
  getPaletizacoes: () => api.get("/paletizado/"),
  createOrUpdatePaletizacao: (data) => api.post("/paletizado/", data),
  deletePaletizacao: (id) => api.delete(`/paletizado/${id}`),
  filtrarPaletizacoes: (filters) => api.post("/paletizado/filtrar", filters),
  atualizarNrCobranca: (id, nr_cobranca, verificado) =>
    api.patch(`/paletizado/atualizar-cobranca/${id}`, {
      nr_cobranca,
      verificado,
    }),

  getControleEstoque: () => api.get("/estoque/"),
  createOrUpdateControleEstoque: (data) => api.post("/estoque/", data),
  deleteControleEstoque: (id) => api.delete(`/estoque/${id}`),
  getControleEstoqueFiltrado: (filters) =>
    api.post("/controle-estoque/filtrar", filters),
  updateSetorControleEstoque: (data) =>
    api.put("/controle-estoque/setor", data),

  getViagens: () => api.get("/viagens/"),
  getProximoNumeroViagem: () => api.get("/viagens/proximo_numero_viagem"),
  getViagemByNumero: (numero_viagem) => api.get(`/viagens/${numero_viagem}`),
  createOrUpdateViagem: (data) => api.post("/viagens/", data),
  updateViagem: (data) => api.put("/viagens/update", data),
  deleteViagem: (viagemId) => api.delete(`/viagens/delete/${viagemId}`),
  updateViagem: (viagemId, data) =>
    api.put(`/viagens/atualizar_viagem/${viagemId}`, data),
  getDocumentosTransporte: () => api.get("/documentos-transporte/"),
  getViagensFiltradas: (filters) => api.post("/viagens/filtrar", filters),
  getOpcoesFiltrosViagens: () => api.get("/viagens/opcoes-filtros"),
  getViagemById: (viagemId) => api.get(`/viagens/id/${viagemId}`),

  // 🔧 Responsáveis
  getResponsaveis: () => api.get("/responsaveis/"),
  createResponsavel: (data) => api.post("/responsaveis/", data),
  updateResponsavel: (id, data) => api.put(`/responsaveis/${id}`, data),
  deleteResponsavel: (id) => api.delete(`/responsaveis/${id}`),
  getResponsavelById: (id) => api.get(`/responsaveis/${id}`),
  getRemetentesDoResponsavel: (responsavelId) =>
    api.get(`/responsaveis/${responsavelId}/remetentes`),
  // 🔧 Atualizar grupo econômico de um cliente

  getGrupoEco: () => api.get("/grupo-eco/"),
  createOrUpdateGrupoEco: (data) => api.post("/grupo-eco/", data),
  updateGrupoEco: (id, data) => api.put(`/grupo-eco/${id}`, data),

  deleteGrupoEco: (id) => api.delete(`/grupo-eco/${id}`),

  getColetas: () => api.get("/coletas/"),
  createOrUpdateColeta: (data) => api.post("/coletas/", data),
  deleteColeta: (id) => api.delete(`/coletas/${id}`),
  updateColetaParcial: (coletaId, data) =>
    api.put(`/coletas/atualizar/${coletaId}`, data),
  getColetaById: (id) => api.get(`/coletas/${id}`),

  getDocumentoTransporte: (numero_cte) =>
    api.get(`/documentos-transporte/${numero_cte}`),

  getCustosFrete: (filters) => api.get("/custos-frete/"),
  createOrUpdateCustosFrete: (data) => api.post("/custos-frete/", data),
  deleteCustosFrete: (id) => api.delete(`/custos-frete/${id}`),

  getCicloPedido: () => api.get("/processamento/ciclo-pedido/"),
  getBalanceteCarraro: () => api.get("/processamento/balancete-carraro/"),
  getFechamentoOperacao: () => api.get("/processamento/fechamento-operacao"),

  getRecebimentos: () => api.get("/recebimento/"),
  getRecebimentoById: (id) => api.get(`/recebimento/${id}`),
  createRecebimento: (data) => api.post("/recebimento", data),
  deleteRecebimento: (id) => api.delete(`/recebimento/${id}`),

  getNotasRecebidas: (recebimentoId) => api.get(`/notas/${recebimentoId}`),
  createNotaRecebida: (data) => api.post("/notas", data),
  deleteNotaRecebida: (id) => api.delete(`/notas/${id}`),

  getEtapasRecebimento: (recebimentoId) => api.get(`/etapas/${recebimentoId}`),
  createEtapasRecebimento: (data) => api.post("/etapas", data),

  getChecklistInspecao: (etapasId) => api.get(`/checklist/${etapasId}`),
  createChecklistInspecao: (data) => api.post("/checklist", data),

  getOcorrenciasRecebimento: (notaId) => api.get(`/ocorrencia/${notaId}`),
  createOcorrenciaRecebimento: (data) => api.post("/ocorrencia", data),
  deleteOcorrenciaRecebimento: (id) => api.delete(`/ocorrencia/${id}`),

};

export default apiLocal;
