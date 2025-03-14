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
import LoadingDots from "../../../components/Loading";
import { fetchNotaFiscal } from "../../../services/api";

const LancarOcorren = ({ onActionComplete }) => {
  const [motoristas, setMotoristas] = useState([]);
  const [clienteNome, setClienteNome] = useState("");
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);
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
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [clientesDuplicados, setClientesDuplicados] = useState([]);

  useEffect(() => {
    fetchMotoristas();
    fetchClientes();
    fetchTiposOcorrencia();
    fetchDestinos(); 
  }, []);

  
  const fetchMotoristas = async () => {
    try {
      const response = await apiLocal.getMotoristas();
      setMotoristas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar motoristas.");
      
    }
  };
  const fetchDestinos = async () => {
    try {
      const response = await apiLocal.getDestinos();
      setDestinos(response.data);
    } catch (error) {
      toast.error("Erro ao buscar destinos.");
      
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

  const fetchTiposOcorrencia = async () => {
    try {
      const response = await apiLocal.getNomesOcorrencias();
      setTiposOcorrencia(response.data);
    } catch (error) {
      toast.error("Erro ao buscar tipos de ocorrência.");
      
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
        // Chamada da API para buscar as notas fiscais
        const response = await fetchNotaFiscal(ocorrencia.nf.trim());
  
        // Verifica se a resposta da API é um array válido
        if (!response || !Array.isArray(response)) {
          throw new Error("Resposta inválida da API.");
        }
  
        // Filtra apenas notas que possuem NF válido e correspondem ao número digitado
        const dados = response.filter((n) => {
          if (!n.NF || isNaN(n.NF)) {
            return false;
          }
          return n.NF.toString().trim() === ocorrencia.nf.trim();
        });
  
  
        if (dados.length === 1) {
          const data = dados[0];
          setClienteNome(data.remetente);
          setOcorrencia((prev) => ({
            ...prev,
            cliente_id: data.remetente,
            destino_id: data.destinatario,
            cidade: data.destino,
          }));
        } else if (dados.length > 1) {
          setClientesDuplicados(dados);
          setModal(true);
        } else {
          toast.warning(`Nenhuma informação encontrada para a NF: ${ocorrencia.nf.trim()}.`);
        }
      } catch (error) {
        toast.error("Erro ao buscar informações da nota fiscal na API externa.");
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
    console.log("Payload enviado para o backend:", ocorrencia);
    if (!clienteNome || !ocorrencia.nf || !ocorrencia.motorista_id || !ocorrencia.tipoocorrencia_id || !ocorrencia.horario_chegada) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
  
    setIsLoading(true); // Inicia o estado de carregamento
  
    try {
      let clienteID, destinoID;
  
      const clienteExistente = clientes.find(
        (cliente) => cliente.nome && cliente.nome === clienteNome
      );
  
      if (!clienteExistente) {
        const novoCliente = { nome: clienteNome };
        const responseCliente = await apiLocal.createOrUpdateCliente(novoCliente);
  
        if (responseCliente.data && responseCliente.data.data) {
          clienteID = responseCliente.data.data.id;
          toast.success("Cliente cadastrado automaticamente.");
        } else {
          throw new Error(responseCliente.data?.error || "Erro ao cadastrar cliente.");
        }
      } else {
        clienteID = clienteExistente.id;
      }
  
      const destinoExistente = destinos.find(
        (destino) =>
          destino.nome?.trim() === (ocorrencia.destino_id || "").trim() &&
          destino.cidade?.trim() === (ocorrencia.cidade || "").trim()
      );
  
      if (!destinoExistente) {
        const novoDestino = {
          nome: ocorrencia.destino_id || "",
          endereco: null,
          cidade: ocorrencia.cidade || "",
        };
        const responseDestino = await apiLocal.createOrUpdateDestino(novoDestino);
  
        if (responseDestino.data && responseDestino.data.data) {
          destinoID = responseDestino.data.data.id;
          toast.success("Destinatário cadastrado automaticamente.");
        } else {
          throw new Error(responseDestino.data?.error || "Erro ao cadastrar destinatário.");
        }
      } else {
        destinoID = destinoExistente.id;
      }
  
      const adjustedHorarioChegada = new Date(ocorrencia.horario_chegada);
      adjustedHorarioChegada.setHours(adjustedHorarioChegada.getHours() - 3);
      const formattedHorarioChegada = adjustedHorarioChegada.toISOString();
  
      const ocorrenciaFormatada = {
        ...ocorrencia,
        cliente_id: clienteID,
        destino_id: destinoID,
        tipoocorrencia_id: parseInt(ocorrencia.tipoocorrencia_id, 10),
        endereco: null,
        horario_chegada: formattedHorarioChegada,
        horario_saida: ocorrencia.horario_saida || null,
        obs: ocorrencia.obs || null,
        cobranca_adicional: ocorrencia.cobranca_adicional || "N",
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
      toast.error(error.message || "Erro ao lançar a ocorrência.");
    } finally {
      setIsLoading(false); // Finaliza o estado de carregamento
    }
  };
  
  
  
  
  useEffect(() => {
    if (clientesDuplicados.length > 1) {
      setModal(true);
    }
  }, [clientesDuplicados]);
  
  
  
  

  
  
  
  

  return (
    <Container>
      <Title>Lançar Ocorrência</Title>
      <StyledForm onSubmit={handleSave}>
      
      <FormGroup>
  <Label>
    <FaFileInvoice /> Nota Fiscal
  </Label>
  <div style={{ position: "relative" }}>
    <Input
      type="text"
      name="nf"
      value={ocorrencia.nf}
      onChange={handleNotaFiscalChange}
      onKeyDown={handleKeyDown}
      placeholder="Informe a nota fiscal"
      style={{ paddingRight: "30px" }} // Espaço extra para o ícone
    />
    {loadingNota && (
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          pointerEvents: "none", // Evita interferir na interação do input
        }}
      >
        <LoadingDots />
      </div>
    )}
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
        <SubmitButton type="submit" disabled={isLoading}>
  {isLoading ? <LoadingDots /> : "Adicionar Ocorrência"}
</SubmitButton>
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
          Cliente: {cliente.remetente} | Destinatário: {cliente.destinatario} | Cidade: {cliente.destino}
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
