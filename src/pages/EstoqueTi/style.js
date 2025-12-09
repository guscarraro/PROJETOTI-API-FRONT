import styled, { css, createGlobalStyle } from "styled-components";

/* ===== Filtro por setor / tipo ===== */
export const SectorFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;
  flex-wrap: wrap;
  user-select: none;
`;

export const FilterLabel = styled.label`
  font-size: 12px;
  line-height: 1;
  padding: 6px 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.02));
  color: #374151;
  border: 1px solid #e5e7eb;
  letter-spacing: 0.2px;

  .dark &,
  [data-theme="dark"] & {
    color: #e5e7eb;
    border-color: #334155;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.02)
    );
  }
`;

export const arrowSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>`
);

export const SectorSelect = styled.select`
  height: 34px;
  padding: 0 36px 0 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background:
    url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
    linear-gradient(180deg, #ffffff, #fafafa);
  color: #111827;
  font-size: 14px;
  outline: none;
  appearance: none;
  transition: box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;

  &:hover {
    border-color: #d1d5db;
    background:
      url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
      linear-gradient(180deg, #ffffff, #f5f5f5);
  }

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  option {
    color: #111827;
    background-color: #ffffff;
  }

  /* Dark mode controlado por data-theme / .dark */
  .dark &,
  [data-theme="dark"] & {
    border-color: #334155;
    color: #e5e7eb;
    background:
      url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
      linear-gradient(180deg, #0b1220, #0f172a);

    &:hover {
      border-color: #475569;
      background:
        url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
        linear-gradient(180deg, #0b1220, #131c2e);
    }

    &:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
    }

    option {
      color: #e5e7eb;
      background-color: #0b1220;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;


/* ===== Estilos globais p/ modal (reactstrap) ===== */
export const MODAL_CLASS = "project-modal";

export const GlobalModalStyles = createGlobalStyle`
  [data-theme="dark"] .modal-content.${MODAL_CLASS} {
    background: #0f172a;
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,.08);
  }
  [data-theme="dark"] .modal-content.${MODAL_CLASS} .modal-header,
  [data-theme="dark"] .modal-content.${MODAL_CLASS} .modal-footer {
    background: transparent;
    border-color: rgba(255,255,255,.08);
    color: #e5e7eb;
  }
  [data-theme="dark"] .modal-content.${MODAL_CLASS} label { color: #cbd5e1; }
  [data-theme="dark"] .modal-content.${MODAL_CLASS} input,
  [data-theme="dark"] .modal-content.${MODAL_CLASS} select,
  [data-theme="dark"] .modal-content.${MODAL_CLASS} .form-control {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.12);
  }
`;

/* ===== Layout geral da página ===== */
export const Page = styled.div`
  --topbar-h: 56px;
  --nav-collapsed: 64px;
  --content-gap-left: clamp(8px, 1vw, 12px);

  --page-bg-start: #f8fafc;
  --page-bg-end: #f3f4f6;
  --accent-1: 96, 165, 250;
  --accent-2: 16, 185, 129;

  position: relative;
  isolation: isolate;
  min-height: 100dvh;

  padding: clamp(16px, 2.5vw, 28px);
  padding-left: calc(var(--nav-collapsed) + var(--content-gap-left));

  background:
    radial-gradient(1200px 600px at -10% -10%, rgba(var(--accent-1), .10), transparent 60%),
    radial-gradient(1000px 500px at 110% -20%, rgba(var(--accent-2), .08), transparent 55%),
    linear-gradient(180deg, var(--page-bg-start) 0%, var(--page-bg-end) 100%);

  &::before{
    content: "";
    position: fixed; inset: 0;
    pointer-events: none;
    background:
      linear-gradient(to right, rgba(17, 24, 39, .08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(17, 24, 39, .08) 1px, transparent 1px),
      radial-gradient(600px 420px at var(--gx,20%) var(--gy,12%), rgba(var(--accent-1), .15), transparent 60%),
      radial-gradient(520px 360px at calc(100% - var(--gx,20%)) calc(100% - var(--gy,12%)), rgba(var(--accent-2), .12), transparent 60%);
    background-size: 24px 24px, 24px 24px, 100% 100%, 100% 100%;
    filter: blur(var(--grid-blur, 0px));
    z-index: 0;
    animation: pageBgShift 16s ease-in-out infinite;
  }

  &::after{
    content: "";
    position: fixed; left: 0; right: 0; top: 0; height: 80px;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(255,255,255,.8), rgba(255,255,255,0));
    backdrop-filter: blur(2px);
    z-index: 0;
  }

  > * { position: relative; z-index: 1; }

  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 10px; height: 10px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(17, 24, 39, .15);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  &::-webkit-scrollbar-track { background: transparent; }

  [data-theme="dark"] & {
    --page-bg-start: #0b1220;
    --page-bg-end: #0e1424;
    &::before{
      background:
        linear-gradient(to right, rgba(255,255,255,.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,.12) 1px, transparent 1px),
        radial-gradient(600px 420px at var(--gx,20%) var(--gy,12%), rgba(99,102,241,.18), transparent 60%),
        radial-gradient(520px 360px at calc(100% - var(--gx,20%)) calc(100% - var(--gy,12%)), rgba(45,212,191,.14), transparent 60%);
    }
    &::after{ background: linear-gradient(180deg, rgba(15,23,42,.55), rgba(15,23,42,0)); }
  }

  @keyframes pageBgShift {
    0%   { --gx: 16%; --gy: 10%; --grid-blur: 0px; }
    50%  { --gx: 84%; --gy: 65%; --grid-blur: 1px; }
    100% { --gx: 22%; --gy: 20%; --grid-blur: 0px; }
  }

  @media (max-width: 768px) {
    padding: 12px;
    padding-top: calc(var(--topbar-h) + 12px);
  }
