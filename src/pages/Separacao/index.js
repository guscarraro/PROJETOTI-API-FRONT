import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "reactstrap";
import NavBar from "../Projetos/components/NavBar";
import { Page, H1, CardGrid, SearchWrap, SearchInput } from "../Projetos/style";
import useLoading from "../../hooks/useLoading";
import UploadCsvModal from "./UploadCsvModal";
import PedidoFormModal from "./PedidoFormModal";
import PedidoCard from "./PedidoCard";
import ModalInfo from "./ModalInfo";
import { STATUS_PEDIDO } from "./constants";
import Indicators from "./Indicators";
import ConferenciaModal from "./ConferenciaModal";
import FakeLabelsModal from "./FakeLabelsModal";
import ModalExpedidos from "./ModalExpedidos";
import apiLocal from "../../services/apiLocal";

import {
  StatusPill,
  Content,
  TitleBarWrap,
  RightRow,
  FiltersCard,
  FiltersRow,
  FiltersLeft,
  FiltersRight,
  FilterGroup,
  FilterLabel,
  FilterInput,
  FilterSelect,
  FilterButton,
  ClearButton,
  Legend,
  DeletedPanel,
  CardsWrap,
} from "./style";

const ADM_EMAILS = ["admin@carraro.com"];

/* helpers de permissão */
function canExpedir(user) {
  const email = String(user?.email || "").toLowerCase();
  const tipo = String(user?.tipo || "").toLowerCase();
  if (tipo === "adm") return true;
  return [
    "kathy@carraro.com",
    "jeferson@carraro.com",
    "admin@carraro.com",
    "vinicius.ferreira@carraro.com",
    "felipe.lopes@carraro.com",
    "luiz.machado@carraro.com",
    "hilma@carraro.com",
    "vinicius.ferreira@carraro.com",
    "joao.cordeiro@carraro.com"
  ].includes(email);
}

function isAdmin(user) {
  const email = String(user?.email || "").toLowerCase();
  for (let i = 0; i < ADM_EMAILS.length; i++) {
    if (email === ADM_EMAILS[i].toLowerCase()) return true;
  }
  if (String(user?.tipo || "").toLowerCase() === "adm") return true;
  return false;
}

function formatDate(date) {
  const d = new Date(date.getTime());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPresetRange(presetKey) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (presetKey === "HOJE") {
    return { start: today, end: today };
  }

  if (presetKey === "ONTEM") {
    const d = new Date(today.getTime());
    d.setDate(d.getDate() - 1);
    return { start: d, end: d };
  }

  if (presetKey === "SEMANA_ATUAL") {
    let day = today.getDay(); // 0 domingo, 1 segunda...
    if (day === 0) day = 7;
    const start = new Date(today.getTime());
    start.setDate(today.getDate() - (day - 1)); // segunda
    const end = new Date(start.getTime());
    end.setDate(start.getDate() + 6); // domingo
    return { start, end };
  }

  if (presetKey === "MES_ATUAL") {
    const year = today.getFullYear();
    const month = today.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { start, end };
  }

  if (presetKey === "MES_PASSADO") {
    const year = today.getFullYear();
    const month = today.getMonth();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const start = new Date(prevYear, prevMonth, 1);
    const end = new Date(prevYear, prevMonth + 1, 0);
    return { start, end };
  }
  if (presetKey === "ULT_5") {
    const end = today;
    const start = new Date(today.getTime());
    start.setDate(start.getDate() - 4); // hoje + 4 dias pra trás = 5 dias
    return { start, end };
  }

  if (presetKey === "ULT_15") {
    const end = today;
    const start = new Date(today.getTime());
    start.setDate(start.getDate() - 14); // hoje + 14 dias pra trás = 15 dias
    return { start, end };
  }

  return null;
}

// range padrão = mês atual
const defaultRange = getPresetRange("MES_ATUAL");
const defaultDtInicio = defaultRange ? formatDate(defaultRange.start) : "";
const defaultDtFim = defaultRange ? formatDate(defaultRange.end) : "";

