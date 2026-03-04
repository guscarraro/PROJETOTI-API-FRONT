import React, { useEffect, useMemo, useState, useCallback } from "react";
import apiLocal from "../../../../services/apiLocal";
import useLoading from "../../../../hooks/useLoading";
import NavBar from "../../../Projetos/components/NavBar";
import { PageLoader } from "../../../Projetos/components/Loader"
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { FiDownload, FiTrash2 } from "react-icons/fi";
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
  TdCompact,
  CountPill,
  RowActions,
  ActionBtn,
  Card,
  CardTitle,
} from "./style";

function fmtMoney(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RelatorioPage() {
  const loading = useLoading();

  const now = new Date();
  const [ano, setAno] = useState(String(now.getFullYear()));
  const [mes, setMes] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const [rows, setRows] = useState([]);
  const [active, setActive] = useState(null);
  const [activeItems, setActiveItems] = useState([]);

  const fetchList = useCallback(async () => {
    const params = {};
    if (ano) params.ano = Number(ano);
    if (mes) params.mes = Number(mes);
    if (status) params.status = status;
    if (q) params.q = q;

    const res = await loading.wrap("dre-rel-list", () =>
      apiLocal.dreListRelatorios(params),
    );
    setRows(res.data || []);
  }, [ano, mes, status, q, loading]);

  const openDetail = async (r) => {
    setActive(r);
    const resItems = await loading.wrap("dre-rel-items", () =>
      apiLocal.dreListItens(r.id, {}),
    );
    setActiveItems(resItems.data || []);
  };

  useEffect(() => {
    (async () => {
      await fetchList();
    })();
    // eslint-disable-next-line
  }, []);

  const total = useMemo(() => rows.length, [rows]);

  const exportExcel = () => {
    if (!active || !activeItems.length) {
      toast.warn("Selecione um relatório com itens.");
      return;
    }

    const data = [];
    for (let i = 0; i < activeItems.length; i++) {
      const it = activeItems[i];
      data.push({
        cod_agrupador: it.cod_agrupador,
        numero_doc: it.numero_doc || "",
        doc: it.doc || "",
        pessoa: it.pessoa || "",
        data_doc: it.data_doc || "",
        item: it.item || "",
        cfin_codigo: it.cfin_codigo || "",
        cfin_nome: it.cfin_nome || "",
        empresa: it.empresa || "",
        valor_item: it.valor_item ?? 0,
        valor_doc: it.valor_doc ?? 0,
        setor: it.setor || "",
        justificativa: it.justificativa || "",
        observacao: it.observacao || "",
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio");
    XLSX.writeFile(wb, `${active.cod_agrupador || "dre-relatorio"}.xlsx`);
  };

  const deleteRelatorio = async (r) => {
    if (!window.confirm("Excluir relatório e itens?")) return;
    try {
      await loading.wrap("dre-del-rel", () => apiLocal.dreDeleteRelatorio(r.id));
      toast.success("Excluído!");
      setActive(null);
      setActiveItems([]);
      await fetchList();
    } catch (e) {
      toast.error("Falha ao excluir.");
      console.error(e);
    }
  };

  const clearFilters = async () => {
    setAno(String(now.getFullYear()));
    setMes(String(now.getMonth() + 1).padStart(2, "0"));
    setStatus("");
    setQ("");
    await fetchList();
  };

  return (
    <Page>
      <PageLoader active={loading.any()} text="Carregando relatórios..." />
      <NavBar />

      <TitleBar>
        <H1>DRE — Relatórios</H1>
        <FiltersRight>
          <FilterButton type="button" onClick={exportExcel} disabled={loading.any() || !active}>
            <FiDownload style={{ marginRight: 8 }} />
            Baixar XLSX
          </FilterButton>
          <CountPill>{total} relatórios</CountPill>
        </FiltersRight>
      </TitleBar>

      <Section>
        <FiltersRow>
          <FiltersLeft>
            <FilterGroup>
              <FilterLabel>Ano</FilterLabel>
              <FilterInput value={ano} onChange={(e) => setAno(e.target.value)} />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Mês</FilterLabel>
              <FilterInput value={mes} onChange={(e) => setMes(e.target.value)} />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Status</FilterLabel>
              <FilterSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Todos</option>
                <option value="em_analise">Em análise</option>
                <option value="pronto">Pronto</option>
                <option value="concluido">Concluído</option>
                <option value="erro">Erro</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Buscar (cod_agrupador)</FilterLabel>
              <FilterInput value={q} onChange={(e) => setQ(e.target.value)} />
            </FilterGroup>
          </FiltersLeft>

          <FiltersRight>
            <FilterButton type="button" disabled={loading.any()} onClick={fetchList}>
              Buscar
            </FilterButton>
            <ClearButton type="button" disabled={loading.any()} onClick={clearFilters}>
              Limpar
            </ClearButton>
          </FiltersRight>
        </FiltersRow>
      </Section>

      <Section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardTitle>Lista</CardTitle>

          <TableWrap style={{ maxHeight: "60vh", overflow: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <Th>Cod</Th>
                  <Th>Ano/Mês</Th>
                  <Th>Status</Th>
                  <Th>Total linhas</Th>
                  <Th>Total valor</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openDetail(r)}
                    style={{
                      cursor: "pointer",
                      background: active?.id === r.id ? "rgba(37,99,235,0.06)" : "transparent",
                    }}
                  >
                    <TdCompact><strong>{r.cod_agrupador}</strong></TdCompact>
                    <TdCompact>{r.ano}/{String(r.mes).padStart(2, "0")}</TdCompact>
                    <TdCompact>{r.status}</TdCompact>
                    <TdCompact style={{ textAlign: "right" }}>{r.total_linhas}</TdCompact>
                    <TdCompact style={{ textAlign: "right" }}>R$ {fmtMoney(r.total_valor)}</TdCompact>
                    <TdCompact onClick={(e) => e.stopPropagation()}>
                      <RowActions>
                        <ActionBtn type="button" $danger onClick={() => deleteRelatorio(r)}>
                          <FiTrash2 style={{ marginRight: 6 }} /> Excluir
                        </ActionBtn>
                      </RowActions>
                    </TdCompact>
                  </tr>
                ))}

                {!rows.length && !loading.any() && (
                  <tr>
                    <Td colSpan={6} style={{ textAlign: "center", opacity: 0.7 }}>
                      Nenhum relatório encontrado.
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrap>
        </Card>

        <Card>
          <CardTitle>Detalhe</CardTitle>

          {!active ? (
            <div style={{ opacity: 0.7, fontSize: 13 }}>
              Selecione um relatório na lista.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, marginBottom: 10 }}>
                <strong>{active.cod_agrupador}</strong> — {active.ano}/{String(active.mes).padStart(2, "0")}
              </div>

              <TableWrap style={{ maxHeight: "60vh", overflow: "auto" }}>
                <Table>
                  <thead>
                    <tr>
                      <Th>Doc</Th>
                      <Th>Pessoa</Th>
                      <Th>Item</Th>
                      <Th>CFIn</Th>
                      <Th>Setor</Th>
                      <Th>Valor</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeItems.map((it) => (
                      <tr key={it.id}>
                        <TdCompact>{it.doc || "—"}</TdCompact>
                        <TdCompact>{it.pessoa || "—"}</TdCompact>
                        <TdCompact style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {it.item || "—"}
                        </TdCompact>
                        <TdCompact>{it.cfin_codigo || "—"}</TdCompact>
                        <TdCompact>{it.setor || "—"}</TdCompact>
                        <TdCompact style={{ textAlign: "right" }}>R$ {fmtMoney(it.valor_doc)}</TdCompact>
                      </tr>
                    ))}

                    {!activeItems.length && (
                      <tr>
                        <Td colSpan={6} style={{ textAlign: "center", opacity: 0.7 }}>
                          Sem itens.
                        </Td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </TableWrap>
            </>
          )}
        </Card>
      </Section>
    </Page>
  );
}