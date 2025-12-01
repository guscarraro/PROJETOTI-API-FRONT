// src/pages/RelatorioConferencia/index.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import apiLocal from "../../../services/apiLocal";
import useLoading from "../../../hooks/useLoading";
import NavBar from "../../Projetos/components/NavBar";
import { PageLoader } from "../../Projetos/components/Loader";
import {
  Page,
  TitleBar,
  H1,
  Section,
  FiltersRow,
  FiltersLeft,
  FiltersRight,
  FilterGroup,
  FilterLabel,
  FilterInput,
  FilterSelect,
  FilterButton,
  ClearButton,
  TableWrap,
  Table,
  Th,
  Td,
  StatusBadge,
  MutedText,
  CountPill,
} from "./style";
import * as XLSX from "xlsx";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return String(value);
  }
}

function formatDuration(sec) {
  if (sec === null || sec === undefined) return "—";
  const v = Number(sec);
  if (Number.isNaN(v)) return "—";
  const total = Math.max(0, Math.floor(v));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundos = total % 60;

  if (horas > 0) return `${horas}h ${String(minutos).padStart(2, "0")}m`;
  return `${minutos}m ${String(segundos).padStart(2, "0")}s`;
}

// Chip de duração: tudo em azul (dark-friendly)
function getDurationChipStyle(sec) {
  const baseStyle = {
    borderRadius: 9999,
    padding: "2px 8px",
    fontSize: 11,
    display: "inline-block",
    whiteSpace: "nowrap",
  };

  if (sec === null || sec === undefined) {
    return {
      ...baseStyle,
      background: "#374151", // cinza dark
      color: "#e5e7eb",
      fontWeight: 500,
    };
  }

  const v = Number(sec);
  if (Number.isNaN(v)) {
    return {
      ...baseStyle,
      background: "#374151",
      color: "#e5e7eb",
      fontWeight: 500,
    };
  }

  return {
    ...baseStyle,
    background: "#1e40af", // azul 800
    color: "#e0f2fe", // azul 100
    fontWeight: 600,
  };
}

function buildParamsFromFilters(f) {
  const params = {};
  if (f.dt_inicio) params.dt_inicio = f.dt_inicio;
  if (f.dt_fim) params.dt_fim = f.dt_fim;
  if (f.status) params.status = f.status;
  if (f.nr_pedido) params.nr_pedido = f.nr_pedido;
  if (f.nota) params.nota = f.nota;
  return params;
}

// helper para formatar Date em yyyy-mm-dd (input date)
function toDateInputValue(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// range inicial = semana atual (segunda -> hoje)
function getInitialWeekRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(today);
  const day = d.getDay(); // 0 = domingo, 1 = segunda, ...
  const diffToMonday = day === 0 ? -6 : 1 - day; // segunda como início
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const start = monday;
  const end = today;

  return {
    dt_inicio: toDateInputValue(start),
    dt_fim: toDateInputValue(end),
  };
}

// fallback: recalcular Δ criação → conf no front
function calcTempoCriacaoAteConfSeg(p) {
  if (
    p.tempo_criacao_ate_conf_seg !== null &&
    p.tempo_criacao_ate_conf_seg !== undefined &&
    p.tempo_criacao_ate_conf_seg > 0
  ) {
    return p.tempo_criacao_ate_conf_seg;
  }

  if (!p.created_at || !p.conferencia_finalizada_em) {
    return null;
  }

  const ini = new Date(p.created_at);
  const fim = new Date(p.conferencia_finalizada_em);

  if (Number.isNaN(ini.getTime()) || Number.isNaN(fim.getTime())) {
    return null;
  }

  const diffSec = Math.floor((fim.getTime() - ini.getTime()) / 1000);
  return diffSec > 0 ? diffSec : 0;
}

