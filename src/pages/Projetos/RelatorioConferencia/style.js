// src/pages/RelatorioConferencia/style.js
import styled, { css } from "styled-components";
import {
  Page as BasePage,
  TitleBar as BaseTitleBar,
  H1 as BaseH1,
  Section as BaseSection,
  Muted as BaseMuted,
  Badge as BaseBadge,
} from "../style";

// Reuso dos componentes de layout globais
export const Page = BasePage;
export const TitleBar = BaseTitleBar;
export const H1 = BaseH1;
export const Section = BaseSection;
export const MutedText = BaseMuted;

/* =========================
   FILTROS
   ========================= */

export const FiltersRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
`;

export const FiltersLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const FiltersRight = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const FilterLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const FilterInput = styled.input`
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 0 10px;
  font-size: 13px;
  background: #ffffff;
  color: #111827;
  outline: none;

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
  }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: #334155;
  }
`;

export const FilterSelect = styled.select`
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 0 10px;
  font-size: 13px;
  background: #ffffff;
  color: #111827;
  outline: none;

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
  }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: #334155;
  }
`;

export const FilterButton = styled.button`
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: #2563eb;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    filter: brightness(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ClearButton = styled(FilterButton)`
  background: #f3f4f6;
  color: #111827;
  border: 1px solid #e5e7eb;

  &:hover {
    background: #e5e7eb;
  }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: #334155;

    &:hover {
      background: #020617;
    }
  }
`;

/* =========================
   TABELA
   ========================= */

export const TableWrap = styled.div`
  width: 100%;
  overflow: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

export const Th = styled.th`
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;

  [data-theme="dark"] & {
    background: #020617;
    border-bottom-color: #1e293b;
  }
`;

export const Td = styled.td`
  padding: 8px 10px;
  border-bottom: 1px solid #f3f4f6;

  [data-theme="dark"] & {
    border-bottom-color: #111827;
  }
`;

/* =========================
   STATUS / CONTADOR
   ========================= */

export const StatusBadge = styled(BaseBadge)`
  ${(p) =>
    (p.$status || "").toUpperCase() === "PENDENTE" &&
    css`
      background: rgba(245, 158, 11, 0.12);
      color: #92400e;
      border: 1px solid rgba(245, 158, 11, 0.4);
    `}
  ${(p) =>
    (p.$status || "").toUpperCase() === "PRONTO_EXPEDICAO" &&
    css`
      background: rgba(59, 130, 246, 0.12);
      color: #1e40af;
      border: 1px solid rgba(59, 130, 246, 0.4);
    `}
  ${(p) =>
    (p.$status || "").toUpperCase() === "EXPEDIDO" &&
    css`
      background: rgba(16, 185, 129, 0.12);
      color: #065f46;
      border: 1px solid rgba(16, 185, 129, 0.4);
    `}
`;


export const CountPill = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.06);
  color: #111827;
  border: 1px solid rgba(15, 23, 42, 0.14);

  [data-theme="dark"] & {
    background: rgba(148, 163, 184, 0.12);
    color: #e5e7eb;
    border-color: rgba(148, 163, 184, 0.4);
  }
`;
