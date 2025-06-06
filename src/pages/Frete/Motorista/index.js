import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";

import apiLocal from "../../../services/apiLocal";

// Importa os componentes estilizados do arquivo styleMotorista.js
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

const Motorista = () => {
  // Lista de motoristas
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Controle do modal de edição/criação
  const [modalOpen, setModalOpen] = useState(false);

  // Dados do motorista selecionado (para edição ou criação)
  const [selectedMotorista, setSelectedMotorista] = useState({
    id: null,
    nome: "",
    placa: "",
    antt: "",
  });

  // Filtro de busca
  const [searchTerm, setSearchTerm] = useState("");

  // Modal de confirmação de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [motoristaToDelete, setMotoristaToDelete] = useState(null);

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const fetchMotoristas = async () => {
    setLoading(true);
    try {
      const response = await apiLocal.getMotoristas();
      setMotoristas(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Erro ao buscar motoristas.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtra os motoristas com base no 'searchTerm'
  const filteredMotoristas = motoristas.filter((m) =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Controla o modal de edição/criação
  const toggleModal = () => setModalOpen(!modalOpen);

  // Clicou em editar
  const handleEdit = (motorista) => {
    setSelectedMotorista(motorista);
    toggleModal();
  };

  // Clicou em adicionar
  const handleAddNew = () => {
    setSelectedMotorista({ id: null, nome: "", placa: "", antt: "" });
    toggleModal();
  };

  // Salvar (criar ou atualizar)
  const handleSave = async () => {
    // Verifica se os campos estão preenchidos
    if (
      !selectedMotorista.nome.trim() ||
      !selectedMotorista.placa.trim() ||
      !selectedMotorista.antt.trim()
    ) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    // Omitimos o "id" caso seja null, para não dar erro 422 no FastAPI
    const { id, nome, placa, antt } = selectedMotorista;
    const dataToSend = id
      ? { id, nome, placa, antt } // update
      : { nome, placa, antt };   // create

    try {
      await apiLocal.createOrUpdateMotorista(dataToSend);
      toast.success(
        id
          ? "Motorista atualizado com sucesso!"
          : "Motorista criado com sucesso!"
      );
      toggleModal();
      fetchMotoristas();
    } catch (error) {
      toast.error("Erro ao salvar motorista.");
      console.error(error);
    }
  };

  // Abre o modal de confirmação de exclusão
  const openDeleteModal = (id) => {
    setMotoristaToDelete(id);
    setDeleteModalOpen(true);
  };

  // Confirma a exclusão no modal
  const confirmDelete = async () => {
    try {
      await apiLocal.deleteMotorista(motoristaToDelete);
      toast.success("Motorista excluído com sucesso!");
      setDeleteModalOpen(false);
      setMotoristaToDelete(null);
      fetchMotoristas();
    } catch (error) {
      toast.error("Erro ao excluir motorista.");
      console.error(error);
    }
  };

  // Cancela a exclusão
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setMotoristaToDelete(null);
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
        {/* Campo de texto para filtrar pelo nome do motorista */}
        <FilterInput
          type="text"
          placeholder="Filtrar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Botão de adicionar novo motorista */}
        <AddButton color="success" onClick={handleAddNew}>
          <FaPlus /> Adicionar Motorista
        </AddButton>
      </HeaderContainer>

      {loading ? (
        <LoadingDots /> // Ou utilize um componente de loading
      ) : (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Nome</TableHeader>
              <TableHeader>Placa</TableHeader>
              <TableHeader>ANTT</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {filteredMotoristas.map((motorista) => (
              <TableRow key={motorista.id}>
                <TableCell>{motorista.nome}</TableCell>
                <TableCell>{motorista.placa}</TableCell>
                <TableCell>{motorista.antt}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}


      {/* Modal para edição ou criação */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedMotorista.id ? "Editar Motorista" : "Adicionar Motorista"}
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label>Nome:</label>
            <input
              type="text"
              className="form-control"
              value={selectedMotorista.nome}
              onChange={(e) =>
                setSelectedMotorista({ ...selectedMotorista, nome: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label>Placa:</label>
            <input
              type="text"
              className="form-control"
              value={selectedMotorista.placa}
              onChange={(e) =>
                setSelectedMotorista({ ...selectedMotorista, placa: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label>ANTT:</label>
            <input
              type="text"
              className="form-control"
              value={selectedMotorista.antt}
              onChange={(e) =>
                setSelectedMotorista({ ...selectedMotorista, antt: e.target.value })
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

      {/* Modal de confirmação de exclusão */}
      <Modal isOpen={deleteModalOpen} toggle={cancelDelete}>
        <ModalHeader toggle={cancelDelete}>
          Confirmar Exclusão
        </ModalHeader>
        <ModalBody>
          Tem certeza que deseja excluir este motorista?
        </ModalBody>
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

export default Motorista;
