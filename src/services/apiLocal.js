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
  withCredentials: true,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// 🔐 Interceptor de REQUEST: injeta Authorization: Bearer <token> se existir no localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers = config.headers || {};
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔐 401 handler
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
        localStorage.removeItem("authToken"); // ⬅️ limpa também o token Bearer
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
  decodeBarcodes: (imageDataUrl) =>
    api.post("/barcode/decode", { image: imageDataUrl }),

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

  getCustosFrete: () => api.get("/custos-frete/"),
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

  getProjetoById: (id, params = {}) => api.get(`/projetos/${id}`, { params }),

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

  // Timeline
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
      ...body,
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
    actorSectorId,
    actorUserId
  ) =>
    api.delete(
      `/projetos/${projectId}/rows/${rowId}/cells/${dayISO}/comments/${commentId}`,
      {
        params: {
          actor_sector_id: Number(actorSectorId),
          actor_user_id: String(actorUserId || ""),
        },
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
      orders,
      actor_sector_id,
    }),

  getProjetosLean: (visibleFor, status, userId) =>
    api.get("/projetos/lean", {
      params: {
        status,
        ...(userId ? { visible_for_user: userId } : {}),
        ...(Array.isArray(visibleFor) && visibleFor.length
          ? { visible_for: visibleFor }
          : {}),
      },
      paramsSerializer: (params) => {
        const usp = new URLSearchParams();
        if (params.status) usp.set("status", params.status);
        if (params.visible_for_user)
          usp.set("visible_for_user", params.visible_for_user);
        if (params.visible_for)
          for (let i = 0; i < params.visible_for.length; i++) {
            usp.append("visible_for", String(params.visible_for[i]));
          }
        return usp.toString();
      },
    }),

  // ========================
  // DASHBOARD (Conferência/Expedição)
  // ========================
  dashboardOverview: (params = {}) => api.get("/dashboard/", { params }),
  dashboardSummary: (params = {}) => api.get("/dashboard/summary", { params }),
  dashboardDailyConferencias: (params = {}) =>
    api.get("/dashboard/daily-conferencias", { params }),
  dashboardRankings: (params = {}) =>
    api.get("/dashboard/rankings", { params }),
  dashboardTopTransportadoras: (params = {}) =>
    api.get("/dashboard/top-transportadoras", { params }),
  dashboardLeadTimes: (params = {}) =>
    api.get("/dashboard/lead-times", { params }),

  // ========================
  // PEDIDOS
  // ========================

  getPedidos: (params = {}) => {
    const base = { events_preview: 5, ...params };

    // limpa null/undefined pra não sujar a querystring
    const clean = {};
    for (const key in base) {
      if (base[key] !== null && base[key] !== undefined && base[key] !== "") {
        clean[key] = base[key];
      }
    }

    return api.get("/pedidos/", { params: clean });
  },

  updatePedidoCaixas: (nr_pedido, data) =>
    api.put(`/pedidos/${nr_pedido}/caixas`, data),

  getPedidoByNr: (nr_pedido) => api.get(`/pedidos/${nr_pedido}`), // detalhe completo
  createPedido: (data) => api.post("/pedidos/", data),
  updatePedido: (nr_pedido, data) => api.put(`/pedidos/${nr_pedido}`, data),
  deletePedido: (id, payload) =>
    api.delete(`/pedidos/${id}`, { data: payload }),
  updatePedidoBasics: (nr_pedido, data) =>
    api.put(`/pedidos/${nr_pedido}/basics`, data),
  updatePedidoNF: (nr_pedido, { nota, by }) =>
    api.put(`/pedidos/${nr_pedido}/nf`, { nota, by }),

  // ========================
  // INTEGRANTES
  // ========================
  getIntegrantes: () => api.get("/integrantes/"),
  createIntegrante: (data) => api.post("/integrantes/", data),
  updateIntegrante: (id, data) => api.put(`/integrantes/${id}`, data),
  deleteIntegrante: (id) => api.delete(`/integrantes/${id}`),

  // ========================
  // CONFERÊNCIAS
  // ========================
  iniciarConferencia: (nr_pedido, data) =>
    api.post(`/conferencias/${nr_pedido}/iniciar`, data),
  salvarConferencia: (nr_pedido, data) =>
    api.post(`/conferencias/${nr_pedido}/salvar`, data),

  // lista ocorrências da última conferência
  getOcorrenciasConferencia: (nr_pedido) =>
    api.get(`/conferencias/${nr_pedido}/ocorrencias`),

  // CONFERÊNCIAS
  getUltimaConferencia: (nr_pedido) =>
    api.get(`/conferencias/${nr_pedido}/ultima`),

  finalizarConferencia: (nr_pedido, data) =>
    api.post(`/conferencias/${nr_pedido}/finalizar`, data),

  // envia ARRAY de ocorrências
  registrarOcorrenciaConferencia: (nr_pedido, ocorrenciasArray) =>
    api.post(`/conferencias/${nr_pedido}/ocorrencias`, ocorrenciasArray),

  getPedidosRelatorio: (params = {}) =>
    api.get("/pedidos/relatorio-pedidos", { params }),

  // ========================
  // EXPEDIÇÃO
  // ========================
  expedirPedido: (data) => api.post("/expedicao/expedir", data),
  expedirLote: (data) => api.post("/expedicao/expedir-lote", data),
// Frota (Horário Almoço)
getHorarioAlmoco: (params) =>
  api.get("/horario_almoco/horario-almoco", { params }),

getHorarioAlmocoOpcoes: (params) =>
  api.get("/horario_almoco/horario-almoco/opcoes-filtros", { params }),

indicadorHorarioAlmocoV3: (params) =>
  api.get("/horario_almoco/horario-almoco/indicador-v3", { params }),

getHorarioAlmocoInconsistencias: (params) =>
  api.get("/horario_almoco/horario-almoco/inconsistencias", { params }),

getHorarioAlmocoById: (id) =>
  api.get(`/horario_almoco/horario-almoco/${id}`),

updateHorarioAlmoco: (id, body, actor) =>
  api.put(`/horario_almoco/horario-almoco/${id}`, body, {
    params: { actor },
  }),

  // ========================
  // ETIQUETAS
  // ========================
  registrarImpressaoEtiquetas: (nr_pedido, data) =>
    api.post(`/etiquetas/${nr_pedido}/imprimir`, data),

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
