import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Button, Label } from "reactstrap";
import styled from "styled-components";
import { toast } from "react-toastify";

import CreateTaskModal from "./CreateTaskModal";
import TaskCard from "./TaskCard";
import ListaIntegrantes from "./ListaIntegrantes";
import ModalFinalizar from "./ModalFinalizar";
import ModalInfo from "./ModalInfo";

import {
  TitleBar,
  H1,
  CardGrid,
  SearchWrap,
  SearchInput,
  Section,
  FiltersRow,
  FilterSelect,
  TinyPill,
  EmptyState,
  InfoBar,
  TypeStatsCard,
  TypeStatsHeader,
  TypeStatsRow,
  MiniCount,
  MiniLabel,
  GlobalModalStyles,
  Dot,
  GroupHeader,
  GroupTitle,
  GroupCount,
  Loader,
} from "./style";

import NavBar from "../components/NavBar";
import { Page } from "../../Projetos/style";
import apiLocal from "../../../services/apiLocal";
import { Field } from "./CreateTaskModal/style";

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const DateInput = styled.input`
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 0 10px;
  font-size: 13px;
  outline: none;
  background: white;
`;

const STATUS = {
  PROGRAMADA: "PROGRAMADA",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  PAUSADA: "PAUSADA",
  CONCLUIDA: "CONCLUIDA",
  CANCELADA: "CANCELADA",
};

const TIPOS = ["Recebimento", "Separação", "Conferência", "Expedição"];

function pad2(n) {
  const x = Number(n || 0);
  return x < 10 ? `0${x}` : `${x}`;
}

