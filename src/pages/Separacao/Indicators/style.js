import styled from "styled-components";

/**
 * Notas de tema:
 * - Tudo herda `color` do card. No light: #0f172a; no dark: #fff.
 * - Variáveis CSS por card:
 *   --card-bg: fundo do card (usada no “furo” da pizza)
 *   --pie-bg: tom leve do anel de fundo da pizza
 */

export const Wrap = styled.section`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0 14px;
  flex-wrap: nowrap;

  @media (max-width: 1100px) {
    flex-wrap: wrap;
  }
`;

export const CardsRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex: 0 0 auto;

  & > div {
    min-width: 200px;
    max-width: 200px;
  }

  @media (max-width: 1100px) {
    flex: 1 1 100%;
    flex-wrap: wrap;
    & > div {
      flex: 1 1 220px;
      max-width: 100%;
    }
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
    --card-bg: #0b1222; /* ligeiramente diferente para destacar a pizza */
    --pie-bg: rgba(255, 255, 255, 0.08);
    color: #fff;
    background: var(--card-bg);
    border-color: rgba(255, 255, 255, 0.11);
    box-shadow: 0 8px 24px rgba(2, 6, 23, 0.5);
  }

  @media (max-width: 1100px) {
    flex: 1 1 100%;
  }
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

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.3);
  }
`;
