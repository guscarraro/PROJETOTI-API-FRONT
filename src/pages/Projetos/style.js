import styled, { css, createGlobalStyle } from "styled-components";


export const SectorFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px;
  flex-wrap: wrap;
  user-select: none;
`;

export const FilterLabel = styled.label`
  font-size: 12px;
  line-height: 1;
  padding: 6px 10px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.04),
    rgba(0, 0, 0, 0.02)
  );
  color: #374151;            /* slate-700 */
  border: 1px solid #e5e7eb; /* gray-200 */
  letter-spacing: 0.2px;

  /* Dark mode: automático e via classe/atributo */
  @media (prefers-color-scheme: dark) {
    color: #e5e7eb;            /* gray-200 */
    border-color: #334155;     /* slate-700 */
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.02)
    );
  }
  .dark &,
  [data-theme="dark"] & {
    color: #e5e7eb;
    border-color: #334155;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.02)
    );
  }
`;

/* Arrow SVG embutida (mantém nativo + estilizado) */
export const arrowSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>`
);

export const SectorSelect = styled.select`
  height: 34px;
  padding: 0 36px 0 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;        /* gray-200 */
  background:
    /* arrow */ url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
    /* surface */ linear-gradient(180deg, #ffffff, #fafafa);
  color: #111827;                    /* gray-900 */
  font-size: 14px;
  outline: none;
  appearance: none;                  /* remove seta nativa */
  transition: box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;

  &:hover {
    border-color: #d1d5db;           /* gray-300 */
    background:
      url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
      linear-gradient(180deg, #ffffff, #f5f5f5);
  }

  &:focus {
    border-color: #60a5fa;           /* blue-400 */
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  option {
    color: inherit;                   /* herda cor (light/dark) */
    background: inherit;              /* mantém coerência ao abrir */
  }

  /* Dark mode automático */
  @media (prefers-color-scheme: dark) {
    border-color: #334155;            /* slate-700 */
    color: #e5e7eb;                   /* gray-200 */
    background:
      url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
      linear-gradient(180deg, #0b1220, #0f172a); /* base mais suave */

    &:hover {
      border-color: #475569;          /* slate-600 */
      background:
        url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
        linear-gradient(180deg, #0b1220, #131c2e);
    }
    &:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
    }
  }

  /* Dark mode via classe/atributo */
  .dark &,
  [data-theme="dark"] & {
    border-color: #334155;
    color: #e5e7eb;
    background:
      url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
      linear-gradient(180deg, #0b1220, #0f172a);
    &:hover {
      border-color: #475569;
      background:
        url("data:image/svg+xml,${arrowSvg}") no-repeat right 10px center,
        linear-gradient(180deg, #0b1220, #131c2e);
    }
    &:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
    }
  }
`;

export const MODAL_CLASS = "project-modal";

export const GlobalModalStyles = createGlobalStyle`
  /* O Reactstrap aplica a classe em .modal-content */
  [data-theme="dark"] .modal-content.${MODAL_CLASS} {
    background: #0f172a;
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,.08);
  }
  [data-theme="dark"] .modal-content.${MODAL_CLASS} .modal-header,
  [data-theme="dark"] .modal-content.${MODAL_CLASS} .modal-footer {
    background: transparent;
    border-color: rgba(255,255,255,.08);
    color: #e5e7eb;
  }
  [data-theme="dark"] .modal-content.${MODAL_CLASS} label {
    color: #cbd5e1;
  }
  [data-theme="dark"] .modal-content.${MODAL_CLASS} input,
  [data-theme="dark"] .modal-content.${MODAL_CLASS} select,
  [data-theme="dark"] .modal-content.${MODAL_CLASS} .form-control {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.12);
  }
`;

