import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiLocal from "../../../services/apiLocal";
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
  FaRoad,
} from "react-icons/fa";

const LancarOcorren = ({ onActionComplete }) => {
  const [motoristas, setMotoristas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
  const [ocorrencia, setOcorrencia] = useState({
    nf: "",
    cliente_id: "",
    motorista_id: "",
    destino_id: "",
    endereco: "",
    cidade: "",
    horario_chegada: "",
    tipoocorrencia_id: "",
    obs: "",
    status: "Pendente",
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOcorrencia({ ...ocorrencia, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
  
    try {
      if (
        !ocorrencia.nf ||
        !ocorrencia.cliente_id ||
        !ocorrencia.motorista_id ||
        !ocorrencia.tipoocorrencia_id ||
        !ocorrencia.horario_chegada ||
        !ocorrencia.destino_id ||
        !ocorrencia.endereco ||
        !ocorrencia.cidade
      ) {
        toast.error("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
  
      const ocorrenciaFormatada = {
        ...ocorrencia,
        destino_id: parseInt(ocorrencia.destino_id, 10),
        tipoocorrencia_id: parseInt(ocorrencia.tipoocorrencia_id, 10),
        status: "Pendente",
      };
  
      await apiLocal.createOrUpdateOcorrencia(ocorrenciaFormatada);
  
      // Reseta o formulário
      setOcorrencia({
        nf: "",
        cliente_id: "",
        motorista_id: "",
        destino_id: "",
        endereco: "",
        cidade: "",
        horario_chegada: "",
        tipoocorrencia_id: "",
        obs: "",
        status: "Pendente",
      });
  
      // Envia mensagem ao componente pai
      if (onActionComplete) {
        onActionComplete("Ocorrência lançada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar a ocorrência:", error);
      toast.error("Erro ao lançar a ocorrência.");
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
          <Input
            type="text"
            name="nf"
            value={ocorrencia.nf}
            onChange={handleInputChange}
            placeholder="Nota Fiscal"
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaUser /> Cliente
          </Label>
          <Select
            name="cliente_id"
            value={ocorrencia.cliente_id}
            onChange={handleInputChange}
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </Select>
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
            <FaBuilding /> Destinatário
          </Label>
          <Input
            type="text"
            name="destino_id"
            value={ocorrencia.destino_id}
            onChange={handleInputChange}
            placeholder="Destinatário"
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaRoad /> Endereço
          </Label>
          <Input
            type="text"
            name="endereco"
            value={ocorrencia.endereco}
            onChange={handleInputChange}
            placeholder="Endereço"
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
            onChange={handleInputChange}
            placeholder="Cidade"
          />
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
            <FaFileInvoice /> Descrição (opcional)
          </Label>
          <TextArea
            name="obs"
            value={ocorrencia.obs}
            onChange={handleInputChange}
            placeholder="Descrição"
          />
        </FormGroup>
        <SubmitButton type="submit">Adicionar Ocorrência</SubmitButton>
      </StyledForm>
    </Container>
  );
};

export default LancarOcorren;
