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
  transition: opacity 0.24s ease, transform 0.24s ease, width 0.24s ease;
`;

/* Container da barra lateral / top bar no mobile */
export const NavWrap = styled.aside`
  /* --- Base (desktop: sidebar à esquerda) --- */
  position: fixed;
  inset: 0 auto 0 0;
  height: 100dvh;

  --nav-collapsed: 64px;
  width: var(--nav-collapsed);

  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: saturate(140%) blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);

  display: flex;
  align-items: stretch;
  z-index: 2000;
  overflow: hidden;
  will-change: width, height;
  transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease;

  .nav-hamburger {
    display: none;
  }

  &:hover {
    width: 220px;
    box-shadow: 8px 0 24px rgba(2, 6, 23, 0.12);
  }

  &:not(:hover) ${NavLabel} {
    opacity: 0;
    transform: translateX(-6px);
    width: 0;
    pointer-events: none;
  }

  [data-theme="dark"] & {
    background: rgba(2, 6, 23, 0.55);
    border-right-color: rgba(255, 255, 255, 0.06);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    ${NavLabel} {
      transition: none;
    }
  }

  /* --- Mobile: top bar + modal fullscreen quando [data-open="true"] --- */
  @media (max-width: 768px) {
    inset: 0 0 auto 0;
    height: var(--nav-h, 56px);
    width: 100vw;
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: none;

    &:hover {
      width: 100vw;
      box-shadow: none;
    }

    .nav-hamburger {
      position: fixed;
      right: 12px;
      top: calc(env(safe-area-inset-top) + 10px);
      width: 40px;
      height: 36px;
      border: 0;
      background: transparent;
      z-index: 3200;
      cursor: pointer;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
    }
    .nav-hamburger:focus-visible {
      outline: 2px solid rgba(96, 165, 250, 0.9);
      outline-offset: 2px;
      border-radius: 10px;
    }

    .nav-hamburger .line,
    .nav-hamburger::before,
    .nav-hamburger::after {
      content: "";
      display: block;
      position: absolute;
      width: 22px;
      height: 2px;
      background: #e5e7eb;
      border-radius: 2px;
      transition: transform 0.24s ease, opacity 0.18s ease, top 0.24s ease;
    }
    .nav-hamburger .line {
      top: 50%;
      transform: translateY(-50%);
    }
    .nav-hamburger::before {
      top: 10px;
    }
    .nav-hamburger::after {
      top: 24px;
    }

    &[data-open="true"] .nav-hamburger .line {
      opacity: 0;
      transform: translateY(-50%) scaleX(0.4);
    }
    &[data-open="true"] .nav-hamburger::before {
      top: 17px;
      transform: rotate(45deg);
    }
    &[data-open="true"] .nav-hamburger::after {
      top: 17px;
      transform: rotate(-45deg);
    }

    &[data-open="true"] {
      inset: 0;
      height: 100dvh;
      width: 100vw;
      z-index: 4000;
      background: rgba(2, 6, 23, 0.92);
      border-bottom-color: transparent;
      overflow: hidden;
      touch-action: none;
      overscroll-behavior: contain;
      box-shadow: 0 10px 28px rgba(2, 6, 23, 0.35);
    }
  }
`;

export const NavInner = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 12px 10px;
  gap: 6px;
  width: 100%;

  /* ✅ Scroll no desktop também (sem mostrar barra) */
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  @media (max-width: 768px) {
    display: none;

    ${NavWrap}[data-open="true"] & {
      display: flex;
      position: fixed;
      inset: calc(env(safe-area-inset-top) + 56px) 0 0 0;
      padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
      gap: 10px;
      overflow-y: auto;
      background: transparent;

      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;

      scrollbar-width: none;
      &::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
    }
  }
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
    background: rgba(255, 255, 255, 0.08);
  }

  ${(p) =>
    p.$active &&
    css`
      background: rgba(96, 165, 250, 0.22);
      color: #ffffff;
      box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.35);
    `}

  @media (max-width: 768px) {
    grid-template-columns: 32px 1fr;
    padding: 14px 12px;
    border-radius: 16px;
    font-size: 16px;

    &:active {
      transform: translateY(0.5px);
    }
  }
`;

export const NavSpacer = styled.div`
  flex: 1;
`;

export const ToggleRow = styled(NavItem)`
  margin-top: auto;
  background: rgba(255, 255, 255, 0.04);
  &:hover {
    background: rgba(255, 255, 255, 0.09);
  }

  @media (max-width: 768px) {
    background: rgba(255, 255, 255, 0.06);
  }
`;