export const DeleteCommentBtn = styled.button`
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 0;
  margin-left: auto;

  &:hover {
    color: #dc2626;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;
export const Page = styled.div`
  /* Paleta base (customizável) */
  --page-bg-start: #f8fafc;
  --page-bg-end: #f3f4f6;
  --accent-1: 96, 165, 250;   /* azul suave */
  --accent-2: 16, 185, 129;   /* verde suave */

  /* Larguras do Nav (colapsado vs gap do conteúdo) */
  --nav-collapsed: 64px;
  --content-gap-left: clamp(8px, 1vw, 12px);

  position: relative;
  isolation: isolate;                 /* stacking context */
  min-height: 100dvh;

  /* espaço para o nav fixo à esquerda (o nav expande no hover sem empurrar o conteúdo) */
  padding: clamp(16px, 2.5vw, 28px);
  padding-left: calc(var(--nav-collapsed, 64px) + var(--content-gap-left));

  /* Fundo base */
  background:
    radial-gradient(1200px 600px at -10% -10%, rgba(var(--accent-1), .10), transparent 60%),
    radial-gradient(1000px 500px at 110% -20%, rgba(var(--accent-2), .08), transparent 55%),
    linear-gradient(180deg, var(--page-bg-start) 0%, var(--page-bg-end) 100%);

  /* Grid + manchas animadas — atrás de tudo e sem capturar cliques */
  &::before{
    content: "";
    position: fixed; inset: 0;
    pointer-events: none;
    background:
      /* grid mais evidente */
      linear-gradient(to right, rgba(17, 24, 39, .08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(17, 24, 39, .08) 1px, transparent 1px),
      /* manchas radiais animadas */
      radial-gradient(600px 420px at var(--gx,20%) var(--gy,12%), rgba(var(--accent-1), .15), transparent 60%),
      radial-gradient(520px 360px at calc(100% - var(--gx,20%)) calc(100% - var(--gy,12%)), rgba(var(--accent-2), .12), transparent 60%);
    background-size:
      24px 24px,
      24px 24px,
      100% 100%,
      100% 100%;
    filter: blur(var(--grid-blur, 0px));
    z-index: 0;
    animation: pageBgShift 16s ease-in-out infinite;
  }

  /* Glow suave no topo */
  &::after{
    content: "";
    position: fixed; left: 0; right: 0; top: 0; height: 80px;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(255,255,255,.8), rgba(255,255,255,0));
    backdrop-filter: blur(2px);
    z-index: 0;
  }

  /* conteúdo da página acima dos pseudos */
  > * { position: relative; z-index: 1; }

  /* Scroll elegante */
  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 10px; height: 10px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(17, 24, 39, .15);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  &::-webkit-scrollbar-track { background: transparent; }

  /* Dark mode por atributo em <html data-theme="dark"> */
  [data-theme="dark"] & {
    --page-bg-start: #0b1220;
    --page-bg-end: #0e1424;

    &::before{
      /* traços do grid mais claros para aparecerem no fundo escuro */
      background:
        linear-gradient(to right, rgba(255,255,255,.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,.12) 1px, transparent 1px),
        radial-gradient(600px 420px at var(--gx,20%) var(--gy,12%), rgba(99,102,241,.18), transparent 60%),
        radial-gradient(520px 360px at calc(100% - var(--gx,20%)) calc(100% - var(--gy,12%)), rgba(45,212,191,.14), transparent 60%);
    }

    &::after{
      background: linear-gradient(180deg, rgba(15,23,42,.55), rgba(15,23,42,0));
    }
  }

  @keyframes pageBgShift {
    0%   { --gx: 16%; --gy: 10%; --grid-blur: 0px; }
    50%  { --gx: 84%; --gy: 65%; --grid-blur: 1px; }
    100% { --gx: 22%; --gy: 20%; --grid-blur: 0px; }
  }
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const TimelineHeader = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;

  [data-theme="dark"] & {
    background: #0f172a;
    border-bottom-color: rgba(255,255,255,.07);
  }
`;

export const DaysScroller = styled.div`
  overflow-x: auto;
