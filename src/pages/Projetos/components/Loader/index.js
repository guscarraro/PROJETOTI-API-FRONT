// src/components/Loader.jsx
import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Spinner = styled.span`
  display: inline-block;
  width: ${(p) => p.size || 16}px;
  height: ${(p) => p.size || 16}px;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,.12);
  border-top-color: rgba(99,102,241,1);
  animation: ${spin} .8s linear infinite;

  [data-theme="dark"] & {
    border: 3px solid rgba(255,255,255,.18);
    border-top-color: rgba(99,102,241,1);
  }
`;

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 3000;
  display: ${(p) => (p.active ? "flex" : "none")};
  align-items: center; justify-content: center;
  background: rgba(0,0,0,.25);
  backdrop-filter: blur(2px);
`;

const Box = styled.div`
  min-width: 220px;
  border-radius: 14px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 40px rgba(0,0,0,.18);
  display:flex; align-items:center; gap: 12px; justify-content:center;
  font-weight: 700;
  [data-theme="dark"] & {
    background: #0f172a; color: #e5e7eb; border-color: rgba(255,255,255,.08);
  }
`;

export function PageLoader({ active, text = "Carregando..." }) {
  return (
    <Overlay active={active}>
      <Box>
        <Spinner size={18} />
        <span>{text}</span>
      </Box>
    </Overlay>
  );
}
