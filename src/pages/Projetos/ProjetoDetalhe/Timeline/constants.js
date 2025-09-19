// pages/ProjetoDetalhe/Timeline/constants.js
export const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export const monthBgTones = [
  "rgba(96,165,250,0.15)",
  "rgba(52,211,153,0.15)",
  "rgba(245,158,11,0.15)",
  "rgba(167,139,250,0.15)",
  "rgba(20,184,166,0.15)",
];

export const LEGEND_STATUS = [
  { label: "Em execução", color: "#60a5fa" },
  { label: "Concluído",   color: "#34d399" },
  { label: "Em risco",    color: "#f59e0b" },
  { label: "Bloqueado",   color: "#f87171" },
  { label: "Postergado",  color: "#a78bfa" },
  { label: "Stand by",    color: "#14b8a6" },
];

export const ALL_SECTORS = [
  { key: "SAC",          label: "SAC",          initial: "S", color: "#2563eb" },
  { key: "ARMAZENAGEM",  label: "Armazenagem",  initial: "A", color: "#263149ff" },
  { key: "OPERACAO",     label: "Operação",     initial: "O", color: "#059669" },
  { key: "FRETE",        label: "Frete",        initial: "F", color: "#f59e0b" },
  { key: "FROTA",        label: "Frota",        initial: "F", color: "#8b5cf6" },
  { key: "DIRETORIA",    label: "Diretoria",    initial: "D", color: "#ef4444" },
  { key: "QUALIDADE",    label: "Qualidade",    initial: "Q", color: "#44ef4dff" },
  { key: "TI",           label: "TI",           initial: "T", color: "#0ea5e9" },
  { key: "CLIENTES",     label: "Clientes",     initial: "C", color: "#10b981" },
  { key: "FINANCEIRO",     label: "Financeiro",     initial: "F", color: "#10b940ff" },
  { key: "COMPRAS",     label: "Compras",     initial: "C", color: "#10b940ff" },
  { key: "CONTROLADORIA",     label: "Controladoria",     initial: "C", color: "#a810b9ff" },
  { key: "FORNECEDORES", label: "Fornecedores", initial: "F", color: "#14b8a6" },
  { key: "RH", label: "RH", initial: "R", color: "#b8ad14ff" },
  { key: "MALKA", label: "Malka", initial: "M", color: "#b8ad14ff" },
  { key: "GERENTE OPERACAO", label: "Gerente operacao", initial: "GO", color: "#37ff00ff" },
];

export const COLOR_PALETTE = ["#60a5fa","#34d399","#f59e0b","#f87171","#a78bfa","#14b8a6"];
