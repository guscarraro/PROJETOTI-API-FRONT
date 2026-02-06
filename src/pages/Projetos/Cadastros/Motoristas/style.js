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

const BaseBtn = styled.button`
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.12s ease, transform 0.12s ease, background 0.12s ease;

  &:hover {
    filter: brightness(1.04);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const FilterButton = styled(BaseBtn)`
  background: #2563eb;
  color: #ffffff;
  border-color: rgba(37, 99, 235, 0.25);
`;

export const ClearButton = styled(BaseBtn)`
  background: #f3f4f6;
  color: #111827;
  border-color: #e5e7eb;

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

/* ✅ compat: usado em alguns indexes */
export const GhostButton = styled(ClearButton)`
  background: transparent;

  [data-theme="dark"] & {
    background: transparent;
  }
`;

export const DangerButton = styled(BaseBtn)`
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
  color: #991b1b;

  &:hover {
    background: rgba(239, 68, 68, 0.16);
  }

  [data-theme="dark"] & {
    color: #fecaca;
    background: rgba(239, 68, 68, 0.16);
    border-color: rgba(239, 68, 68, 0.35);
  }
`;

export const CountPill = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
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
  font-weight: 900;
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
  width: min(720px, 100%);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(17, 24, 39, 0.12);

  [data-theme="dark"] & {
    background: #0b1220;
    border-color: rgba(255, 255, 255, 0.1);
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

/* ✅ compat: alguns arquivos chamam de ModalGrid */
export const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 220px 220px;
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* eu uso FormGrid em outros locais; deixa os 2 */
export const FormGrid = styled(ModalGrid)``;
