import styled from 'styled-components';

export const ChartContainer = styled.div`
  margin-top: 20px;
  width: 100%;
  overflow-x: auto;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: rgba(255, 255, 255, 0.06);
  color: #fff;
`;

export const StyledTh = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background-color: #333;
  font-weight: bold;
`;

// Componente base para td
export const StyledTd = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
`;

// Colunas com cores específicas
export const TdAtrasadas = styled(StyledTd)`
  background-color: rgba(255, 0, 0, 0.2);
`;

export const TdHoje = styled(StyledTd)`
  background-color: rgba(255, 255, 0, 0.2);
`;

export const Td1Dia = styled(StyledTd)`
background-color: rgba(0, 255, 127, 0.2);
`;

export const Td2Dias = styled(StyledTd)`
background-color: rgba(255, 165, 0, 0.2);
`;

export const Td3Dias = styled(StyledTd)`
background-color: rgba(30, 144, 255, 0.2);
`;
