import React, { useEffect, useMemo, useState, useCallback } from "react";
import apiLocal from "../../../../services/apiLocal";
import useLoading from "../../../../hooks/useLoading";
import NavBar from "../../../Projetos/components/NavBar";
import { PageLoader } from "../../../Projetos/components/Loader";
import { toast } from "react-toastify";
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
  FormGrid,
  Inline,
} from "./style";

const now = new Date();
const defaultAno = now.getFullYear();
const defaultMes = now.getMonth() + 1;

// Helper para remover caracteres não numéricos
const onlyDigits = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

// Helper para formatar CPF/CNPJ (opcional - só para exibição)
const formatDoc = (value) => {
  const digits = onlyDigits(value);
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else {
    // CNPJ: 00.000.000/0000-00
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
};

const emptyCusto = {
  id: null,
  ano: defaultAno,
  mes: defaultMes,
  doc: "", // número da nota (opcional)
  cnpj_cpf: "", // CPF/CNPJ do prestador (apenas números)
  nome_contains: "",
  item_contains: "",
  cfin_codigo: "",
  setor: "",
  valor_esperado: 0,
  tolerancia_percent: 0,
  recorrencia: "MENSAL", // MENSAL ou UNICO
  recorrencia_obs: "",
  ativo: true,
  obs: "",
};

export default function CustosFixosProgramadosPage() {
  const loading = useLoading();

  const [ano, setAno] = useState(String(defaultAno));
  const [mes, setMes] = useState(String(defaultMes).padStart(2, "0"));
  const [q, setQ] = useState("");
  const [ativo, setAtivo] = useState("");
  const [recorrencia, setRecorrencia] = useState("");

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ ...emptyCusto });

  const fetchRows = useCallback(async () => {
    const params = {};
    if (ano) params.ano = Number(ano);
    if (mes) params.mes = Number(mes);
    if (q) params.q = q;
    if (ativo !== "") params.ativo = ativo === "true";
    if (recorrencia) params.recorrencia = recorrencia;

    const res = await loading.wrap("dre-custos", () => apiLocal.dreListCustos(params));
    setRows(res.data || []);
  }, [ano, mes, q, ativo, recorrencia, loading]);

  useEffect(() => {
    (async () => {
      await fetchRows();
    })();
    // eslint-disable-next-line
  }, []);

  const total = useMemo(() => rows.length, [rows]);

  const onSave = async () => {
    try {
      if (!form.ano || !form.mes) {
        toast.error("Ano e mês são obrigatórios.");
        return;
      }

      // Garantir que CPF/CNPJ tenha apenas números
      const payload = {
        ...form,
        ano: Number(form.ano),
        mes: Number(form.mes),
        valor_esperado: Number(form.valor_esperado || 0),
        tolerancia_percent: Number(form.tolerancia_percent || 0),
        cnpj_cpf: onlyDigits(form.cnpj_cpf) || null, // Remove caracteres especiais
        doc: form.doc || null,
        nome_contains: form.nome_contains || null,
        item_contains: form.item_contains || null,
        cfin_codigo: form.cfin_codigo || null,
        setor: form.setor || null,
        recorrencia: form.recorrencia || "MENSAL",
        recorrencia_obs: form.recorrencia_obs || null,
        obs: form.obs || null,
      };

      await loading.wrap("dre-upsert-custo", () =>
        apiLocal.dreUpsertCusto(payload),
      );

      toast.success(form.id ? "Atualizado!" : "Criado!");
      setForm({ ...emptyCusto, ano: Number(ano), mes: Number(mes) });
      await fetchRows();
    } catch (e) {
      toast.error("Falha ao salvar custo.");
      console.error(e);
    }
  };

  const onEdit = (r) => {
    setForm({
      id: r.id,
      ano: r.ano,
      mes: r.mes,
      doc: r.doc || "",
      cnpj_cpf: r.cnpj_cpf || "", // CPF/CNPJ já vem só números do backend
      nome_contains: r.nome_contains || "",
      item_contains: r.item_contains || "",
      cfin_codigo: r.cfin_codigo || "",
      setor: r.setor || "",
      valor_esperado: r.valor_esperado ?? 0,
      tolerancia_percent: r.tolerancia_percent ?? 0,
      recorrencia: r.recorrencia || "MENSAL",
      recorrencia_obs: r.recorrencia_obs || "",
      ativo: r.ativo ?? true,
      obs: r.obs || "",
    });
  };

  const onDelete = async (r) => {
    if (!window.confirm("Excluir esse custo programado?")) return;
    try {
      await loading.wrap("dre-del-custo", () => apiLocal.dreDeleteCusto(r.id));
      toast.success("Excluído!");
      await fetchRows();
    } catch (e) {
      toast.error("Falha ao excluir.");
      console.error(e);
    }
  };

  const clearFilters = async () => {
    setAno(String(defaultAno));
    setMes(String(defaultMes).padStart(2, "0"));
    setQ("");
    setAtivo("");
    setRecorrencia("");
    await fetchRows();
  };

  return (
    <Page>
      <PageLoader active={loading.any()} text="Carregando custos..." />
      <NavBar />

      <TitleBar>
        <H1>DRE — Custos Fixos e Programados</H1>
        <CountPill>{total} itens</CountPill>
      </TitleBar>

      <Section>
        <FiltersRow>
          <FiltersLeft>
            <FilterGroup>
              <FilterLabel>Ano</FilterLabel>
              <FilterInput 
                value={ano} 
                onChange={(e) => setAno(e.target.value)} 
                placeholder="Ex: 2026"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Mês</FilterLabel>
              <FilterInput 
                value={mes} 
                onChange={(e) => setMes(e.target.value)} 
                placeholder="Ex: 01"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Buscar</FilterLabel>
              <FilterInput 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="Doc, nome ou item..."
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Ativo</FilterLabel>
              <FilterSelect value={ativo} onChange={(e) => setAtivo(e.target.value)}>
                <option value="">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Recorrência</FilterLabel>
              <FilterSelect value={recorrencia} onChange={(e) => setRecorrencia(e.target.value)}>
                <option value="">Todas</option>
                <option value="MENSAL">Mensal</option>
                <option value="UNICO">Único</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersLeft>

          <FiltersRight>
            <FilterButton type="button" disabled={loading.any()} onClick={fetchRows}>
              Buscar
            </FilterButton>
            <ClearButton type="button" disabled={loading.any()} onClick={clearFilters}>
              Limpar
            </ClearButton>
          </FiltersRight>
        </FiltersRow>
      </Section>

      <Section style={{ marginTop: 16 }}>
        <Card>
          <CardTitle>{form.id ? "Editar custo programado" : "Novo custo programado"}</CardTitle>

          <FormGrid>
            <FilterGroup>
              <FilterLabel>Ano</FilterLabel>
              <FilterInput
                value={String(form.ano)}
                onChange={(e) => setForm((p) => ({ ...p, ano: e.target.value }))}
                placeholder="Ex: 2026"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Mês</FilterLabel>
              <FilterInput
                value={String(form.mes)}
                onChange={(e) => setForm((p) => ({ ...p, mes: e.target.value }))}
                placeholder="Ex: 01"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>CPF/CNPJ</FilterLabel>
              <FilterInput
                value={form.cnpj_cpf}
                onChange={(e) => setForm((p) => ({ ...p, cnpj_cpf: onlyDigits(e.target.value) }))}
                placeholder="Apenas números - Ex: 04460527871"
                maxLength={14}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Doc (Nº Nota)</FilterLabel>
              <FilterInput
                value={form.doc}
                onChange={(e) => setForm((p) => ({ ...p, doc: e.target.value }))}
                placeholder="Número da nota (opcional)"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Nome contém</FilterLabel>
              <FilterInput
                value={form.nome_contains}
                onChange={(e) => setForm((p) => ({ ...p, nome_contains: e.target.value }))}
                placeholder="Ex: ERASTO TEOBALDO"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Item contém</FilterLabel>
              <FilterInput
                value={form.item_contains}
                onChange={(e) => setForm((p) => ({ ...p, item_contains: e.target.value }))}
                placeholder="Ex: Adiantamento Salários"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>CFIn código</FilterLabel>
              <FilterInput
                value={form.cfin_codigo}
                onChange={(e) => setForm((p) => ({ ...p, cfin_codigo: e.target.value }))}
                placeholder="Ex: 1.1.03.01.001"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Setor</FilterLabel>
              <FilterInput
                value={form.setor}
                onChange={(e) => setForm((p) => ({ ...p, setor: e.target.value }))}
                placeholder="Ex: FRETE, RH, FISCAL"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Valor esperado (R$)</FilterLabel>
              <FilterInput
                type="number"
                step="0.01"
                value={String(form.valor_esperado)}
                onChange={(e) => setForm((p) => ({ ...p, valor_esperado: e.target.value }))}
                placeholder="0.00"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Tolerância %</FilterLabel>
              <FilterInput
                type="number"
                step="0.01"
                value={String(form.tolerancia_percent)}
                onChange={(e) => setForm((p) => ({ ...p, tolerancia_percent: e.target.value }))}
                placeholder="0.00"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Recorrência</FilterLabel>
              <FilterSelect
                value={form.recorrencia}
                onChange={(e) => setForm((p) => ({ ...p, recorrencia: e.target.value }))}
              >
                <option value="MENSAL">Mensal (todo mês)</option>
                <option value="UNICO">Único (apenas este mês)</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Obs. Recorrência</FilterLabel>
              <FilterInput
                value={form.recorrencia_obs}
                onChange={(e) => setForm((p) => ({ ...p, recorrencia_obs: e.target.value }))}
                placeholder="Ex: Contrato até dez/2026"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Ativo</FilterLabel>
              <FilterSelect
                value={String(!!form.ativo)}
                onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.value === "true" }))}
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup style={{ gridColumn: "1 / -1" }}>
              <FilterLabel>Observações gerais</FilterLabel>
              <FilterInput
                value={form.obs}
                onChange={(e) => setForm((p) => ({ ...p, obs: e.target.value }))}
                placeholder="Observações adicionais..."
              />
            </FilterGroup>
          </FormGrid>

          <Inline>
            <FilterButton type="button" onClick={onSave} disabled={loading.any()}>
              {form.id ? "Atualizar" : "Salvar"}
            </FilterButton>

            <ClearButton
              type="button"
              onClick={() => setForm({ ...emptyCusto, ano: Number(ano), mes: Number(mes) })}
              disabled={loading.any()}
            >
              Limpar
            </ClearButton>
          </Inline>
        </Card>
      </Section>

      <Section style={{ marginTop: 16 }}>
        <TableWrap style={{ maxHeight: "65vh", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th>Ano</Th>
                <Th>Mês</Th>
                <Th>CPF/CNPJ</Th>
                <Th>Doc (Nota)</Th>
                <Th>Nome contém</Th>
                <Th>Item contém</Th>
                <Th>CFIn</Th>
                <Th>Setor</Th>
                <Th>Valor</Th>
                <Th>Tol %</Th>
                <Th>Recorrência</Th>
                <Th>Ativo</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <TdCompact>{r.ano}</TdCompact>
                  <TdCompact>{String(r.mes).padStart(2, "0")}</TdCompact>
                  <TdCompact title={r.cnpj_cpf ? formatDoc(r.cnpj_cpf) : "—"}>
                    {r.cnpj_cpf || "—"}
                  </TdCompact>
                  <TdCompact>{r.doc || "—"}</TdCompact>
                  <TdCompact>{r.nome_contains || "—"}</TdCompact>
                  <TdCompact>{r.item_contains || "—"}</TdCompact>
                  <TdCompact>{r.cfin_codigo || "—"}</TdCompact>
                  <TdCompact>{r.setor || "—"}</TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {(Number(r.valor_esperado || 0)).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {(Number(r.tolerancia_percent || 0)).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}%
                  </TdCompact>
                  <TdCompact>
                    <span title={r.recorrencia_obs || ""}>
                      {r.recorrencia === "MENSAL" ? "📅 Mensal" : "🔹 Único"}
                    </span>
                  </TdCompact>
                  <TdCompact>{r.ativo ? "✅" : "❌"}</TdCompact>
                  <TdCompact>
                    <RowActions>
                      <ActionBtn type="button" onClick={() => onEdit(r)}>
                        Editar
                      </ActionBtn>
                      <ActionBtn type="button" $danger onClick={() => onDelete(r)}>
                        Excluir
                      </ActionBtn>
                    </RowActions>
                  </TdCompact>
                </tr>
              ))}

              {!rows.length && !loading.any() && (
                <tr>
                  <Td colSpan={13} style={{ textAlign: "center", opacity: 0.7 }}>
                    Nenhum custo encontrado.
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