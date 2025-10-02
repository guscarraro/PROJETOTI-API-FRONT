// src/pages/Projetos/ProjetoDetalhe/Timeline/hooks/useTimelineActions.js
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
  // ==== helpers ==============================================================
  const getActorSectorId = () => {
    const n = Number(actorSectorId);
    if (Number.isFinite(n)) return n;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      const sid = Array.isArray(u?.setor_ids) ? Number(u.setor_ids[0]) : undefined;
      if (Number.isFinite(sid)) return sid;
    } catch {}
    return undefined;
  };

  const getActorUserId = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?.id ? String(u.id) : undefined;
    } catch {
      return undefined;
    }
  };

  const normalizeSectorKeys = (keyOrKeys) => {
    if (keyOrKeys == null) return [];
    if (typeof keyOrKeys === "string") return [keyOrKeys];
    if (Array.isArray(keyOrKeys)) return keyOrKeys.flat().map(String);
    if (typeof keyOrKeys === "object" && typeof keyOrKeys.key === "string") {
      return [keyOrKeys.key];
    }
    return [];
  };

  const onlyDefined = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

  // ==== CELLS (cor, comentário, baseline) ===================================
  const upsertCellColor = (rowId, dayISO, color) =>
    apiLocal.upsertProjetoCell(projectId, rowId, dayISO, {
      color: color ?? "",
      actor_sector_id: Number(getActorSectorId()),
      actor_user_id: getActorUserId(),              // << ADICIONADO
    });

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

  const pickColorOptimistic = async (rowId, dayISO, color) => {
    let prevCell = null;
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
      await upsertCellColor(rowId, dayISO, color);
    } catch (err) {
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
        actor_sector_id: Number(getActorSectorId()),
        actor_user_id: getActorUserId(),            // já estava aqui
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
        actor_sector_id: Number(getActorSectorId()),
        actor_user_id: getActorUserId(),            // << ADICIONADO
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
        Number(getActorSectorId()),
        getActorUserId()
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

  // ==== ROWS (update composto, rename, setores, reorder, add) ================
  const updateRow = async (rowId, patchPayload) => {
    const sid = getActorSectorId();
    if (!Number.isFinite(sid)) {
      toast.error("Setor do ator não encontrado. Recarregue a página ou faça login novamente.");
      return;
    }

    const body = onlyDefined({
      title: patchPayload?.title?.trim?.() || patchPayload?.title,
      row_sectors: Array.isArray(patchPayload?.row_sectors)
        ? patchPayload.row_sectors.flat().map(String)
        : undefined,
      assignees: Array.isArray(patchPayload?.assignees)
        ? patchPayload.assignees.map(String)
        : undefined,
      stage_no: Number.isFinite(Number(patchPayload?.stage_no))
        ? Number(patchPayload.stage_no)
        : undefined,
      stage_label: patchPayload?.stage_label != null
        ? String(patchPayload.stage_label)
        : undefined,
      assignee_setor_id: Number.isFinite(Number(patchPayload?.assignee_setor_id))
        ? Number(patchPayload.assignee_setor_id)
        : undefined,
      actor_sector_id: sid,
    });

    try {
      await apiLocal.updateProjetoRow(projectId, rowId, body, sid);
      await fetchProjetoIfNeeded();
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
      await updateRow(rowId, { title: newTitle });
    } catch (e) {
      setRows(snapshot);
      if (!handleTimelineError(e)) throw e;
    }
  };

  const setRowSector = async (rowId, sectorKeyOrKeys) => {
    const row = rows.find((r) => r.id === rowId);
    const current = Array.isArray(row?.sectors) ? row.sectors : [];

    const next = Array.isArray(sectorKeyOrKeys)
      ? normalizeSectorKeys(sectorKeyOrKeys)
      : (current.includes(sectorKeyOrKeys)
          ? current.filter((k) => k !== sectorKeyOrKeys)
          : current.concat([sectorKeyOrKeys]));

    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, sectors: next } : r))
    );

    try {
      await updateRow(rowId, { row_sectors: next });
    } catch (e) {
      if (!handleTimelineError(e)) await fetchProjetoIfNeeded();
    }
  };

  const deleteRow = async (rowId) => {
    try {
      await apiLocal.deleteProjetoRow(projectId, rowId, Number(getActorSectorId()));
      setRows((prev) => prev.filter((r) => r.id !== rowId));
    } catch (e) {
      if (!handleTimelineError(e)) throw e;
    }
  };

  const handleReorderRows = async (newOrder) => {
    setRows(newOrder);
    const orders = [];
    for (let i = 0; i < newOrder.length; i++) {
      orders.push({ row_id: newOrder[i].id, order_index: i });
    }
    try {
      await apiLocal.reorderProjetoRows(projectId, orders, Number(getActorSectorId()));
    } catch {
      await fetchProjetoIfNeeded();
    }
  };

  const addRow = async (payload) => {
    const sid = getActorSectorId();
    if (!Number.isFinite(sid)) {
      toast.error("Setor do ator não encontrado. Recarregue a página ou faça login novamente.");
      return;
    }

    const body = {
      ...payload,
      row_sectors: Array.isArray(payload?.row_sectors)
        ? payload.row_sectors.flat().map(String)
        : [],
      assignees: Array.isArray(payload?.assignees)
        ? payload.assignees.map(String)
        : [],
      actor_sector_id: sid,
    };

    await apiLocal.addProjetoRow(projectId, body);
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

  const setRowAssignee = async (rowId, userIdOrNull, assigneeSetorId) => {
    const sid = getActorSectorId();
    if (!Number.isFinite(sid)) {
      toast.error("Setor do ator não encontrado. Recarregue a página ou faça login novamente.");
      return;
    }

    const snapshot = rows;

    setRows((prev) =>
      prev.map((r) =>
        String(r.id) === String(rowId)
          ? {
              ...r,
              assignees: userIdOrNull ? [String(userIdOrNull)] : [],
              ...(assigneeSetorId != null ? { assignee_setor_id: Number(assigneeSetorId) } : {}),
            }
          : r
      )
    );

    try {
      await apiLocal.setProjetoRowAssignee(projectId, rowId, {
        actor_sector_id: sid,
        assignee_user_id: userIdOrNull ? String(userIdOrNull) : null,
        ...(assigneeSetorId != null ? { assignee_setor_id: Number(assigneeSetorId) } : {}),
      });
      await fetchProjetoIfNeeded();
    } catch (e) {
      setRows(snapshot);
      if (!handleTimelineError(e)) {
        toast.error(e?.response?.data?.detail || "Falha ao atualizar responsável.");
      }
    }
  };

  return {
    // CELLS
    setCellColor,
    pickColorOptimistic,
    setCellComment,
    toggleBaseline,
    deleteComment,

    // ROWS
    updateRow,
    renameRow,
    setRowSector,
    deleteRow,
    handleReorderRows,
    setRowAssignee,

    // PROJECT
    addRow,
    addCosts,
  };
}
