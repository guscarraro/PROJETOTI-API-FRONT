import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import { toast } from "react-toastify";
import { FaPen, FaPlus } from "react-icons/fa";

import apiLocal from "../../../services/apiLocal";
// Importa os componentes estilizados
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

const TipoOcorren = () => {
  const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  // Dados do tipo que está sendo criado/editado
  const [selectedTipo, setSelectedTipo] = useState({
    id: null,
    nome: ""
  });

  // Texto do filtro de busca
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para controlar modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  // Estado para guardar o ID do item a excluir
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchTiposOcorrencia();
  }, []);

  const fetchTiposOcorrencia = async () => {
    setLoading(true);

    try {
      const response = await apiLocal.getNomesOcorrencias();
      setTiposOcorrencia(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Erro ao buscar tipos de ocorrências.");
      console.error(error);
    } finally {
      setLoading(false);
    }

  };

  // Filtra as ocorrências com base no 'searchTerm'
  const filteredOcorrencias = tiposOcorrencia.filter((tipo) =>
    tipo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abre/fecha o modal de edição/criação
  const toggleModal = () => setModalOpen(!modalOpen);

  // Ao clicar em "Editar"
  const handleEdit = (tipo) => {
    setSelectedTipo(tipo);
    toggleModal();
  };

  // Ao clicar em "Adicionar"
  const handleAddNew = () => {
    setSelectedTipo({ id: null, nome: "" });
    toggleModal();
  };

  // SALVAR (cria ou atualiza)
  const handleSave = async () => {
    const { id, nome } = selectedTipo;
    const dataToSend = id ? { id, nome } : { nome };

    try {
      await apiLocal.createOrUpdateNomeOcorrencia(dataToSend);
      toast.success(
        id
          ? "Tipo de ocorrência atualizada com sucesso!"
          : "Tipo de ocorrência criada com sucesso!"
      );
      toggleModal();
      fetchTiposOcorrencia();
    } catch (error) {
      toast.error("Erro ao salvar tipo de ocorrência.");
      console.error(error);
    }
  };

  // Ao clicar em "Excluir" no ícone de lixeira (FaTrash)
  // Em vez de excluir diretamente, abrimos um modal de confirmação
  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  // Usuário confirma a exclusão no modal
  const confirmDelete = async () => {
    try {
      await apiLocal.deleteNomeOcorrencia(itemToDelete);
      toast.success("Tipo de ocorrência excluída com sucesso!");
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchTiposOcorrencia();
    } catch (error) {
      toast.error("Erro ao excluir tipo de ocorrência.");
      console.error(error);
    }
  };

  // Usuário cancela a exclusão
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        minHeight: "100vh"
      }}
    >
      <HeaderContainer>
        {/* Campo de texto para filtrar pelo nome */}
        <FilterInput
          type="text"
          placeholder="Filtrar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Botão de adicionar nova ocorrência */}
        <AddButton color="success" onClick={handleAddNew}>
          <FaPlus /> Adicionar Tipo de Ocorrência
        </AddButton>
      </HeaderContainer>

      {loading ? (
        <LoadingDots /> // Ou utilize um componente de loading
      ) : (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Editar</TableHeader>
              <TableHeader>Nome</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {filteredOcorrencias.map((tipo) => (
              <TableRow key={tipo.id}>
                <TableCell>
                  <FaPen
                    onClick={() => handleEdit(tipo)}
                    style={{ color: "rgb(0, 123, 255)", cursor: "pointer" }}
                  />
                </TableCell>
                <TableCell>{tipo.nome}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}


      {/* Modal para edição ou criação */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedTipo.id
            ? "Editar Tipo de Ocorrência"
            : "Adicionar Tipo de Ocorrência"}
        </ModalHeader>
        <ModalBody>
          <div>
            <label>Nome:</label>
            <input
              type="text"
              className="form-control"
              value={selectedTipo.nome}
              onChange={(e) =>
                setSelectedTipo({ ...selectedTipo, nome: e.target.value })
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
          Tem certeza que deseja excluir este tipo de ocorrência?
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

export default TipoOcorren;
