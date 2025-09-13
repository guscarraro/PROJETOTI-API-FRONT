import styled, { keyframes, css } from "styled-components";

/** Paleta alinhada ao restante do app */
const c = {
  lightBgStart: "#f8fafc",
  lightBgEnd: "#f3f4f6",
  darkBgStart: "#0b1220",
  darkBgEnd: "#0e1424",
};

const gridPan = keyframes`
  0%   { background-position: 0 0, 0 0, 20% 12%, 80% 72%; }
  50%  { background-position: 8px 6px, 6px 8px, 78% 65%, 24% 22%; }
  100% { background-position: 0 0, 0 0, 22% 20%, 78% 70%; }
`;

/* Bolhas quadradas flutuando */
const bob = keyframes`
  0%   { transform: translateY(0px) translateX(0px) rotate(0.001deg); opacity: .7; }
  50%  { transform: translateY(-14px) translateX(4px) rotate(0.001deg); opacity: 1; }
  100% { transform: translateY(0px) translateX(0px) rotate(0.001deg); opacity: .7; }
`;

/* brilho que varre o botão */
const sweep = keyframes`
  0%   { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
`;

export const LoginWrap = styled.main`
  --accent-1: 99, 102, 241;   /* indigo */
  --accent-2: 45, 212, 191;   /* teal   */
  position: relative;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: clamp(16px, 3vw, 28px);
  background:
    radial-gradient(1200px 600px at -10% -10%, rgba(var(--accent-1), .10), transparent 60%),
    radial-gradient(1000px 500px at 110% -20%, rgba(var(--accent-2), .08), transparent 55%),
    linear-gradient(180deg, ${c.lightBgStart} 0%, ${c.lightBgEnd} 100%);

  [data-theme="dark"] & {
    background:
      radial-gradient(1200px 600px at -10% -10%, rgba(var(--accent-1), .16), transparent 60%),
      radial-gradient(1000px 500px at 110% -20%, rgba(var(--accent-2), .12), transparent 55%),
      linear-gradient(180deg, ${c.darkBgStart} 0%, ${c.darkBgEnd} 100%);
  }
`;

export const GridFx = styled.div`
  position: absolute; inset: 0;
  pointer-events: none; z-index: 0;
  background:
    linear-gradient(to right, rgba(17,24,39,.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(17,24,39,.08) 1px, transparent 1px),
    radial-gradient(600px 420px at 20% 12%, rgba(var(--accent-1), .15), transparent 60%),
    radial-gradient(520px 360px at 80% 72%, rgba(var(--accent-2), .12), transparent 60%);
  background-size: 24px 24px, 24px 24px, 100% 100%, 100% 100%;
  animation: ${gridPan} 18s ease-in-out infinite;

  [data-theme="dark"] & {
    background:
      linear-gradient(to right, rgba(255,255,255,.12) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,.12) 1px, transparent 1px),
      radial-gradient(600px 420px at 20% 12%, rgba(99,102,241,.20), transparent 60%),
      radial-gradient(520px 360px at 80% 72%, rgba(45,212,191,.16), transparent 60%);
  }
`;

/* container das “bolhas” */
export const Particles = styled.div`
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
`;

/* bolha quadrada (varie props com inline style) */
export const Bubble = styled.span`
  position: absolute;
  display: block;
  border-radius: 16px;
  backdrop-filter: blur(1.5px);
  border: 1px solid rgba(17,24,39,.12);
  background:
    linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0)),
    radial-gradient(220px 120px at 40% 30%, rgba(var(--accent-1), .08), transparent 60%),
    radial-gradient(180px 120px at 70% 80%, rgba(var(--accent-2), .06), transparent 60%);
  animation: ${bob} var(--dur, 8s) ease-in-out infinite;
  opacity: .85;

  ${(p) =>
    p.blur &&
    css`
      filter: blur(0.3px);
    `}

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.10);
    background:
      linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0)),
      radial-gradient(220px 120px at 40% 30%, rgba(99,102,241,.12), transparent 60%),
      radial-gradient(180px 120px at 70% 80%, rgba(45,212,191,.10), transparent 60%);
  }
`;

