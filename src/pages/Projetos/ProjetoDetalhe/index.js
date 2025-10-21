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

import ExcelJS from "exceljs";

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
    toggleCompleted,
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

  
      const handleExportExcel = async () => {
      try {
        if (!projeto || !Array.isArray(rows) || !Array.isArray(days) || rows.length === 0 || days.length === 0) {
          alert("Nada para exportar (verifique projeto/linhas/dias).");
          return;
        }
  
        // helpers
        const toARGB = (hex) => {
          if (!hex || typeof hex !== "string") return null;
          let h = hex.trim();
          if (h.startsWith("#")) h = h.slice(1);
          if (h.length === 3) {
            // #abc -> #aabbcc
            let r = h[0], g = h[1], b = h[2];
            h = r + r + g + g + b + b;
          }
          if (h.length !== 6) return null;
          return ("FF" + h).toUpperCase(); // alpha 100%
        };
  
        const fmtDay = (iso) => {
          // iso "YYYY-MM-DD"
          const [Y, M, D] = String(iso).split("-");
          return `${D}/${M}`; // cabeçalho curto
        };
  
        const usuariosIndex = usersIndex || {};
        const setorById = {};
        if (Array.isArray(sectors)) {
          for (let i = 0; i < sectors.length; i++) {
            const s = sectors[i];
            if (s && s.id != null) setorById[String(s.id)] = s.nome || String(s.id);
          }
        }
  
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Timeline");
  
        // Título / Info Projeto
        ws.mergeCells("A1:E1");
        ws.getCell("A1").value = `Projeto: ${projeto?.nome || ""}`;
        ws.getCell("A1").font = { bold: true, size: 14 }; 
  
        ws.addRow([]);
  
        // Cabeçalhos fixos
        const baseHeaders = [ "Demanda", "Setores", "Responsável", "Etapa Nº", "Etapa"];
        const dayHeaders = [];
        for (let i = 0; i < days.length; i++) {
          dayHeaders.push(fmtDay(days[i]));
        }
        const headers = baseHeaders.concat(dayHeaders);
        ws.addRow(headers);
        const headerRow = ws.lastRow;
        for (let c = 1; c <= headers.length; c++) {
          const cell = headerRow.getCell(c);
          cell.font = { bold: true };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        }
        ws.views = [{ state: "frozen", xSplit: 5, ySplit: 3 }]; // congela título+headers e 6 colunas fixas
  
        // Larguras
        const widths = [40, 22, 24, 10, 24];
        for (let i = 0; i < widths.length; i++) {
          ws.getColumn(i + 1).width = widths[i];
        }
        // colunas de dias
        const dayColStart = baseHeaders.length + 1;
        for (let i = 0; i < days.length; i++) {
          ws.getColumn(dayColStart + i).width = 4; // compacto
        }
  
        // Monta linhas
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i] || {};
  
          // Título
          const titulo = r.titulo || r.title || r.name || "";
  
          // Setores (aceita array de ids/keys/objetos; prioriza ids numéricos para nome)
          let setoresTxt = "";
          const setoresArr = Array.isArray(r.sectors) ? r.sectors : (r.sector ? [r.sector] : []);
          const setoresFmt = [];
          for (let s = 0; s < setoresArr.length; s++) {
            const tok = setoresArr[s];
            const asStr = String(tok?.id ?? tok);
            // tenta id numérico
            if (/^\d+$/.test(asStr) && setorById[asStr]) {
              setoresFmt.push(setorById[asStr]);
            } else if (typeof tok === "object" && tok?.label) {
              setoresFmt.push(String(tok.label));
            } else {
              setoresFmt.push(asStr);
            }
          }
          setoresTxt = setoresFmt.join(", ");
  
          // Responsável (primeiro assign, se houver)
          let responsavel = "";
          const assignees = Array.isArray(r.assignees) ? r.assignees : (Array.isArray(r.assigned_user_ids) ? r.assigned_user_ids : []);
          if (assignees.length > 0) {
            const id0 = String(assignees[0]);
            const u = usuariosIndex[id0];
            if (u) responsavel = u.nome || u.email || id0;
            else responsavel = id0;
          }
  
          // Etapa
          const etapaNo = Number(r.stageNo ?? r.stage_no) || "";
          const etapaLabel = r.stageLabel || r.stage_label || "";
  
          // Cria a row base
          const excelRowArr = [ titulo, setoresTxt, responsavel, etapaNo, etapaLabel];
          // Preenche placeholders para colunas de dias
          for (let d = 0; d < days.length; d++) {
            excelRowArr.push(""); // valor textual vazio (vamos colorir a célula)
          }
          ws.addRow(excelRowArr);
  
          // Estiliza as células de dias (cor/baseline/completed)
          const excelRow = ws.lastRow;
          const cellsObj = r.cells || {};
          for (let d = 0; d < days.length; d++) {
            const iso = days[d];
            const dayCell = cellsObj[iso] || {};
            const colIdx = dayColStart + d; // coluna Excel
            const xlCell = excelRow.getCell(colIdx);
  
            // cor
            const argb = toARGB(dayCell.color);
            if (argb) {
              xlCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb },
             };
            }
  
            // baseline -> borda superior mais grossa
            if (dayCell.baseline) {
              const prev = xlCell.border || {};
              xlCell.border = {
                top:   { style: "medium" },
                left:  prev.left  || { style: "thin" },
                right: prev.right || { style: "thin" },
                bottom: prev.bottom || { style: "thin" },
              };
            } else {
              // borda fina padrão (mantém grade)
              xlCell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            }
  
            // concluído -> adiciona "✓" centralizado
            if (dayCell.completed) {
              xlCell.value = "✓";
              xlCell.alignment = { horizontal: "center", vertical: "middle" };
              xlCell.font = { bold: true };
            }
          }
        }
  
        // salva
        const buf = await wb.xlsx.writeBuffer();
        const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const nome = `${(projeto?.nome || "projeto").replace(/[^\p{L}\p{N}\-_ ]/gu, "").trim().replace(/\s+/g, "_")}-timeline.xlsx`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error(err);
        alert("Falha ao exportar a timeline.");
      }
    };

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
            <Button
           color="success"
           outline
           onClick={handleExportExcel}
           disabled={!timelineEnabled || loading.any()}
           title="Exporta linhas e células da timeline (sem comentários)"
         >
           Exportar Timeline (Excel)
         </Button>
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
          onToggleCompleted={ readOnly || !timelineEnabled ? undefined : toggleCompleted }
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
