import styled from "styled-components";
import { Page as BasePage, TitleBar as BaseTitleBar, H1 as BaseH1, Section as BaseSection } from "../../style";

export const Page = BasePage;
export const TitleBar = BaseTitleBar;
export const H1 = BaseH1;
export const Section = BaseSection;

export const MiniText = styled.div`
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.75;
`;

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
  flex-wrap: wrap;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const FilterLabel = styled.label`
  font-size: 12px;
  font-weight: 900;
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
  background: #fff;
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
  font-weight: 900;
  cursor: pointer;
  background: #2563eb;
  color: #fff;
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
  font-weight: 900;
  background: rgba(15, 23, 42, 0.06);
  color: #111827;
  border: 1px solid rgba(15, 23, 42, 0.14);

  [data-theme="dark"] & {
    background: rgba(148, 163, 184, 0.12);
    color: #e5e7eb;
    border-color: rgba(148, 163, 184, 0.4);
  }
`;

export const Card = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 14px;
  padding: 12px;

  [data-theme="dark"] & {
    background: #0b1220;
    border-color: #334155;
  }
`;

export const CardTitle = styled.div`
  font-weight: 900;
  margin-bottom: 10px;
`;

export const Inline = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

export const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

/* =========================
   Textos auxiliares
========================= */
export const MutedText = styled.div`
  font-size: 12px;
  opacity: 0.75;
  line-height: 1.35;
`;

/* =========================
   Grid de KPIs
========================= */
export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(180px, 1fr));
  gap: 12px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, minmax(180px, 1fr));
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const KpiCard = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  }

  [data-theme="dark"] & {
    background: #0b1220;
    border-color: #334155;

    &:hover {
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
    }
  }
`;

export const KpiTitle = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: #334155;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const KpiValue = styled.div`
  margin-top: 6px;
  font-size: 22px;
  font-weight: 1000;
  letter-spacing: -0.2px;
  color: #111827;

  [data-theme="dark"] & {
    color: #fff;
  }
`;

export const KpiSub = styled.div`
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.7;
`;

/* =========================
   Import / Dropzone
========================= */
export const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

export const DropArea = styled.div`
  margin-top: 12px;
  border-radius: 16px;
  border: 2px dashed ${(p) => (p.$active ? "#60a5fa" : "#e5e7eb")};
  background: ${(p) => (p.$active ? "rgba(96,165,250,0.08)" : "#fff")};
  padding: 18px;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.6 : 1)};
  transition: 120ms ease;
  user-select: none;

  &:hover {
    border-color: ${(p) => (p.$disabled ? "#e5e7eb" : "#93c5fd")};
  }

  [data-theme="dark"] & {
    background: ${(p) => (p.$active ? "rgba(96,165,250,0.12)" : "#0b1220")};
    border-color: ${(p) => (p.$active ? "#60a5fa" : "#334155")};

    &:hover {
      border-color: ${(p) => (p.$disabled ? "#334155" : "#93c5fd")};
    }
  }
`;

export const DropTitle = styled.div`
  font-size: 14px;
  font-weight: 1000;
`;

export const DropHint = styled.div`
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.7;
`;

/* Botão pequeno usado no header do import */
export const SmallButton = styled.button`
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f9fafb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

export const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 12px 0;

  [data-theme="dark"] & {
    background: #1e293b;
  }
`;

/* =========================
   Tabela (preview + modal)
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
   Modal
========================= */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 9999;
`;

export const ModalCard = styled.div`
  width: min(1100px, 96vw);
  max-height: 88vh;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;

  [data-theme="dark"] & {
    background: #0b1220;
    border-color: #334155;
  }
`;

export const ModalHeader = styled.div`
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid #e5e7eb;

  [data-theme="dark"] & {
    border-bottom-color: #1e293b;
  }
`;

export const ModalBody = styled.div`
  padding: 12px 14px;
`;

export const ModalFooter = styled.div`
  padding: 12px 14px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;

  [data-theme="dark"] & {
    border-top-color: #1e293b;
  }
`;

// FALTANDO NO style.js (adicione só isso)
export const FilterSelect = styled.select`
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 0 10px;
  font-size: 13px;
  background: #fff;
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