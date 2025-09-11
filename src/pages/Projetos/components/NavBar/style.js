import styled, { css } from "styled-components";

/* Ícone e Label primeiro, para poderem ser referenciados depois */
export const NavIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

export const NavLabel = styled.span`
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: #f9fafb;
  transition: opacity .24s ease, transform .24s ease, width .24s ease;
`;

/* Container da barra lateral (fixa e sempre visível) */
export const NavWrap = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;            /* colada na esquerda da viewport */
  height: 100dvh;

  /* colapsado por padrão (usa var global com fallback) */
  width: var(--nav-collapsed, 64px);

  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: saturate(140%) blur(10px);
  border-right: 1px solid rgba(255,255,255,0.08);

  display: flex;
  align-items: stretch;
  z-index: 2000;
  overflow: hidden;                                 /* evita “vazamento” dos labels durante animação */
  will-change: width;                               /* dica de performance */
  transition: width .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease;

  /* expande no hover sem empurrar o conteúdo */
  &:hover {
    width: 220px;
    box-shadow: 8px 0 24px rgba(2,6,23,.12);
  }

  /* colapso do label */
  &:not(:hover) ${NavLabel} {
    opacity: 0;
    transform: translateX(-6px);
    width: 0;
    pointer-events: none;
  }

  [data-theme="dark"] & {
    background: rgba(2, 6, 23, 0.55);
    border-right-color: rgba(255,255,255,0.06);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    ${NavLabel} { transition: none; }
  }
`;

export const NavInner = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 12px 10px;
  gap: 6px;
  width: 100%;
`;

export const NavItem = styled.button`
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  gap: 12px;

  border: 0;
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;

  padding: 10px 8px;
  border-radius: 12px;

  &:hover {
    background: rgba(255,255,255,0.08);
  }

  ${(p) =>
    p.$active &&
    css`
      background: rgba(96, 165, 250, 0.22);
      color: #ffffff;
      box-shadow: inset 0 0 0 1px rgba(96,165,250,0.35);
    `}
`;

export const NavSpacer = styled.div`
  flex: 1;
`;

export const ToggleRow = styled(NavItem)`
  margin-top: auto;
  background: rgba(255,255,255,0.04);
  &:hover { background: rgba(255,255,255,0.09); }
`;
