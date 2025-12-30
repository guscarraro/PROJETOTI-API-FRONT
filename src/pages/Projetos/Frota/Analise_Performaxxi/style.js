// src/pages/.../Analise_Performaxxi/style.js
import styled from "styled-components";
import { TitleBar } from "../../../Projetos/style";

/* Layout base / containers */
export const Content = styled.div`
  padding: 16px;
  color: var(--text);

  @media (min-width: 769px) {
    padding-top: 16px;
    padding-right: 16px;
  }
  @media (max-width: 768px) {
    padding: 12px 12px 16px;
  }
`;

export const TitleBarWrap = styled(TitleBar)`
  color: var(--text);

  @media (max-width: 768px) {
    margin-top: 4px;
    padding-left: 0;
    padding-right: 0;
  }
  @media (min-width: 769px) {
    padding-left: 0;
    padding-right: 0;
  }
`;

export const RightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: end;
  flex-wrap: wrap;

  & > div {
    min-width: 160px;
  }
`;

export const TinyLabel = styled.div`
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
`;

export const Field = styled.input`
  border: 1px solid var(--border);
  background: var(--bg-panel);
  color: var(--text);
  border-radius: 10px;
  height: 34px;
  padding: 0 10px;
  outline: none;
  width: 100%;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:focus {
    border-color: rgba(96, 165, 250, 0.8);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
  }
`;

export const Select = styled.select`
  border: 1px solid var(--border);
  background: var(--bg-panel);
  color: var(--text);
  border-radius: 10px;
  height: 34px;
  padding: 0 10px;
  outline: none;
  width: 100%;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:focus {
    border-color: rgba(96, 165, 250, 0.8);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const KPI = styled.div`
  border: 1px solid var(--border);
  background: var(--bg-panel);
  color: var(--text);
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--shadow);
`;

export const KPIValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  color: inherit;
`;

export const KPILabel = styled.div`
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
`;

export const KPIHint = styled.div`
  margin-top: 6px;
  font-size: 11px;
  font-weight: 900;
  color: rgba(249, 115, 22, 0.95);
`;

export const ChartCard = styled.div`
  border: 1px solid var(--border);
  background: var(--bg-panel);
  color: var(--text);
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
  box-shadow: var(--shadow);
`;

export const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 900;
  margin: 2px 0 10px 0;
  color: inherit;
`;

export const TwoCols = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

/* Buttons */
export const PrimaryButton = styled.button`
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: rgba(34, 211, 238, 0.95);
  color: #07121f;
  font-weight: 900;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};

  &:active {
    transform: translateY(1px);
  }
`;

export const SecondaryButton = styled.button`
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(34, 211, 238, 0.35);
  background: rgba(34, 211, 238, 0.12);
  color: var(--text);
  font-weight: 900;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};

  &:active {
    transform: translateY(1px);
  }
`;

export const DangerButton = styled.button`
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
  color: var(--text);
  font-weight: 900;
  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }
`;

export const PillRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const Pill = styled.div`
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;
  color: var(--text);
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(148, 163, 184, 0.08);

  ${({ $variant }) => {
    if ($variant === "warn")
      return `
        border-color: rgba(249,115,22,.35);
        background: rgba(249,115,22,.12);
      `;
    if ($variant === "danger")
      return `
        border-color: rgba(239,68,68,.35);
        background: rgba(239,68,68,.12);
      `;
    return "";
  }}
`;

/* Modal base */
export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

export const ModalCard = styled.div`
  width: min(1100px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow: auto;

  background: var(--bg-panel);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow);
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: inherit;
`;

export const CloseBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
  opacity: 0.85;
  color: inherit;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: inherit;
`;

export const THead = styled.thead`
  th {
    text-align: left;
    font-size: 12px;
    padding: 10px;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
  }
`;

export const TCell = styled.td`
  padding: 10px;
  font-size: 13px;
  color: inherit;
  border-bottom: 1px solid var(--border);
`;

export const TRow = styled.tr`
  &:hover td {
    background: rgba(148, 163, 184, 0.06);
  }
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;

  ${({ $variant }) => {
    if ($variant === "ok") return `background: rgba(163,230,53,.22); color: var(--text);`;
    if ($variant === "warn") return `background: rgba(249,115,22,.18); color: var(--text);`;
    if ($variant === "danger") return `background: rgba(239,68,68,.18); color: var(--text);`;
    return `background: rgba(148,163,184,.22); color: var(--text);`;
  }}
`;
