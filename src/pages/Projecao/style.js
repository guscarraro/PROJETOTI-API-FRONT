import styled from "styled-components";

/* Fundo 100% transparente */
export const Page = styled.div`
  --card: #ffffff;
  --muted: #64748b;
  --text: #0f172a;
  --pos: #16a34a;
  --neg: #dc2626;

  background: transparent;
  color: var(--text);
  min-height: 100vh;
  padding: 12px 12px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans";
`;

/* Área que será exportada como PNG */
export const ExportArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/* Barra de ação (fora da imagem exportada) */
export const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const DownloadButton = styled.button`
  appearance: none;
  border: 1px solid rgba(0,0,0,.08);
  background: #0ea5e9;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(14,165,233,.2);
  transition: transform .04s ease, box-shadow .2s ease, opacity .2s ease;
  &:hover { box-shadow: 0 8px 22px rgba(14,165,233,.3); opacity: .95; }
  &:active { transform: translateY(1px); }
`;

export const HeaderRow = styled.div`
  display: flex;
  gap: 24px;
  align-items: stretch;
  flex-wrap: nowrap;
  justify-content: flex-end;

  @media (max-width: 1000px) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
`;

export const MetricGroup = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 16px;

  @media (max-width: 820px) {
    grid-auto-flow: row;
  }
`;

export const Metric = styled.div`
  background: var(--card);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const MetricTitle = styled.div`
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
`;

export const MetricValue = styled.div`
  font-size: clamp(22px, 3.2vw, 34px);
  font-weight: 800;
  line-height: 1.1;
`;

export const MetricCaption = styled.div`
  font-size: 14px;
  color: var(--muted);
`;

export const YearGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const YearCard = styled.div`
  background: var(--card);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const YearTitle = styled.div`
  font-weight: 800;
  letter-spacing: 0.06em;
  font-size: 13px;
  text-transform: uppercase;
  color: var(--text);
`;

export const YearRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;

  span {
    color: var(--muted);
    font-size: 14px;
  }
  strong {
    font-weight: 800;
    font-size: 16px;
  }
`;

export const DeltaBadge = styled.div`
  align-self: flex-end;
  margin-top: 2px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  background: ${({ $pos }) => ($pos ? "rgba(22,163,74,.1)" : "rgba(220,38,38,.1)")};
  color: ${({ $pos }) => ($pos ? "var(--pos)" : "var(--neg)")};
  border: 1px solid ${({ $pos }) => ($pos ? "rgba(22,163,74,.25)" : "rgba(220,38,38,.25)")};
`;

export const ChartCard = styled.div`
  background: var(--card);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 16px 18px 10px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
`;

export const ChartTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin: 4px 0 8px;
  color: var(--text);
`;

export const Footnote = styled.div`
  font-size: 18px;
  color: #fff;
  margin-top: -8px;
`;
