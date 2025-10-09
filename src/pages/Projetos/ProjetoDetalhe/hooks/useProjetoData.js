import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { STATUS, rangeDays } from "../../utils";
import apiLocal from "../../../../services/apiLocal";
import { useNavigate } from "react-router-dom";
const STATUS_COLORS = {
  ANDAMENTO: "#10b981",
  STANDBY: "#f59e0b",
  CANCELADO: "#ef4444",
  CONCLUIDO: "#34d399",
};

export default function useProjetoData({ projectId, loading }) {
  const [open, setOpen] = useState(false); // placeholder se quiser
  const [projeto, setProjeto] = useState(null);
  const [rows, setRows] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [locked, setLocked] = useState(false);
  const [timelineEnabled, setTimelineEnabled] = useState(true);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const actorSectorId = useMemo(() => {
    const ids = Array.isArray(user?.setor_ids) ? user.setor_ids : [];
    if (!ids.length) return null;

    // se ainda não carregou setores, usa o primeiro como fallback
    if (!Array.isArray(sectors) || !sectors.length) {
      const n = Number(ids[0]);
      return Number.isFinite(n) ? n : null;
    }

    const norm = (s = "") =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    let chosen = null;
    let fallback = null;

    for (let i = 0; i < ids.length; i++) {
      const id = Number(ids[i]);
      if (!Number.isFinite(id)) continue;
      if (fallback == null) fallback = id;

      const name = norm(sectors.find((s) => Number(s.id) === id)?.nome || "");
      if (name === "adm" || name === "admin") {
        chosen = id; // prioridade máxima
        break;
      }
      if (!chosen && name === "diretoria") {
        chosen = id; // segunda prioridade (mantém chance de achar ADM depois)
      }
    }

    return chosen ?? fallback;
  }, [user, sectors]);

  const norm = (s = "") =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\s+/g, "_");
  const keyFromId = (sid) => {
    const s = sectors.find((x) => Number(x.id) === Number(sid));
    return s ? norm(s.nome) : null;
  };
  const idsToKeys = (arr) =>
    Array.isArray(arr) ? arr.map((id) => keyFromId(id)).filter(Boolean) : [];

  const fetchSectors = useCallback(async () => {
    try {
      const r = await apiLocal.getSetores();
      setSectors(r.data || []);
    } catch {
      setSectors([]);
    }
  }, []);

  const fetchingRef = useRef(false);
