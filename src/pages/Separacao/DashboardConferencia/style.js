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

/* Toggle de idioma */

export const LangToggle = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.3);
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.35);
`;

export const LangButton = styled.button`
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  color: #0f172a;
  opacity: 0.7;
  transition: all 0.18s ease-out;

  .flag {
    font-size: 14px;
  }

  &[data-active="true"] {
    opacity: 1;
    background: #0f172a;
    color: #f9fafb;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
  }

  [data-theme="dark"] & &[data-active="true"] {
    background: #e5e7eb;
    color: #020617;
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
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
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
  [data-theme="dark"] & {
    color: #94a3b8;
  }
`;

export const ChartCard = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
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

/* células de % com barrinha proporcional */

const percentCellBase = `
  min-width: 130px;
  padding: 6px 12px;
  vertical-align: middle;

  .percent-bar {
    position: relative;
    width: 100%;
    height: 24px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.16); /* trilha cinza quase branca */
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 0 8px;
  }

  .percent-bar .fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    border-radius: 999px;
    transition: width 0.18s ease-out;
  }

  .percent-bar .label {
    position: relative;
    z-index: 1;
    font-size: 12px;
    font-weight: 600;
    margin-left: auto;
  }

  [data-theme="dark"] & .percent-bar {
    background: rgba(15, 23, 42, 0.9);
  }
`;

export const PercentPedidosCell = styled(TCell)`
  ${percentCellBase}

  .percent-bar.pedidos .fill {
    background: rgba(34, 211, 238, 0.45); /* cyan */
  }

  .percent-bar.pedidos .label {
    color: #0e7490;
  }

  [data-theme="dark"] & .percent-bar.pedidos .label {
    color: #e0f2fe;
  }
`;

export const PercentConfsCell = styled(TCell)`
  ${percentCellBase}

  .percent-bar.confs .fill {
    background: rgba(163, 230, 53, 0.45); /* lime */
  }

  .percent-bar.confs .label {
    color: #3f6212;
  }

  [data-theme="dark"] & .percent-bar.confs .label {
    color: #ecfccb;
  }
`;

export const PercentExpsCell = styled(TCell)`
  ${percentCellBase}

  .percent-bar.exps .fill {
    background: rgba(249, 115, 22, 0.45); /* orange */
  }

  .percent-bar.exps .label {
    color: #9a3412;
  }

  [data-theme="dark"] & .percent-bar.exps .label {
    color: #ffedd5;
  }
`;

export const LeadTimeGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const LeadTimeItem = styled.div`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  h4 {
    margin: 0 0 6px 0;
    font-size: 14px;
  }
  .value {
    font-size: 22px;
    font-weight: 800;
  }
  .hint {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }
  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6);
    .hint {
      color: #94a3b8;
    }
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
