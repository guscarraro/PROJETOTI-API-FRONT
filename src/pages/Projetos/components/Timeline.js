import React, { useRef, useState, useMemo, useCallback } from "react";
import { Button } from "reactstrap";
import {
  TimelineWrap,
  ContentGrid,
  FixedColHeader,
  LeftHeaderSpacer,
  FirstCol,
  FirstColRow,
  RightScroller,
  HeaderLayer,
  MonthsRow,
  MonthCell,
  DaysRow,
  DayCellHeader,
  GridRows,
  GridRow,
  DayCell,
  Palette,
  ColorDot,
  LegendBar,
  LegendItem,
  LegendDot,
  SectorDot,
  CommentBadge,
  TooltipBox,
  MenuBox,
  MenuItem,
  ColorsRow,
  ClearBtn,
  ActionsRow,
  Overlay,
  BaselineMark,
} from "../style";
import { isWeekend as isWeekendBase } from "../utils";
import { FiFlag } from "react-icons/fi";

const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const monthBgTones = [
  "rgba(96,165,250,0.15)",
  "rgba(52,211,153,0.15)",
  "rgba(245,158,11,0.15)",
  "rgba(167,139,250,0.15)",
  "rgba(20,184,166,0.15)",
];

// parse seguro local
const toLocalDate = (iso) => new Date(`${iso}T00:00:00`);
const isWeekendLocal = (iso) => {
  const d = toLocalDate(iso);
  const dow = d.getDay();
  return dow === 0 || dow === 6;
};

// Legenda
const LEGEND_STATUS = [
  { label: "Em execução", color: "#60a5fa" },
  { label: "Concluído",   color: "#34d399" },
  { label: "Em risco",    color: "#f59e0b" },
  { label: "Bloqueado",   color: "#f87171" },
  { label: "Postergado",  color: "#a78bfa" },
  { label: "Stand by",    color: "#14b8a6" },
];

// Setores


