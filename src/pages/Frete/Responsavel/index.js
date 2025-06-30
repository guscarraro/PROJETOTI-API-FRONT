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

const Responsavel = () => {
  const [responsaveis, setResponsaveis] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [responsavelToDelete, setResponsavelToDelete] = useState(null);

  const [selectedResponsavel, setSelectedResponsavel] = useState({
    id: null,
    nome: "",
    contas: []
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResponsaveis();
    fetchClientes();
    fetchGrupos();
  }, []);

  const fetchResponsaveis = async () => {
  setLoading(true);
  try {
    const res = await apiLocal.getResponsaveis();
    const baseResponsaveis = res.data;

    // Buscar contas de cada responsável
    const completados = await Promise.all(
      baseResponsaveis.map(async (r) => {
        const detalhes = await apiLocal.getResponsavelById(r.id);
        return { ...r, contas: detalhes.data.contas || [] };
      })
    );

    setResponsaveis(completados);
  } catch (error) {
    toast.error("Erro ao buscar responsáveis.");
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

  const fetchGrupos = async () => {
    try {
      const response = await apiLocal.getGrupoEco();
      setGrupos(response.data);
    } catch (error) {
      toast.error("Erro ao buscar grupos econômicos.");
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleEdit = (r) => {
    setSelectedResponsavel({
      id: r.id,
      nome: r.nome,
      contas: r.contas || []
    });
    toggleModal();
  };

  const handleAddNew = () => {
    setSelectedResponsavel({ id: null, nome: "", contas: [] });
    toggleModal();
  };

 const handleSave = async () => {
  try {
    const { id, nome, contas } = selectedResponsavel;

    const contas_clientes = contas.filter(c => c.tipo === "cliente").map(c => c.id);
    const contas_grupos = contas.filter(c => c.tipo === "grupo_eco").map(c => c.id);
    const payload = { nome, contas_clientes, contas_grupos };

    if (id) {
      await apiLocal.updateResponsavel(id, payload);
      toast.success("Responsável atualizado com sucesso!");
    } else {
      await apiLocal.createResponsavel(payload);
      toast.success("Responsável criado com sucesso!");
    }

    toggleModal();
    fetchResponsaveis();
  } catch (error) {
    toast.error("Erro ao salvar responsável.");
  }
};


 const handleDelete = async () => {
  try {
    await apiLocal.deleteResponsavel(responsavelToDelete.id);
    toast.success("Responsável excluído com sucesso!");
    fetchResponsaveis();
  } catch (error) {
    toast.error("Erro ao excluir responsável.");
  } finally {
    setDeleteModalOpen(false);
    setResponsavelToDelete(null);
  }
};

const confirmDelete = (r) => {
  setResponsavelToDelete(r);
  setDeleteModalOpen(true);
};


  const getContaLabel = (conta) => {
    if (conta.tipo === "cliente") {
      const c = clientes.find((cli) => cli.id === conta.id);
      return c ? c.nome : `Cliente ${conta.id}`;
    } else if (conta.tipo === "grupo_eco") {
      const g = grupos.find((gr) => gr.id === conta.id);
      return g ? g.nome_grupo : `Grupo ${conta.id}`;
    }
    return "";
  };

  const allOptions = [
    ...clientes.map((c) => ({ value: { tipo: "cliente", id: c.id }, label: `Cliente: ${c.nome}` })),
    ...grupos.map((g) => ({ value: { tipo: "grupo_eco", id: g.id }, label: `Grupo: ${g.nome_grupo}` }))
  ];

  const selectedOptions = selectedResponsavel.contas.map((conta) => {
    const label = getContaLabel(conta);
    return {
      value: conta,
      label: conta.tipo === "cliente" ? `Cliente: ${label}` : `Grupo: ${label}`
    };
  });

  const filteredResponsaveis = responsaveis.filter((r) => {
  const termo = searchTerm.toLowerCase();
  const nomeMatch = r.nome.toLowerCase().includes(termo);
  const contasMatch = (r.contas || [])
    .map((conta) => getContaLabel(conta).toLowerCase())
    .some((label) => label.includes(termo));
  return nomeMatch || contasMatch;
});


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
          <FaPlus /> Adicionar Responsável
        </AddButton>
      </HeaderContainer>

      {loading ? (
        <LoadingDots />
      ) : (
       <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "16px",
    width: "100%",
    padding: "20px",
  }}
>
  {filteredResponsaveis.map((r) => (
    <div
      key={r.id}
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        width: "300px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.9)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <h5 style={{ marginBottom: "8px", color:'#000' }}>{r.nome}</h5>
      <div style={{ fontSize: "14px", color: "#555", marginBottom: "12px" }}>
  <strong>Contas:</strong>
  <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
    {(r.contas || []).map((conta, idx) => (
      <span
        key={idx}
        style={{
          backgroundColor: "#28a745", // verde suave
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "13px",
          width: "fit-content",
        }}
      >
        {getContaLabel(conta)}
      </span>
    ))}
  </div>
</div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button color="primary" size="sm" onClick={() => handleEdit(r)}>
          <FaPen />
        </Button>
        <Button color="danger" size="sm" onClick={() => confirmDelete(r)}>
  <FaTrash />
</Button>

      </div>
    </div>
  ))}
</div>

      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedResponsavel.id ? "Editar Responsável" : "Adicionar Responsável"}
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label>Nome:</label>
            <input
              type="text"
              className="form-control"
              value={selectedResponsavel.nome}
              onChange={(e) =>
                setSelectedResponsavel({ ...selectedResponsavel, nome: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label>Contas Atendidas:</label>
            <Select
              isMulti
              options={allOptions}
              value={selectedOptions}
              onChange={(selected) =>
                setSelectedResponsavel({
                  ...selectedResponsavel,
                  contas: selected.map((s) => s.value)
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

      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)} centered>
  <ModalHeader toggle={() => setDeleteModalOpen(false)}>
    Confirmar Exclusão
  </ModalHeader>
  <ModalBody>
    Tem certeza que deseja excluir <strong>{responsavelToDelete?.nome}</strong>?
  </ModalBody>
  <ModalFooter>
    <Button color="danger" onClick={handleDelete}>Sim</Button>
    <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
  </ModalFooter>
</Modal>

    </div>
  );
};

export default Responsavel;
