import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import { toast } from "react-toastify";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";

import apiLocal from "../../../services/apiLocal";

import {
  HeaderContainer,
  StyledTable,
  AddButton,
  FilterInput,
} from "./style";

const Destino = () => {
  const [destinos, setDestinos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDestino, setSelectedDestino] = useState({
    id: null,
    nome: "",
    endereco: "",
    cidade: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [destinoToDelete, setDestinoToDelete] = useState(null);

  useEffect(() => {
    fetchDestinos();
  }, []);

  const fetchDestinos = async () => {
    try {
      const response = await apiLocal.getDestinos();
      setDestinos(response.data);
    } catch (error) {
      toast.error("Erro ao buscar destinos.");
      console.error(error);
    }
  };

  const filteredDestinos = destinos.filter((d) =>
    d.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleEdit = (destino) => {
    setSelectedDestino(destino);
    toggleModal();
  };

  const handleAddNew = () => {
    setSelectedDestino({ id: null, nome: "", endereco: "", cidade: "" });
    toggleModal();
  };

  const handleSave = async () => {
    if (!selectedDestino.nome.trim()) {
      toast.error("Por favor, preencha o campo de nome.");
      return;
    }

    const { id, nome, endereco, cidade } = selectedDestino;
    const dataToSend = id
      ? { id, nome, endereco, cidade }
      : { nome, endereco, cidade };

    try {
      await apiLocal.createOrUpdateDestino(dataToSend);
      toast.success(
        id ? "Destino atualizado com sucesso!" : "Destino criado com sucesso!"
      );
      toggleModal();
      fetchDestinos();
    } catch (error) {
      toast.error("Erro ao salvar destino.");
      console.error(error);
    }
  };

  // Abre o modal de confirmação de exclusão
  const openDeleteModal = (id) => {
    setDestinoToDelete(id);
    setDeleteModalOpen(true);
  };

  // Confirma a exclusão no modal
  const confirmDelete = async () => {
    try {
      await apiLocal.deleteDestino(destinoToDelete);
      toast.success("Destino excluído com sucesso!");
      setDeleteModalOpen(false);
      setDestinoToDelete(null);
      fetchDestinos();
    } catch (error) {
      toast.error("Erro ao excluir destino.");
      console.error(error);
    }
  };

  // Cancela a exclusão
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDestinoToDelete(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <HeaderContainer>
        <FilterInput
          type="text"
          placeholder="Filtrar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <AddButton color="success" onClick={handleAddNew}>
          <FaPlus /> Adicionar Destino
        </AddButton>
      </HeaderContainer>

      <StyledTable bordered>
        <thead>
          <tr>
            <th>Editar</th>
            <th>Nome</th>
            <th>Endereço</th>
            <th>Cidade</th>
          </tr>
        </thead>
        <tbody>
          {filteredDestinos.map((destino) => (
            <tr key={destino.id}>
              <td style={{ textAlign: "center", width: "10px" }}>
                <FaPen
                  style={{ color: "rgb(0, 123, 255)" }}
                  onClick={() => handleEdit(destino)}
                />
              </td>
              <td>{destino.nome}</td>
              <td>{destino.endereco || "N/A"}</td>
              <td>{destino.cidade || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>

      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedDestino.id ? "Editar Destino" : "Adicionar Destino"}
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label>Nome:</label>
            <input
              type="text"
              className="form-control"
              value={selectedDestino.nome}
              onChange={(e) =>
                setSelectedDestino({ ...selectedDestino, nome: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label>Endereço:</label>
            <input
              type="text"
              className="form-control"
              value={selectedDestino.endereco}
              onChange={(e) =>
                setSelectedDestino({
                  ...selectedDestino,
                  endereco: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label>Cidade:</label>
            <input
              type="text"
              className="form-control"
              value={selectedDestino.cidade}
              onChange={(e) =>
                setSelectedDestino({
                  ...selectedDestino,
                  cidade: e.target.value,
                })
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave}>
            Salvar
          </Button>
          <Button color="secondary" onClick={toggleModal}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteModalOpen} toggle={cancelDelete}>
        <ModalHeader toggle={cancelDelete}>Confirmar Exclusão</ModalHeader>
        <ModalBody>Tem certeza que deseja excluir este destino?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmDelete}>
            Excluir
          </Button>
          <Button color="secondary" onClick={cancelDelete}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Destino;