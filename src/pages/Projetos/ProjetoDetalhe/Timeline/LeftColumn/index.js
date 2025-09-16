import React from "react";
import {
  FixedColHeader,
  FirstCol,
  FirstColRow,
  SectorDot,
} from "../../../style";

export default function LeftColumn({
  rows,
  sectorMap,
  canReorderRows,
  isBusy,
  passWheelToRight,
  openSectorMenu,
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
}) {
  return (
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
            title={String(r.titulo ?? "").trim()}
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
  );
}
