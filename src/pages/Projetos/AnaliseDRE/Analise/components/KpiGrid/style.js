import styled from "styled-components";

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;

  @media (max-width: 1300px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const KpiCard = styled.div`
  border: 1px solid ${(p) => (p.$warn ? "rgba(245,158,11,0.5)" : "#e5e7eb")};
  background: ${(p) => (p.$warn ? "rgba(245,158,11,0.08)" : "#fff")};
  border-radius: 14px;
  padding: 12px;

  [data-theme="dark"] & {
    background: ${(p) => (p.$warn ? "rgba(245,158,11,0.10)" : "#0b1220")};
    border-color: ${(p) => (p.$warn ? "rgba(245,158,11,0.5)" : "#334155")};
  }
`;

export const KpiTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
  font-size: 12px;
  opacity: 0.9;
`;

export const KpiValue = styled.div`
  margin-top: 8px;
  font-size: 18px;
  font-weight: 1000;
`;

export const KpiHint = styled.div`
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.7;
`;

export const KpiBtnRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 8px;
`;

export const KpiBtn = styled.button`
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  [data-theme="dark"] & {
    background: #020617;
    border-color: #334155;
    color: #e5e7eb;
  }
`;