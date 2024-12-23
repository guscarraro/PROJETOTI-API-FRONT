import React, { useEffect, useState } from "react";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import apiLocal from "../../../services/apiLocal";

const LancarOcorren = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ocorrencia, setOcorrencia] = useState({
    nf: "",
    cliente_id: "",
    motorista_id: "",
    destino_id: "",
    endereco: "",
    cidade: "",
    horario_chegada: "",
    obs: "",
  });

  useEffect(() => {
    fetchMotoristas();
    fetchClientes();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOcorrencia({ ...ocorrencia, [name]: value });
  };

  const handleSave = async () => {
    try {
      await apiLocal.createOrUpdateOcorrencia(ocorrencia);
      toast.success("Ocorrência lançada com sucesso!");
      setOcorrencia({
        nf: "",
        cliente_id: "",
        motorista_id: "",
        destino_id: "",
        endereco: "",
        cidade: "",
        horario_chegada: "",
        obs: "",
      });
    } catch (error) {
      toast.error("Erro ao lançar a ocorrência.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Lançar Ocorrência</h2>
      <Form>
        <FormGroup>
          <Label for="nf">Nota Fiscal</Label>
          <Input
            type="text"
            id="nf"
            name="nf"
            value={ocorrencia.nf}
            onChange={handleInputChange}
            placeholder="Nota Fiscal"
          />
        </FormGroup>
        <FormGroup>
          <Label for="cliente_id">Cliente</Label>
          <Input
            type="select"
            id="cliente_id"
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
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="motorista_id">Motorista</Label>
          <Input
            type="select"
            id="motorista_id"
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
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="destino_id">Destinatário</Label>
          <Input
            type="text"
            id="destino_id"
            name="destino_id"
            value={ocorrencia.destino_id}
            onChange={handleInputChange}
            placeholder="Destinatário"
          />
        </FormGroup>
        <FormGroup>
          <Label for="endereco">Endereço</Label>
          <Input
            type="text"
            id="endereco"
            name="endereco"
            value={ocorrencia.endereco}
            onChange={handleInputChange}
            placeholder="Endereço"
          />
        </FormGroup>
        <FormGroup>
          <Label for="cidade">Cidade</Label>
          <Input
            type="text"
            id="cidade"
            name="cidade"
            value={ocorrencia.cidade}
            onChange={handleInputChange}
            placeholder="Cidade"
          />
        </FormGroup>
        <FormGroup>
          <Label for="horario_chegada">Data e Hora de Chegada</Label>
          <Input
            type="datetime-local"
            id="horario_chegada"
            name="horario_chegada"
            value={ocorrencia.horario_chegada}
            onChange={handleInputChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="obs">Descrição</Label>
          <Input
            type="textarea"
            id="obs"
            name="obs"
            value={ocorrencia.obs}
            onChange={handleInputChange}
            placeholder="Descrição"
          />
        </FormGroup>
        <Button color="primary" onClick={handleSave}>
          Adicionar Ocorrência
        </Button>
      </Form>
      <ToastContainer />
    </div>
  );
};

export default LancarOcorren;
