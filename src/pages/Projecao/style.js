// src/pages/Projecao/style.js
import styled, { css } from "styled-components";

/* ===== Layout geral ===== */
export const Page = styled.div`
  --topbar-h: 56px;
  --nav-collapsed: 64px;
  --content-gap-left: clamp(8px, 1vw, 12px);

  --page-bg-start: #f8fafc;
  --page-bg-end: #f3f4f6;
  --accent-1: 96, 165, 250;
  --accent-2: 59, 130, 246;

  position: relative;
  isolation: isolate;
  min-height: 100dvh;

  padding: clamp(16px, 2.5vw, 28px);
  padding-left: calc(var(--nav-collapsed) + var(--content-gap-left));

  background:
    radial-gradient(1200px 600px at -10% -10%, rgba(var(--accent-1), .10), transparent 60%),
    radial-gradient(1000px 500px at 110% -20%, rgba(var(--accent-2), .08), transparent 55%),
    linear-gradient(180deg, var(--page-bg-start) 0%, var(--page-bg-end) 100%);

  &::before{
    content: "";
    position: fixed; inset: 0;
    pointer-events: none;
    background:
      linear-gradient(to right, rgba(17, 24, 39, .08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(17, 24, 39, .08) 1px, transparent 1px);
    background-size: 24px 24px, 24px 24px;
    z-index: 0;
  }

  > * { position: relative; z-index: 1; }

  [data-theme="dark"] & {
    --page-bg-start: #0b1220;
    --page-bg-end: #0e1424;

    &::before{
      background:
        linear-gradient(to right, rgba(255,255,255,.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,.12) 1px, transparent 1px);
      background-size: 24px 24px, 24px 24px;
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
    padding-top: calc(var(--topbar-h) + 12px);
  }
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
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

  &::before{
    content: "";
    width: 8px;
    height: 26px;
    border-radius: 6px;
    background: #2563eb;
    display: inline-block;
  }

  [data-theme="dark"] & { color: #e5e7eb; }

  @media (max-width: 768px) {
    font-size: 22px;
    &::before{ height: 20px; }
  }
`;

/* ===== Tabs ===== */
export const TabsRow = styled.div`
  display: inline-flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

export const TabBtn = styled.button`
  border: 1px solid rgba(15,23,42,.14);
  background: rgba(255,255,255,.85);
  color: #0b1220;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover { filter: brightness(0.98); }
  &:active { transform: translateY(1px); }

  ${(p) => p.$active && css`
    border-color: rgba(37,99,235,.35);
    background: rgba(37,99,235,.10);
    color: #1d4ed8;
  `}

  [data-theme="dark"] & {
    background: rgba(15,23,42,.7);
    color: #e5e7eb;
    border-color: rgba(255,255,255,.12);

    ${(p) => p.$active && css`
      background: rgba(37,99,235,.16);
      border-color: rgba(37,99,235,.35);
      color: #93c5fd;
    `}
  }
`;

/* ===== Section ===== */
export const Section = styled.section`
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    box-shadow: 0 8px 24px rgba(2,6,23,0.45);
    border: 1px solid rgba(255,255,255,.06);
  }

  @media (max-width: 768px) {
    border-radius: 12px;
    padding: 12px;
  }
`;

/* ===== Filtros ===== */
export const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(170px, 1fr));
  gap: 12px;
  align-items: end;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(170px, 1fr));
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: #374151;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  [data-theme="dark"] & { color: #cbd5e1; }
`;

export const Input = styled.input`
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.14);
  background: #fff;
  color: #111827;
  font-weight: 700;
  outline: none;

  &:focus {
    border-color: rgba(96,165,250,.75);
    box-shadow: 0 0 0 3px rgba(96,165,250,.28);
  }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: #334155;
  }
`;

export const Select = styled.select`
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.14);
  background: #fff;
  color: #111827;
  font-weight: 800;
  outline: none;

  &:focus {
    border-color: rgba(96,165,250,.75);
    box-shadow: 0 0 0 3px rgba(96,165,250,.28);
  }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: #334155;
  }
`;

