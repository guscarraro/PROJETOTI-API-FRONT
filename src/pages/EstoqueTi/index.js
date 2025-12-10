import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { FaLaptop, FaCloud, FaEnvelope, FaTrash, FaEdit } from "react-icons/fa";

import * as XLSX from "xlsx";

import ModalAdd from "./ModalAdd";
import ModalEdit from "./ModalEdit";
import ModalCloud from "./ModalCloud";
import ModalLicenca from "./ModalLicenca";
import ModalAparelho from "./ModalAparelho";
import ModalDel from "./ModalDel";

import apiLocal from "../../services/apiLocal";

import {
  Page,
  TitleBar,
  H1,
  Section,
  SectorFilterBar,
  FilterLabel,
  SectorSelect,
  InfoGrid,
  InfoItem,
  SetorSection,
  TableWrap,
  Table,
  Th,
  Td,
  TdCompact,
  StatusBadge,
  GlobalModalStyles,
  MODAL_CLASS,
} from "./style";
import NavBar from "../Projetos/components/NavBar";
import { ThemeScope } from "../Projetos/style";

function EstoqueTi() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipamentos, setEquipamentos] = useState([]);
  const [selectedEquipamento, setSelectedEquipamento] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [equipamentoToEdit, setEquipamentoToEdit] = useState(null);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [microsoftModalOpen, setMicrosoftModalOpen] = useState(false);
  const [aparelhoModalOpen, setAparelhoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipamentoToDelete, setEquipamentoToDelete] = useState(null);
  const [tipoSelecionado, setTipoSelecionado] = useState("todos");

  // estado da ordenação
  const [sortConfig, setSortConfig] = useState({
    key: "tipo_aparelho",
    direction: "asc",
  });

  const toggleAparelhoModal = () => setAparelhoModalOpen((v) => !v);
  const toggleCloudModal = () => setCloudModalOpen((v) => !v);
  const toggleMicrosoftModal = () => setMicrosoftModalOpen((v) => !v);

  const toggleModal = () => setIsModalOpen((v) => !v);
  const toggleEditModal = () => setIsEditModalOpen((v) => !v);
  const toggleDetailsModal = () => setSelectedEquipamento(null);

  const fetchEquipamentos = async () => {
    try {
      const response = await apiLocal.getControleEstoque();
      setEquipamentos(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar equipamentos:", error);
    }
  };

  useEffect(() => {
    fetchEquipamentos();
  }, []);

  const formatarData = (dataStr) => {
    if (!dataStr) return "Não informado";
    const date = new Date(dataStr);
    date.setHours(date.getHours() - 3);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const HH = String(date.getHours()).padStart(2, "0");
    const MM = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
  };

  const setores = [...new Set(equipamentos.map((eq) => eq.setor))].filter(
    (s) => s
  );
  const tiposAparelhos = [
    ...new Set(equipamentos.map((eq) => eq.tipo_aparelho)),
  ].filter((t) => t);

  const handleEditClick = (equipamento) => {
    setEquipamentoToEdit(equipamento);
    setIsEditModalOpen(true);
  };

  const confirmDeleteEquipamento = async () => {
    if (!equipamentoToDelete) return;
    try {
      await apiLocal.deleteControleEstoque(equipamentoToDelete.id);
      toast.success("Equipamento excluído com sucesso!");
      fetchEquipamentos();
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error);
      toast.error("Erro ao excluir equipamento.");
    } finally {
      setIsDeleteModalOpen(false);
      setEquipamentoToDelete(null);
    }
  };

  const handleExportExcel = () => {
    const equipamentosFiltrados = equipamentos.filter(
      (eq) =>
        tipoSelecionado === "todos" || eq.tipo_aparelho === tipoSelecionado
    );

    if (!equipamentosFiltrados.length) {
      toast.info("Não há dados para exportar com o filtro atual.");
      return;
    }

    const wb = XLSX.utils.book_new();

    const linhas = equipamentosFiltrados.map((eq) => ({
      Setor: eq.setor || "Não informado",
      Tipo: eq.tipo_aparelho || "Não informado",
      "Data Alteração": formatarData(eq.data_atualizacao),
      Responsável: eq.pessoa_responsavel || "Não informado",
      Email: eq.email_utilizado || "Não informado",
      Cloud: eq.cloud_utilizado || "Não informado",
      Descrição: eq.descricao || "Não informado",
      Status: eq.status || "Não informado",
      Obs: eq.observacoes || "",
    }));

    const ws = XLSX.utils.json_to_sheet(linhas, { skipHeader: false });
    XLSX.utils.book_append_sheet(wb, ws, "Estoque TI");

    XLSX.writeFile(wb, "estoque_filtrado.xlsx");
    toast.success("Excel gerado com sucesso!");
  };

  const handleSaveEdit = async (updatedEquipamento) => {
    try {
      await apiLocal.createOrUpdateControleEstoque(updatedEquipamento);
      fetchEquipamentos();
      setIsEditModalOpen(false);
      toast.success("Equipamento editado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar as alterações:", error);
    }
  };

  // clouds ativos únicos
  const cloudsFiltrados = equipamentos
    .filter(
      (eq) => eq.cloud_utilizado?.trim() && eq.cloud_utilizado.trim() !== "NA"
    )
    .map((eq) => eq.cloud_utilizado.trim());
  const totalCloudsAtivos = [...new Set(cloudsFiltrados)].length;

  // colunas da tabela
  const columns = [
    { label: "Tipo", key: "tipo_aparelho" },
    { label: "Responsável", key: "pessoa_responsavel" },
    { label: "Email", key: "email_utilizado" },
    { label: "Cloud", key: "cloud_utilizado" },
    { label: "Descrição", key: "descricao" },
    { label: "Status", key: "status" },
    { label: "Localização", key: "localizacao_fisica" },
    { label: "Última alteração", key: "data_atualizacao" },
    { label: "Ações", key: "acoes", sortable: false },
  ];

  const handleSort = (key) => {
    const col = columns.find((c) => c.key === key);
    if (col && col.sortable === false) return;

    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortableValue = (eq, key) => {
    if (key === "tipo_aparelho") return eq.tipo_aparelho || "";
    if (key === "pessoa_responsavel") return eq.pessoa_responsavel || "";
    if (key === "email_utilizado") return eq.email_utilizado || "";
    if (key === "cloud_utilizado") return eq.cloud_utilizado || "";
    if (key === "descricao") return eq.descricao || "";
    if (key === "status") return eq.status || "";
    if (key === "localizacao_fisica") return eq.localizacao_fisica || "";
    if (key === "data_atualizacao") return eq.data_atualizacao || "";
    return "";
  };

  const getSortedEquipamentos = (lista) => {
    if (!sortConfig.key || sortConfig.key === "acoes") return lista;

    const data = [...lista];

    data.sort((a, b) => {
      const va = getSortableValue(a, sortConfig.key);
      const vb = getSortableValue(b, sortConfig.key);

      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      const sa = String(va).toUpperCase();
      const sb = String(vb).toUpperCase();

      if (sa < sb) return sortConfig.direction === "asc" ? -1 : 1;
      if (sa > sb) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  };
  const setorPalette = [
    { border: "#c4b5fd", bg: "#f5f3ff" }, // roxo
    { border: "#6ee7b7", bg: "#ecfdf5" }, // verde
    { border: "#fcd34d", bg: "#fffbeb" }, // amarelo
    { border: "#fca5a5", bg: "#fef2f2" }, // vermelho/rose
    { border: "#7dd3fc", bg: "#eff6ff" }, // azul
  ];

  return (
    <ThemeScope>
      <NavBar />
      <Page>
        <GlobalModalStyles />

        <TitleBar>
          <H1 $accent="#0ea5e9">Estoque TI</H1>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Button color="primary" onClick={toggleModal}>
              + Adicionar ao Estoque
            </Button>
            <Button color="success" onClick={handleExportExcel}>
              Exportar Excel
            </Button>
          </div>
        </TitleBar>

        {/* Filtros + Cards */}
        <Section>
          <SectorFilterBar>
            <FilterLabel htmlFor="filtroTipo">Tipo de aparelho</FilterLabel>
            <SectorSelect
              id="filtroTipo"
              value={tipoSelecionado}
              onChange={(e) => setTipoSelecionado(e.target.value)}
            >
              <option value="todos">Todos</option>
              {tiposAparelhos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </SectorSelect>
          </SectorFilterBar>

          <InfoGrid style={{ marginTop: 12 }}>
            <InfoItem $clickable onClick={toggleAparelhoModal}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaLaptop />
                <div>
                  <small>Total de aparelhos</small>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {equipamentos.length}
                  </div>
                </div>
              </div>
              <small style={{ fontStyle: "italic" }}>
                Clique para ver o detalhamento
              </small>
            </InfoItem>

            <InfoItem $clickable onClick={toggleCloudModal}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaCloud />
                <div>
                  <small>Clouds ativos</small>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {totalCloudsAtivos}
                  </div>
                </div>
              </div>
              <small style={{ fontStyle: "italic" }}>
                Clique para ver o detalhamento
              </small>
            </InfoItem>

            <InfoItem $clickable onClick={toggleMicrosoftModal}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaEnvelope />
                <div>
                  <small>Licenças Microsoft</small>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {
                      equipamentos.filter((eq) => eq.email_utilizado?.trim())
                        .length
                    }
                  </div>
                </div>
              </div>
              <small style={{ fontStyle: "italic" }}>
                Clique para ver o detalhamento
              </small>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* Tabelas por setor */}
        <Section style={{ marginTop: 16 }}>
          {setores.map((setor, index) => {
            const equipamentosDoSetor = equipamentos.filter((eq) => {
              const filtroTipoOk =
                tipoSelecionado === "todos" ||
                eq.tipo_aparelho === tipoSelecionado;
              return eq.setor === setor && filtroTipoOk;
            });

            const sorted = getSortedEquipamentos(equipamentosDoSetor);

            // pega um par de cores da paleta com base no índice
            const colors = setorPalette[index % setorPalette.length];

            return (
              <SetorSection
                key={setor}
                $borderColor={colors.border}
                $bgColor={colors.bg}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "999px",
                      background: colors.border,
                      boxShadow: "0 0 0 3px rgba(0,0,0,0.04)",
                      flexShrink: 0,
                    }}
                  />
                  <h3 style={{ margin: 0 }}>{setor}</h3>
                </div>

                <TableWrap>
                  <Table>
                    {/* ... resto da tabela igual ... */}

                    <thead>
                      <tr>
                        {columns.map((col) => {
                          const isActive = sortConfig.key === col.key;
                          const arrow =
                            col.sortable === false
                              ? ""
                              : isActive
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : "↕";

                          return (
                            <Th
                              key={col.key}
                              onClick={() =>
                                col.sortable === false
                                  ? undefined
                                  : handleSort(col.key)
                              }
                              style={{
                                padding: "4px 6px",
                                whiteSpace: "nowrap",
                                lineHeight: 1,
                                minWidth: 120,
                                cursor:
                                  col.sortable === false
                                    ? "default"
                                    : "pointer",
                                userSelect: "none",
                              }}
                            >
                              <span>{col.label}</span>
                              {col.sortable === false ? null : (
                                <span
                                  style={{
                                    fontSize: 10,
                                    opacity: 0.7,
                                    marginLeft: 4,
                                  }}
                                >
                                  {arrow}
                                </span>
                              )}
                            </Th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((eq) => (
                        <tr
                        className="linha-hover"
                          key={eq.id}
                          onClick={() => setSelectedEquipamento(eq)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Tipo */}
                          <TdCompact>{eq.tipo_aparelho || "—"}</TdCompact>

                          {/* Responsável */}
                          <TdCompact>{eq.pessoa_responsavel || "—"}</TdCompact>

                          {/* Email */}
                          <TdCompact>{eq.email_utilizado || "—"}</TdCompact>

                          {/* Cloud */}
                          <TdCompact>{eq.cloud_utilizado || "—"}</TdCompact>

                          {/* Descrição */}
                          <TdCompact
                            style={{
                              maxWidth: 150,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={eq.descricao || ""}
                          >
                            {eq.descricao || "—"}
                          </TdCompact>

                          {/* Status */}
                          <TdCompact>
                            <StatusBadge $status={eq.status}>
                              {eq.status || "—"}
                            </StatusBadge>
                          </TdCompact>

                          {/* Localização */}
                          <TdCompact>{eq.localizacao_fisica || "—"}</TdCompact>

                          {/* Última alteração */}
                          <TdCompact>
                            {formatarData(eq.data_atualizacao)}
                          </TdCompact>

                          {/* Ações */}
                          {/* Ações */}
                          <TdCompact onClick={(e) => e.stopPropagation()}>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              {/* Editar */}
                              <Button
                                size="sm"
                                color="warning"
                                onClick={() => handleEditClick(eq)}
                                style={{
                                  padding: "2px 6px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title="Editar"
                              >
                                <FaEdit size={14} />
                              </Button>

                              {/* Excluir */}
                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => {
                                  setEquipamentoToDelete(eq);
                                  setIsDeleteModalOpen(true);
                                }}
                                style={{
                                  padding: "2px 6px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title="Excluir"
                              >
                                <FaTrash size={14} />
                              </Button>
                            </div>
                          </TdCompact>
                        </tr>
                      ))}

                      {!sorted.length && (
                        <tr>
                          <Td colSpan={columns.length} style={{ opacity: 0.7 }}>
                            Nenhum equipamento neste setor com o filtro atual.
                          </Td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </TableWrap>
              </SetorSection>
            );
          })}
        </Section>

        {/* Modal de Adicionar */}
        {isModalOpen && <ModalAdd isOpen={isModalOpen} toggle={toggleModal} />}

        {/* Modal de Edição */}
        {isEditModalOpen && (
          <ModalEdit
            isOpen={isEditModalOpen}
            toggle={toggleEditModal}
            equipamento={equipamentoToEdit}
            onSave={handleSaveEdit}
          />
        )}

        {/* Modal de Delete */}
        <ModalDel
          isOpen={isDeleteModalOpen}
          toggle={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteEquipamento}
          itemName={equipamentoToDelete?.tipo_aparelho}
        />

        {/* Modal de Detalhes */}
        {selectedEquipamento && (
          <Modal
            isOpen={true}
            toggle={toggleDetailsModal}
            size="md"
            contentClassName={MODAL_CLASS}
          >
            <ModalHeader toggle={toggleDetailsModal}>
              Detalhes do Equipamento
            </ModalHeader>
            <ModalBody>
              <p>
                <strong>Tipo:</strong> {selectedEquipamento.tipo_aparelho}
              </p>
              <p>
                <strong>Responsável:</strong>{" "}
                {selectedEquipamento.pessoa_responsavel || "Não informado"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {selectedEquipamento.email_utilizado || "Não informado"}
              </p>
              <p>
                <strong>Cloud:</strong>{" "}
                {selectedEquipamento.cloud_utilizado || "Não informado"}
              </p>
              <p>
                <strong>Descrição:</strong> {selectedEquipamento.descricao}
              </p>
              <p>
                <strong>Localização Física:</strong>{" "}
                {selectedEquipamento.localizacao_fisica}
              </p>
              <p>
                <strong>Obs adicional:</strong>{" "}
                {selectedEquipamento.observacoes || "Não informado"}
              </p>
              <p>
                <strong>Número série:</strong>{" "}
                {selectedEquipamento.numero_serie || "Não informado"}
              </p>
            </ModalBody>
          </Modal>
        )}

        {/* Modais de dashboards auxiliares */}
        <ModalCloud
          isOpen={cloudModalOpen}
          toggle={toggleCloudModal}
          equipamentos={equipamentos}
        />
        <ModalLicenca
          isOpen={microsoftModalOpen}
          toggle={toggleMicrosoftModal}
          equipamentos={equipamentos}
        />
        <ModalAparelho
          isOpen={aparelhoModalOpen}
          toggle={toggleAparelhoModal}
          equipamentos={equipamentos}
        />
      </Page>
    </ThemeScope>
  );
}

export default EstoqueTi;
