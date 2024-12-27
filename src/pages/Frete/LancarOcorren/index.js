import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Container,
  Title,
  StyledForm,
  FormGroup,
  Label,
  Input,
  Select,
  TextArea,
  SubmitButton,
} from "./style";
import {
  FaFileInvoice,
  FaUser,
  FaTruck,
  FaCalendar,
  FaMapMarkerAlt,
  FaCity,
  FaBuilding,
} from "react-icons/fa";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";
import apiLocal from "../../../services/apiLocal";

const LancarOcorren = ({ onActionComplete }) => {
  const [motoristas, setMotoristas] = useState([]);
  const [clienteNome, setClienteNome] = useState("");
  const [clientes, setClientes] = useState([]);
  const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
  const [ocorrencia, setOcorrencia] = useState({
    nf: "",
    cliente_id: "",
    motorista_id: "",
    destino_id: "",
    cidade: "",
    horario_chegada: "",
    tipoocorrencia_id: "",
    obs: "",
    status: "Pendente",
  });

  const [loadingNota, setLoadingNota] = useState(false);
  const [modal, setModal] = useState(false);
  const [clientesDuplicados, setClientesDuplicados] = useState([]);

  useEffect(() => {
    fetchMotoristas();
    fetchClientes();
    fetchTiposOcorrencia();
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

  const fetchClientes = async () => {
    try {
      const response = await apiLocal.getClientes();
      setClientes(response.data);
    } catch (error) {
      toast.error("Erro ao buscar clientes.");
      console.error(error);
    }
  };

  const fetchTiposOcorrencia = async () => {
    try {
      const response = await apiLocal.getNomesOcorrencias();
      setTiposOcorrencia(response.data);
    } catch (error) {
      toast.error("Erro ao buscar tipos de ocorrência.");
      console.error(error);
    }
  };

  const handleNotaFiscalChange = async (e) => {
    const nf = e.target.value;
    setOcorrencia({ ...ocorrencia, nf });
  };
  
  const handleKeyDown = async (e) => {
    if (e.key === "Tab" && ocorrencia.nf) {
      setLoadingNota(true);
      try {
        const response = await apiLocal.getDadosNota(ocorrencia.nf);
        const dados = response?.data?.dados || [];
  
        // Filtra as notas que contêm a NF digitada
        const notasFiltradas = dados.filter((item) =>
          item.NF.split(",").map((nf) => nf.trim()).includes(ocorrencia.nf)
        );
  
        if (notasFiltradas.length === 1) {
          const data = notasFiltradas[0];
          setClienteNome(data.remetente);
          setOcorrencia((prev) => ({
            ...prev,
            cliente_id: data.remetente, // O cliente será cadastrado caso não exista
            destino_id: data.destinatario,
            cidade: data.destino,
          }));
        } else if (notasFiltradas.length > 1) {
          setClientesDuplicados(notasFiltradas);
          setModal(true);
        } else {
          toast.warning("Nenhuma informação encontrada para a nota informada.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados da nota:", error);
        toast.error("Erro ao buscar informações da nota fiscal.");
      } finally {
        setLoadingNota(false);
      }
    }
  };
  

  const handleClienteSelection = (cliente) => {
    setClienteNome(cliente.remetente); // Exibe o nome
    setOcorrencia((prev) => ({
      ...prev,
      cliente_id: cliente.id, // Usa o ID internamente
      destino_id: cliente.destinatario,
      cidade: cliente.destino,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOcorrencia({ ...ocorrencia, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
        if (!clienteNome || !ocorrencia.nf) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        let clienteID;
        const clienteExistente = clientes.find(cliente => cliente.nome === clienteNome);

        if (!clienteExistente) {
            // Cadastrar cliente caso não exista
            const novoCliente = { nome: clienteNome };
            const response = await apiLocal.createOrUpdateCliente(novoCliente);

            if (response.data && response.data.data) {
                clienteID = response.data.data.id; // Obtém o ID do cliente criado
                toast.success("Cliente cadastrado automaticamente.");
            } else {
                throw new Error(response.data?.error || "Erro ao cadastrar cliente.");
            }
        } else {
            // Usa o ID do cliente existente
            clienteID = clienteExistente.id;
        }

        // Formatar e salvar a ocorrência
        const ocorrenciaFormatada = {
            ...ocorrencia,
            cliente_id: clienteID,
            destino_id: parseInt(ocorrencia.destino_id, 10),
            tipoocorrencia_id: parseInt(ocorrencia.tipoocorrencia_id, 10),
            endereco: null,
            status: "Pendente",
        };

        const ocorrenciaResponse = await apiLocal.createOrUpdateOcorrencia(ocorrenciaFormatada);

        if (ocorrenciaResponse.data) {
            setOcorrencia({
                nf: "",
                cliente_id: "",
                motorista_id: "",
                destino_id: "",
                cidade: "",
                horario_chegada: "",
                tipoocorrencia_id: "",
                obs: "",
                status: "Pendente",
            });
            setClienteNome("");
            if (onActionComplete) onActionComplete("Ocorrência lançada com sucesso!");
        } else {
            throw new Error("Erro ao salvar a ocorrência.");
        }
    } catch (error) {
        console.error("Erro ao salvar a ocorrência:", error);
        toast.error(error.message || "Erro ao lançar a ocorrência.");
    }
};


  
  
  
  

  return (
    <Container>
      <Title>Lançar Ocorrência</Title>
      <StyledForm onSubmit={handleSave}>
      <FormGroup>
        <Label>
          <FaFileInvoice /> Nota Fiscal
        </Label>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            type="text"
            name="nf"
            value={ocorrencia.nf}
            onChange={handleNotaFiscalChange}
            onKeyDown={handleKeyDown} // Adiciona o evento de keyDown
            placeholder="Nota Fiscal"
            style={{ flex: 1 }}
          />
          {loadingNota && <Spinner size="sm" color="primary" className="ml-2" />}
        </div>
      </FormGroup>
      <FormGroup>
  <Label>
    <FaUser /> Cliente
  </Label>
  <Input
    type="text"
    name="cliente_nome"
    value={clienteNome} // Exibe o nome no campo
    readOnly
    placeholder="Cliente"
  />
</FormGroup>

        <FormGroup>
          <Label>
            <FaBuilding /> Destinatário
          </Label>
          <Input
            type="text"
            name="destino_id"
            value={ocorrencia.destino_id}
            readOnly
            placeholder="Destinatário"
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaCity /> Cidade
          </Label>
          <Input
            type="text"
            name="cidade"
            value={ocorrencia.cidade}
            readOnly
            placeholder="Cidade"
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaTruck /> Motorista
          </Label>
          <Select
            name="motorista_id"
            value={ocorrencia.motorista_id}
            onChange={handleInputChange}
          >
            <option value="">Selecione um motorista</option>
            {motoristas.map((motorista) => (
              <option key={motorista.id} value={motorista.id}>
                {motorista.nome}
              </option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>
            <FaMapMarkerAlt /> Tipo de Ocorrência
          </Label>
          <Select
            name="tipoocorrencia_id"
            value={ocorrencia.tipoocorrencia_id}
            onChange={handleInputChange}
          >
            <option value="">Selecione um tipo de ocorrência</option>
            {tiposOcorrencia.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>
            <FaCalendar /> Data e Hora de Chegada
          </Label>
          <Input
            type="datetime-local"
            name="horario_chegada"
            value={ocorrencia.horario_chegada}
            onChange={handleInputChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaFileInvoice /> Observações
          </Label>
          <TextArea
            name="obs"
            value={ocorrencia.obs}
            onChange={handleInputChange}
            placeholder="Observações"
          />
        </FormGroup>
        <SubmitButton type="submit">Adicionar Ocorrência</SubmitButton>
      </StyledForm>

      <Modal isOpen={modal} toggle={() => setModal(!modal)}>
        <ModalHeader toggle={() => setModal(!modal)}>Selecionar Cliente</ModalHeader>
        <ModalBody>
          <p>Mais de um cliente foi encontrado para esta nota fiscal:</p>
          <ul>
            {clientesDuplicados.map((cliente, index) => (
              <li
                key={index}
                style={{ cursor: "pointer", padding: "5px 0" }}
                onClick={() => handleClienteSelection(cliente)}
              >
                Cliente: {cliente.remetente} | Destinatário: {cliente.destinatario}
              </li>
            ))}
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModal(false)}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default LancarOcorren;
