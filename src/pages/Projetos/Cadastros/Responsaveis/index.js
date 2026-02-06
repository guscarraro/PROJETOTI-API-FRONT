import React, { useEffect, useMemo, useState } from "react";
import apiLocal from "../../../../services/apiLocal";
import useLoading from "../../../../hooks/useLoading";
import NavBar from "../../components/NavBar";
import { PageLoader } from "../../components/Loader";

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
  ActionsCell,
  ActionBtn,
  CountPill,
  MutedText,
  ModalOverlay,
  ModalCard,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalClose,
  FormGrid,
} from "./style";

const DEP_OPTIONS = ["SAC", "Operacao"];
const LOC_OPTIONS = ["MTZ"];
const TURNO_OPTIONS = ["MANHA", "TARDE", "NOITE"];

const emptyForm = {
  id: null,
  nome: "",
  departamento: "SAC",
  localizacao: "MTZ",
  turno: "MANHA",
};

function normalizeTurno(v) {
  const s = String(v || "").trim().toUpperCase();
  if (s === "MANHA" || s === "TARDE" || s === "NOITE") return s;
  return "";
}

function turnoLabel(v) {
  const t = normalizeTurno(v);
  if (t === "MANHA") return "Manhã";
  if (t === "TARDE") return "Tarde";
  if (t === "NOITE") return "Noite";
  return "—";
}

