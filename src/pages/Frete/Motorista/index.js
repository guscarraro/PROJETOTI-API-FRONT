import React, { useEffect, useState } from "react";
import { Table, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import apiLocal from "../../../services/apiLocal";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";

const Motorista = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMotorista, setSelectedMotorista] = useState({
    id: null,
    nome: "",
    placa: "",
    antt: "",
  });

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const fetchMotoristas = async () => {
    try {
      const response = await apiLocal.getMotoristas();
      setMotoristas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar motoristas.");
      console.error(error);
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleEdit = (motorista) => {
    setSelectedMotorista(motorista);
    toggleModal();
  };

  const handleAddNew = () => {
    setSelectedMotorista({ id: null, nome: "", placa: "", antt: "" });
    toggleModal();
  };

  const handleSave = async () => {
    try {
      await apiLocal.createOrUpdateMotorista(selectedMotorista);
      toast.success(
        selectedMotorista.id ? "Motorista atualizado com sucesso!" : "Motorista criado com sucesso!"
      );
      toggleModal();
      fetchMotoristas();
    } catch (error) {
      toast.error("Erro ao salvar motorista.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este motorista?")) {
      try {
        await apiLocal.deleteMotorista(id);
        toast.success("Motorista excluído com sucesso!");
        fetchMotoristas();
      } catch (error) {
        toast.error("Erro ao excluir motorista.");
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div style={styles.headerContainer}>
        <h2>Motoristas</h2>
        <Button color="success" onClick={handleAddNew} style={styles.addButton}>
          <FaPlus /> Adicionar Motorista
        </Button>
      </div>
      <Table bordered style={styles.table}>
        <thead>
          <tr>
            <th style={styles.header}>Editar</th>
            <th style={styles.header}>Nome</th>
            <th style={styles.header}>Placa</th>
            <th style={styles.header}>ANTT</th>
            <th style={styles.header}>Excluir</th>
          </tr>
        </thead>
        <tbody>
          {motoristas.map((motorista) => (
            <tr key={motorista.id}>
              <td style={styles.cell}>
                <FaPen
                  style={styles.icon}
                  onClick={() => handleEdit(motorista)}
                />
              </td>
              <td style={styles.cell}>{motorista.nome}</td>
              <td style={styles.cell}>{motorista.placa}</td>
              <td style={styles.cell}>{motorista.antt}</td>
              <td style={styles.cell}>
                <FaTrash
                  style={{ ...styles.icon, color: "red" }}
                  onClick={() => handleDelete(motorista.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para edição ou criação */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedMotorista.id ? "Editar Motorista" : "Adicionar Motorista"}
        </ModalHeader>
        <ModalBody>
          <div>
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
          <div>
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
          <div>
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

export default Motorista;
