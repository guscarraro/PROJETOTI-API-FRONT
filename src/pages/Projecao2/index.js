import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../Projetos/components/NavBar";
import { Page } from "../Projetos/style";

import {
  Content,
  TitleBarWrap,
  RightRow,
  FiltersRow,
  TinyLabel,
  Field,
  Select,
  DividerRow,
  Chip,
  Muted,
  H1,
  CardGrid,
  KPI,
  KPIValue,
  KPILabel,
  KPIIcon,
  KPIHint,
  KPITrendRow,
  TrendPill,
  ChartCard,
  ChartTitle,
  TableCard,
  Table,
  THead,
  TRow,
  TCell,
  RankingsRow,
  AlertGrid,
  AlertCard,
  AlertTitle,
  AlertValue,
  AlertList,
  AlertItem,
  ProgressWrap,
  ProgressBar,
  ProgressLegend,
  LegendDot,
  SplitRow,
  SplitLeft,
  SplitRight,
} from "./style";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  FiBox,
  FiLayers,
  FiPackage,
  FiTruck,
  FiClock,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiArchive,
  FiGrid,
  FiInfo,
  FiActivity,
} from "react-icons/fi";

/* paleta "viva porém decente" */
const PIE_COLORS = [
  "#22d3ee", // cyan
  "#a3e635", // lime
  "#f97316", // orange
  "#fb7185", // rose
  "#38bdf8", // sky
  "#c4b5fd", // violet
  "#facc15", // amber
  "#f472b6", // pink
];

const BAR_COLORS = {
  recebimento: "#22d3ee",
  separacao: "#a3e635",
  conferencia: "#f97316",
  expedicao: "#fb7185",
};

const TIPOS = ["Recebimento", "Separação", "Conferência", "Expedição"];

function pad2(n) {
  const x = Number(n || 0);
  return x < 10 ? `0${x}` : `${x}`;
}

function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10);
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

