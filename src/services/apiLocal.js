import axios from "axios";
import qs from "qs";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://projetoti-api-production.up.railway.app";

const api = axios.create({
  baseURL: API_URL.replace("http://", "https://"),
  headers: { "Content-Type": "application/json" },
  timeout: 100 * 60 * 1000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  withCredentials: true, // essencial p/ cookie HttpOnly
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// 🔐 401 handler sem causar loop (ignora /auth/login e /auth/me)
let isRedirecting401 = false;
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    const url = (err?.config?.url || "").toLowerCase();

    if (status === 401) {
      if (url.includes("/auth/login") || url.includes("/auth/me")) {
        return Promise.reject(err);
      }
      if (!isRedirecting401 && typeof window !== "undefined") {
        isRedirecting401 = true;
        localStorage.removeItem("user");
        if (window.location.pathname !== "/") {
          window.location.replace("/");
        }
      }
    }
    return Promise.reject(err);
  }
);

const apiLocal = {
  // ========================
  // AUTENTICAÇÃO
  // ========================
  authLogin: (email, senha) => api.post("/auth/login", { email, senha }),
  authLogout: () => api.post("/auth/logout"),
  authMe: () => api.get("/auth/me"),

  // ========================
  // Motoristas / Clientes / ...
  // ========================
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

  // Paletizado
  getPaletizacoes: () => api.get("/paletizado/"),
  createOrUpdatePaletizacao: (data) => api.post("/paletizado/", data),
  deletePaletizacao: (id) => api.delete(`/paletizado/${id}`),
  filtrarPaletizacoes: (filters) => api.post("/paletizado/filtrar", filters),
  atualizarNrCobranca: (id, nr_cobranca, verificado) =>
    api.patch(`/paletizado/atualizar-cobranca/${id}`, {
      nr_cobranca,
      verificado,
    }),

  // Armazenagem
  getArmazenagem: () => api.get("/armazenagem/"),
  createOrUpdateArmazenagem: (data) => api.post("/armazenagem/", data),
  deleteArmazenagem: (id) => api.delete(`/armazenagem/${id}`),
  filtrarArmazenagem: (filters) => api.post("/armazenagem/filtrar", filters),
  atualizarNrCobrancaArmazenagem: (id, nr_cobranca, verificado) =>
    api.patch(`/armazenagem/atualizar-cobranca/${id}`, {
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

  // Viagens
  getViagens: () => api.get("/viagens/"),
  getProximoNumeroViagem: () => api.get("/viagens/proximo_numero_viagem"),
  getViagemByNumero: (numero_viagem) => api.get(`/viagens/${numero_viagem}`),
  createOrUpdateViagem: (data) => api.post("/viagens/", data),
  updateViagem: (viagemId, data) =>
    api.put(`/viagens/atualizar_viagem/${viagemId}`, data),
  deleteViagem: (viagemId) => api.delete(`/viagens/delete/${viagemId}`),
  getDocumentosTransporte: () => api.get("/documentos-transporte/"),
  getViagensFiltradas: (filters) => api.post("/viagens/filtrar", filters),
  getOpcoesFiltrosViagens: () => api.get("/viagens/opcoes-filtros"),
  getViagemById: (viagemId) => api.get(`/viagens/id/${viagemId}`),

  // Fechamento
  getFechamento: (params) => api.get("/fechamento_op/", { params }),
  getFechamentoPorMes: (mes) => api.get("/fechamento_op/", { params: { mes } }),
  getFechamentoPorData: (data) =>
    api.get("/fechamento_op/", { params: { data } }),
  uploadFechamentoExcel: (file, config = {}) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/fechamento_op/", form, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    });
  },
  startFechamentoImport: (file, config = {}) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/fechamento_op/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    });
  },
  getFechamentoImportStatus: (jobId) =>
    api.get(`/fechamento_op/import/${jobId}/status`),

  // Responsáveis / Grupo Eco / Coletas ...
  getResponsaveis: () => api.get("/responsaveis/"),
  createResponsavel: (data) => api.post("/responsaveis/", data),
  updateResponsavel: (id, data) => api.put(`/responsaveis/${id}`, data),
  deleteResponsavel: (id) => api.delete(`/responsaveis/${id}`),
  getResponsavelById: (id) => api.get(`/responsaveis/${id}`),
  getRemetentesDoResponsavel: (responsavelId) =>
    api.get(`/responsaveis/${responsavelId}/remetentes`),

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

  // Recebimento + Notas + Etapas + Checklist + Ocorrências (receb)
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

  // Usuários / Setores
  getUsuarios: () => api.get("/user/usuarios/"),
  createUsuario: (data) => api.post("/user/usuarios/", data),
  updateUsuario: (id, data) => api.put(`/user/usuarios/${id}`, data),
  deleteUsuario: (id) => api.delete(`/user/usuarios/${id}`),
  setUsuarioDarkmode: (id, enabled) =>
    api.put(`/user/usuarios/${id}`, { darkmode: enabled ? "S" : "N" }),
  adminRevokeUserSessions: (userId) =>
    api.post(`/auth/sessions/revoke/${userId}`),

  getSetores: () => api.get("/setor/setores/"),
  createSetor: (data) => api.post("/setor/setores/", data),
  updateSetor: (id, data) => api.put(`/setor/setores/${id}`, data),
  deleteSetor: (id) => api.delete(`/setor/setores/${id}`),

  // ========================
  // PROJETOS
  // ========================
  getProjetos: (visibleFor) =>
    api.get("/projetos/", {
      params: visibleFor?.length ? { visible_for: visibleFor } : undefined,
    }),

  getProjetoById: (id) => api.get(`/projetos/${id}`),

  createProjeto: (data) => api.post("/projetos/", data),

  updateProjeto: (id, data) => api.put(`/projetos/${id}`, data),

  updateProjetoSetores: (id, setores, actor_sector_id, setor_users) =>
    api.put(`/projetos/${id}/setores`, {
      setores,
      actor_sector_id,
      ...(setor_users ? { setor_users } : {}),
    }),
  lockProjeto: (id, action, actor_sector_id) =>
    api.post(`/projetos/${id}/lock`, { action, actor_sector_id }),

  changeProjetoStatus: (id, status, actor_sector_id) =>
    api.post(`/projetos/${id}/status`, { status, actor_sector_id }),

  getProjetoLogs: (id) => api.get(`/projetos/${id}/logs`),

  deleteProjeto: (id, actor_sector_id) =>
    api.delete(`/projetos/${id}`, { data: { actor_sector_id } }),

  // ========================
  // NOTIFICAÇÕES DE PROJETOS
  // ========================
  getNotifCounters: (userId) =>
    api.get("/projects/notifications/counters", {
      params: { user_id: String(userId) },
    }),

  getNotifFeed: (
    userId,
    { projectId, unseenOnly = false, seenOnly = false, limit = 50, before } = {}
  ) =>
    api.get("/projects/notifications/feed", {
      params: {
        user_id: String(userId),
        ...(projectId ? { project_id: String(projectId) } : {}),
        ...(unseenOnly ? { unseen_only: true } : {}),
        ...(seenOnly ? { seen_only: true } : {}),
        ...(before ? { before } : {}),
        limit,
      },
    }),

  markNotifsSeen: (userId, notificationIds) =>
    api.put("/projects/notifications/mark-seen", {
      user_id: String(userId),
      notification_ids: notificationIds.map(String),
    }),

  markProjectSeen: (userId, projectId) =>
    api.put("/projects/notifications/mark-project-seen", {
      user_id: String(userId),
      project_id: String(projectId),
    }),

  // Custos do projeto
  listProjetoCustos: (projectId) => api.get(`/projetos/${projectId}/custos`),
  addProjetoCustos: (projectId, body) =>
    api.post(`/projetos/${projectId}/custos`, body),
  updateProjetoCusto: (projectId, costId, body) =>
    api.put(`/projetos/${projectId}/custos/${costId}`, body),
  deleteProjetoCusto: (projectId, costId) =>
    api.delete(`/projetos/${projectId}/custos/${costId}`),
  payParcela: (projectId, costId, parcelIndex, actorSectorId) =>
    api.post(
      `/projetos/${projectId}/custos/${costId}/parcelas/${parcelIndex}/pagar`,
      { actor_sector_id: Number(actorSectorId) }
    ),
  getProjetoParcels: (projectId, costId) =>
    api.get(`/projetos/${projectId}/custos/${costId}/parcelas`),

  // Timeline (linhas e células)
  unpayParcela: (projectId, costId, parcelIndex, actorSectorId) =>
    api.post(
      `/projetos/${projectId}/custos/${costId}/parcelas/${parcelIndex}/desmarcar`,
      { actor_sector_id: Number(actorSectorId) }
    ),

  listProjetoRows: (projectId) => api.get(`/projetos/${projectId}/rows`),

  addProjetoRow: (projectId, body) =>
    api.post(`/projetos/${projectId}/rows`, body),

  updateProjetoRow: (projectId, rowId, body, actor_sector_id) =>
    api.put(`/projetos/${projectId}/rows/${rowId}`, {
      ...body, // { title?, row_sectors?, stage_no?, stage_label?, assignee_setor_id?, assignees? }
      actor_sector_id,
    }),

  setProjetoRowAssignee: (projectId, rowId, body) =>
    api.put(`/projetos/${projectId}/rows/${rowId}/assignee`, body),

  deleteProjetoRow: (projectId, rowId, actor_sector_id) =>
    api.delete(`/projetos/${projectId}/rows/${rowId}`, {
      params: { actor_sector_id },
    }),

  deleteProjetoCellComment: (
    projectId,
    rowId,
    dayISO,
    commentId,
    actorSectorId
  ) =>
    api.delete(
      `/projetos/${projectId}/rows/${rowId}/cells/${dayISO}/comments/${commentId}`,
      {
        params: { actor_sector_id: Number(actorSectorId) },
      }
    ),

  upsertProjetoCell: (projectId, rowId, dayISO, body) =>
    api.patch(`/projetos/${projectId}/rows/${rowId}/cells/${dayISO}`, body),

  clearProjetoCell: (projectId, rowId, dayISO, actor_sector_id) =>
    api.delete(`/projetos/${projectId}/rows/${rowId}/cells/${dayISO}`, {
      params: { actor_sector_id },
    }),

  reorderProjetoRows: (projectId, orders, actor_sector_id) =>
    api.post(`/projetos/${projectId}/rows/reorder`, {
      orders, // [{ row_id, order_index }]
      actor_sector_id,
    }),

  // services/apiLocal.js (já tem getProjetosLean)
  // services/apiLocal.js  (apenas este método)
  getProjetosLean: (visibleForSectors, status, visibleUsers) =>
    api.get("/projetos/lean", {
      params: {
        ...(status ? { status } : {}),
        ...(visibleForSectors?.length
          ? { visible_for: visibleForSectors }
          : {}),
        ...(visibleUsers?.length ? { visible_for_user: visibleUsers[0] } : {}), // << CORRIGIDO
      },
    }),

  patchProjetoMeta: (
    id,
    { nome, setores, add_setores, setor_users } = {},
    actor_sector_id
  ) =>
    api.patch(`/projetos/${id}/meta`, {
      actor_sector_id: Number(actor_sector_id),
      ...(nome != null ? { nome } : {}),
      ...(Array.isArray(setores) ? { setores: setores.map(Number) } : {}),
      ...(Array.isArray(add_setores)
        ? { add_setores: add_setores.map(Number) }
        : {}),
      ...(setor_users ? { setor_users } : {}),
    }),
};

export default apiLocal;
