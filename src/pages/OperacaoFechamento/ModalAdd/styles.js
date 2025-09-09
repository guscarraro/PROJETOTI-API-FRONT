// styles.js
import styled, { keyframes } from "styled-components";

/* ======= Animations ======= */
const spin = keyframes`to { transform: rotate(360deg); }`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* Move listras (onda) para a direita */
const flow = keyframes`
  from { background-position: 0 0; }
  to   { background-position: 120px 0; }
`;

/* Brilho que varre da esquerda p/ a direita */
const sheen = keyframes`
  0%   { transform: translateX(-100%); opacity: .0; }
  15%  { opacity: .25; }
  50%  { transform: translateX(0%);   opacity: .35; }
  85%  { opacity: .25; }
  100% { transform: translateX(120%); opacity: .0; }
`;

/* ======= Generic Box (cards/sections) ======= */
export const Box = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.08);
  border: 1px solid rgba(16, 24, 40, 0.06);
  animation: ${fadeIn} 180ms ease-out;
`;

/* ======= Loading ======= */
export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  width: 100%;
`;

export const Loader = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.12);
  border-top-color: #0d6efd; /* bootstrap primary */
  animation: ${spin} 0.8s linear infinite;
`;

export const LoadingText = styled.span`
  font-size: 0.95rem;
  color: #475467;
`;

/* ======= Progress Bars ======= */
export const BarWrap = styled.div`
  --radius: 10px;
  --height: 16px;           /* mais grosso */
  background: #eef2f6;
  border-radius: var(--radius);
  height: var(--height);
  margin-top: 10px;
  width: 100%;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(16, 24, 40, 0.08);
`;

export const BarFill = styled.div`
  position: relative;
  background: linear-gradient(90deg, #34c759, #28a745);
  height: 100%;
  width: 0%;
  transition: width 220ms ease;
  border-radius: inherit;
`;

/* Barra do servidor com “ondas” modernas */
export const BarFillServer = styled(BarFill)`
  background: linear-gradient(90deg, #0d6efd, #0b5ed7);
  overflow: hidden;

  /* Listras diagonais com movimento contínuo (onda) */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(
        -45deg,
        rgba(255,255,255,0.12) 0px,
        rgba(255,255,255,0.12) 10px,
        rgba(255,255,255,0.06) 10px,
        rgba(255,255,255,0.06) 20px
      );
    background-size: 120px 120px;
    animation: ${flow} 2500ms linear infinite;
    mix-blend-mode: screen;
  }

  /* Brilho suave que varre a barra */
  &::after {
    content: "";
    position: absolute;
    top: -40%;
    bottom: -40%;
    left: 0;
    width: 40%;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.35) 50%,
      rgba(255,255,255,0) 100%
    );
    filter: blur(6px);
    animation: ${sheen} 1800ms ease-in-out infinite;
  }
`;

/* ======= Result summary ======= */
export const ResultRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border: 1px solid #edf0f2;
  border-radius: 10px;
  padding: 12px 14px;
  margin-top: 10px;
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: ${(p) => p.color || "#475467"};
`;