export default function Timeline({
  days = [],
  rows = [],
  currentUserInitial = "U",
  onPickColor,              // (rowId, dayISO, color)
  onSetCellComment,         // (rowId, dayISO, comment, authorInitial)
  onSetRowSector,
  canMarkBaseline = false,
  baselineColor = "#111827",
  onToggleBaseline,         // (rowId, dayISO, enabled)
  // ⭐️ NOVO:
  canReorderRows = false,   // habilita drag&drop
  onReorderRows,            // (newOrderedRowsArray) => void
  isBusy = false,   
  availableSectorKeys = [],        // opcional: desabilita DnD quando true (ex.: loading.any())
}) {
  const scrollerRef = useRef(null);
  const firstColRef = useRef(null);
  const [palette, setPalette] = useState(null);

  const syncLeftScroll = (e) => {
    if (firstColRef.current) {
      firstColRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };
  const passWheelToRight = (e) => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop += e.deltaY;
    }
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setPalette(null);
        setSectorMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ALL_SECTORS = [
  { key: "SAC",          label: "SAC",          initial: "S", color: "#2563eb" },
  { key: "OPERACAO",     label: "Operação",     initial: "O", color: "#059669" },
  { key: "FRETE",        label: "Frete",        initial: "F", color: "#f59e0b" },
  { key: "FROTA",        label: "Frota",        initial: "F", color: "#8b5cf6" },
  { key: "DIRETORIA",    label: "Diretoria",    initial: "D", color: "#ef4444" },
  { key: "TI",           label: "TI",           initial: "T", color: "#0ea5e9" },
  { key: "CLIENTES",     label: "Clientes",     initial: "C", color: "#10b981" },
  { key: "FORNECEDORES", label: "Fornecedores", initial: "F", color: "#14b8a6" },
];
const SECTORS = React.useMemo(() => {
  if (!availableSectorKeys?.length) return ALL_SECTORS;
  return ALL_SECTORS.filter(s => availableSectorKeys.includes(s.key));
}, [availableSectorKeys]);

// Mapa para lookup (mantém todo o catálogo para exibir ícones já salvos)
const sectorMap = React.useMemo(
  () => Object.fromEntries(ALL_SECTORS.map(s => [s.key, s])),
  []
);

  // ---------- Meses ----------
  const monthSegments = useMemo(() => {
    const segs = [];
    if (!days.length) return segs;
    let currentKey = null, span = 0, label = "";
    const push = () => { if (span > 0) segs.push({ key: currentKey, span, label }); };
    for (const iso of days) {
      const d = toLocalDate(iso);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key !== currentKey) {
        push();
        currentKey = key;
        span = 1;
        label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      } else {
        span++;
      }
    }
    push();
    return segs;
  }, [days]);

  // ---------- Paleta ----------
  const openPalette = (rowId, dayISO, e, existing = {}) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const W = 300, H = 210, M = 8;
    let left = rect.left;
    if (left + W > window.innerWidth - M) left = window.innerWidth - W - M;
    if (left < M) left = M;
    let top = rect.bottom + M;
    if (top + H > window.innerHeight - M) {
      top = rect.top - H - M;
      if (top < M) top = M;
    }
    setPalette({
      rowId,
      dayISO,
      x: left,
      y: top,
      commentDraft: existing?.comment || "",
      baseline: !!existing?.baseline,
    });
  };
  const closePalette = () => setPalette(null);

  const colors = ["#60a5fa", "#34d399", "#f59e0b", "#f87171", "#a78bfa", "#14b8a6"];
  const handlePickColor = (c) => {
    if (!palette || !onPickColor) return;
    onPickColor(palette.rowId, palette.dayISO, c);
  };
  const handleSave = () => {
    if (!palette) return;
    if (onSetCellComment) {
      onSetCellComment(
        palette.rowId,
        palette.dayISO,
        palette.commentDraft || "",
        currentUserInitial
      );
    }
    if (canMarkBaseline && typeof onToggleBaseline === "function") {
      onToggleBaseline(palette.rowId, palette.dayISO, !!palette.baseline);
    }
    closePalette();
  };

  // ---------- Tooltip ----------
  const [tooltip, setTooltip] = useState(null);
  const showTooltip = (e, text, authorInitial) => {
    const { clientX: x, clientY: y } = e;
    setTooltip({ x, y, text, authorInitial });
  };
  const hideTooltip = () => setTooltip(null);

  // ---------- Setor por linha ----------
  const [sectorMenu, setSectorMenu] = useState(null);
  const openSectorMenu = (rowId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(8, Math.min(rect.left, window.innerWidth - 260));
    const y = Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 320));
    setSectorMenu({ rowId, x, y });
  };
  const closeSectorMenu = () => setSectorMenu(null);
  const pickSector = (key) => {
    if (sectorMenu && onSetRowSector) {
      onSetRowSector(sectorMenu.rowId, key);
    }
    closeSectorMenu();
  };

  // ---------- Drag & Drop de linhas ----------
  const [draggingId, setDraggingId] = useState(null);
  const [overInfo, setOverInfo] = useState(null); // {rowId, pos:'above'|'below'}

  const findIndexById = useCallback(
    (id) => rows.findIndex(r => r.id === id),
    [rows]
  );

  const onDragStart = (rowId, e) => {
    if (!canReorderRows || isBusy) return;
    setDraggingId(rowId);
    e.dataTransfer.effectAllowed = "move";
    // necessário para Firefox
    e.dataTransfer.setData("text/plain", String(rowId));
  };

  const onDragOverRow = (rowId, e) => {
    if (!canReorderRows || isBusy || draggingId == null) return;
    e.preventDefault(); // permite drop
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientY - rect.top) < rect.height / 2 ? "above" : "below";
    setOverInfo({ rowId, pos });
  };

  const onDropRow = (rowId, e) => {
    if (!canReorderRows || isBusy || draggingId == null) return;
    e.preventDefault();
    const sourceId = draggingId;
    const targetId = rowId;
    const pos = overInfo?.pos || "below";
    if (sourceId === targetId) {
      setDraggingId(null);
      setOverInfo(null);
      return;
    }

    const srcIdx = findIndexById(sourceId);
    const tgtIdx = findIndexById(targetId);
    if (srcIdx < 0 || tgtIdx < 0) {
      setDraggingId(null);
      setOverInfo(null);
      return;
    }

    // cria nova ordem
    const next = [...rows];
    const [moved] = next.splice(srcIdx, 1);
    const insertAt = tgtIdx + (pos === "below" ? 1 : 0) - (srcIdx < tgtIdx ? 1 : 0);
    next.splice(insertAt, 0, moved);

    // emite para o pai
    if (typeof onReorderRows === "function") {
      onReorderRows(next);
    }

    setDraggingId(null);
    setOverInfo(null);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setOverInfo(null);
  };

  const dropIndicatorStyle = (rowId) => {
    if (!overInfo || overInfo.rowId !== rowId) return {};
    const border = overInfo.pos === "above" ? "2px solid #3b82f6" : "none";
    const borderB = overInfo.pos === "below" ? "2px solid #3b82f6" : "none";
    return { borderTop: border, borderBottom: borderB };
  };

  return (
    <TimelineWrap>
      {/* Legenda */}
      <LegendBar>
        {LEGEND_STATUS.map((it) => (
          <LegendItem key={it.label}>
            <LegendDot $color={it.color} />
            <span>{it.label}</span>
          </LegendItem>
        ))}
        {SECTORS.map((s) => (
          <LegendItem key={s.key}>
            <SectorDot $color={s.color}>{s.initial}</SectorDot>
            <span>{s.label}</span>
          </LegendItem>
        ))}
      </LegendBar>

      <ContentGrid>
        {/* Coluna fixa esquerda */}
        <div>
          <FixedColHeader>Demanda / Função</FixedColHeader>
          <FirstCol ref={firstColRef} onWheel={passWheelToRight}>
            {rows.map((r) => {
              const sector = r.sector ? sectorMap[r.sector] : null;
              return (
                <FirstColRow
                  key={r.id}
                  style={{ cursor: canReorderRows && !isBusy ? "grab" : "pointer", ...dropIndicatorStyle(r.id) }}
                  onClick={(e) => openSectorMenu(r.id, e)}
                  title={canReorderRows ? "Arraste para reordenar / Clique para setor" : "Clique para setor"}
                  draggable={canReorderRows && !isBusy}
                  onDragStart={(e) => onDragStart(r.id, e)}
                  onDragOver={(e) => onDragOverRow(r.id, e)}
                  onDrop={(e) => onDropRow(r.id, e)}
                  onDragEnd={onDragEnd}
                >
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.titulo}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 100, justifyContent: 'flex-end' }}>
                      {(Array.isArray(r.sectors) ? r.sectors : (r.sector ? [r.sector] : [])).length > 0
                        ? (Array.isArray(r.sectors) ? r.sectors : [r.sector]).map((key) => {
                            const s = sectorMap[key];
                            return <SectorDot key={key} $color={s?.color}>{s?.initial || "?"}</SectorDot>;
                          })
                        : <SectorDot $color="#9ca3af">+</SectorDot>
                      }
                    </div>
                  </div>
                </FirstColRow>
              );
            })}
          </FirstCol>
        </div>

        {/* Scroller direita */}
        <RightScroller ref={scrollerRef} onScroll={syncLeftScroll}>
          <HeaderLayer>
            <MonthsRow>
              {monthSegments.map((m, i) => (
                <MonthCell key={m.key} style={{ gridColumn: `span ${m.span}` }} $bg={monthBgTones[i % monthBgTones.length]}>
                  {m.label}
                </MonthCell>
              ))}
            </MonthsRow>
            <DaysRow>
              {days.map((d) => (
                <DayCellHeader key={d} $weekend={isWeekendLocal(d)}>
                  {toLocalDate(d).getDate()}
                </DayCellHeader>
              ))}
            </DaysRow>
          </HeaderLayer>

          <GridRows>
            {rows.map((r) => (
              <GridRow
                key={r.id}
                // mesmo indicador visual do lado direito
                style={dropIndicatorStyle(r.id)}
                draggable={false}
                onDragOver={(e) => onDragOverRow(r.id, e)}
                onDrop={(e) => onDropRow(r.id, e)}
              >
                {days.map((d) => {
                  const cell = r?.cells?.[d];
                  const color = typeof cell === "string" ? cell : cell?.color;
                  const comment = typeof cell === "object" ? cell?.comment : undefined;
                  const authorInitial = typeof cell === "object" ? (cell?.authorInitial || "U") : undefined;
                  const baseline = typeof cell === "object" ? !!cell?.baseline : false;

                  return (
                    <div
                      key={d}
                      style={{ position: "relative" }}
                      onMouseEnter={(e) => { if (comment) showTooltip(e, comment, authorInitial); }}
                      onMouseLeave={hideTooltip}
                    >
                      <DayCell
                        $weekend={isWeekendLocal(d)}
                        $color={color}
                        onClick={(e) => {
                          if (isWeekendLocal(d)) return;
                          openPalette(r.id, d, e, { comment, baseline });
                        }}
                        title={isWeekendLocal(d) ? "Fim de semana" : "Clique para cor/comentário"}
                      />
                      {comment && <CommentBadge>OBS</CommentBadge>}
                      {baseline && (
                        <BaselineMark $color={baselineColor} title="Marco do plano">
                          <FiFlag size={14} />
                        </BaselineMark>
                      )}
                    </div>
                  );
                })}
              </GridRow>
            ))}
          </GridRows>
        </RightScroller>
      </ContentGrid>

      {(sectorMenu || palette) && (
        <Overlay onClick={() => { setSectorMenu(null); setPalette(null); }} />
      )}

      {/* Menu de seleção de setor */}
      {sectorMenu && (
        <MenuBox style={{ position: "fixed", left: sectorMenu.x, top: sectorMenu.y }}>
          {SECTORS.map((s) => {
            const row = rows.find(r => r.id === sectorMenu.rowId);
            const selected = Array.isArray(row?.sectors)
              ? row.sectors.includes(s.key)
              : row?.sector === s.key;
            return (
              <MenuItem key={s.key} onClick={() => pickSector(s.key)} $active={selected}>
                <SectorDot $color={s.color} style={{ marginRight: 8 }}>{s.initial}</SectorDot>
                {s.label}
              </MenuItem>
            );
          })}
        </MenuBox>
      )}

      {/* Paleta */}
      {palette && (
        <div style={{ position: "fixed", left: palette.x, top: palette.y, zIndex: 1001 }} onClick={(e) => e.stopPropagation()}>
          <Palette style={{ width: 300 }}>
            <ColorsRow>
              {colors.map((c) => (
                <ColorDot key={c} $color={c} onClick={() => handlePickColor(c)} />
              ))}
              <ClearBtn type="button" onClick={() => handlePickColor(undefined)}>Limpar</ClearBtn>
            </ColorsRow>

            {canMarkBaseline && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, margin: "4px 0 8px" }}>
                <input
                  type="checkbox"
                  checked={!!palette.baseline}
                  onChange={(e) => setPalette(prev => ({ ...prev, baseline: e.target.checked }))}
                />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span>Marco do plano</span>
                  <span style={{ position: "relative", width: 18, height: 18 }}>
                    <span style={{ position: "absolute", inset: 0, display: "inline-block" }}>
                      <BaselineMark $color={baselineColor} />
                    </span>
                  </span>
                </span>
              </label>
            )}

            <textarea
              rows={3}
              placeholder="Adicionar/editar comentário..."
              className="palette-textarea"
              value={palette.commentDraft}
              onChange={(e) => setPalette(prev => ({ ...prev, commentDraft: e.target.value }))}
            />

            <ActionsRow>
              <Button size="sm" color="secondary" onClick={closePalette}>Cancelar</Button>
              <Button size="sm" color="primary" onClick={handleSave}>Salvar</Button>
            </ActionsRow>
          </Palette>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <TooltipBox style={{ position: "fixed", left: tooltip.x + 12, top: tooltip.y + 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <SectorDot $color="#111827">{tooltip.authorInitial || "U"}</SectorDot>
            <strong>Comentário</strong>
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{tooltip.text}</div>
        </TooltipBox>
      )}
    </TimelineWrap>
  );
}
