import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "reactstrap";
import { toast } from "react-toastify";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";
import Select from "react-select";

import apiLocal from "../../../services/apiLocal";
import {
  HeaderContainer,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  AddButton,
  FilterInput
} from "./style";
import LoadingDots from "../../../components/Loading";

const GrupoEco = () => {
  const [grupos, setGrupos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState({
    id: null,
    nome_grupo: "",
    cliente_ids: []
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGrupos();
    fetchClientes();
  }, []);

  const fetchGrupos = async () => {
    setLoading(true);
    try {
      const response = await apiLocal.getGrupoEco();
      setGrupos(response.data);
    } catch (error) {
      toast.error("Erro ao buscar grupos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await apiLocal.getClientes();
      setClientes(response.data);
    } catch (error) {
      toast.error("Erro ao buscar clientes.");
    }
  };

  const filteredGrupos = grupos.filter((g) =>
    g.nome_grupo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleEdit = (grupo) => {
    setSelectedGrupo({
      id: grupo.id,
      nome_grupo: grupo.nome_grupo,
      cliente_ids: grupo.cliente_ids || []
    });
    toggleModal();
  };

  const handleAddNew = () => {
    setSelectedGrupo({ id: null, nome_grupo: "", cliente_ids: [] });
    toggleModal();
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        nome_grupo: selectedGrupo.nome_grupo,
        cliente_ids: selectedGrupo.cliente_ids
      };

      if (selectedGrupo.id) {
        await apiLocal.updateGrupoEco(selectedGrupo.id, dataToSend);
        toast.success("Grupo atualizado com sucesso!");
      } else {
        await apiLocal.createOrUpdateGrupoEco(dataToSend);
        toast.success("Grupo criado com sucesso!");
      }

      toggleModal();
      fetchGrupos();
    } catch (error) {
      toast.error("Erro ao salvar grupo.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir este grupo econômico?")) {
      try {
        await apiLocal.deleteGrupoEco(id);
        toast.success("Grupo excluído com sucesso!");
        fetchGrupos();
      } catch (error) {
        toast.error("Erro ao excluir grupo.");
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh" }}>
      <HeaderContainer>
        <FilterInput
          type="text"
          placeholder="Filtrar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <AddButton color="success" onClick={handleAddNew}>
          <FaPlus /> Adicionar Grupo
        </AddButton>
      </HeaderContainer>

      {loading ? (
        <LoadingDots />
      ) : (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Nome</TableHeader>
              <TableHeader>Clientes Vinculados</TableHeader>
              <TableHeader>Ações</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {filteredGrupos.map((grupo) => (
              <TableRow key={grupo.id}>
                <TableCell>{grupo.nome_grupo}</TableCell>
                <TableCell>
                  {clientes
                    .filter((c) => grupo.cliente_ids?.includes(c.id))
                    .map((c) => c.nome)
                    .join(", ")}
                </TableCell>
                <TableCell>
                  <Button color="warning" size="sm" onClick={() => handleEdit(grupo)}><FaPen /></Button>{" "}
                  <Button color="danger" size="sm" onClick={() => handleDelete(grupo.id)}><FaTrash /></Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedGrupo.id ? "Editar Grupo" : "Adicionar Grupo"}
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label>Nome do Grupo:</label>
            <input
              type="text"
              className="form-control"
              value={selectedGrupo.nome_grupo}
              onChange={(e) =>
                setSelectedGrupo({ ...selectedGrupo, nome_grupo: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label>Clientes do Grupo:</label>
            <Select
              isMulti
              options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
              value={clientes
                .filter((c) => selectedGrupo.cliente_ids.includes(c.id))
                .map((c) => ({ value: c.id, label: c.nome }))}
              onChange={(selected) =>
                setSelectedGrupo({
                  ...selectedGrupo,
                  cliente_ids: selected.map((item) => item.value)
                })
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave}>Salvar</Button>
          <Button color="secondary" onClick={toggleModal}>Fechar</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default GrupoEco;