`;

/* Barra de título */
export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
  }
`;

/* Título principal */
export const H1 = styled.h1`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-family: "Inter", "Poppins", "Segoe UI", Roboto, "Helvetica Neue", Arial,
    "Noto Sans", sans-serif;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0.2px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;

  color: ${(p) => p.$accent || "#111827"};

  &::before {
    content: "";
    width: 8px;
    height: 28px;
    border-radius: 6px;
    background: ${(p) => p.$accent || "#6366f1"};
    display: inline-block;
  }

  [data-theme="dark"] & {
    color: ${(p) => p.$accent || "#e5e7eb"};
    &::before {
      background: ${(p) => p.$accent || "#6366f1"};
    }
  }

  @media (max-width: 768px) {
    font-size: 24px;
    &::before {
      height: 22px;
    }
  }
`;

/* Seções em cards/painéis */
export const Section = styled.section`
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    box-shadow: 0 8px 24px rgba(2, 6, 23, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  @media (max-width: 768px) {
    border-radius: 12px;
    padding: 12px;
  }
`;

/* Grid de info (cards rápidos) */
export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoItem = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
  transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 6px;

  small {
    color: #6b7280;
  }

  ${(p) =>
    p.$clickable &&
    css`
      cursor: pointer;
      &:hover {
        background: #f3f4f6;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
      }
    `}

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border: 1px solid rgba(255, 255, 255, 0.06);

    small {
      color: #94a3b8;
    }

    ${(p) =>
      p.$clickable &&
      css`
        &:hover {
          background: #0b1220;
        }
      `}
  }
`;

/* Seção de cada setor */
export const SetorSection = styled.div`
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: 12px;
  background: ${(p) => p.$bgColor || "#f9fafb"};
  border: 2px dashed ${(p) => p.$borderColor || "#e5e7eb"};
  transition: background 0.2s ease, border-color 0.2s ease;

  [data-theme="dark"] & {
    background: #020617;
    border-color: ${(p) => p.$borderColor || "rgba(148, 163, 184, 0.45)"};
  }
`;


/* ===== Tabela estilo relatório ===== */

export const TableWrap = styled.div`
  width: 100%;
  overflow: auto;
  margin-top: 8px;
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
  font-weight: 600;
  color: #111827;

  [data-theme="dark"] & {
    background: #020617;
    border-bottom-color: #1e293b;
    color: #e5e7eb;
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
  line-height: 1.2;
  vertical-align: middle;
`;

/* Badge de status dos equipamentos */
export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(148, 163, 184, 0.15);
  color: #111827;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }

  ${(p) =>
    (p.$status || "").toUpperCase() === "EM USO" &&
    css`
      background: rgba(16, 185, 129, 0.12);
      color: #065f46;
      border-color: rgba(16, 185, 129, 0.4);

      [data-theme="dark"] & {
        color: #bbf7d0;
      }
    `}

  ${(p) =>
    (p.$status || "").toUpperCase() === "EM MANUTENCAO" &&
    css`
      background: rgba(245, 158, 11, 0.12);
      color: #92400e;
      border-color: rgba(245, 158, 11, 0.4);

      [data-theme="dark"] & {
        color: #fed7aa;
      }
    `}

  ${(p) =>
    (p.$status || "").toUpperCase() === "BACKUP" &&
    css`
      background: rgba(59, 130, 246, 0.12);
      color: #1d4ed8;
      border-color: rgba(59, 130, 246, 0.4);

      [data-theme="dark"] & {
        color: #bfdbfe;
      }
    `}
`;
