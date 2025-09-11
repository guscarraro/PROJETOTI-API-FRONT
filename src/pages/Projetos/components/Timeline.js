// src/pages/Projetos/components/Timeline.js
import React, { useRef, useState, useMemo } from "react";
import { Button } from "reactstrap";
import {
    TimelineWrap,
    ContentGrid,
    FixedColHeader,
    LeftHeaderSpacer,
    FirstCol,
    FirstColRow,
    RightScroller,
    HeaderLayer,
    MonthsRow,
    MonthCell,
    DaysRow,
    DayCellHeader,
    GridRows,
    GridRow,
    DayCell,
    Palette,
    ColorDot,
    LegendBar,
    LegendItem,
    LegendDot,
    SectorDot,
    CommentBadge,
    TooltipBox,
    MenuBox,
    MenuItem,
    ColorsRow,
    ClearBtn,
    ActionsRow,
    Overlay,
    BaselineMark,
} from "../style";
import { isWeekend as isWeekendBase } from "../utils";
import { FiFlag } from "react-icons/fi";

const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const monthBgTones = [
    "rgba(96,165,250,0.15)",  // azul claro
    "rgba(52,211,153,0.15)",  // verde claro
    "rgba(245,158,11,0.15)",  // laranja claro
    "rgba(167,139,250,0.15)", // roxo claro
    "rgba(20,184,166,0.15)",  // teal claro
];
// parse seguro: trata "YYYY-MM-DD" como data LOCAL (evita queda para o dia anterior em fusos negativos)
const toLocalDate = (iso) => new Date(`${iso}T00:00:00`);

// fim de semana em horário local
const isWeekendLocal = (iso) => {
    const d = toLocalDate(iso);
    const dow = d.getDay();
    return dow === 0 || dow === 6;
};

// Legenda de estados (cores de preenchimento)
const LEGEND_STATUS = [
    { label: "Em execução", color: "#60a5fa" },   // azul
    { label: "Concluído", color: "#34d399" },   // verde
    { label: "Em risco", color: "#f59e0b" },   // amarelo/laranja
    { label: "Bloqueado", color: "#f87171" },   // vermelho
    { label: "Postergado", color: "#a78bfa" },   // roxo
    { label: "Stand by", color: "#14b8a6" },   // teal
];

// Setores
const SECTORS = [
    { key: "SAC", label: "SAC", initial: "S", color: "#2563eb" },
    { key: "OPERACAO", label: "Operação", initial: "O", color: "#059669" },
    { key: "FRETE", label: "Frete", initial: "F", color: "#f59e0b" },
    { key: "FROTA", label: "Frota", initial: "F", color: "#8b5cf6" },
    { key: "DIRETORIA", label: "Diretoria", initial: "D", color: "#ef4444" },
    { key: "TI", label: "TI", initial: "T", color: "#0ea5e9" },
    { key: "CLIENTES", label: "Clientes", initial: "C", color: "#10b981" },
    { key: "FORNECEDORES", label: "Fornecedores", initial: "F", color: "#14b8a6" },
];
const sectorMap = Object.fromEntries(SECTORS.map(s => [s.key, s]));

