// src/pages/DRE/Analise/components/AiThinkingOverlay/style.js
import styled, { keyframes } from "styled-components";

const floatIn = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
`;

const pulse = keyframes`
  0%   { transform: scaleY(0.35); opacity: 0.55; filter: blur(0px); }
  50%  { transform: scaleY(1.35); opacity: 1;    filter: blur(0.25px); }
  100% { transform: scaleY(0.35); opacity: 0.55; filter: blur(0px); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: radial-gradient(1000px 450px at 50% 40%, rgba(56,189,248,0.12), rgba(2,6,23,0.70));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

export const Card = styled.div`
  width: min(560px, 92vw);
  border-radius: 20px;
  padding: 18px 16px;
  border: 1px solid rgba(148,163,184,0.30);
  background: rgba(2, 6, 23, 0.55);
  color: #e5e7eb;
  box-shadow: 0 26px 90px rgba(0,0,0,0.45);
  animation: ${floatIn} 180ms ease-out;
`;

export const WaveRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: center;
  height: 44px;
  margin-bottom: 10px;

  &.rev {
    transform: rotate(180deg);
    transition: 220ms ease;
  }
`;

export const Pill = styled.div`
  width: 10px;
  height: 44px;
  border-radius: 999px;
  transform-origin: bottom;
  background: linear-gradient(180deg, rgba(96,165,250,0.95), rgba(167,139,250,0.85), rgba(52,211,153,0.85));
  animation: ${pulse} 900ms ease-in-out infinite;
  box-shadow:
    0 0 18px rgba(96,165,250,0.35),
    0 0 26px rgba(167,139,250,0.20);
`;

export const Title = styled.div`
  font-weight: 1000;
  font-size: 14px;
  letter-spacing: -0.2px;
`;

export const Sub = styled.div`
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.82;
  line-height: 1.35;
`;