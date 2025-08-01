// Cliente.jsx (componente pai)
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
import ModalEdit from "./ModalEdit";

const Cliente = () => {
  const [clientes, setClientes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState({});
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
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    toggleModal();
  };

  const handleAddNew = () => {
    setSelectedCliente({
      id: null,
      nome: "",
      hr_permanencia: "",
      tde: "não",
      valor_permanencia: "",
      paletizado: "não",
      valor_pallet: ""
    });
    toggleModal();
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
        {/* <AddButton color="success" onClick={handleAddNew}>
          <FaPlus /> Adicionar Cliente
        </AddButton> */}
      </HeaderContainer>

      {loading ? (
        <LoadingDots />
      ) : (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Nome</TableHeader>
              <TableHeader>Hr Permanência</TableHeader>
              <TableHeader>TDE</TableHeader>
              <TableHeader>Valor TDE</TableHeader>
              <TableHeader>Paletizado</TableHeader>
              <TableHeader>Valor Pallet</TableHeader>
              <TableHeader>Ações</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {filteredClientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nome}</TableCell>
                <TableCell>{cliente.hr_perm || '-'}</TableCell>
                <TableCell style={{ color: cliente.tde === 'sim' ? 'green' : 'red' }}>{cliente.tde === 'sim' ? 'Sim' : 'Não'}</TableCell>
                <TableCell>{cliente.valor_permanencia ? `R$ ${cliente.valor_permanencia}` : '-'}</TableCell>
                <TableCell style={{ color: cliente.paletizado === 'sim' ? 'green' : 'red' }}>
                  {cliente.paletizado === 'sim' ? 'Sim' : 'Não'}
                </TableCell>
                <TableCell>{cliente.valor_pallet ? `R$ ${cliente.valor_pallet}` : '-'}</TableCell>
                <TableCell>
                  <Button color="primary" size="sm" onClick={() => handleEdit(cliente)}>
                    <FaPen />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <ModalEdit

        isOpen={modalOpen}
        toggle={toggleModal}
        cliente={selectedCliente}
        onSaved={fetchClientes}
      />
    </div>
  );
};

export default Cliente;
