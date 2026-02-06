import React, { useEffect, useMemo, useState } from "react";
import apiLocal from "../../../../services/apiLocal";
import useLoading from "../../../../hooks/useLoading";
import { PageLoader } from "../../components/Loader";
import { toast } from "react-toastify";

import {
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
  ModalOverlay,
  ModalCard,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalGrid,
  DangerButton,
  GhostButton,
} from "./style";

const TIPOS = ["Cavalo", "Carreta", "Truck", "Utilitario", "VAN", "Toco"];

const emptyForm = { id: null, placa: "", tipo: "" };

function normalize(v) {
  return String(v || "").trim();
}

function normalizePlaca(v) {
  return normalize(v).toUpperCase().replace(/-/g, "");
}

export default function VeiculosPage() {
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
      const hay = `${r.placa || ""} ${r.tipo || ""}`.toLowerCase();
      if (hay.includes(term)) out.push(r);
    }
    return out;
  }, [rows, q]);

  const fetchAll = async () => {
    try {
      const res = await loading.wrap("placas", () => apiLocal.getPlacas());
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setRows([]);
      toast.error("Falha ao carregar veículos/placas.");
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, tipo: TIPOS[0] }); // default
    setOpen(true);
  };

  const openEdit = (row) => {
    setForm({
      id: row?.id ?? null,
      placa: row?.placa || "",
      tipo: row?.tipo || TIPOS[0],
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
    const placa = normalizePlaca(form.placa);
    const tipo = normalize(form.tipo);

    if (!placa) return toast.error("Informe a placa.");
    if (!tipo) return toast.error("Selecione o tipo.");

    // validação simples: placa 6-8 chars (não engessa demais)
    if (placa.length < 6 || placa.length > 8) {
      return toast.error("Placa inválida. Verifique o formato.");
    }

    const payload = {
      id: form.id ?? undefined,
      placa,
      tipo,
    };

    try {
      await loading.wrap("placa-save", () => apiLocal.createOrUpdatePlaca(payload));
      toast.success(form.id ? "Veículo atualizado!" : "Veículo criado!");
      await fetchAll();
      closeModal();
    } catch (e) {
      toast.error("Não foi possível salvar o veículo.");
    }
  };

  const handleDelete = async (row) => {
    const id = row?.id;
    if (!id) return;

    const ok = window.confirm(`Excluir a placa "${row?.placa || ""}"?`);
    if (!ok) return;

    try {
      await loading.wrap("placa-del", () => apiLocal.deletePlaca(id));
      toast.success("Veículo excluído!");
      await fetchAll();
    } catch (e) {
      toast.error("Não foi possível excluir o veículo.");
    }
  };

  return (
    <>
      <PageLoader active={loading.any()} text="Carregando veículos..." />

      <Section>
        <FiltersRow>
          <FiltersLeft>
            <FilterGroup style={{ minWidth: 260 }}>
              <FilterLabel>Buscar</FilterLabel>
              <FilterInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Placa ou tipo..."
              />
            </FilterGroup>
          </FiltersLeft>

          <FiltersRight>
            <FilterButton type="button" onClick={openCreate} disabled={loading.any()}>
              + Novo veículo
            </FilterButton>

            <ClearButton type="button" onClick={() => setQ("")} disabled={loading.any()}>
              Limpar
            </ClearButton>

            <CountPill>{filtered.length} veículos</CountPill>
          </FiltersRight>
        </FiltersRow>
      </Section>

      <Section style={{ marginTop: 16 }}>
        <TableWrap style={{ maxHeight: "70vh", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ minWidth: 120 }}>Placa</Th>
                <Th style={{ minWidth: 220 }}>Tipo</Th>
                <Th style={{ minWidth: 170 }}>Ações</Th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <TdCompact style={{ fontWeight: 900 }}>{r.placa}</TdCompact>
                  <TdCompact>{r.tipo || "—"}</TdCompact>

                  <TdCompact>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <GhostButton type="button" onClick={() => openEdit(r)} disabled={loading.any()}>
                        Editar
                      </GhostButton>
                      <DangerButton type="button" onClick={() => handleDelete(r)} disabled={loading.any()}>
                        Excluir
                      </DangerButton>
                    </div>
                  </TdCompact>
                </tr>
              ))}

              {!filtered.length && !loading.any() && (
                <tr>
                  <Td colSpan={3} style={{ textAlign: "center", opacity: 0.7 }}>
                    Nenhum veículo encontrado.
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
            <ModalTitle>{form.id ? "Editar veículo" : "Novo veículo"}</ModalTitle>

            <ModalBody>
              <ModalGrid>
                <div>
                  <FilterLabel>Placa</FilterLabel>
                  <FilterInput
                    value={form.placa}
                    onChange={(e) => onChange("placa", e.target.value)}
                    placeholder="ABC1D23"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <FilterLabel>Tipo</FilterLabel>
                  <FilterSelect
                    value={form.tipo || TIPOS[0]}
                    onChange={(e) => onChange("tipo", e.target.value)}
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </FilterSelect>
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
