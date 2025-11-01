import React, { useMemo } from "react";
import { FiTruck } from "react-icons/fi";
import { Wrap, CardsRow, StatCard, StatLabel, StatValue, PieCard, PieWrap, Legend, LegendItem, Dot } from "./style";
import { STATUS_PEDIDO } from "../constants";

const COLORS = {
  pendente: "#f59e0b",   // amber
  primeira: "#3b82f6",   // blue
  concluido: "#10b981",  // emerald
  expedido: "#6b7280",   // slate
};

function pieSegments(data) {
  // data = [{value, color}]
  let total = 0;
  for (let i = 0; i < data.length; i++) total += data[i].value || 0;
  if (total <= 0) return [];

  const res = [];
  let acc = 0;
  for (let i = 0; i < data.length; i++) {
    const v = Number(data[i].value || 0);
    const a0 = (acc / total) * 2 * Math.PI;
    acc += v;
    const a1 = (acc / total) * 2 * Math.PI;
    res.push({
      v,
      color: data[i].color,
      a0, a1
    });
  }
  return res;
}

export default function Indicators({ pedidos, canExpedir }) {
  const stats = useMemo(() => {
    let pendente = 0;
    let aguardPrimeira = 0; // separador definido e sem primeira
    let aguardSegunda = 0;  // status PRIMEIRA_CONF
    let concluido = 0;
    let expedido = 0;

    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      const st = p?.status;

      if (st === STATUS_PEDIDO.PENDENTE) {
        pendente++;
        const temSep = !!String(p?.separador || "").trim();
        const temPrimeira = !!p?.primeiraConferencia?.colaborador;
        if (temSep && !temPrimeira) aguardPrimeira++;
      }
      if (st === STATUS_PEDIDO.PRIMEIRA_CONF) aguardSegunda++;
      if (st === STATUS_PEDIDO.CONCLUIDO) concluido++;
      if (p?.expedido) expedido++;
    }

    return { pendente, aguardPrimeira, aguardSegunda, concluido, expedido };
  }, [pedidos]);

  const pizzaData = useMemo(() => {
    const parts = [
      { value: stats.pendente, color: COLORS.pendente, label: "Pendente" },
      { value: stats.aguardSegunda, color: COLORS.primeira, label: "1ª conf." },
      { value: stats.concluido, color: COLORS.concluido, label: "Concluído" },
      { value: stats.expedido, color: COLORS.expedido, label: "Expedido" },
    ];
    return parts;
  }, [stats]);

  const segs = useMemo(() => pieSegments(pizzaData), [pizzaData]);

  return (
    <Wrap>
      <CardsRow>
        <StatCard $color={COLORS.pendente}>
          <StatLabel>Pendentes (separação)</StatLabel>
          <StatValue>{stats.pendente}</StatValue>
        </StatCard>
        <StatCard $color={COLORS.pendente}>
          <StatLabel>Aguard. 1ª conferência</StatLabel>
          <StatValue>{stats.aguardPrimeira}</StatValue>
        </StatCard>
        <StatCard $color={COLORS.primeira}>
          <StatLabel>Aguard. 2ª conferência</StatLabel>
          <StatValue>{stats.aguardSegunda}</StatValue>
        </StatCard>
        <StatCard $color={COLORS.concluido}>
          <StatLabel>Concluídos</StatLabel>
          <StatValue>{stats.concluido}</StatValue>
        </StatCard>
        <StatCard $color={COLORS.expedido}>
          <StatLabel style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Expedidos {canExpedir ? <FiTruck /> : null}
          </StatLabel>
          <StatValue>{stats.expedido}</StatValue>
        </StatCard>
      </CardsRow>

      <PieCard>
        <PieWrap>
          <svg viewBox="0 0 120 120" width="140" height="140" role="img" aria-label="Distribuição de pedidos">
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
            {/* buraco (donut) */}
            <circle cx="60" cy="60" r="36" fill="white" />
          </svg>
        </PieWrap>
        <Legend>
          <LegendItem><Dot $c={COLORS.pendente} />Pendente</LegendItem>
          <LegendItem><Dot $c={COLORS.primeira} />1ª conf.</LegendItem>
          <LegendItem><Dot $c={COLORS.concluido} />Concluído</LegendItem>
          <LegendItem><Dot $c={COLORS.expedido} />Expedido</LegendItem>
        </Legend>
      </PieCard>
    </Wrap>
  );
}
