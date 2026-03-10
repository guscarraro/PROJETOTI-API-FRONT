import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FiSave,
  FiX,
  FiCheckSquare,
  FiSquare,
  FiAlertTriangle,
} from "react-icons/fi";
import styled from "styled-components";
import {
  ModalCard,
  ModalHeader,
  ModalBody,
  ModalFooter,
  SmallButton,
  Table,
  Th,
  Td,
  TdCompact,
  CountPill,
  FilterInput,
  FilterSelect,
  FilterLabel,
  FilterGroup,
  BatchUpdateContainer,
  BatchUpdateTitle,
  CheckboxButton,
  SuggestionCell,
  JustificativaInput,
  CfinAtualBox,
  CfinSugestaoBox,
  AlertMessage,
  TdEllipsis,
} from "../../style";
import apiLocal from "../../../../../../services/apiLocal";

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid #e0e0e0;

  [data-theme="dark"] & {
    border-color: #334155;
  }
`;

function formatBRL(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function showDate(r) {
  return r.data_doc || r.data_inclusao || "—";
}

// Modal para CFIN divergente
// Modal para CFIN divergente
// Modal para CFIN divergente com aceitação em lote
export function CfinDivergenteModal({ rows, onClose, onUpdate }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchCfinCodigo, setBatchCfinCodigo] = useState("");
  const [batchCfinNome, setBatchCfinNome] = useState("");
  const [batchSetor, setBatchSetor] = useState("");
  const [batchAceitarSugestao, setBatchAceitarSugestao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localRows, setLocalRows] = useState(rows);

  const toggleSelectAll = () => {
    if (selectedIds.size === localRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(localRows.map((r) => r.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Função para aceitar sugestão em lote
  const handleBatchAcceptSuggestions = async () => {
    if (selectedIds.size === 0) {
      toast.warn("Selecione pelo menos um item");
      return;
    }

    // Filtra apenas os itens selecionados que têm sugestão
    const itemsComSugestao = localRows.filter(
      (row) => selectedIds.has(row.id) && row.sugestao_cfin,
    );

    if (itemsComSugestao.length === 0) {
      toast.warn("Nenhum item selecionado possui sugestão");
      return;
    }

    try {
      setLoading(true);

      // Aplica as sugestões uma a uma (ou poderia ser bulk com dados diferentes)
      for (const item of itemsComSugestao) {
        const sugestao = item.sugestao_cfin;
        await apiLocal.dreUpdateItem({
          id: item.id,
          cfin_codigo: sugestao.cfin_codigo,
          cfin_nome: sugestao.cfin_nome,
          setor: sugestao.setor || item.setor,
        });
      }

      // Atualiza localmente
      const updatedRows = localRows.map((row) => {
        if (selectedIds.has(row.id) && row.sugestao_cfin) {
          const sugestao = row.sugestao_cfin;
          return {
            ...row,
            cfin_codigo: sugestao.cfin_codigo,
            cfin_nome: sugestao.cfin_nome,
            setor: sugestao.setor || row.setor,
          };
        }
        return row;
      });

      setLocalRows(updatedRows);
      setSelectedIds(new Set());
      setBatchAceitarSugestao(false);

      toast.success(`${itemsComSugestao.length} sugestões aceitas`);
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao aceitar sugestões em lote");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpdate = async () => {
    if (selectedIds.size === 0) {
      toast.warn("Selecione pelo menos um item");
      return;
    }

    const patch = {};
    if (batchCfinCodigo) patch.cfin_codigo = batchCfinCodigo;
    if (batchCfinNome) patch.cfin_nome = batchCfinNome;
    if (batchSetor) patch.setor = batchSetor;

    if (Object.keys(patch).length === 0 && !batchAceitarSugestao) {
      toast.warn(
        "Preencha pelo menos um campo para atualizar ou ative 'Aceitar sugestão'",
      );
      return;
    }

    // Se marcou para aceitar sugestão, chama a função específica
    if (batchAceitarSugestao) {
      await handleBatchAcceptSuggestions();
      return;
    }

    try {
      setLoading(true);
      await apiLocal.dreBulkUpdateItems({
        ids: Array.from(selectedIds),
        patch,
      });

      const updatedRows = localRows.map((row) =>
        selectedIds.has(row.id) ? { ...row, ...patch } : row,
      );
      setLocalRows(updatedRows);
      setSelectedIds(new Set());
      setBatchCfinCodigo("");
      setBatchCfinNome("");
      setBatchSetor("");

      toast.success(`${selectedIds.size} itens atualizados`);
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao atualizar itens");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = async (row, sugestao) => {
    try {
      setLoading(true);

      await apiLocal.dreUpdateItem({
        id: row.id,
        cfin_codigo: sugestao.cfin_codigo,
        cfin_nome: sugestao.cfin_nome,
        setor: sugestao.setor || row.setor,
      });

      const updatedRows = localRows.map((r) =>
        r.id === row.id
          ? {
            ...r,
            cfin_codigo: sugestao.cfin_codigo,
            cfin_nome: sugestao.cfin_nome,
            setor: sugestao.setor || r.setor,
          }
          : r,
      );
      setLocalRows(updatedRows);

      toast.success("Sugestão aceita");
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao aceitar sugestão");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetor = async (id, setor) => {
    try {
      setLoading(true);
      await apiLocal.dreUpdateItem({
        id,
        setor,
      });

      const updatedRows = localRows.map((row) =>
        row.id === id ? { ...row, setor } : row,
      );
      setLocalRows(updatedRows);

      toast.success("Setor atualizado");
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao atualizar setor");
    } finally {
      setLoading(false);
    }
  };

  // Função para mostrar múltiplas opções de sugestão
  const showSuggestionOptions = (row) => {
    const sugestoes = row.sugestoes || [row.sugestao_cfin].filter(Boolean);

    if (!sugestoes || sugestoes.length === 0) return null;

    if (sugestoes.length === 1) {
      return (
        <SmallButton
          onClick={() => handleAcceptSuggestion(row, sugestoes[0])}
          disabled={loading}
          style={{ padding: "2px 6px", fontSize: 11 }}
        >
          Aceitar
        </SmallButton>
      );
    }

    return (
      <FilterSelect
        value=""
        onChange={(e) => {
          const index = parseInt(e.target.value);
          if (index >= 0) {
            handleAcceptSuggestion(row, sugestoes[index]);
          }
        }}
        style={{ padding: "2px 4px", fontSize: 11, width: 100 }}
        disabled={loading}
      >
        <option value="">Escolher...</option>
        {sugestoes.map((sug, idx) => (
          <option key={idx} value={idx}>
            {sug.cfin_codigo} - {sug.cfin_nome}
          </option>
        ))}
      </FilterSelect>
    );
  };

  return (
    <ModalCard onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1300 }}>
      <ModalHeader>
        <div style={{ fontWeight: 1000 }}>CFIn Divergente</div>
        <CountPill>{localRows.length} itens</CountPill>
      </ModalHeader>

      <ModalBody>
        <BatchUpdateContainer>
          <BatchUpdateTitle>Atualização em lote</BatchUpdateTitle>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <FilterGroup style={{ minWidth: 150 }}>
              <FilterLabel>Código CFIN</FilterLabel>
              <FilterInput
                value={batchCfinCodigo}
                onChange={(e) => setBatchCfinCodigo(e.target.value)}
                placeholder="Ex: 3.1.01.02.002"
              />
            </FilterGroup>
            <FilterGroup style={{ minWidth: 200 }}>
              <FilterLabel>Nome CFIN</FilterLabel>
              <FilterInput
                value={batchCfinNome}
                onChange={(e) => setBatchCfinNome(e.target.value)}
                placeholder="Ex: (-) Icms"
              />
            </FilterGroup>
            <FilterGroup style={{ minWidth: 150 }}>
              <FilterLabel>Setor</FilterLabel>
              <FilterSelect
                value={batchSetor}
                onChange={(e) => setBatchSetor(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Contábil">Contábil</option>
                <option value="Financeiro">Financeiro</option>
                <option value="RH">RH</option>
                <option value="Compras">Compras</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup
              style={{
                minWidth: 200,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                id="batchAceitarSugestao"
                checked={batchAceitarSugestao}
                onChange={(e) => setBatchAceitarSugestao(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              <FilterLabel
                htmlFor="batchAceitarSugestao"
                style={{ marginBottom: 0 }}
              >
                Aceitar sugestão dos selecionados
              </FilterLabel>
            </FilterGroup>

            <SmallButton
              onClick={handleBatchUpdate}
              disabled={loading || selectedIds.size === 0}
              style={{ marginBottom: 4 }}
            >
              <FiSave /> Aplicar em {selectedIds.size} itens
            </SmallButton>
          </div>
        </BatchUpdateContainer>

        <TableWrap style={{ maxHeight: "50vh", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: 30 }}>
                  <CheckboxButton
                    onClick={toggleSelectAll}
                    title="Selecionar todos"
                  >
                    {selectedIds.size === localRows.length ? (
                      <FiCheckSquare />
                    ) : (
                      <FiSquare />
                    )}
                  </CheckboxButton>
                </Th>
                <Th>CPF/CNPJ</Th>
                <Th>Pessoa</Th>
                <Th>Número doc</Th>
                <Th>Data</Th>
                <Th>Item</Th>
                <Th>CFIn Atual</Th>
                <Th>Sugestão</Th>
                <Th>Empresa</Th>
                <Th>Valor</Th>
                <Th>Setor</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {localRows.map((r) => {
                const sugestao = r.sugestao_cfin;
                const temSugestao = !!sugestao;
                return (
                  <tr key={r.id}>
                    <TdCompact>
                      <CheckboxButton
                        onClick={() => toggleSelect(r.id)}
                        title={selectedIds.has(r.id) ? "Desmarcar" : "Marcar"}
                      >
                        {selectedIds.has(r.id) ? (
                          <FiCheckSquare />
                        ) : (
                          <FiSquare />
                        )}
                      </CheckboxButton>
                    </TdCompact>
                    <TdCompact title={r.doc}>{r.doc || "—"}</TdCompact>
                    <TdCompact>{r.pessoa || "—"}</TdCompact>
                    <TdCompact>{r.numero_doc || "—"}</TdCompact>
                    <TdCompact>{showDate(r)}</TdCompact>
                    <TdCompact style={{ maxWidth: 200 }}>
                      {r.item || "—"}
                    </TdCompact>
                    <TdCompact>
                      <CfinAtualBox>
                        <strong>{r.cfin_codigo || "—"}</strong>
                        <br />
                        <small>{r.cfin_nome || "—"}</small>
                      </CfinAtualBox>
                    </TdCompact>
                    <CfinSugestaoBox>
                      {sugestao ? (
                        <>
                          <strong>{sugestao.cfin_codigo}</strong>
                          <br />
                          <small>{sugestao.cfin_nome}</small>
                          {sugestao.setor && (
                            <div>
                              <small>Setor: {sugestao.setor}</small>
                            </div>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </CfinSugestaoBox>
                    <TdCompact>{r.empresa || "—"}</TdCompact>
                    <TdCompact style={{ textAlign: "right" }}>
                      {formatBRL(r.valor_doc)}
                    </TdCompact>
                    <TdCompact>
                      <FilterSelect
                        value={r.setor || ""}
                        onChange={(e) =>
                          handleUpdateSetor(r.id, e.target.value)
                        }
                        style={{ padding: "2px 4px", fontSize: 12 }}
                        disabled={loading}
                      >
                        <option value="">Selecione</option>
                        <option value="Fiscal">Fiscal</option>
                        <option value="Contábil">Contábil</option>
                        <option value="Financeiro">Financeiro</option>
                        <option value="RH">RH</option>
                        <option value="Compras">Compras</option>
                      </FilterSelect>
                    </TdCompact>
                    <TdCompact>
                      {temSugestao && showSuggestionOptions(r)}
                    </TdCompact>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      </ModalBody>

      <ModalFooter>
        <SmallButton type="button" onClick={onClose}>
          <FiX /> Fechar
        </SmallButton>
      </ModalFooter>
    </ModalCard>
  );
}
// Modal para Valores Divergentes - CORRIGIDA E COM ATUALIZAÇÃO EM LOTE
export function ValorDivergenteModal({ rows, onClose, onUpdate }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchCobranca, setBatchCobranca] = useState("");
  const [batchJustificativa, setBatchJustificativa] = useState("");
  const [loading, setLoading] = useState(false);
    const [localRows, setLocalRows] = useState(() => {
    const ordered = [...rows];
      
    ordered.sort((a, b) => {
      const notaA = String(a?.numero_doc || "");
      const notaB = String(b?.numero_doc || "");

      const notaCompare = notaA.localeCompare(notaB, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });

      if (notaCompare !== 0) return notaCompare;
      
      const itemA = String(a?.item || "");
      const itemB = String(b?.item || "");
      
      return itemA.localeCompare(itemB, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });
    });
    
    return ordered;
  });
  
  const toggleSelectAll = () => {
    if (selectedIds.size === localRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(localRows.map((r) => r.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchUpdate = async () => {
    if (selectedIds.size === 0) {
      toast.warn("Selecione pelo menos um item");
      return;
    }

    const patch = {};

    // Só adiciona cobrança se foi selecionada
    if (batchCobranca) {
      patch.cobranca_de_acordo = batchCobranca;
      // Se marcar como "S" (de acordo), limpa a justificativa
      if (batchCobranca === "S") {
        patch.justificativa_divergencia = null;
        patch.justificativa = null;
      }
    }

    // Só adiciona justificativa se foi preenchida e a cobrança é "N"
    if (batchJustificativa && batchCobranca === "N") {
      patch.justificativa_divergencia = batchJustificativa;
      patch.justificativa = batchJustificativa; // Para compatibilidade
    }

    if (Object.keys(patch).length === 0) {
      toast.warn("Preencha pelo menos um campo para atualizar");
      return;
    }

    // Validação: se marcou como "N", precisa de justificativa
    if (batchCobranca === "N" && !batchJustificativa) {
      toast.warn("Para itens não de acordo, a justificativa é obrigatória");
      return;
    }

    try {
      setLoading(true);
      await apiLocal.dreBulkUpdateItems({
        ids: Array.from(selectedIds),
        patch,
      });

      // Atualiza localmente
      const updatedRows = localRows.map((row) =>
        selectedIds.has(row.id) ? { ...row, ...patch } : row,
      );
      setLocalRows(updatedRows);
      setSelectedIds(new Set());
      setBatchCobranca("");
      setBatchJustificativa("");

      toast.success(`${selectedIds.size} itens atualizados`);
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao atualizar itens");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCobranca = async (id, value) => {
    try {
      setLoading(true);

      const patch = {
        cobranca_de_acordo: value,
      };

      // Se marcar como "S", limpa justificativa
      if (value === "S") {
        patch.justificativa_divergencia = null;
        patch.justificativa = null;
      }

      await apiLocal.dreUpdateItem({
        id,
        ...patch,
      });

      setLocalRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

      toast.success("Cobrança atualizada");
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJustificativa = async (id, value) => {
    try {
      setLoading(true);

      // Verifica se o item está marcado como "N"
      const item = localRows.find((r) => r.id === id);
      if (item?.cobranca_de_acordo !== "N") {
        toast.warn("Primeiro marque a cobrança como 'Não'");
        return;
      }

      await apiLocal.dreUpdateItem({
        id,
        justificativa_divergencia: value,
        justificativa: value,
      });

      setLocalRows(
        rows.map((r) =>
          r.id === id
            ? { ...r, justificativa_divergencia: value, justificativa: value }
            : r,
        ),
      );

      toast.success("Justificativa salva");
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalCard onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1300 }}>
      <ModalHeader>
        <div style={{ fontWeight: 1000 }}>Valores Divergentes</div>
        <CountPill>{localRows.length} itens</CountPill>
      </ModalHeader>

      <ModalBody>
        <BatchUpdateContainer>
          <BatchUpdateTitle>Atualização em lote</BatchUpdateTitle>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <FilterGroup style={{ minWidth: 150 }}>
              <FilterLabel>Cobrança</FilterLabel>
              <FilterSelect
                value={batchCobranca}
                onChange={(e) => setBatchCobranca(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="S">Sim, está de acordo</option>
                <option value="N">Não, precisa justificar</option>
              </FilterSelect>
            </FilterGroup>
            <FilterGroup style={{ minWidth: 250 }}>
              <FilterLabel>Justificativa (para "Não")</FilterLabel>
              <FilterInput
                value={batchJustificativa}
                onChange={(e) => setBatchJustificativa(e.target.value)}
                placeholder="Digite a justificativa..."
                disabled={batchCobranca !== "N"}
              />
            </FilterGroup>
            <SmallButton
              onClick={handleBatchUpdate}
              disabled={loading || selectedIds.size === 0}
              style={{ marginBottom: 4 }}
            >
              <FiSave /> Aplicar em {selectedIds.size} itens
            </SmallButton>
          </div>
        </BatchUpdateContainer>

        <TableWrap style={{ maxHeight: "50vh", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: 30 }}>
                  <CheckboxButton
                    onClick={toggleSelectAll}
                    title="Selecionar todos"
                  >
                    {selectedIds.size === localRows.length ? (
                      <FiCheckSquare />
                    ) : (
                      <FiSquare />
                    )}
                  </CheckboxButton>
                </Th>
                <Th>Número doc</Th>
                <Th>Data</Th>
                <Th>Pessoa</Th>
                <Th>Item</Th>
                <Th>Empresa</Th>
                <Th>Valor doc</Th>
                <Th>Valor prog.</Th>
                <Th>Diferença</Th>
                <Th>Cobrança correta?</Th>
                <Th>Justificativa</Th>
              </tr>
            </thead>
            <tbody>
              {localRows.map((r) => {
                const diff = r.divergencia_valor || 0;
                const valorProg = r.valor_programado || r.valor_esperado || 0;
                return (
                  <tr key={r.id}>
                    <TdCompact>
                      <CheckboxButton
                        onClick={() => toggleSelect(r.id)}
                        title={selectedIds.has(r.id) ? "Desmarcar" : "Marcar"}
                      >
                        {selectedIds.has(r.id) ? (
                          <FiCheckSquare />
                        ) : (
                          <FiSquare />
                        )}
                      </CheckboxButton>
                    </TdCompact>
                    <TdCompact>{r.numero_doc || "—"}</TdCompact>
                    <TdCompact>{showDate(r)}</TdCompact>
                    <TdEllipsis title={r.pessoa || "—"} $maxWidth="200px">{r.pessoa || "—"}</TdEllipsis>
                    <TdEllipsis title={r.item || "—"} $maxWidth="200px">
                    {r.item || "—"}
                  </TdEllipsis>
                    <TdCompact>{r.empresa || "—"}</TdCompact>
                    <TdCompact style={{ textAlign: "right" }}>
                      {formatBRL(r.valor_doc)}
                    </TdCompact>
                    <TdCompact style={{ textAlign: "right" }}>
                      {formatBRL(valorProg)}
                    </TdCompact>
                    <TdCompact
                      style={{
                        textAlign: "right",
                        color:
                          diff > 0
                            ? "#388e3c"
                            : diff < 0
                              ? "#d32f2f"
                              : "inherit",
                        fontWeight: diff !== 0 ? "bold" : "normal",
                      }}
                    >
                      {formatBRL(diff)}
                    </TdCompact>
                    <TdCompact>
                      <FilterSelect
                        value={r.cobranca_de_acordo || ""}
                        onChange={(e) =>
                          handleUpdateCobranca(r.id, e.target.value)
                        }
                        style={{ padding: "2px 4px", width: 90 }}
                        disabled={loading}
                      >
                        <option value="">Pendente</option>
                        <option value="S">Sim</option>
                        <option value="N">Não</option>
                      </FilterSelect>
                    </TdCompact>
                    <TdCompact>
                      <JustificativaInput
                        value={
                          r.justificativa_divergencia || r.justificativa || ""
                        }
                        onChange={(e) =>
                          handleUpdateJustificativa(r.id, e.target.value)
                        }
                        placeholder={
                          r.cobranca_de_acordo === "N"
                            ? "Justificativa obrigatória..."
                            : "Marque como 'Não' primeiro"
                        }
                        disabled={loading || r.cobranca_de_acordo !== "N"}
                        style={{
                          width: 200,
                          backgroundColor:
                            r.cobranca_de_acordo === "N" ? "#fff" : "#f5f5f5",
                        }}
                      />
                    </TdCompact>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      </ModalBody>

      <ModalFooter>
        <SmallButton type="button" onClick={onClose}>
          <FiX /> Fechar
        </SmallButton>
      </ModalFooter>
    </ModalCard>
  );
}

// Modal para Itens sem Setor
export function SemSetorModal({ rows, onClose, onUpdate }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchSetor, setBatchSetor] = useState("");
  const [loading, setLoading] = useState(false);
  const [localRows, setLocalRows] = useState(() => {
    const ordered = [...rows];

    ordered.sort((a, b) => {
      const notaA = String(a?.numero_doc || "");
      const notaB = String(b?.numero_doc || "");

      const notaCompare = notaA.localeCompare(notaB, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });

      if (notaCompare !== 0) return notaCompare;

      const itemA = String(a?.item || "");
      const itemB = String(b?.item || "");

      return itemA.localeCompare(itemB, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });
    });

    return ordered;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === localRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(localRows.map((r) => r.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchUpdate = async () => {
    if (selectedIds.size === 0) {
      toast.warn("Selecione pelo menos um item");
      return;
    }

    if (!batchSetor) {
      toast.warn("Selecione um setor");
      return;
    }

    try {
      setLoading(true);
      await apiLocal.dreBulkUpdateItems({
        ids: Array.from(selectedIds),
        patch: { setor: batchSetor },
      });

      const updatedRows = localRows.map((row) =>
        selectedIds.has(row.id) ? { ...row, setor: batchSetor } : row,
      );
      setLocalRows(updatedRows);
      setSelectedIds(new Set());
      setBatchSetor("");

      toast.success(`${selectedIds.size} itens atualizados`);
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao atualizar itens");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetor = async (id, setor) => {
    try {
      setLoading(true);
      await apiLocal.dreUpdateItem({
        id,
        setor,
      });

      const updatedRows = localRows.map((row) =>
        row.id === id ? { ...row, setor } : row,
      );
      setLocalRows(updatedRows);

      toast.success("Setor atualizado");
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao atualizar setor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalCard onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1000 }}>
      <ModalHeader>
        <div style={{ fontWeight: 1000 }}>Itens sem Setor</div>
        <CountPill>{localRows.length} itens</CountPill>
      </ModalHeader>

      <ModalBody>
        <BatchUpdateContainer>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <FilterGroup style={{ minWidth: 200 }}>
              <FilterLabel>Atribuir setor em lote</FilterLabel>
              <FilterSelect
                value={batchSetor}
                onChange={(e) => setBatchSetor(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Contábil">Contábil</option>
                <option value="Financeiro">Financeiro</option>
                <option value="RH">RH</option>
                <option value="Compras">Compras</option>
              </FilterSelect>
            </FilterGroup>
            <SmallButton
              onClick={handleBatchUpdate}
              disabled={loading || selectedIds.size === 0 || !batchSetor}
            >
              <FiSave /> Aplicar em {selectedIds.size} itens
            </SmallButton>
          </div>
        </BatchUpdateContainer>

        <TableWrap style={{ maxHeight: "50vh", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: 30 }}>
                  <CheckboxButton
                    onClick={toggleSelectAll}
                    title="Selecionar todos"
                  >
                    {selectedIds.size === localRows.length ? (
                      <FiCheckSquare />
                    ) : (
                      <FiSquare />
                    )}
                  </CheckboxButton>
                </Th>
                <Th>Número doc</Th>
                <Th>Data</Th>
                <Th>Item</Th>
                <Th>Empresa</Th>
                <Th>Valor</Th>
                <Th>Setor</Th>
              </tr>
            </thead>
            <tbody>
              {localRows.map((r) => (
                <tr key={r.id}>
                  <TdCompact>
                    <CheckboxButton
                      onClick={() => toggleSelect(r.id)}
                      title={selectedIds.has(r.id) ? "Desmarcar" : "Marcar"}
                    >
                      {selectedIds.has(r.id) ? <FiCheckSquare /> : <FiSquare />}
                    </CheckboxButton>
                  </TdCompact>
                  <TdCompact>{r.numero_doc || "—"}</TdCompact>
                  <TdCompact>{showDate(r)}</TdCompact>
                  <TdEllipsis title={r.item || "—"} $maxWidth="200px">
                    {r.item || "—"}
                  </TdEllipsis>
                  <TdCompact>{r.empresa || "—"}</TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {formatBRL(r.valor_doc)}
                  </TdCompact>
                  <TdCompact>
                    <FilterSelect
                      value={r.setor || ""}
                      onChange={(e) => handleUpdateSetor(r.id, e.target.value)}
                      style={{ padding: "2px 4px", fontSize: 12 }}
                      disabled={loading}
                    >
                      <option value="">Selecione</option>
                      <option value="Fiscal">Fiscal</option>
                      <option value="Contábil">Contábil</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="RH">RH</option>
                      <option value="Compras">Compras</option>
                    </FilterSelect>
                  </TdCompact>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </ModalBody>

      <ModalFooter>
        <SmallButton type="button" onClick={onClose}>
          <FiX /> Fechar
        </SmallButton>
      </ModalFooter>
    </ModalCard>
  );
}

// Modal para Duplicados
export function DuplicadosModal({ rows, onClose, onUpdate }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchSetor, setBatchSetor] = useState("");
  const [loading, setLoading] = useState(false);
    const [localRows, setLocalRows] = useState(() => {
    const ordered = [...rows];

    ordered.sort((a, b) => {
      const notaA = String(a?.numero_doc || "");
      const notaB = String(b?.numero_doc || "");

      const notaCompare = notaA.localeCompare(notaB, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });

      if (notaCompare !== 0) return notaCompare;

      const itemA = String(a?.item || "");
      const itemB = String(b?.item || "");

      return itemA.localeCompare(itemB, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });
    });

    return ordered;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === localRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(localRows.map((r) => r.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchUpdate = async () => {
    if (selectedIds.size === 0) {
      toast.warn("Selecione pelo menos um item");
      return;
    }

    if (!batchSetor) {
      toast.warn("Selecione um setor");
      return;
    }

    try {
      setLoading(true);
      await apiLocal.dreBulkUpdateItems({
        ids: Array.from(selectedIds),
        patch: { setor: batchSetor },
      });

      const updatedRows = localRows.map((row) =>
        selectedIds.has(row.id) ? { ...row, setor: batchSetor } : row,
      );
      setLocalRows(updatedRows);
      setSelectedIds(new Set());
      setBatchSetor("");

      toast.success(`${selectedIds.size} itens atualizados`);
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao atualizar itens");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetor = async (id, setor) => {
    try {
      setLoading(true);
      await apiLocal.dreUpdateItem({
        id,
        setor,
      });

      const updatedRows = localRows.map((row) =>
        row.id === id ? { ...row, setor } : row,
      );
      setLocalRows(updatedRows);

      toast.success("Setor atualizado");
      if (onUpdate) await onUpdate();
    } catch (error) {
      toast.error("Erro ao atualizar setor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalCard onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1100 }}>
      <ModalHeader>
        <div style={{ fontWeight: 1000 }}>Itens Duplicados</div>
        <CountPill>{localRows.length} itens</CountPill>
      </ModalHeader>

      <ModalBody>
        <BatchUpdateContainer>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <FilterGroup style={{ minWidth: 200 }}>
              <FilterLabel>Atribuir setor em lote</FilterLabel>
              <FilterSelect
                value={batchSetor}
                onChange={(e) => setBatchSetor(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Contábil">Contábil</option>
                <option value="Financeiro">Financeiro</option>
                <option value="RH">RH</option>
                <option value="Compras">Compras</option>
              </FilterSelect>
            </FilterGroup>
            <SmallButton
              onClick={handleBatchUpdate}
              disabled={loading || selectedIds.size === 0 || !batchSetor}
            >
              <FiSave /> Aplicar em {selectedIds.size} itens
            </SmallButton>
          </div>
        </BatchUpdateContainer>

        <TableWrap style={{ maxHeight: "50vh", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: 30 }}>
                  <CheckboxButton
                    onClick={toggleSelectAll}
                    title="Selecionar todos"
                  >
                    {selectedIds.size === localRows.length ? (
                      <FiCheckSquare />
                    ) : (
                      <FiSquare />
                    )}
                  </CheckboxButton>
                </Th>
                <Th>Número doc</Th>
                <Th>Data</Th>
                <Th>Item</Th>
                <Th>Doc</Th>
                <Th>Pessoa</Th>
                <Th>Valor Item</Th>
                <Th>Valor Total</Th>
                <Th>Setor</Th>
              </tr>
            </thead>
            <tbody>
              {localRows.map((r) => (
                <tr key={r.id}>
                  <TdCompact>
                    <CheckboxButton
                      onClick={() => toggleSelect(r.id)}
                      title={selectedIds.has(r.id) ? "Desmarcar" : "Marcar"}
                    >
                      {selectedIds.has(r.id) ? <FiCheckSquare /> : <FiSquare />}
                    </CheckboxButton>
                  </TdCompact>
                  <TdCompact>{r.numero_doc || "—"}</TdCompact>
                  <TdCompact>{showDate(r)}</TdCompact>
                  <TdEllipsis title={r.item || "—"} $maxWidth="200px">
                    {r.item || "—"}
                  </TdEllipsis>
                  <TdCompact>{r.doc || "—"}</TdCompact>
                  <TdEllipsis title={r.pessoa || "—"}  $maxWidth="250px">{r.pessoa || "—"}</TdEllipsis>
                  <TdCompact style={{ textAlign: "right" }}>
                    {formatBRL(r.valor_item)}
                  </TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {formatBRL(r.valor_doc)}
                  </TdCompact>
                  <TdCompact>
                    <FilterSelect
                      value={r.setor || ""}
                      onChange={(e) => handleUpdateSetor(r.id, e.target.value)}
                      style={{ padding: "2px 4px", fontSize: 12 }}
                      disabled={loading}
                    >
                      <option value="">Selecione</option>
                      <option value="Fiscal">Fiscal</option>
                      <option value="Contábil">Contábil</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="RH">RH</option>
                      <option value="Compras">Compras</option>
                    </FilterSelect>
                  </TdCompact>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </ModalBody>

      <ModalFooter>
        <SmallButton type="button" onClick={onClose}>
          <FiX /> Fechar
        </SmallButton>
      </ModalFooter>
    </ModalCard>
  );
}
// Modal para CPF/CNPJ sem Referência
// Modal para CPF/CNPJ sem Referência
export function SemReferenciaModal({ rows, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [localRows, setLocalRows] = useState(rows);

  // Agrupa os itens por CPF/CNPJ
  const groupedRows = useMemo(() => {
    const groups = {};
    localRows.forEach((item) => {
      const cpf = item.doc || "SEM_CPF";
      if (!groups[cpf]) {
        groups[cpf] = {
          cpf,
          pessoa: item.pessoa,
          itens: [],
          total: 0,
        };
      }
      groups[cpf].itens.push(item);
      groups[cpf].total += item.valor_doc || 0;
    });
    return Object.values(groups);
  }, [localRows]);

  return (
    <ModalCard onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1200 }}>
      <ModalHeader>
        <div style={{ fontWeight: 1000 }}>
          CPF/CNPJ sem Cadastro na Referência
        </div>
        <CountPill>{localRows.length} itens</CountPill>{" "}
        {/* Mostra total de itens */}
      </ModalHeader>

      <ModalBody>
        <AlertMessage>
          <p>
            <FiAlertTriangle color="#f59e0b" />
            Estes CPF/CNPJ não possuem cadastro de prestador. Cadastre-os na aba
            "Referência" para melhorar a análise nas próximas importações.
          </p>
        </AlertMessage>

        <TableWrap style={{ maxHeight: "60vh", overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th>CPF/CNPJ</Th>
                <Th>Pessoa</Th>
                <Th>Quantidade de Itens</Th>
                <Th>Valor Total</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {groupedRows.map((group) => (
                <tr key={group.cpf}>
                  <TdCompact>
                    <strong>{group.cpf}</strong>
                  </TdCompact>
                  <TdCompact>{group.pessoa || "—"}</TdCompact>
                  <TdCompact style={{ textAlign: "center" }}>
                    {group.itens.length}
                  </TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {formatBRL(group.total)}
                  </TdCompact>
                  <TdCompact>
                    <SmallButton
                      onClick={() => {
                        window.open(
                          `/dre/referencia?doc=${group.cpf}`,
                          "_blank",
                        );
                      }}
                      style={{ padding: "2px 8px", fontSize: 11 }}
                    >
                      Cadastrar
                    </SmallButton>
                  </TdCompact>
                </tr>
              ))}

              {groupedRows.length === 0 && (
                <tr>
                  <Td
                    colSpan={5}
                    style={{ textAlign: "center", opacity: 0.7, padding: 20 }}
                  >
                    Nenhum CPF/CNPJ sem referência encontrado.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>
      </ModalBody>

      <ModalFooter>
        <SmallButton type="button" onClick={onClose}>
          <FiX /> Fechar
        </SmallButton>
      </ModalFooter>
    </ModalCard>
  );
}
