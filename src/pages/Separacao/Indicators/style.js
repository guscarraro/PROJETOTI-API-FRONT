import styled from "styled-components";

export const DesktopOnly = styled.div`
  display: block;
  @media (max-width: 768px) { display: none; }
`;

export const MobileOnly = styled.div`
  display: none;
  @media (max-width: 768px) { display: block; }
`;

export const Wrap = styled.section`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0 14px;
  flex-wrap: nowrap;
  @media (max-width: 1100px) { flex-wrap: wrap; }
`;

export const CardsRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex: 0 0 auto;
  & > div { min-width: 200px; max-width: 200px; }
  @media (max-width: 1100px) {
    flex: 1 1 100%;
    flex-wrap: wrap;
    & > div { flex: 1 1 220px; max-width: 100%; }
  }
`;

export const StatCard = styled.div`
  --card-bg: #fff;
  color: #0f172a;
  border-radius: 14px;
  padding: 12px;
  background: var(--card-bg);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  [data-theme="dark"] & {
    --card-bg: #0f172a;
    color: #fff;
    background: var(--card-bg);
    border-color: rgba(255, 255, 255, 0.11);
    box-shadow: 0 8px 24px rgba(2, 6, 23, 0.5);
  }
  &::before {
    content: "";
    display: block;
    width: 100%;
    height: 4px;
    border-radius: 999px;
    background: ${(p) => p.$color || "#6366f1"};
    margin-bottom: 10px;
    opacity: 0.9;
  }
`;

export const StatLabel = styled.div`
  font-size: 18px;
  opacity: 0.9;
`;

export const StatValue = styled.div`
  font-size: 75px;
  font-weight: 900;
  margin-top: 2px;
  line-height: 75px;
`;

export const PieCard = styled.div`
  --card-bg: #fff;
  --pie-bg: rgba(0, 0, 0, 0.05);
  color: #0f172a;
  flex: 1 1 auto;
  border-radius: 14px;
  padding: 12px;
  background: var(--card-bg);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  [data-theme="dark"] & {
    --card-bg: #0b1222;
    --pie-bg: rgba(255, 255, 255, 0.08);
    color: #fff;
    background: var(--card-bg);
    border-color: rgba(255, 255, 255, 0.11);
    box-shadow: 0 8px 24px rgba(2, 6, 23, 0.5);
  }
  @media (max-width: 1100px) { flex: 1 1 100%; }
`;

export const PieWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Legend = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 12px;
  margin-top: 8px;
`;

export const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.95;
`;

export const Dot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: ${(p) => p.$c || "#999"};
  border: 1px solid rgba(0, 0, 0, 0.15);
  [data-theme="dark"] & { border-color: rgba(255, 255, 255, 0.3); }
`;

/* ====== MOBILE (mantém o card único existente) ====== */
export const MobileCard = styled.div`
  --card-bg: #fff;
  --pie-bg-m: rgba(0, 0, 0, 0.08);
  color: #0f172a;
  border-radius: 14px;
  padding: 12px;
  background: var(--card-bg);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  [data-theme="dark"] & {
    --card-bg: #0f172a;
    --pie-bg-m: rgba(255, 255, 255, 0.14);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.11);
    box-shadow: 0 8px 24px rgba(2, 6, 23, 0.5);
  }
`;

export const MobileHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  strong { font-size: 16px; }
`;

export const MobileTotal = styled.div`
  font-size: 13px;
  opacity: 0.9;
  b { font-size: 16px; }
`;

export const MobileHint = styled.span`
  display: inline-block;
  font-size: 12px;
  opacity: 0.8;
  margin-left: 6px;
`;

export const MiniPieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;
export const MiniPieBtn = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 8px 6px;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
  ${(p) =>
    p.$active &&
    `box-shadow: 0 0 0 2px rgba(96,165,250,.35) inset; border-color: rgba(96,165,250,.6);`}
  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.12);
    &:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  }
`;

export const MiniPieSvg = styled.svg`
  width: 64px;
  height: 64px;
  .bg {
    fill: none;
    stroke: var(--pie-bg-m);
  }
  .ring {
    fill: none;
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
`;

export const MiniPieCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  .n {
    font-weight: 900;
    font-size: 18px;
    line-height: 1;
  }
`;
