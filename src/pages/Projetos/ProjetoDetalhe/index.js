import React, { useMemo, useState } from "react";
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

  // dados & derivados
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

  // ações da timeline (server-first)
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
  } = useTimelineActions({
    apiLocal, // se preferir, importe no topo
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
  // depois da destruturação acima:
  const canSeeCosts =
    isAdminRole || isDiretoriaRole || sameSectorAsProjectCreator;

  // options do modal de nova linha
  const sectorOptions = useMemo(() => {
    const norm = (s = "") =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, "_");
    const out = [];
    for (let i = 0; i < sectors.length; i++) {
      const s = sectors[i];
      if (projectSectorKeys.includes(norm(s.nome)))
        out.push({ key: norm(s.nome), label: s.nome });
    }
    return out;
  }, [sectors, projectSectorKeys]);
// ADICIONE
const safeTotalCustos = canSeeCosts ? totalCustos : undefined;

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
            // em InfoSummary:
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

        {/* ====== Timeline (filho) ====== */}
        <Timeline
          days={days}
          rows={rows}
          currentUserInitial={sectorInitial}
          currentUserId={user?.id}
          isAdmin={isAdminRole}
          onPickColor={readOnly || !timelineEnabled ? undefined : pickColorOptimistic}
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
          onRenameRow={renameRow}
          onDeleteRow={deleteRow}
          onDeleteComment={deleteComment}
          // gates de permissão
          canEditColorCell={canEditColorCell}
          canCreateCommentCell={canCreateCommentCell}
          canDeleteCommentCell={canDeleteCommentCell}
          canDeleteRowItem={canDeleteRowItem}
          canToggleBaselineCell={canToggleBaselineCell}
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
        onConfirm={async ({ titulo, sectorKeys }) => {
          await addRow({ titulo, sectorKeys });
          setOpenDemanda(false);
        }}
        sectorOptions={sectorOptions}
      />
      <ModalEdit
        isOpen={openEdit}
        toggle={() => setOpenEdit(false)}
        project={projeto}
        sectors={sectors}
        actorSectorId={actorSectorId}
        canSave={isAdminRole} // só Admin salva; Diretoria pode visualizar
        onSaved={(pLean) => {
          // mescla campos lean no projeto atual sem perder custos/rows carregados
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
          // opcional: garantir que cache/derivados atualizem
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