/* ===== KPIs ===== */
export const InfoGrid = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 1100px){ grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

export const InfoItem = styled.div`
  border-radius: 14px;
  padding: 12px;
  border: 1px solid rgba(15,23,42,.10);
  background: rgba(255,255,255,.75);

  ${(p) => p.$variant === "run" && css`
    background: rgba(37,99,235,.12);
    border-color: rgba(37,99,235,.22);
  `}
  ${(p) => p.$variant === "prog" && css`
    background: rgba(245,158,11,.14);
    border-color: rgba(245,158,11,.22);
  `}
  ${(p) => p.$variant === "done" && css`
    background: rgba(16,185,129,.14);
    border-color: rgba(16,185,129,.22);
  `}

  [data-theme="dark"] & {
    background: rgba(15,23,42,.45);
    border-color: rgba(255,255,255,.08);

    ${(p) => p.$variant === "run" && css`
      background: rgba(37,99,235,.18);
      border-color: rgba(37,99,235,.22);
    `}
    ${(p) => p.$variant === "prog" && css`
      background: rgba(245,158,11,.20);
      border-color: rgba(245,158,11,.24);
    `}
    ${(p) => p.$variant === "done" && css`
      background: rgba(16,185,129,.20);
      border-color: rgba(16,185,129,.24);
    `}
  }
`;

export const KpiTitle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 1000;
  color: rgba(11,18,32,.85);

  [data-theme="dark"] & {
    color: rgba(229,231,235,.88);
  }
`;

export const KpiValue = styled.div`
  margin-top: 8px;
  font-size: 22px;
  font-weight: 1000;
  color: #0b1220;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

/* ===== Cards ===== */
export const CardGrid = styled.div`
  margin-top: 14px;
  display: grid;
  max-width:100%;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 14px;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

export const TripCard = styled.div`
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;

  border: 1px solid rgba(15,23,42,.14);
  border-left: 10px solid rgba(37,99,235,.85);
  box-shadow: 0 10px 26px rgba(0,0,0,0.09);

  background: rgba(37,99,235,.10);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 34px rgba(0,0,0,0.12);
  }

  ${(p) => p.$variant === "prog" && css`
    background: rgba(245,158,11,.14);
    border-left-color: rgba(245,158,11,.95);
  `}
  ${(p) => p.$variant === "run" && css`
    background: rgba(37,99,235,.12);
    border-left-color: rgba(37,99,235,.95);
  `}
  ${(p) => p.$variant === "done" && css`
    background: rgba(16,185,129,.14);
    border-left-color: rgba(16,185,129,.95);
  `}

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.10);
    box-shadow: 0 10px 28px rgba(2,6,23,.55);

    ${(p) => p.$variant === "prog" && css`
      background: rgba(245,158,11,.18);
      border-left-color: rgba(245,158,11,.95);
    `}
    ${(p) => p.$variant === "run" && css`
      background: rgba(37,99,235,.18);
      border-left-color: rgba(37,99,235,.95);
    `}
    ${(p) => p.$variant === "done" && css`
      background: rgba(16,185,129,.18);
      border-left-color: rgba(16,185,129,.95);
    `}
  }
`;

export const TripTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const TripLeft = styled.div`
  min-width: 0;
`;

export const TripTitle = styled.div`
  font-weight: 1000;
  font-size: 14px;
  color: #0b1220;
  letter-spacing: 0.2px;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  [data-theme="dark"] & { color: #e5e7eb; }
`;

export const TripSub = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 800;
  opacity: 0.9;

  b { font-weight: 1000; }
`;

export const StatusPill = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 1000;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 0.7);
  color: #0b1220;

  ${(p) => p.$variant === "prog" && css`
    background: rgba(245,158,11,.16);
    border-color: rgba(245,158,11,.32);
    color: #92400e;
  `}
  ${(p) => p.$variant === "run" && css`
    background: rgba(37,99,235,.16);
    border-color: rgba(37,99,235,.32);
    color: #1e40af;
  `}
  ${(p) => p.$variant === "done" && css`
    background: rgba(16,185,129,.16);
    border-color: rgba(16,185,129,.32);
    color: #047857;
  `}

  [data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.55);
    border-color: rgba(255,255,255,.14);
    color: #e5e7eb;
  }
`;

export const Muted = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  color: #6b7280;

  b { font-weight: 1000; color: #0b1220; }

  [data-theme="dark"] & {
    color: #94a3b8;
    b { color: #e5e7eb; }
  }
`;

/* ===== Map ===== */
export const MapHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const MapTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 1000;
  color: #0b1220;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  [data-theme="dark"] & { color: #e5e7eb; }
`;

export const LegendRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

export const LegendPill = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,.12);
  background: rgba(255,255,255,.75);
  font-size: 12px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  [data-theme="dark"] & {
    background: rgba(15,23,42,.7);
    border-color: rgba(255,255,255,.10);
    color: #e5e7eb;
  }
`;

