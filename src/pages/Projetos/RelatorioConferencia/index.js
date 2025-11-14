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

// helper pra montar params a partir dos filtros
function buildParamsFromFilters(f) {
  const params = {};
  if (f.dt_inicio) params.dt_inicio = f.dt_inicio;
  if (f.dt_fim) params.dt_fim = f.dt_fim;
  if (f.status) params.status = f.status;
  if (f.nr_pedido) params.nr_pedido = f.nr_pedido;
  if (f.nota) params.nota = f.nota;
  return params;
}

export default function RelatorioConferenciaPage() {
  const loading = useLoading();

  const [rows, setRows] = useState([]);

  const [filters, setFilters] = useState({
    dt_inicio: "",
    dt_fim: "",
    status: "",
    nr_pedido: "",
    nota: "",
  });

  const handleChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dt_inicio: "",
      dt_fim: "",
      status: "",
      nr_pedido: "",
      nota: "",
    });
  }, []);

  // função normal, SEM useCallback (não entra em deps de effect)
  const fetchFromFilters = async (f) => {
    const params = buildParamsFromFilters(f);

    const res = await loading.wrap("relatorio-pedidos", async () =>
      apiLocal.getPedidosRelatorio(params)
    );

    setRows(res.data || []);
  };

  // carga inicial: roda UMA vez só
  useEffect(() => {
    (async () => {
      try {
        await fetchFromFilters({
          dt_inicio: "",
          dt_fim: "",
          status: "",
          nr_pedido: "",
          nota: "",
        });
      } catch (err) {
        console.error(err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <– deps vazias, não depende mais do fetch/filters

  const total = useMemo(() => rows.length, [rows]);
  function mapStatusForDisplay(status) {
    const s = (status || "").toUpperCase();
    if (s === "CONCLUIDO") return "EXPEDIDO";
    return s;
  }
  const handleExportExcel = () => {
    if (!rows || rows.length === 0) return;

    const data = rows.map((p) => ({
      "Criado em": formatDateTime(p.created_at),
      Remessa: p.nr_pedido || "",
      NF: p.nota || "",
      Cliente: p.cliente || "",
      Destino: p.destino || "",
      Status: mapStatusForDisplay(p.status) || "",
      Itens:
        typeof p.total_itens === "number" ? p.total_itens : p.total_itens || 0,
      Separador: p.separador || "",
      Conferente: p.conferente || "",
      Transportador: p.transportador || "",
    }));

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
            disabled={loading.any() || rows.length === 0}
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
                <option value="PRONTO_EXPEDICAO">Pronto para expedir</option>
                <option value="EXPEDIDO">Expedido</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Remessa (nr_pedido)</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Ex: 12345"
                value={filters.nr_pedido}
                onChange={(e) => handleChange("nr_pedido", e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Nota Fiscal</FilterLabel>
              <FilterInput
                type="text"
                placeholder="NF"
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
                await fetchFromFilters({
                  dt_inicio: "",
                  dt_fim: "",
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
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th style={{ minWidth: 150 }}>Criado em</Th>
                <Th style={{ minWidth: 110 }}>Remessa</Th>
                <Th style={{ minWidth: 110 }}>NF</Th>
                <Th style={{ minWidth: 180 }}>Cliente</Th>
                <Th style={{ minWidth: 180 }}>Destino</Th>
                <Th style={{ minWidth: 120 }}>Status</Th>
                <Th style={{ minWidth: 80, textAlign: "right" }}>Itens</Th>
                <Th style={{ minWidth: 130 }}>Separador</Th>
                <Th style={{ minWidth: 130 }}>Conferente</Th>
                <Th style={{ minWidth: 160 }}>Transportador</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td>{formatDateTime(p.created_at)}</Td>
                  <Td>
                    <strong>{p.nr_pedido || "—"}</strong>
                  </Td>
                  <Td>{p.nota || "—"}</Td>
                  <Td>
                    <div>{p.cliente || "—"}</div>
                    <MutedText>{p.ov ? `OV: ${p.ov}` : ""}</MutedText>
                  </Td>
                  <Td>{p.destino || "—"}</Td>
                  <Td>
                    <StatusBadge $status={mapStatusForDisplay(p.status)}>
                      {mapStatusForDisplay(p.status) || "—"}
                    </StatusBadge>
                  </Td>

                  <Td style={{ textAlign: "right" }}>
                    {typeof p.total_itens === "number"
                      ? p.total_itens
                      : p.total_itens || 0}
                  </Td>
                  <Td>{p.separador || "—"}</Td>
                  <Td>{p.conferente || "—"}</Td>
                  <Td>{p.transportador || "—"}</Td>
                </tr>
              ))}

              {rows.length === 0 && !loading.any() && (
                <tr>
                  <Td
                    colSpan={10}
                    style={{ textAlign: "center", opacity: 0.7 }}
                  >
                    Nenhum pedido encontrado com esses filtros.
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
