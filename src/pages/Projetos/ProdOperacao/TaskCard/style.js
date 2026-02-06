import styled, { css } from "styled-components";

/**
 * Paleta mais “séria/masculina”:
 * - Recebimento: Navy/Indigo
 * - Separação: Amber queimado
 * - Expedição: Steel blue
 * - Conferência: Crimson fechado
 */
function tipoColor(tipo) {
  if (tipo === "Recebimento") return "#1d4ed8";
  if (tipo === "Separação") return "#b45309";
  if (tipo === "Expedição") return "#0f766e";
  if (tipo === "Conferência") return "#b91c1c";
  return "#334155";
}

function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return "51,65,85";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  padding: 14px;

  background: ${(p) => `rgba(${hexToRgb(tipoColor(p.$tipo))}, .12)`};
  border: 1px solid rgba(15, 23, 42, 0.18);
  border-left: 10px solid ${(p) => tipoColor(p.$tipo)};
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.09);

  ${(p) =>
    p.$over40 &&
    css`
      background: rgba(${hexToRgb(tipoColor(p.$tipo))}, 0.18);
      border-color: rgba(15, 23, 42, 0.24);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    `}

  ${(p) =>
    p.$locked &&
    css`
      opacity: 0.92;
      filter: grayscale(0.06);
    `}

  /* ✅ CANCELADA: bem mais escuro (cinza → preto) pra destacar */
  ${(p) =>
    p.$cancelled &&
    css`
      background: rgba(2, 6, 23, 0.18);
      border-color: rgba(2, 6, 23, 0.32);
      border-left-color: #0b1220;
      box-shadow: 0 12px 34px rgba(0, 0, 0, 0.18);
      filter: none;
      opacity: 0.98;
    `}

  [data-theme="dark"] & {
    background: ${(p) => `rgba(${hexToRgb(tipoColor(p.$tipo))}, .16)`};
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.10);
    border-left-color: ${(p) => tipoColor(p.$tipo)};
    box-shadow: 0 10px 28px rgba(2, 6, 23, 0.55);

    ${(p) =>
      p.$over40 &&
      css`
        background: rgba(${hexToRgb(tipoColor(p.$tipo))}, 0.26);
        border-color: rgba(255, 255, 255, 0.14);
      `}

    ${(p) =>
      p.$cancelled &&
      css`
        background: rgba(2, 6, 23, 0.62);
        border-color: rgba(255, 255, 255, 0.10);
        border-left-color: #111827;
        box-shadow: 0 16px 44px rgba(0, 0, 0, 0.55);
        opacity: 1;
      `}
  }
`;

export const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

export const IconWrap = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  background: ${(p) => `rgba(${hexToRgb(tipoColor(p.$tipo))}, .22)`};
  color: ${(p) => tipoColor(p.$tipo)};
  border: 1px solid ${(p) => `rgba(${hexToRgb(tipoColor(p.$tipo))}, .38)`};

  svg {
    width: 18px;
    height: 18px;
  }

  [data-theme="dark"] & {
    background: ${(p) => `rgba(${hexToRgb(tipoColor(p.$tipo))}, .24)`};
    border-color: ${(p) => `rgba(${hexToRgb(tipoColor(p.$tipo))}, .48)`};
  }
`;

export const TitleCol = styled.div`
  min-width: 0;
`;

export const Title = styled.div`
  font-weight: 1000;
  font-size: 14px;
  letter-spacing: 0.2px;
  color: #0b1220;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const Sub = styled.div`
  font-size: 12px;
  opacity: 0.82;
  margin-top: 2px;

  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const StatusCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

