import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  Page,
  TitleBar,
  H1,
  Actions,
  Section,
  InfoGrid,
  MenuBox,
  MenuItem,
  Overlay,
} from "../style";
import { STATUS, rangeDays } from "../utils";
import Timeline from "../components/Timeline";
import AddCostModal from "../components/AddCostModal";
import CostsPopover from "../components/CostsPopover";
import {
  StatusCard,
  DateCard,
  DaysCard,
  CostsCard,
} from "../components/InfoCards";
import NavBar from "../components/NavBar";
import { FiLock, FiUnlock } from "react-icons/fi";
import apiLocal from "../../../services/apiLocal";
import useLoading from "../../../hooks/useLoading";
import { toast } from "react-toastify";
import { PageLoader } from "../components/Loader";
import { LuArrowBigLeft } from "react-icons/lu";
import ModalDemanda from "./ModalDemanda";

const STATUS_COLORS = {
  ANDAMENTO: "#10b981",
  STANDBY: "#f59e0b",
  CANCELADO: "#ef4444",
  CONCLUIDO: "#34d399",
};

export default function ProjetoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loading = useLoading();

  const [openCost, setOpenCost] = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const [projeto, setProjeto] = useState(null);
  const [rows, setRows] = useState([]);
  const [locked, setLocked] = useState(false);
  const [timelineEnabled, setTimelineEnabled] = useState(true);
  const [openDemanda, setOpenDemanda] = useState(false);
  const showLoader = !projeto || loading.any();

  const [statusMenu, setStatusMenu] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const actorSectorId = useMemo(() => {
    const first =
      Array.isArray(user?.setor_ids) && user.setor_ids.length
        ? user.setor_ids[0]
        : null;
    const n = Number(first);
    return Number.isFinite(n) ? n : null;
  }, [user]);

  const [sectors, setSectors] = useState([]);
  const mySectorNames = useMemo(() => {
    if (!Array.isArray(user?.setor_ids) || !sectors.length) return [];
    const names = user.setor_ids
      .map((sid) => sectors.find((s) => Number(s.id) === Number(sid))?.nome)
      .filter(Boolean)
      .map((s) => (s || "").trim().toLowerCase());
    return Array.from(new Set(names));
  }, [user, sectors]);

  const isAdmin = useCallback(
    () => mySectorNames.some((n) => n === "adm" || n === "admin"),
    [mySectorNames]
  );
  const isDiretoria = useCallback(
    () => mySectorNames.some((n) => n === "diretoria"),
    [mySectorNames]
  );

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
  const keyToId = (key) => {
    const s = sectors.find((x) => norm(x.nome) === norm(key));
    return s ? Number(s.id) : null;
  };

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
      const r = await apiLocal.getProjetoById(id);
      const data = r.data?.data || r.data;
      setProjeto(data);
      const rawRows = Array.isArray(data?.rows) ? data.rows : [];
      const fixed = rawRows.map((row) => {
        const arr = Array.isArray(row?.sectors) ? row.sectors : [];
        const isNumeric = arr.some((v) => typeof v === "number");
        return isNumeric ? { ...row, sectors: idsToKeys(arr) } : row;
      });
      setRows(fixed);
      setLocked(Boolean(data?.locked));
    } finally {
      fetchingRef.current = false;
    }
  }, [id, sectors]);

  useEffect(() => {
    loading.wrap("bootstrap", async () => {
      await fetchSectors();
      await fetchProjeto();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const accent = useMemo(
    () => STATUS_COLORS[projeto?.status] || "#111827",
    [projeto]
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

  const projectSectorKeys = useMemo(() => {
    return idsToKeys(projeto?.setores || []);
  }, [projeto?.setores, sectors]);

  const readOnly = locked;

  const days = useMemo(() => {
    if (!projeto?.inicio || !projeto?.fim) return [];
    return rangeDays(projeto.inicio, projeto.fim);
  }, [projeto?.inicio, projeto?.fim]);

  const totalCustos = useMemo(() => {
    const custos = Array.isArray(projeto?.custos) ? projeto.custos : [];
    return custos.reduce(
      (acc, c) => acc + Number(c.valorTotal ?? c.total_value ?? 0),
      0
    );
  }, [projeto?.custos]);

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
    });
  };

  const changeStatus = async (status) => {
    if (!projeto || !actorSectorId) return;
    await loading.wrap("status", async () => {
      const res = await apiLocal.changeProjetoStatus(
        projeto.id,
        status,
        Number(actorSectorId)
      );
      const updated = res.data?.data || res.data;
      setProjeto(updated);
      setRows(updated?.rows || []);
    });
    closeStatusMenu();
  };

  const openStatusMenu = (e) => {
    if (!canUnlockByRole) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const W = 220,
      H = 180,
      M = 8;
    const left = Math.max(M, Math.min(rect.left, window.innerWidth - W - M));
    const top = Math.max(
      M,
      Math.min(rect.bottom + 8, window.innerHeight - H - M)
    );
    setStatusMenu({ x: left, y: top });
  };
  const closeStatusMenu = () => setStatusMenu(null);

  const fetchProjetoIfNeeded = async () => {
    await fetchProjeto();
  };

  // ---------- NOVOS HANDLERS (UI otimista) ----------
  const renameRow = async (rowId, newTitle) => {
    if (!newTitle || !rowId) return;
    const snapshot = rows;
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, titulo: newTitle } : r))
    );
    try {
      await apiLocal.updateProjetoRow(
        projeto.id,
        rowId,
        { title: newTitle, actor_sector_id: Number(actorSectorId) },
        Number(actorSectorId)
      );
    } catch (e) {
      setRows(snapshot);
      if (!handleTimelineError(e)) throw e;
    }
  };

  const deleteRow = async (rowId) => {
    const snapshot = rows;
    setRows((prev) => prev.filter((r) => r.id !== rowId));
    try {
      await apiLocal.deleteProjetoRow(projeto.id, rowId, Number(actorSectorId));
    } catch (e) {
      setRows(snapshot);
      if (!handleTimelineError(e)) throw e;
    }
  };