// fallback: recalcular Δ conf → expedição no front
function calcTempoConfAteExpSeg(p) {
  if (
    p.tempo_pronto_ate_expedido_seg !== null &&
    p.tempo_pronto_ate_expedido_seg !== undefined &&
    p.tempo_pronto_ate_expedido_seg > 0
  ) {
    return p.tempo_pronto_ate_expedido_seg;
  }

  if (!p.conferencia_finalizada_em || !p.expedido_em) {
    return null;
  }

  const conf = new Date(p.conferencia_finalizada_em);
  const exp = new Date(p.expedido_em);

  if (Number.isNaN(conf.getTime()) || Number.isNaN(exp.getTime())) {
    return null;
  }

  const diffSec = Math.floor((exp.getTime() - conf.getTime()) / 1000);
  return diffSec > 0 ? diffSec : 0;
}

export default function RelatorioConferenciaPage() {
  const loading = useLoading();
  const initialRange = getInitialWeekRange();

  const [rows, setRows] = useState([]);

  const [filters, setFilters] = useState({
    dt_inicio: initialRange.dt_inicio,
    dt_fim: initialRange.dt_fim,
    status: "",
    nr_pedido: "",
    nota: "",
  });

  const [quickRange, setQuickRange] = useState("semana_atual");

  const handleChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    if (field === "dt_inicio" || field === "dt_fim") {
      setQuickRange("");
    }
  }, []);

  const clearFilters = useCallback(() => {
    const week = getInitialWeekRange();
    setFilters({
      dt_inicio: week.dt_inicio,
      dt_fim: week.dt_fim,
      status: "",
      nr_pedido: "",
      nota: "",
    });
    setQuickRange("semana_atual");
  }, []);

  const fetchFromFilters = async (f) => {
    const params = buildParamsFromFilters(f);
    const res = await loading.wrap("relatorio-pedidos", async () =>
      apiLocal.getPedidosRelatorio(params)
    );
    setRows(res.data || []);
  };

  // aplica range rápido (Hoje, Ontem, Semana, etc.)
  const applyQuickRange = useCallback((value) => {
    setQuickRange(value);

    if (!value) {
      setFilters((prev) => ({
        ...prev,
        dt_inicio: "",
        dt_fim: "",
      }));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = null;
    let end = null;

    if (value === "hoje") {
      start = new Date(today);
      end = new Date(today);
    } else if (value === "ontem") {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      start = d;
      end = d;
    } else if (value === "semana_atual") {
      const d = new Date(today);
      const day = d.getDay(); // 0 = domingo, 1 = segunda, ...
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diffToMonday);
      start = monday;
      end = d;
    } else if (value === "mes_atual") {
      const year = today.getFullYear();
      const month = today.getMonth(); // 0-11
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      start = first;
      end = last;
    } else if (value === "mes_passado") {
      const year = today.getFullYear();
      const month = today.getMonth(); // 0-11
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const first = new Date(prevYear, prevMonth, 1);
      const last = new Date(prevYear, prevMonth + 1, 0);
      start = first;
      end = last;
    }

    if (start && end) {
      const iniStr = toDateInputValue(start);
      const fimStr = toDateInputValue(end);

      setFilters((prev) => ({
        ...prev,
        dt_inicio: iniStr,
        dt_fim: fimStr,
      }));
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchFromFilters({
        dt_inicio: initialRange.dt_inicio,
        dt_fim: initialRange.dt_fim,
        status: "",
        nr_pedido: "",
        nota: "",
      });
    })();
    // eslint-disable-next-line
  }, []);

  const total = useMemo(() => rows.length, [rows]);

  function mapStatusForDisplay(status) {
    const s = (status || "").toUpperCase();
    if (s === "CONCLUIDO") return "EXPEDIDO";
    return s;
  }

  const handleExportExcel = () => {
    if (!rows.length) return;

    const data = rows.map((p) => {
      const tempoCriacaoConfSeg = calcTempoCriacaoAteConfSeg(p);
      const tempoConfExpSeg = calcTempoConfAteExpSeg(p);

      return {
        "Criado em": formatDateTime(p.created_at),
        Remessa: p.nr_pedido,
        NF: p.nota || "",
        Cliente: p.cliente || "",
        Destino: p.destino || "",
        Status: mapStatusForDisplay(p.status),
        Itens: p.total_itens,
        Separador: p.separador || "",
        Conferente: p.conferente || "",
        Transportador: p.transportador || "",
        "Teve ocorrência":
          p.has_ocorrencia ? `SIM (${p.qtd_ocorrencias_conferencia})` : "NÃO",
        "Conf. finalizada": formatDateTime(p.conferencia_finalizada_em),
        "Δ criação → conf (s)": tempoCriacaoConfSeg ?? "",
        "Δ criação → conf (fmt)": formatDuration(tempoCriacaoConfSeg),
        "Expedido em": formatDateTime(p.expedido_em),
        "Δ conf → expedição (s)": tempoConfExpSeg ?? "",
        "Δ conf → expedição (fmt)": formatDuration(tempoConfExpSeg),
        "Total scan unitário": p.total_scan_unitario,
        "Total scan lote (qtde)": p.total_scan_lote_qtde,
        "Total scan lote (eventos)": p.total_scan_lote_eventos,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, "relatorio-conferencia.xlsx");
  };

  return (
    <Page>
      <PageLoader active={loading.any()} text="Carregando relatório..." />
      <NavBar />

      <TitleBar>
        <H1>Relatório de Conferência</H1>
        <FiltersRight>
          <FilterButton
            type="button"
            onClick={handleExportExcel}
            disabled={loading.any() || !rows.length}
            style={{ marginRight: 8 }}
          >
            Exportar Excel
          </FilterButton>
          <CountPill>{total} pedidos</CountPill>
        </FiltersRight>
      </TitleBar>

      <Section>
        <FiltersRow
          as="form"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetchFromFilters(filters);
          }}
        >
          <FiltersLeft>
            <FilterGroup>
              <FilterLabel>Período rápido</FilterLabel>
              <FilterSelect
                value={quickRange}
                onChange={(e) => applyQuickRange(e.target.value)}
              >
                <option value="">Personalizado</option>
                <option value="hoje">Hoje</option>
                <option value="ontem">Ontem</option>
                <option value="semana_atual">Semana atual</option>
                <option value="mes_atual">Mês atual</option>
                <option value="mes_passado">Mês passado</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Data início</FilterLabel>
              <FilterInput
                type="date"
                value={filters.dt_inicio}
                onChange={(e) => handleChange("dt_inicio", e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Data fim</FilterLabel>
              <FilterInput
                type="date"
                value={filters.dt_fim}
                onChange={(e) => handleChange("dt_fim", e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Status</FilterLabel>
              <FilterSelect
                value={filters.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PRONTO_EXPEDICAO">
                  Pronto para expedir
                </option>
                <option value="EXPEDIDO">Expedido</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Remessa</FilterLabel>
              <FilterInput
                type="text"
                value={filters.nr_pedido}
                onChange={(e) => handleChange("nr_pedido", e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Nota Fiscal</FilterLabel>
              <FilterInput
                type="text"
                value={filters.nota}
                onChange={(e) => handleChange("nota", e.target.value)}
              />
            </FilterGroup>
          </FiltersLeft>

          <FiltersRight>
            <FilterButton type="submit" disabled={loading.any()}>
              Buscar
            </FilterButton>

            <ClearButton
              type="button"
              disabled={loading.any()}
              onClick={async () => {
                clearFilters();
                const week = getInitialWeekRange();
                await fetchFromFilters({
                  dt_inicio: week.dt_inicio,
                  dt_fim: week.dt_fim,
                  status: "",
                  nr_pedido: "",
                  nota: "",
                });
              }}
            >
              Limpar
            </ClearButton>
          </FiltersRight>
        </FiltersRow>
      </Section>

      <Section style={{ marginTop: 16 }}>
        <TableWrap
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <Table>
            <thead>
              <tr>
                {[
                  "Criado em",
                  "Remessa",
                  "NF",
                  "Cliente",
                  "Destino",
                  "Status",
                  "Itens",
                  "Separador",
                  "Conferente",
                  "Transportador",
                  "Ocorrência",
                  "Conf. Finalizada",
                  "Δ Criação → Conf",
                  "Expedido em",
                  "Δ Conf → Expedição",
                  "Bipagens",
                ].map((h, i) => (
                  <Th
                    key={i}
                    style={{
                      padding: "4px 6px",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                      minWidth: 120,
                    }}
                  >
                    {h}
                  </Th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((p) => {
                const tempoCriacaoConfSeg = calcTempoCriacaoAteConfSeg(p);
                const tempoConfExpSeg = calcTempoConfAteExpSeg(p);

                return (
                  <tr key={p.id}>
                    {/* Criado em */}
                    <Td style={tdCompact}>{formatDateTime(p.created_at)}</Td>

                    {/* Remessa */}
                    <Td style={tdCompact}>
                      <strong>{p.nr_pedido}</strong>
                    </Td>

                    {/* NF */}
                    <Td style={tdCompact}>{p.nota || "—"}</Td>

                    {/* Cliente */}
                    <Td style={tdCompact}>
                      <div>{p.cliente}</div>
                      <MutedText style={{ whiteSpace: "nowrap" }}>
                        {p.ov ? `OV: ${p.ov}` : ""}
                      </MutedText>
                    </Td>

                    {/* Destino */}
                    <Td style={tdCompact}>{p.destino || "—"}</Td>

                    {/* Status */}
                    <Td style={tdCompact}>
                      <StatusBadge $status={mapStatusForDisplay(p.status)}>
                        {mapStatusForDisplay(p.status)}
                      </StatusBadge>
                    </Td>

                    {/* Itens */}
                    <Td style={{ ...tdCompact, textAlign: "right" }}>
                      {p.total_itens}
                    </Td>

                    <Td style={tdCompact}>{p.separador || "—"}</Td>
                    <Td style={tdCompact}>{p.conferente || "—"}</Td>
                    <Td style={tdCompact}>{p.transportador || "—"}</Td>

                    {/* Ocorrência */}
                    <Td style={tdCompact}>
                      {p.has_ocorrencia ? (
                        <span style={occBadge}>
                          ⚠ Ocorrência ({p.qtd_ocorrencias_conferencia})
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, opacity: 0.6 }}>
                          Sem ocorrência
                        </span>
                      )}
                    </Td>

                    {/* Conf. finalizada */}
                    <Td style={tdCompact}>
                      {formatDateTime(p.conferencia_finalizada_em)}
                    </Td>

                    {/* Δ criação → Conf */}
                    <Td style={tdCompact}>
                      <span style={getDurationChipStyle(tempoCriacaoConfSeg)}>
                        {formatDuration(tempoCriacaoConfSeg)}
                      </span>
                    </Td>

                    {/* Expedido */}
                    <Td style={tdCompact}>
                      {formatDateTime(p.expedido_em)}
                    </Td>

                    {/* Δ Conf → Expedição */}
                    <Td style={tdCompact}>
                      <span style={getDurationChipStyle(tempoConfExpSeg)}>
                        {formatDuration(tempoConfExpSeg)}
                      </span>
                    </Td>

                    {/* Bipagens */}
                    <Td style={tdCompact}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <div className="unit-box" style={unitBox}>
                          <span>Unitário</span>
                          <strong>{p.total_scan_unitario ?? "—"}</strong>
                        </div>

                        <div className="lote-box" style={loteBox}>
                          <div>
                            <span>Lote abatido:</span>{" "}
                            <strong>{p.total_scan_lote_qtde ?? "—"}</strong>
                          </div>
                          <div style={{ fontSize: 10, opacity: 0.7 }}>
                            Leituras: {p.total_scan_lote_eventos ?? "—"}
                          </div>
                        </div>
                      </div>
                    </Td>
                  </tr>
                );
              })}

              {!rows.length && !loading.any() && (
                <tr>
                  <Td
                    colSpan={16}
                    style={{
                      textAlign: "center",
                      opacity: 0.7,
                      padding: "6px",
                    }}
                  >
                    Nenhum pedido encontrado.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>
      </Section>
    </Page>
  );
}

/* ===== estilos inline compactos ===== */

const tdCompact = {
  padding: "4px 6px",
  whiteSpace: "nowrap",
  lineHeight: 1,
  verticalAlign: "middle",
};

const occBadge = {
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 6px",
  borderRadius: 9999,
  background: "#fed7aa",
  color: "#7c2d12",
  fontSize: 11,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const unitBox = {
  display: "flex",
  justifyContent: "space-between",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "3px 6px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
};

const loteBox = {
  display: "flex",
  flexDirection: "column",
  background: "#ecfdf5",
  color: "#047857",
  padding: "3px 6px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
};