`;

export const H1 = styled.h1`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0;

  /* tipografia moderna */
  font-family: "Inter", "Poppins", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0.2px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;

  /* cor vinda do status (macro) */
  color: ${(p) => p.$accent || "#111827"};

  /* barrinha de acento à esquerda (sutil e moderna) */
  &::before{
    content: "";
    width: 8px;
    height: 28px;
    border-radius: 6px;
    background: ${(p) => p.$accent || "#6366f1"};
    display: inline-block;
  }

  [data-theme="dark"] & {
    color: ${(p) => p.$accent || "#e5e7eb"};
    &::before{
      background: ${(p) => p.$accent || "#6366f1"};
    }
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

export const Card = styled.div`
    display: flex;
        flex-direction: column;
    justify-content: space-between;
  position: relative;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  padding: 18px;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.12);}

  [data-theme="dark"] & {
    background: #0f172a; /* slate-900 */
    color: #e5e7eb;
    box-shadow: 0 8px 24px rgba(2,6,23,0.5);
    border: 1px solid rgba(255,255,255,.06);
    &:hover { box-shadow: 0 12px 32px rgba(2,6,23,0.65); }
  }
`;

export const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  ${(p) => p.$variant === 'andamento' && css`background: rgba(16,185,129,.12); color: #047857;`}
  ${(p) => p.$variant === 'standby' && css`background: rgba(245,158,11,.12); color: #92400e;`}
  ${(p) => p.$variant === 'cancelado' && css`background: rgba(239,68,68,.12); color: #991b1b;`}

  [data-theme="dark"] & {
    filter: brightness(1.1);
  }
`;

export const Muted = styled.small`
  color: #6b7280;

  [data-theme="dark"] & {
    color: #94a3b8; /* slate-400 */
  }
`;

export const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

export const Section = styled.section`
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);

  [data-theme="dark"] & {
    background: #0b1220; /* base escura da seção */
    color: #e5e7eb;
    box-shadow: 0 8px 24px rgba(2,6,23,0.45);
    border: 1px solid rgba(255,255,255,.06);
  }
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  @media (max-width: 1100px){ grid-template-columns: repeat(2, 1fr);}
`;

export const InfoItem = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
  transition: background .2s ease, box-shadow .2s ease, border-color .2s ease;

  small { color: #6b7280; }

  /* variante clicável (use $clickable ao usar o card) */
  ${(p) => p.$clickable && css`
    cursor: pointer;
    border: 1px solid #e5e7eb;
    &:hover { background: #f3f4f6; }
  `}

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,.06);

    small { color: #94a3b8; }

    ${(p) => p.$clickable && css`
      &:hover { background: #0b1220; }
    `}
  }
`;



export const TimelineBody = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  max-height: 56vh;
`;

export const FirstCol = styled.div`
  overflow-y: hidden;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  padding-bottom: 16px;

  [data-theme="dark"] & {
    background: #0f172a;
    border-right-color: rgba(255,255,255,.06);
  }
`;

export const FirstColRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0px 12px;
  border-bottom: 1px solid #f3f4f6;

  [data-theme="dark"] & {
    border-bottom-color: rgba(255,255,255,.06);
  }
`;

export const BodyScroller = styled.div`
  overflow-x: auto;
  background: #fff;

  [data-theme="dark"] & { background: #0f172a; }
`;

export const GridRows = styled.div`
  display: grid;
  grid-auto-flow: row;

  &::after {
    content: "";
    display: block;
    height: 8px;
  }
`;

export const GridRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 40px;
  border-bottom: 1px solid #f9fafb;
  height: 36px;

  [data-theme="dark"] & {
    border-bottom-color: rgba(255,255,255,.04);
  }
`;

export const DayCell = styled.button`
  position: relative;
  width: 40px; height: 36px;
  border: none; outline: none;
  border: 1px solid #f2f2f2;
  cursor: ${(p) => p.$weekend ? "not-allowed" : "pointer"};

  /* LIGHT: respeita $color; se não tiver, usa base/feriado */
  background: ${(p) =>
        p.$color
            ? p.$color
            : (p.$weekend ? "#111827" : "#ffffff")
    };

  ${(p) => p.$weekend && css`color:#9ca3af;`}
  &:hover { ${(p) => !p.$weekend && css`box-shadow: inset 0 0 0 2px #d1d5db;`} }

  [data-theme="dark"] & {
    border: 1px solid #0b1220;
    background: ${(p) =>
        p.$color
            ? p.$color
            : (p.$weekend ? "#0b1220" : "#0f172a")
    };
    &:hover { ${(p) => !p.$weekend && css`box-shadow: inset 0 0 0 2px rgba(255,255,255,.12);`} }
  }
`;


export const Palette = styled.div`
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.14);
  padding: 10px;
  z-index: 1200;

  .palette-textarea {
    width: 100%;
    resize: vertical;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 12px;
  }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 12px 28px rgba(2,6,23,.6);

    .palette-textarea {
      background: #0b1220;
      color: #e5e7eb;
      border-color: rgba(255,255,255,.08);
    }
  }
