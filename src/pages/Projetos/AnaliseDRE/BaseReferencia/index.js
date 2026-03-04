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
  FormGrid,
  Card,
  CardTitle,
  Inline,
} from "./style";

const emptyPrestador = {
  id: null,
  doc: "",
  nome: "",
  ativo: true,
  setor_padrao: "",
};

const emptyRegra = {
  id: null,
  prestador_id: null,
  cfin_codigo: "",
  cfin_nome: "",
  setor: "",
  ativo: true,
};

export default function BaseReferenciaPage() {
  const loading = useLoading();

  const [q, setQ] = useState("");
  const [ativo, setAtivo] = useState("");
  const [prestadores, setPrestadores] = useState([]);

  const [formPrestador, setFormPrestador] = useState({ ...emptyPrestador });

  const [selectedPrestador, setSelectedPrestador] = useState(null);
  const [regras, setRegras] = useState([]);
  const [regraForm, setRegraForm] = useState({ ...emptyRegra });

  const fetchPrestadores = useCallback(async () => {
    const params = {};
    if (q) params.q = q;
    if (ativo !== "") params.ativo = ativo === "true";

    const res = await loading.wrap("dre-prestadores", () =>
      apiLocal.dreListPrestadores(params),
    );

    setPrestadores(res.data || []);
  }, [q, ativo, loading]);

  const loadPrestadorDetail = useCallback(
    async (prestadorId) => {
      const res = await loading.wrap("dre-prestador-detail", () =>
        apiLocal.dreGetPrestadorDetail(prestadorId),
      );

      const p = res?.data?.prestador || null;
      const rs = Array.isArray(res?.data?.regras) ? res.data.regras : [];

      setSelectedPrestador(p);
      setRegras(rs);

      setRegraForm((prev) => ({
        ...prev,
        id: null,
        prestador_id: p?.id ?? null,
        cfin_codigo: "",
        cfin_nome: "",
        setor: "",
        ativo: true,
      }));
    },
    [loading],
  );

  useEffect(() => {
    (async () => {
      await fetchPrestadores();
    })();
    // eslint-disable-next-line
  }, []);

  const totalPrestadores = useMemo(() => prestadores.length, [prestadores]);

  const onSavePrestador = async () => {
    if (!formPrestador.doc?.trim()) {
      toast.error("CNPJ/CPF é obrigatório.");
      return;
    }

    try {
      await loading.wrap("dre-upsert-prestador", () =>
        apiLocal.dreUpsertPrestador({
          ...formPrestador,
          doc: formPrestador.doc,
        }),
      );

      toast.success(formPrestador.id ? "Atualizado!" : "Criado!");
      setFormPrestador({ ...emptyPrestador });
      await fetchPrestadores();
    } catch (e) {
      toast.error("Falha ao salvar prestador.");
      console.error(e);
    }
  };

  const onEditPrestador = async (p) => {
    setFormPrestador({
      id: p.id,
      doc: p.doc || "",
      nome: p.nome || "",
      ativo: p.ativo ?? true,
      setor_padrao: p.setor_padrao || "",
    });
    await loadPrestadorDetail(p.id);
  };

  const onDeletePrestador = async (p) => {
    if (!window.confirm(`Excluir prestador ${p.nome || p.doc}?`)) return;
    try {
      await loading.wrap("dre-del-prestador", () =>
        apiLocal.dreDeletePrestador(p.id),
      );
      toast.success("Excluído!");
      setSelectedPrestador(null);
      setRegras([]);
      await fetchPrestadores();
    } catch (e) {
      toast.error("Falha ao excluir.");
      console.error(e);
    }
  };

  const onSaveRegra = async () => {
    if (!selectedPrestador?.id) {
      toast.error("Selecione um prestador.");
      return;
    }
    if (!regraForm.cfin_codigo?.trim() || !regraForm.cfin_nome?.trim()) {
      toast.error("CFIn código e nome são obrigatórios.");
      return;
    }

    try {
      await loading.wrap("dre-upsert-regra", () =>
        apiLocal.dreUpsertRegra({
          ...regraForm,
          prestador_id: selectedPrestador.id,
        }),
      );

      toast.success(regraForm.id ? "Regra atualizada!" : "Regra criada!");
      await loadPrestadorDetail(selectedPrestador.id);
      setRegraForm({
        ...emptyRegra,
        prestador_id: selectedPrestador.id,
      });
    } catch (e) {
      toast.error("Falha ao salvar regra.");
      console.error(e);
    }
  };

  const onEditRegra = (r) => {
    setRegraForm({
      id: r.id,
      prestador_id: r.prestador_id,
      cfin_codigo: r.cfin_codigo || "",
      cfin_nome: r.cfin_nome || "",
      setor: r.setor || "",
      ativo: r.ativo ?? true,
    });
  };

  const onDeleteRegra = async (r) => {
    if (!window.confirm("Excluir essa regra?")) return;
    try {
      await loading.wrap("dre-del-regra", () =>
        apiLocal.dreDeleteRegra(r.id),
      );
      toast.success("Regra excluída!");
      await loadPrestadorDetail(selectedPrestador.id);
    } catch (e) {
      toast.error("Falha ao excluir regra.");
      console.error(e);
    }
  };

  const clearFilters = async () => {
    setQ("");
    setAtivo("");
    await fetchPrestadores();
  };

  return (
    <Page>
      <PageLoader active={loading.any()} text="Carregando base de referência..." />
      <NavBar />

      <TitleBar>
        <H1>DRE — Base de Referência (Treinamento)</H1>
        <CountPill>{totalPrestadores} prestadores</CountPill>
      </TitleBar>

      <Section>
        <FiltersRow>
          <FiltersLeft>
            <FilterGroup>
              <FilterLabel>Buscar (doc/nome)</FilterLabel>
              <FilterInput value={q} onChange={(e) => setQ(e.target.value)} />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Ativo</FilterLabel>
              <FilterSelect value={ativo} onChange={(e) => setAtivo(e.target.value)}>
                <option value="">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersLeft>

          <FiltersRight>
            <FilterButton type="button" disabled={loading.any()} onClick={fetchPrestadores}>
              Buscar
            </FilterButton>
            <ClearButton type="button" disabled={loading.any()} onClick={clearFilters}>
              Limpar
            </ClearButton>
          </FiltersRight>
        </FiltersRow>
      </Section>

      <Section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardTitle>Cadastro de Prestador</CardTitle>

          <FormGrid>
            <FilterGroup>
              <FilterLabel>CNPJ/CPF (apenas dígitos)</FilterLabel>
              <FilterInput
                value={formPrestador.doc}
                onChange={(e) => setFormPrestador((p) => ({ ...p, doc: e.target.value }))}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Nome</FilterLabel>
              <FilterInput
                value={formPrestador.nome}
                onChange={(e) => setFormPrestador((p) => ({ ...p, nome: e.target.value }))}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Setor padrão (opcional)</FilterLabel>
              <FilterInput
                value={formPrestador.setor_padrao}
                onChange={(e) => setFormPrestador((p) => ({ ...p, setor_padrao: e.target.value }))}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Ativo</FilterLabel>
              <FilterSelect
                value={String(!!formPrestador.ativo)}
                onChange={(e) => setFormPrestador((p) => ({ ...p, ativo: e.target.value === "true" }))}
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </FilterSelect>
            </FilterGroup>
          </FormGrid>

          <Inline>
            <FilterButton type="button" onClick={onSavePrestador} disabled={loading.any()}>
              {formPrestador.id ? "Atualizar" : "Salvar"}
            </FilterButton>
            <ClearButton
              type="button"
              onClick={() => setFormPrestador({ ...emptyPrestador })}
              disabled={loading.any()}
            >
              Limpar
            </ClearButton>
          </Inline>
        </Card>

        <Card>
          <CardTitle>Regras CFIn do Prestador</CardTitle>

          {!selectedPrestador ? (
            <div style={{ opacity: 0.7, fontSize: 13 }}>
              Selecione um prestador na tabela abaixo para gerenciar regras.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, marginBottom: 10 }}>
                <strong>{selectedPrestador.nome || "Sem nome"}</strong> — {selectedPrestador.doc}
              </div>

              <FormGrid>
                <FilterGroup>
                  <FilterLabel>CFIn código</FilterLabel>
                  <FilterInput
                    value={regraForm.cfin_codigo}
                    onChange={(e) => setRegraForm((p) => ({ ...p, cfin_codigo: e.target.value }))}
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>CFIn nome</FilterLabel>
                  <FilterInput
                    value={regraForm.cfin_nome}
                    onChange={(e) => setRegraForm((p) => ({ ...p, cfin_nome: e.target.value }))}
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Setor (opcional)</FilterLabel>
                  <FilterInput
                    value={regraForm.setor}
                    onChange={(e) => setRegraForm((p) => ({ ...p, setor: e.target.value }))}
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Ativo</FilterLabel>
                  <FilterSelect
                    value={String(!!regraForm.ativo)}
                    onChange={(e) => setRegraForm((p) => ({ ...p, ativo: e.target.value === "true" }))}
                  >
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </FilterSelect>
                </FilterGroup>
              </FormGrid>

              <Inline>
                <FilterButton type="button" onClick={onSaveRegra} disabled={loading.any()}>
                  {regraForm.id ? "Atualizar regra" : "Salvar regra"}
                </FilterButton>

                <ClearButton
                  type="button"
                  onClick={() =>
                    setRegraForm({
                      ...emptyRegra,
                      prestador_id: selectedPrestador.id,
                    })
                  }
                  disabled={loading.any()}
                >
                  Limpar
                </ClearButton>
              </Inline>

              <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
                Regras cadastradas: {regras.length}
              </div>
            </>
          )}
        </Card>
      </Section>

      <Section style={{ marginTop: 16 }}>
        <TableWrap style={{ maxHeight: "55vh", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th>Doc</Th>
                <Th>Nome</Th>
                <Th>Setor padrão</Th>
                <Th>Ativo</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {prestadores.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => loadPrestadorDetail(p.id)}
                  style={{
                    cursor: "pointer",
                    background: selectedPrestador?.id === p.id ? "rgba(37,99,235,0.06)" : "transparent",
                  }}
                >
                  <TdCompact>{p.doc}</TdCompact>
                  <TdCompact>{p.nome || "—"}</TdCompact>
                  <TdCompact>{p.setor_padrao || "—"}</TdCompact>
                  <TdCompact>{p.ativo ? "Sim" : "Não"}</TdCompact>
                  <TdCompact>
                    <RowActions onClick={(e) => e.stopPropagation()}>
                      <ActionBtn type="button" onClick={() => onEditPrestador(p)}>
                        Editar
                      </ActionBtn>
                      <ActionBtn type="button" $danger onClick={() => onDeletePrestador(p)}>
                        Excluir
                      </ActionBtn>
                    </RowActions>
                  </TdCompact>
                </tr>
              ))}

              {!prestadores.length && !loading.any() && (
                <tr>
                  <Td colSpan={5} style={{ textAlign: "center", opacity: 0.7 }}>
                    Nenhum prestador encontrado.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>
      </Section>

      {selectedPrestador && (
        <Section style={{ marginTop: 16 }}>
          <Card>
            <CardTitle>Regras cadastradas — {selectedPrestador.nome || selectedPrestador.doc}</CardTitle>

            <TableWrap style={{ maxHeight: "45vh", overflow: "auto" }}>
              <Table>
                <thead>
                  <tr>
                    <Th>CFIn código</Th>
                    <Th>CFIn nome</Th>
                    <Th>Setor</Th>
                    <Th>Ativo</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {regras.map((r) => (
                    <tr key={r.id}>
                      <TdCompact>{r.cfin_codigo}</TdCompact>
                      <TdCompact>{r.cfin_nome}</TdCompact>
                      <TdCompact>{r.setor || "—"}</TdCompact>
                      <TdCompact>{r.ativo ? "Sim" : "Não"}</TdCompact>
                      <TdCompact>
                        <RowActions>
                          <ActionBtn type="button" onClick={() => onEditRegra(r)}>
                            Editar
                          </ActionBtn>
                          <ActionBtn type="button" $danger onClick={() => onDeleteRegra(r)}>
                            Excluir
                          </ActionBtn>
                        </RowActions>
                      </TdCompact>
                    </tr>
                  ))}

                  {!regras.length && (
                    <tr>
                      <Td colSpan={5} style={{ textAlign: "center", opacity: 0.7 }}>
                        Nenhuma regra cadastrada.
                      </Td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableWrap>
          </Card>
        </Section>
      )}
    </Page>
  );
}