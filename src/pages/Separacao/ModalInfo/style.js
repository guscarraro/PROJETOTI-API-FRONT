import styled, { createGlobalStyle } from "styled-components";

/* ---------- Estilos globais do modal (apenas esta tela) ---------- */
export const ModalResponsiveStyles = createGlobalStyle`
  .modal.project-modal.modal-lg, .modal.show .modal-dialog.modal-lg {
    max-width: 880px;
    width: 92vw;
  }
  .project-modal .modal-content {
    border-radius: 14px;
  }
  .project-modal .modal-body {
    padding: 12px 14px;
  }
  .project-modal .modal-footer {
    padding: 10px 14px;
  }

  @media (max-width: 768px) {
    .modal.project-modal, .modal.show {
      padding: 0 !important;
    }
    .modal.project-modal .modal-dialog {
      margin: 8px;
      width: calc(100vw - 16px);
    }
    .project-modal .modal-body {
      padding: 10px;
    }
    .project-modal .modal-footer {
      padding: 10px;
    }
  }
`;

/* ---------- Helpers locais ---------- */
export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }

  .truncate {
    display: inline-block;
    max-width: 100%;
    vertical-align: bottom;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

export const TinyBtn = styled.button`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;

  &:hover { background: #f9fafb; }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
    &:hover { background: #0b1220; }
  }
`;

/* ---------- Grids responsivos ---------- */
export const InfoGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const TwoColGrid = styled.div`
  display: grid;
  gap: 8px 12px;
  grid-template-columns: 1fr 1fr;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  label {
    font-size: 12px;
    color: #6b7280;
    [data-theme="dark"] & { color: #94a3b8; }
  }
`;

/* ---------- Select com visual do Field ---------- */
export const SelectField = styled.select`
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
    box-shadow: 0 0 0 3px rgba(96,165,250,.3);
  }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.12);
  }
`;

/* ---------- Tabela com scroll horizontal no mobile ---------- */
export const ScrollTableWrap = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 8px;
  overflow-x: auto;

  table {
    min-width: 640px;
  }

  thead {
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
  }

  tbody tr {
    border-top: 1px solid #f1f5f9;
  }

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.12);

    thead {
      background: #0f172a;
      border-bottom-color: rgba(255,255,255,.1);
    }

    tbody tr {
      border-top-color: rgba(255,255,255,.06);
    }
  }
`;

/* ---------- Footer responsivo ---------- */
export const FooterActions = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;

  .right {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    .right { justify-content: stretch; }
    .right > * { flex: 1 1 auto; }
  }
`;

/* ---------- Badge de ocorrência ---------- */
export const OccurrenceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: #fef3c7;
  border: 1px solid #fdba74;
  color: #9a3412;

  @media (prefers-color-scheme: dark) {
    background: rgba(251, 191, 36, 0.15);
    border-color: rgba(251, 191, 36, 0.35);
    color: #fbbf24;
  }
`;
 