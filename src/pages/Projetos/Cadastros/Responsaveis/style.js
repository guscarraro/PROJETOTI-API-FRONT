import styled from "styled-components";
import {
  Page as BasePage,
  TitleBar as BaseTitleBar,
  H1 as BaseH1,
  Section as BaseSection,
  Muted as BaseMuted,
} from "../../style";

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

export const TdCompact = styled(Td)`
  padding: 6px 8px;
  white-space: nowrap;
  line-height: 1.15;
  vertical-align: middle;
`;

export const ActionsCell = styled(TdCompact)`
  white-space: nowrap;
`;

export const ActionBtn = styled.button`
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: rgba(255, 255, 255, 0.6);
  color: #111827;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  margin-right: 8px;

  &:hover {
    filter: brightness(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${(p) =>
    p.$danger
      ? `
    border-color: rgba(239,68,68,.35);
    background: rgba(239,68,68,.10);
    color: #991b1b;

    [data-theme="dark"] & {
      background: rgba(239,68,68,.14);
      color: #fecaca;
    }
  `
      : ""}

  [data-theme="dark"] & {
    background: rgba(2, 6, 23, 0.35);
    color: #e5e7eb;
    border-color: rgba(148, 163, 184, 0.18);
  }
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;

  background: rgba(59, 130, 246, 0.12);
  color: #1e40af;
  border: 1px solid rgba(59, 130, 246, 0.30);

  [data-theme="dark"] & {
    background: rgba(37, 99, 235, 0.20);
    color: #dbeafe;
    border-color: rgba(37, 99, 235, 0.35);
  }
`;

/* =========================
   MODAL
   ========================= */

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 9999;
`;

export const ModalCard = styled.div`
  width: min(980px, 100%);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(17, 24, 39, 0.12);

  [data-theme="dark"] & {
    background: #0b1220;
    border-color: rgba(255, 255, 255, 0.10);
  }
`;

export const ModalHeader = styled.div`
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);

  [data-theme="dark"] & {
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }
`;

export const ModalTitle = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: #111827;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const ModalClose = styled.button`
  border: none;
  background: transparent;
  color: #111827;
  cursor: pointer;
  font-size: 16px;
  font-weight: 900;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const ModalBody = styled.div`
  padding: 16px;
`;

export const ModalFooter = styled.div`
  padding: 14px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);

  [data-theme="dark"] & {
    border-top-color: rgba(255, 255, 255, 0.08);
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 260px 260px;
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* lista check (clientes / grupos) */
export const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid rgba(17, 24, 39, 0.10);
  background: rgba(255, 255, 255, 0.55);
  margin-bottom: 8px;

  &:hover {
    filter: brightness(0.98);
  }

  input {
    width: 16px;
    height: 16px;
  }

  &[data-checked="1"] {
    border-color: rgba(59, 130, 246, 0.30);
    background: rgba(59, 130, 246, 0.10);
  }

  [data-theme="dark"] & {
    border-color: rgba(148, 163, 184, 0.14);
    background: rgba(2, 6, 23, 0.35);

    &[data-checked="1"] {
      border-color: rgba(37, 99, 235, 0.35);
      background: rgba(37, 99, 235, 0.18);
    }
  }
`;