`;

export const ColorDot = styled.button`
  width: 18px; height: 18px; border-radius: 999px; border: 1px solid #e5e7eb;
  background: ${(p) => p.$color}; cursor: pointer;

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.08);
  }
`;

export const FooterBar = styled.div`
  display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px;
`;

export const TimelineWrap = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;

  /* alturas do header */
  --monthsH: 28px;
  --daysH: 32px;

  [data-theme="dark"] & { border-color: rgba(255,255,255,.06); }
`;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: ${(p) => (p.$leftWidth ? `${p.$leftWidth}px 1fr` : "280px 1fr")};
  /* opcional: garante que nada “vaze” do lado esquerdo */
  overflow: hidden;
`;
export const FixedColHeader = styled.div`
  padding: 18px 12px;
  font-weight: 700;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 3;
width: min-content;
  [data-theme="dark"] & {
    background: #0b1220;
    border-bottom-color: rgba(255,255,255,.08);
  }
`;

export const LeftHeaderSpacer = styled.div`
  height: calc(var(--monthsH) + var(--daysH));
  border-bottom: 1px solid #e5e7eb;
  background: #fff;

  [data-theme="dark"] & {
    background: #0f172a;
    border-bottom-color: rgba(255,255,255,.06);
  }
`;

export const RightScroller = styled.div`
  overflow: auto;
  background: #fff;
  position: relative;
  padding-bottom: 16px;

  [data-theme="dark"] & { background: #0f172a; }
`;

export const HeaderLayer = styled.div`
  position: sticky;
  top: 0;
  z-index: 3;
`;

export const MonthsRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 40px;
  height: var(--monthsH);
  border-bottom: 1px solid #e5e7eb;

  [data-theme="dark"] & { border-bottom-color: rgba(255,255,255,.06); }
`;

export const MonthCell = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 0;
  background: ${(p) => p.$bg || 'rgba(96,165,250,0.15)'}; /* tom default */

  [data-theme="dark"] & {
    background: ${(p) => p.$bg || 'rgba(99,102,241,0.18)'};
    color: #e5e7eb;
  }
`;

export const DaysRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 40px;
`;

export const DayCellHeader = styled.div`
  height: var(--daysH);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  background: ${(p) => p.$weekend ? "#1f2937" : (p.$bg || "#f3f4f6")};
  ${(p) => p.$weekend && css`color: #d1d5db;`}

  [data-theme="dark"] & {
    color: #cbd5e1;
    border-bottom-color: rgba(255,255,255,.06);
    background: ${(p) => p.$weekend ? "#0b1220" : (p.$bg || "#0f172a")};
  }
`;

export const LegendBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;

  [data-theme="dark"] & {
    background: #0b1220;
    border-bottom-color: rgba(255,255,255,.06);
  }
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #374151;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  border-radius: 999px;

  [data-theme="dark"] & {
    color: #e5e7eb;
    background: #0f172a;
    border-color: rgba(255,255,255,.08);
  }
`;

export const LegendDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
  background: ${(p) => p.$color || '#ddd'};
  border: 1px solid rgba(0,0,0,0.08);

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.08);
  }
