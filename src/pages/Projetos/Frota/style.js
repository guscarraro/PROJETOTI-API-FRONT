import styled from "styled-components";
import { TitleBar } from "../../Projetos/style";

/* Layout base / containers */
export const Content = styled.div`
  padding: 16px;
  @media (min-width: 769px) {
    padding-top: 16px;
    padding-right: 16px;
  }
  @media (max-width: 768px) {
    padding: 12px 12px 16px;
  }
`;

export const TitleBarWrap = styled(TitleBar)`
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
  color: #6b7280;
  margin-bottom: 4px;
  [data-theme="dark"] & {
    color: #94a3b8;
  }
`;

export const Field = styled.input`
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  border-radius: 10px;
  height: 34px;
  padding: 0 10px;
  outline: none;
  width: 100%;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
  }
  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

export const Select = styled.select`
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  border-radius: 10px;
  height: 34px;
  padding: 0 10px;
  outline: none;
  width: 100%;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
  }
  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.12);
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
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
  }
`;

export const KPIValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
`;

export const KPILabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  [data-theme="dark"] & {
    color: #94a3b8;
  }
`;

export const KPIHint = styled.div`
  margin-top: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #f97316;
  [data-theme="dark"] & {
    color: #fb923c;
  }
`;

export const ChartCard = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
  }
`;

export const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  margin: 2px 0 10px 0;
`;

export const TableCard = styled(ChartCard)`
  padding: 0;
  overflow: hidden;
`;

export const UserCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 10px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const UserCard = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
  }
`;

export const TwoCols = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
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

  background: var(--bg-panel, #ffffff);
  color: var(--text, #111827);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow, 0 10px 30px rgba(0,0,0,.12));

  /* 🔥 garante dark mesmo se var falhar */
  [data-theme="dark"] & {
    background: var(--bg-panel, #0f172a);
    color: var(--text, #e5e7eb);
    border-color: var(--border, rgba(255,255,255,.08));
    box-shadow: var(--shadow, 0 10px 30px rgba(0,0,0,.35));
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: inherit; /* não força cor fixa */
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
    color: var(--muted, #6b7280);
    border-bottom: 1px solid var(--border, #e5e7eb);

    [data-theme="dark"] & {
      color: var(--muted, #94a3b8);
      border-bottom-color: var(--border, rgba(255,255,255,.08));
    }
  }
`;

export const TCell = styled.td`
  padding: 10px;
  font-size: 13px;
  color: inherit;
  border-bottom: 1px solid var(--border, #e5e7eb);

  [data-theme="dark"] & {
    border-bottom-color: var(--border, rgba(255,255,255,.08));
  }
`;

export const CloseBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
  opacity: 0.8;
  color: inherit;
`;


export const TRow = styled.tr`
  &:hover td {
    background: rgba(148, 163, 184, 0.06);
  }
`;

/* Badges e botões */
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;

  ${({ $variant }) => {
    if ($variant === "ok")
      return `background: rgba(163,230,53,.22); color: #3f6212;`;
    if ($variant === "warn")
      return `background: rgba(249,115,22,.18); color: #9a3412;`;
    if ($variant === "danger")
      return `background: rgba(251,113,133,.18); color: #9f1239;`;
    return `background: rgba(148,163,184,.22); color: #334155;`;
  }}

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const SmallButton = styled.button`
  border: none;
  background: rgba(34, 211, 238, 0.18);
  color: #0e7490;
  font-weight: 900;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;

  [data-theme="dark"] & {
    color: #e0f2fe;
  }
`;

// Se você usa ActionsCell:
export const ActionsCell = styled.td`
  white-space: nowrap;
`;
