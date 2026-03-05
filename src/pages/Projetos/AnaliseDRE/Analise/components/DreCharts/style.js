import styled from "styled-components";

/**
 * Card com topo ondulado:
 * - base quadrada: border-radius em baixo = 0
 * - topo ondulado: strip com mask-wave
 */
export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 12px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const WavyCard = styled.div`
  --card-bg: rgba(255, 255, 255, 0.92);
  --card-border: rgba(148, 163, 184, 0.25);

  position: relative;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);

  /* topo arredondado, base quadrada */
  border-radius: 16px 16px 0 0;
  overflow: hidden;

  [data-theme="dark"] & {
    --card-bg: rgba(11, 18, 32, 0.86);
    --card-border: rgba(148, 163, 184, 0.18);
    box-shadow: 0 26px 90px rgba(0, 0, 0, 0.35);
  }

  /* strip ondulado no topo */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 18px;
    width: 100%;
    background: var(--card-bg);
    z-index: 2;


  }

  /* empurra conteúdo para não ficar “atrás” da onda */
  > * {
    position: relative;
    z-index: 3;
  }
`;

export const CardHead = styled.div`
  padding: 22px 14px 10px 14px; /* 22 por conta do strip */
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
`;

export const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 1000;
  color: var(--dre-text);

  svg {
    opacity: 0.9;
  }
`;

export const CardSub = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: var(--dre-muted);
`;

export const Hint = styled.div`
  font-size: 12px;
  color: var(--dre-muted);
`;