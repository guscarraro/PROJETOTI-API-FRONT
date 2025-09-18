// useTimelinePerms.js
export default function useTimelinePerms({
  user,
  rows,
  sectorInitial,
  locked,
  timelineEnabled,
  sectors = [],
  project,                // ⬅️ precisamos do projeto para ler created_by_sector_id
}) {
  const norm = (s = "") =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // nomes/roles do usuário via setores
  const roleNames = [];
  if (Array.isArray(user?.setor_ids)) {
    for (let i = 0; i < user.setor_ids.length; i++) {
      const id = Number(user.setor_ids[i]);
      const name = norm(sectors.find((s) => Number(s.id) === id)?.nome || "");
      if (name && !roleNames.includes(name)) roleNames.push(name);
    }
  }
  if (Array.isArray(user?.setor_ids_names)) {
    for (let i = 0; i < user.setor_ids_names.length; i++) {
      const name = norm(String(user.setor_ids_names[i] || ""));
      if (name && !roleNames.includes(name)) roleNames.push(name);
    }
  }

  const isAdminRole = roleNames.includes("adm") || roleNames.includes("admin");
  const isDiretoriaRole = roleNames.includes("diretoria");

  const getCell = (rowId, dayISO) => {
    const r = (rows || []).find((x) => String(x.id) === String(rowId));
    return r?.cells?.[dayISO];
  };

  const canBase = !locked && !!timelineEnabled;
  const canEditColorCell = () => canBase;
  const canCreateCommentCell = () => canBase;

  const canDeleteCommentCell = (_rowId, _dayISO, c) => {
    if (isAdminRole || isDiretoriaRole) return true;

    const cid =
      c?.authorId ??
      c?.author_id ??
      c?.user_id ??
      c?.created_by ??
      null;

    if (cid && String(cid) === String(user?.id)) return true;

    const myInit = (sectorInitial || "U").toUpperCase();
    const cInit = ((c?.authorInitial || c?.author_initial) || "U").toUpperCase();
    return myInit === cInit;
  };

  const canToggleBaselineCell = (rowId, dayISO) => {
    if (!canBase) return false;
    const cell = getCell(rowId, dayISO);
    const lockedBy = cell?.baseline_locked_by || cell?.baselineLockedBy;
    if (lockedBy === "adm" || lockedBy === "admin") return isAdminRole;
    if (lockedBy === "diretoria") return isAdminRole || isDiretoriaRole;
    return true;
  };

  // ==== exclusão de row: admin/diretoria sempre podem;
  // caso contrário, o setor criador do PROJETO (created_by_sector_id)
  // pode excluir SE a row não tiver nenhum baseline.
  const resolveRow = (rowOrId) =>
    rowOrId && typeof rowOrId === "object"
      ? rowOrId
      : (rows || []).find((x) => String(x.id) === String(rowOrId));

  const rowHasAnyBaseline = (row) => {
    const cells = row?.cells;
    if (!cells) return false;
    if (Array.isArray(cells)) {
      return cells.some(
        (c) => !!(c?.baseline || c?.baseline_mark || c?.baselineMark)
      );
    }
    if (typeof cells === "object") {
      return Object.values(cells).some(
        (c) => !!(c?.baseline || c?.baseline_mark || c?.baselineMark)
      );
    }
    return false;
  };

  const userPrimarySectorId =
    Array.isArray(user?.setor_ids) && user.setor_ids.length
      ? Number(user.setor_ids[0])
      : null;

  const projectCreatorSectorId =
    project?.created_by_sector_id != null
      ? Number(project.created_by_sector_id)
      : null;

  const sameSectorAsProjectCreator =
    userPrimarySectorId != null &&
    projectCreatorSectorId != null &&
    userPrimarySectorId === projectCreatorSectorId;

  const canDeleteRowItem = (rowOrId) => {
    const row = resolveRow(rowOrId);
    if (!row) return false;

    if (isAdminRole || isDiretoriaRole) return true;

    if (sameSectorAsProjectCreator) {
      return !rowHasAnyBaseline(row);
    }

    return false;
  };

  return {
    isAdminRole,
    isDiretoriaRole,
    canEditColorCell,
    canCreateCommentCell,
    canDeleteCommentCell,
    canDeleteRowItem,
    canToggleBaselineCell,
  };
}