function formatSecsToHHMMSS(s) {
  if (s == null) return "-";
  const total = Math.max(0, Math.floor(Number(s) || 0));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function formatSecsToHuman(s) {
  if (s == null) return "-";
  const total = Math.max(0, Math.floor(Number(s) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h <= 0) return `${m} min`;
  return `${h}h ${m}m`;
}

function parseDateSafe(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function inRangeISO(iso, startISO, endISO) {
  const d = parseDateSafe(iso);
  if (!d) return false;
  const s = parseDateSafe(startISO);
  const e = parseDateSafe(endISO);
  if (!s || !e) return true;
  return d.getTime() >= startOfDay(s).getTime() && d.getTime() <= endOfDay(e).getTime();
}

function ymdFromISO(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}

function fmtAxisDay(ymd) {
  const parts = String(ymd || "").split("-");
  if (parts.length !== 3) return ymd;
  return `${parts[2]}/${parts[1]}`;
}

/**
 * MOCK “quase real” — Demandas com etapas + volumes/peso
 */
function buildMockDemandas() {
  const baseToday = new Date();
  const today = toISODate(baseToday);
  const y1 = new Date(baseToday); y1.setDate(y1.getDate() - 1);
  const y2 = new Date(baseToday); y2.setDate(y2.getDate() - 2);
  const y3 = new Date(baseToday); y3.setDate(y3.getDate() - 3);
  const y4 = new Date(baseToday); y4.setDate(y4.getDate() - 4);
  const y5 = new Date(baseToday); y5.setDate(y5.getDate() - 5);

  const d1 = toISODate(y1);
  const d2 = toISODate(y2);
  const d3 = toISODate(y3);
  const d4 = toISODate(y4);
  const d5 = toISODate(y5);

  const clientes = ["VAPZA", "SOMA", "SC DISTRIBUICAO", "SOETO", "DACOLONIA"];
  const receb = ["Rafael", "Marcos", "Duda"];
  const sep = ["Bruno", "Gustavo", "Paula", "João"];
  const conf = ["Camila", "Diego", "Tainá"];
  const exp = ["Luan", "Moisés", "Bia"];

  function isoAt(dayISO, hh, mm) {
    return `${dayISO}T${pad2(hh)}:${pad2(mm)}:00`;
  }

  return [
    {
      id: "D-1001",
      cliente: clientes[0],
      createdAt: isoAt(d5, 8, 12),
      totalVolumes: 68,
      totalPesoKg: 512.4,
      totalPallets: 3,
      etapas: {
        recebimento: { startedAt: isoAt(d5, 8, 20), finishedAt: isoAt(d5, 8, 58), responsavel: receb[0] },
        separacao: { startedAt: isoAt(d5, 9, 5), finishedAt: isoAt(d5, 10, 6), responsavel: sep[1] },
        conferencia: { startedAt: isoAt(d5, 10, 10), finishedAt: isoAt(d5, 10, 40), responsavel: conf[0] },
        expedicao: { startedAt: isoAt(d5, 11, 10), finishedAt: isoAt(d5, 11, 26), responsavel: exp[2] },
      },
    },
    {
      id: "D-1002",
      cliente: clientes[1],
      createdAt: isoAt(d4, 9, 0),
      totalVolumes: 120,
      totalPesoKg: 930.2,
      totalPallets: 5,
      etapas: {
        recebimento: { startedAt: isoAt(d4, 9, 10), finishedAt: isoAt(d4, 9, 55), responsavel: receb[1] },
        separacao: { startedAt: isoAt(d4, 10, 10), finishedAt: isoAt(d4, 11, 35), responsavel: sep[0] },
        conferencia: { startedAt: isoAt(d4, 11, 40), finishedAt: isoAt(d4, 12, 5), responsavel: conf[1] },
        expedicao: { startedAt: isoAt(d4, 12, 25), finishedAt: isoAt(d4, 12, 50), responsavel: exp[0] },
      },
    },
    {
      id: "D-1003",
      cliente: clientes[2],
      createdAt: isoAt(d3, 13, 15),
      totalVolumes: 45,
      totalPesoKg: 220.0,
      totalPallets: 2,
      etapas: {
        recebimento: { startedAt: isoAt(d3, 13, 25), finishedAt: isoAt(d3, 14, 5), responsavel: receb[2] },
        separacao: { startedAt: isoAt(d3, 14, 10), finishedAt: isoAt(d3, 14, 55), responsavel: sep[2] },
        conferencia: { startedAt: isoAt(d3, 15, 0), finishedAt: isoAt(d3, 15, 18), responsavel: conf[2] },
        expedicao: { startedAt: isoAt(d3, 15, 40), finishedAt: isoAt(d3, 16, 0), responsavel: exp[1] },
      },
    },
    {
      id: "D-1004",
      cliente: clientes[3],
      createdAt: isoAt(d2, 7, 55),
      totalVolumes: 210,
      totalPesoKg: 1505.6,
      totalPallets: 9,
      etapas: {
        recebimento: { startedAt: isoAt(d2, 8, 10), finishedAt: isoAt(d2, 9, 25), responsavel: receb[0] },
        separacao: { startedAt: isoAt(d2, 9, 35), finishedAt: isoAt(d2, 12, 5), responsavel: sep[3] },
        conferencia: { startedAt: isoAt(d2, 12, 10), finishedAt: isoAt(d2, 13, 20), responsavel: conf[1] },
        expedicao: { startedAt: isoAt(d2, 14, 15), finishedAt: isoAt(d2, 14, 40), responsavel: exp[0] },
      },
    },
    {
      id: "D-1005",
      cliente: clientes[4],
      createdAt: isoAt(d1, 10, 5),
      totalVolumes: 34,
      totalPesoKg: 98.2,
      totalPallets: 1,
      etapas: {
        recebimento: { startedAt: isoAt(d1, 10, 10), finishedAt: isoAt(d1, 10, 22), responsavel: receb[1] },
        separacao: { startedAt: isoAt(d1, 10, 25), finishedAt: isoAt(d1, 11, 5), responsavel: sep[0] },
        conferencia: { startedAt: isoAt(d1, 11, 15), finishedAt: isoAt(d1, 11, 32), responsavel: conf[0] },
        expedicao: { startedAt: isoAt(d1, 12, 10), finishedAt: isoAt(d1, 12, 22), responsavel: exp[2] },
      },
    },
    {
      id: "D-1006",
      cliente: clientes[0],
      createdAt: isoAt(today, 8, 40),
      totalVolumes: 52,
      totalPesoKg: 410.8,
      totalPallets: 2,
      etapas: {
        recebimento: { startedAt: isoAt(today, 8, 45), finishedAt: isoAt(today, 9, 5), responsavel: receb[2] },
        separacao: { startedAt: isoAt(today, 9, 12), finishedAt: isoAt(today, 10, 0), responsavel: sep[1] },
        conferencia: { startedAt: isoAt(today, 10, 6), finishedAt: isoAt(today, 10, 28), responsavel: conf[2] },
        expedicao: { startedAt: isoAt(today, 11, 0), finishedAt: isoAt(today, 11, 18), responsavel: exp[1] },
      },
    },
    {
      id: "D-1007",
      cliente: clientes[1],
      createdAt: isoAt(today, 9, 10),
      totalVolumes: 95,
      totalPesoKg: 700.0,
      totalPallets: 4,
      etapas: {
        recebimento: { startedAt: isoAt(today, 9, 20), finishedAt: isoAt(today, 9, 50), responsavel: receb[0] },
        separacao: { startedAt: isoAt(today, 10, 5), finishedAt: isoAt(today, 11, 22), responsavel: sep[0] },
        conferencia: { startedAt: isoAt(today, 11, 30), finishedAt: isoAt(today, 12, 5), responsavel: conf[1] },
        expedicao: { startedAt: isoAt(today, 12, 20), finishedAt: isoAt(today, 12, 40), responsavel: exp[0] },
      },
    },
    // demanda em andamento
    {
      id: "D-1008",
      cliente: clientes[3],
      createdAt: isoAt(today, 11, 20),
      totalVolumes: 180,
      totalPesoKg: 980.5,
      totalPallets: 8,
      etapas: {
        recebimento: { startedAt: isoAt(today, 11, 30), finishedAt: isoAt(today, 12, 20), responsavel: receb[1] },
        separacao: { startedAt: isoAt(today, 12, 30), finishedAt: null, responsavel: sep[2] },
        conferencia: { startedAt: null, finishedAt: null, responsavel: null },
        expedicao: { startedAt: null, finishedAt: null, responsavel: null },
      },
    },
  ];
}

/** gaps entre etapas (Receb→Sep, Sep→Conf, Conf→Exp) */
function estimateIdleSeconds(d) {
  const e = d?.etapas || {};
  const r = e.recebimento || {};
  const s = e.separacao || {};
  const c = e.conferencia || {};
  const x = e.expedicao || {};

  const times = [];
  if (r.finishedAt && s.startedAt) times.push([r.finishedAt, s.startedAt]);
  if (s.finishedAt && c.startedAt) times.push([s.finishedAt, c.startedAt]);
  if (c.finishedAt && x.startedAt) times.push([c.finishedAt, x.startedAt]);

  let total = 0;
  for (let i = 0; i < times.length; i++) {
    const a = parseDateSafe(times[i][0]);
    const b = parseDateSafe(times[i][1]);
    if (!a || !b) continue;
    const diff = Math.floor((b.getTime() - a.getTime()) / 1000);
    if (diff > 0) total += diff;
  }
  return total;
}

function durationSeconds(startISO, endISO) {
  const a = parseDateSafe(startISO);
  const b = parseDateSafe(endISO);
  if (!a || !b) return null;
  const diff = Math.floor((b.getTime() - a.getTime()) / 1000);
  if (diff < 0) return null;
  return diff;
}

/**
 * MOCK WMS (dados fixos + alertas vencimento)
 * Você pode depois ligar isso no back.
 */
function buildMockWmsSnapshot() {
  // FIXOS que você passou
  const posicoesTotais = 9184;
  const bases = 6580;
  const pallets = posicoesTotais - bases; // 2604
  const livres = 1543;
  const ocupadas = posicoesTotais - livres; // 7684

  // alertas (mix de clientes)
  const expAlerts = [
    { sku: "SKU-009812", desc: "Café Torrado 500g", cliente: "SOMA", lote: "L2301", vencimento: "HOJE", dias: 0, qtd: 96 },
    { sku: "SKU-004221", desc: "Leite UHT 1L", cliente: "VAPZA", lote: "A982", vencimento: "VENCIDO", dias: -3, qtd: 40 },
    { sku: "SKU-000775", desc: "Biscoito 300g", cliente: "SOETO", lote: "B129", vencimento: "29 dias", dias: 29, qtd: 180 },
    { sku: "SKU-001110", desc: "Achocolatado 400g", cliente: "DACOLONIA", lote: "K881", vencimento: "14 dias", dias: 14, qtd: 55 },
    { sku: "SKU-006601", desc: "Farinha 1kg", cliente: "SC DISTRIBUICAO", lote: "S771", vencimento: "7 dias", dias: 7, qtd: 120 },
  ];

  // ocupação por cliente (posições)
  const occupancyByCliente = [
    { cliente: "SOMA", posicoes: 1680 },
    { cliente: "SOETO", posicoes: 1460 },
    { cliente: "VAPZA", posicoes: 1320 },
    { cliente: "SC DISTRIBUICAO", posicoes: 980 },
    { cliente: "DACOLONIA", posicoes: 820 },
  ];

  return {
    posicoesTotais,
    bases,
    pallets,
    livres,
    ocupadas,
    expAlerts,
    occupancyByCliente,
  };
}

function classifyExpAlert(dias) {
  // vermelho: vencido ou vence hoje
  if (dias <= 0) return "danger";
  // laranja: dentro de 30 dias
  if (dias <= 30) return "warning";
  return "ok";
}

export default function DashboardDemanda() {
  // filtros (default: semana atual)
  const today = new Date();
  const weekStart = new Date(today);
  const day = weekStart.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diffToMon);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const [quickRange, setQuickRange] = useState("current_week");
  const [start, setStart] = useState(toISODate(weekStart));
  const [end, setEnd] = useState(toISODate(weekEnd));

  const [tipo, setTipo] = useState("TODOS");
  const [cliente, setCliente] = useState("TODOS");

  // dados mock
  const [rows, setRows] = useState([]);
  const [wms, setWms] = useState(null);

  useEffect(() => {
    setRows(buildMockDemandas());
    setWms(buildMockWmsSnapshot());
  }, []);

  function applyQuickRange(v) {
    const base = new Date();
    if (v === "today") {
      setStart(toISODate(startOfDay(base)));
      setEnd(toISODate(endOfDay(base)));
      return;
    }
    if (v === "yesterday") {
      const y = new Date(base);
      y.setDate(y.getDate() - 1);
      setStart(toISODate(startOfDay(y)));
      setEnd(toISODate(endOfDay(y)));
      return;
    }
    if (v === "current_week") {
      const d0 = new Date(base);
      const dw = d0.getDay();
      const diff = dw === 0 ? -6 : 1 - dw;
      d0.setDate(d0.getDate() + diff);
      const d1 = new Date(d0);
      d1.setDate(d0.getDate() + 6);
      setStart(toISODate(startOfDay(d0)));
      setEnd(toISODate(endOfDay(d1)));
      return;
    }
    if (v === "last_15") {
      const d1 = new Date(base);
      const d0 = new Date(base);
      d0.setDate(d0.getDate() - 14);
      setStart(toISODate(startOfDay(d0)));
      setEnd(toISODate(endOfDay(d1)));
      return;
    }
    if (v === "current_month") {
      const d0 = new Date(base.getFullYear(), base.getMonth(), 1);
      const d1 = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      setStart(toISODate(startOfDay(d0)));
      setEnd(toISODate(endOfDay(d1)));
      return;
    }
  }

  const clientesDisponiveis = useMemo(() => {
    const map = {};
    for (let i = 0; i < rows.length; i++) {
      const c = String(rows[i]?.cliente || "").trim();
      if (c) map[c] = true;
    }
    return Object.keys(map).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [rows]);

  const filtered = useMemo(() => {
    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const d = rows[i];
      if (!inRangeISO(d.createdAt, start, end)) continue;

      if (cliente !== "TODOS" && String(d.cliente) !== String(cliente)) continue;

      if (tipo !== "TODOS") {
        const e = d.etapas || {};
        const has =
          (tipo === "Recebimento" && (e.recebimento?.startedAt || e.recebimento?.finishedAt)) ||
          (tipo === "Separação" && (e.separacao?.startedAt || e.separacao?.finishedAt)) ||
          (tipo === "Conferência" && (e.conferencia?.startedAt || e.conferencia?.finishedAt)) ||
          (tipo === "Expedição" && (e.expedicao?.startedAt || e.expedicao?.finishedAt));

        if (!has) continue;
      }

      out.push(d);
    }
    return out;
  }, [rows, start, end, cliente, tipo]);

  // =========================
  // KPIs operação
  // =========================
  const kpis = useMemo(() => {
    let totalDemandas = 0;
    let wip = 0;

    let totalVolumes = 0;
    let totalPeso = 0;
    let totalPallets = 0;

    const sumSec = { receb: 0, sep: 0, conf: 0, exp: 0 };
    const cntSec = { receb: 0, sep: 0, conf: 0, exp: 0 };

    const qtdEtapaConcluida = { receb: 0, sep: 0, conf: 0, exp: 0 };

    let idleTotalSec = 0;

    for (let i = 0; i < filtered.length; i++) {
      const d = filtered[i];
      totalDemandas += 1;

      totalVolumes += Number(d.totalVolumes || 0);
      totalPeso += Number(d.totalPesoKg || 0);
      totalPallets += Number(d.totalPallets || 0);

      const e = d.etapas || {};
      const r = e.recebimento || {};
      const s = e.separacao || {};
      const c = e.conferencia || {};
      const x = e.expedicao || {};

      const dr = durationSeconds(r.startedAt, r.finishedAt);
      if (dr != null) {
        sumSec.receb += dr;
        cntSec.receb += 1;
        qtdEtapaConcluida.receb += 1;
      }

      const ds = durationSeconds(s.startedAt, s.finishedAt);
      if (ds != null) {
        sumSec.sep += ds;
        cntSec.sep += 1;
        qtdEtapaConcluida.sep += 1;
      }

      const dc = durationSeconds(c.startedAt, c.finishedAt);
      if (dc != null) {
        sumSec.conf += dc;
        cntSec.conf += 1;
        qtdEtapaConcluida.conf += 1;
      }

      const dx = durationSeconds(x.startedAt, x.finishedAt);
      if (dx != null) {
        sumSec.exp += dx;
        cntSec.exp += 1;
        qtdEtapaConcluida.exp += 1;
      }

      if (!x.finishedAt) wip += 1;

      idleTotalSec += estimateIdleSeconds(d);
    }

    function avg(sum, cnt) {
      if (!cnt) return 0;
      return Math.floor(sum / cnt);
    }

    return {
      totalDemandas,
      wip,
      totalVolumes,
      totalPeso,
      totalPallets,

      avgRecebSec: avg(sumSec.receb, cntSec.receb),
      avgSepSec: avg(sumSec.sep, cntSec.sep),
      avgConfSec: avg(sumSec.conf, cntSec.conf),
      avgExpSec: avg(sumSec.exp, cntSec.exp),

      qtdEtapaConcluida,
      idleTotalSec,
    };
  }, [filtered]);

  // série diária: demandas concluídas por etapa no dia
  const dailySeries = useMemo(() => {
    const map = {};
    for (let i = 0; i < filtered.length; i++) {
      const d = filtered[i];
      const e = d.etapas || {};
      const ymd = ymdFromISO(d.createdAt) || "—";

      if (!map[ymd]) {
        map[ymd] = { date: ymd, recebimento: 0, separacao: 0, conferencia: 0, expedicao: 0 };
      }

      if (e.recebimento?.finishedAt) map[ymd].recebimento += 1;
      if (e.separacao?.finishedAt) map[ymd].separacao += 1;
      if (e.conferencia?.finishedAt) map[ymd].conferencia += 1;
      if (e.expedicao?.finishedAt) map[ymd].expedicao += 1;
    }

    const keys = Object.keys(map).sort((a, b) => a.localeCompare(b));
    const out = [];
    for (let i = 0; i < keys.length; i++) out.push(map[keys[i]]);
    return out;
  }, [filtered]);

  // gráfico: tempos médios por etapa (bar)
  const avgByEtapaChart = useMemo(() => {
    return [
      { name: "Recebimento", avg: kpis.avgRecebSec },
      { name: "Separação", avg: kpis.avgSepSec },
      { name: "Conferência", avg: kpis.avgConfSec },
      { name: "Expedição", avg: kpis.avgExpSec },
    ];
  }, [kpis]);

  // volumes/peso por cliente
  const byCliente = useMemo(() => {
    const map = {};
    for (let i = 0; i < filtered.length; i++) {
      const d = filtered[i];
      const c = String(d.cliente || "—");
      if (!map[c]) map[c] = { cliente: c, demandas: 0, volumes: 0, peso: 0, pallets: 0 };
      map[c].demandas += 1;
      map[c].volumes += Number(d.totalVolumes || 0);
      map[c].peso += Number(d.totalPesoKg || 0);
      map[c].pallets += Number(d.totalPallets || 0);
    }

    const arr = Object.values(map);
    arr.sort((a, b) => (b.demandas || 0) - (a.demandas || 0));
    return arr;
  }, [filtered]);

  const pieVolumes = useMemo(() => {
    const out = [];
    for (let i = 0; i < byCliente.length; i++) out.push({ name: byCliente[i].cliente, value: byCliente[i].volumes });
    return out;
  }, [byCliente]);

  // ranking: separação
  const rankingSeparacao = useMemo(() => {
    const map = {};
    for (let i = 0; i < filtered.length; i++) {
      const e = filtered[i].etapas || {};
      const s = e.separacao || {};
      if (!s.finishedAt) continue;
      const nome = String(s.responsavel || "—").trim();
      if (!nome || nome === "—") continue;

      if (!map[nome]) map[nome] = { nome, demandas: 0, tempoSec: 0, volumes: 0, peso: 0 };

      map[nome].demandas += 1;

      const dur = durationSeconds(s.startedAt, s.finishedAt);
      if (dur != null) map[nome].tempoSec += dur;

      map[nome].volumes += Number(filtered[i].totalVolumes || 0);
      map[nome].peso += Number(filtered[i].totalPesoKg || 0);
    }

    const arr = Object.values(map);
    arr.sort((a, b) => (b.demandas || 0) - (a.demandas || 0));

    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const r = arr[i];
      const avg = r.demandas > 0 ? Math.floor(r.tempoSec / r.demandas) : 0;
      out.push({ ...r, avgSec: avg });
    }
    return out.slice(0, 10);
  }, [filtered]);

  // ranking: conferência
  const rankingConferencia = useMemo(() => {
    const map = {};
    for (let i = 0; i < filtered.length; i++) {
      const e = filtered[i].etapas || {};
      const c = e.conferencia || {};
      if (!c.finishedAt) continue;
      const nome = String(c.responsavel || "—").trim();
      if (!nome || nome === "—") continue;

      if (!map[nome]) map[nome] = { nome, demandas: 0, tempoSec: 0, volumes: 0, peso: 0 };

      map[nome].demandas += 1;

      const dur = durationSeconds(c.startedAt, c.finishedAt);
      if (dur != null) map[nome].tempoSec += dur;

      map[nome].volumes += Number(filtered[i].totalVolumes || 0);
      map[nome].peso += Number(filtered[i].totalPesoKg || 0);
    }

    const arr = Object.values(map);
    arr.sort((a, b) => (b.demandas || 0) - (a.demandas || 0));

    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const r = arr[i];
      const avg = r.demandas > 0 ? Math.floor(r.tempoSec / r.demandas) : 0;
      out.push({ ...r, avgSec: avg });
    }
    return out.slice(0, 10);
  }, [filtered]);

  // ociosidade por colaborador
  const rankingOciosidade = useMemo(() => {
    const map = {};

    for (let i = 0; i < filtered.length; i++) {
      const d = filtered[i];
      const e = d.etapas || {};
      const idle = estimateIdleSeconds(d);

      const names = [];
      const r = e.recebimento?.responsavel ? String(e.recebimento.responsavel) : "";
      const s = e.separacao?.responsavel ? String(e.separacao.responsavel) : "";
      const c = e.conferencia?.responsavel ? String(e.conferencia.responsavel) : "";
      const x = e.expedicao?.responsavel ? String(e.expedicao.responsavel) : "";

      if (r) names.push(r);
      if (s) names.push(s);
      if (c) names.push(c);
      if (x) names.push(x);

      const denom = names.length > 0 ? names.length : 1;
      const share = Math.floor(idle / denom);

      for (let j = 0; j < names.length; j++) {
        const n = names[j];
        if (!map[n]) map[n] = { nome: n, idleSec: 0, demandas: 0 };
        map[n].idleSec += share;
        map[n].demandas += 1;
      }
    }

    const arr = Object.values(map);
    arr.sort((a, b) => (b.idleSec || 0) - (a.idleSec || 0));
    return arr.slice(0, 10);
  }, [filtered]);

  // =========================
  // KPIs WMS
  // =========================
  const wmsKpis = useMemo(() => {
    if (!wms) return null;

    const ocupPerc = wms.posicoesTotais > 0 ? (wms.ocupadas / wms.posicoesTotais) * 100 : 0;
    const livPerc = wms.posicoesTotais > 0 ? (wms.livres / wms.posicoesTotais) * 100 : 0;

    // contagem alertas
    let danger = 0;
    let warning = 0;
    let ok = 0;
    const items = Array.isArray(wms.expAlerts) ? wms.expAlerts : [];

    for (let i = 0; i < items.length; i++) {
      const cls = classifyExpAlert(items[i]?.dias);
      if (cls === "danger") danger += 1;
      else if (cls === "warning") warning += 1;
      else ok += 1;
    }

    return {
      ocupPerc,
      livPerc,
      expDanger: danger,
      expWarning: warning,
      expOk: ok,
    };
  }, [wms]);

  const pieOccupancy = useMemo(() => {
    if (!wms) return [];
    return [
      { name: "Ocupadas", value: wms.ocupadas },
      { name: "Livres", value: wms.livres },
    ];
  }, [wms]);

  const topClienteOcupacao = useMemo(() => {
    if (!wms?.occupancyByCliente) return [];
    const arr = Array.isArray(wms.occupancyByCliente) ? wms.occupancyByCliente : [];
    const out = [...arr];
    out.sort((a, b) => (b.posicoes || 0) - (a.posicoes || 0));
    return out.slice(0, 8);
  }, [wms]);

  return (
    <Page>
      <NavBar />
      <Content>
        <TitleBarWrap>
          <H1 $accent="#22d3ee">Dashboard • KPIs da Operação & WMS</H1>

          <RightRow>
            <FiltersRow>
              <div>
                <TinyLabel>Período rápido</TinyLabel>
                <Select
                  value={quickRange}
                  onChange={(e) => {
                    const v = e.target.value;
                    setQuickRange(v);
                    if (v === "custom") return;
                    applyQuickRange(v);
                  }}
                >
                  <option value="current_week">Semana atual</option>
                  <option value="today">Hoje</option>
                  <option value="yesterday">Ontem</option>
                  <option value="last_15">Últimos 15 dias</option>
                  <option value="current_month">Mês atual</option>
                  <option value="custom">Personalizado</option>
                </Select>
              </div>

              <div>
                <TinyLabel>Início</TinyLabel>
                <Field
                  type="date"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    setQuickRange("custom");
                  }}
                />
              </div>

              <div>
                <TinyLabel>Fim</TinyLabel>
                <Field
                  type="date"
                  value={end}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    setQuickRange("custom");
                  }}
                />
              </div>

              <div>
                <TinyLabel>Etapa</TinyLabel>
                <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="TODOS">Todas</option>
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <TinyLabel>Cliente</TinyLabel>
                <Select value={cliente} onChange={(e) => setCliente(e.target.value)}>
                  <option value="TODOS">Todos</option>
                  {clientesDisponiveis.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </FiltersRow>
          </RightRow>
        </TitleBarWrap>

        <DividerRow>
          <Chip title="Quantidade de demandas filtradas">
            <FiActivity /> Demandas: {kpis.totalDemandas}
          </Chip>
          <Chip title="Demandas ainda sem expedição finalizada">
            <FiClock /> WIP: {kpis.wip}
          </Chip>
          {wms ? (
            <Chip title="Posições livres para uso (matriz)">
              <FiGrid /> Livres (matriz): {wms.livres}
            </Chip>
          ) : null}
          <Muted>
            Janela: <strong>{start}</strong> até <strong>{end}</strong>
          </Muted>
        </DividerRow>

        {/* =======================
            KPIs OPERAÇÃO
        ======================= */}
        <SplitRow>
          <SplitLeft>
            <h2 style={{ margin: "10px 0 6px 0", fontSize: 14, fontWeight: 900, opacity: 0.85 }}>
              Operação (fluxo)
            </h2>

            <CardGrid>
              <KPI>
                <KPIIcon $tone="info">
                  <FiBox />
                </KPIIcon>
                <KPIValue>{kpis.totalDemandas}</KPIValue>
                <KPILabel>Total de demandas</KPILabel>
                <KPIHint>no período</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="warn">
                  <FiClock />
                </KPIIcon>
                <KPIValue>{kpis.wip}</KPIValue>
                <KPILabel>Em andamento (WIP)</KPILabel>
                <KPIHint>sem expedição finalizada</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="ok">
                  <FiPackage />
                </KPIIcon>
                <KPIValue>{kpis.totalVolumes}</KPIValue>
                <KPILabel>Volumes</KPILabel>
                <KPIHint>soma</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="info">
                  <FiLayers />
                </KPIIcon>
                <KPIValue>{kpis.totalPallets}</KPIValue>
                <KPILabel>Pallets</KPILabel>
                <KPIHint>soma</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="info">
                  <FiTrendingUp />
                </KPIIcon>
                <KPIValue>{kpis.totalPeso.toFixed(1)}</KPIValue>
                <KPILabel>Peso total (kg)</KPILabel>
                <KPIHint>soma</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="info">
                  <FiTruck />
                </KPIIcon>
                <KPIValue>{formatSecsToHuman(kpis.avgRecebSec)}</KPIValue>
                <KPILabel>Tempo médio • Recebimento</KPILabel>
                <KPIHint>média por demanda</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="ok">
                  <FiArchive />
                </KPIIcon>
                <KPIValue>{formatSecsToHuman(kpis.avgSepSec)}</KPIValue>
                <KPILabel>Tempo médio • Separação</KPILabel>
                <KPIHint>média por demanda</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="warn">
                  <FiCheckCircle />
                </KPIIcon>
                <KPIValue>{formatSecsToHuman(kpis.avgConfSec)}</KPIValue>
                <KPILabel>Tempo médio • Conferência</KPILabel>
                <KPIHint>média por demanda</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="danger">
                  <FiTruck />
                </KPIIcon>
                <KPIValue>{formatSecsToHuman(kpis.avgExpSec)}</KPIValue>
                <KPILabel>Tempo médio • Expedição</KPILabel>
                <KPIHint>média por demanda</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="warn">
                  <FiInfo />
                </KPIIcon>
                <KPIValue>{formatSecsToHuman(kpis.idleTotalSec)}</KPIValue>
                <KPILabel>Gaps entre etapas</KPILabel>
                <KPIHint>indicador operacional</KPIHint>
              </KPI>
            </CardGrid>
          </SplitLeft>

          {/* =======================
              KPIs WMS
          ======================= */}
          <SplitRight>
            <h2 style={{ margin: "10px 0 6px 0", fontSize: 14, fontWeight: 900, opacity: 0.85 }}>
              WMS (armazenagem)
            </h2>

            <CardGrid>
              <KPI>
                <KPIIcon $tone="info">
                  <FiGrid />
                </KPIIcon>
                <KPIValue>{wms?.posicoesTotais ?? 0}</KPIValue>
                <KPILabel>Posições no estoque</KPILabel>
                <KPIHint>capacidade total</KPIHint>
              </KPI>

              {/* <KPI>
                <KPIIcon $tone="ok">
                  <FiLayers />
                </KPIIcon>
                <KPIValue>{wms?.bases ?? 0}</KPIValue>
                <KPILabel>Bases</KPILabel>
                <KPIHint>posições base</KPIHint>
              </KPI> */}
{/* 
              <KPI>
                <KPIIcon $tone="info">
                  <FiPackage />
                </KPIIcon>
                <KPIValue>{wms?.pallets ?? 0}</KPIValue>
                <KPILabel>Posições pallet</KPILabel>
                <KPIHint>totais - bases</KPIHint>
              </KPI> */}

              <KPI>
                <KPIIcon $tone="ok">
                  <FiCheckCircle />
                </KPIIcon>
                <KPIValue>{wms?.livres ?? 0}</KPIValue>
                <KPILabel>Posições livres</KPILabel>
                <KPIHint>matriz disponível</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone="warn">
                  <FiXCircle />
                </KPIIcon>
                <KPIValue>{wms?.ocupadas ?? 0}</KPIValue>
                <KPILabel>Posições ocupadas</KPILabel>
                <KPIHint>em uso</KPIHint>
              </KPI>

              <KPI>
                <KPIIcon $tone={wmsKpis?.expDanger ? "danger" : wmsKpis?.expWarning ? "warn" : "ok"}>
                  <FiCalendar />
                </KPIIcon>
                <KPIValue>
                  {(wmsKpis?.expDanger || 0) + (wmsKpis?.expWarning || 0)}
                </KPIValue>
                <KPILabel>Alertas de vencimento</KPILabel>
                <KPIHint>30 dias / hoje / vencido</KPIHint>

                <KPITrendRow>
                  <TrendPill $tone="warn">
                    <FiAlertTriangle /> {wmsKpis?.expWarning ?? 0} em 30 dias
                  </TrendPill>
                  <TrendPill $tone="danger">
                    <FiXCircle /> {wmsKpis?.expDanger ?? 0} hoje/vencido
                  </TrendPill>
                </KPITrendRow>
              </KPI>
            </CardGrid>

            {/* Ocupação (progress) */}
            <ChartCard style={{ marginTop: 12 }}>
              <ChartTitle>Ocupação do estoque (matriz)</ChartTitle>
              <ProgressWrap>
                <ProgressBar
                  style={{
                    width: `${Math.min(100, Math.max(0, wmsKpis?.ocupPerc ?? 0))}%`,
                  }}
                />
              </ProgressWrap>

              <ProgressLegend>
                <div>
                  <LegendDot $tone="danger" /> Ocupadas: <strong>{wms?.ocupadas ?? 0}</strong> (
                  {(wmsKpis?.ocupPerc ?? 0).toFixed(1)}%)
                </div>
                <div>
                  <LegendDot $tone="ok" /> Livres: <strong>{wms?.livres ?? 0}</strong> (
                  {(wmsKpis?.livPerc ?? 0).toFixed(1)}%)
                </div>
              </ProgressLegend>
            </ChartCard>
          </SplitRight>
        </SplitRow>

        {/* ALERTAS DE VENCIMENTO */}
        <AlertGrid>
          <AlertCard>
            <AlertTitle>
              <FiAlertTriangle /> Vencimento • atenção (≤ 30 dias)
            </AlertTitle>
            <AlertValue $tone="warn">{wmsKpis?.expWarning ?? 0}</AlertValue>
            <Muted>Itens próximos de vencer (30 dias)</Muted>

            <AlertList>
              {(wms?.expAlerts || [])
                .filter((a) => classifyExpAlert(a.dias) === "warning")
                .slice(0, 4)
                .map((a, idx) => (
                  <AlertItem key={`${a.sku}-${idx}`} $tone="warn">
                    <div className="left">
                      <span className="sku">{a.sku}</span>
                      <span className="desc">{a.desc}</span>
                      <span className="meta">
                        Cliente: <strong>{a.cliente}</strong> • Lote: {a.lote} • Qtd: {a.qtd}
                      </span>
                    </div>
                    <div className="badge">
                      <FiAlertTriangle /> {a.vencimento}
                    </div>
                  </AlertItem>
                ))}
            </AlertList>
          </AlertCard>

          <AlertCard>
            <AlertTitle>
              <FiXCircle /> Vencimento • crítico (hoje / vencido)
            </AlertTitle>
            <AlertValue $tone="danger">{wmsKpis?.expDanger ?? 0}</AlertValue>
            <Muted>Itens vencendo hoje ou já vencidos</Muted>

            <AlertList>
              {(wms?.expAlerts || [])
                .filter((a) => classifyExpAlert(a.dias) === "danger")
                .slice(0, 4)
                .map((a, idx) => (
                  <AlertItem key={`${a.sku}-${idx}`} $tone="danger">
                    <div className="left">
                      <span className="sku">{a.sku}</span>
                      <span className="desc">{a.desc}</span>
                      <span className="meta">
                        Cliente: <strong>{a.cliente}</strong> • Lote: {a.lote} • Qtd: {a.qtd}
                      </span>
                    </div>
                    <div className="badge">
                      <FiXCircle /> {a.vencimento}
                    </div>
                  </AlertItem>
                ))}
            </AlertList>
          </AlertCard>
        </AlertGrid>

        {/* Gráfico diário: contagem por etapa */}
        <ChartCard>
          <ChartTitle>Demandas concluídas por etapa • dia a dia</ChartTitle>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={dailySeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={fmtAxisDay} tick={{ fontSize: 10, fill: "#9ca3af" }} tickMargin={8} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #1f2937",
                    borderRadius: 8,
                    color: "#e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Bar dataKey="recebimento" name="Recebimento" fill={BAR_COLORS.recebimento} radius={[4, 4, 0, 0]} />
                <Bar dataKey="separacao" name="Separação" fill={BAR_COLORS.separacao} radius={[4, 4, 0, 0]} />
                <Bar dataKey="conferencia" name="Conferência" fill={BAR_COLORS.conferencia} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expedicao" name="Expedição" fill={BAR_COLORS.expedicao} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Tempos médios por etapa */}
        <ChartCard>
          <ChartTitle>Tempo médio por etapa (HH:MM:SS)</ChartTitle>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={avgByEtapaChart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barSize={26}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} tickMargin={10} />
                <YAxis tickFormatter={(v) => formatSecsToHHMMSS(v)} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip
                  formatter={(value) => formatSecsToHHMMSS(value)}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #1f2937",
                    borderRadius: 8,
                    color: "#e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="avg" name="Tempo médio" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <RankingsRow>
          {/* Ranking separação */}
          <TableCard>
            <ChartTitle>🏆 Ranking • Quem mais separou (Top 10)</ChartTitle>
            <Table>
              <THead>
                <tr>
                  <th>Separador</th>
                  <th>Demandas</th>
                  <th>Tempo médio</th>
                  <th>Peso (kg)</th>
                  <th>Volumes</th>
                </tr>
              </THead>
              <tbody>
                {rankingSeparacao.map((r, idx) => (
                  <TRow key={`${r.nome}-${idx}`}>
                    <TCell>{r.nome}</TCell>
                    <TCell>{r.demandas}</TCell>
                    <TCell>{formatSecsToHuman(r.avgSec)}</TCell>
                    <TCell>{(r.peso || 0).toFixed(1)}</TCell>
                    <TCell>{r.volumes || 0}</TCell>
                  </TRow>
                ))}
                {rankingSeparacao.length === 0 && (
                  <tr>
                    <TCell colSpan={5} style={{ opacity: 0.7 }}>
                      Sem dados no período.
                    </TCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableCard>

          {/* Ranking conferência */}
          <TableCard>
            <ChartTitle>🏆 Ranking • Conferência (Top 10)</ChartTitle>
            <Table>
              <THead>
                <tr>
                  <th>Conferente</th>
                  <th>Demandas</th>
                  <th>Tempo médio</th>
                  <th>Peso (kg)</th>
                  <th>Volumes</th>
                </tr>
              </THead>
              <tbody>
                {rankingConferencia.map((r, idx) => (
                  <TRow key={`${r.nome}-${idx}`}>
                    <TCell>{r.nome}</TCell>
                    <TCell>{r.demandas}</TCell>
                    <TCell>{formatSecsToHuman(r.avgSec)}</TCell>
                    <TCell>{(r.peso || 0).toFixed(1)}</TCell>
                    <TCell>{r.volumes || 0}</TCell>
                  </TRow>
                ))}
                {rankingConferencia.length === 0 && (
                  <tr>
                    <TCell colSpan={5} style={{ opacity: 0.7 }}>
                      Sem dados no período.
                    </TCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableCard>
        </RankingsRow>

        {/* Clientes: volumes/peso */}
        <RankingsRow>
          <ChartCard>
            <ChartTitle>Volumes por cliente</ChartTitle>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieVolumes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label
                    isAnimationActive={false}
                  >
                    {pieVolumes.map((entry, index) => (
                      <Cell key={`c-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #1f2937",
                      borderRadius: 8,
                      color: "#e5e7eb",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <TableCard>
            <ChartTitle>Clientes • demandas / peso / volumes</ChartTitle>
            <Table>
              <THead>
                <tr>
                  <th>Cliente</th>
                  <th>Demandas</th>
                  <th>Peso (kg)</th>
                  <th>Volumes</th>
                  <th>Pallets</th>
                </tr>
              </THead>
              <tbody>
                {byCliente.map((c, idx) => (
                  <TRow key={`${c.cliente}-${idx}`}>
                    <TCell>{c.cliente}</TCell>
                    <TCell>{c.demandas}</TCell>
                    <TCell>{(c.peso || 0).toFixed(1)}</TCell>
                    <TCell>{c.volumes || 0}</TCell>
                    <TCell>{c.pallets || 0}</TCell>
                  </TRow>
                ))}
                {byCliente.length === 0 && (
                  <tr>
                    <TCell colSpan={5} style={{ opacity: 0.7 }}>
                      Sem dados no período.
                    </TCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableCard>
        </RankingsRow>

        {/* Ocupação por cliente (WMS) */}
        <RankingsRow>
          <ChartCard>
            <ChartTitle>Ocupação do estoque por cliente (posições)</ChartTitle>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={topClienteOcupacao} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barSize={26}>
                  <XAxis dataKey="cliente" tick={{ fontSize: 10, fill: "#9ca3af" }} tickMargin={10} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #1f2937",
                      borderRadius: 8,
                      color: "#e5e7eb",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="posicoes" name="Posições" fill="#a3e635" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <TableCard>
            <ChartTitle>Clientes • posições ocupadas (matriz)</ChartTitle>
            <Table>
              <THead>
                <tr>
                  <th>Cliente</th>
                  <th>Posições</th>
                </tr>
              </THead>
              <tbody>
                {topClienteOcupacao.map((r, idx) => (
                  <TRow key={`${r.cliente}-${idx}`}>
                    <TCell>{r.cliente}</TCell>
                    <TCell>{r.posicoes}</TCell>
                  </TRow>
                ))}
                {topClienteOcupacao.length === 0 && (
                  <tr>
                    <TCell colSpan={2} style={{ opacity: 0.7 }}>
                      Sem dados.
                    </TCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableCard>
        </RankingsRow>

        {/* Ociosidade */}
        <TableCard>
          <ChartTitle>⏳ Gaps entre etapas por colaborador</ChartTitle>
          <Table>
            <THead>
              <tr>
                <th>Colaborador</th>
                <th>Tempo</th>
                <th>Participações</th>
              </tr>
            </THead>
            <tbody>
              {rankingOciosidade.map((r, idx) => (
                <TRow key={`${r.nome}-${idx}`}>
                  <TCell>{r.nome}</TCell>
                  <TCell>{formatSecsToHuman(r.idleSec)}</TCell>
                  <TCell>{r.demandas}</TCell>
                </TRow>
              ))}
              {rankingOciosidade.length === 0 && (
                <tr>
                  <TCell colSpan={3} style={{ opacity: 0.7 }}>
                    Sem dados no período.
                  </TCell>
                </tr>
              )}
            </tbody>
          </Table>
          <div style={{ padding: 12 }}>
            <Muted>
              Obs: este indicador usa os <strong>gaps</strong> entre etapas (Receb→Sep, Sep→Conf, Conf→Exp). No real, vira KPI
              com trilha de eventos do WMS + presença/apontamento.
            </Muted>
          </div>
        </TableCard>
      </Content>
    </Page>
  );
}