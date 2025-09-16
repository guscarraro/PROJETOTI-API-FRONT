export default function useTimelinePerms({
  user,
  rows,
  sectorInitial,
  locked,
  timelineEnabled,
  sectors = [],       // 👈 novo
}) {
  const norm = (s = "") =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // monte roleNames a partir dos ids do usuário + tabela de setores
  const roleNames = [];
  if (Array.isArray(user?.setor_ids)) {
    for (let i = 0; i < user.setor_ids.length; i++) {
      const id = Number(user.setor_ids[i]);
      const name = norm(sectors.find((s) => Number(s.id) === id)?.nome || "");
      if (name && !roleNames.includes(name)) roleNames.push(name);
    }
  }
  // fallback opcional caso você tenha esse campo em algum ambiente
  if (Array.isArray(user?.setor_ids_names)) {
    for (let i = 0; i < user.setor_ids_names.length; i++) {
      const name = norm(String(user.setor_ids_names[i] || ""));
      if (name && !roleNames.includes(name)) roleNames.push(name);
    }
  }

  const isAdminRole = roleNames.includes("adm") || roleNames.includes("admin");
  const isDiretoriaRole = roleNames.includes("diretoria");

  const getCell = (rowId, dayISO) => {
    const r = rows.find((x) => x.id === rowId);
    return r?.cells?.[dayISO];
  };

  const canBase = !locked && !!timelineEnabled;

  const canEditColorCell = () => canBase;
  const canCreateCommentCell = () => canBase;
  const canDeleteRowItem = () => isAdminRole || isDiretoriaRole;

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
