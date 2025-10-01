// src/pages/Projetos/ProjetoDetalhe/Timeline/index.jsx
import React, { useRef, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  TimelineWrap,
  ContentGrid,
  Overlay,
  SectorFilterBar,
  FilterLabel,
  MyCommentsBtn,
} from "../../style";
import { ALL_SECTORS, COLOR_PALETTE, monthBgTones } from "./constants";
import useMonthsSegments from "./hooks/useMonthsSegments";
import useEscapeClose from "./hooks/useEscapeClose";
import useDnDRows from "./hooks/useDnDRows";

import LegendBar from "./LegendBar";
import LeftColumn from "./LeftColumn";
import RightGrid from "./RightGrid";
import SectorMenu from "./SectorMenu";
import PaletteMenu from "./PaletteMenu";
import Tooltip from "./Tooltip";
import TrashZone from "./TrashZone";
import { SectorDropdown } from "./SectorDropdown";
import ModalDetalheComment from "./ModalDetalheComment";
import ModalEditRow from "./ModalEditRow";
import AssigneeMenu from "./AssigneeMenu";

/**
 * Props esperados:
 * - onPickColor, onSetCellComment, onToggleBaseline, onDeleteComment
 * - onReorderRows, onDeleteRow
 * - onRenameRow? (compat), onSetRowSector? (compat), onSetRowStage? (compat), onSetRowAssignees? (compat)
 * - onUpdateRow?  << preferido: PUT único (title,row_sectors,assignees,stage_no,stage_label,assignee_setor_id)
 */
