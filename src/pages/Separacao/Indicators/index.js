import React, { useMemo } from "react";
import { FiTruck } from "react-icons/fi";
import {
  Wrap,
  CardsRow,
  StatCard,
  StatLabel,
  StatValue,
  PieCard,
  PieWrap,
  Legend,
  LegendItem,
  Dot
} from "./style";
import { STATUS_PEDIDO } from "../constants";

const COLORS = {
  pendente: "#f59e0b",   // Aguardando conferência
  primeira: "#3b82f6",   // Pronto para expedir (após conferência)
  concluido: "#10b981",  // Expedido
};

function pieSegments(data) {
  let total = 0;
  for (let i = 0; i < data.length; i++) total += Number(data[i].value || 0);
  if (total <= 0) return [];

  const res = [];
  let acc = 0;
  for (let i = 0; i < data.length; i++) {
    const v = Number(data[i].value || 0);
    const a0 = (acc / total) * 2 * Math.PI;
    acc += v;
    const a1 = (acc / total) * 2 * Math.PI;
    res.push({ v, color: data[i].color, a0, a1 });
  }
  return res;
}

export default function Indicators({ pedidos, canExpedir }) {
  const stats = useMemo(() => {
    let aguardConf = 0;      // STATUS_PEDIDO.PENDENTE
    let prontoExpedir = 0;   // STATUS_PEDIDO.PRIMEIRA_CONF
    let expedidos = 0;       // STATUS_PEDIDO.CONCLUIDO (ou expedido=true)
    let semSeparador = 0;    // pendente sem separador definido
    let comNF = 0;           // possui nota (NF) preenchida

    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      const st = p?.status;

      if (st === STATUS_PEDIDO.PENDENTE) {
        aguardConf++;
        const temSep = !!String(p?.separador || "").trim();
        if (!temSep) semSeparador++;
      } else if (st === STATUS_PEDIDO.PRIMEIRA_CONF) {
        // Conferência única concluída → “Pronto para expedir”
        prontoExpedir++;
      } else if (st === STATUS_PEDIDO.CONCLUIDO || p?.expedido) {
        expedidos++;
      }

      if (String(p?.nota || "").trim()) comNF++;
    }

    return { aguardConf, prontoExpedir, expedidos, semSeparador, comNF };
  }, [pedidos]);

  const pizzaData = useMemo(() => {
    const parts = [
      { value: stats.aguardConf,   color: COLORS.pendente, label: "Aguard. conf." },
      { value: stats.prontoExpedir, color: COLORS.primeira, label: "Pronto p/ expedir" },
      { value: stats.expedidos,    color: COLORS.concluido, label: "Expedidos" },
    ];
    return parts;
  }, [stats]);

  const segs = useMemo(() => pieSegments(pizzaData), [pizzaData]);

  return (
    <Wrap>
      <CardsRow>
        <StatCard $color={COLORS.pendente}>
          <StatLabel>Aguardando conferência</StatLabel>
          <StatValue style={{ fontSize: 48, lineHeight: "48px" }}>
            {stats.aguardConf}
          </StatValue>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            Sem separador: <strong>{stats.semSeparador}</strong>
          </div>
        </StatCard>

        <StatCard $color={COLORS.primeira}>
          <StatLabel>Pronto para expedir</StatLabel>
          <StatValue style={{ fontSize: 48, lineHeight: "48px" }}>
            {stats.prontoExpedir}
          </StatValue>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4, display: "inline-flex", gap: 6, alignItems: "center" }}>
            {canExpedir ? <FiTruck /> : null}
            Ação disponível {canExpedir ? "✔" : "—"}
          </div>
        </StatCard>

        <StatCard $color={COLORS.concluido}>
          <StatLabel>Expedidos</StatLabel>
          <StatValue style={{ fontSize: 48, lineHeight: "48px" }}>
            {stats.expedidos}
          </StatValue>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            Com NF: <strong>{stats.comNF}</strong>
          </div>
        </StatCard>
      </CardsRow>

      <PieCard>
        <PieWrap>
          <svg viewBox="0 0 120 120" width="160" height="160" role="img" aria-label="Distribuição de pedidos">
            <circle cx="60" cy="60" r="56" fill="rgba(0,0,0,0.05)" />
            {segs.map((s, idx) => {
              const R = 56;
              const cx = 60, cy = 60;
              const x0 = cx + R * Math.cos(s.a0 - Math.PI / 2);
              const y0 = cy + R * Math.sin(s.a0 - Math.PI / 2);
              const x1 = cx + R * Math.cos(s.a1 - Math.PI / 2);
              const y1 = cy + R * Math.sin(s.a1 - Math.PI / 2);
              const large = s.a1 - s.a0 > Math.PI ? 1 : 0;
              const d = `M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;
              return <path key={idx} d={d} fill={s.color} />;
            })}
            {/* donut hole */}
            <circle cx="60" cy="60" r="36" fill="white" />
          </svg>
        </PieWrap>
        <Legend>
          <LegendItem><Dot $c={COLORS.pendente} />Aguard. conf.</LegendItem>
          <LegendItem><Dot $c={COLORS.primeira} />Pronto p/ expedir</LegendItem>
          <LegendItem><Dot $c={COLORS.concluido} />Expedidos</LegendItem>
        </Legend>
      </PieCard>
    </Wrap>
  );
}
