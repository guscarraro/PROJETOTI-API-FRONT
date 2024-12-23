import React, { useEffect, useState } from "react";
import { Table, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import apiLocal from "../../../services/apiLocal";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";

const Cliente = () => {
  const [clientes, setClientes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState({
    id: null,
    nome: "",
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await apiLocal.getClientes();
      setClientes(response.data);
    } catch (error) {
      toast.error("Erro ao buscar clientes.");
      console.error(error);
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    toggleModal();
  };

  const handleAddNew = () => {
    setSelectedCliente({ id: null, nome: "" });
    toggleModal();
  };

  const handleSave = async () => {
    try {
      await apiLocal.createOrUpdateCliente(selectedCliente);
      toast.success(
        selectedCliente.id ? "Cliente atualizado com sucesso!" : "Cliente criado com sucesso!"
      );
      toggleModal();
      fetchClientes();
    } catch (error) {
      toast.error("Erro ao salvar cliente.");
      console.error(error);
    }
  };

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
    <div>
      <div style={styles.headerContainer}>
        <h2>Clientes</h2>
        <Button color="success" onClick={handleAddNew} style={styles.addButton}>
          <FaPlus /> Adicionar Cliente
        </Button>
      </div>
      <Table bordered style={styles.table}>
        <thead>
          <tr>
            <th style={styles.header}>Editar</th>
            <th style={styles.header}>Nome</th>
            <th style={styles.header}>Excluir</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td style={styles.cell}>
                <FaPen
                  style={styles.icon}
                  onClick={() => handleEdit(cliente)}
                />
              </td>
              <td style={styles.cell}>{cliente.nome}</td>
              <td style={styles.cell}>
                <FaTrash
                  style={{ ...styles.icon, color: "red" }}
                  onClick={() => handleDelete(cliente.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para edição ou criação */}
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

      <ToastContainer />
    </div>
  );
};

const styles = {
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  table: {
    marginTop: "20px",
    borderRadius: "10px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#007bff",
    color: "#fff",
    textAlign: "center",
    padding: "10px",
  },
  cell: {
    textAlign: "center",
    padding: "10px",
  },
  icon: {
    cursor: "pointer",
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
};

export default Cliente;
