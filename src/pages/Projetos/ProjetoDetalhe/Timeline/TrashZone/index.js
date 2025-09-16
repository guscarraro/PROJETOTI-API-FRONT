import React from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

export default function TrashZone({
  draggingId,
  isBusy,
  onDeleteRow,          // Promise
  setDeletingRowId,
  setDraggingId,
  deletingRowId,
  canDeleteRowItem = () => true, // (rowId) => bool
}) {
  return (
    <div
      onDragOver={(e) => { if (draggingId && !isBusy) e.preventDefault(); }}
      onDrop={async (e) => {
        if (draggingId && !isBusy && onDeleteRow && !deletingRowId) {
          if (!canDeleteRowItem(draggingId)) {
            toast.error("Você não tem permissão para excluir esta atividade.");
            setDraggingId(null);
            return;
          }
          setDeletingRowId(draggingId); // apenas estado visual
          try {
            await onDeleteRow(draggingId);
          } catch (err) {
            const s = err?.response?.status;
            const d = err?.response?.data?.detail;
            if (s === 403) toast.error("Sem permissão para excluir esta atividade.");
            else if (s === 423) toast.error("Projeto bloqueado. Não é possível excluir a atividade.");
            else toast.error(d || "Falha ao excluir atividade.");
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
        ? <p><FiTrash2 /> Solte aqui para excluir a atividade</p>
        : null}
    </div>
  );
}
