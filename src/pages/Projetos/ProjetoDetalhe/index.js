// src/pages/Projetos/ProjetoDetalhePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import AddCostModal from "../components/AddCostModal";
import CostsPopover from "../components/CostsPopover";
import ModalDemanda from "./ModalDemanda";
import { Page, Section, Overlay } from "../style";
import { PageLoader } from "../components/Loader";
import HeaderBar from "./HeaderBar";
import InfoSummary from "./InfoSummary";
import StatusMenu from "./StatusMenu";
import Timeline from "./Timeline";
import ModalEdit from "./ModalEdit";
import useLoading from "../../../hooks/useLoading";
import useProjetoData from "./hooks/useProjetoData";
import useTimelinePerms from "./hooks/useTimelinePerms";
import useTimelineActions from "./hooks/useTimelineActions";
import apiLocal from "../../../services/apiLocal";

export default function ProjetoDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loading = useLoading();

  // ui state
  const [openCost, setOpenCost] = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const [openDemanda, setOpenDemanda] = useState(false);
  const [statusMenu, setStatusMenu] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  // dados & derivados do hook principal do projeto
  const {
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
  } = useProjetoData({ projectId: id, loading });


  const readOnly = locked;
  const showLoader = !projeto || loading.any();

  // permissões (gates)
  const {
    isAdminRole,
    isDiretoriaRole,
    canEditColorCell,
    canCreateCommentCell,
    canDeleteCommentCell,
    canDeleteRowItem,
    canToggleBaselineCell,
    sameSectorAsProjectCreator,
  } = useTimelinePerms({
    user,
    rows,
    sectorInitial,
    locked: readOnly,
    timelineEnabled,
    sectors,
    project: projeto,
  });

  // ações da timeline
  const {
    setCellColor,
    pickColorOptimistic,
    setCellComment,
    toggleBaseline,
    deleteComment,
    deleteRow,
    renameRow,
    setRowSector,
    handleReorderRows,
    addRow,
    addCosts,
    setRowAssignee,
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    updateRow, // <-- PUT único (title,row_sectors,assignees,stage_no,stage_label,assignee_setor_id)
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  } = useTimelineActions({
    apiLocal,
    projectId: projeto?.id,
    rows,
    setRows,
    actorSectorId,
    readOnly,
    timelineEnabled,
    fetchProjeto,
    fetchProjetoIfNeeded,
    handleTimelineError,
  });

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

  const canSeeCosts =
    isAdminRole || isDiretoriaRole || sameSectorAsProjectCreator;

  const safeTotalCustos = canSeeCosts ? totalCustos : undefined;

  // ====== carregar todos os usuários ======
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await apiLocal.getUsuarios();
        const users = (r.data || []).map((u) => ({
          id: u.id,
          email: u.email,
          nome: u.nome || u.email,
          setor_ids: Array.isArray(u.setor_ids)
            ? u.setor_ids.map(Number)
            : u.setor_ids
            ? [Number(u.setor_ids)]
            : [],
        }));
        setAllUsers(users);
      } catch {
        setAllUsers([]);
      }
    })();
  }, []);

  // opções de setor usando IDs REAIS do projeto
  const sectorOptions = useMemo(() => {
    if (!projeto?.setores?.length) return [];
    return projeto.setores
      .map((sid) => {
        const s = sectors.find((x) => Number(x.id) === Number(sid));
        return s ? { key: Number(s.id), label: s.nome } : null;
      })
      .filter(Boolean);
  }, [projeto?.setores, sectors]);

  // mapa de usuários por setor (respeitando participantes do projeto)
  const usersBySector = useMemo(() => {
    const map = {};
    const allowedSetores = new Set((projeto?.setores || []).map(Number));
    const participants = projeto?.setor_users || {}; // { setor_id: [user_id] }

    for (const sid of allowedSetores) {
      let users = allUsers.filter((u) => u.setor_ids.includes(Number(sid)));
      const onlyIds = participants[sid];
      if (Array.isArray(onlyIds) && onlyIds.length) {
        const allowedIds = new Set(onlyIds.map(String));
        users = users.filter((u) => allowedIds.has(String(u.id)));
      }
      map[Number(sid)] = users;
    }
    return map;
  }, [allUsers, projeto?.setores, projeto?.setor_users]);

  const usersIndex = useMemo(() => {
    const idx = {};
    Object.values(usersBySector || {}).forEach((list) => {
      (list || []).forEach((u) => {
        idx[String(u.id)] = u;
      });
    });
    return idx;
  }, [usersBySector]);

  // etapas existentes derivadas das rows
  const stageDefs = useMemo(() => {
    const m = new Map();
    for (const r of rows || []) {
      const n = Number(r.stageNo || r.stage_no);
      if (!Number.isNaN(n) && n >= 1) {
        if (!m.has(n)) m.set(n, r.stageLabel || r.stage_label || "");
      }
    }
    return Array.from(m.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([no, label]) => ({ no, label }));
  }, [rows]);

  return (
    <Page>
      <PageLoader active={showLoader} text="Processando..." />
      <NavBar />

      <HeaderBar
        accent={accent}
        locked={locked}
        canUnlockByRole={canUnlockByRole}
        onToggleLock={toggleProjectLock}
        onBack={() => navigate("/Projetos")}
        onOpenCosts={canSeeCosts ? () => setOpenCost(true) : undefined}
        readOnly={readOnly || loading.any()}
        title={projeto?.nome}
      />

      <Section>
        {projeto && (
          <InfoSummary
            projeto={projeto}
            accent={accent}
            daysCount={days.length}
            totalCustos={safeTotalCustos}
            onOpenCosts={canSeeCosts ? () => setShowCosts(true) : undefined}
            onOpenStatusMenu={openStatusMenu}
            canChangeStatus={canUnlockByRole}
          />
        )}

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
          {(isAdminRole || isDiretoriaRole) && (
            <Button
              color="secondary"
              outline
              onClick={() => setOpenEdit(true)}
              disabled={loading.any()}
            >
              Editar nome/participantes
            </Button>
          )}
        </div>

        {/* ====== Timeline ====== */}
        <Timeline
          days={days}
          rows={rows}
          currentUserInitial={sectorInitial}
          currentUserId={user?.id}
          isAdmin={isAdminRole}
          onPickColor={
            readOnly || !timelineEnabled ? undefined : pickColorOptimistic
          }
          onSetCellComment={
            readOnly || !timelineEnabled ? undefined : setCellComment
          }
          onToggleBaseline={
            readOnly || !timelineEnabled ? undefined : toggleBaseline
          }
          onReorderRows={handleReorderRows}
          onDeleteRow={deleteRow}
          onDeleteComment={deleteComment}
          // legado ainda usado em outros pontos:
          onRenameRow={renameRow}
          onSetRowSector={
            readOnly || !timelineEnabled ? undefined : setRowSector
          }
          // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
          // NOVO: habilita PUT único da linha (resolve seu problema do payload)
          onUpdateRow={updateRow}
          // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          onChangeAssignee={setRowAssignee}
          canMarkBaseline={!readOnly && timelineEnabled}
          baselineColor="#0ea5e9"
          canReorderRows={!readOnly && timelineEnabled}
          isBusy={loading.any()}
          availableSectorKeys={projectSectorKeys}
          canEditColorCell={canEditColorCell}
          canCreateCommentCell={canCreateCommentCell}
          canDeleteCommentCell={canDeleteCommentCell}
          canDeleteRowItem={canDeleteRowItem}
          canToggleBaselineCell={canToggleBaselineCell}
          currentUserSectorId={actorSectorId}
          usersBySector={usersBySector}
          usersIndex={usersIndex}
        />
      </Section>

      {statusMenu && (
        <>
          <Overlay onClick={closeStatusMenu} />
          <StatusMenu
            x={statusMenu.x}
            y={statusMenu.y}
            onChangeStatus={async (st) => {
              await changeStatus(st);
              closeStatusMenu();
            }}
          />
        </>
      )}

      {canSeeCosts && showCosts && (
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
        onConfirm={async (payload) => {
          await addRow(payload);
          setOpenDemanda(false);
        }}
        sectorOptions={sectorOptions}
        usersBySector={usersBySector}
        stages={stageDefs}
      />

      <ModalEdit
        isOpen={openEdit}
        toggle={() => setOpenEdit(false)}
        project={projeto}
        sectors={sectors}
        actorSectorId={actorSectorId}
        canSave={isAdminRole}
        onSaved={(pLean) => {
          setProjeto((prev) =>
            prev
              ? {
                  ...prev,
                  ...pLean,
                  setores: Array.isArray(pLean?.setores)
                    ? pLean.setores
                    : prev.setores || [],
                }
              : pLean
          );
          fetchProjetoIfNeeded();
        }}
      />

      {canSeeCosts && (
        <AddCostModal
          isOpen={openCost}
          toggle={() => setOpenCost((v) => !v)}
          projectId={projeto?.id}
          actorSectorId={actorSectorId}
          onAdded={() => fetchProjetoIfNeeded()}
        />
      )}
    </Page>
  );
}
