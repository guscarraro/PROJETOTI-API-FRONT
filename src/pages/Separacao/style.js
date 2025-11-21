import styled, { css } from "styled-components";
import { Badge, TitleBar, SearchWrap } from "../Projetos/style";

/** Pílulas de status com a paleta pedida */
export const StatusPill = styled(Badge)`
  ${(p) =>
    p.$variant === "pendente" &&
    css`
      background: rgba(245, 158, 11, 0.12);
      color: #92400e;
      border: 1px solid rgba(245, 158, 11, 0.35);
    `}
  ${(p) =>
    p.$variant === "primeira" &&
    css`
      background: rgba(59, 130, 246, 0.12);
      color: #1e40af;
      border: 1px solid rgba(59, 130, 246, 0.35);
    `}
  ${(p) =>
    p.$variant === "concluido" &&
    css`
      background: rgba(16, 185, 129, 0.12);
      color: #065f46;
      border: 1px solid rgba(16, 185, 129, 0.35);
    `}
`;

/* ====== layout principal (conteúdo) ====== */
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
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;

    ${SearchWrap} {
      flex: 1 1 220px;
      min-width: 0;
    }
  }
`;

/* ====== CARD de filtros ====== */
export const FiltersCard = styled.div`
  margin: 8px 0 16px 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: #f9fafb;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);

  [data-theme="dark"] & {
    background: #020617;
    border-color: rgba(148, 163, 184, 0.25);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }
`;

export const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  justify-content: space-between;
`;

export const FiltersLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const FiltersRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
`;

export const FilterLabel = styled.span`
  font-size: 12px;
  opacity: 0.85;
  color: #374151;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const FilterInput = styled.input`
  height: 32px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  font-size: 13px;
  outline: none;
  min-width: 150px;

  &:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.5);
  }

  &::-webkit-calendar-picker-indicator {
    filter: invert(0.3);
  }

  [data-theme="dark"] & {
    background: #020617;
    color: #e5e7eb;
    border-color: rgba(148, 163, 184, 0.4);

    &::-webkit-calendar-picker-indicator {
      filter: invert(0.9);
    }
  }
`;

export const FilterSelect = styled.select`
  height: 32px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  font-size: 13px;
  outline: none;
  min-width: 180px;

  &:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.5);
  }

  [data-theme="dark"] & {
    background: #020617;
    color: #e5e7eb;
    border-color: rgba(148, 163, 184, 0.4);
  }
`;

export const FilterButton = styled.button`
  border-radius: 999px;
  padding: 6px 16px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: #0ea5e9;
  color: #f9fafb;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #0284c7;
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

export const ClearButton = styled.button`
  border-radius: 999px;
  padding: 6px 14px;
  border: 1px solid rgba(148, 163, 184, 0.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: #374151;

  &:hover {
    background: rgba(148, 163, 184, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
    border-color: rgba(148, 163, 184, 0.7);

    &:hover {
      background: rgba(148, 163, 184, 0.12);
    }
  }
`;

/* ====== legendas / cards / painel excluídos ====== */

export const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-top: 8px;
  }
`;

export const DeletedPanel = styled.div`
  border: 1px dashed #bbb;
  border-radius: 12px;
  padding: 10px;
  margin: 8px 0 16px 0;
  background: #ffffff;

  @media (max-width: 768px) {
    padding: 10px;
    margin: 8px 0 12px 0;
  }

  [data-theme="dark"] & {
    background: #020617;
    border-color: rgba(148, 163, 184, 0.6);
  }
`;

export const CardsWrap = styled.div`
  @media (max-width: 768px) {
    margin-left: -2px;
    margin-right: -2px;
    padding-left: 2px;
    padding-right: 2px;
  }
`;

/* ====== estilos já existentes (PedidoCard etc) ====== */

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }

  .truncate {
    display: block;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ovLine {
    font-size: 10px;
    opacity: 0.7;
  }
  .adress {
    font-size: 7px;
    opacity: 0.7;
  }
`;

export const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const SmallMuted = styled.small`
  color: #6b7280;
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

export const TextArea = styled.textarea`
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  border-radius: 10px;
  padding: 8px 10px;
  outline: none;
  width: 100%;
  min-height: 70px;
  resize: vertical;

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

export const TinyBtn = styled.button`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    &:hover {
      background: #0b1220;
    }
  }
`;

export const DangerBtn = styled(TinyBtn)`
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.35);
  &:hover {
    background: rgba(239, 68, 68, 0.08);
  }
`;

/** Botão icon-only (etiqueta, info, etc) */
export const IconBtn = styled.button`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  padding: 6px;
  line-height: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f9fafb;
  }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    &:hover {
      background: #0b1220;
    }
  }
`;
