// pages/ProjetoDetalhe/Timeline/hooks/useDnDRows.js
import { useCallback, useState } from "react";

export default function useDnDRows(rows, canReorderRows, isBusy, onReorderRows) {
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
    e.dataTransfer.setData("text/plain", String(rowId));
  };

  const onDragOverRow = (rowId, e) => {
    if (!canReorderRows || isBusy || draggingId == null) return;
    e.preventDefault();
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
      setDraggingId(null); setOverInfo(null); return;
    }
    const srcIdx = findIndexById(sourceId);
    const tgtIdx = findIndexById(targetId);
    if (srcIdx < 0 || tgtIdx < 0) {
      setDraggingId(null); setOverInfo(null); return;
    }
    const next = rows.slice();
    const movedArr = next.splice(srcIdx, 1);
    const moved = movedArr[0];
    const insertAt = tgtIdx + (pos === "below" ? 1 : 0) - (srcIdx < tgtIdx ? 1 : 0);
    next.splice(insertAt, 0, moved);
    if (typeof onReorderRows === "function") onReorderRows(next);
    setDraggingId(null); setOverInfo(null);
  };

  const onDragEnd = () => { setDraggingId(null); setOverInfo(null); };

  const dropIndicatorStyle = (rowId) => {
    if (!overInfo || overInfo.rowId !== rowId) return {};
    const border = overInfo.pos === "above" ? "2px solid #3b82f6" : "none";
    const borderB = overInfo.pos === "below" ? "2px solid #3b82f6" : "none";
    return { borderTop: border, borderBottom: borderB };
  };

  return {
    draggingId, overInfo,
    onDragStart, onDragOverRow, onDropRow, onDragEnd,
    dropIndicatorStyle, setDraggingId
  };
}