`;

export const SectorDot = styled.span`
  width: 18px; height: 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  color: #fff;
  background: ${(p) => p.$color || '#9ca3af'};
`;

export const CostsChip = styled.button`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  &:hover { background: #f9fafb; }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
    &:hover { background: #0b1220; }
  }
`;

export const CommentBadge = styled.span`
  position: absolute;
  top: 2px; right: 2px;
  font-size: 9px;
  background: #111827; color: #fff;
  padding: 0 4px;
  border-radius: 6px;
  opacity: .9;
`;

// no seu style
export const TooltipBox = styled.div`
  background: #111827;
  color: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0,0,0,.25);
  max-width: 320px;         /* um pouco maior ajuda em textos longos */
  font-size: 12px;
  z-index: 1002;            /* acima de overlays comuns */
  word-break: break-word;    /* quebra palavras muito grandes */
`;


export const CommentBubble = styled.div`
  border-radius: 8px;
  padding: 6px 8px;
  flex: 1;
  color: inherit;
  background: #f3f4f6;

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
  }
`;
export const MenuBox = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0,0,0,.12);
  padding: 8px;
  z-index: 1100;
  max-height: calc(100vh - 24px); /* não ultrapassa a tela */
 overflow-y: auto;               /* habilita scroll vertical */
 overscroll-behavior: contain;   /* evita "puxar" o body junto */
 max-width: 320px;               /* opcional: evita estourar na largura */
 overflow-x: hidden; 

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 12px 28px rgba(2,6,23,.6);
  }
`;

export const MenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  border: 0;
  background: transparent;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  &:hover { background: #f3f4f6; }
  ${(p) => p.$active && css`
    background: #eef2ff;
    font-weight: 700;
  `}

  [data-theme="dark"] & {
    color: #e5e7eb;
    &:hover { background: rgba(255,255,255,.06); }
    ${(p) => p.$active && css`
      background: rgba(99,102,241,.18);
    `}
  }
`;

export const ColorsRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

export const ClearBtn = styled.button`
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  color: #374151;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
  &:hover { background: #e5e7eb; }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
    &:hover { background: #0a1020; }
  }
`;

export const ActionsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 1000;
`;

export const BaselineMark = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.$color || '#111827'};
  pointer-events: none;
`;
export const MyCommentsBtn = styled.button`
  margin-left: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  background: #dbeafe;     /* light */
  color: #1e40af;
  border: 1px solid #93c5fd;
  transition: background-color .2s ease, border-color .2s ease, color .2s ease,
              filter .15s ease, transform .05s ease;

  &:hover { filter: brightness(0.98); }
  &:active { transform: translateY(1px); }
  &:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }

  /* dark mode (sistema) */
  @media (prefers-color-scheme: dark) {
    background: #0b2a5b;
    border-color: #1d4ed8;
    color: #e5e7eb;
  }

  /* dark mode (classe global) */
  .dark &,
  [data-theme="dark"] & {
    background: #0b2a5b;
    border-color: #1d4ed8;
    color: #e5e7eb;
  }
`;
export const SearchWrap = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.14);
  background: #fff;
  color: #111827;
  min-width: 260px;

  svg { width: 16px; height: 16px; opacity: .7; flex-shrink: 0; }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: #334155;
  }
`;

export const SearchInput = styled.input`
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 13px;
  font-weight: 600;
  width: 100%;
  outline: none;

  &::placeholder { color: rgba(17,24,39,.55); }
  [data-theme="dark"] &::placeholder { color: rgba(229,231,235,.55); }
`;