/* Card de login */
export const GlassCard = styled.section`
  position: relative; z-index: 2;
  width: min(480px, 92vw);
  border-radius: 20px;
  padding: 30px 28px;
  background:
    radial-gradient(160% 120% at 20% 15%, rgba(99,102,241,.06), transparent 60%),
    radial-gradient(160% 140% at 100% 100%, rgba(45,212,191,.05), transparent 60%),
    rgba(255,255,255,.66);
  border: 1px solid rgba(17,24,39,.08);
  box-shadow: 0 28px 84px rgba(0,0,0,.12);
  backdrop-filter: blur(10px);
  overflow: hidden;

  [data-theme="dark"] & {
    background:
      radial-gradient(160% 120% at 20% 15%, rgba(99,102,241,.12), transparent 60%),
      radial-gradient(160% 140% at 100% 100%, rgba(45,212,191,.10), transparent 60%),
      rgba(15,23,42,.66);
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 24px 80px rgba(2,6,23,.55);
  }
`;

export const AccentBar = styled.div`
  position: absolute; inset: 0 auto 0 0;
  width: 6px;
  background: linear-gradient(180deg, rgba(var(--accent-1),1), rgba(var(--accent-2),1));
  filter: drop-shadow(0 0 12px rgba(99,102,241,.4));
`;

export const BrandRow = styled.div`
  display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
`;

export const BrandLogo = styled.img`
  width: 44px; height: 44px; object-fit: contain; border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0,0,0,.12);

  [data-theme="dark"] & {
    box-shadow: 0 6px 18px rgba(2,6,23,.55);
  }
`;

export const Heading = styled.h1`
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: .2px;
  color: #111827;
  [data-theme="dark"] & { color: #e5e7eb; }
`;

export const Sub = styled.p`
  margin: 6px 0 22px 56px;
  color: #6b7280;
  font-size: 13px;
  [data-theme="dark"] & { color: #94a3b8; }
`;

export const StyledForm = styled.form`
  display: grid;
  gap: 16px;
`;

/* ====== INPUT ORGÂNICO ====== */
export const Field = styled.label`
  position: relative;
  display: grid;
  grid-template-columns: 54px 1fr;
  align-items: center;
  min-height: 54px;
  border-radius: 16px;

  /* Fundo orgânico com “manchas” e leve noise */
  background:
    radial-gradient(110% 140% at 10% 20%, rgba(99,102,241,.06), transparent 60%),
    radial-gradient(120% 130% at 90% 80%, rgba(45,212,191,.05), transparent 60%),
    linear-gradient(0deg, rgba(17,24,39,.02), rgba(255,255,255,0)),
    #ffffff;

  border: 1px solid #e5e7eb;
  transition: border-color .2s ease, box-shadow .2s ease, transform .12s ease, background .2s ease;

  &:hover { transform: translateY(-1px); }

  &:focus-within {
    border-color: rgba(var(--accent-1), .88);
    box-shadow: 0 0 0 4px rgba(var(--accent-1), .12);
    background:
      radial-gradient(110% 140% at 10% 20%, rgba(99,102,241,.10), transparent 60%),
      radial-gradient(120% 130% at 90% 80%, rgba(45,212,191,.08), transparent 60%),
      linear-gradient(0deg, rgba(17,24,39,.02), rgba(255,255,255,0)),
      #ffffff;
  }

  /* divisória do ícone com “curva” sutil */
  &::after{
    content:"";
    position: absolute; left: 54px; top: 10px; bottom: 10px; width: 1px;
    background:
      linear-gradient(180deg, rgba(17,24,39,.06), rgba(17,24,39,.06)) padding-box,
      radial-gradient(14px 120% at 0% 50%, rgba(17,24,39,.12), rgba(17,24,39,0)) border-box;
    opacity: .9;
  }

  [data-theme="dark"] & {
    background:
      radial-gradient(110% 140% at 10% 20%, rgba(99,102,241,.12), transparent 60%),
      radial-gradient(120% 130% at 90% 80%, rgba(45,212,191,.10), transparent 60%),
      linear-gradient(0deg, rgba(255,255,255,.02), rgba(255,255,255,0)),
      #0f172a;
    border-color: rgba(255,255,255,.10);

    &:focus-within {
      border-color: rgba(99,102,241,.9);
      box-shadow: 0 0 0 4px rgba(99,102,241,.14);
      background:
        radial-gradient(110% 140% at 10% 20%, rgba(99,102,241,.18), transparent 60%),
        radial-gradient(120% 130% at 90% 80%, rgba(45,212,191,.16), transparent 60%),
        linear-gradient(0deg, rgba(255,255,255,.02), rgba(255,255,255,0)),
        #0f172a;
    }

    &::after{
      background:
        linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.10)) padding-box,
        radial-gradient(14px 120% at 0% 50%, rgba(255,255,255,.16), rgba(255,255,255,0)) border-box;
      opacity: 1;
    }
  }
`;

