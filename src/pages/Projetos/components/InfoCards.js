// src/pages/Projetos/components/InfoCards.jsx
import React from "react";
import styled, { css } from "styled-components";
import { InfoItem } from "../style";
import { LuActivity, LuCalendarDays, LuCalendarRange, LuWallet } from "react-icons/lu";

/* helpers */
const formatBR = (iso) => (iso ? iso.split("-").reverse().join("/") : "");
const hexToRgb = (hex) => {
  if (!hex || typeof hex !== "string") return [99, 102, 241];
  const m = hex.replace("#", "");
  const n = m.length === 3 ? m.split("").map(c=>c+c).join("") : m;
  const bigint = parseInt(n, 16);
  return [(bigint>>16)&255, (bigint>>8)&255, bigint&255];
};
const softBg = (hex, alpha = 0.14) => {
  const [r,g,b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/* casca do card: herda dark mode de InfoItem e adiciona motion */
const CardShell = styled(InfoItem)`
  border: 1px solid #eef2ff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  transition: transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease;

  ${(p) => p.$clickable && css`
    cursor: pointer;
    &:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,0.10); }
  `}

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.06);
    box-shadow: 0 8px 24px rgba(2,6,23,0.5);
    ${(p) => p.$clickable && css`
      &:hover { box-shadow: 0 12px 32px rgba(2,6,23,0.65); }
    `}
  }
`;

const HeaderRow = styled.div`
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
`;

const IconChip = styled.div`
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center; flex-shrink: 0;

  /* se veio $chipBg (quando color é passado), usa; senão cai no fallback bonito */
  background: ${(p) => p.$chipBg || "rgba(99,102,241,.14)"};   /* indigo-500/14 */
  color: ${(p) => p.$accent || "#111827"};

  [data-theme="dark"] & {
    background: ${(p) => p.$chipBg || "rgba(99,102,241,.28)"}; /* mais forte no dark */
    color: ${(p) => p.$accent || "#e5e7eb"};
  }
`;

const Label = styled.small`
  font-weight: 600; color: #6b7280;
  [data-theme="dark"] & { color: #94a3b8; }
`;

const Value = styled.div`
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 0.2px;
  /* se houver $accent, usa; caso contrário herda a cor do card (perfeito no dark) */
  color: ${(p) => p.$accent || "inherit"};
`;

function BaseCard({ label, value, color, onClick, title, Icon = LuActivity }) {
  const clickable = typeof onClick === "function";
  // somente define accent/chipBg quando o caller fornece uma cor;
  // sem cor, o texto herda a cor do InfoItem (bom no dark) e o chip usa fallback
  const accent = color || undefined;
  const chipBg = color ? softBg(color, 0.16) : undefined;

  return (
    <CardShell $clickable={clickable} onClick={onClick} title={title}>
      <HeaderRow>
        <IconChip $chipBg={chipBg} $accent={accent}><Icon size={18} /></IconChip>
        <Label>{label}</Label>
      </HeaderRow>

      <Value $accent={accent}>{value}</Value>
    </CardShell>
  );
}

/* exports específicos */
export function StatusCard({ status, accent }) {
  return <BaseCard label="Status" value={status} color={accent} Icon={LuActivity} />;
}

export function DateCard({ label, dateISO }) {
  return <BaseCard label={label} value={formatBR(dateISO)} Icon={LuCalendarDays} />;
}

export function DaysCard({ total }) {
  return <BaseCard label="Total de dias" value={total} Icon={LuCalendarRange} />;
}

export function CostsCard({ totalBRL, onClick }) {
  return (
    <BaseCard
      label="Custos do projeto"
      value={totalBRL}
      onClick={onClick}
      title="Clique para ver detalhes de custos"
      Icon={LuWallet}
      color="#0ea5e9"
    />
  );
}
