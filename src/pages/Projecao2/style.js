import styled from "styled-components";

/* Layout base */
export const Content = styled.div`
  padding: 16px;
  @media (min-width: 769px) {
    padding-top: 16px;
    padding-right: 16px;
  }
  @media (max-width: 768px) {
    padding: 12px 12px 16px;
  }
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
  }
`;

export const TitleBarWrap = styled(TitleBar)`
  @media (max-width: 768px) {
    margin-top: 4px;
    padding-left: 0;
    padding-right: 0;
  }
  @media (min-width: 769px) {
    padding-left: 0;
    padding-right: 0;
  }
`;

export const H1 = styled.h1`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-family: "Inter", "Poppins", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: #111827;

  &::before {
    content: "";
    width: 8px;
    height: 26px;
    border-radius: 6px;
    background: ${(p) => p.$accent || "#2563eb"};
    display: inline-block;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
  }

  @media (max-width: 768px) {
    font-size: 22px;
    &::before {
      height: 20px;
    }
  }
`;

export const RightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: end;
  flex-wrap: wrap;

  & > div {
    min-width: 160px;
  }
`;

export const TinyLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  [data-theme="dark"] & {
    color: #94a3b8;
  }
`;

export const Field = styled.input`
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  border-radius: 10px;
  height: 34px;
  padding: 0 10px;
  outline: none;
  width: 100%;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
  }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

export const Select = styled.select`
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  border-radius: 10px;
  height: 34px;
  padding: 0 10px;
  outline: none;
  width: 100%;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
  }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

export const DividerRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 10px;
`;

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(148, 163, 184, 0.12);
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;

  svg {
    opacity: 0.9;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(15, 23, 42, 0.85);
  }
`;

export const Muted = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
  [data-theme="dark"] & {
    color: #94a3b8;
  }
`;

/* splits (Operação / WMS) */
export const SplitRow = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 12px;
  margin-top: 10px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const SplitLeft = styled.div``;
export const SplitRight = styled.div``;

/* KPI cards */
export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 10px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const KPI = styled.div`
  position: relative;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 14px;
  padding: 12px 12px 12px 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  overflow: hidden;

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
  }
`;

export const KPIIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  background: ${(p) =>
    p.$tone === "danger"
      ? "rgba(239, 68, 68, 0.14)"
      : p.$tone === "warn"
      ? "rgba(249, 115, 22, 0.16)"
      : p.$tone === "ok"
      ? "rgba(163, 230, 53, 0.16)"
      : "rgba(34, 211, 238, 0.14)"};

  border: 1px solid
    ${(p) =>
      p.$tone === "danger"
        ? "rgba(239, 68, 68, 0.28)"
        : p.$tone === "warn"
        ? "rgba(249, 115, 22, 0.26)"
        : p.$tone === "ok"
        ? "rgba(163, 230, 53, 0.26)"
        : "rgba(34, 211, 238, 0.26)"};

  svg {
    font-size: 18px;
    color: ${(p) =>
      p.$tone === "danger"
        ? "#ef4444"
        : p.$tone === "warn"
        ? "#f97316"
        : p.$tone === "ok"
        ? "#65a30d"
        : "#0891b2"};
  }

  [data-theme="dark"] & {
    background: rgba(2, 6, 23, 0.65);
    border-color: rgba(255, 255, 255, 0.08);
    svg {
      color: #e5e7eb;
      opacity: 0.9;
    }
  }
`;

export const KPIValue = styled.div`
  font-size: 24px;
  font-weight: 900;
  line-height: 1.1;
`;

export const KPILabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  font-weight: 800;

  [data-theme="dark"] & {
    color: #94a3b8;
  }
`;

export const KPIHint = styled.div`
  font-size: 11px;
  margin-top: 2px;
  color: rgba(107, 114, 128, 0.85);
  font-weight: 700;

  [data-theme="dark"] & {
    color: rgba(148, 163, 184, 0.85);
  }
