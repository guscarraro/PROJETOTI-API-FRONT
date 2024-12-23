import React, { useEffect, useState } from "react";
import { Table, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import apiLocal from "../../../services/apiLocal";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";

const TipoOcorren = () => {
  const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState({
    id: null,
    nome: "",
  });

  useEffect(() => {
    fetchTiposOcorrencia();
  }, []);

  const fetchTiposOcorrencia = async () => {
    try {
      const response = await apiLocal.getNomesOcorrencias();
      setTiposOcorrencia(response.data);
    } catch (error) {
      toast.error("Erro ao buscar tipos de ocorrências.");
      console.error(error);
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleEdit = (tipo) => {
    setSelectedTipo(tipo);
    toggleModal();
  };

  const handleAddNew = () => {
    setSelectedTipo({ id: null, nome: "" });
    toggleModal();
  };

  const handleSave = async () => {
    try {
      await apiLocal.createOrUpdateNomeOcorrencia(selectedTipo);
      toast.success(
        selectedTipo.id ? "Tipo de ocorrência atualizado com sucesso!" : "Tipo de ocorrência criado com sucesso!"
      );
      toggleModal();
      fetchTiposOcorrencia();
    } catch (error) {
      toast.error("Erro ao salvar tipo de ocorrência.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este tipo de ocorrência?")) {
      try {
        await apiLocal.deleteNomeOcorrencia(id);
        toast.success("Tipo de ocorrência excluído com sucesso!");
        fetchTiposOcorrencia();
      } catch (error) {
        toast.error("Erro ao excluir tipo de ocorrência.");
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div style={styles.headerContainer}>
        <h2>Tipos de Ocorrências</h2>
        <Button color="success" onClick={handleAddNew} style={styles.addButton}>
          <FaPlus /> Adicionar Tipo de Ocorrência
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
          {tiposOcorrencia.map((tipo) => (
            <tr key={tipo.id}>
              <td style={styles.cell}>
                <FaPen
                  style={styles.icon}
                  onClick={() => handleEdit(tipo)}
                />
              </td>
              <td style={styles.cell}>{tipo.nome}</td>
              <td style={styles.cell}>
                <FaTrash
                  style={{ ...styles.icon, color: "red" }}
                  onClick={() => handleDelete(tipo.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para edição ou criação */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedTipo.id ? "Editar Tipo de Ocorrência" : "Adicionar Tipo de Ocorrência"}
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

export default TipoOcorren;
