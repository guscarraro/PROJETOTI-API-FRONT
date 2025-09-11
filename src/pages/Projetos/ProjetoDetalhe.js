// src/pages/Projetos/ProjetoDetalhe.js
import React, { useMemo, useState } from "react";
import { Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  Page, TitleBar, H1, Actions, Section, InfoGrid,
  MenuBox, MenuItem, Overlay
} from "./style";
import { STATUS, rangeDays } from "./utils";
import Timeline from "./components/Timeline";
import AddCostModal from "./components/AddCostModal";
import CostsPopover from "./components/CostsPopover";
import { StatusCard, DateCard, DaysCard, CostsCard } from "./components/InfoCards";
import NavBar from "./components/NavBar";
import { FiLock, FiUnlock } from "react-icons/fi";

export default function ProjetoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  // TODO: substitua por regra real de permissão
  const isAdmin = true;

  const STATUS_COLORS = {
    [STATUS.ANDAMENTO]: "#10b981",
    [STATUS.STANDBY]: "#f59e0b",
    [STATUS.CANCELADO]: "#ef4444",
    [STATUS.CONCLUIDO]: "#34d399",
  };

  const [locked, setLocked] = useState(false);

  const [projeto, setProjeto] = useState({
    id,
    nome: "Implantação ERP",
    inicio: "2025-09-01",
    fim: "2025-11-30",
    status: STATUS.ANDAMENTO,
    custos: [],
  });

  const [paidSet, setPaidSet] = useState(() => new Set());
  const togglePaid = (key) => {
    setPaidSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleBaseline = (rowId, dayISO, enabled) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const prevCell = r.cells?.[dayISO];
      const nextCell = { ...(typeof prevCell === "object" ? prevCell : {}), baseline: enabled };
      return { ...r, cells: { ...r.cells, [dayISO]: nextCell } };
    }));
  };

  const [rows, setRows] = useState([
    { id: 1, titulo: "Preparação inicial", sectors: [], cells: {} },
    { id: 2, titulo: "Levantamento e Documentação", sectors: [], cells: {} },
    { id: 3, titulo: "Estruturação do Projeto", sectors: [], cells: {} },
    { id: 4, titulo: "Desenvolvimento e Integrações", sectors: [], cells: {} },
    { id: 5, titulo: "Validações Operacionais", sectors: [], cells: {} },
    { id: 6, titulo: "Testes Funcionais", sectors: [], cells: {} },
    { id: 7, titulo: "Indicadores e Performance", sectors: [], cells: {} },
    { id: 8, titulo: "Conclusão e Go-Live", sectors: [], cells: {} },
  ]);

  const days = useMemo(() => rangeDays(projeto.inicio, projeto.fim), [projeto.inicio, projeto.fim]);

  const [openCost, setOpenCost] = useState(false);
  const [showCosts, setShowCosts] = useState(false);

  const handleSave = () => {
    console.log("Salvar projeto:", { projeto, rows, pagos: Array.from(paidSet), locked });
    navigate("/Projetos");
  };

  const addRow = () => {
    const titulo = prompt("Descritivo da etapa/demanda:");
    if (!titulo) return;
    setRows(prev => [...prev, { id: Date.now(), titulo, sector: null, cells: {} }]);
  };

  const setCellColor = (rowId, dayISO, color) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const prevCell = r.cells?.[dayISO];
      const nextCell = typeof prevCell === "object" ? { ...prevCell, color } : { color };
      return { ...r, cells: { ...r.cells, [dayISO]: nextCell } };
    }));
  };

  const setCellComment = (rowId, dayISO, comment, authorInitial = "U") => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const prevCell = r.cells?.[dayISO];
      const nextCell = typeof prevCell === "object"
        ? { ...prevCell, comment, authorInitial }
        : { color: undefined, comment, authorInitial };
      return { ...r, cells: { ...r.cells, [dayISO]: nextCell } };
    }));
  };

  const setRowSector = (rowId, sectorKey) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const list = Array.isArray(r.sectors) ? r.sectors : (r.sector ? [r.sector] : []);
      return list.includes(sectorKey)
        ? { ...r, sectors: list.filter(k => k !== sectorKey) }
        : { ...r, sectors: [...list, sectorKey] };
    }));
  };

  const totalCustos = useMemo(
    () => projeto.custos.reduce((acc, c) => acc + Number(c.valorTotal || 0), 0),
    [projeto.custos]
  );

  const accent = STATUS_COLORS[projeto.status] || "#111827";
  const readOnly = locked && !isAdmin;

  // menu de status (abre ao clicar no Status, só admin)
  const [statusMenu, setStatusMenu] = useState(null);
  const openStatusMenu = (e) => {
    if (!isAdmin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const W = 220, H = 180, M = 8;
    const left = Math.max(M, Math.min(rect.left, window.innerWidth - W - M));
    const top  = Math.max(M, Math.min(rect.bottom + 8, window.innerHeight - H - M));
    setStatusMenu({ x: left, y: top });
  };
  const closeStatusMenu = () => setStatusMenu(null);
  const changeStatus = (s) => {
    setProjeto(p => ({ ...p, status: s }));
    closeStatusMenu();
  };

  return (
    <Page>
      <NavBar />

      <TitleBar>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button color="secondary" onClick={() => navigate("/Projetos")}>⟵ Voltar</Button>
          <H1 $accent={accent}>{projeto.nome}</H1>
        </div>
        <Actions>
          <Button
            color={locked ? "secondary" : "dark"}
            onClick={() => isAdmin && setLocked(v => !v)}
            title={locked ? "Destrancar (admin)" : "Trancar (admin)"}
            disabled={!isAdmin}
          >
            {locked ? <FiLock size={16} /> : <FiUnlock size={16} />}
          </Button>

          <Button color="warning" onClick={() => setOpenCost(true)} disabled={readOnly}>
            Adicionar custo
          </Button>
          <Button color="success" onClick={handleSave} disabled={readOnly}>
            Salvar alterações
          </Button>
        </Actions>
      </TitleBar>

      <Section>
        <InfoGrid>
          <div onClick={openStatusMenu} style={{ cursor: isAdmin ? "pointer" : "default" }} title={isAdmin ? "Alterar status" : undefined}>
            <StatusCard status={projeto.status} accent={accent} />
          </div>
          <DateCard label="Início" dateISO={projeto.inicio} />
          <DateCard label="Previsão de término" dateISO={projeto.fim} />
          <DaysCard total={days.length} />
          <CostsCard
            totalBRL={totalCustos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            onClick={() => setShowCosts(true)}
          />
        </InfoGrid>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Button color="secondary" outline onClick={addRow} disabled={readOnly}>
            + Nova linha (demanda)
          </Button>
        </div>

        <Timeline
          days={days}
          rows={rows}
          custos={projeto.custos}
          currentUserInitial="A"
          onPickColor={readOnly ? undefined : setCellColor}
          onSetCellComment={readOnly ? undefined : setCellComment}
          onSetRowSector={readOnly ? undefined : setRowSector}
          canMarkBaseline={!readOnly}
          baselineColor="#0ea5e9"
          onToggleBaseline={readOnly ? undefined : toggleBaseline}
        />
      </Section>

      {statusMenu && isAdmin && (
        <>
          <Overlay onClick={closeStatusMenu} />
          <MenuBox style={{ position: "fixed", left: statusMenu.x, top: statusMenu.y, zIndex: 1100, width: 220 }}>
            <MenuItem onClick={() => changeStatus(STATUS.ANDAMENTO)}>Em andamento</MenuItem>
            <MenuItem onClick={() => changeStatus(STATUS.STANDBY)}>Stand by</MenuItem>
            <MenuItem onClick={() => changeStatus(STATUS.CONCLUIDO)}>Concluído</MenuItem>
            <MenuItem onClick={() => changeStatus(STATUS.CANCELADO)}>Cancelado</MenuItem>
          </MenuBox>
        </>
      )}

      {showCosts && (
        <CostsPopover
          custos={projeto.custos}
          paidSet={paidSet}
          onTogglePaid={readOnly ? undefined : togglePaid}
          onClose={() => setShowCosts(false)}
        />
      )}

      <AddCostModal
        isOpen={openCost}
        toggle={() => setOpenCost(v => !v)}
        onSave={(c) => {
          if (readOnly) return;
          setProjeto(p => ({ ...p, custos: [...p.custos, ...c] }));
        }}
      />
    </Page>
  );
}