`;

export const KPITrendRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

export const TrendPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;

  background: ${(p) =>
    p.$tone === "danger"
      ? "rgba(239, 68, 68, 0.12)"
      : p.$tone === "warn"
      ? "rgba(249, 115, 22, 0.12)"
      : "rgba(34, 211, 238, 0.12)"};

  border: 1px solid
    ${(p) =>
      p.$tone === "danger"
        ? "rgba(239, 68, 68, 0.26)"
        : p.$tone === "warn"
        ? "rgba(249, 115, 22, 0.24)"
        : "rgba(34, 211, 238, 0.22)"};

  color: ${(p) =>
    p.$tone === "danger"
      ? "#b91c1c"
      : p.$tone === "warn"
      ? "#9a3412"
      : "#0e7490"};

  svg {
    opacity: 0.95;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
    background: rgba(2, 6, 23, 0.55);
    border-color: rgba(255, 255, 255, 0.08);
  }
`;

/* Chart cards */
export const ChartCard = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  margin-top: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
  }
`;

export const ChartTitle = styled.h3`
  font-size: 15px;
  font-weight: 900;
  margin: 2px 0 10px 0;
`;

/* progress occupancy */
export const ProgressWrap = styled.div`
  width: 100%;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.18);

  [data-theme="dark"] & {
    background: rgba(2, 6, 23, 0.7);
  }
`;

export const ProgressBar = styled.div`
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.85), rgba(249, 115, 22, 0.75));
  transition: width 0.2s ease-out;
`;

export const ProgressLegend = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 800;

  [data-theme="dark"] & {
    color: #94a3b8;
  }

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

export const LegendDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-right: 8px;
  background: ${(p) => (p.$tone === "danger" ? "#ef4444" : "#84cc16")};
`;

/* Alerts */
export const AlertGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const AlertCard = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
  }
`;

export const AlertTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 8px;

  svg {
    opacity: 0.95;
  }
`;

export const AlertValue = styled.div`
  font-size: 28px;
  font-weight: 950;
  line-height: 1;

  color: ${(p) => (p.$tone === "danger" ? "#ef4444" : p.$tone === "warn" ? "#f97316" : "#16a34a")};

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const AlertList = styled.div`
  margin-top: 10px;
  display: grid;
  gap: 8px;
`;

export const AlertItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;

  background: ${(p) =>
    p.$tone === "danger" ? "rgba(239, 68, 68, 0.08)" : "rgba(249, 115, 22, 0.08)"};

  border: 1px solid
    ${(p) =>
      p.$tone === "danger" ? "rgba(239, 68, 68, 0.22)" : "rgba(249, 115, 22, 0.18)"};

  .left {
    display: grid;
    gap: 2px;
  }

  .sku {
    font-size: 12px;
    font-weight: 900;
    opacity: 0.9;
  }

  .desc {
    font-size: 13px;
    font-weight: 800;
  }

  .meta {
    font-size: 11px;
    font-weight: 700;
    color: rgba(107, 114, 128, 0.95);

    [data-theme="dark"] & {
      color: rgba(148, 163, 184, 0.9);
    }
  }

  .badge {
    height: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;

    color: ${(p) => (p.$tone === "danger" ? "#b91c1c" : "#9a3412")};

    background: rgba(255, 255, 255, 0.55);

    [data-theme="dark"] & {
      background: rgba(2, 6, 23, 0.55);
      color: #e5e7eb;
    }
  }

  [data-theme="dark"] & {
    background: rgba(2, 6, 23, 0.55);
    border-color: rgba(255, 255, 255, 0.08);
  }
`;

/* Table */
export const TableCard = styled(ChartCard)`
  padding: 0;
  overflow: hidden;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
  }

  thead tr {
    background: linear-gradient(90deg, #f9fafb, #eef2ff);
    [data-theme="dark"] & {
      background: linear-gradient(90deg, #020617, #0b1220);
    }
  }

  thead th {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #6b7280;
    font-weight: 900;
    [data-theme="dark"] & {
      color: #9ca3af;
    }
  }

  tbody tr {
    transition: background 0.12s ease-out;
  }

  tbody tr + tr td {
    border-top: 1px solid #e5e7eb;
  }

  tbody tr:hover td {
    background: rgba(148, 163, 184, 0.08);
    [data-theme="dark"] & {
      background: rgba(30, 64, 175, 0.35);
    }
  }

  [data-theme="dark"] & tbody tr + tr td {
    border-color: rgba(255, 255, 255, 0.08);
  }
`;

export const THead = styled.thead``;
export const TRow = styled.tr``;
export const TCell = styled.td``;

/* Grid 2 col */
export const RankingsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;