import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "reactstrap";
import {
  TimelineWrap,
  ContentGrid,
  FixedColHeader,
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
  DeleteCommentBtn,
  CommentBubble,
} from "../style";
import { FiFlag, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

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
  // DnD
  canReorderRows = false,
  onReorderRows,
  isBusy = false,
  availableSectorKeys = [],
  // novos
  onRenameRow,              // (rowId, newTitle)
  onDeleteRow,              // (rowId) => Promise
  onDeleteComment,          // (rowId, dayISO, commentId) => Promise
}) {
  const scrollerRef = useRef(null);
  const firstColRef = useRef(null);
  const [palette, setPalette] = useState(null);
  const [paletteSubmitting, setPaletteSubmitting] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState(null);

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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setPalette(null);
        setSectorMenu(null);
        setEditingRowId(null);
        setEditDraft("");
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
  const SECTORS = useMemo(() => {
    if (!availableSectorKeys?.length) return ALL_SECTORS;
    return ALL_SECTORS.filter((s) => availableSectorKeys.includes(s.key));
  }, [availableSectorKeys]);
  const sectorMap = useMemo(
    () => Object.fromEntries(ALL_SECTORS.map((s) => [s.key, s])),
    []
  );

  // ---------- Meses ----------
  const monthSegments = useMemo(() => {
    const segs = [];
    if (!days.length) return segs;
    let currentKey = null,
      span = 0,
      label = "";
    const push = () => {
      if (span > 0) segs.push({ key: currentKey, span, label });
    };
    for (const iso of days) {
      const d = toLocalDate(iso);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (k !== currentKey) {
        push();
        currentKey = k;
        span = 1;
        label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      } else {
        span++;
      }
    }
    push();
    return segs;
  }, [days]);

  // ---------- Inline rename ----------
  const [editingRowId, setEditingRowId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  // ---------- Paleta ----------
  const openPalette = (rowId, dayISO, e, existing = {}) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const W = 340,
      H = 320,
      M = 8;
    let left = rect.left;
    if (left + W > window.innerWidth - M) left = window.innerWidth - W - M;
    if (left < M) left = M;
    let top = rect.bottom + M;
    if (top + H > window.innerHeight - M) {
      top = rect.top - H - M;
      if (top < M) top = M;
    }

    const comments = Array.isArray(existing?.comments)
      ? existing.comments.slice()
      : [];
    setPalette({
      rowId,
      dayISO,
      x: left,
      y: top,
      commentDraft: "",
      baseline: !!existing?.baseline,
      comments,
    });
  };
  const closePalette = () => setPalette(null);

  const colors = [
    "#60a5fa",
    "#34d399",
    "#f59e0b",
    "#f87171",
    "#a78bfa",
    "#14b8a6",
  ];
  const handlePickColor = (c) => {
    if (!palette || !onPickColor) return;
    onPickColor(palette.rowId, palette.dayISO, c);
  };
  const handleSave = async () => {
    if (!palette) return;
    if (onSetCellComment && (palette.commentDraft || "").trim().length > 0) {
      setPaletteSubmitting(true);
      try {
        await onSetCellComment(
          palette.rowId,
          palette.dayISO,
          String(palette.commentDraft || ""),
          currentUserInitial
        );
        // UI otimista (já adiciona na lista aberta)
        setPalette((prev) =>
          prev
            ? {
                ...prev,
                commentDraft: "",
                comments: [
                  ...(Array.isArray(prev.comments) ? prev.comments : []),
                  {
                    id: `tmp-${Date.now()}`,
                    authorInitial: currentUserInitial,
                    message: String(prev.commentDraft || ""),
                    created_at: new Date().toISOString(),
                    deleted: false,
                  },
                ],
              }
            : prev
        );
      } finally {
        setPaletteSubmitting(false);
      }
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
    (id) => rows.findIndex((r) => r.id === id),
    [rows]
  );

  const onDragStart = (rowId, e) => {
    if (!canReorderRows || isBusy) return;
    setDraggingId(rowId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(rowId)); // Firefox
  };

  const onDragOverRow = (rowId, e) => {
    if (!canReorderRows || isBusy || draggingId == null) return;
    e.preventDefault(); // permite drop
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = e.clientY - rect.top < rect.height / 2 ? "above" : "below";
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
    const next = rows.slice();
    const [moved] = next.splice(srcIdx, 1);
    const insertAt =
      tgtIdx + (pos === "below" ? 1 : 0) - (srcIdx < tgtIdx ? 1 : 0);
    next.splice(insertAt, 0, moved);
    if (typeof onReorderRows === "function") onReorderRows(next);
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

  // ---------- UI ----------
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
            {rows.map((r) => (
              <FirstColRow
                key={r.id}
                style={{
                  cursor: canReorderRows && !isBusy ? "grab" : "pointer",
                  ...dropIndicatorStyle(r.id),
                }}
                onClick={(e) => openSectorMenu(r.id, e)}
                title={
                  canReorderRows
                    ? "Arraste para reordenar / Clique para setor"
                    : "Clique para setor"
                }
                draggable={canReorderRows && !isBusy}
                onDragStart={(e) => onDragStart(r.id, e)}
                onDragOver={(e) => onDragOverRow(r.id, e)}
                onDrop={(e) => onDropRow(r.id, e)}
                onDragEnd={onDragEnd}
              >
                <div
                  style={{
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingRowId(r.id);
                    setEditDraft(r.titulo || "");
                  }}
                >
                  {editingRowId === r.id ? (
                    <input
                      autoFocus
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onBlur={() => {
                        setEditingRowId(null);
                        setEditDraft("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (onRenameRow)
                            onRenameRow(r.id, (editDraft || "").trim());
                          setEditingRowId(null);
                        }
                        if (e.key === "Escape") {
                          setEditingRowId(null);
                          setEditDraft("");
                        }
                      }}
                      style={{ width: "100%" }}
                    />
                  ) : (
                    r.titulo
                  )}
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                      maxWidth: 100,
                      justifyContent: "flex-end",
                    }}
                  >
                    {(Array.isArray(r.sectors)
                      ? r.sectors
                      : r.sector
                      ? [r.sector]
                      : []
                    ).length > 0 ? (
                      (Array.isArray(r.sectors) ? r.sectors : [r.sector]).map(
                        (key) => {
                          const s = sectorMap[key];
                          return (
                            <SectorDot key={key} $color={s?.color}>
                              {s?.initial || "?"}
                            </SectorDot>
                          );
                        }
                      )
                    ) : (
                      <SectorDot $color="#9ca3af">+</SectorDot>
                    )}
                  </div>
                </div>
              </FirstColRow>
            ))}
          </FirstCol>
        </div>

        {/* Scroller direita */}
        <RightScroller ref={scrollerRef} onScroll={syncLeftScroll}>
          <HeaderLayer>
            <MonthsRow>
              {monthSegments.map((m, i) => (
                <MonthCell
                  key={m.key}
                  style={{ gridColumn: `span ${m.span}` }}
                  $bg={monthBgTones[i % monthBgTones.length]}
                >
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
                style={dropIndicatorStyle(r.id)}
                draggable={false}
                onDragOver={(e) => onDragOverRow(r.id, e)}
                onDrop={(e) => onDropRow(r.id, e)}
              >
                {days.map((d) => {
                  const cell = r?.cells?.[d];
                  const color = typeof cell === "string" ? cell : cell?.color;

                  const commentsArr = Array.isArray(cell?.comments)
                    ? cell.comments
                    : [];
                  const visibleCount = commentsArr.filter((c) => !c?.deleted)
                    .length;
                  let lastComment = null;
                  for (let i = commentsArr.length - 1; i >= 0; i--) {
                    const c = commentsArr[i];
                    if (!c?.deleted) {
                      lastComment = c;
                      break;
                    }
                  }
                  const commentText = lastComment?.message;
                  const authorInitial = (
                    lastComment?.authorInitial || "U"
                  ).toUpperCase();
                  const baseline =
                    typeof cell === "object" ? !!cell?.baseline : false;

                  return (
                    <div
                      key={d}
                      style={{ position: "relative" }}
                      onMouseEnter={(e) => {
                        if (commentText) showTooltip(e, commentText, authorInitial);
                      }}
                      onMouseLeave={hideTooltip}
                    >
                      <DayCell
                        $weekend={isWeekendLocal(d)}
                        $color={color}
                        onClick={(e) => {
                          if (isWeekendLocal(d)) return;
                          openPalette(r.id, d, e, {
                            comments: commentsArr,
                            baseline,
                          });
                        }}
                        title={
                          isWeekendLocal(d)
                            ? "Fim de semana"
                            : "Clique para cor/comentário"
                        }
                      />
                      {visibleCount > 0 && (
                        <CommentBadge>{visibleCount}</CommentBadge>
                      )}
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

          {/* Zona de lixeira para excluir linha ao arrastar */}
          <div
            onDragOver={(e) => {
              if (draggingId && !isBusy) e.preventDefault();
            }}
onDrop={async (e) => {
  if (draggingId && !isBusy && onDeleteRow && !deletingRowId) {
    setDeletingRowId(draggingId);
    try {
      await onDeleteRow(draggingId);
    } catch (err) {
      // use o seu toast aqui (ex.: react-toastify)
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 403) {
        toast.error("Sem permissão para excluir esta atividade.");
      } else if (status === 423) {
        toast.error("Projeto bloqueado. Não é possível excluir a atividade.");
      } else {
        toast.error(detail || "Falha ao excluir atividade.");
      }
    } finally {
      setDeletingRowId(null);
      setDraggingId(null);
    }
  }
}}

            style={{
              position: "sticky",
              bottom: 0,
              minWidth: "100%",
              height: 44,
              background: draggingId ? "rgba(239,68,68,0.15)" : "transparent",
              borderTop: "1px dashed #ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#ef4444",
              marginTop: 6,
            }}
          >
            {deletingRowId
              ? "Excluindo atividade..."
              : draggingId
              ? <p><FiTrash2 />Solte aqui para excluir a atividade</p>
              : null}
          </div>
        </RightScroller>
      </ContentGrid>

      {(sectorMenu || palette) && (
        <Overlay
          onClick={() => {
            setSectorMenu(null);
            setPalette(null);
          }}
        />
      )}

      {/* Menu de seleção de setor */}
      {sectorMenu && (
        <MenuBox
          style={{ position: "fixed", left: sectorMenu.x, top: sectorMenu.y }}
        >
          {SECTORS.map((s) => {
            const row = rows.find((r) => r.id === sectorMenu.rowId);
            const selected = Array.isArray(row?.sectors)
              ? row.sectors.includes(s.key)
              : row?.sector === s.key;
            return (
              <MenuItem
                key={s.key}
                onClick={() => pickSector(s.key)}
                $active={selected}
              >
                <SectorDot $color={s.color} style={{ marginRight: 8 }}>
                  {s.initial}
                </SectorDot>
                {s.label}
              </MenuItem>
            );
          })}
        </MenuBox>
      )}

      {/* Paleta */}
      {palette && (
        <div
          style={{
            position: "fixed",
            left: palette.x,
            top: palette.y,
            zIndex: 1001,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Palette style={{ width: 340 }}>
            <ColorsRow>
              {colors.map((c) => (
                <ColorDot key={c} $color={c} onClick={() => handlePickColor(c)} />
              ))}
              <ClearBtn type="button" onClick={() => handlePickColor(undefined)}>
                Limpar
              </ClearBtn>
            </ColorsRow>

            {canMarkBaseline && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  margin: "4px 0 8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!palette.baseline}
                  onChange={(e) =>
                    setPalette((prev) => ({ ...prev, baseline: e.target.checked }))
                  }
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

            {/* Lista de comentários (mais antigo por último) */}
            {Array.isArray(palette.comments) &&
              palette.comments
                .filter((c) => !c?.deleted)
                .sort(
                  (a, b) => new Date(a.created_at) - new Date(b.created_at)
                )
                .map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      margin: "6px 0",
                    }}
                  >
                    <SectorDot $color="#111827">
                      {(c.authorInitial || "U").toUpperCase()}
                    </SectorDot>
                    <CommentBubble
                   
                    >
                      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>
                        {new Date(c.created_at).toLocaleString()}
                      <DeleteCommentBtn
                        onClick={async () => {
                          try {
                            await onDeleteComment?.(palette.rowId, palette.dayISO, c.id);
                            setPalette((prev) => {
                              if (!prev) return prev;
                              const filtered = (prev.comments || []).filter((x) => String(x.id) !== String(c.id));
                              return { ...prev, comments: filtered };
                            });
                          } catch {}
                        }}
                        title="Apagar comentário"
                      >
                        <FiTrash2 />
                      </DeleteCommentBtn>

                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{c.message}</div>
                    </CommentBubble>
                  </div>
                ))}

            <textarea
              rows={3}
              placeholder="Adicionar novo comentário..."
              className="palette-textarea"
              value={palette.commentDraft}
              onChange={(e) =>
                setPalette((prev) => ({ ...prev, commentDraft: e.target.value }))
              }
            />

            <ActionsRow>
              <Button size="sm" color="secondary" onClick={closePalette}>
                Cancelar
              </Button>
              <Button
                size="sm"
                color="primary"
                onClick={handleSave}
                disabled={paletteSubmitting}
              >
                {paletteSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </ActionsRow>
          </Palette>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <TooltipBox
          style={{
            position: "fixed",
            left: tooltip.x + 12,
            top: tooltip.y + 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <SectorDot $color="#111827">
              {tooltip.authorInitial || "U"}
            </SectorDot>
            <strong>Comentário</strong>
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{tooltip.text}</div>
        </TooltipBox>
      )}
    </TimelineWrap>
  );
}
