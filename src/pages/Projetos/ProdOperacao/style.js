import styled, { css, createGlobalStyle, keyframes } from "styled-components";

const spin = keyframes`to { transform: rotate(360deg); }`;

export const Loader = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.12);
  border-top-color: #0d6efd; /* bootstrap primary */
  animation: ${spin} 0.8s linear infinite;
`;

function tipoColor(tipo) {
  if (tipo === "Recebimento") return "#1d4ed8";
  if (tipo === "Separação") return "#b45309";
  if (tipo === "Expedição") return "#0f766e"
  if (tipo === "Conferência") return "#b91c1c";
  return "#334155";
}

function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return "51,65,85";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}


export const GlobalModalStyles = createGlobalStyle`
  [data-theme="dark"] .modal-content.prodop-modal {
    background: #0f172a;
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,.08);
  }
  [data-theme="dark"] .modal-content.prodop-modal .modal-header,
  [data-theme="dark"] .modal-content.prodop-modal .modal-footer{
    background: transparent;
    border-color: rgba(255,255,255,.08);
  }
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 12px;
  }
`;

export const H1 = styled.h1`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0;

  font-family: "Inter", "Poppins", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: #111827;

  &::before{
    content: "";
    width: 8px;
    height: 28px;
    border-radius: 6px;
    background: #6366f1;
    display: inline-block;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
  }

  @media (max-width: 768px) {
    font-size: 22px;
    &::before{ height: 22px; }
  }
`;

export const CardGrid = styled.div`
  display: grid;
  max-width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

export const Section = styled.section`
  background: #fff;
  border-radius: 16px;
  padding: 14px 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    box-shadow: 0 8px 24px rgba(2,6,23,0.45);
    border: 1px solid rgba(255,255,255,.06);
  }
`;

export const FiltersRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

export const TinyPill = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  background: rgba(99,102,241,.10);
  color: #4338ca;
  border: 1px solid rgba(99,102,241,.20);

  [data-theme="dark"] & {
    background: rgba(99,102,241,.18);
    color: #c7d2fe;
    border-color: rgba(99,102,241,.28);
  }
`;

export const FilterSelect = styled.select`
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.14);
  background: #fff;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  outline: none;

  &:focus { box-shadow: 0 0 0 3px rgba(96,165,250,0.35); border-color: #60a5fa; }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: #334155;
  }
`;

export const SearchWrap = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.14);
  background: #fff;
  color: #111827;
  min-width: 280px;

  svg { width: 16px; height: 16px; opacity: .7; flex-shrink: 0; }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: #334155;
  }

  @media (max-width: 768px) {
    min-width: 0;
    flex: 1 1 240px;
  }
`;

export const SearchInput = styled.input`
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 13px;
  font-weight: 600;
  width: 100%;
  outline: none;

  &::placeholder { color: rgba(17,24,39,.55); }
  [data-theme="dark"] &::placeholder { color: rgba(229,231,235,.55); }
`;

export const EmptyState = styled.div`
  padding: 14px;
  border-radius: 12px;
  border: 1px dashed rgba(0,0,0,.22);
  background: rgba(255,255,255,.65);
  color: rgba(17,24,39,.75);
  font-size: 13px;

  [data-theme="dark"] & {
    background: rgba(15,23,42,.35);
    border-color: rgba(255,255,255,.14);
    color: rgba(229,231,235,.70);
  }
`;



/* ----------- INFO BAR ----------- */

export const InfoBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 12px 0 12px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const TypeStatsCard = styled.div`
  border-radius: 14px;
  padding: 12px 12px;

  /* base */
  background: ${(p) => `rgba(${hexToRgb(tipoColor(p.$tipo))}, .10)`};
  border: 1px solid ${(p) => `rgba(${hexToRgb(tipoColor(p.$tipo))}, .22)`};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

  /* dá um “sinal” da cor do tipo */
  border-left: 8px solid ${(p) => tipoColor(p.$tipo)};

  [data-theme="dark"] & {
    background: ${(p) => `rgba(${hexToRgb(tipoColor(p.$tipo))}, .18)`};
    border-color: rgba(255, 255, 255, 0.10);
    border-left-color: ${(p) => tipoColor(p.$tipo)};
    color: #e5e7eb;
    box-shadow: 0 8px 24px rgba(2, 6, 23, 0.45);
  }
`;

export const TypeStatsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  color: #111827;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const TypeStatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }

  > div {
    border-radius: 12px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(0, 0, 0, 0.08);

    [data-theme="dark"] & {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.10);
    }
  }
`;

export const MiniLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 900;
  opacity: 0.78;
`;

export const MiniCount = styled.div`
  margin-top: 3px;
  font-weight: 900;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
`;

/* ... resto do seu style.js ... */

export const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;

  ${(p) => {
    // status dots
    if (p.$v === "prog") return css`background:#f59e0b; box-shadow:0 0 0 4px rgba(245,158,11,.14);`;
    if (p.$v === "run") return css`background:#10b981; box-shadow:0 0 0 4px rgba(16,185,129,.14);`;
    if (p.$v === "pause") return css`background:#0ea5e9; box-shadow:0 0 0 4px rgba(14,165,233,.14);`;
    if (p.$v === "done") return css`background:#6b7280; box-shadow:0 0 0 4px rgba(107,114,128,.16);`;

    // tipos
    if (p.$v === "Recebimento") return css`background:#8b5cf6; box-shadow:0 0 0 4px rgba(139,92,246,.14);`;
    if (p.$v === "Separação") return css`background:#f97316; box-shadow:0 0 0 4px rgba(249,115,22,.14);`;
    if (p.$v === "Expedição") return css`background:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,.14);`;
    if (p.$v === "Conferência") return css`background:#ef4444; box-shadow:0 0 0 4px rgba(239,68,68,.14);`;
    return css`background:#94a3b8; box-shadow:0 0 0 4px rgba(148,163,184,.14);`;
  }}

  [data-theme="dark"] & { filter: brightness(1.08); }
`;


export const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0 10px;
`;

export const GroupTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: #111827;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const GroupCount = styled.span`
  margin-left: 6px;
  opacity: 0.75;
  font-weight: 800;
  color: rgba(17,24,39,.75);

  [data-theme="dark"] & {
    color: rgba(229,231,235,.75);
  }
`;
