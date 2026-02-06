import React, { useEffect, useMemo, useState } from "react";
import apiLocal from "../../../../services/apiLocal";
import useLoading from "../../../../hooks/useLoading";
import { PageLoader } from "../../components/Loader";
import {
  Section,
  FiltersRow,
  FiltersLeft,
  FiltersRight,
  FilterGroup,
  FilterLabel,
  FilterInput,
  FilterButton,
  ClearButton,
  TableWrap,
  Table,
  Th,
  Td,
  TdCompact,
  CountPill,
  ModalOverlay,
  ModalCard,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalGrid,
  DangerButton,
  GhostButton,
} from "./style";

const emptyForm = { id: null, nome: "", antt: "" };

function normalize(v) {
  return String(v || "").trim();
}

export default function MotoristasPage() {
  const loading = useLoading();

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const term = normalize(q).toLowerCase();
    if (!term) return rows;

    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const hay = `${r.nome || ""} ${r.antt || ""}`.toLowerCase();
      if (hay.includes(term)) out.push(r);
    }
    return out;
  }, [rows, q]);

  const fetchAll = async () => {
    const res = await loading.wrap("motoristas", () => apiLocal.getMotoristas());
    setRows(Array.isArray(res?.data) ? res.data : []);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (row) => {
    setForm({
      id: row?.id ?? null,
      nome: row?.nome || "",
      antt: row?.antt || "",
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setForm(emptyForm);
  };

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const payload = {
      id: form.id ?? undefined,
      nome: normalize(form.nome),
      antt: normalize(form.antt) || null,
    };

    if (!payload.nome) return alert("Informe o nome do motorista.");

    await loading.wrap("motorista-save", () =>
      apiLocal.createOrUpdateMotorista(payload)
    );

    await fetchAll();
    closeModal();
  };

  const handleDelete = async (row) => {
    const id = row?.id;
    if (!id) return;

    const ok = window.confirm(
      `Excluir o motorista "${row?.nome || ""}"? Essa ação não volta.`
    );
    if (!ok) return;

    await loading.wrap("motorista-del", () => apiLocal.deleteMotorista(id));
    await fetchAll();
  };

  return (
    <>
      <PageLoader active={loading.any()} text="Carregando motoristas..." />

      <Section>
        <FiltersRow>
          <FiltersLeft>
            <FilterGroup style={{ minWidth: 260 }}>
              <FilterLabel>Buscar</FilterLabel>
              <FilterInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nome ou ANTT..."
              />
            </FilterGroup>
          </FiltersLeft>

          <FiltersRight>
            <FilterButton type="button" onClick={openCreate} disabled={loading.any()}>
              + Novo motorista
            </FilterButton>

            <ClearButton type="button" onClick={() => setQ("")} disabled={loading.any()}>
              Limpar
            </ClearButton>

            <CountPill>{filtered.length} motoristas</CountPill>
          </FiltersRight>
        </FiltersRow>
      </Section>

      <Section style={{ marginTop: 16 }}>
        <TableWrap style={{ maxHeight: "70vh", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ minWidth: 80 }}>ID</Th>
                <Th style={{ minWidth: 320 }}>Nome</Th>
                <Th style={{ minWidth: 200 }}>ANTT</Th>
                <Th style={{ minWidth: 170 }}>Ações</Th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <TdCompact>{r.id}</TdCompact>
                  <TdCompact style={{ fontWeight: 800 }}>{r.nome}</TdCompact>
                  <TdCompact>{r.antt || "—"}</TdCompact>

                  <TdCompact>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <GhostButton type="button" onClick={() => openEdit(r)}>
                        Editar
                      </GhostButton>
                      <DangerButton type="button" onClick={() => handleDelete(r)}>
                        Excluir
                      </DangerButton>
                    </div>
                  </TdCompact>
                </tr>
              ))}

              {!filtered.length && !loading.any() && (
                <tr>
                  <Td colSpan={4} style={{ textAlign: "center", opacity: 0.7 }}>
                    Nenhum motorista encontrado.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>
      </Section>

      {open && (
        <ModalOverlay onMouseDown={closeModal}>
          <ModalCard onMouseDown={(e) => e.stopPropagation()}>
            <ModalTitle>{form.id ? "Editar motorista" : "Novo motorista"}</ModalTitle>

            <ModalBody>
              <ModalGrid>
                <div>
                  <FilterLabel>Nome</FilterLabel>
                  <FilterInput
                    value={form.nome}
                    onChange={(e) => onChange("nome", e.target.value)}
                    placeholder="Ex: João da Silva"
                  />
                </div>

                <div>
                  <FilterLabel>ANTT</FilterLabel>
                  <FilterInput
                    value={form.antt}
                    onChange={(e) => onChange("antt", e.target.value)}
                    placeholder="Registro ANTT"
                  />
                </div>
              </ModalGrid>
            </ModalBody>

            <ModalFooter>
              <GhostButton type="button" onClick={closeModal} disabled={loading.any()}>
                Cancelar
              </GhostButton>
              <FilterButton type="button" onClick={handleSave} disabled={loading.any()}>
                Salvar
              </FilterButton>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}
    </>
  );
}