export const IconBox = styled.span`
  display: grid; place-items: center;
  height: 54px;
  color: #6b7280;

  svg { width: 18px; height: 18px; }

  [data-theme="dark"] & { color: #94a3b8; }
`;

export const TextInput = styled.input`
  border: 0; outline: none; background: transparent;
  height: 54px; padding: 0 14px 0 12px;
  font-size: 15px; color: #111827; width: 100%;
  caret-color: rgb(var(--accent-1));
  border-radius: 10px;
  &::placeholder { color: #9ca3af; }
  [data-theme="dark"] & { color: #e5e7eb; &::placeholder{ color:#94a3b8; } }
`;

/* ====== BOTÃO MODERNO + MENOS BRILHO ====== */
export const Submit = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px 48px 12px 16px; /* espaço para a seta à direita */
  border-radius: 14px;
  border: 1px solid rgba(17,24,39,.10);
  overflow: hidden; /* esconde a seta quando sair do botão */

  /* gradiente sóbrio + deslizante */
  background: linear-gradient(90deg, #4a55d1 0%, #3f6cd1 40%, #1f7f72 100%);
  background-size: 200% 100%;
  background-position: 0% 0%;
  color: #fff;
  font-weight: 800;
  letter-spacing: .2px;
  cursor: pointer;

  transition:
    transform .12s ease,
    box-shadow .2s ease,
    filter .2s ease,
    background-position .55s cubic-bezier(0.22, 1, 0.36, 1);

  box-shadow: 0 10px 22px rgba(17,24,39,.12);

  /* Ícone seta posicionado no canto direito, animando para fora */
  > svg {
    position: absolute;
    right: 16px;
    width: 18px;
    height: 18px;
    pointer-events: none;
    transform: translateX(0);
    transition: transform .55s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(17,24,39,.16);
    background-position: 100% 0%; /* desliza o gradiente junto com a seta */
  }

  /* corre para fora do botão (quase até o fim) */
  &:hover > svg {
    transform: translateX(calc(160% + 12px));
  }
  &:active > svg {
    transform: translateX(calc(200% + 14px));
  }

  &:active { transform: translateY(0); filter: brightness(.98); }
  &:disabled { opacity: .85; cursor: not-allowed; filter: grayscale(.15) brightness(.95); }

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 12px 26px rgba(2,6,23,.55);
    &:hover { box-shadow: 0 16px 30px rgba(2,6,23,.65); }
  }
`;



export const HintRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12px; color: #6b7280; margin-top: 2px;
  [data-theme="dark"] & { color: #94a3b8; }
`;
