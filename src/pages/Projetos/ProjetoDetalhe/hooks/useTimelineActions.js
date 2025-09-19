import { toast } from "react-toastify";

export default function useTimelineActions({
  apiLocal,
  projectId,
  rows,
  setRows,
  actorSectorId,
  readOnly,
  timelineEnabled,
  fetchProjeto,
  fetchProjetoIfNeeded,
  handleTimelineError,
}) {
  // ===== helper só para request de COR (sem mexer em estado)
  const upsertCellColor = (rowId, dayISO, color) =>
    apiLocal.upsertProjetoCell(projectId, rowId, dayISO, {
      color: color ?? "",
      actor_sector_id: Number(actorSectorId),
    });

  // ===== server-first (mantém para usos não-otimistas)
  const setCellColor = async (rowId, dayISO, color) => {
    if (readOnly || !timelineEnabled) return;
    try {
      await upsertCellColor(rowId, dayISO, color);
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          const prevCell = r.cells?.[dayISO];
          const base = typeof prevCell === "object" ? prevCell : {};
          const nextCell = { ...base, color: color ?? "" };
          return { ...r, cells: { ...r.cells, [dayISO]: nextCell } };
        })
      );
    } catch (e) {
      if (!handleTimelineError(e)) await fetchProjetoIfNeeded();
    }
  };

  // ===== otimista só para COR
  const pickColorOptimistic = async (rowId, dayISO, color) => {
    let prevCell = null;

    // pinta na hora (optimistic)
    setRows((prev) => {
      const next = [];
      for (let i = 0; i < prev.length; i++) {
        const r = prev[i];
        if (String(r.id) !== String(rowId)) {
          next.push(r);
          continue;
        }
        const cells = { ...(r.cells || {}) };
        const existing = cells[dayISO] || null;
        prevCell = existing ? { ...existing } : null;
        cells[dayISO] = { ...(existing || {}), color };
        next.push({ ...r, cells });
      }
      return next;
    });

    try {
      await upsertCellColor(rowId, dayISO, color); // só request
    } catch (err) {
      // rollback
      setRows((prev) => {
        const next = [];
        for (let i = 0; i < prev.length; i++) {
          const r = prev[i];
          if (String(r.id) !== String(rowId)) {
            next.push(r);
            continue;
          }
          const cells = { ...(r.cells || {}) };
          if (prevCell) cells[dayISO] = prevCell;
          else delete cells[dayISO];
          next.push({ ...r, cells });
        }
        return next;
      });
      toast.error("Falha ao alterar a cor. Desfazendo.");
      if (!handleTimelineError(err)) await fetchProjetoIfNeeded();
      throw err;
    }
  };

  const setCellComment = async (rowId, dayISO, comment, authorInitial) => {
    if (readOnly || !timelineEnabled) return null;

    try {
      const res = await apiLocal.upsertProjetoCell(projectId, rowId, dayISO, {
        comment,
        author_initial: authorInitial,
        actor_sector_id: Number(actorSectorId),
      });

      const created = res?.data?.data?.comment || res?.data?.comment || null;

      if (created && created.id != null) {
        const norm = {
          id: String(created.id),
          authorInitial:
            (created.author_initial ||
              created.authorInitial ||
              authorInitial ||
              "U").toUpperCase(),
          message: created.message ?? comment,
          created_at: created.created_at || new Date().toISOString(),
          deleted: false,
          authorId: created.author_id ?? created.authorId,
        };

        setRows((prev) =>
          prev.map((r) => {
            if (r.id !== rowId) return r;
            const prevCell = r.cells?.[dayISO] || {};
            const prevComments = Array.isArray(prevCell.comments)
              ? prevCell.comments
              : [];
            const nextComments = prevComments.concat([norm]);
            return {
              ...r,
              cells: { ...r.cells, [dayISO]: { ...prevCell, comments: nextComments } },
            };
          })
        );

        return norm;
      } else {
        await fetchProjetoIfNeeded();
        return null;
      }
    } catch (e) {
      if (!handleTimelineError(e)) await fetchProjetoIfNeeded();
      return null;
    }
  };

  const toggleBaseline = async (rowId, dayISO, enabled) => {
    if (readOnly || !timelineEnabled) return;
    try {
      await apiLocal.upsertProjetoCell(projectId, rowId, dayISO, {
        baseline: enabled,
        actor_sector_id: Number(actorSectorId),
      });
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          const prevCell = r.cells?.[dayISO];
          const base = typeof prevCell === "object" ? prevCell : {};
          return {
            ...r,
            cells: { ...r.cells, [dayISO]: { ...base, baseline: !!enabled } },
          };
        })
      );
    } catch (e) {
      if (!handleTimelineError(e)) await fetchProjetoIfNeeded();
    }
  };

  const deleteComment = async (rowId, dayISO, commentId) => {
    try {
      await apiLocal.deleteProjetoCellComment(
        projectId,
        rowId,
        dayISO,
        commentId,
        Number(actorSectorId)
      );
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          const prevCell = r.cells?.[dayISO] || {};
          const prevComments = Array.isArray(prevCell.comments)
            ? prevCell.comments
            : [];
          const nextComments = prevComments.filter(
            (c) => String(c.id) !== String(commentId)
          );
          return {
            ...r,
            cells: { ...r.cells, [dayISO]: { ...prevCell, comments: nextComments } },
          };
        })
      );
    } catch (e) {
      const status = e?.response?.status;
      if (status === 403)
        toast.error("Sem permissão para apagar este comentário.");
      else if (status === 423)
        toast.error("Projeto bloqueado. Ação não permitida.");
      else toast.error(e?.response?.data?.detail || "Falha ao apagar comentário.");
    }
  };

  const deleteRow = async (rowId) => {
    try {
      await apiLocal.deleteProjetoRow(projectId, rowId, Number(actorSectorId));
      setRows((prev) => prev.filter((r) => r.id !== rowId));
    } catch (e) {
      if (!handleTimelineError(e)) throw e;
    }
  };

  const renameRow = async (rowId, newTitle) => {
    if (!newTitle || !rowId) return;
    const snapshot = rows;
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, titulo: newTitle } : r))
    );
    try {
      await apiLocal.updateProjetoRow(
        projectId,
        rowId,
        { title: newTitle, actor_sector_id: Number(actorSectorId) },
        Number(actorSectorId)
      );
    } catch (e) {
      setRows(snapshot);
      if (!handleTimelineError(e)) throw e;
    }
  };

  const setRowSector = async (rowId, sectorKey) => {
    const row = rows.find((r) => r.id === rowId);
    const current = Array.isArray(row?.sectors) ? row.sectors : [];
    const next = current.includes(sectorKey)
      ? current.filter((k) => k !== sectorKey)
      : current.concat([sectorKey]);

    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, sectors: next } : r))
    );

    try {
      const body = { row_sectors: next, actor_sector_id: Number(actorSectorId) };
      await apiLocal.updateProjetoRow(projectId, rowId, body, Number(actorSectorId));
    } catch (e) {
      if (!handleTimelineError(e)) await fetchProjetoIfNeeded();
    }
  };

  const handleReorderRows = async (newOrder) => {
    setRows(newOrder);
    const orders = [];
    for (let i = 0; i < newOrder.length; i++) {
      orders.push({ row_id: newOrder[i].id, order_index: i });
    }
    try {
      await apiLocal.reorderProjetoRows(projectId, orders, Number(actorSectorId));
    } catch {
      await fetchProjetoIfNeeded();
    }
  };

  const addRow = async ({ titulo, sectorKeys }) => {
    await apiLocal.addProjetoRow(
      projectId,
      { title: titulo, row_sectors: sectorKeys || [] },
      Number(actorSectorId)
    );
    await fetchProjetoIfNeeded();
  };

  const addCosts = async (costPayloadList) => {
    if (!Array.isArray(costPayloadList) || !costPayloadList.length) return;
    for (let i = 0; i < costPayloadList.length; i++) {
      const c = costPayloadList[i];
      const body = {
        description: c.descricao,
        total_value: Number(c.valorTotal),
        parcels: Number(c.parcelas || 1),
        first_due: c.firstDue,
        interval_days: Number(c.intervalDays || 30),
      };
      await apiLocal.addProjetoCustos(projectId, body);
    }
    await fetchProjetoIfNeeded();
  };

  return {
    // server-first
    setCellColor,
    setCellComment,
    toggleBaseline,
    deleteComment,
    deleteRow,
    renameRow,
    setRowSector,
    handleReorderRows,
    addRow,
    addCosts,
    // otimista
    pickColorOptimistic,
  };
}
