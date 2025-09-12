import styled, { css } from "styled-components";

/* wrapper da página com espaço para o Nav à esquerda */
export const Page = styled.div`
  /* Paleta base (customizável) */
  --page-bg-start: #f8fafc;
  --page-bg-end: #f3f4f6;
  --accent-1: 96, 165, 250; /* azul suave */
  --accent-2: 16, 185, 129; /* verde suave */

  /* Larguras do Nav (colapsado vs gap do conteúdo) */
  --nav-collapsed: 64px;
  --content-gap-left: clamp(8px, 1vw, 12px);

  position: relative;
  isolation: isolate; /* stacking context */
  min-height: 100dvh;

  /* espaço para o nav fixo à esquerda (o nav expande no hover sem empurrar o conteúdo) */
  padding: clamp(16px, 2.5vw, 28px);
  padding-left: calc(var(--nav-collapsed, 64px) + var(--content-gap-left));

  /* Fundo base */
  background: radial-gradient(
      1200px 600px at -10% -10%,
      rgba(var(--accent-1), 0.1),
      transparent 60%
    ),
    radial-gradient(
      1000px 500px at 110% -20%,
      rgba(var(--accent-2), 0.08),
      transparent 55%
    ),
    linear-gradient(180deg, var(--page-bg-start) 0%, var(--page-bg-end) 100%);

  /* Grid + manchas animadas — atrás de tudo e sem capturar cliques */
  &::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      /* grid mais evidente */ linear-gradient(
        to right,
        rgba(17, 24, 39, 0.08) 1px,
        transparent 1px
      ),
      linear-gradient(to bottom, rgba(17, 24, 39, 0.08) 1px, transparent 1px),
      /* manchas radiais animadas */
        radial-gradient(
          600px 420px at var(--gx, 20%) var(--gy, 12%),
          rgba(var(--accent-1), 0.15),
          transparent 60%
        ),
      radial-gradient(
        520px 360px at calc(100% - var(--gx, 20%)) calc(100% - var(--gy, 12%)),
        rgba(var(--accent-2), 0.12),
        transparent 60%
      );
    background-size: 24px 24px, 24px 24px, 100% 100%, 100% 100%;
    filter: blur(var(--grid-blur, 0px));
    z-index: 0;
    animation: pageBgShift 16s ease-in-out infinite;
  }

  /* Glow suave no topo */
  &::after {
    content: "";
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    height: 80px;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0)
    );
    backdrop-filter: blur(2px);
    z-index: 0;
  }

  /* conteúdo da página acima dos pseudos */
  > * {
    position: relative;
    z-index: 1;
  }

  /* Scroll elegante */
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(17, 24, 39, 0.15);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Dark mode por atributo em <html data-theme="dark"> */
  [data-theme="dark"] & {
    --page-bg-start: #0b1220;
    --page-bg-end: #0e1424;

    &::before {
      /* traços do grid mais claros para aparecerem no fundo escuro */
      background: linear-gradient(
          to right,
          rgba(255, 255, 255, 0.12) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.12) 1px,
          transparent 1px
        ),
        radial-gradient(
          600px 420px at var(--gx, 20%) var(--gy, 12%),
          rgba(99, 102, 241, 0.18),
          transparent 60%
        ),
        radial-gradient(
          520px 360px at calc(100% - var(--gx, 20%)) calc(100% - var(--gy, 12%)),
          rgba(45, 212, 191, 0.14),
          transparent 60%
        );
    }

    &::after {
      background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.55),
        rgba(15, 23, 42, 0)
      );
    }
  }

  @keyframes pageBgShift {
    0% {
      --gx: 16%;
      --gy: 10%;
      --grid-blur: 0px;
    }
    50% {
      --gx: 84%;
      --gy: 65%;
      --grid-blur: 1px;
    }
    100% {
      --gx: 22%;
      --gy: 20%;
      --grid-blur: 0px;
    }
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const Title = styled.h1`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: #111827;
  &::before {
    content: "";
    width: 8px;
    height: 26px;
    border-radius: 6px;
    background: #6366f1;
    display: inline-block;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const SearchBox = styled.div`
  width: 280px;
  input {
    border-radius: 10px !important;
  }
`;

export const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 14px;
`;

export const UserCard = styled.div`
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 14px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
  }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.06);
    box-shadow: 0 8px 24px rgba(2, 6, 23, 0.45);
    &:hover {
      box-shadow: 0 12px 32px rgba(2, 6, 23, 0.65);
    }
  }
`;

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #1f2937;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;

  ${(p) =>
    p.$accent &&
    css`
      color: #065f46;
      background: rgba(16, 185, 129, 0.14);
      border-color: rgba(16, 185, 129, 0.35);
    `}

  [data-theme="dark"] & {
    color: #e5e7eb;
    background: #0b1220;
    border-color: rgba(255, 255, 255, 0.08);
    ${(p) =>
      p.$accent &&
      css`
        color: #34d399;
        background: rgba(16, 185, 129, 0.18);
        border-color: rgba(16, 185, 129, 0.5);
      `}
  }
`;

export const SectorChecks = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 10px;
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
  label {
    display: flex;
    gap: 10px;
    align-items: center;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 8px 10px;
  }
  input {
    transform: scale(1.1);
  }

  [data-theme="dark"] & label {
    background: #0b1220;
    border-color: rgba(255, 255, 255, 0.08);
    color: #e5e7eb;
  }
`;

export const CheckRow = styled.div``;

export const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 10px 0;
  [data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.08);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`;

export const ModalBox = styled.div`
  width: 520px;
  max-width: 92vw;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 44px rgba(2, 6, 23, 0.7);
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  label {
    font-size: 12px;
    font-weight: 700;
    color: #374151;
  }
  input {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    outline: none;
    background: #fff;
  }
  [data-theme="dark"] & {
    label {
      color: #cbd5e1;
    }
    input {
      background: #0b1220;
      color: #e5e7eb;
      border-color: rgba(255, 255, 255, 0.08);
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
`;

export const Danger = styled.button`
  border: 1px solid #fecaca;
  background: #fee2e2;
  color: #991b1b;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    filter: brightness(0.98);
  }

  [data-theme="dark"] & {
    background: rgba(239, 68, 68, 0.14);
    border-color: rgba(239, 68, 68, 0.4);
    color: #fca5a5;
  }
`;

export const Inline = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const Help = styled.div`
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
  code {
    background: #eef2ff;
    padding: 2px 6px;
    border-radius: 6px;
  }
  [data-theme="dark"] & {
    color: #94a3b8;
    code {
      background: #0b1220;
    }
  }
`;
