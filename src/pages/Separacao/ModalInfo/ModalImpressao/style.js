// src/pages/Separacao/ModalImpressao/style.js
import styled from "styled-components";

export const CaixasCard = styled.div`
  margin-top: 6px;
  border-radius: 12px;
  padding: 12px;
  border: 1px dashed #facc15; /* amarelo/laranja */
  background: rgba(254, 252, 232, 0.92); /* laranja bem claro, fosco */
  backdrop-filter: blur(6px);
  display: grid;
  gap: 10px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);

  [data-theme="dark"] & {
    background: rgba(120, 53, 15, 0.72); /* laranja mais escuro no dark */
    border-color: rgba(250, 204, 21, 0.7);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
  }
`;

export const CardWrapper = styled.div`
  position: relative;
`;

export const BlurContent = styled.div`
  filter: ${({ $disabled }) => ($disabled ? "blur(1.5px)" : "none")};
  opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
  transition: filter 0.2s ease, opacity 0.2s ease;
`;

export const DisabledOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;

  [data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.85);
    color: #facc15;
  }
`;

/** Overlay de loading local */
export const SavingOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.55);

  [data-theme="light"] & {
    background: rgba(249, 250, 251, 0.85);
  }

  .loader-box {
    background: #111827;
    color: #fff;
    padding: 10px 14px;
    border-radius: 12px;
    min-width: 190px;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    opacity: 0.9;
  }
`;

export const ResumoRow = styled.div`
  display: flex;
  gap: 16px;
`;

export const CaixasBoxRow = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  align-items: center;
  background: #ffffff;

  [data-theme="dark"] & {
    background: #020617;
    border-color: rgba(148, 163, 184, 0.5);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CaixaSelect = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  outline: none;

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

export const BoxActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: flex-end;
`;

export const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 5px;
`;

export const FooterRight = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
