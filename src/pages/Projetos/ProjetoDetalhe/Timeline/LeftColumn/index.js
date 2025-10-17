import React, { useCallback, useRef, useState } from "react";
import {
  FixedColHeader,
  FirstCol,
  FirstColRow,
  SectorDot,
} from "../../../style";
import { FiCheckCircle } from "react-icons/fi";

export default function LeftColumn({
  rows,
  sectorMap,
  canReorderRows,
  isBusy,
  passWheelToRight,
  openSectorMenu,
  openAssigneeMenu,
  dropIndicatorStyle,
  onDragStart,
  onDragOverRow,
  onDropRow,
  onDragEnd,
  editingRowId,
  setEditingRowId,
  editDraft,
  setEditDraft,
  onRenameRow,
  firstColRef,
  usersIndex = {},
  usersBySector = {},
  leftDemandWidth = 320,
  setLeftDemandWidth,
  onContextEditRow,
  currentUserId,
  completedRowIds = new Set(),
}) {
  const FIXED_SECTORS_W = 85;
  const FIXED_RESP_W = 50;
  const FIXED_STAGE_W = 70;
  const MIN_DEMAND_W = 180;
  const MAX_DEMAND_W = 640;

  const [resizing, setResizing] = useState(false);
  const containerRef = useRef(null);
  const internalScrollRef = useRef(null);
  const demandScrollRef = firstColRef ?? internalScrollRef;

  const startResize = useCallback(
    (e) => {
      e.preventDefault();
      setResizing(true);
      const startX = e.clientX;
      const startW = leftDemandWidth;
      const onMove = (ev) => {
        const delta = ev.clientX - startX;
        const next = Math.max(
          MIN_DEMAND_W,
          Math.min(MAX_DEMAND_W, startW + delta)
        );
        setLeftDemandWidth?.(next);
      };
      const onUp = () => {
        setResizing(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [leftDemandWidth, setLeftDemandWidth]
  );

  const getAssignee = (r) => {
    const ids = Array.isArray(r.assignees) ? r.assignees : [];
    if (!ids.length) return null;
    return usersIndex?.[String(ids[0])] || null;
  };

  const getInitials = (u) => {
    const raw = (u?.nome || u?.email || "").trim();
    if (!raw) return "??";
    const emailPart = raw.includes("@") ? raw.split("@")[0] : raw;
    const letters = emailPart
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 2)
      .toUpperCase();
    return letters || "??";
  };

  const stageTone = (n) => {
    const palette = [
      "#3b82f6",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
      "#84cc16",
      "#f472b6",
    ];
    if (!n || n < 1) return "#9ca3af";
    return palette[(n - 1) % palette.length];
  };

  const colBorder = "1px solid rgba(0,0,0,0.12)";

  return (
    <div ref={containerRef}>
      <FixedColHeader>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${FIXED_SECTORS_W}px ${FIXED_RESP_W}px ${leftDemandWidth}px ${FIXED_STAGE_W}px`,
            alignItems: "center",
          }}
        >
          <div
            style={{ paddingLeft: 6, borderRight: colBorder, fontWeight: 600 }}
          >
            Setor
          </div>
          <div
            style={{ paddingLeft: 6, borderRight: colBorder, fontWeight: 600 }}
          >
            Resp.
          </div>
          <div
            style={{
              position: "relative",
              paddingLeft: 6,
              borderRight: colBorder,
              fontWeight: 600,
            }}
          >
            Demanda
            <button
              type="button"
              onMouseDown={startResize}
              title="Arraste para ajustar a largura da coluna de Demanda"
              style={{
                position: "absolute",
                right: -7,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 24,
                border: "none",
                background: "transparent",
                cursor: "col-resize",
                lineHeight: 1,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              ↔
            </button>
          </div>
          <div style={{ paddingLeft: 6, fontWeight: 600 }}>Etapa</div>
        </div>
      </FixedColHeader>

      <FirstCol ref={demandScrollRef} onWheel={passWheelToRight}>
        {rows.map((r) => {
          const rowCompleted = completedRowIds.has(r.id);
          const assignee = getAssignee(r);
          const initials = getInitials(assignee);
          const isLoggedAssignee =
            assignee && currentUserId && String(assignee.id) === String(currentUserId);
          const stageNo = Number(r?.stageNo || r?.stage_no || 1);
          const stageLbl = r?.stageLabel || r?.stage_label || "";
          const tone = stageTone(stageNo);

          return (
            <FirstColRow
              key={r.id}
              style={{
                cursor: canReorderRows && !isBusy ? "grab" : "pointer",
                ...dropIndicatorStyle(r.id),
                paddingRight: 0,
                background: rowCompleted
                  ? "linear-gradient(90deg, rgba(16,185,129,0.30) 0, rgba(16,185,129,0.26) 80px, transparent 220px)"
                  : (isLoggedAssignee
                      ? "linear-gradient(90deg, rgba(249,116,22,0.31) 0, rgba(249,115,22,0.06) 50px, transparent 64px)"
                      : undefined),
                boxShadow: rowCompleted ? "inset 0 0 0 1px rgba(16,185,129,0.20)" : undefined,
              }}
              title={String(r.titulo ?? "").trim()}
              draggable={canReorderRows && !isBusy}
              onDragStart={(e) => onDragStart(r.id, e)}
              onDragOver={(e) => onDragOverRow(r.id, e)}
              onDrop={(e) => onDropRow(r.id, e)}
              onDragEnd={onDragEnd}
              onContextMenu={(e) => {
                e.preventDefault();
                onContextEditRow?.(r);
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `${FIXED_SECTORS_W}px ${FIXED_RESP_W}px ${leftDemandWidth}px ${FIXED_STAGE_W}px`,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 0,
                    flexWrap: "nowrap",
                    overflow: "hidden",
                    borderRight: colBorder,
                    paddingRight: 6,
                    paddingLeft: 2,
                  }}
                >
                  {(Array.isArray(r.sectors)
                    ? r.sectors
                    : r.sector
                    ? [r.sector]
                    : []
                  ).length > 0 ? (
                    (Array.isArray(r.sectors) ? r.sectors : [r.sector]).map(
                      (key, idx) => {
                        const s = sectorMap[key];
                        return (
                          <SectorDot
                            key={key}
                            $color={s?.color}
                            title={s?.label || s?.nome || key}
                            style={{
                              marginLeft: idx ? -6 : 0,
                              zIndex: 100 - idx,
                              flex: "0 0 auto",
                              boxShadow: "0 0 0 1px transparent",
                            }}
                          >
                            {s?.initial || "?"}
                          </SectorDot>
                        );
                      }
                    )
                  ) : (
                    <SectorDot $color="#9ca3af" title="Sem setor">
                      +
                    </SectorDot>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRight: colBorder,
                    height: 34,
                    cursor: "pointer",
                  }}
                  title={assignee?.email || assignee?.nome || "Definir responsável"}
                  onClick={(e) => openAssigneeMenu?.(r.id, e)}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 12,
                      background: isLoggedAssignee ? "#f97316" : (assignee ? "#0ea5e9" : "transparent"),
                      border: assignee
                        ? "none"
                        : `1px dashed ${
                            typeof window !== "undefined" &&
                            window.matchMedia &&
                            window.matchMedia("(prefers-color-scheme: dark)").matches
                              ? "grey"
                              : "grey"
                          }`,
                      color: assignee ? "white" : "grey",
                      opacity: assignee ? 1 : 0.9,
                    }}
                  >
                    {assignee ? initials : "—"}
                  </div>
                </div>

                <div
                  onClick={(e) => openSectorMenu(r.id, e)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    overflow: "hidden",
                    borderRight: colBorder,
                    paddingRight: 6,
                    paddingLeft: 2,
                  }}
                >
                  {rowCompleted && (
                    <span
                      title="Atividade concluída"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: "rgba(16,185,129,0.12)",
                        boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.35)",
                        flex: "0 0 auto",
                        color: "#059669",
                      }}
                    >
                      <FiCheckCircle size={12} />
                    </span>
                  )}
                  <div
                    style={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minWidth: 0,
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
                            if (onRenameRow) onRenameRow(r.id, (editDraft || "").trim());
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
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    title={stageLbl ? `Etapa ${stageNo} — ${stageLbl}` : `Etapa ${stageNo}`}
                    style={{
                      width: 4,
                      height: 32,
                      borderRadius: 2,
                      background: tone,
                      opacity: 0.9,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: tone }}>
                      Etapa {stageNo}
                    </div>
                    {stageLbl ? (
                      <div
                        style={{
                          fontSize: 12,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          opacity: 0.9,
                        }}
                        title={stageLbl}
                      >
                        {stageLbl}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, opacity: 0.55 }}>—</div>
                    )}
                  </div>
                </div>
              </div>
            </FirstColRow>
          );
        })}
      </FirstCol>
    </div>
  );
}
