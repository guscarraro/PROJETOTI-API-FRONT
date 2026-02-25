// src/pages/CadastroProduto/style.js
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

export const HelperText = styled.div`
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.8;
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
  padding: 4px 6px;
  white-space: nowrap;
  line-height: 1;
  vertical-align: middle;
`;

/* =========================
   STATUS / CONTADOR
   ========================= */
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
   AÇÕES
   ========================= */
export const ActionsRow = styled.div`
  display: inline-flex;
  gap: 8px;
`;

export const ActionBtn = styled.button`
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.08);
  color: #1e40af;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    filter: brightness(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  [data-theme="dark"] & {
    background: rgba(37, 99, 235, 0.18);
    color: #bfdbfe;
    border-color: rgba(59, 130, 246, 0.35);
  }
`;

export const DangerBtn = styled(ActionBtn)`
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(220, 38, 38, 0.08);
  color: #991b1b;

  [data-theme="dark"] & {
    background: rgba(220, 38, 38, 0.18);
    color: #fecaca;
    border-color: rgba(239, 68, 68, 0.35);
  }
`;

/* =========================
   MODAL
   ========================= */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
`;

export const ModalCard = styled.div`
  width: min(980px, 96vw);
  max-height: calc(100vh - 32px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  overflow: hidden;

  display: flex;
  flex-direction: column;

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
  }
`;

export const ModalTitle = styled.div`
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 900;
  border-bottom: 1px solid #e5e7eb;

  [data-theme="dark"] & {
    border-bottom-color: #1e293b;
  }
`;

export const ModalBody = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

export const ModalFooter = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #e5e7eb;

  [data-theme="dark"] & {
    border-top-color: #1e293b;
  }
`;

export const Grid2 = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

/* =========================
   TABS (Dentro do modal)
   ========================= */
export const TabsRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px 0 16px;
`;

export const TabBtn = styled.button`
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(15, 23, 42, 0.04);
  color: #111827;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;

  ${(p) =>
    p.$active &&
    css`
      border-color: rgba(37, 99, 235, 0.45);
      background: rgba(37, 99, 235, 0.12);
      color: #1e40af;
    `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  [data-theme="dark"] & {
    border-color: rgba(148, 163, 184, 0.25);
    background: rgba(148, 163, 184, 0.08);
    color: #e5e7eb;

    ${(p) =>
      p.$active &&
      css`
        border-color: rgba(59, 130, 246, 0.45);
        background: rgba(37, 99, 235, 0.18);
        color: #bfdbfe;
      `}
  }
`;

/* =========================
   IMPORT UI
   ========================= */
export const ImportHint = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  background: rgba(37, 99, 235, 0.06);
  margin-bottom: 12px;

  [data-theme="dark"] & {
    border-color: rgba(59, 130, 246, 0.22);
    background: rgba(37, 99, 235, 0.12);
  }
`;

export const DropZone = styled.div`
  border-radius: 16px;
  border: 2px dashed rgba(148, 163, 184, 0.6);
  padding: 18px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: 0.15s ease;
  background: rgba(15, 23, 42, 0.02);

  ${(p) =>
    p.$active &&
    css`
      border-color: rgba(37, 99, 235, 0.8);
      background: rgba(37, 99, 235, 0.06);
      transform: translateY(-1px);
    `}

  [data-theme="dark"] & {
    border-color: rgba(148, 163, 184, 0.25);
    background: rgba(148, 163, 184, 0.06);

    ${(p) =>
      p.$active &&
      css`
        border-color: rgba(59, 130, 246, 0.7);
        background: rgba(37, 99, 235, 0.16);
      `}
  }
`;

export const DropTitle = styled.div`
  font-size: 14px;
  font-weight: 900;
`;

export const DropSub = styled.div`
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.75;
`;

export const DropLink = styled.a`
  color: #2563eb;
  font-weight: 900;
  text-decoration: underline;
  cursor: pointer;

  [data-theme="dark"] & {
    color: #93c5fd;
  }
`;

export const DropBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;

  ${(p) =>
    p.$kind === "ok" &&
    css`
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #065f46;
    `}

  ${(p) =>
    p.$kind === "warn" &&
    css`
      background: rgba(245, 158, 11, 0.14);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #92400e;
    `}
`;

export const FileNamePill = styled.div`
  margin-top: 10px;
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(15, 23, 42, 0.04);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  [data-theme="dark"] & {
    border-color: rgba(148, 163, 184, 0.25);
    background: rgba(148, 163, 184, 0.08);
    color: #e5e7eb;
  }
`;
// =========================
// TOASTS
// =========================
export const ToastWrap = styled.div`
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;

  @media (max-width: 768px) {
    left: 14px;
    right: 14px;
  }
`;

export const ToastItem = styled.div`
  pointer-events: auto;
  cursor: pointer;
  width: 320px;
  max-width: calc(100vw - 28px);
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);

  ${(p) =>
    p.$type === "ok" &&
    css`
      border-color: rgba(16, 185, 129, 0.35);
      background: rgba(16, 185, 129, 0.12);
      color: #065f46;
    `}

  ${(p) =>
    p.$type === "warn" &&
    css`
      border-color: rgba(245, 158, 11, 0.35);
      background: rgba(245, 158, 11, 0.12);
      color: #92400e;
    `}

  ${(p) =>
    p.$type === "error" &&
    css`
      border-color: rgba(239, 68, 68, 0.35);
      background: rgba(239, 68, 68, 0.12);
      color: #7f1d1d;
    `}

  ${(p) =>
    p.$type === "info" &&
    css`
      border-color: rgba(59, 130, 246, 0.35);
      background: rgba(59, 130, 246, 0.12);
      color: #1e40af;
    `}

  [data-theme="dark"] & {
    background: rgba(2, 6, 23, 0.92);
    color: #e5e7eb;
    border-color: rgba(148, 163, 184, 0.25);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);

    ${(p) =>
      p.$type === "ok" &&
      css`
        background: rgba(16, 185, 129, 0.18);
        color: #d1fae5;
        border-color: rgba(16, 185, 129, 0.35);
      `}

    ${(p) =>
      p.$type === "warn" &&
      css`
        background: rgba(245, 158, 11, 0.18);
        color: #ffedd5;
        border-color: rgba(245, 158, 11, 0.35);
      `}

    ${(p) =>
      p.$type === "error" &&
      css`
        background: rgba(239, 68, 68, 0.18);
        color: #fee2e2;
        border-color: rgba(239, 68, 68, 0.35);
      `}

    ${(p) =>
      p.$type === "info" &&
      css`
        background: rgba(59, 130, 246, 0.18);
        color: #dbeafe;
        border-color: rgba(59, 130, 246, 0.35);
      `}
  }
`;

// ADICIONAR NO FINAL DO ./style.js (CadastroProduto)

export const ImportActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
`;

export const PreviewWrap = styled.div`
  margin-top: 14px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 10px;
`;

export const PreviewTitle = styled.div`
  font-weight: 900;
  font-size: 13px;
  margin-bottom: 6px;
`;

export const SmallMuted = styled.div`
  font-size: 12px;
  opacity: 0.75;
  margin-bottom: 10px;
`;

export const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  tbody tr:hover {
    background: rgba(255,255,255,0.04);
  }
`;

export const PreviewTh = styled.th`
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  white-space: nowrap;
  opacity: 0.9;
  font-size: 12px;
`;

export const PreviewTd = styled.td`
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  white-space: nowrap;
`;