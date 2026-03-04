import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FiX, FiCheck, FiSave } from "react-icons/fi";
import {
  Backdrop,
  Modal,
  ModalHeader,
  ModalTitle,
  CloseBtn,
  Body,
  TopRow,
  Pill,
  TableWrap,
  Table,
  Th,
  Td,
  TdCompact,
  Footer,
  Input,
  Button,
  Row,
} from "./style";

function fmtMoney(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function mapFilterToParam(filterKey) {
  if (filterKey === "cfin") return "cfin";
  if (filterKey === "valor") return "valor";
  if (filterKey === "duplicado") return "duplicado";
  if (filterKey === "sem_setor") return "sem_setor";
  return "";
}

export default function ItemsModal({
  open,
  onClose,
  relatorioId,
  filterKey,
  apiLocal,
  loading,
  onBulkPatch,
  onUpdateOne,
}) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState({}); // id -> true

  const [bulkSetor, setBulkSetor] = useState("");
  const [bulkCfinCodigo, setBulkCfinCodigo] = useState("");
  const [bulkCfinNome, setBulkCfinNome] = useState("");

  const [editId, setEditId] = useState("");
  const [editJust, setEditJust] = useState("");
  const [editObs, setEditObs] = useState("");
  const [editSetor, setEditSetor] = useState("");

  const title = useMemo(() => {
    if (filterKey === "cfin") return "Itens com CFIn divergente";
    if (filterKey === "valor") return "Itens com divergência de valor (justificar)";
    if (filterKey === "duplicado") return "Itens duplicados";
    if (filterKey === "sem_setor") return "Itens sem setor";
    return "Itens";
  }, [filterKey]);

  const fetchRows = async () => {
    if (!relatorioId) return;

    const params = {};
    const only = mapFilterToParam(filterKey);
    if (only) params.only_flags = only;

    const res = await loading.wrap("dre-modal-items", () =>
      apiLocal.dreListItens(relatorioId, params),
    );

    setRows(res.data || []);
    setSelected({});
    setEditId("");
    setEditJust("");
    setEditObs("");
    setEditSetor("");
  };

  useEffect(() => {
    if (!open) return;
    (async () => {
      await fetchRows();
    })();
    // eslint-disable-next-line
  }, [open, filterKey, relatorioId]);

  const selectedIds = useMemo(() => {
    const ids = [];
    for (const key in selected) {
      if (selected[key]) ids.push(key);
    }
    return ids;
  }, [selected]);

  const toggleSelect = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAll = () => {
    const next = {};
    for (let i = 0; i < rows.length; i++) next[rows[i].id] = true;
    setSelected(next);
  };

  const clearSelection = () => setSelected({});

  const applyBulk = async () => {
    if (!selectedIds.length) {
      toast.warn("Selecione itens.");
      return;
    }

    const patch = {};
    if (bulkSetor?.trim()) patch.setor = bulkSetor.trim();
    if (bulkCfinCodigo?.trim()) patch.cfin_codigo = bulkCfinCodigo.trim();
    if (bulkCfinNome?.trim()) patch.cfin_nome = bulkCfinNome.trim();

    if (!Object.keys(patch).length) {
      toast.warn("Preencha algum campo para aplicar.");
      return;
    }

    await onBulkPatch(selectedIds, patch);
    await fetchRows();
  };

  const startEdit = (r) => {
    setEditId(r.id);
    setEditJust(r.justificativa || "");
    setEditObs(r.observacao || "");
    setEditSetor(r.setor || "");
  };

  const saveEdit = async () => {
    if (!editId) return;

    // Se a modal for de valor divergente, justificativa é obrigatória.
    if (filterKey === "valor") {
      if (!editJust?.trim()) {
        toast.error("Justificativa é obrigatória para divergência de valor.");
        return;
      }
    }

    await onUpdateOne({
      id: editId,
      justificativa: editJust || null,
      observacao: editObs || null,
      setor: editSetor || null,
    });

    await fetchRows();
  };

  if (!open) return null;

  return (
    <Backdrop onMouseDown={onClose}>
      <Modal onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div>
            <ModalTitle>{title}</ModalTitle>
            <TopRow>
              <Pill>{rows.length} itens</Pill>
              <Pill>Selecionados: {selectedIds.length}</Pill>
            </TopRow>
          </div>

          <CloseBtn onClick={onClose}>
            <FiX />
          </CloseBtn>
        </ModalHeader>

        <Body>
          <Row style={{ gap: 10, flexWrap: "wrap" }}>
            <Button type="button" onClick={selectAll} disabled={loading.any()}>
              Selecionar tudo
            </Button>
            <Button type="button" onClick={clearSelection} disabled={loading.any()}>
              Limpar seleção
            </Button>

            <div style={{ flex: 1 }} />

            <Button type="button" onClick={fetchRows} disabled={loading.any()}>
              Recarregar
            </Button>
          </Row>

          <Row style={{ marginTop: 10, gap: 10, flexWrap: "wrap" }}>
            <Input
              placeholder="Setor (bulk)"
              value={bulkSetor}
              onChange={(e) => setBulkSetor(e.target.value)}
            />
            <Input
              placeholder="CFIn código (bulk)"
              value={bulkCfinCodigo}
              onChange={(e) => setBulkCfinCodigo(e.target.value)}
            />
            <Input
              placeholder="CFIn nome (bulk)"
              value={bulkCfinNome}
              onChange={(e) => setBulkCfinNome(e.target.value)}
            />

            <Button type="button" onClick={applyBulk} disabled={loading.any()}>
              <FiCheck style={{ marginRight: 6 }} /> Aplicar bulk
            </Button>
          </Row>

          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Sel</Th>
                  <Th>Doc</Th>
                  <Th>Pessoa</Th>
                  <Th>Item</Th>
                  <Th>CFIn</Th>
                  <Th>Nome CFIn</Th>
                  <Th>Empresa</Th>
                  <Th>Valor doc</Th>
                  <Th>Setor</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ background: editId === r.id ? "rgba(37,99,235,0.06)" : "transparent" }}>
                    <TdCompact>
                      <input
                        type="checkbox"
                        checked={!!selected[r.id]}
                        onChange={() => toggleSelect(r.id)}
                      />
                    </TdCompact>

                    <TdCompact>{r.doc || "—"}</TdCompact>
                    <TdCompact>{r.pessoa || "—"}</TdCompact>
                    <TdCompact style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.item || "—"}
                    </TdCompact>
                    <TdCompact>{r.cfin_codigo || "—"}</TdCompact>
                    <TdCompact>{r.cfin_nome || "—"}</TdCompact>
                    <TdCompact>{r.empresa || "—"}</TdCompact>
                    <TdCompact style={{ textAlign: "right" }}>R$ {fmtMoney(r.valor_doc)}</TdCompact>
                    <TdCompact>{r.setor || "—"}</TdCompact>
                    <TdCompact>
                      <Button type="button" onClick={() => startEdit(r)} disabled={loading.any()}>
                        Editar
                      </Button>
                    </TdCompact>
                  </tr>
                ))}

                {!rows.length && (
                  <tr>
                    <Td colSpan={10} style={{ textAlign: "center", opacity: 0.7 }}>
                      Nenhum item neste filtro.
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrap>

          {editId && (
            <>
              <Row style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
                <Input
                  placeholder="Setor (edit)"
                  value={editSetor}
                  onChange={(e) => setEditSetor(e.target.value)}
                />
                <Input
                  placeholder="Justificativa (obrigatória se valor divergente)"
                  value={editJust}
                  onChange={(e) => setEditJust(e.target.value)}
                />
                <Input
                  placeholder="Observação"
                  value={editObs}
                  onChange={(e) => setEditObs(e.target.value)}
                />

                <Button type="button" onClick={saveEdit} disabled={loading.any()}>
                  <FiSave style={{ marginRight: 6 }} /> Salvar
                </Button>
              </Row>
            </>
          )}
        </Body>

        <Footer>
          <Button type="button" onClick={onClose} disabled={loading.any()}>
            Fechar
          </Button>
        </Footer>
      </Modal>
    </Backdrop>
  );
}