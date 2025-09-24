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

export default function Timeline({
  days = [],
  rows = [],
  // usuário
  currentUserId,
  currentUserInitial = "U",
  currentUserSectorId, // setor logado
  isAdmin = false,

  // handlers (devem ser NÃO-OTIMISTAS)
  onPickColor,
  onSetCellComment,
  onSetRowSector,
  onToggleBaseline,
  onReorderRows,
  onRenameRow,
  onDeleteRow,
  onDeleteComment,

  // recursos
  canMarkBaseline = false,
  baselineColor = "#111827",
  canReorderRows = false,
  isBusy = false,
  availableSectorKeys = [],

  // permissões (defaults liberados)
  canEditColorCell = () => true,
  canToggleBaselineCell = () => true,
  canCreateCommentCell = () => true,
  canDeleteCommentCell,
  canDeleteRowItem = () => true,
  canOpenPaletteCell,
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

  const getRowSectorKeys = (r) => {
    const acc = [];
    if (!r) return acc;
    if (Array.isArray(r.sectors)) {
      for (let i = 0; i < r.sectors.length; i++) {
        const k = r.sectors[i];
        if (typeof k === "string" && k) acc.push(k);
        else if (k && typeof k === "object" && typeof k.key === "string")
          acc.push(k.key);
      }
    } else if (typeof r.sector === "string" && r.sector) {
      acc.push(r.sector);
    } else if (
      r.sector &&
      typeof r.sector === "object" &&
      typeof r.sector.key === "string"
    ) {
      acc.push(r.sector.key);
    }
    return acc;
  };

  // SECTORS
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
    for (let i = 0; i < rows.length; i++) {
      const keys = getRowSectorKeys(rows[i]);
      for (let j = 0; j < keys.length; j++) present[keys[j]] = true;
    }
    const derived = [];
    for (let i = 0; i < ALL_SECTORS.length; i++) {
      const s = ALL_SECTORS[i];
      if (present[s.key]) derived.push(s);
    }
    return derived.length > 0 ? derived : ALL_SECTORS;
  }, [availableSectorKeys, rows]);

  const sectorMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < ALL_SECTORS.length; i++) {
      const s = ALL_SECTORS[i];
      map[s.key] = s;
    }
    return map;
  }, []);

  const monthSegments = useMonthsSegments(days);

  const [editingRowId, setEditingRowId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

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

  // aceita abrir sem evento (ex.: pulo a partir da modal)
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
      // abertura programática (centralizado)
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
    if (selectedSectorKey === "ALL") return rows;
    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const keys = getRowSectorKeys(rows[i]);
      let has = false;
      for (let j = 0; j < keys.length; j++) {
        if (keys[j] === selectedSectorKey) {
          has = true;
          break;
        }
      }
      if (has) out.push(rows[i]);
    }
    return out;
  }, [rows, selectedSectorKey]);

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

  useEscapeClose(() => {
    setPalette(null);
    setSectorMenu(null);
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

  // ===== contador de "meus comentários" (mesma regra do bubble) =====
  const myCommentsCount = useMemo(() => {
    if (!currentUserSectorId) return 0;
    let n = 0;
    for (const r of rows) {
      const cells = r?.cells || {};
      for (const day in cells) {
        const list = (cells[day]?.comments || []).filter(
          (c) =>
            !c?.deleted &&
            String(c?.sector_id) === String(currentUserSectorId)
        );
        n += list.length;
      }
    }
    return n;
  }, [rows, currentUserSectorId]);

  // ===== lista detalhada para a modal =====
  const myCommentsItems = useMemo(() => {
    if (!currentUserSectorId) return [];
    const acc = [];
    for (const r of rows) {
      const rowTitle = r?.titulo || r?.title || r?.name || "";
      const cells = r?.cells || {};
      for (const dayISO in cells) {
        const cell = cells[dayISO] || {};
        const list = (cell.comments || []).filter(
          (c) => !c?.deleted && String(c?.sector_id) === String(currentUserSectorId)
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
  }, [rows, currentUserSectorId]);

  const [showMyCommentsModal, setShowMyCommentsModal] = useState(false);

  const jumpToCellFromModal = (rowId, dayISO) => {
    const row = rows.find((r) => String(r.id) === String(rowId));
    const existing = row?.cells?.[dayISO] || {};
    openPalette(rowId, dayISO, null, existing);
    setShowMyCommentsModal(false);
  };

  return (
    <TimelineWrap>
      {/* Filtro por setor + chip de “meus comentários” (agora clicável) */}
      <SectorFilterBar>
        <FilterLabel htmlFor="sector-filter">Filtrar por setor</FilterLabel>
        <SectorDropdown
          id="sector-filter"
          value={selectedSectorKey}
          onChange={(k) => setSelectedSectorKey(k)}
          options={[
            { key: "ALL", label: "Todos os setores", color: "#9ca3af", initial: "*" },
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

      <ContentGrid>
        <LeftColumn
          rows={filteredRows}
          sectorMap={sectorMap}
          canReorderRows={canReorderRows}
          isBusy={isBusy}
          passWheelToRight={passWheelToRight}
          openSectorMenu={openSectorMenu}
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
              canDeleteRowItem={canDeleteRowItem}
            />
          )}
        />
      </ContentGrid>

      {(sectorMenu || palette) && (
        <Overlay
          onClick={() => {
            setSectorMenu(null);
            setPalette(null);
          }}
        />
      )}

      <SectorMenu
        sectors={SECTORS}
        rows={rows}
        sectorMenu={sectorMenu}
        pickSector={async (key) => {
          try {
            await onSetRowSector?.(sectorMenu.rowId, key);
            setSectorMenu(null);
          } catch (err) {
            const s = err?.response?.status;
            const d = err?.response?.data?.detail;
            if (s === 403) toast.error("Sem permissão para alterar o setor.");
            else if (s === 423) toast.error("Projeto bloqueado. Ação não permitida.");
            else toast.error(d || "Falha ao alterar o setor.");
          }
        }}
        close={() => setSectorMenu(null)}
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
        currentUserSectorId={currentUserSectorId} // destaca no CommentList
        canMarkBaseline={canMarkBaseline}
        baselineColor={baselineColor}
        onToggleBaseline={onToggleBaseline}
        onDeleteComment={onDeleteComment}
        close={closePalette}
        submitting={paletteSubmitting}
        canEditColorCell={canEditColorCell}
        canToggleBaselineCell={canToggleBaselineCell}
        canCreateCommentCell={canCreateCommentCell}
        canDeleteCommentCell={canDeleteCommentCell || defaultCanDeleteCommentCell}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        sectorsDoProjeto={SECTORS}
      />

      {/* Modal de “Meus comentários” */}
      <ModalDetalheComment
        isOpen={showMyCommentsModal}
        onClose={() => setShowMyCommentsModal(false)}
        items={myCommentsItems}
        onJumpToCell={jumpToCellFromModal}
      />

      <Tooltip tooltip={tooltip} />
    </TimelineWrap>
  );
}