/** Overlay global via portal (sempre acima do modal do Bootstrap) */
function GlobalLoader({ active, text }) {
  if (!active) return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        background: "rgba(17, 24, 39, 0.45)",
        display: "grid",
        placeItems: "center",
        backdropFilter: "blur(1px)",
      }}
    >
      <div
        style={{
          background: "#111827",
          color: "#fff",
          padding: "16px 18px",
          borderRadius: 12,
          minWidth: 220,
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,.35)",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          className="spinner-border spinner-border-sm"
          role="status"
          style={{ marginRight: 8 }}
        />
        <span style={{ fontWeight: 700 }}>{text || "Carregando..."}</span>
      </div>
    </div>,
    document.body
  );
}

export default function SeparacaoPage() {
  const loading = useLoading();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [pedidos, setPedidos] = useState([]);
  const [query, setQuery] = useState("");
  const [loadingLabel, setLoadingLabel] = useState("Carregando...");

  const [openCsv, setOpenCsv] = useState(false);
  const [openManual, setOpenManual] = useState(false);

  const [activePedido, setActivePedido] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);

  const [openConf, setOpenConf] = useState(false);
  const [confPedido, setConfPedido] = useState(null);

  const [openFake, setOpenFake] = useState(false);
  const [openExpedidos, setOpenExpedidos] = useState(false);

  const [deletedPedidos, setDeletedPedidos] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState(null);

  // filtros (card)
  const [filters, setFilters] = useState({
    dt_inicio: defaultDtInicio,
    dt_fim: defaultDtFim,
    periodo: "MES_ATUAL",
  });

  const normalize = useCallback(
    (s) =>
      String(s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim(),
    []
  );

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handlePeriodoChange = useCallback((value) => {
    if (!value) {
      setFilters((prev) => ({ ...prev, periodo: "" }));
      return;
    }
    const range = getPresetRange(value);
    if (!range) {
      setFilters((prev) => ({ ...prev, periodo: value }));
      return;
    }
    setFilters((prev) => ({
      ...prev,
      periodo: value,
      dt_inicio: formatDate(range.start),
      dt_fim: formatDate(range.end),
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dt_inicio: "",
      dt_fim: "",
      periodo: "",
    });
  }, []);

  // fetch com base nos filtros (chamado no submit e na carga inicial)
  const fetchFromFilters = async (f) => {
    const params = { events_preview: 5 };
    if (f.dt_inicio) params.dt_inicio = f.dt_inicio;
    if (f.dt_fim) params.dt_fim = f.dt_fim;

    setLoadingLabel("Carregando...");
    const res = await loading.wrap("pedidos-list", async () =>
      apiLocal.getPedidos(params)
    );
    const arr = Array.isArray(res?.data) ? res.data : [];
    setPedidos(arr);
    setLoadingLabel("Carregando...");
  };

  // carga inicial: usando o range padrão (mês atual)
  useEffect(() => {
    (async () => {
      try {
        await fetchFromFilters({
          dt_inicio: defaultDtInicio,
          dt_fim: defaultDtFim,
          periodo: "MES_ATUAL",
        });
      } catch (err) {
        console.error(err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- util: merge/hidratação ----------
  const mergeListaComDetalhes = (lista, detalhesPorNr) => {
    const out = [];
    for (let i = 0; i < lista.length; i++) {
      const p = lista[i];
      const key = String(p.nr_pedido);
      const det = detalhesPorNr.get(key);
      out.push(det || p);
    }
    return out;
  };

  // substituir pedido na lista e sincronizar modais
  function replacePedidoNaLista(nr_pedido, patch) {
    if (!nr_pedido || !patch) return;

    setPedidos((prev) => {
      const next = [];
      let found = false;
      for (let i = 0; i < prev.length; i++) {
        const p = prev[i];
        if (String(p.nr_pedido) === String(nr_pedido)) {
          next.push({ ...p, ...patch });
          found = true;
        } else {
          next.push(p);
        }
      }
      if (!found) {
        next.unshift(patch);
      }
      return next;
    });

    if (activePedido && String(activePedido.nr_pedido) === String(nr_pedido)) {
      setActivePedido({ ...activePedido, ...patch });
    }
    if (confPedido && String(confPedido.nr_pedido) === String(nr_pedido)) {
      setConfPedido({ ...confPedido, ...patch });
    }
  }

  // ---------- IMPORTAÇÃO CSV ----------
  const onImportedCsv = async (novosPedidos) => {
    setLoadingLabel("Importando pedidos...");
    loading.start("import");
    try {
      const criados = [];
      for (let i = 0; i < novosPedidos.length; i++) {
        const p = novosPedidos[i];
        try {
          const r = await apiLocal.createPedido(p);
          if (r?.data) criados.push(r.data);
        } catch (e) {
          console.error("Falha ao inserir pedido", p?.nr_pedido, e);
        }
      }

      const listResp = await apiLocal.getPedidos({
        events_preview: 5,
        dt_inicio: filters.dt_inicio || undefined,
        dt_fim: filters.dt_fim || undefined,
      });
      const lista = Array.isArray(listResp?.data) ? listResp.data : [];

      const detalhesMap = new Map();
      const nrs = criados.map((x) => String(x.nr_pedido));
      for (let i = 0; i < nrs.length; i++) {
        const nr = nrs[i];
        try {
          const d = await apiLocal.getPedidoByNr(nr);
          const detail = d?.data || {};
          const merged = {
            ...(detail.pedido || {}),
            itens: Array.isArray(detail.itens) ? detail.itens : [],
            eventos: Array.isArray(detail.eventos) ? detail.eventos : [],
            eventos_preview: Array.isArray(detail.eventos)
              ? detail.eventos.slice(0, 5)
              : [],
          };
          merged.nr_pedido = merged.nr_pedido || nr;
          detalhesMap.set(nr, merged);
        } catch (e) {
          console.error(
            "Falha ao buscar detalhe do pedido recém-importado",
            nr,
            e
          );
        }
      }

      const listaHidratada = mergeListaComDetalhes(lista, detalhesMap);
      setPedidos(listaHidratada);
    } finally {
      loading.stop("import");
      setOpenCsv(false);
      setLoadingLabel("Carregando...");
    }
  };

  // ---------- criação manual ----------
  const onCreatedManual = async (pedido) => {
    try {
      setLoadingLabel("Criando pedido...");
      loading.start("create");
      await apiLocal.createPedido(pedido);
      const listResp = await apiLocal.getPedidos({
        events_preview: 5,
        dt_inicio: filters.dt_inicio || undefined,
        dt_fim: filters.dt_fim || undefined,
      });
      const lista = Array.isArray(listResp?.data) ? listResp.data : [];
      setPedidos(lista);
    } finally {
      loading.stop("create");
      setOpenManual(false);
      setLoadingLabel("Carregando...");
    }
  };

  // ---------- refresh individual ----------
  const refreshPedido = useCallback(
    async (nr_pedido) => {
      try {
        const resp = await apiLocal.getPedidoByNr(nr_pedido);
        const detail = resp?.data || {};
        const merged = {
          ...(detail.pedido || {}),
          itens: Array.isArray(detail.itens) ? detail.itens : [],
          eventos: Array.isArray(detail.eventos) ? detail.eventos : [],
          eventos_preview: Array.isArray(detail.eventos)
            ? detail.eventos.slice(0, 5)
            : [],
        };

        const next = [];
        let updatedObject = null;
        for (let i = 0; i < pedidos.length; i++) {
          const p = pedidos[i];
          if (String(p.nr_pedido) === String(nr_pedido)) {
            const up = { ...p, ...merged };
            next.push(up);
            updatedObject = up;
          } else {
            next.push(p);
          }
        }
        setPedidos(next);

        if (
          activePedido &&
          String(activePedido.nr_pedido) === String(nr_pedido)
        ) {
          setActivePedido(updatedObject || merged);
        }
        if (confPedido && String(confPedido.nr_pedido) === String(nr_pedido)) {
          setConfPedido(updatedObject || merged);
        }
      } catch (e) {
        console.error("Falha ao recarregar pedido:", e);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [pedidos, activePedido, confPedido]
  );

  // ---------- atualização local ----------
  const onUpdatePedido = async (nr_pedido, patch) => {
    try {
      await apiLocal.updatePedido(nr_pedido, patch);
    } catch {}
    const next = [];
    let updatedObject = null;
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      if (String(p.nr_pedido) === String(nr_pedido)) {
        const up = { ...p, ...patch };
        next.push(up);
        updatedObject = up;
      } else {
        next.push(p);
      }
    }
    setPedidos(next);
    if (activePedido && String(activePedido.nr_pedido) === String(nr_pedido)) {
      setActivePedido(updatedObject);
    }
    if (confPedido && String(confPedido.nr_pedido) === String(nr_pedido)) {
      setConfPedido(updatedObject);
    }
  };

  // ---------- exclusão local ----------
  const onDeletePedido = async (nr_pedido, opts) => {
    const next = [];
    let removed = null;
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      if (String(p.nr_pedido) !== String(nr_pedido)) {
        next.push(p);
      } else {
        removed = p;
      }
    }
    setPedidos(next);
    if (removed) {
      const rec = {
        nr_pedido,
        by: opts?.user || "usuário",
        at: new Date().toISOString(),
        justificativa: String(opts?.justificativa || "").trim() || "-",
        snapshot: removed,
      };
      const delNext = deletedPedidos.slice();
      delNext.push(rec);
      setDeletedPedidos(delNext);
    }
    if (activePedido && String(activePedido.nr_pedido) === String(nr_pedido)) {
      setOpenInfo(false);
      setActivePedido(null);
    }
    if (confPedido && String(confPedido.nr_pedido) === String(nr_pedido)) {
      setOpenConf(false);
      setConfPedido(null);
    }
  };

  // ---------- expedição ----------
  const onExpedirPedido = async (nr_pedido, nota) => {
    if (!canExpedir(user)) return;
    let alvo = null;
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      if (String(p.nr_pedido) === String(nr_pedido)) {
        alvo = p;
        break;
      }
    }
    if (!alvo) return;
    const pode = !!alvo?.conferente || !!alvo?.primeiraConferencia?.colaborador;
    if (!pode) return;
    try {
      await apiLocal.expedirPedido({
        nr_pedido,
        nota: nota || alvo.nota || null,
        by: user?.email || "usuario",
      });
      await refreshPedido(nr_pedido);
    } catch (e) {
      console.error("Falha ao expedir no back:", nr_pedido, e);
    }
  };

  const openConferencia = (p) => {
    setConfPedido(p);
    setOpenConf(true);
  };

  // FINALIZAR CONFERÊNCIA
  const handleConfirmConferencia = async (payload) => {
    const name = String(payload?.conferente || "").trim();
    if (!name || !confPedido) return;

    const ocorrenciasOut = [];
    const list = Array.isArray(payload?.ocorrencias) ? payload.ocorrencias : [];
    for (let i = 0; i < list.length; i++) {
      const o = list[i] || {};
      ocorrenciasOut.push({
        tipo: o.tipo,
        detalhe: o.detalhe || "-",
        item_cod: o.itemCod || o.item_cod || null,
        bar: o.bar || null,
        lote: o.lote || null,
        quantidade:
          o.quantidade !== undefined && o.quantidade !== null
            ? o.quantidade
            : null,
        status: o.status || "aberta",
      });
    }

    try {
      const resp = await apiLocal.finalizarConferencia(confPedido.nr_pedido, {
        conferente: name,
        elapsedSeconds: payload?.elapsedSeconds || 0,
        evidences: payload?.evidences || [],
        scans: payload?.scans || {},
        loteScans: payload?.loteScans || {},
        foraLista: payload?.foraLista || [],
        ocorrencias: ocorrenciasOut,

        // 🔹 NOVOS CAMPOS ENVIADOS PARA O BACK
        scanEvents: Array.isArray(payload?.scanEvents)
          ? payload.scanEvents
          : [],
        resumoPorItem: payload?.resumoPorItem || {},
      });

      const pedidoDoBack =
        resp && resp.data && resp.data.pedido ? resp.data.pedido : null;
      if (pedidoDoBack) {
        replacePedidoNaLista(confPedido.nr_pedido, pedidoDoBack);
      }

      await refreshPedido(confPedido.nr_pedido);
    } catch (e) {
      console.error("Falha ao finalizar conferência no back:", e);
    }

    setOpenConf(false);
    setConfPedido(null);
  };

  const handleOccurrence = async ({ ocorrencias }) => {
    if (!confPedido) return;

    const arr = [];
    const list = Array.isArray(ocorrencias) ? ocorrencias : [];
    for (let i = 0; i < list.length; i++) {
      const o = list[i] || {};
      arr.push({
        tipo: o.tipo,
        detalhe: o.detalhe || "-",
        item_cod: o.itemCod || o.item_cod || null,
        bar: o.bar || null,
        lote: o.lote || null,
        quantidade: o.quantidade !== null ? o.quantidade : null,
        status: o.status || "aberta",
      });
    }

    try {
      await apiLocal.registrarOcorrenciaConferencia(confPedido.nr_pedido, arr);
      await refreshPedido(confPedido.nr_pedido);
    } catch (e) {
      console.error("Falha ao registrar ocorrências no back:", e);
    }

    setOpenConf(false);
    setConfPedido(null);
  };

  // campos pesquisáveis
  const buildSearchStrings = useCallback(
    (p) => {
      const out = [];

      out.push(normalize(p.nr_pedido));
      out.push(normalize(p.nota));
      out.push(normalize(p.cliente));
      out.push(normalize(p.destino));

      out.push(normalize(p.transportador));
      out.push(normalize(p.transportadora));

      out.push(normalize(p.separador));
      out.push(normalize(p.conferente));
      out.push(normalize(p?.primeiraConferencia?.colaborador));
      out.push(normalize(p.usuario));
      out.push(normalize(p.user));
      out.push(normalize(p.criado_por));
      out.push(normalize(p.created_by));

      if (Array.isArray(p.eventos_preview)) {
        for (let i = 0; i < p.eventos_preview.length; i++) {
          const ev = p.eventos_preview[i] || {};
          out.push(normalize(ev.texto));
          out.push(normalize(ev.tipo));
          out.push(normalize(ev.user_ref));
          out.push(normalize(ev.user));
        }
      }

      return out.filter(Boolean);
    },
    [normalize]
  );

  // ---------- filtros/derivados ----------
  const pedidosFiltrados = useMemo(() => {
    const q = normalize(query);
    const out = [];
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];

      if (q) {
        const hay = buildSearchStrings(p);
        let match = false;
        for (let j = 0; j < hay.length; j++) {
          if (hay[j].includes(q)) {
            match = true;
            break;
          }
        }
        if (!match) continue;
      }

      if (statusFiltro) {
        if (statusFiltro === STATUS_PEDIDO.CONCLUIDO) {
          const isOk = p.status === STATUS_PEDIDO.CONCLUIDO || p?.expedido;
          if (!isOk) continue;
        } else {
          if (p.status !== statusFiltro) continue;
        }
      }

      out.push(p);
    }
    return out;
  }, [pedidos, query, normalize, statusFiltro, buildSearchStrings]);

  const candidatosExpedicao = useMemo(() => {
    const res = [];
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      if (
        p.status === STATUS_PEDIDO.PRONTO_EXPEDICAO &&
        (!p.expedido || p.expedido === false)
      ) {
        res.push(p);
      }
    }
    return res;
  }, [pedidos]);

  // ---------- abrir modal de info ----------
  async function openInfoWithFetch(p) {
    if (!p) return;
    setLoadingLabel("Carregando detalhes...");
    loading.start("detail");
    try {
      const resp = await apiLocal.getPedidoByNr(p.nr_pedido);
      const detail = resp?.data || {};
      const merged = {
        ...(detail.pedido || p),
        itens: Array.isArray(detail.itens) ? detail.itens : p.itens || [],
        eventos: Array.isArray(detail.eventos) ? detail.eventos : [],
        eventos_preview: Array.isArray(detail.eventos)
          ? detail.eventos.slice(0, 5)
          : p.eventos_preview || [],
      };
      setActivePedido(merged);
      setOpenInfo(true);
      await onUpdatePedido(p.nr_pedido, merged);
    } finally {
      loading.stop("detail");
      setLoadingLabel("Carregando...");
    }
  }

  return (
    <Page>
      <GlobalLoader active={loading.any()} text={loadingLabel} />

      <NavBar />

      <Content>
        <TitleBarWrap>
          <H1 $accent="#0ea5e9">Conferência</H1>

          <RightRow>
            <SearchWrap title="Buscar por Nº pedido, NF, transportadora, usuário, cliente ou destino">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M13.477 12.307a6 6 0 11-1.172 1.172l3.327 3.327a.83.83 0 001.172-1.172l-3.327-3.327zM8.5 13a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
              </svg>
              <SearchInput
                placeholder="Nº, NF, transportadora, usuário, cliente ou destino..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </SearchWrap>
            {Number(user?.setor_ids) !== 23 &&
              Number(user?.setor_ids) !== 25 && (
                <Button color="secondary" onClick={() => setOpenCsv(true)}>
                  Importar CSV
                </Button>
              )}

            {Number(user?.setor_ids) !== 23 && (
              <>
                <Button
                  color="success"
                  disabled={
                    !(canExpedir(user) || isAdmin(user)) ||
                    candidatosExpedicao.length === 0
                  }
                  onClick={() => setOpenExpedidos(true)}
                  title={
                    canExpedir(user) || isAdmin(user)
                      ? "Selecionar pedidos para expedir"
                      : "Sem permissão para expedir"
                  }
                >
                  Expedir Pedidos
                </Button>
              </>
            )}

            {/* {isAdmin(user) && (
              <Button
                color={showDeleted ? "danger" : "dark"}
                onClick={() => setShowDeleted(!showDeleted)}
                title="Registros de exclusões"
              >
                Excluídos ({deletedPedidos.length})
              </Button>
            )} */}
          </RightRow>
        </TitleBarWrap>

        {/* CARD de filtros de data */}
        <FiltersCard>
          <FiltersRow
            as="form"
            onSubmit={async (e) => {
              e.preventDefault();
              await fetchFromFilters(filters);
            }}
          >
            <FiltersLeft>
              <FilterGroup>
                <FilterLabel>Data inicial</FilterLabel>
                <FilterInput
                  type="date"
                  value={filters.dt_inicio}
                  onChange={(e) => {
                    handleFilterChange("dt_inicio", e.target.value);
                    handleFilterChange("periodo", "");
                  }}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Data final</FilterLabel>
                <FilterInput
                  type="date"
                  value={filters.dt_fim}
                  onChange={(e) => {
                    handleFilterChange("dt_fim", e.target.value);
                    handleFilterChange("periodo", "");
                  }}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Período rápido</FilterLabel>
                <FilterSelect
                  value={filters.periodo}
                  onChange={(e) => handlePeriodoChange(e.target.value || "")}
                >
                  <option value="">Personalizado</option>
                  <option value="HOJE">Hoje</option>
                  <option value="ONTEM">Ontem</option>
                  <option value="ULT_5">Últimos 5 dias</option>
                  <option value="ULT_15">Últimos 15 dias</option>
                  <option value="SEMANA_ATUAL">Semana atual</option>
                  <option value="MES_ATUAL">Mês atual</option>
                  <option value="MES_PASSADO">Mês passado</option>
                </FilterSelect>
              </FilterGroup>
            </FiltersLeft>

            <FiltersRight>
              <FilterButton type="submit" disabled={loading.any()}>
                Buscar
              </FilterButton>
              <ClearButton
                type="button"
                disabled={loading.any()}
                onClick={async () => {
                  clearFilters();
                  await fetchFromFilters({
                    dt_inicio: "",
                    dt_fim: "",
                    periodo: "",
                  });
                }}
              >
                Limpar
              </ClearButton>
            </FiltersRight>
          </FiltersRow>
        </FiltersCard>

        <Indicators
          pedidos={pedidos}
          canExpedir={canExpedir(user)}
          total={pedidos.length}
          onSelectStatus={(st) => setStatusFiltro(st)}
          selectedStatus={statusFiltro}
        />

        <Legend>
          <StatusPill $variant="pendente">Ag. conferência</StatusPill>
          <StatusPill $variant="primeira">Pronto p/ expedir</StatusPill>
          <StatusPill $variant="concluido">Expedido</StatusPill>
        </Legend>

        {isAdmin(user) && showDeleted && (
          <DeletedPanel>
            <h4 style={{ margin: 0 }}>Registros de Exclusões</h4>
            <div style={{ marginTop: 8 }}>
              {deletedPedidos.length === 0 && (
                <div style={{ opacity: 0.7 }}>Nenhum registro.</div>
              )}
              {deletedPedidos.map((r, idx) => (
                <div
                  key={`${r.nr_pedido}-${idx}`}
                  style={{
                    fontSize: 13,
                    padding: "6px 8px",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    marginBottom: 6,
                    background: "#fafafa",
                  }}
                >
                  <div>
                    <strong>Pedido #{r.nr_pedido}</strong> — <em>{r.by}</em>{" "}
                    <small>({new Date(r.at).toLocaleString("pt-BR")})</small>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <strong>Justificativa:</strong> {r.justificativa}
                  </div>
                </div>
              ))}
            </div>
          </DeletedPanel>
        )}

        <CardsWrap>
          <CardGrid>
            {pedidosFiltrados.map((p) => (
              <PedidoCard
                key={p.nr_pedido}
                pedido={p}
                currentUser={user}
                onUpdate={onUpdatePedido}
                onDelete={(nr, payload) =>
                  onDeletePedido(nr, {
                    ...(payload || {}),
                    user: user?.email || "usuário",
                  })
                }
                onOpen={() => openInfoWithFetch(p)}
                onExpedir={onExpedirPedido}
                canExpedir={canExpedir(user)}
                onOpenConferencia={() => openConferencia(p)}
                refreshPedido={refreshPedido}
              />
            ))}
          </CardGrid>

          {!loading.any() && pedidosFiltrados.length === 0 && (
            <div style={{ opacity: 0.7, padding: "8px 0" }}>
              Nenhum pedido encontrado.
            </div>
          )}
        </CardsWrap>

        <UploadCsvModal
          isOpen={openCsv}
          onClose={() => setOpenCsv(false)}
          onImported={onImportedCsv}
        />
        <PedidoFormModal
          isOpen={openManual}
          onClose={() => setOpenManual(false)}
          onSubmit={onCreatedManual}
        />

        <ModalInfo
          isOpen={openInfo}
          onClose={() => setOpenInfo(false)}
          pedido={activePedido}
          onUpdate={onUpdatePedido}
          onOpenConferencia={() => {
            if (activePedido) openConferencia(activePedido);
          }}
          onDeleted={(nr, payload) =>
            onDeletePedido(nr, {
              ...(payload || {}),
              user: user?.email || "usuário",
            })
          }
        />

        <ConferenciaModal
          isOpen={openConf}
          onClose={() => {
            setOpenConf(false);
            setConfPedido(null);
          }}
          pedido={confPedido}
          onConfirm={handleConfirmConferencia}
          onOccurrence={handleOccurrence}
        />

        <FakeLabelsModal isOpen={openFake} onClose={() => setOpenFake(false)} />

        <ModalExpedidos
          isOpen={openExpedidos}
          onClose={() => setOpenExpedidos(false)}
          pedidos={candidatosExpedicao}
          onConfirm={async (selecionados) => {
            for (let i = 0; i < selecionados.length; i++) {
              const s = selecionados[i];
              await onExpedirPedido(s.nr_pedido, s.nota);
            }
            setOpenExpedidos(false);
          }}
          canExpedir={canExpedir(user)}
        />
      </Content>
    </Page>
  );
}