function formatHMS(totalSeconds) {
  const s = Number(totalSeconds || 0);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function adaptDemandaToTaskLite(d) {
  const id = d?.id || d?.demanda_id || `D-${Math.random()}`;

  const tipo = d?.tipo || d?.task_tipo || "Recebimento";
  const cliente =
    d?.cliente_nome ||
    d?.cliente?.nome ||
    (typeof d?.cliente === "string" ? d.cliente : null) ||
    "—";

  const recebimento = {
    motorista: d?.motorista ?? null,
    chegadaAt: d?.chegada_at ?? null,
    placaCavalo: d?.placa_cavalo ?? null,
    placaCarreta: d?.placa_carreta ?? null,
  };
  const ocorrenciasArr = Array.isArray(d?.ocorrencias)
    ? d.ocorrencias
    : typeof d?.ocorrencias === "string" && d.ocorrencias.trim()
      ? (() => {
          try {
            return JSON.parse(d.ocorrencias);
          } catch {
            return [];
          }
        })()
      : [];

  return {
    id: String(id),
    tipo,
    cliente,
    paletizada: !!d?.paletizada,
    createdAt: d?.created_at || d?.createdAt || null,

    totalVolumes: Number(d?.total_volumes ?? d?.totalVolumes ?? 0),
    totalPesoKg: Number(d?.total_peso_kg ?? d?.totalPesoKg ?? 0),
    totalPallets: Number(d?.total_pallets ?? d?.totalPallets ?? 0),

    observacao: d?.observacao || "",
    ocorrencias: ocorrenciasArr,
    responsaveis: Array.isArray(d?.responsaveis) ? d.responsaveis : [],
    status: d?.status || STATUS.PROGRAMADA,

    startedAt: d?.started_at || d?.startedAt || null,
    finishedAt: d?.finished_at || d?.finishedAt || null,
    elapsedSeconds: Number(d?.elapsed_seconds || d?.elapsedSeconds || 0),
    locked: !!d?.locked,

    recebimento,

    cancelReason: d?.cancel_reason || d?.cancelReason || "",
    cancelledBy: d?.cancelled_by || d?.cancelledBy || "",
    cancelledAt: d?.cancelled_at || d?.cancelledAt || "",

    docs: [],
    notas: [],
    logs: Array.isArray(d?.logs) ? d.logs : [],
  };
}

function normalizeYMD(s) {
  const v = String(s || "").trim();
  if (!v) return "";
  return v;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function toYMD(dateObj) {
  const d = new Date(dateObj);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function looksLikeChave44(q) {
  const digits = String(q || "").replace(/\D/g, "");
  return digits.length === 44;
}
function looksLikeNF(q) {
  const digits = String(q || "").replace(/\D/g, "");
  return digits.length >= 6 && digits.length < 44;
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

export default function ProdOperacaoPage() {
  const fetchDocByChave = useCallback(async (chave, docKind) => {
    const res = await apiLocal.getDocByChave(chave, docKind);
    return res?.data || null;
  }, []);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const actorName = useMemo(() => {
    const n =
      user?.nome || user?.name || user?.email || user?.usuario || "Usuário";
    return String(n);
  }, [user]);

  const actorEmail = useMemo(() => {
    const e = user?.email || user?.usuario || "";
    return String(e || "")
      .trim()
      .toLowerCase();
  }, [user]);

  const isAdmin = useMemo(
    () => actorEmail === "admin@carraro.com",
    [actorEmail],
  );

  // ================= LOADING LOCAL (FIX) =================
  const [loadingKeys, setLoadingKeys] = useState({});

  const isLoading = useCallback(
    (key) => !!loadingKeys[String(key || "")],
    [loadingKeys],
  );

  const anyLoading = useCallback(
    (keys) => {
      if (!keys || !keys.length) {
        for (const k in loadingKeys) if (loadingKeys[k]) return true;
        return false;
      }
      for (let i = 0; i < keys.length; i++) {
        const k = String(keys[i] || "");
        if (loadingKeys[k]) return true;
      }
      return false;
    },
    [loadingKeys],
  );

  const wrapLoading = useCallback(async (key, fn) => {
    const k = String(key || "op");
    setLoadingKeys((prev) => ({ ...prev, [k]: true }));
    try {
      return await fn();
    } finally {
      setLoadingKeys((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    }
  }, []);
  // ======================================================

  const [openCreate, setOpenCreate] = useState(false);

  const [openFinalizar, setOpenFinalizar] = useState(false);
  const [finishTaskId, setFinishTaskId] = useState(null);

  const [openInfo, setOpenInfo] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [query, setQuery] = useState("");
  // ✅ pré-selecionado semana atual
  const [quickRange, setQuickRange] = useState("week");

  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [tipoFilter, setTipoFilter] = useState("TODOS");
  const [clienteFilter, setClienteFilter] = useState("TODOS");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [tasks, setTasks] = useState([]);
  const [listError, setListError] = useState("");
  const [clientesList, setClientesList] = useState([]);

  const [operadoresOperacao, setOperadoresOperacao] = useState([]);
  const [placasList, setPlacasList] = useState([]);
  const [motoristasList, setMotoristasList] = useState([]);

  // ✅ mantém: tarefas ativas para o painel de ociosos/disponíveis
  const [activeTasks, setActiveTasks] = useState([]);

  // ===== DIRTY FLAG =====
  const dirtyRef = useRef(false);
  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  const loadDemandasRef = useRef(null);
  const loadActiveRef = useRef(null);

  const flushDirty = useCallback(async () => {
    if (!dirtyRef.current) return;
    dirtyRef.current = false;

    if (loadDemandasRef.current) await loadDemandasRef.current();
    if (loadActiveRef.current) await loadActiveRef.current();
  }, []);
  // =====================

  const applyCancelVisibility = useCallback(
    (arr) => {
      const rows = Array.isArray(arr) ? arr : [];
      if (isAdmin) return rows;
      const out = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i]?.status !== STATUS.CANCELADA) out.push(rows[i]);
      }
      return out;
    },
    [isAdmin],
  );

  // ✅ setQuick PRECISA vir antes do useEffect que chama ele
  const setQuick = useCallback((kind) => {
    const today = new Date();

    if (kind === "today") {
      setDateFrom(toYMD(startOfDay(today)));
      setDateTo(toYMD(endOfDay(today)));
      return;
    }
    if (kind === "yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      setDateFrom(toYMD(startOfDay(y)));
      setDateTo(toYMD(endOfDay(y)));
      return;
    }
    if (kind === "week") {
      const d = new Date(today);
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1) - day; // segunda
      d.setDate(d.getDate() + diff);
      const start = startOfDay(d);
      const end = endOfDay(
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6),
      );
      setDateFrom(toYMD(start));
      setDateTo(toYMD(end));
      return;
    }
    if (kind === "month") {
      const start = startOfDay(
        new Date(today.getFullYear(), today.getMonth(), 1),
      );
      const end = endOfDay(
        new Date(today.getFullYear(), today.getMonth() + 1, 0),
      );
      setDateFrom(toYMD(start));
      setDateTo(toYMD(end));
      return;
    }
    if (kind === "week_prev") {
      const d = new Date(today);
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      d.setDate(d.getDate() + diff - 7);

      const start = startOfDay(d);
      const end = endOfDay(
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6),
      );
      setDateFrom(toYMD(start));
      setDateTo(toYMD(end));
      return;
    }

    // clear
    setDateFrom("");
    setDateTo("");
  }, []);

  const loadActiveDemandas = useCallback(async () => {
    await wrapLoading("active", async () => {
      try {
        const res = await apiLocal.getDemandasAtivasLite();
        const rows = Array.isArray(res?.data) ? res.data : [];
        const visible = applyCancelVisibility(rows);

        const mapped = [];
        for (let i = 0; i < visible.length; i++)
          mapped.push(adaptDemandaToTaskLite(visible[i]));
        setActiveTasks(mapped);
      } catch (e) {
        setActiveTasks([]);
      }
    });
  }, [wrapLoading, applyCancelVisibility]);

  const loadMeta = useCallback(async () => {
    await wrapLoading("meta", async () => {
      try {
        const resResp = await apiLocal.getResponsaveis();
        const rowsResp = safeArray(resResp?.data);

        const ops = [];
        for (let i = 0; i < rowsResp.length; i++) {
          const r = rowsResp[i] || {};
          const dep = String(r.departamento || "")
            .trim()
            .toLowerCase();
          const nome = String(r.nome || "").trim();
          if (!nome) continue;
          if (dep === "operacao" || dep === "operação") ops.push(nome);
        }

        const uniq = {};
        const outOps = [];
        for (let i = 0; i < ops.length; i++) {
          const n = ops[i];
          if (!uniq[n]) {
            uniq[n] = true;
            outOps.push(n);
          }
        }
        outOps.sort((a, b) => a.localeCompare(b, "pt-BR"));
        setOperadoresOperacao(outOps);

        const resMot = await apiLocal.getMotoristas();
        const rowsMot = safeArray(resMot?.data);
        const ms = [];
        for (let i = 0; i < rowsMot.length; i++) {
          const r = rowsMot[i] || {};
          const nome = String(r.nome || "").trim();
          if (nome) ms.push(nome);
        }
        const uniqM = {};
        const outMs = [];
        for (let i = 0; i < ms.length; i++) {
          const n = ms[i];
          if (!uniqM[n]) {
            uniqM[n] = true;
            outMs.push(n);
          }
        }
        outMs.sort((a, b) => a.localeCompare(b, "pt-BR"));
        setMotoristasList(outMs);

        const resCli = await apiLocal.getClientes();
        const rowsCli = safeArray(resCli?.data);

        const outCli = [];
        for (let i = 0; i < rowsCli.length; i++) {
          const c = rowsCli[i] || {};
          const nome = String(c.nome || c.razao_social || "").trim();
          const cnpj = String(c.cnpj || "").trim();
          if (!nome) continue;
          outCli.push({ nome, cnpj });
        }
        outCli.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        setClientesList(outCli);

        const resPl = await apiLocal.getPlacas();
        const rowsPl = safeArray(resPl?.data);
        const pls = [];
        for (let i = 0; i < rowsPl.length; i++) {
          const p = rowsPl[i] || {};
          const placa = String(p.placa || "")
            .trim()
            .toUpperCase();
          if (placa) pls.push(placa);
        }
        const uniqP = {};
        const outPls = [];
        for (let i = 0; i < pls.length; i++) {
          const n = pls[i];
          if (!uniqP[n]) {
            uniqP[n] = true;
            outPls.push(n);
          }
        }
        outPls.sort((a, b) => a.localeCompare(b, "pt-BR"));
        setPlacasList(outPls);
      } catch (e) {
        setOperadoresOperacao([]);
        setPlacasList([]);
        toast.error("Falha ao carregar responsáveis/placas.");
      }
    });
  }, [wrapLoading]);

  const loadDemandas = useCallback(async () => {
    await wrapLoading("list", async () => {
      setListError("");
      try {
        const params = {
          include_docs: false,
          date_from: normalizeYMD(dateFrom) || undefined,
          date_to: normalizeYMD(dateTo) || undefined,
        };

        const res = await apiLocal.listDemandasOpcLite(params);
        const rows = Array.isArray(res?.data) ? res.data : [];
        const visible = applyCancelVisibility(rows);

        const mapped = [];
        for (let i = 0; i < visible.length; i++)
          mapped.push(adaptDemandaToTaskLite(visible[i]));
        setTasks(mapped);
      } catch (e) {
        setListError(String(e?.response?.data?.detail || e?.message || e));
        setTasks([]);
      }
    });
  }, [wrapLoading, dateFrom, dateTo, applyCancelVisibility]);

  useEffect(() => {
    loadDemandasRef.current = loadDemandas;
  }, [loadDemandas]);

  useEffect(() => {
    loadActiveRef.current = loadActiveDemandas;
  }, [loadActiveDemandas]);

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    // ✅ já nasce semana atual
    setQuickRange("week");
    setQuick("week");

    loadMeta();
    loadDemandas();
    loadActiveDemandas();
  }, [loadMeta, loadDemandas, loadActiveDemandas, setQuick]);

  const normalize = useCallback((s) => {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }, []);

  const clientesDisponiveis = useMemo(() => {
    const map = {};
    for (let i = 0; i < tasks.length; i++) {
      const c = String(tasks[i]?.cliente || "").trim();
      if (c) map[c] = true;
    }
    return Object.keys(map).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [tasks]);

  const searchByDocOrText = useCallback(async () => {
    const q = String(query || "").trim();
    if (!q) {
      await loadDemandas();
      return;
    }

    const isDoc = looksLikeChave44(q) || looksLikeNF(q);
    if (!isDoc) return;

    if (typeof apiLocal.searchDemandasOpc !== "function") {
      toast.error(
        "Falta apiLocal.searchDemandasOpc / endpoint /demandas-opc/search",
      );
      return;
    }

    await wrapLoading("search", async () => {
      setListError("");
      try {
        const res = await apiLocal.searchDemandasOpc({
          q,
          date_from: normalizeYMD(dateFrom) || undefined,
          date_to: normalizeYMD(dateTo) || undefined,
        });

        const rows = Array.isArray(res?.data) ? res.data : [];
        const visible = applyCancelVisibility(rows);

        const mapped = [];
        for (let i = 0; i < visible.length; i++)
          mapped.push(adaptDemandaToTaskLite(visible[i]));
        setTasks(mapped);
      } catch (e) {
        setListError(String(e?.response?.data?.detail || e?.message || e));
      }
    });
  }, [
    query,
    dateFrom,
    dateTo,
    wrapLoading,
    loadDemandas,
    applyCancelVisibility,
  ]);

  const filteredTasks = useMemo(() => {
    let arr = tasks;

    const q = String(query || "").trim();
    if (q && !(looksLikeChave44(q) || looksLikeNF(q))) {
      const nq = normalize(q);
      const out = [];
      for (let i = 0; i < arr.length; i++) {
        const t = arr[i];
        const hay = `${t.id} ${t.tipo} ${t.cliente} ${t.observacao || ""} ${(t.responsaveis || []).join(" ")}`;
        if (normalize(hay).includes(nq)) out.push(t);
      }
      arr = out;
    }

    if (!isAdmin) {
      const out = [];
      for (let i = 0; i < arr.length; i++)
        if (arr[i].status !== STATUS.CANCELADA) out.push(arr[i]);
      arr = out;
    }

    if (statusFilter !== "TODOS") {
      const out = [];
      for (let i = 0; i < arr.length; i++)
        if (arr[i].status === statusFilter) out.push(arr[i]);
      arr = out;
    }

    if (tipoFilter !== "TODOS") {
      const out = [];
      for (let i = 0; i < arr.length; i++)
        if (arr[i].tipo === tipoFilter) out.push(arr[i]);
      arr = out;
    }

    if (clienteFilter !== "TODOS") {
      const out = [];
      for (let i = 0; i < arr.length; i++)
        if (arr[i].cliente === clienteFilter) out.push(arr[i]);
      arr = out;
    }

    const rank = {};
    rank[STATUS.EM_ANDAMENTO] = 1;
    rank[STATUS.PAUSADA] = 2;
    rank[STATUS.PROGRAMADA] = 3;
    rank[STATUS.CONCLUIDA] = 4;
    rank[STATUS.CANCELADA] = 5;

    return [...arr].sort((a, b) => {
      const ra = rank[a.status] || 99;
      const rb = rank[b.status] || 99;
      if (ra !== rb) return ra - rb;
      return String(a.id).localeCompare(String(b.id), "pt-BR");
    });
  }, [
    tasks,
    query,
    statusFilter,
    tipoFilter,
    clienteFilter,
    normalize,
    isAdmin,
  ]);

  const onCreateTask = useCallback(
    async (payload) => {
      await wrapLoading("create", async () => {
        try {
          await apiLocal.createDemandaOpc(payload);
          setOpenCreate(false);
          toast.success("Tarefa criada!");
          markDirty();
          await flushDirty();
        } catch (e) {
          toast.error(String(e?.response?.data?.detail || e?.message || e));
        }
      });
    },
    [wrapLoading, markDirty, flushDirty],
  );
  const patchDemandaMeta = useCallback(
    async (taskId, meta) => {
      // meta: { observacao?, tp_ocorren?, ocorren? }
      await wrapLoading(`meta:${taskId}`, async () => {
        await apiLocal.patchDemandaOpcMeta(taskId, meta);
      });
    },
    [wrapLoading],
  );

  const onStart = useCallback(
    async (taskId) => {
      await wrapLoading(`start:${taskId}`, async () => {
        try {
          await apiLocal.startDemandaOpc(taskId, { by: actorName });
          toast.success("Tarefa iniciada!");
          markDirty();
          await flushDirty();
        } catch (e) {
          toast.error(String(e?.response?.data?.detail || e?.message || e));
        }
      });
    },
    [wrapLoading, actorName, markDirty, flushDirty],
  );

  const onFinish = useCallback(
    async (taskId) => {
      await wrapLoading(`finish:${taskId}`, async () => {
        try {
          await apiLocal.finishDemandaOpc(taskId, { by: actorName });
          toast.success("Tarefa finalizada!");
          markDirty();
          await flushDirty();
        } catch (e) {
          toast.error(String(e?.response?.data?.detail || e?.message || e));
        }
      });
    },
    [wrapLoading, actorName, markDirty, flushDirty],
  );

  const openTaskInfo = useCallback((task) => {
    if (!task?.id) return;
    setSelectedTask(task);
    setOpenInfo(true);
  }, []);

  const closeTaskInfo = useCallback(async () => {
    setOpenInfo(false);
    setSelectedTask(null);
    await flushDirty();
  }, [flushDirty]);

  const askFinish = useCallback((taskId) => {
    setFinishTaskId(taskId);
    setOpenFinalizar(true);
  }, []);

  const cancelFinish = useCallback(() => {
    setOpenFinalizar(false);
    setFinishTaskId(null);
  }, []);

  const confirmFinish = useCallback(async () => {
    if (!finishTaskId) return;
    await onFinish(finishTaskId);
    setOpenFinalizar(false);
    setFinishTaskId(null);
  }, [finishTaskId, onFinish]);

  const finishingTask = useMemo(() => {
    if (!finishTaskId) return null;
    for (let i = 0; i < tasks.length; i++)
      if (tasks[i].id === finishTaskId) return tasks[i];
    return null;
  }, [finishTaskId, tasks]);

  const grouped = useMemo(() => {
    const map = {};
    for (let i = 0; i < TIPOS.length; i++) map[TIPOS[i]] = [];

    for (let i = 0; i < filteredTasks.length; i++) {
      const t = filteredTasks[i];
      if (!map[t.tipo]) map[t.tipo] = [];
      map[t.tipo].push(t);
    }

    const out = [];
    for (let i = 0; i < TIPOS.length; i++)
      out.push([TIPOS[i], map[TIPOS[i]] || []]);
    for (const k in map) if (TIPOS.indexOf(k) === -1) out.push([k, map[k]]);
    return out;
  }, [filteredTasks]);

  const statsByTipo = useMemo(() => {
    let base = tasks;

    const baseNoCancel = [];
    for (let i = 0; i < base.length; i++) {
      if (base[i]?.status !== STATUS.CANCELADA) baseNoCancel.push(base[i]);
    }
    base = baseNoCancel;

    if (statusFilter !== "TODOS") {
      const out = [];
      for (let i = 0; i < base.length; i++)
        if (base[i].status === statusFilter) out.push(base[i]);
      base = out;
    }

    if (tipoFilter !== "TODOS") {
      const out = [];
      for (let i = 0; i < base.length; i++)
        if (base[i].tipo === tipoFilter) out.push(base[i]);
      base = out;
    }

    if (clienteFilter !== "TODOS") {
      const out = [];
      for (let i = 0; i < base.length; i++)
        if (base[i].cliente === clienteFilter) out.push(base[i]);
      base = out;
    }

    const map = {};
    for (let i = 0; i < TIPOS.length; i++) {
      map[TIPOS[i]] = {
        PROGRAMADA: 0,
        EM_ANDAMENTO: 0,
        PAUSADA: 0,
        CONCLUIDA: 0,
        CANCELADA: 0,
        TOTAL: 0,
      };
    }

    for (let i = 0; i < base.length; i++) {
      const t = base[i];
      if (!map[t.tipo])
        map[t.tipo] = {
          PROGRAMADA: 0,
          EM_ANDAMENTO: 0,
          PAUSADA: 0,
          CONCLUIDA: 0,
          CANCELADA: 0,
          TOTAL: 0,
        };

      map[t.tipo].TOTAL += 1;

      if (t.status === STATUS.PROGRAMADA) map[t.tipo].PROGRAMADA += 1;
      else if (t.status === STATUS.EM_ANDAMENTO) map[t.tipo].EM_ANDAMENTO += 1;
      else if (t.status === STATUS.PAUSADA) map[t.tipo].PAUSADA += 1;
      else if (t.status === STATUS.CONCLUIDA) map[t.tipo].CONCLUIDA += 1;
    }

    return map;
  }, [tasks, statusFilter, tipoFilter, clienteFilter]);

  const isBusyTop = anyLoading(["list", "search", "create", "meta", "active"]);
  const isBusyList = anyLoading(["list", "search"]);
  const queryIsDoc = looksLikeChave44(query) || looksLikeNF(query);
  console.log(grouped);

  return (
    <Page>
      <GlobalModalStyles />
      <NavBar />

      <ModalFinalizar
        isOpen={openFinalizar}
        toggle={cancelFinish}
        task={finishingTask}
        onConfirm={confirmFinish}
        isLoading={finishTaskId ? isLoading(`finish:${finishTaskId}`) : false}
      />

      <ModalInfo
        isOpen={openInfo}
        toggle={closeTaskInfo}
        task={selectedTask}
        operadores={operadoresOperacao}
        actorName={actorName}
        onDidChange={markDirty}
        onSaveMeta={patchDemandaMeta}
        isSavingMeta={
          selectedTask?.id ? isLoading(`meta:${selectedTask.id}`) : false
        }
      />

      <TitleBar style={{ zIndex: 1100 }}>
        <H1>Produtividade • Operação</H1>

        <RightActions>
          <SearchWrap title="Buscar por id, tipo, cliente, observação ou responsável (ou NF/Chave)">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M13.477 12.307a6 6 0 11-1.172 1.172l3.327 3.327a.83.83 0 001.172-1.172l-3.327-3.327zM8.5 13a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
            </svg>

            <SearchInput
              placeholder="Buscar tarefas... (ID, cliente, tipo, NF ou chave)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && queryIsDoc) searchByDocOrText();
              }}
            />
          </SearchWrap>

          {queryIsDoc ? (
            <Button
              color="info"
              onClick={searchByDocOrText}
              disabled={isBusyTop}
            >
              {isLoading("search") ? <Loader /> : "Buscar NF/Chave"}
            </Button>
          ) : null}

          <Button color="secondary" onClick={loadDemandas} disabled={isBusyTop}>
            {isLoading("list") ? <Loader /> : "Recarregar"}
          </Button>

          <Button
            color="primary"
            onClick={() => setOpenCreate(true)}
            disabled={isLoading("create")}
          >
            {isLoading("create") ? <Loader /> : "+ Criar tarefa"}
          </Button>
        </RightActions>
      </TitleBar>

      <Section>
        <FiltersRow>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <TinyPill>Filtros</TinyPill>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "flex-end",
              width: "100%",
              justifyContent: "flex-start",
            }}
          >
            <Field>
              <Label>Status:</Label>
              <FilterSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                title="Status"
              >
                <option value="TODOS">Todos</option>
                <option value={STATUS.PROGRAMADA}>Programada</option>
                <option value={STATUS.EM_ANDAMENTO}>Em andamento</option>
                <option value={STATUS.PAUSADA}>Pausada</option>
                <option value={STATUS.CONCLUIDA}>Concluída</option>
                {isAdmin ? (
                  <option value={STATUS.CANCELADA}>Cancelada</option>
                ) : null}
              </FilterSelect>
            </Field>

            <Field>
              <Label>Tipo demanda:</Label>
              <FilterSelect
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                title="Tipo"
              >
                <option value="TODOS">Todos</option>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </FilterSelect>
            </Field>

            <Field>
              <Label>Cliente:</Label>
              <FilterSelect
                value={clienteFilter}
                onChange={(e) => setClienteFilter(e.target.value)}
                title="Cliente"
              >
                <option value="TODOS">Todos</option>
                {clientesDisponiveis.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </FilterSelect>
            </Field>

            <Field>
              <Label>Data inicial</Label>
              <DateInput
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </Field>

            <Field>
              <Label>Data final</Label>
              <DateInput
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </Field>

            <Field>
              <Label>Filtro rapido:</Label>
              <FilterSelect
                value={quickRange}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuickRange(v);
                  setQuick(v);
                }}
                title="Filtro rápido"
              >
                <option value="NONE">Filtro rápido: —</option>
                <option value="today">Hoje</option>
                <option value="yesterday">Ontem</option>
                <option value="week">Semana atual</option>
                <option value="week_prev">Semana passada</option>
                <option value="month">Mês atual</option>
                <option value="clear">Limpar datas</option>
              </FilterSelect>
            </Field>

            <Button color="primary" onClick={loadDemandas} disabled={isBusyTop}>
              {isLoading("list") ? <Loader /> : "Buscar"}
            </Button>
          </div>
        </FiltersRow>
      </Section>

      {listError ? (
        <EmptyState style={{ border: "1px solid rgba(255,0,0,0.2)" }}>
          Erro ao listar: {listError}
        </EmptyState>
      ) : null}

      <InfoBar>
        {TIPOS.map((tipo) => {
          const row = statsByTipo[tipo] || {
            PROGRAMADA: 0,
            EM_ANDAMENTO: 0,
            PAUSADA: 0,
            CONCLUIDA: 0,
            CANCELADA: 0,
            TOTAL: 0,
          };

          return (
            <TypeStatsCard key={tipo} $tipo={tipo}>
              <TypeStatsHeader>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Dot $v={tipo} />
                  <strong style={{ fontSize: 14 }}>{tipo}</strong>
                </div>
                <span style={{ fontWeight: 900, opacity: 0.75 }}>
                  {row.TOTAL}
                </span>
              </TypeStatsHeader>

              <TypeStatsRow>
                <div>
                  <MiniLabel>
                    <Dot $v="prog" /> Programadas
                  </MiniLabel>
                  <MiniCount>{row.PROGRAMADA}</MiniCount>
                </div>
                <div>
                  <MiniLabel>
                    <Dot $v="run" /> Andamento
                  </MiniLabel>
                  <MiniCount>{row.EM_ANDAMENTO}</MiniCount>
                </div>
                <div>
                  <MiniLabel>
                    <Dot $v="pause" /> Pausadas
                  </MiniLabel>
                  <MiniCount>{row.PAUSADA}</MiniCount>
                </div>
                <div>
                  <MiniLabel>
                    <Dot $v="done" /> Concluídas
                  </MiniLabel>
                  <MiniCount>{row.CONCLUIDA}</MiniCount>
                </div>
              </TypeStatsRow>
            </TypeStatsCard>
          );
        })}
      </InfoBar>

      <ListaIntegrantes operadores={operadoresOperacao} tasks={activeTasks} />

      {grouped.map(([tipo, list]) => (
        <div key={tipo} style={{ marginTop: 16 }}>
          <GroupHeader>
            <Dot $v={tipo} />
            <GroupTitle>
              {tipo} <GroupCount>({list.length})</GroupCount>
            </GroupTitle>
          </GroupHeader>

          {isBusyList ? (
            <EmptyState
              style={{ display: "flex", gap: 10, alignItems: "center" }}
            >
              <Loader /> Carregando tarefas...
            </EmptyState>
          ) : list.length === 0 ? (
            <EmptyState>
              Sem tarefas nesse grupo com os filtros atuais.
            </EmptyState>
          ) : (
            <CardGrid>
              {list.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  formatTime={formatHMS}
                  onOpen={openTaskInfo}
                  onStart={() => onStart(t.id)}
                  onFinish={() => askFinish(t.id)}
                  isStarting={isLoading(`start:${t.id}`)}
                  isFinishing={isLoading(`finish:${t.id}`)}
                  isOpening={false}
                  disabled={anyLoading([
                    "list",
                    "search",
                    `start:${t.id}`,
                    `finish:${t.id}`,
                  ])}
                />
              ))}
            </CardGrid>
          )}
        </div>
      ))}

      <CreateTaskModal
        isOpen={openCreate}
        toggle={() => setOpenCreate((v) => !v)}
        actorName={actorName}
        tipos={TIPOS}
        operadores={operadoresOperacao}
        motoristas={motoristasList}
        clientes={clientesList}
        placas={placasList}
        onConfirm={onCreateTask}
        fetchDocByChave={fetchDocByChave}
        isSubmitting={isLoading("create")}
      />
    </Page>
  );
}
