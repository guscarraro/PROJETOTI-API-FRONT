import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Container,
  Title,
  StyledForm,
  FormGroup,
  Label,
  Input,
  SubmitButton,
} from "./style";
import { FaUser, FaBuilding, FaFileInvoice, FaStickyNote, FaCalendarAlt } from "react-icons/fa";
import apiLocal from "../../../services/apiLocal";
import LoadingDots from "../../../components/Loading";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const LancarSTH = ({ onActionComplete }) => {
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [sth, setSTH] = useState({
    nf: "",
    cliente_id: "",
    destino_id: "",
    motorista_id: "",
    motivo: "",
    nf_sth: "",
    data_viagem: "",
    cidade: "",
  });
  const [clienteNome, setClienteNome] = useState("");
  const [destinoNome, setDestinoNome] = useState("");
  const [loadingNota, setLoadingNota] = useState(false);
  const [modal, setModal] = useState(false);
  const [clientesDuplicados, setClientesDuplicados] = useState([]);

  useEffect(() => {
    fetchMotoristas();
    fetchClientes();
    fetchDestinos();
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

  const fetchDestinos = async () => {
    try {
      const response = await apiLocal.getDestinos();
      setDestinos(response.data);
    } catch (error) {
      toast.error("Erro ao buscar destinos.");
      console.error(error);
    }
  };

  const fetchMotoristas = async () => {
    try {
      const response = await apiLocal.getMotoristas();
      setMotoristas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar motoristas.");
      console.error(error);
    }
  };

  const handleNotaFiscalChange = (e) => {
    const nf = e.target.value;
    setSTH({ ...sth, nf });
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Tab" && sth.nf) {
      setLoadingNota(true);
      try {
        const response = await apiLocal.getDadosNota(sth.nf);
        const dados = response?.data?.dados || [];
  
        // Filtra as notas que contêm a NF digitada
        const notasFiltradas = dados.filter((item) =>
          item.NF.split(",").map((nf) => nf.trim()).includes(sth.nf)
        );
  
        if (notasFiltradas.length === 1) {
          const data = notasFiltradas[0];
          const cliente = clientes.find((c) => c.nome === data.remetente);
          const destino = destinos.find(
            (d) => d.nome === data.destinatario && d.cidade === data.destino
          );
  
          setClienteNome(data.remetente);
          setDestinoNome(data.destinatario);
          setSTH((prev) => ({
            ...prev,
            cliente_id: cliente ? cliente.id : "", // Use o ID real
            destino_id: destino ? destino.id : "", // Use o ID real
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
    const clienteData = clientes.find((c) => c.nome === cliente.remetente);
    const destinoData = destinos.find(
      (d) => d.nome === cliente.destinatario && d.cidade === cliente.destino
    );
  
    setClienteNome(cliente.remetente);
    setDestinoNome(cliente.destinatario);
    setSTH((prev) => ({
      ...prev,
      cliente_id: clienteData ? clienteData.id : "", // Use o ID real
      destino_id: destinoData ? destinoData.id : "", // Use o ID real
      cidade: cliente.destino,
    }));
    setModal(false); // Fecha o modal após a seleção
  };
  
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSTH({ ...sth, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { nf, cliente_id, destino_id, motorista_id, motivo, nf_sth, data_viagem, cidade } = sth;
      if (!nf || !cliente_id || !destino_id || !motorista_id || !motivo || !nf_sth || !data_viagem) {
        toast.error("Todos os campos são obrigatórios.");
        return;
      }
  
      const payload = {
        nf: sth.nf,
        cliente_id: Number(sth.cliente_id), // Converta para número
        destino_id: Number(sth.destino_id), // Converta para número
        motorista_id: Number(sth.motorista_id),
        motivo: sth.motivo,
        nf_sth: sth.nf_sth,
        data_viagem: sth.data_viagem,
        cidade: sth.cidade,
      };
  
      console.log("Payload enviado ao backend:", payload);
  
      const response = await apiLocal.createOrUpdateOcorrenciaSTH(payload);
      if (response.data) {
        toast.success("Ocorrência STH registrada com sucesso!");
        setSTH({
          nf: "",
          cliente_id: "",
          destino_id: "",
          motorista_id: "",
          motivo: "",
          nf_sth: "",
          data_viagem: "",
          cidade: "",
        });
        setClienteNome("");
        setDestinoNome("");
        if (onActionComplete) onActionComplete("Ocorrência STH registrada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao registrar a ocorrência STH:", error.response?.data || error.message);
      if (error.response?.data?.detail) {
        console.error("Detalhes do erro:", error.response.data.detail);
      }
      toast.error(error.response?.data?.detail || "Erro ao registrar a ocorrência STH.");
    }
  };
  

  return (
    <Container>
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

      <Title>Lançar Ocorrência STH</Title>
      <StyledForm onSubmit={handleSave}>
        <FormGroup>
          <Label>
            <FaFileInvoice /> Nota Fiscal que Gerou Atraso
          </Label>
          <div style={{ position: "relative" }}>
            <Input
              type="text"
              name="nf"
              value={sth.nf}
              onChange={handleNotaFiscalChange}
              onKeyDown={handleKeyDown}
              placeholder="Informe a Nota Fiscal"
              style={{ paddingRight: "30px" }}
            />
            {loadingNota && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
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
          <Input type="text" value={clienteNome} readOnly placeholder="Cliente carregado automaticamente" />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaBuilding /> Destino
          </Label>
          <Input type="text" value={destinoNome} readOnly placeholder="Destino carregado automaticamente" />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaBuilding /> Cidade
          </Label>
          <Input type="text" name="cidade" value={sth.cidade} readOnly placeholder="Cidade carregada automaticamente" />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaUser /> Motorista
          </Label>
          <select
            name="motorista_id"
            value={sth.motorista_id}
            onChange={handleInputChange}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", width:'250px', fontSize:'14px'}}
          >
            <option value="">Selecione um motorista</option>
            {motoristas.map((motorista) => (
              <option key={motorista.id} value={motorista.id}>
                {motorista.nome} - {motorista.placa}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <Label>
            <FaStickyNote /> Motivo
          </Label>
          <Input
            type="text"
            name="motivo"
            value={sth.motivo}
            onChange={handleInputChange}
            placeholder="Informe o motivo"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaFileInvoice /> Nota Fiscal STH
          </Label>
          <Input
            type="text"
            name="nf_sth"
            value={sth.nf_sth}
            onChange={handleInputChange}
            placeholder="Informe a Nota Fiscal STH"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaCalendarAlt /> Data da Viagem
          </Label>
          <Input
            type="date"
            name="data_viagem"
            value={sth.data_viagem}
            onChange={handleInputChange}
          />
        </FormGroup>

        <SubmitButton type="submit">Adicionar Ocorrência STH</SubmitButton>
      </StyledForm>
    </Container>
  );
};

export default LancarSTH;
