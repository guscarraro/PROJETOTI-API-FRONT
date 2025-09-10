// src/pages/Projetos/ProjetoDetalhe.js
import React, { useMemo, useState } from "react";
import { Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { Page, TitleBar, H1, Actions, Section, InfoGrid, InfoItem } from "./style";
import { STATUS, rangeDays } from "./utils";
import Timeline from "./components/Timeline";
import AddCostModal from "./components/AddCostModal";
import CostsPopover from "./components/CostsPopover";

export default function ProjetoDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [projeto, setProjeto] = useState({
        id,
        nome: "Implantação ERP",
        inicio: "2025-09-01",
        fim: "2025-11-30",
        status: STATUS.ANDAMENTO,
        custos: [],
    });
    const toggleBaseline = (rowId, dayISO, enabled) => {
        setRows(prev => prev.map(r => {
            if (r.id !== rowId) return r;
            const prevCell = r.cells?.[dayISO];
            const nextCell = { ...(typeof prevCell === "object" ? prevCell : {}), baseline: enabled };
            return { ...r, cells: { ...r.cells, [dayISO]: nextCell } };
        }));
    };

    // rows suportam sector e cells como objeto { [dayISO]: { color?, comment?, authorInitial? } }
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
        console.log("Salvar projeto:", { projeto, rows });
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
                ? { ...r, sectors: list.filter(k => k !== sectorKey) }     // remove
                : { ...r, sectors: [...list, sectorKey] };                 // adiciona
        }));
    };
    const totalCustos = useMemo(
        () => projeto.custos.reduce((acc, c) => acc + Number(c.valorTotal || 0), 0),
        [projeto.custos]
    );

    return (
        <Page>
            <TitleBar>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Button color="secondary" onClick={() => navigate("/Projetos")}>⟵ Voltar</Button>
                    <H1 style={{ margin: 0 }}>{projeto.nome}</H1>
                </div>
                <Actions>
                    <Button color="warning" onClick={() => setOpenCost(true)}>Adicionar custo</Button>
                    <Button color="success" onClick={handleSave}>Salvar alterações</Button>
                </Actions>
            </TitleBar>

            <Section>
                <InfoGrid>
                    <InfoItem>
                        <small>Status</small>
                        <div style={{ fontWeight: 700 }}>{projeto.status}</div>
                    </InfoItem>
                    <InfoItem>
                        <small>Início</small>
                        <div style={{ fontWeight: 700 }}>{projeto.inicio}</div>
                    </InfoItem>
                    <InfoItem>
                        <small>Previsão de término</small>
                        <div style={{ fontWeight: 700 }}>{projeto.fim}</div>
                    </InfoItem>
                    <InfoItem>
                        <small>Total de dias</small>
                        <div style={{ fontWeight: 700 }}>{days.length}</div>
                    </InfoItem>

                    {/* Card de custos (novo) */}
                    <InfoItem
                        onClick={() => setShowCosts(true)}
                        style={{ cursor: "pointer" }}
                        title="Clique para ver detalhes de custos"
                    >
                        <small>Custos do projeto</small>
                        <div style={{ fontWeight: 700 }}>
                            {totalCustos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </InfoItem>
                </InfoGrid>

                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                    <Button color="secondary" outline onClick={addRow}>+ Nova linha (demanda)</Button>
                </div>

                <Timeline
                    days={days}
                    rows={rows}
                    custos={projeto.custos}
                    currentUserInitial="A" // ajuste para o usuário logado
                    onPickColor={setCellColor}
                    onSetCellComment={setCellComment}
                    onSetRowSector={setRowSector}
                    canMarkBaseline={true}                 // se usuário for admin
                    baselineColor="#0ea5e9"                // cor única do marco (ajuste como quiser)
                    onToggleBaseline={toggleBaseline}
                />
            </Section>

            {showCosts && (
                <CostsPopover
                    custos={projeto.custos}
                    onClose={() => setShowCosts(false)}
                />
            )}
            <AddCostModal
                isOpen={openCost}
                toggle={() => setOpenCost(v => !v)}
                onSave={(c) => {
                    setProjeto(p => ({ ...p, custos: [...p.custos, ...c] }));
                }}
            />
        </Page>
    );
}
