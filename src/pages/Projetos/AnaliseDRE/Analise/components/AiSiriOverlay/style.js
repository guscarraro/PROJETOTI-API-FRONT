import styled, { keyframes } from "styled-components";

const floatIn = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: radial-gradient(900px 420px at 50% 40%, rgba(56,189,248,0.12), rgba(2,6,23,0.72));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

export const Card = styled.div`
  width: min(620px, 94vw);
  border-radius: 22px;
  padding: 16px 16px 14px 16px;
  border: 1px solid rgba(148,163,184,0.30);
  background: rgba(2, 6, 23, 0.55);
  color: #e5e7eb;
  box-shadow: 0 26px 90px rgba(0,0,0,0.45);
  animation: ${floatIn} 180ms ease-out;
`;

export const CanvasWrap = styled.div`
  width: 100%;
  height: 180px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(148,163,184,0.22);
  background: radial-gradient(380px 160px at 50% 50%, rgba(255,255,255,0.06), rgba(2,6,23,0.18));
  margin-bottom: 12px;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 1000;
  font-size: 14px;
  letter-spacing: -0.2px;

  svg {
    opacity: 0.9;
  }
`;

export const Sub = styled.div`
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.82;
  line-height: 1.35;
`;