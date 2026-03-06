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

export const CustomTooltipContainer = styled.div`
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(148,163,184,0.35);
  background: rgba(2,6,23,0.55);
  color: #e5e7eb;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 18px 60px rgba(0,0,0,0.30);
  min-width: 200px;
`;

export const TooltipTitle = styled.div`
  font-weight: 1000;
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 6px;
`;

export const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  margin: 4px 0;
`;

export const TooltipLabel = styled.span`
  opacity: 0.8;
`;

export const TooltipValue = styled.span`
  font-weight: 1000;
`;

export const TooltipHighlight = styled.div`
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(255,255,255,0.2);
  font-weight: 1000;
  font-size: 14px;
  text-align: right;
`;

// Novos componentes para as tabelas laterais
export const TableContainer = styled.div`
  max-height: 280px;
  overflow-y: auto;
  margin: 12px 16px 16px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(0, 0, 0, 0.02);

  [data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.02);
  }
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
`;

export const TableHeader = styled.th`
  text-align: left;
  padding: 8px 10px;
  background: rgba(148, 163, 184, 0.08);
  color: var(--dre-text);
  font-weight: 1000;
  position: sticky;
  top: 0;
  z-index: 1;

  [data-theme="dark"] & {
    background: rgba(148, 163, 184, 0.12);
  }
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(148, 163, 184, 0.05);
  }
`;

export const TableCell = styled.td`
  padding: 6px 10px;
  color: var(--dre-text);
`;

export const TableCellRight = styled(TableCell)`
  text-align: right;
  font-weight: 600;
`;

export const TotalRow = styled(TableRow)`
  background: rgba(59, 130, 246, 0.08);
  font-weight: 1000;
  border-top: 2px solid rgba(59, 130, 246, 0.3);
  
  [data-theme="dark"] & {
    background: rgba(59, 130, 246, 0.15);
  }
`;

export const ColorDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 6px;
  background: ${props => props.color || '#3b82f6'};
`;