import styled, { css } from "styled-components";


export const Page = styled.div`
padding: 24px;
background: #f1f1f1;
min-height: 100vh;
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
`;


export const DaysScroller = styled.div`
  overflow-x: auto;
`;




export const H1 = styled.h1`
font-size: 28px;
font-weight: 800;
letter-spacing: 0.3px;
display: flex;
gap: 12px;
align-items: center;
`;


export const CardGrid = styled.div`
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 16px;
`;


export const Card = styled.div`
position: relative;
border-radius: 16px;
background: #fff;
box-shadow: 0 8px 24px rgba(0,0,0,0.08);
padding: 18px;
cursor: pointer;
transition: transform .15s ease, box-shadow .15s ease;
&:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.12);}
`;

export const Badge = styled.span`
padding: 4px 10px;
border-radius: 999px;
font-size: 12px;
font-weight: 700;
${(p) => p.$variant === 'andamento' && css`background: rgba(16,185,129,.12); color: #047857;`}
${(p) => p.$variant === 'standby' && css`background: rgba(245,158,11,.12); color: #92400e;`}
${(p) => p.$variant === 'cancelado' && css`background: rgba(239,68,68,.12); color: #991b1b;`}
`;


export const Muted = styled.small`
color: #6b7280;
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
`;


export const FirstColRow = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
height: 36px;
padding: 0px 12px;
border-bottom: 1px solid #f3f4f6;
`;


export const BodyScroller = styled.div`
  overflow-x: auto;
  background: #fff;
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
`;


export const DayCell = styled.button`
position: relative;
width: 40px; height: 36px;
border: none; outline: none;
background: ${(p) => p.$weekend ? "#111827" : "#ffffff"};
cursor: ${(p) => p.$weekend ? "not-allowed" : "pointer"};
${(p) => p.$weekend && css`color:#9ca3af;`}
&:hover { ${(p) => !p.$weekend && css`box-shadow: inset 0 0 0 2px #d1d5db;`} }
${(p) => p.$color && css`
background: ${p.$color};
opacity: 0.9;
`}
`;


export const Palette = styled.div`
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.14);
  padding: 10px;
  z-index: 1000;

  .palette-textarea {
    width: 100%;
    resize: vertical;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 12px;
  }
`;


export const ColorDot = styled.button`
width: 18px; height: 18px; border-radius: 999px; border: 1px solid #e5e7eb;
background: ${(p) => p.$color}; cursor: pointer;
`;


export const FooterBar = styled.div`
display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px;
`;










// 👉 GARANTA que TimelineWrap tenha as variáveis de altura dos headers
export const TimelineWrap = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;

  /* alturas do header */
  --monthsH: 28px;
  --daysH: 32px;
`;

/* Grade principal: coluna fixa (280px) + área rolável à direita */
export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
`;

/* Cabeçalho da coluna fixa */
export const FixedColHeader = styled.div`
  padding: 18px 12px;
  font-weight: 700;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 3;
`;

/* Espaço à esquerda para alinhar com as duas linhas de header (meses + dias) */
export const LeftHeaderSpacer = styled.div`
  height: calc(var(--monthsH) + var(--daysH));
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
`;

/* Scroller ÚNICO da direita (horizontal + vertical) */
export const RightScroller = styled.div`
   overflow: auto;
   background: #fff;
   position: relative;
   padding-bottom: 16px;        
`;

/* Camada “colada” no topo do RightScroller (não ocupa fluxo) */
export const HeaderLayer = styled.div`
  position: sticky;
  top: 0;
  z-index: 3;
`;

/* Barra de meses (cada mês pode ter uma cor levemente diferente) */
export const MonthsRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 40px;
  height: var(--monthsH);
  border-bottom: 1px solid #e5e7eb;
`;

/* Célula de mês com fundo variável */
export const MonthCell = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 0;
  background: ${(p) => p.$bg || 'rgba(96,165,250,0.15)'}; /* tom default */
`;

/* Linha dos dias (logo abaixo da barra de meses) */
export const DaysRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 40px;
`;

/* Cabeçalho do dia */
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
`;

// ——— Legend / Descritivo de cores ———
export const LegendBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
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
`;

export const LegendDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
  background: ${(p) => p.$color || '#ddd'};
  border: 1px solid rgba(0,0,0,0.08);
`;
// ——— Chips/menus extras ———
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
`;

// Badge “OBS” no canto da célula
export const CommentBadge = styled.span`
  position: absolute;
  top: 2px; right: 2px;
  font-size: 9px;
  background: #111827; color: #fff;
  padding: 0 4px;
  border-radius: 6px;
  opacity: .9;
`;

// Tooltip moderno para comentários
export const TooltipBox = styled.div`
  background: #111827; color: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0,0,0,.25);
  max-width: 260px;
  font-size: 12px;
  z-index: 80;
`;

// Menu genérico (setores)
export const MenuBox = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0,0,0,.12);
  padding: 8px;
  z-index: 70;
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
   ${(p)=>p.$active && css`
   background: #eef2ff;
   font-weight: 700;
 `}
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
  background: transparent; /* invisível, apenas capta o clique */
  z-index: 60; /* abaixo da Palette(70) e MenuBox(70), acima do resto */
`;
export const BaselineMark = styled.span`
  position: absolute;
  left: 4px;
  bottom: 4px;
  width: 10px;
  height: 10px;
  transform: rotate(45deg);         /* losango */
  background: ${(p) => p.$color || '#111827'};
  opacity: 0.9;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.15);
`;