// remove 1 comentário da célula enviando o array completo (sem o item)
const deleteComment = async (rowId, dayISO, commentId) => {
  const nextRows = rows.map((r) => {
    if (r.id !== rowId) return r;
    const prevCell = r.cells?.[dayISO] || {};
    const prevComments = Array.isArray(prevCell.comments) ? prevCell.comments : [];
    const nextComments = prevComments.filter((c) => String(c.id) !== String(commentId));
    const nextCell = { ...prevCell, comments: nextComments };
    return { ...r, cells: { ...r.cells, [dayISO]: nextCell } };
  });
  setRows(nextRows);

  try {
    await apiLocal.upsertProjetoCell(projeto.id, rowId, dayISO, {
      comments: nextRows.find(r => r.id === rowId)?.cells?.[dayISO]?.comments || [],
      actor_sector_id: Number(actorSectorId),
    });
  } catch (e) {
    // volta estado se falhar
    await fetchProjeto();
  }
};


  const handleReorderRows = async (newOrder) => {
    setRows(newOrder);
    const orders = newOrder.map((r, idx) => ({
      row_id: r.id,
      order_index: idx,
    }));
    try {
      await loading.wrap("reorderRows", async () =>
        apiLocal.reorderProjetoRows(projeto.id, orders, Number(actorSectorId))
      );
    } catch {
      await fetchProjetoIfNeeded();
    }
  };

  const addRow = async () => {
    if (locked) return;
    const titulo = prompt("Descritivo da etapa/demanda:");
    if (!titulo) return;
    await loading.wrap("addRow", async () => {
      try {
        await apiLocal.addProjetoRow(
          projeto.id,
          { title: titulo, row_sectors: [] },
          Number(actorSectorId)
        );
        await fetchProjetoIfNeeded();
      } catch (e) {
        if (!handleTimelineError(e)) throw e;
      }
    });
  };

  const setRowSector = async (rowId, sectorKey) => {
    if (locked) return;
    const row = rows.find((r) => r.id === rowId);
    const current = Array.isArray(row?.sectors) ? row.sectors : [];
    const next = current.includes(sectorKey)
      ? current.filter((k) => k !== sectorKey)
      : [...current, sectorKey];
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, sectors: next } : r))
    );
    try {
      const body = { row_sectors: next, actor_sector_id: Number(actorSectorId) };
      await apiLocal.updateProjetoRow(
        projeto.id,
        rowId,
        body,
        Number(actorSectorId)
      );
    } catch (e) {
      if (!handleTimelineError(e)) fetchProjetoIfNeeded();
    }
  };

  const sectorInitial = useMemo(() => {
    const nome = sectors.find(
      (s) => Number(s.id) === Number(actorSectorId)
    )?.nome;
    return nome?.trim()?.[0]?.toUpperCase() || "U";
  }, [actorSectorId, sectors]);

  const setCellColor = async (rowId, dayISO, color) => {
    if (locked || !timelineEnabled) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const prevCell = r.cells?.[dayISO];
        const nextCell =
          typeof prevCell === "object" ? { ...prevCell, color } : { color };
        return { ...r, cells: { ...r.cells, [dayISO]: nextCell } };
      })
    );
    try {
      await apiLocal.upsertProjetoCell(projeto.id, rowId, dayISO, {
        color: color ?? "",
        actor_sector_id: Number(actorSectorId),
      });
    } catch (e) {
      if (!handleTimelineError(e)) fetchProjetoIfNeeded();
    }
  };

  const setCellComment = async (rowId, dayISO, comment, authorInitialArg) => {
    if (locked || !timelineEnabled) return;
    const authorInitial = (authorInitialArg || sectorInitial || "U").toUpperCase();

    // UI otimista: adiciona comentário ao array da célula
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const prevCell = r.cells?.[dayISO] || {};
        const prevComments = Array.isArray(prevCell.comments)
          ? prevCell.comments
          : [];
        const nextComments = [
          ...prevComments,
          {
            id: `tmp-${Date.now()}`,
            authorInitial,
            message: comment,
            created_at: new Date().toISOString(),
            deleted: false,
          },
        ];
        return {
          ...r,
          cells: {
            ...r.cells,
            [dayISO]: { ...prevCell, comments: nextComments },
          },
        };
      })
    );

    try {
      await apiLocal.upsertProjetoCell(projeto.id, rowId, dayISO, {
        comment,
        author_initial: authorInitial,
        actor_sector_id: Number(actorSectorId),
      });
    } catch (e) {
      if (!handleTimelineError(e)) fetchProjetoIfNeeded();
    }
  };

  const toggleBaseline = async (rowId, dayISO, enabled) => {
    if (locked || !timelineEnabled) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const prevCell = r.cells?.[dayISO];
        const nextCell = {
          ...(typeof prevCell === "object" ? prevCell : {}),
          baseline: enabled,
        };
        return { ...r, cells: { ...r.cells, [dayISO]: nextCell } };
      })
    );
    try {
      await apiLocal.upsertProjetoCell(projeto.id, rowId, dayISO, {
        baseline: enabled,
        actor_sector_id: Number(actorSectorId),
      });
    } catch (e) {
      if (!handleTimelineError(e)) fetchProjetoIfNeeded();
    }
  };

  const addCosts = async (costPayloadList) => {
    if (locked || !Array.isArray(costPayloadList) || !costPayloadList.length)
      return;
    await loading.wrap("addCosts", async () => {
      for (const c of costPayloadList) {
        const body = {
          description: c.descricao,
          total_value: Number(c.valorTotal),
          parcels: Number(c.parcelas || 1),
          first_due: c.firstDue,
          interval_days: Number(c.intervalDays || 30),
        };
        await apiLocal.addProjetoCustos(projeto.id, body);
      }
      await fetchProjetoIfNeeded();
    });
  };

  const sectorOptions = useMemo(() => {
    const norm = (s = "") =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, "_");
    return sectors
      .filter((s) => projectSectorKeys.includes(norm(s.nome)))
      .map((s) => ({ key: norm(s.nome), label: s.nome }));
  }, [sectors, projectSectorKeys]);

  if (!projeto) {
    return (
      <Page>
        <PageLoader active={showLoader} text="Processando..." />
        <NavBar />
      </Page>
    );
  }

  return (
    <Page>
      <PageLoader active={showLoader} text="Processando..." />
      <NavBar />

      <TitleBar>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button color="secondary" onClick={() => navigate("/Projetos")}>
            <LuArrowBigLeft /> Voltar
          </Button>
          <H1 $accent={accent}>{projeto.nome}</H1>
        </div>
        <Actions>
          <Button
            color={locked ? "secondary" : "dark"}
            onClick={toggleProjectLock}
            title={locked ? "Destrancar" : "Trancar"}
            disabled={!canUnlockByRole || loading.any()}
          >
            {locked ? <FiLock size={16} /> : <FiUnlock size={16} />}
          </Button>

          <Button
            color="warning"
            onClick={() => setOpenCost(true)}
            disabled={readOnly || loading.any()}
          >
            Adicionar custo
          </Button>
        </Actions>
      </TitleBar>

      <Section>
        <InfoGrid>
          <div
            onClick={openStatusMenu}
            style={{ cursor: canUnlockByRole ? "pointer" : "default" }}
          >
            <StatusCard
              status={STATUS[projeto.status] || projeto.status}
              accent={accent}
            />
          </div>
          <DateCard label="Início" dateISO={projeto.inicio} />
          <DateCard label="Previsão de término" dateISO={projeto.fim} />
          <DaysCard total={days.length} />
          <CostsCard
            totalBRL={totalCustos.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            onClick={() => setShowCosts(true)}
          />
        </InfoGrid>

        {!timelineEnabled && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Timeline indisponível (tabelas não encontradas).
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Button
            color="info"
            outline
            onClick={() => setOpenDemanda(true)}
            disabled={locked || loading.any() || !timelineEnabled}
          >
            + Nova linha (demanda)
          </Button>
        </div>

        <Timeline
          days={days}
          rows={rows}
          currentUserInitial={sectorInitial}
          onPickColor={readOnly || !timelineEnabled ? undefined : setCellColor}
          onSetCellComment={
            readOnly || !timelineEnabled ? undefined : setCellComment
          }
          onSetRowSector={
            readOnly || !timelineEnabled ? undefined : setRowSector
          }
          canMarkBaseline={!readOnly && timelineEnabled}
          baselineColor="#0ea5e9"
          onToggleBaseline={
            readOnly || !timelineEnabled ? undefined : toggleBaseline
          }
          canReorderRows={!readOnly && timelineEnabled}
          onReorderRows={handleReorderRows}
          isBusy={loading.any()}
          availableSectorKeys={projectSectorKeys}
          // novos:
          onRenameRow={renameRow}
          onDeleteRow={deleteRow}
          onDeleteComment={deleteComment}
        />
      </Section>

      {statusMenu && canUnlockByRole && (
        <>
          <Overlay onClick={closeStatusMenu} />
          <MenuBox
            style={{
              position: "fixed",
              left: statusMenu.x,
              top: statusMenu.y,
              zIndex: 1100,
              width: 220,
            }}
          >
            <MenuItem onClick={() => changeStatus("ANDAMENTO")}>
              Em andamento
            </MenuItem>
            <MenuItem onClick={() => changeStatus("STANDBY")}>
              Stand by
            </MenuItem>
            <MenuItem onClick={() => changeStatus("CONCLUIDO")}>
              Concluído
            </MenuItem>
            <MenuItem onClick={() => changeStatus("CANCELADO")}>
              Cancelado
            </MenuItem>
          </MenuBox>
        </>
      )}

      {showCosts && (
        <CostsPopover
          projectId={projeto?.id}
          actorSectorId={actorSectorId}
          custos={projeto?.custos || []}
          onClose={() => setShowCosts(false)}
        />
      )}
      <ModalDemanda
        isOpen={openDemanda}
        toggle={() => setOpenDemanda(false)}
        onConfirm={async ({ titulo, sectorKeys }) => {
          if (locked) return toast.warning("Projeto bloqueado.");
          await loading.wrap("addRow", async () => {
            try {
              await apiLocal.addProjetoRow(
                projeto.id,
                { title: titulo, row_sectors: sectorKeys || [] },
                Number(actorSectorId)
              );
              await fetchProjetoIfNeeded();
              setOpenDemanda(false);
            } catch (e) {
              if (!handleTimelineError(e)) throw e;
            }
          });
        }}
        sectorOptions={sectorOptions}
      />
      <AddCostModal
        isOpen={openCost}
        toggle={() => setOpenCost((v) => !v)}
        projectId={projeto?.id}
        actorSectorId={actorSectorId}
        onAdded={() => fetchProjetoIfNeeded()}
      />
    </Page>
  );
}