export const StatusWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export const Badge = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 1000;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 0.7);

  display: inline-flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 14px;
    height: 14px;
    opacity: 0.95;
  }

  ${(p) =>
    p.$variant === "prog" &&
    css`
      color: #7c2d12;
      background: rgba(180, 83, 9, 0.14);
      border-color: rgba(180, 83, 9, 0.32);
    `}
  ${(p) =>
    p.$variant === "run" &&
    css`
      color: #064e3b;
      background: rgba(5, 150, 105, 0.14);
      border-color: rgba(5, 150, 105, 0.32);
    `}
  ${(p) =>
    p.$variant === "pause" &&
    css`
      color: #0c4a6e;
      background: rgba(14, 116, 144, 0.14);
      border-color: rgba(14, 116, 144, 0.32);
    `}
  ${(p) =>
    p.$variant === "done" &&
    css`
      color: #111827;
      background: rgba(51, 65, 85, 0.14);
      border-color: rgba(51, 65, 85, 0.32);
    `}
  ${(p) =>
    p.$variant === "cancel" &&
    css`
      color: #0b1220;
      background: rgba(2, 6, 23, 0.12);
      border-color: rgba(2, 6, 23, 0.32);
    `}

  [data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.55);
    border-color: rgba(255, 255, 255, 0.14);

    ${(p) =>
      p.$variant === "prog" &&
      css`
        color: #fdba74;
        background: rgba(180, 83, 9, 0.22);
        border-color: rgba(180, 83, 9, 0.42);
      `}
    ${(p) =>
      p.$variant === "run" &&
      css`
        color: #6ee7b7;
        background: rgba(5, 150, 105, 0.22);
        border-color: rgba(5, 150, 105, 0.42);
      `}
    ${(p) =>
      p.$variant === "pause" &&
      css`
        color: #7dd3fc;
        background: rgba(14, 116, 144, 0.22);
        border-color: rgba(14, 116, 144, 0.42);
      `}
    ${(p) =>
      p.$variant === "done" &&
      css`
        color: #cbd5e1;
        background: rgba(51, 65, 85, 0.22);
        border-color: rgba(51, 65, 85, 0.42);
      `}
    ${(p) =>
      p.$variant === "cancel" &&
      css`
        color: #e5e7eb;
        background: rgba(2, 6, 23, 0.55);
        border-color: rgba(255, 255, 255, 0.14);
      `}
  }
`;

export const LockPill = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 1000;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(15, 23, 42, 0.06);
  color: #0b1220;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 14px;
    height: 14px;
  }

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
    color: #e5e7eb;
  }
`;

export const TimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 12px;
  font-weight: 950;
  opacity: 0.95;
  color: rgba(11, 18, 32, 0.88);

  svg {
    width: 14px;
    height: 14px;
  }

  [data-theme="dark"] & {
    color: rgba(229, 231, 235, 0.9);
  }
`;

export const TimeText = styled.div`
  font-variant-numeric: tabular-nums;
`;

export const MetaRow = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const MetaLine = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 14px;
    height: 14px;
    opacity: 0.9;
  }

  span {
    font-size: 13px;
    font-weight: 900;
  }

  b {
    font-weight: 1000;
  }
`;

export const MetaGrid = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const MetaItem = styled.div`
  border-radius: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(15, 23, 42, 0.10);

  small {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    opacity: 0.78;
    font-weight: 900;
    color: rgba(11, 18, 32, 0.9);
  }

  div {
    margin-top: 3px;
    font-weight: 1000;
    font-size: 13px;
    color: #0b1220;
  }

  [data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.38);
    border-color: rgba(255, 255, 255, 0.10);

    small {
      color: rgba(229, 231, 235, 0.85);
    }
    div {
      color: #e5e7eb;
    }
  }
`;

export const Obs = styled.div`
  margin-top: 10px;
  font-size: 13px;
  opacity: 0.95;
  line-height: 1.25;
  color: rgba(11, 18, 32, 0.9);

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  [data-theme="dark"] & {
    color: rgba(229, 231, 235, 0.9);
  }
`;

export const RecvGrid = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const RecvBox = styled.div`
  border-radius: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(15, 23, 42, 0.10);

  [data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.38);
    border-color: rgba(255, 255, 255, 0.10);
  }
`;

export const RecvLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 900;
  color: rgba(11, 18, 32, 0.92);

  & + & {
    margin-top: 8px;
  }

  svg {
    width: 14px;
    height: 14px;
    opacity: 0.9;
  }

  b {
    font-weight: 1000;
  }

  [data-theme="dark"] & {
    color: rgba(229, 231, 235, 0.9);
  }
`;

export const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;

  button {
    font-weight: 1000;
    border-radius: 12px;
    padding: 10px 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
`;

export const BtnPrimary = styled.button`
  border: 0;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;

  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  background: #2563eb;
  color: #fff;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:hover {
    filter: brightness(0.97);
  }
  &:active {
    transform: translateY(1px);
  }
`;

export const BtnGhost = styled.button`
  border-radius: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 0.82);
  color: #0b1220;
  cursor: pointer;

  font-weight: 1000;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:hover {
    filter: brightness(0.98);
  }
  &:active {
    transform: translateY(1px);
  }

  [data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.65);
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.14);
  }
`;
