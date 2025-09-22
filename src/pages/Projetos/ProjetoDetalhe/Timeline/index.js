import React, { useRef, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  TimelineWrap,
  ContentGrid,
  Overlay,
  SectorFilterBar,
  FilterLabel,
  SectorSelect,
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

export default function Timeline({
  days = [],
  rows = [],
  // usuário
  currentUserId,
  currentUserInitial = "U",
  isAdmin = false,

  // handlers (devem ser NÃO-OTIMISTAS)
  onPickColor, // (rowId, dayISO, color) => Promise
  onSetCellComment, // (rowId, dayISO, comment, authorInitial) => Promise
  onSetRowSector, // (rowId, sectorKey) => Promise
  onToggleBaseline, // (rowId, dayISO, enabled) => Promise
  onReorderRows, // (nextRows) => void
  onRenameRow, // (rowId, newTitle)
  onDeleteRow, // (rowId) => Promise
  onDeleteComment, // (rowId, dayISO, commentId) => Promise

  // recursos
  canMarkBaseline = false,
  baselineColor = "#111827",
  canReorderRows = false,
  isBusy = false,
  availableSectorKeys = [],

  // permissões (defaults liberados)
  canEditColorCell = () => true, // (rowId, dayISO) => bool
  canToggleBaselineCell = () => true, // (rowId, dayISO) => bool
  canCreateCommentCell = () => true, // (rowId, dayISO) => bool
  canDeleteCommentCell, // (rowId, dayISO, comment) => bool
  canDeleteRowItem = () => true, // (rowId) => bool
  canOpenPaletteCell, // (rowId, dayISO) => bool
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

  // ---- helper para ler setores de uma linha (array ou único)
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

  // SECTORS do projeto: usa availableSectorKeys se vier, senão deriva dos rows
  const SECTORS = useMemo(() => {
    // 1) whitelist do pai
    if (Array.isArray(availableSectorKeys) && availableSectorKeys.length > 0) {
      const acc = [];
      for (let i = 0; i < ALL_SECTORS.length; i++) {
        const s = ALL_SECTORS[i];
        if (availableSectorKeys.includes(s.key)) acc.push(s);
      }
      return acc;
    }
    // 2) derivar dos rows
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

  // meses (header)
  const monthSegments = useMonthsSegments(days);

  // rename inline
  const [editingRowId, setEditingRowId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  // tooltip
  const [tooltip, setTooltip] = useState(null);
  const showTooltip = (e, text, authorInitial) => {
    const { clientX: x, clientY: y } = e;
    setTooltip({ x, y, text, authorInitial });
  };
  const hideTooltip = () => setTooltip(null);

  // menu de setor
  const [sectorMenu, setSectorMenu] = useState(null);
  const openSectorMenu = (rowId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(8, Math.min(rect.left, window.innerWidth - 260));
    const y = Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 320));
    setSectorMenu({ rowId, x, y });
  };
  const closeSectorMenu = () => setSectorMenu(null);

  // pickSector com tratamento de permissão (aguarda servidor)
  const pickSector = async (key) => {
    if (!sectorMenu || !onSetRowSector) return;
    try {
      await onSetRowSector(sectorMenu.rowId, key);
      closeSectorMenu();
    } catch (err) {
      const s = err?.response?.status;
      const d = err?.response?.data?.detail;
      if (s === 403) toast.error("Sem permissão para alterar o setor.");
      else if (s === 423) toast.error("Projeto bloqueado. Ação não permitida.");
      else toast.error(d || "Falha ao alterar o setor.");
    }
  };

  // paleta
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

    const rect = e.currentTarget.getBoundingClientRect();
    const W = 340,
      H = 320,
      M = 8;
    let left = rect.left;
    if (left + W > window.innerWidth - M) left = window.innerWidth - W - M;
    if (left < M) left = M;
    let top = rect.bottom + M;
    if (top + H > window.innerHeight - M) {
      top = rect.top - H - M;
      if (top < M) top = M;
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

  // importante: retornar Promise para a paleta poder aguardar
  const handlePickColor = (c) => {
    if (!palette || !onPickColor) return;
    if (!canEditColorCell(palette.rowId, palette.dayISO)) {
      toast.error("Sem permissão para alterar a cor.");
      return;
    }
    return onPickColor(palette.rowId, palette.dayISO, c);
  };

  // ---- filtro por setor (UI acima das legendas)
  const [selectedSectorKey, setSelectedSectorKey] = useState("ALL");

  const filteredRows = useMemo(() => {
    if (selectedSectorKey === "ALL") return rows;
    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const keys = getRowSectorKeys(rows[i]);
      // manter sem reduce: loop simples procurando match
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

  // DnD usa as linhas visíveis (filtradas)
  const {
    draggingId,
    overInfo,
    onDragStart,
    onDragOverRow,
    onDropRow,
    onDragEnd,
    dropIndicatorStyle,
    setDraggingId,
  } = useDnDRows(filteredRows, canReorderRows, isBusy, onReorderRows);

  // deletar arrastando à lixeira
  const [deletingRowId, setDeletingRowId] = useState(null);

  // ESC fecha menus
  useEscapeClose(() => {
    setPalette(null);
    setSectorMenu(null);
    setEditingRowId(null);
    setEditDraft("");
  });

  // fallback de permissão de comentário (ADM ou autor)
  const defaultCanDeleteCommentCell = (rowId, dayISO, c) => {
    if (isAdmin) return true;
    const isAuthor =
      (c.authorId && String(c.authorId) === String(currentUserId)) ||
      (!c.authorId &&
        (c.authorInitial || "U").toUpperCase() ===
          (currentUserInitial || "U").toUpperCase());
    return !!isAuthor;
  };

  return (
    <TimelineWrap>
      {/* Filtro por setor - acima das legendas */}
      <SectorFilterBar>
        <FilterLabel htmlFor="sector-filter">Filtrar por setor</FilterLabel>

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
            ...SECTORS, // [{key,label,color,initial}]
          ]}
        />
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
        rows={rows} // mantém dados completos para edição
        sectorMenu={sectorMenu}
        pickSector={pickSector}
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
        canMarkBaseline={canMarkBaseline}
        baselineColor={baselineColor}
        onToggleBaseline={onToggleBaseline} // Promise
        onDeleteComment={onDeleteComment} // Promise
        close={closePalette}
        submitting={paletteSubmitting}
        // permissões
        canEditColorCell={canEditColorCell}
        canToggleBaselineCell={canToggleBaselineCell}
        canCreateCommentCell={canCreateCommentCell}
        canDeleteCommentCell={
          canDeleteCommentCell || defaultCanDeleteCommentCell
        }
        isAdmin={isAdmin}
        currentUserId={currentUserId}
      />

      <Tooltip tooltip={tooltip} />
    </TimelineWrap>
  );
}