export const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
`;

export const MapWrap = styled.div`
  margin-top: 12px;
  height: 460px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(15,23,42,.10);
  background: rgba(255,255,255,.6);

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.08);
    background: rgba(15,23,42,.45);
  }
`;

/* ===== Detail ===== */
export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const BackBtn = styled.button`
  border: 1px solid rgba(15,23,42,.14);
  background: rgba(255,255,255,.85);
  color: #0b1220;
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: 1000;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover { filter: brightness(0.98); }
  &:active { transform: translateY(1px); }

  [data-theme="dark"] & {
    background: rgba(15,23,42,.7);
    color: #e5e7eb;
    border-color: rgba(255,255,255,.12);
  }
`;

export const DetailGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

export const DetailBox = styled.div`
  border-radius: 12px;
  padding: 10px;
  background: rgba(255,255,255,.65);
  border: 1px solid rgba(15,23,42,.10);

  small {
    font-size: 11px;
    font-weight: 900;
    color: #6b7280;
  }

  div {
    margin-top: 4px;
    font-weight: 1000;
    color: #0b1220;
    font-size: 13px;
  }

  [data-theme="dark"] & {
    background: rgba(15,23,42,.40);
    border-color: rgba(255,255,255,.10);

    small { color: #94a3b8; }
    div { color: #e5e7eb; }
  }
`;

/* ===== Stepper ===== */
export const StepperWrap = styled.div`
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
`;

export const StepperRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0;
  min-width: 760px;
`;

export const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  padding: 6px 8px;
`;

export const StepDot = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(37,99,235,.22);
  background: rgba(37,99,235,.10);
  color: #1d4ed8;

  svg { width: 16px; height: 16px; }

  ${(p) => p.$done && css`
    border-color: rgba(16,185,129,.30);
    background: rgba(16,185,129,.14);
    color: #047857;
  `}

  ${(p) => p.$active && css`
    border-color: rgba(37,99,235,.40);
    background: rgba(37,99,235,.16);
    color: #1d4ed8;
    box-shadow: 0 0 0 4px rgba(37,99,235,.10);
  `}

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.12);
    background: rgba(15,23,42,.55);
    color: #93c5fd;

    ${(p) => p.$done && css`
      border-color: rgba(16,185,129,.32);
      background: rgba(16,185,129,.18);
      color: #6ee7b7;
    `}
    ${(p) => p.$active && css`
      box-shadow: 0 0 0 4px rgba(37,99,235,.14);
    `}
  }
`;

export const StepLine = styled.div`
  width: 64px;
  height: 3px;
  border-radius: 999px;
  background: rgba(37,99,235,.18);

  ${(p) => p.$done && css`
    background: rgba(16,185,129,.22);
  `}

  [data-theme="dark"] & {
    background: rgba(255,255,255,.12);

    ${(p) => p.$done && css`
      background: rgba(16,185,129,.26);
    `}
  }
`;

export const StepLabel = styled.div`
  font-size: 12px;
  font-weight: 900;
  text-align: center;
  color: #0b1220;
  opacity: .85;

  ${(p) => p.$done && css` opacity: 1; `}
  ${(p) => p.$active && css` opacity: 1; `}

  [data-theme="dark"] & { color: #e5e7eb; }
`;

/* ===== Tabela CTE ===== */
export const TableWrap = styled.div`
  margin-top: 12px;
  overflow: auto;
  border-radius: 14px;
  border: 1px solid rgba(15,23,42,.10);

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.10);
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 680px;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const Th = styled.th`
  text-align: left;
  padding: 12px;
  font-size: 12px;
  font-weight: 1000;
  color: #0b1220;
  background: rgba(243,244,246,.9);
  border-bottom: 1px solid rgba(15,23,42,.08);

  [data-theme="dark"] & {
    color: #e5e7eb;
    background: rgba(15,23,42,.85);
    border-bottom-color: rgba(255,255,255,.10);
  }
`;

export const Td = styled.td`
  padding: 12px;
  font-size: 13px;
  font-weight: 800;
  border-bottom: 1px solid rgba(15,23,42,.06);
  color: rgba(11,18,32,.9);

  [data-theme="dark"] & {
    color: rgba(229,231,235,.9);
    border-bottom-color: rgba(255,255,255,.08);
  }
`;

export const Pill = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 1000;
  background: rgba(37,99,235,.12);
  border: 1px solid rgba(37,99,235,.20);
  color: #1d4ed8;

  [data-theme="dark"] & {
    background: rgba(37,99,235,.18);
    border-color: rgba(37,99,235,.24);
    color: #93c5fd;
  }
`;