export default function Timeline({
    days = [],
    rows = [],
    currentUserInitial = "U",
    onPickColor,              // (rowId, dayISO, color)
    onSetCellComment,         // (rowId, dayISO, comment, authorInitial)
    onSetRowSector,
    canMarkBaseline = false,  // admin habilita marcar baseline
    baselineColor = "#111827",
    onToggleBaseline,             // (rowId, sectorKey)
}) {
    const scrollerRef = useRef(null);
    const firstColRef = useRef(null);
    const [palette, setPalette] = useState(null);
    // --- sincroniza o scroll vertical da coluna fixa com o scroller da direita
    const syncLeftScroll = (e) => {
        if (firstColRef.current) {
            firstColRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };
    const passWheelToRight = (e) => {
        if (scrollerRef.current) {
            scrollerRef.current.scrollTop += e.deltaY;
        }
    };


    React.useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                setPalette(null);
                setSectorMenu(null);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);


    // ---------- Barra de meses ----------
    const monthSegments = useMemo(() => {
        const segs = [];
        if (!days.length) return segs;
        let currentKey = null, span = 0, label = "";
        const push = () => { if (span > 0) segs.push({ key: currentKey, span, label }); };
        for (const iso of days) {
            const d = toLocalDate(iso);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (key !== currentKey) {
                push();
                currentKey = key;
                span = 1;
                label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            } else {
                span++;
            }
        }
        push();
        return segs;
    }, [days]);

    // ---------- Paleta/Popup de célula (cores + comentário) ----------

    // { rowId, dayISO, x, y, commentDraft }
    const openPalette = (rowId, dayISO, e, existing = {}) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const W = 300;  // largura prevista do popover
        const H = 210;  // altura prevista (cores + textarea + ações)
        const M = 8;    // margem da viewport

        let left = rect.left;
        // evita estourar para a direita
        if (left + W > window.innerWidth - M) left = window.innerWidth - W - M;
        if (left < M) left = M;

        // tenta abrir abaixo da célula
        let top = rect.bottom + M;
        // se cortar embaixo, abre acima
        if (top + H > window.innerHeight - M) {
            top = rect.top - H - M;
            if (top < M) top = M; // clamp se ainda estiver muito acima
        }

        setPalette({
            rowId,
            dayISO,
            x: left,
            y: top,
            commentDraft: existing?.comment || "",
            baseline: !!existing?.baseline,
        });
    };


    const closePalette = () => setPalette(null);

    const colors = ["#60a5fa", "#34d399", "#f59e0b", "#f87171", "#a78bfa", "#14b8a6"];

    const handlePickColor = (c) => {
        if (!palette || !onPickColor) return;
        onPickColor(palette.rowId, palette.dayISO, c);
    };

    const handleSave = () => {
        if (!palette) return;
        if (onSetCellComment) {
            onSetCellComment(
                palette.rowId,
                palette.dayISO,
                palette.commentDraft || "",
                currentUserInitial
            );
        }
        if (canMarkBaseline && typeof onToggleBaseline === "function") {
            onToggleBaseline(palette.rowId, palette.dayISO, !!palette.baseline);
        }
        closePalette();
    };

    // ---------- Tooltip de comentário (hover) ----------
    const [tooltip, setTooltip] = useState(null);
    // { x, y, text, authorInitial }
    const showTooltip = (e, text, authorInitial) => {
        const { clientX: x, clientY: y } = e;
        setTooltip({ x, y, text, authorInitial });
    };
    const hideTooltip = () => setTooltip(null);

    // ---------- Menu de setores por linha ----------
    const [sectorMenu, setSectorMenu] = useState(null);
    // { rowId, x, y }
    const openSectorMenu = (rowId, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setSectorMenu({ rowId, x: Math.max(8, Math.min(rect.left, window.innerWidth - 260)), y: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 320)) });
    };
    const closeSectorMenu = () => setSectorMenu(null);
    const pickSector = (key) => {
        if (sectorMenu && onSetRowSector) {
            onSetRowSector(sectorMenu.rowId, key);
        }
        closeSectorMenu();
    };

    return (
        <TimelineWrap>
            {/* Legenda de estados e de setores */}
            <LegendBar>
                {LEGEND_STATUS.map((it) => (
                    <LegendItem key={it.label}>
                        <LegendDot $color={it.color} />
                        <span>{it.label}</span>
                    </LegendItem>
                ))}
                {SECTORS.map((s) => (
                    <LegendItem key={s.key}>
                        <SectorDot $color={s.color}>{s.initial}</SectorDot>
                        <span>{s.label}</span>
                    </LegendItem>
                ))}
            </LegendBar>

            <ContentGrid>
                {/* Coluna fixa à esquerda */}
                <div>
                    <FixedColHeader>Demanda / Função</FixedColHeader>
                    <FirstCol ref={firstColRef} onWheel={passWheelToRight}>
                        {rows.map((r) => {
                            const sector = r.sector ? sectorMap[r.sector] : null;
                            return (
                                <FirstColRow
                                    key={r.id}
                                    onClick={(e) => openSectorMenu(r.id, e)}
                                    title="Clique para definir/alterar o setor responsável"
                                    style={{ cursor: "pointer" }}
                                >
                                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {r.titulo}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 100, justifyContent: 'flex-end' }}>
                                            {(
                                                Array.isArray(r.sectors)
                                                    ? r.sectors
                                                    : (r.sector ? [r.sector] : []) // compatibilidade com dados antigos
                                            ).length > 0
                                                ? (
                                                    (Array.isArray(r.sectors) ? r.sectors : [r.sector]).map((key) => {
                                                        const s = sectorMap[key];
                                                        return <SectorDot key={key} $color={s?.color}>{s?.initial || "?"}</SectorDot>;
                                                    })
                                                )
                                                : <SectorDot $color="#9ca3af">+</SectorDot>
                                            }
                                        </div>
                                    </div>
                                </FirstColRow>
                            );
                        })}
                    </FirstCol>
                </div>

                {/* Scroller único à direita (horizontal e vertical) */}
                <RightScroller ref={scrollerRef} onScroll={syncLeftScroll}>
                    <HeaderLayer>
                        <MonthsRow>
                            {monthSegments.map((m, i) => (
                                <MonthCell
                                    key={m.key}
                                    style={{ gridColumn: `span ${m.span}` }}
                                    $bg={monthBgTones[i % monthBgTones.length]}
                                >
                                    {m.label}
                                </MonthCell>
                            ))}
                        </MonthsRow>

                        <DaysRow>
                            {days.map((d) => (
                                <DayCellHeader key={d} $weekend={isWeekendLocal(d)}>
                                    {toLocalDate(d).getDate()}
                                </DayCellHeader>
                            ))}
                        </DaysRow>
                    </HeaderLayer>

                    {/* Corpo (linhas x dias) */}
                    <GridRows>
                        {rows.map((r) => (
                            <GridRow key={r.id}>
                                {days.map((d) => {
                                    const cell = r?.cells?.[d];
                                    const color = typeof cell === "string" ? cell : cell?.color;
                                    const comment = typeof cell === "object" ? cell?.comment : undefined;
                                    const authorInitial = typeof cell === "object" ? (cell?.authorInitial || "U") : undefined;
                                    const baseline = typeof cell === "object" ? !!cell?.baseline : false;

                                    return (
                                        <div
                                            key={d}
                                            style={{ position: "relative" }}
                                            onMouseEnter={(e) => {
                                                if (comment) showTooltip(e, comment, authorInitial);
                                            }}
                                            onMouseLeave={hideTooltip}
                                        >
                                            <DayCell
                                                $weekend={isWeekendLocal(d)}
                                                $color={color}
                                                onClick={(e) => {
                                                    if (isWeekendLocal(d)) return;
                                                    openPalette(r.id, d, e, { comment, baseline });
                                                }}
                                                title={isWeekendLocal(d) ? "Fim de semana" : "Clique para cor/comentário"}
                                            />
                                            {comment && <CommentBadge>OBS</CommentBadge>}
                                            {baseline && (
                                                <BaselineMark $color={baselineColor} title="Marco do plano">
                                                    <FiFlag size={14} />
                                                </BaselineMark>
                                            )}

                                        </div>
                                    );
                                })}
                            </GridRow>
                        ))}
                    </GridRows>
                </RightScroller>
            </ContentGrid>
            {(sectorMenu || palette) && (
                <Overlay onClick={() => { setSectorMenu(null); setPalette(null); }} />
            )}

            {/* Menu de seleção de setor */}
            {sectorMenu && (
                <MenuBox style={{ position: "fixed", left: sectorMenu.x, top: sectorMenu.y }}>
                    {SECTORS.map((s) => {
                        const selected = Array.isArray(rows.find(r => r.id === sectorMenu.rowId)?.sectors)
                            ? rows.find(r => r.id === sectorMenu.rowId).sectors.includes(s.key)
                            : rows.find(r => r.id === sectorMenu.rowId)?.sector === s.key; // compat
                        return (
                            <MenuItem key={s.key} onClick={() => pickSector(s.key)} $active={selected}>
                                <SectorDot $color={s.color} style={{ marginRight: 8 }}>{s.initial}</SectorDot>
                                {s.label}
                            </MenuItem>
                        )
                    })}
                </MenuBox>
            )}

            {/* Paleta de cores + comentário */}
            {palette && (
                <div
                    style={{ position: "fixed", left: palette.x, top: palette.y, zIndex: 1001 }}
                    onClick={(e) => e.stopPropagation()} // evita qualquer bolha indesejada
                >
                    <Palette style={{ width: 300 }}>
                        <ColorsRow>
                            {colors.map((c) => (
                                <ColorDot key={c} $color={c} onClick={() => handlePickColor(c)} />
                            ))}
                            <ClearBtn type="button" onClick={() => handlePickColor(undefined)}>
                                Limpar
                            </ClearBtn>

                        </ColorsRow>

                        {canMarkBaseline && (
                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, margin: "4px 0 8px" }}>
                                <input
                                    type="checkbox"
                                    checked={!!palette.baseline}
                                    onChange={(e) => setPalette(prev => ({ ...prev, baseline: e.target.checked }))}
                                />
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                    <span>Marco do plano</span>
                                    <span style={{ position: "relative", width: 18, height: 18 }}>
                                        <span style={{
                                            position: "absolute", inset: 0, display: "inline-block"
                                        }}>
                                            <BaselineMark $color={baselineColor} />
                                        </span>
                                    </span>
                                </span>
                            </label>
                        )}
                        <textarea
                            rows={3}
                            placeholder="Adicionar/editar comentário..."
                            className="palette-textarea"
                            value={palette.commentDraft}
                            onChange={(e) => setPalette(prev => ({ ...prev, commentDraft: e.target.value }))}
                        />

                        <ActionsRow>
                            <Button size="sm" color="secondary" onClick={closePalette}>Cancelar</Button>
                            <Button size="sm" color="primary" onClick={handleSave}>Salvar</Button>
                        </ActionsRow>
                    </Palette>
                </div>
            )}

            {/* Tooltip do comentário */}
            {tooltip && (
                <TooltipBox style={{ position: "fixed", left: tooltip.x + 12, top: tooltip.y + 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <SectorDot $color="#111827">{tooltip.authorInitial || "U"}</SectorDot>
                        <strong>Comentário</strong>
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{tooltip.text}</div>
                </TooltipBox>
            )}
        </TimelineWrap>
    );
}