export default function ResponsaveisPage() {
  const loading = useLoading();

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [depFilter, setDepFilter] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchAll = async () => {
    try {
      const res = await loading.wrap("resp-list", () => apiLocal.getResponsaveis());
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      console.error("Erro ao buscar responsáveis:", e);
      setRows([]);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const depOptionsFromRows = useMemo(() => {
    const set = new Set(DEP_OPTIONS);
    for (let i = 0; i < rows.length; i++) {
      const d = String(rows[i]?.departamento || "").trim();
      if (d) set.add(d);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    const dep = String(depFilter || "").trim().toLowerCase();

    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};

      if (dep && String(r.departamento || "").toLowerCase() !== dep) continue;

      if (q) {
        const hay = `${r.id ?? ""} ${r.nome ?? ""} ${r.departamento ?? ""} ${r.localizacao ?? ""} ${r.turno ?? ""}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }

      out.push(r);
    }
    return out;
  }, [rows, query, depFilter]);

  const openCreate = () => {
    setForm(emptyForm);
    setOpenModal(true);
  };

  const openEdit = (row) => {
    if (!row?.id) return;

    setForm({
      id: row.id,
      nome: row.nome ?? "",
      departamento: row.departamento ?? "SAC",
      localizacao: row.localizacao ?? "MTZ",
      turno: normalizeTurno(row.turno) || "MANHA",
    });
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const nome = String(form.nome || "").trim();
    if (!nome) return "Informe o nome.";

    const turno = normalizeTurno(form.turno);
    if (!turno) return "Selecione um turno válido (Manhã/Tarde/Noite).";

    return "";
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    const payload = {
      nome: String(form.nome || "").trim(),
      departamento: String(form.departamento || "SAC"),
      localizacao: String(form.localizacao || "MTZ"),
      turno: normalizeTurno(form.turno) || null,
    };

    try {
      if (form.id) {
        await loading.wrap("resp-update", () => apiLocal.updateResponsavel(form.id, payload));
      } else {
        await loading.wrap("resp-create", () => apiLocal.createResponsavel(payload));
      }

      await fetchAll();
      closeModal();
    } catch (e) {
      console.error("Erro ao salvar responsável:", e);
      alert("Falha ao salvar. Veja o console.");
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm(`Excluir responsável "${row.nome}"?`);
    if (!ok) return;

    try {
      await loading.wrap("resp-del", () => apiLocal.deleteResponsavel(row.id));
      await fetchAll();
    } catch (e) {
      console.error("Erro ao excluir responsável:", e);
      alert("Falha ao excluir. Veja o console.");
    }
  };

  const renderMetaPreview = (row) => {
    const parts = [];
    if (row?.departamento) parts.push(`Depto: ${row.departamento}`);
    if (row?.localizacao) parts.push(`Local: ${row.localizacao}`);
    if (row?.turno) parts.push(`Turno: ${turnoLabel(row.turno)}`);
    if (!parts.length) return <MutedText>Sem metadados</MutedText>;
    return <MutedText>{parts.join(" • ")}</MutedText>;
  };

  return (
    <Page>
      <PageLoader active={loading.any()} text="Carregando responsáveis..." />
      <NavBar />

      <TitleBar>
        <H1>Responsáveis</H1>

        <FiltersRight>
          <FilterButton type="button" onClick={openCreate} disabled={loading.any()}>
            + Novo
          </FilterButton>
          <CountPill>{filtered.length} registros</CountPill>
        </FiltersRight>
      </TitleBar>

      <Section>
        <FiltersRow as="form" onSubmit={(e) => e.preventDefault()}>
          <FiltersLeft>
            <FilterGroup style={{ minWidth: 260 }}>
              <FilterLabel>Buscar</FilterLabel>
              <FilterInput
                placeholder="nome, depto, local, turno..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup style={{ minWidth: 200 }}>
              <FilterLabel>Departamento</FilterLabel>
              <FilterSelect value={depFilter} onChange={(e) => setDepFilter(e.target.value)}>
                <option value="">Todos</option>
                {depOptionsFromRows.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup style={{ minWidth: 140 }}>
              <FilterLabel>&nbsp;</FilterLabel>
              <ClearButton
                type="button"
                disabled={loading.any()}
                onClick={() => {
                  setQuery("");
                  setDepFilter("");
                }}
              >
                Limpar
              </ClearButton>
            </FilterGroup>
          </FiltersLeft>
        </FiltersRow>
      </Section>

      <Section style={{ marginTop: 16 }}>
        <TableWrap style={{ maxHeight: "70vh", overflowY: "auto", overflowX: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ minWidth: 90 }}>ID</Th>
                <Th style={{ minWidth: 320 }}>Nome</Th>
                <Th style={{ minWidth: 180 }}>Departamento</Th>
                <Th style={{ minWidth: 180 }}>Localização</Th>
                <Th style={{ minWidth: 140 }}>Turno</Th>
                <Th style={{ minWidth: 170 }}>Ações</Th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <TdCompact>{r.id}</TdCompact>

                  <TdCompact>
                    <div style={{ fontWeight: 900 }}>{r.nome}</div>
                    {renderMetaPreview(r)}
                  </TdCompact>

                  <TdCompact>{r.departamento || "—"}</TdCompact>
                  <TdCompact>{r.localizacao || "—"}</TdCompact>
                  <TdCompact>{turnoLabel(r.turno)}</TdCompact>

                  <ActionsCell>
                    <ActionBtn type="button" onClick={() => openEdit(r)} disabled={loading.any()}>
                      Editar
                    </ActionBtn>
                    <ActionBtn type="button" $danger onClick={() => handleDelete(r)} disabled={loading.any()}>
                      Excluir
                    </ActionBtn>
                  </ActionsCell>
                </tr>
              ))}

              {!filtered.length && !loading.any() && (
                <tr>
                  <Td colSpan={6} style={{ textAlign: "center", opacity: 0.7, padding: 10 }}>
                    Nenhum responsável encontrado.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>
      </Section>

      {openModal && (
        <ModalOverlay
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <ModalCard role="dialog" aria-modal="true">
            <ModalHeader>
              <div>
                <ModalTitle>{form.id ? "Editar responsável" : "Novo responsável"}</ModalTitle>
                <MutedText>Cadastro simples (sem clientes/grupos por enquanto).</MutedText>
              </div>

              <ModalClose type="button" onClick={closeModal} title="Fechar">
                ✕
              </ModalClose>
            </ModalHeader>

            <ModalBody>
              <FormGrid>
                <FilterGroup>
                  <FilterLabel>Nome</FilterLabel>
                  <FilterInput
                    value={form.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    placeholder="Ex: Patrícia"
                  />
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Departamento</FilterLabel>
                  <FilterSelect
                    value={form.departamento}
                    onChange={(e) => handleChange("departamento", e.target.value)}
                  >
                    {DEP_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </FilterSelect>
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Localização</FilterLabel>
                  <FilterSelect
                    value={form.localizacao}
                    onChange={(e) => handleChange("localizacao", e.target.value)}
                  >
                    {LOC_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </FilterSelect>
                </FilterGroup>

                <FilterGroup>
                  <FilterLabel>Turno</FilterLabel>
                  <FilterSelect
                    value={form.turno}
                    onChange={(e) => handleChange("turno", e.target.value)}
                  >
                    {TURNO_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {turnoLabel(t)}
                      </option>
                    ))}
                  </FilterSelect>
                  <MutedText>Manhã / Tarde / Noite</MutedText>
                </FilterGroup>
              </FormGrid>
            </ModalBody>

            <ModalFooter>
              <ClearButton type="button" onClick={closeModal} disabled={loading.any()}>
                Cancelar
              </ClearButton>

              <FilterButton type="button" onClick={handleSave} disabled={loading.any()}>
                Salvar
              </FilterButton>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}
    </Page>
  );
}
