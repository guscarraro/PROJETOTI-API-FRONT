import styled from "styled-components";

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(180px, 1fr));
  gap: 12px;

  @media (max-width: 1500px) {
    grid-template-columns: repeat(3, minmax(180px, 1fr));
  }
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const KpiCard = styled.div`
  border: 1px solid ${(p) => (p.$warn ? "rgba(245,158,11,0.55)" : p.$ok ? "rgba(34,197,94,0.40)" : "#e5e7eb")};
  background: ${(p) => (p.$warn ? "rgba(245,158,11,0.08)" : p.$ok ? "rgba(34,197,94,0.07)" : "#fff")};
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  transition: transform 120ms ease, box-shadow 120ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 46px rgba(15, 23, 42, 0.10);
  }

  [data-theme="dark"] & {
    background: ${(p) => (p.$warn ? "rgba(245,158,11,0.10)" : p.$ok ? "rgba(34,197,94,0.10)" : "#0b1220")};
    border-color: ${(p) => (p.$warn ? "rgba(245,158,11,0.55)" : p.$ok ? "rgba(34,197,94,0.45)" : "#334155")};
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
  }
`;

export const KpiTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const KpiTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 1000;
  font-size: 12px;
  color: var(--dre-text);

  svg {
    opacity: 0.9;
  }
`;

export const StatusPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 1000;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,184,0.35);
  color: var(--dre-text);
  background: rgba(148,163,184,0.10);

  ${(p) =>
    p.$tone === "warn" &&
    `
    border-color: rgba(245,158,11,0.55);
    background: rgba(245,158,11,0.12);
  `}

  ${(p) =>
    p.$tone === "ok" &&
    `
    border-color: rgba(34,197,94,0.45);
    background: rgba(34,197,94,0.10);
  `}

  ${(p) =>
    p.$tone === "info" &&
    `
    border-color: rgba(96,165,250,0.45);
    background: rgba(96,165,250,0.10);
  `}
`;

export const KpiValue = styled.div`
  margin-top: 10px;
  font-size: 18px;
  font-weight: 1000;
  color: var(--dre-text);
  letter-spacing: -0.2px;
`;

export const KpiHint = styled.div`
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.75;
  color: var(--dre-text);
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
  border: 1px solid rgba(148,163,184,0.35);
  background: rgba(148,163,184,0.10);
  color: var(--dre-text);
  font-weight: 1000;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    filter: brightness(1.05);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  [data-theme="dark"] & {
    background: rgba(2, 6, 23, 0.55);
    border-color: rgba(148,163,184,0.25);
  }
`;