import styled from "styled-components";

const tone = {
  ok: "#22c87a",
  danger: "#f5524a",
  warn: "#f0a830",
  info: "#4d8ef5",
  purple: "#9b74f5",
};

export const Content = styled.div`
  padding: 24px;
  color: #f0f2f8;

  @media (max-width: 768px) {
    padding: 14px;
  }
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

export const TitleBarWrap = styled(TitleBar)``;

export const H1 = styled.h1`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 6px;
  font-size: 22px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: #f0f2f8;

  &::before {
    content: "";
    width: 7px;
    height: 24px;
    border-radius: 999px;
    background: ${(p) => p.$accent || "#22c87a"};
    box-shadow: 0 0 18px ${(p) => p.$accent || "#22c87a"};
  }

  @media (max-width: 768px) {
    font-size: 19px;
  }
`;

export const RightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const FiltersRow = styled.div`
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;

  & > div {
    min-width: 170px;
  }
`;

export const TinyLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #8b92a8;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const Field = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 11px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #14171f;
  color: #f0f2f8;
  outline: none;

  &:focus {
    border-color: rgba(77, 142, 245, 0.65);
    box-shadow: 0 0 0 3px rgba(77, 142, 245, 0.14);
  }
`;

export const Select = styled.select`
  width: 100%;
  height: 36px;
  padding: 0 11px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #14171f;
  color: #f0f2f8;
  outline: none;

  &:focus {
    border-color: rgba(77, 142, 245, 0.65);
    box-shadow: 0 0 0 3px rgba(77, 142, 245, 0.14);
  }
`;

export const DividerRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin: 14px 0 20px;
`;

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(20, 23, 31, 0.92);
  color: #f0f2f8;
  font-size: 12px;
  font-weight: 700;

  svg {
    color: #22c87a;
  }
`;

export const Muted = styled.div`
  font-size: 12px;
  color: #8b92a8;
  font-weight: 500;

  strong {
    color: #f0f2f8;
  }
`;

export const SplitRow = styled.div`
  display: grid;
  grid-template-columns: 1.45fr 0.9fr;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const SplitLeft = styled.div``;
export const SplitRight = styled.div``;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 18px 0 8px;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const KPI = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  padding: 18px 20px;
  background: #14171f;
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: border-color 0.18s ease, transform 0.18s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(34, 200, 122, 0.9),
      transparent
    );
  }
`;

export const KPIIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: ${(p) =>
    p.$tone === "danger"
      ? "rgba(245,82,74,0.11)"
      : p.$tone === "warn"
        ? "rgba(240,168,48,0.12)"
        : p.$tone === "ok"
          ? "rgba(34,200,122,0.12)"
          : "rgba(77,142,245,0.12)"};

  svg {
    font-size: 18px;
    color: ${(p) => tone[p.$tone] || tone.info};
  }
`;

export const KPIValue = styled.div`
  font-size: 25px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #f0f2f8;
`;

export const KPILabel = styled.div`
  margin-top: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #8b92a8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const KPIHint = styled.div`
  margin-top: 5px;
  font-size: 12px;
  color: #555d72;
  font-weight: 500;
`;

export const KPITrendRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 11px;
  flex-wrap: wrap;
`;

export const TrendPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;

  color: ${(p) =>
    p.$tone === "danger"
      ? "#f5524a"
      : p.$tone === "warn"
        ? "#f0a830"
        : "#22c87a"};

  background: ${(p) =>
    p.$tone === "danger"
      ? "rgba(245,82,74,0.1)"
      : p.$tone === "warn"
        ? "rgba(240,168,48,0.1)"
        : "rgba(34,200,122,0.1)"};

  border: 1px solid
    ${(p) =>
      p.$tone === "danger"
        ? "rgba(245,82,74,0.2)"
        : p.$tone === "warn"
          ? "rgba(240,168,48,0.2)"
          : "rgba(34,200,122,0.2)"};
`;

export const ChartCard = styled.div`
  border-radius: 14px;
  padding: 22px 24px;
  background: #14171f;
  border: 1px solid rgba(255, 255, 255, 0.07);
  margin-top: 16px;
`;

export const ChartTitle = styled.h3`
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: 700;
  color: #f0f2f8;
`;

export const ProgressWrap = styled.div`
  width: 100%;
  height: 13px;
  border-radius: 999px;
  overflow: hidden;
  background: #1c2030;
`;

export const ProgressBar = styled.div`
  height: 100%;
  border-radius: 999px;
  background: #22c87a;
  transition: width 0.25s ease;
`;

export const ProgressLegend = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 11px;
  font-size: 12px;
  color: #8b92a8;
  font-weight: 600;

  div {
    display: inline-flex;
    align-items: center;
  }

  strong {
    color: #f0f2f8;
  }

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

export const LegendDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  margin-right: 7px;
  background: ${(p) => p.$color || "#22c87a"};
`;

export const AlertGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const AlertCard = styled.div`
  border-radius: 14px;
  padding: 20px 22px;
  background: #14171f;
  border: 1px solid rgba(255, 255, 255, 0.07);
`;

export const AlertTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #8b92a8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const AlertValue = styled.div`
  font-size: 24px;
  line-height: 1.15;
  font-weight: 700;
  color: #f0f2f8;
`;

export const AlertList = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 14px;
`;

export const AlertItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  color: #8b92a8;
  font-size: 13px;
  line-height: 1.45;

  svg {
    flex: 0 0 auto;
    margin-top: 2px;
    color: #22c87a;
  }
`;

export const TableCard = styled(ChartCard)`
  padding: 0;
  overflow: hidden;

  ${ChartTitle} {
    padding: 20px 24px 8px;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: #555d72;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }

  td {
    padding: 13px 24px;
    font-size: 13px;
    color: #f0f2f8;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    transition: background 0.15s ease;
  }

  tbody tr:hover td {
    background: rgba(255, 255, 255, 0.025);
  }

  @media (max-width: 800px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
`;

export const THead = styled.thead``;
export const TRow = styled.tr``;
export const TCell = styled.td``;

export const RankingsRow = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;