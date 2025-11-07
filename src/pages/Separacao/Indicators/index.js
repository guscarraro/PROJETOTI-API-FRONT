import React, { useMemo, useState, useRef, useEffect } from "react";
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
  Dot,
  DesktopOnly,
  MobileOnly,
  MobileCard,
  MobileHeader,
  MobileTotal,
  MobileHint,
  MiniPieGrid,
  MiniPieBtn,
  MiniPieSvg,
  MiniPieCenter,
} from "./style";
import { STATUS_PEDIDO } from "../constants";

const COLORS = {
  pendente: "#f59e0b",
  primeira: "#3b82f6",
  concluido: "#10b981",
};

function pieSegments(data) {
  let total = 0;
  for (let i = 0; i < data.length; i++) total += Number(data[i].value || 0);
  if (total <= 0) return { total: 0, segs: [] };
  const segs = [];
  let acc = 0;
  for (let i = 0; i < data.length; i++) {
    const v = Number(data[i].value || 0);
    const a0 = (acc / total) * 2 * Math.PI;
    acc += v;
    const a1 = (acc / total) * 2 * Math.PI;
    segs.push({ v, color: data[i].color, a0, a1, key: data[i].key, label: data[i].label });
  }
  return { total, segs };
}

export default function Indicators({
  pedidos,
  canExpedir,
  total,
  onSelectStatus,
  selectedStatus,
}) {
  const stats = useMemo(() => {
    let aguardConf = 0;
    let prontoExpedir = 0;
    let expedidos = 0;
    let semSeparador = 0;
    let comNF = 0;
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      const st = p?.status;
      if (st === STATUS_PEDIDO.PENDENTE) {
        aguardConf++;
        const temSep = !!String(p?.separador || "").trim();
        if (!temSep) semSeparador++;
      } else if (st === STATUS_PEDIDO.PRIMEIRA_CONF) {
        prontoExpedir++;
      } else if (st === STATUS_PEDIDO.CONCLUIDO || p?.expedido) {
        expedidos++;
      }
      if (String(p?.nota || "").trim()) comNF++;
    }
    return { aguardConf, prontoExpedir, expedidos, semSeparador, comNF };
  }, [pedidos]);

  const pizzaData = useMemo(() => {
    return [
      { key: STATUS_PEDIDO.PENDENTE, value: stats.aguardConf, color: COLORS.pendente, label: "Aguard. conf." },
      { key: STATUS_PEDIDO.PRIMEIRA_CONF, value: stats.prontoExpedir, color: COLORS.primeira, label: "Pronto p/ expedir" },
      { key: STATUS_PEDIDO.CONCLUIDO, value: stats.expedidos, color: COLORS.concluido, label: "Expedidos" },
    ];
  }, [stats]);

  const segsTarget = useMemo(() => pieSegments(pizzaData).segs, [pizzaData]);

  const prevRef = useRef({});
  const [t, setT] = useState(1);

  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  useEffect(() => {
    const curr = {};
    for (let i = 0; i < segsTarget.length; i++) {
      const s = segsTarget[i];
      curr[s.key] = { a0: s.a0, a1: s.a1 };
    }
    if (!Object.keys(prevRef.current).length) {
      prevRef.current = curr;
      setT(1);
      return;
    }
    let id;
    const dur = 600;
    const start = performance.now();
    setT(0);
    function tick(now) {
      const lin = Math.min(1, (now - start) / dur);
      setT(easeInOutCubic(lin));
      if (lin < 1) id = requestAnimationFrame(tick);
      else prevRef.current = curr;
    }
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [segsTarget]);

  const segs = useMemo(() => {
    const out = [];
    for (let i = 0; i < segsTarget.length; i++) {
      const s = segsTarget[i];
      const prev = prevRef.current[s.key] || { a0: s.a0, a1: s.a1 };
      out.push({
        ...s,
        a0: prev.a0 + (s.a0 - prev.a0) * t,
        a1: prev.a1 + (s.a1 - prev.a1) * t,
      });
    }
    return out;
  }, [segsTarget, t]);

  const [hoverIdx, setHoverIdx] = useState(-1);

  function arcPath(cx, cy, r, a0, a1) {
    const x0 = cx + r * Math.cos(a0 - Math.PI / 2);
    const y0 = cy + r * Math.sin(a0 - Math.PI / 2);
    const x1 = cx + r * Math.cos(a1 - Math.PI / 2);
    const y1 = cy + r * Math.sin(a1 - Math.PI / 2);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
  }

  function handleSliceClick(s) {
    if (!onSelectStatus) return;
    if (selectedStatus === s.key) onSelectStatus(null);
    else onSelectStatus(s.key);
  }

  function legendClick(key) {
    if (!onSelectStatus) return;
    if (selectedStatus === key) onSelectStatus(null);
    else onSelectStatus(key);
  }

  const totalShown =
    selectedStatus === STATUS_PEDIDO.PENDENTE
      ? stats.aguardConf
      : selectedStatus === STATUS_PEDIDO.PRIMEIRA_CONF
      ? stats.prontoExpedir
      : selectedStatus === STATUS_PEDIDO.CONCLUIDO
      ? stats.expedidos
      : typeof total === "number"
      ? total
      : pedidos.length;

  const mobileBlocks = useMemo(
    () => [
      { key: STATUS_PEDIDO.PENDENTE, label: "Aguard.", color: COLORS.pendente, value: stats.aguardConf, title: "Filtrar Aguardando conferência" },
      { key: STATUS_PEDIDO.PRIMEIRA_CONF, label: "Pronto", color: COLORS.primeira, value: stats.prontoExpedir, title: "Filtrar Pronto para expedir" },
      { key: STATUS_PEDIDO.CONCLUIDO, label: "Expedido", color: COLORS.concluido, value: stats.expedidos, title: "Filtrar Expedidos" },
    ],
    [stats]
  );

  return (
    <>
      <DesktopOnly>
        <Wrap>
          <CardsRow>
            <StatCard $color={COLORS.pendente}>
              <StatLabel>Ag. conferência</StatLabel>
              <StatValue>{stats.aguardConf}</StatValue>
              <div style={{ fontSize: 18, opacity: 0.85, marginTop: 4 }}>
                Sem separador: <strong>{stats.semSeparador}</strong>
              </div>
            </StatCard>

            <StatCard $color={COLORS.primeira}>
              <StatLabel>Pronto para expedir</StatLabel>
              <StatValue>{stats.prontoExpedir}</StatValue>
              <div
                style={{
                  fontSize: 18,
                  opacity: 0.85,
                  marginTop: 4,
                  display: "inline-flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                {canExpedir ? <FiTruck /> : null}
                Ação disponível {canExpedir ? "✔" : "—"}
              </div>
            </StatCard>

            <StatCard $color={COLORS.concluido}>
              <StatLabel>Expedidos</StatLabel>
              <StatValue>{stats.expedidos}</StatValue>
              <div style={{ fontSize: 18, opacity: 0.85, marginTop: 4 }}>
                Com NF: <strong>{stats.comNF}</strong>
              </div>
            </StatCard>

            <StatCard style={{ padding: "12px 14px", borderRadius: 12, height: "100%", border: "1px solid rgba(0,0,0,.08)" }}>
              <StatLabel style={{ fontSize: 18, opacity: 0.85 }}>Total de pedidos</StatLabel>
              <StatValue style={{ fontWeight: 900, fontSize: 75, lineHeight: "75px" }}>{totalShown}</StatValue>
              {selectedStatus && (
                <StatValue style={{ marginTop: 6, fontSize: 18 }}>
                  Filtro ativo:{" "}
                  <strong>
                    {selectedStatus === STATUS_PEDIDO.PENDENTE && "Aguard. conf."}
                    {selectedStatus === STATUS_PEDIDO.PRIMEIRA_CONF && "Pronto p/ expedir"}
                    {selectedStatus === STATUS_PEDIDO.CONCLUIDO && "Expedidos"}
                  </strong>
                </StatValue>
              )}
            </StatCard>
          </CardsRow>

          <PieCard>
            <div style={{ display: "grid", alignItems: "center", gap: 16, width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minWidth: 260 }}>
                <PieWrap>
                  <svg viewBox="0 0 120 120" width="200" height="200" role="img" aria-label="Distribuição de pedidos">
                    <circle cx="60" cy="60" r="56" fill="var(--pie-bg)" />
                    {(() => {
                      let nonZeroCount = 0;
                      let nzIdx = -1;
                      for (let i = 0; i < segs.length; i++) {
                        if (segs[i].v > 0) {
                          nonZeroCount++;
                          nzIdx = i;
                        }
                      }
                      if (nonZeroCount === 1) {
                        const s = segs[nzIdx];
                        const baseR = 56;
                        const R = hoverIdx === nzIdx ? baseR + 3 : baseR;
                        const isSelected = selectedStatus && selectedStatus === s.key;
                        const opacity = selectedStatus ? (isSelected ? 1 : 0.35) : 1;
                        return (
                          <>
                            <circle
                              cx="60"
                              cy="60"
                              r={R}
                              fill={s.color}
                              style={{ cursor: "pointer", transition: "all 120ms ease", opacity }}
                              onMouseEnter={() => setHoverIdx(nzIdx)}
                              onMouseLeave={() => setHoverIdx(-1)}
                              onClick={() => handleSliceClick(s)}
                            />
                            <circle cx="60" cy="60" r="36" fill="var(--card-bg)" />
                          </>
                        );
                      }
                      const out = [];
                      for (let i = 0; i < segs.length; i++) {
                        const s = segs[i];
                        if (s.v <= 0) continue;
                        const baseR = 56;
                        const R = hoverIdx === i ? baseR + 3 : baseR;
                        const d = arcPath(60, 60, R, s.a0, s.a1);
                        const isSelected = selectedStatus && selectedStatus === s.key;
                        const opacity = selectedStatus ? (isSelected ? 1 : 0.35) : 1;
                        out.push(
                          <path
                            key={i}
                            d={d}
                            fill={s.color}
                            style={{ cursor: "pointer", transition: "all 120ms ease", opacity }}
                            onMouseEnter={() => setHoverIdx(i)}
                            onMouseLeave={() => setHoverIdx(-1)}
                            onClick={() => handleSliceClick(s)}
                          />
                        );
                      }
                      out.push(<circle key="hole" cx="60" cy="60" r="36" fill="var(--card-bg)" />);
                      return out;
                    })()}
                  </svg>
                </PieWrap>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                <Legend style={{ margin: 0, display: "flex", flexDirection: "column" }}>
                  <LegendItem
                    onClick={() => legendClick(STATUS_PEDIDO.PENDENTE)}
                    style={{ cursor: "pointer", opacity: selectedStatus && selectedStatus !== STATUS_PEDIDO.PENDENTE ? 0.5 : 1 }}
                    title="Filtrar por Aguardando conferência"
                  >
                    <Dot $c={COLORS.pendente} />
                    Aguard. conf.
                  </LegendItem>

                  <LegendItem
                    onClick={() => legendClick(STATUS_PEDIDO.PRIMEIRA_CONF)}
                    style={{ cursor: "pointer", opacity: selectedStatus && selectedStatus !== STATUS_PEDIDO.PRIMEIRA_CONF ? 0.5 : 1 }}
                    title="Filtrar por Pronto para expedir"
                  >
                    <Dot $c={COLORS.primeira} />
                    Pronto p/ expedir
                  </LegendItem>

                  <LegendItem
                    onClick={() => legendClick(STATUS_PEDIDO.CONCLUIDO)}
                    style={{ cursor: "pointer", opacity: selectedStatus && selectedStatus !== STATUS_PEDIDO.CONCLUIDO ? 0.5 : 1 }}
                    title="Filtrar por Expedidos"
                  >
                    <Dot $c={COLORS.concluido} />
                    Expedidos
                  </LegendItem>
                </Legend>
              </div>
            </div>
          </PieCard>
        </Wrap>
      </DesktopOnly>

      <MobileOnly>
        <MobileCard>
          <MobileHeader>
            <div>
              <strong>Resumo</strong>
              {selectedStatus && (
                <MobileHint>
                  Filtro:{" "}
                  {selectedStatus === STATUS_PEDIDO.PENDENTE && "Aguard."}
                  {selectedStatus === STATUS_PEDIDO.PRIMEIRA_CONF && "Pronto"}
                  {selectedStatus === STATUS_PEDIDO.CONCLUIDO && "Expedido"}
                </MobileHint>
              )}
            </div>
            <MobileTotal>
              Total: <b>{totalShown}</b>
            </MobileTotal>
          </MobileHeader>

          <MiniPieGrid>
            {mobileBlocks.map((b) => (
<MiniPieBtn
  key={b.key}
  onClick={() =>
    selectedStatus === b.key ? onSelectStatus?.(null) : onSelectStatus?.(b.key)
  }
  $active={selectedStatus === b.key}
  aria-pressed={selectedStatus === b.key}
  title={b.title}
>
  <div style={{ position: "relative", width: 64, height: 64 }}>
    <MiniPieSvg viewBox="0 0 48 48" role="img" aria-label={b.label}>
      <circle cx="24" cy="24" r="19" className="bg" strokeWidth="6" />
      <circle cx="24" cy="24" r="19" className="ring" stroke={b.color} strokeWidth="6" />
    </MiniPieSvg>
    <MiniPieCenter style={{ color: b.color }}>
      <div className="n">{b.value}</div>
    </MiniPieCenter>
  </div>

  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: b.color }}>
    {b.label}
  </div>
</MiniPieBtn>


            ))}
          </MiniPieGrid>
        </MobileCard>
      </MobileOnly>
    </>
  );
}
