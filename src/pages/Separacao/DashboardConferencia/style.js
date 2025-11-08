import styled from "styled-components";
import { TitleBar } from "../../Projetos/style";

/* Layout base / containers */
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

export const RightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
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
  &:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,.3); }
  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.12);
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
  &:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,.3); }
  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.12);
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 12px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const KPI = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
  }
`;

export const KPIValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
`;

export const KPILabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  [data-theme="dark"] & { color: #94a3b8; }
`;

export const ChartCard = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
  }
`;

export const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 2px 0 10px 0;
`;

export const TableCard = styled(ChartCard)`
  padding: 0;
  overflow: hidden;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th, td {
    padding: 10px 12px;
    text-align: left;
  }
  thead tr {
    background: #f9fafb;
    [data-theme="dark"] & { background: #0b1220; }
  }
  tbody tr + tr td { border-top: 1px solid #eee; }
  [data-theme="dark"] & tbody tr + tr td { border-color: rgba(255,255,255,.08); }
`;

export const THead = styled.thead``;
export const TRow = styled.tr``;
export const TCell = styled.td``;

export const LeadTimeGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

export const LeadTimeItem = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  h4 { margin: 0 0 6px 0; font-size: 14px; }
  .value { font-size: 22px; font-weight: 800; }
  .hint { font-size: 12px; color: #6b7280; margin-top: 2px; }
  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
    .hint { color: #94a3b8; }
  }
`;

/* rankings lado a lado */
export const RankingsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;
