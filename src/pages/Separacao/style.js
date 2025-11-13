import styled, { css } from "styled-components";
import { Badge } from "../Projetos/style";

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

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  /* quebra elegante no mobile */
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }

  /* texto longo não estoura o card */
  .truncate {
    display: block;
    flex: 1; /* ocupa o espaço restante */
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* linha de OV mais discreta */
  .ovLine {
    font-size: 10px;
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
