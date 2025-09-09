// styles.js
import styled, { keyframes } from "styled-components";

/* ======= Animations ======= */
const spin = keyframes` to { transform: rotate(360deg); } `;
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
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
  background: #eee;
  border-radius: 6px;
  height: 10px;
  margin-top: 8px;
  width: 100%;
  overflow: hidden;
`;

export const BarFill = styled.div`
  background: #28a745; /* verde - upload */
  height: 100%;
  width: 0%;
  transition: width 0.2s ease;
`;

export const BarFillServer = styled(BarFill)`
  background: #0d6efd; /* azul - processamento servidor */
`;

/* ======= Result summary ======= */
export const ResultRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border: 1px solid #edf0f2;
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 8px;
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: ${(p) => p.color || "#475467"};
`;
