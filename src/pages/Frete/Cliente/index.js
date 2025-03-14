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

const Cliente = () => {
  const [clientes, setClientes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Em vez de { id: null, nome: "" }, também pode começar assim:
  const [selectedCliente, setSelectedCliente] = useState({ id: null, nome: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await apiLocal.getClientes();
      setClientes(response.data);
    } catch (error) {
      toast.error("Erro ao buscar clientes.");
    
      setLoading(false);
    }finally {
      setLoading(false);
    }
  };

  // Filtra por nome
  const filteredClientes = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abre/fecha modal de edição/criação
  const toggleModal = () => setModalOpen(!modalOpen);

  // Ao clicar em "Editar"
  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    toggleModal();
  };

  // Ao clicar em "Adicionar"
  const handleAddNew = () => {
    setSelectedCliente({ id: null, nome: "" });
    toggleModal();
  };

  // SALVAR (create ou update)
  const handleSave = async () => {
    try {
      // Se tiver um id válido, enviamos { id, nome }. 
      // Se não tiver, enviamos somente { nome }.
      const { id, nome } = selectedCliente;
      const dataToSend = id ? { id, nome } : { nome };

      await apiLocal.createOrUpdateCliente(dataToSend);
      toast.success(
        id
          ? "Cliente atualizado com sucesso!"
          : "Cliente criado com sucesso!"
      );
      toggleModal();
      fetchClientes();
    } catch (error) {
      toast.error("Erro ao salvar cliente.");
      console.error(error);
    }
  };

  // Excluir
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await apiLocal.deleteCliente(id);
        toast.success("Cliente excluído com sucesso!");
        fetchClientes();
      } catch (error) {
        toast.error("Erro ao excluir cliente.");
        console.error(error);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh"
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
          <FaPlus /> Adicionar Cliente
        </AddButton>
      </HeaderContainer>

      {loading ? (
  <LoadingDots/> // Ou utilize um componente de loading
) : (
  <Table>
    <thead>
      <TableRow>
        <TableHeader>Nome</TableHeader>
      </TableRow>
    </thead>
    <tbody>
      {filteredClientes.map((cliente) => (
        <TableRow key={cliente.id}>
          <TableCell>{cliente.nome}</TableCell>
        </TableRow>
      ))}
    </tbody>
  </Table>
)}


      {/* Modal para edição/criação */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedCliente.id ? "Editar Cliente" : "Adicionar Cliente"}
        </ModalHeader>
        <ModalBody>
          <div>
            <label>Nome:</label>
            <input
              type="text"
              className="form-control"
              value={selectedCliente.nome}
              onChange={(e) =>
                setSelectedCliente({ ...selectedCliente, nome: e.target.value })
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

    </div>
  );
};

export default Cliente;