export default function Timeline({
  days = [],
  rows = [],
  currentUserId,
  currentUserInitial = "U",
  currentUserSectorId,
  isAdmin = false,

  onPickColor,
  onSetCellComment,
  onToggleBaseline,
  onReorderRows,
  onDeleteRow,
  onDeleteComment,

  // compat:
  onRenameRow,
  onSetRowSector,
  onSetRowStage,
  onSetRowAssignees,

  // novo preferido:
  onUpdateRow,
  onChangeAssignee,
  canMarkBaseline = false,
  baselineColor = "#111827",
  canReorderRows = false,
  isBusy = false,
  availableSectorKeys = [],
  canEditColorCell = () => true,
  canToggleBaselineCell = () => true,
  canCreateCommentCell = () => true,
  canDeleteCommentCell,
  canOpenPaletteCell,
  usersIndex = {},
  usersBySector = {},
}) {
  const scrollerRef = useRef(null);
  const firstColRef = useRef(null);

  const passWheelToRight = (e) => {
    if (scrollerRef.current) scrollerRef.current.scrollTop += e.deltaY;
  };
  const syncLeftScroll = (e) => {
    if (firstColRef.current)
      firstColRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  // ===== MAPAS DE SETOR =====
  const sectorMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < ALL_SECTORS.length; i++) {
      const s = ALL_SECTORS[i];
      map[s.key] = s;
    }
    return map;
  }, []);

  const sectorKeyById = useMemo(() => {
    const m = {};
    for (let i = 0; i < ALL_SECTORS.length; i++) {
      const s = ALL_SECTORS[i];
      if (s.id != null) m[String(s.id)] = s.key;
    }
    return m;
  }, []);

  // mapeia KEY -> ID (string) para lookup no menu
  const sectorIdByKey = useMemo(() => {
    const m = {};
    for (const s of ALL_SECTORS) {
      if (s?.key) m[s.key] = s?.id != null ? String(s.id) : null;
    }
    return m;
  }, []);

  const tokenToKey = (tok) => {
    if (!tok) return null;
    if (typeof tok === "string" && sectorMap[tok]) return tok;
    if (
      typeof tok === "object" &&
      typeof tok.key === "string" &&
      sectorMap[tok.key]
    )
      return tok.key;
    if (typeof tok === "string" && /^[0-9]+$/.test(tok) && sectorKeyById[tok])
      return sectorKeyById[tok];
    if (typeof tok === "number" && sectorKeyById[String(tok)])
      return sectorKeyById[String(tok)];
    return null;
  };

  // usersBySector pode vir por id — normaliza para key
  const usersBySectorKey = useMemo(() => {
    const keys = Object.keys(usersBySector || {});
    if (!keys.length) return {};
    const alreadyKeys = keys.some((k) => typeof k === "string" && sectorMap[k]);
    if (alreadyKeys) return usersBySector;
    const out = {};
    for (const idStr of keys) {
      const key = sectorKeyById[idStr] || null;
      if (!key) continue;
      out[key] = usersBySector[idStr] || [];
    }
    return out;
  }, [usersBySector, sectorMap, sectorKeyById]);

  // aceita lookup por KEY (ex: "TI") e também por ID (ex: "2")
  const usersBySectorLookup = useMemo(() => {
    const out = { ...(usersBySectorKey || {}) };
    for (const s of ALL_SECTORS) {
      if (s?.id != null && out[s.key]) {
        out[String(s.id)] = out[s.key];
      }
    }
    return out;
  }, [usersBySectorKey]);

  // depois do usersBySectorLookup
  const usersBySectorUnion = useMemo(
    () => ({ ...(usersBySectorKey || {}), ...(usersBySector || {}) }),
    [usersBySectorKey, usersBySector]
  );

  // depois dos useMemo de sectorMap/sectorKeyById/usersBySectorKey
  const usersIndexFromSectors = useMemo(() => {
    const idx = {};
    const src = usersBySectorKey || {};
    for (const key of Object.keys(src)) {
      const arr = Array.isArray(src[key]) ? src[key] : [];
      for (let i = 0; i < arr.length; i++) {
        const u = arr[i] || {};
        const id = u.id != null ? String(u.id) : null;
        if (id && !idx[id]) idx[id] = u;
      }
    }
    return idx;
  }, [usersBySectorKey]);

  const usersIndexMerged = useMemo(
    () => ({ ...usersIndexFromSectors, ...(usersIndex || {}) }),
    [usersIndexFromSectors, usersIndex]
  );

  // rows normalizadas (sectors -> keys)
  const normRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => {
      const raw = Array.isArray(r?.sectors)
        ? r.sectors
        : r?.sector
        ? [r.sector]
        : [];
      const keys = [];
      for (let i = 0; i < raw.length; i++) {
        const k = tokenToKey(raw[i]);
        if (k && !keys.includes(k)) keys.push(k);
      }
      const sectors = keys.length
        ? keys
        : Array.isArray(r?.sectors)
        ? r.sectors
        : [];
      return { ...r, sectors };
    });
  }, [rows]);

  const getRowSectorKeys = (r) => {
    const acc = [];
    if (!r) return acc;
    if (Array.isArray(r.sectors)) {
      for (let i = 0; i < r.sectors.length; i++) {
        const k = tokenToKey(r.sectors[i]);
        if (k) acc.push(k);
      }
    } else if (r.sector) {
      const k = tokenToKey(r.sector);
      if (k) acc.push(k);
    }
    return acc;
  };

  const SECTORS = useMemo(() => {
    if (Array.isArray(availableSectorKeys) && availableSectorKeys.length > 0) {
      const acc = [];
      for (let i = 0; i < ALL_SECTORS.length; i++) {
        const s = ALL_SECTORS[i];
        if (availableSectorKeys.includes(s.key)) acc.push(s);
      }
      return acc;
    }
    const present = {};
    for (let i = 0; i < normRows.length; i++) {
      const keys = getRowSectorKeys(normRows[i]);
      for (let j = 0; j < keys.length; j++) present[keys[j]] = true;
    }
    const derived = [];
    for (let i = 0; i < ALL_SECTORS.length; i++) {
      const s = ALL_SECTORS[i];
      if (present[s.key]) derived.push(s);
    }
    return derived.length > 0 ? derived : ALL_SECTORS;
  }, [availableSectorKeys, normRows]);

  const monthSegments = useMonthsSegments(days);

  const [editingRowId, setEditingRowId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  // larguras coluna esquerda
  const SECTORS_COL_W = 85;
  const RESP_COL_W = 50;
  const STAGE_COL_W = 95;
  const [leftDemandWidth, setLeftDemandWidth] = useState(320);
  const LEFT_COL_WIDTH =
    SECTORS_COL_W + RESP_COL_W + leftDemandWidth + STAGE_COL_W;

  // tooltips / menus
  const [tooltip, setTooltip] = useState(null);
  const showTooltip = (e, text, authorInitial) => {
    const { clientX: x, clientY: y } = e;
    setTooltip({ x, y, text, authorInitial });
  };
  const hideTooltip = () => setTooltip(null);

  const [sectorMenu, setSectorMenu] = useState(null);
  const openSectorMenu = (rowId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(8, Math.min(rect.left, window.innerWidth - 260));
    const y = Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 320));
    setSectorMenu({ rowId, x, y });
  };
  const closeSectorMenu = () => setSectorMenu(null);

  const [assigneeMenu, setAssigneeMenu] = useState(null);
  const openAssigneeMenu = (rowId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const W = 280,
      H = 320,
      M = 8;
    let x = rect.left,
      y = rect.bottom + 8;
    if (x + W > window.innerWidth - M) x = window.innerWidth - W - M;
    if (y + H > window.innerHeight - M) y = rect.top - H - M;
    setAssigneeMenu({ rowId, x, y });
  };
  const closeAssigneeMenu = () => setAssigneeMenu(null);

  const [palette, setPalette] = useState(null);
  const [paletteSubmitting, setPaletteSubmitting] = useState(false);

  const guardOpenPalette = (rowId, dayISO) => {
    if (typeof canOpenPaletteCell === "function") {
      return !!canOpenPaletteCell(rowId, dayISO);
    }
    return (
      !!canEditColorCell(rowId, dayISO) ||
      (!!canMarkBaseline && !!canToggleBaselineCell(rowId, dayISO)) ||
      !!canCreateCommentCell(rowId, dayISO)
    );
  };

  const openPalette = (rowId, dayISO, e, existing = {}) => {
    if (!guardOpenPalette(rowId, dayISO)) {
      toast.error("Você não tem permissão para editar esta célula.");
      return;
    }
    const W = 340,
      H = 320,
      M = 8;
    let left, top;

    if (e && e.currentTarget && e.currentTarget.getBoundingClientRect) {
      const rect = e.currentTarget.getBoundingClientRect();
      left = rect.left;
      if (left + W > window.innerWidth - M) left = window.innerWidth - W - M;
      if (left < M) left = M;
      top = rect.bottom + M;
      if (top + H > window.innerHeight - M) {
        top = rect.top - H - M;
        if (top < M) top = M;
      }
    } else {
      left = Math.max(M, (window.innerWidth - W) / 2);
      top = Math.max(M, (window.innerHeight - H) / 2);
    }

    const comments = Array.isArray(existing?.comments)
      ? existing.comments.slice()
      : [];
    setPalette({
      rowId,
      dayISO,
      x: left,
      y: top,
      commentDraft: "",
      baseline: !!existing?.baseline,
      baselineOriginal: !!existing?.baseline,
      comments,
    });
  };

  const closePalette = () => setPalette(null);

  const handlePickColor = (c) => {
    if (!palette || !onPickColor) return;
    if (!canEditColorCell(palette.rowId, palette.dayISO)) {
      toast.error("Sem permissão para alterar a cor.");
      return;
    }
    return onPickColor(palette.rowId, palette.dayISO, c);
  };

  const [selectedSectorKey, setSelectedSectorKey] = useState("ALL");

  const filteredRows = useMemo(() => {
    if (selectedSectorKey === "ALL") return normRows;
    if (selectedSectorKey === "MINE") {
      return normRows.filter((r) => {
        const ids = Array.isArray(r?.assignees)
          ? r.assignees
          : Array.isArray(r?.assigned_user_ids)
          ? r.assigned_user_ids
          : [];
        return ids.some((id) => String(id) === String(currentUserId));
      });
    }

    const out = [];
    for (let i = 0; i < normRows.length; i++) {
      const keys = getRowSectorKeys(normRows[i]);
      let has = false;
      for (let j = 0; j < keys.length; j++) {
        if (keys[j] === selectedSectorKey) {
          has = true;
          break;
        }
      }
      if (has) out.push(normRows[i]);
    }
    return out;
  }, [normRows, selectedSectorKey]);

  const {
    draggingId,
    onDragStart,
    onDragOverRow,
    onDropRow,
    onDragEnd,
    dropIndicatorStyle,
    setDraggingId,
  } = useDnDRows(filteredRows, canReorderRows, isBusy, onReorderRows);

  const [deletingRowId, setDeletingRowId] = useState(null);

  const [editRowModal, setEditRowModal] = useState({ open: false, row: null });

  const userCanEditRow = (row) => {
    const createdBySectorId =
      row?.created_by_sector_id ?? row?.creator_sector_id ?? null;
    return (
      isAdmin ||
      (createdBySectorId != null &&
        String(createdBySectorId) === String(currentUserSectorId)) ||
      row?.perms?.canEdit === true
    );
  };

  const openEditRow = (row) => {
    if (!row) return;
    if (!userCanEditRow(row)) return;
    setEditRowModal({ open: true, row });
  };
  const closeEditRow = () => setEditRowModal({ open: false, row: null });

  // ===== SUBMIT DO MODAL (PUT único preferencial) ============================
  const handleEditRowSubmit = async (rowId, payload) => {
    try {
      if (typeof onUpdateRow === "function") {
        await onUpdateRow(rowId, payload); // PUT único
      } else {
        // compat: quebra o payload em chamadas antigas, se não houver onUpdateRow
        const { title, row_sectors, assignees, stage_no, stage_label } =
          payload || {};
        if (title != null && title !== "") {
          await onRenameRow?.(rowId, title);
        }
        if (Array.isArray(row_sectors)) {
          await onSetRowSector?.(rowId, row_sectors);
        }
        if (Array.isArray(assignees)) {
          await onSetRowAssignees?.(rowId, assignees);
        }
        if (
          typeof onSetRowStage === "function" &&
          (stage_no != null || stage_label != null)
        ) {
          await onSetRowStage(rowId, stage_no, stage_label);
        }
      }
      toast.success("Linha atualizada!");
      closeEditRow();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Falha ao atualizar a linha.";
      toast.error(msg);
    }
  };

  useEscapeClose(() => {
    setPalette(null);
    setSectorMenu(null);
    setAssigneeMenu(null);
    setEditingRowId(null);
    setEditDraft("");
  });

  const defaultCanDeleteCommentCell = (rowId, dayISO, c) => {
    if (isAdmin) return true;
    const isAuthor =
      (c.authorId && String(c.authorId) === String(currentUserId)) ||
      (!c.authorId &&
        (c.authorInitial || "U").toUpperCase() ===
          (currentUserInitial || "U").toUpperCase());
    return !!isAuthor;
  };

  const myCommentsCount = useMemo(() => {
    if (!currentUserSectorId) return 0;
    let n = 0;
    for (const r of normRows) {
      const cells = r?.cells || {};
      for (const day in cells) {
        const list = (cells[day]?.comments || []).filter(
          (c) =>
            !c?.deleted && String(c?.sector_id) === String(currentUserSectorId)
        );
        n += list.length;
      }
    }
    return n;
  }, [normRows, currentUserSectorId]);

  const myCommentsItems = useMemo(() => {
    if (!currentUserSectorId) return [];
    const acc = [];
    for (const r of normRows) {
      const rowTitle = r?.titulo || r?.title || r?.name || "";
      const cells = r?.cells || {};
      for (const dayISO in cells) {
        const cell = cells[dayISO] || {};
        const list = (cell.comments || []).filter(
          (c) =>
            !c?.deleted && String(c?.sector_id) === String(currentUserSectorId)
        );
        for (const c of list) {
          acc.push({
            id: c.id,
            rowId: r.id,
            rowTitle,
            dayISO,
            created_at: c.created_at,
            message: c.message,
            authorInitial: c.authorInitial || "U",
            sector_id: c.sector_id,
          });
        }
      }
    }
    acc.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return acc;
  }, [normRows, currentUserSectorId]);

  const [showMyCommentsModal, setShowMyCommentsModal] = useState(false);

  const jumpToCellFromModal = (rowId, dayISO) => {
    const row = normRows.find((r) => String(r.id) === String(rowId));
    const existing = row?.cells?.[dayISO] || {};
    openPalette(rowId, dayISO, null, existing);
    setShowMyCommentsModal(false);
  };

  // === helper de pickAssignee para AssigneeMenu: usa onUpdateRow se houver ===
  const handlePickAssignee = async (
    rowId,
    userIdOrNull,
    assigneeSetorIdOptional
  ) => {
    if (typeof onChangeAssignee === "function") {
      return onChangeAssignee(rowId, userIdOrNull, assigneeSetorIdOptional);
    }
    // fallback: se alguém abrir essa timeline sem o novo prop
    if (typeof onUpdateRow === "function") {
      return onUpdateRow(rowId, {
        assignees: userIdOrNull ? [String(userIdOrNull)] : [],
        ...(assigneeSetorIdOptional != null
          ? { assignee_setor_id: Number(assigneeSetorIdOptional) }
          : {}),
      });
    }
    // último fallback legacy:
    return onSetRowAssignees?.(
      rowId,
      userIdOrNull ? [String(userIdOrNull)] : []
    );
  };

  return (
    <TimelineWrap>
      <SectorFilterBar>
        <FilterLabel htmlFor="sector-filter">Filtrar por:</FilterLabel>
        <SectorDropdown
          id="sector-filter"
          value={selectedSectorKey}
          onChange={(k) => setSelectedSectorKey(k)}
          options={[
            {
              key: "ALL",

              label: "Todos os setores",
              color: "#9ca3af",
              initial: "*",
            },
            {
              key: "MINE",
              label: "Minha demanda",
              color: "#2563eb",
              initial: "@",
            },

            ...SECTORS,
          ]}
        />

        {currentUserSectorId != null && (
          <MyCommentsBtn
            type="button"
            onClick={() => setShowMyCommentsModal(true)}
            title="Ver comentários do meu setor neste projeto"
          >
            Meus comentários: {myCommentsCount}
          </MyCommentsBtn>
        )}
      </SectorFilterBar>

      <LegendBar sectors={SECTORS} />

      <ContentGrid $leftWidth={LEFT_COL_WIDTH}>
        <LeftColumn
          rows={filteredRows}
          sectorMap={sectorMap}
          canReorderRows={canReorderRows}
          isBusy={isBusy}
          passWheelToRight={passWheelToRight}
          openSectorMenu={openSectorMenu}
          openAssigneeMenu={openAssigneeMenu}
          dropIndicatorStyle={dropIndicatorStyle}
          onDragStart={onDragStart}
          onDragOverRow={onDragOverRow}
          onDropRow={onDropRow}
          onDragEnd={onDragEnd}
          editingRowId={editingRowId}
          setEditingRowId={setEditingRowId}
          editDraft={editDraft}
          setEditDraft={setEditDraft}
          onRenameRow={onRenameRow}
          firstColRef={firstColRef}
          usersIndex={usersIndexMerged}
          usersBySector={usersBySectorKey}
          leftDemandWidth={leftDemandWidth}
          setLeftDemandWidth={setLeftDemandWidth}
          onContextEditRow={openEditRow}
          currentUserId={currentUserId}
        />

        <RightGrid
          days={days}
          monthSegments={monthSegments}
          monthBgTones={monthBgTones}
          rows={filteredRows}
          openPalette={openPalette}
          baselineColor={baselineColor}
          syncLeftScroll={syncLeftScroll}
          dropIndicatorStyle={dropIndicatorStyle}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          draggingId={draggingId}
          isBusy={isBusy}
          onDragOverRow={onDragOverRow}
          onDropRow={onDropRow}
          scrollerRef={scrollerRef}
          DeleteZone={(props) => (
            <TrashZone
              {...props}
              onDeleteRow={onDeleteRow}
              setDeletingRowId={setDeletingRowId}
              setDraggingId={setDraggingId}
              deletingRowId={deletingRowId}
              canDeleteRowItem={(rowId) => true}
            />
          )}
        />
      </ContentGrid>

      {(sectorMenu || palette || assigneeMenu) && (
        <Overlay
          onClick={() => {
            setSectorMenu(null);
            setPalette(null);
            setAssigneeMenu(null);
          }}
        />
      )}

      <SectorMenu
        sectors={SECTORS}
        rows={normRows}
        sectorMenu={sectorMenu}
        pickSector={async (keyOrKeys) => {
          try {
            // usa handler legado (que por sua vez chama updateRow no hook)
            await onSetRowSector?.(sectorMenu.rowId, keyOrKeys);
            setSectorMenu(null);
          } catch (err) {
            const s = err?.response?.status;
            const d = err?.response?.data?.detail;
            if (s === 403) toast.error("Sem permissão para alterar o setor.");
            else if (s === 423)
              toast.error("Projeto bloqueado. Ação não permitida.");
            else toast.error(d || "Falha ao alterar o setor.");
          }
        }}
        close={() => setSectorMenu(null)}
      />

      <AssigneeMenu
        assigneeMenu={assigneeMenu}
        rows={normRows}
        usersBySector={usersBySectorUnion}
        usersIndex={usersIndexMerged}
        sectorIdByKey={sectorIdByKey}
        pickAssignee={handlePickAssignee}
        close={closeAssigneeMenu}
        currentUserId={currentUserId}
      />

      <PaletteMenu
        palette={palette}
        setPalette={setPalette}
        colors={COLOR_PALETTE}
        onPickColor={(c) => handlePickColor(c)}
        onSetCellComment={async (rowId, dayISO, message, initial) => {
          setPaletteSubmitting(true);
          try {
            return await onSetCellComment(rowId, dayISO, message, initial);
          } finally {
            setPaletteSubmitting(false);
          }
        }}
        currentUserInitial={currentUserInitial}
        currentUserSectorId={currentUserSectorId}
        canMarkBaseline={canMarkBaseline}
        baselineColor={baselineColor}
        onToggleBaseline={onToggleBaseline}
        onDeleteComment={onDeleteComment}
        close={closePalette}
        submitting={paletteSubmitting}
        canEditColorCell={canEditColorCell}
        canToggleBaselineCell={canToggleBaselineCell}
        canCreateCommentCell={canCreateCommentCell}
        canDeleteCommentCell={
          canDeleteCommentCell || defaultCanDeleteCommentCell
        }
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        sectorsDoProjeto={SECTORS}
        usersDoProjeto={Object.values(usersIndexMerged).filter(
          (u) => !/admin@/i.test(u?.email || "")
        )}
      />

      <ModalDetalheComment
        isOpen={showMyCommentsModal}
        onClose={() => setShowMyCommentsModal(false)}
        items={myCommentsItems}
        onJumpToCell={jumpToCellFromModal}
      />

      <ModalEditRow
        isOpen={editRowModal.open}
        onClose={closeEditRow}
        row={editRowModal.row}
        sectors={SECTORS}
        usersBySector={usersBySectorUnion}
        sectorIdByKey={sectorIdByKey}
        usersIndex={usersIndexMerged}
        canEdit={editRowModal.row ? userCanEditRow(editRowModal.row) : false}
        canEditAssignee={true}
        canEditSectors={
          editRowModal.row ? userCanEditRow(editRowModal.row) : false
        }
        onSubmit={handleEditRowSubmit} // << agora envia (rowId, payload)
        stages={Array.from(
          new Set(
            normRows
              .map((r) => Number(r.stageNo || r.stage_no))
              .filter((n) => !Number.isNaN(n) && n >= 1)
          )
        )
          .sort((a, b) => a - b)
          .map((no) => ({
            no,
            label:
              normRows.find((r) => Number(r.stageNo || r.stage_no) === no)
                ?.stageLabel ||
              normRows.find((r) => Number(r.stageNo || r.stage_no) === no)
                ?.stage_label ||
              "",
          }))}
      />

      <Tooltip tooltip={tooltip} />
    </TimelineWrap>
  );
}