const fetchProjeto = useCallback(async () => {
  if (fetchingRef.current) return;
  fetchingRef.current = true;
  try {
    const r = await apiLocal.getProjetoById(projectId, { user_id: user?.id });
    const data = r.data?.data || r.data;
    setProjeto(data);

    const rawRows = Array.isArray(data?.rows) ? data.rows : [];
    const fixed = rawRows.map((row) => {
      const arr = Array.isArray(row?.sectors) ? row.sectors : [];
      const numLike = [];
      let allNumLike = true;
      for (let i = 0; i < arr.length; i++) {
        const v = arr[i];
        if (typeof v === "number" && Number.isFinite(v)) { numLike.push(v); continue; }
        if (typeof v === "string" && /^\d+$/.test(v)) { numLike.push(Number(v)); continue; }
        allNumLike = false; break;
      }
      return allNumLike ? { ...row, sectors: idsToKeys(numLike) } : row;
    });
    setRows(fixed);
    setLocked(Boolean(data?.locked));
  } catch (e) {
    if (e?.response?.status === 403) {
      toast.error("Sem permissão para acessar este projeto.");
      navigate("/Projetos", { replace: true });
      return; // evita rethrow
    }
    throw e; // outros erros seguem o fluxo normal
  } finally {
    fetchingRef.current = false;
  }
}, [projectId, sectors, user?.id, navigate]);

  useEffect(() => {
    loading.wrap("bootstrap", async () => {
      await fetchSectors();
      await fetchProjeto();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const accent = useMemo(
    () => STATUS_COLORS[projeto?.status] || "#111827",
    [projeto]
  );

  const mySectorNames = useMemo(() => {
    if (!Array.isArray(user?.setor_ids) || !sectors.length) return [];
    const names = [];
    for (let i = 0; i < user.setor_ids.length; i++) {
      const sid = user.setor_ids[i];
      const nome = sectors.find((s) => Number(s.id) === Number(sid))?.nome;
      if (nome) {
        const clean = (nome || "").trim().toLowerCase();
        if (!names.includes(clean)) names.push(clean);
      }
    }
    return names;
  }, [user, sectors]);

  const isAdmin = useCallback(
    () => mySectorNames.some((n) => n === "adm" || n === "admin"),
    [mySectorNames]
  );
  const isDiretoria = useCallback(
    () => mySectorNames.some((n) => n === "diretoria"),
    [mySectorNames]
  );

  const canUnlockByRole = useMemo(() => {
    if (!projeto) return false;
    if (!projeto.locked) return true;
    if (projeto.lock_by === "adm") return isAdmin();
    if (projeto.lock_by === "diretoria") return isAdmin() || isDiretoria();
    const isCreator =
      Number(actorSectorId) === Number(projeto.created_by_sector_id);
    return isAdmin() || isDiretoria() || isCreator;
  }, [projeto, actorSectorId, isAdmin, isDiretoria]);

  const projectSectorKeys = useMemo(
    () => idsToKeys(projeto?.setores || []),
    [projeto?.setores, sectors]
  );

  const days = useMemo(() => {
    if (!projeto?.inicio || !projeto?.fim) return [];
    return rangeDays(projeto.inicio, projeto.fim);
  }, [projeto?.inicio, projeto?.fim]);

  // sem reduce
  const totalCustos = useMemo(() => {
    const custos = Array.isArray(projeto?.custos) ? projeto.custos : [];
    let total = 0;
    for (let i = 0; i < custos.length; i++) {
      const c = custos[i];
      const val = Number(c.valorTotal ?? c.total_value ?? 0);
      total += val;
    }
    return total;
  }, [projeto?.custos]);

  const sectorInitial = useMemo(() => {
    const nome = sectors.find(
      (s) => Number(s.id) === Number(actorSectorId)
    )?.nome;
    return nome?.trim()?.[0]?.toUpperCase() || "U";
  }, [actorSectorId, sectors]);

  const handleTimelineError = (err) => {
    const status = err?.response?.status;
    if (status === 501) {
      setTimelineEnabled(false);
      toast.error(
        "Timeline não habilitada no banco (tabelas ausentes). Contate o admin."
      );
      return true;
    }
    if (status === 423) {
      toast.warning("Projeto bloqueado: não é possível criar/editar tarefas.");
      return true;
    }
    if (status === 404) {
      toast.error("Atividade/célula não encontrada.");
      return true;
    }
    if (status === 403) {
      toast.error("Sem permissão para executar esta ação.");
      return true;
    }
    if (status >= 500) {
      toast.error(
        err?.response?.data?.detail ||
          "Erro no servidor ao atualizar a timeline."
      );
      return true;
    }
    return false;
  };

  const toggleProjectLock = async () => {
    if (!projeto || !actorSectorId) return;
    await loading.wrap("lock", async () => {
      try {
        const action = locked ? "unlock" : "lock";
        const res = await apiLocal.lockProjeto(
          projeto.id,
          action,
          Number(actorSectorId)
        );
        const updated = res.data?.data || res.data;
        setProjeto(updated);
        setRows(updated?.rows || []);
        setLocked(Boolean(updated?.locked));
      } catch (e) {
        if (e?.response?.status === 403) {
          toast.error("Sem permissão para alterar o lock deste projeto.");
          return;
        }
        throw e;
      }
    });
  };

  const changeStatus = async (status) => {
    if (!projeto || !actorSectorId) return;
    await loading.wrap("status", async () => {
      try {
        const res = await apiLocal.changeProjetoStatus(
          projeto.id,
          status,
          Number(actorSectorId)
        );
        const updated = res.data?.data || res.data;
        setProjeto(updated);
        setRows(updated?.rows || []);
      } catch (e) {
        // 👇 não quebra a página, só avisa
        if (e?.response?.status === 403) {
          toast.error("Sem permissão para alterar o status deste projeto.");
          return;
        }
        if (!handleTimelineError(e)) throw e;
      }
    });
  };

  const fetchProjetoIfNeeded = async () => {
    await fetchProjeto();
  };

  return {
    user,
    actorSectorId,
    projeto,
    setProjeto,
    rows,
    setRows,
    sectors,
    projectSectorKeys,
    locked,
    setLocked,
    days,
    totalCustos,
    accent,
    sectorInitial,
    canUnlockByRole,
    timelineEnabled,
    setTimelineEnabled,
    fetchProjeto,
    fetchProjetoIfNeeded,
    changeStatus,
    toggleProjectLock,
    handleTimelineError,
  };
}
