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
import { fetchNotaFiscal } from "../../../services/api";

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
  const [isLoading, setIsLoading] = useState(false);

  const motivos = [
    "DEMORA NA DESCARGA",
    "DEMORA NA CONFERENCIA",
    "NOTA SEM AGENDAMENTO",
    "DEMORA NO CARREGAMENTO",
    "DEMORA SAIDA BASE",
    "AGENDAMENTO DIVERGENTE",
    "ATRASO DO MOTORISTA",
    "MOROSIDADE OPERACAO CARRARO",
    "FALTA DE VEICULOS",
    "ATRASO NA ROTEIRIZACAO",
    "TRANSITO",
    "FALHA MECACNIA",
    "LONGA DISTANCIA ENTRE DESTINOS",
    "EXCESSO DE ENTREGAS",
    "HORARIO DE RECEBIMENTO ENCERRADO",
    "ENDERECO DIVERGENTE",
    "FALTA BOLETO",
    "FALTA DE ESPACO NO CLIENTE",
    "FALTA PRODUTO - RESSALVA",
    "LOCAL NAO ENCONTRADO",
    "MERCADORIA INVERTIDA",
    "NOTA PENDENTE - RESSALVA",
    "NOTA SEM BOLETO",
    "PROBLEMA FISCAL",
    "PRODUTO NAO CADASTRADO",
    "RECEBIMENTO ENCERRADO",
    "RESSALVA",
    "RESSALVA - CLIENTE SEM SISTEMA",
    "SEM PEDIDO",
    "SEM RETORNO DA ATENDENTE",
    "VALOR DIVERGENTE"
  ];
  
  
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
        const response = await fetchNotaFiscal(sth.nf.trim());
  
        if (!response || !Array.isArray(response)) {
          throw new Error("Resposta inválida da API.");
        }
  
        const dados = response.filter((n) => {
          if (!n.NF || isNaN(n.NF)) {
            return false;
          }
          return n.NF.toString().trim() === sth.nf.trim();
        });
  
        if (dados.length === 1) {
          const data = dados[0];
          setClienteNome(data.remetente);
          setDestinoNome(data.destinatario);
          setSTH((prev) => ({
            ...prev,
            cidade: data.destino,
          }));
        } else if (dados.length > 1) {
          setClientesDuplicados(dados);
          setModal(true);
        } else {
          toast.warning(`Nenhuma informação encontrada para a NF: ${sth.nf.trim()}.`);
        }
      } catch (error) {
        toast.error("Erro ao buscar informações da nota fiscal na API externa.");
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
    setIsLoading(true); 
    try {
      const { nf, motorista_id, motivo, nf_sth, data_viagem, cidade } = sth;
  
      // Validação dos campos obrigatórios
      if (!nf.trim()) {
        toast.error("A Nota Fiscal é obrigatória.");
        return;
      }
      if (!clienteNome.trim()) {
        toast.error("O Cliente é obrigatório.");
        return;
      }
      if (!destinoNome.trim()) {
        toast.error("O Destino é obrigatório.");
        return;
      }
      if (!motorista_id) {
        toast.error("O Motorista é obrigatório.");
        return;
      }
      if (!motivo.trim()) {
        toast.error("O Motivo é obrigatório.");
        return;
      }
      if (!nf_sth.trim()) {
        toast.error("A Nota Fiscal STH é obrigatória.");
        return;
      }
      if (!data_viagem) {
        toast.error("A Data da Viagem é obrigatória.");
        return;
      }
  
      let clienteID = sth.cliente_id;
      let destinoID = sth.destino_id;
  
      // Criação do cliente e destino de forma encadeada
      try {
        // Criação do cliente, se necessário
        if (!clienteID) {
          const clienteExistente = clientes.find((cliente) => cliente.nome === clienteNome);
          if (!clienteExistente) {
            const responseCliente = await apiLocal.createOrUpdateCliente({ nome: clienteNome });
            clienteID = responseCliente.data.data.id;
            setClientes((prev) => [...prev, responseCliente.data.data]);
            toast.success("Cliente cadastrado automaticamente.");
          } else {
            clienteID = clienteExistente.id;
          }
        }
  
        // Criação do destino, se necessário
        if (!destinoID) {
          const destinoExistente = destinos.find(
            (destino) => destino.nome === destinoNome && destino.cidade === cidade
          );
          if (!destinoExistente) {
            const responseDestino = await apiLocal.createOrUpdateDestino({
              nome: destinoNome,
              endereco: null,
              cidade,
            });
            destinoID = responseDestino.data.data.id;
            setDestinos((prev) => [...prev, responseDestino.data.data]);
            toast.success("Destinatário cadastrado automaticamente.");
          } else {
            destinoID = destinoExistente.id;
          }
        }
      } catch (creationError) {
        console.error("Erro ao criar cliente ou destino:", creationError);
        toast.error("Erro ao processar cliente ou destino.");
        return; // Não continua sem os IDs
      }
  
      // Garante que os IDs sejam definidos antes de enviar o payload
      if (!clienteID || !destinoID) {
        toast.error("Erro ao processar o cliente ou destino. Por favor, tente novamente.");
        return;
      }
  
      // Envia o payload ao backend
      const payload = {
        nf: nf.trim(),
        cliente_id: clienteID,
        destino_id: destinoID,
        motorista_id: Number(motorista_id),
        motivo: motivo.trim(),
        nf_sth: nf_sth.trim(),
        data_viagem,
        cidade: cidade.trim(),
      };
  
  
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
      toast.error(error.response?.data?.detail || "Erro ao registrar a ocorrência STH.");
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

      <Title>Lançar Ocorrência STH</Title>
      <StyledForm onSubmit={handleSave}>
        <FormGroup>
          <Label>
            <FaFileInvoice /> NF que Gerou Atraso
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
            <FaUser /> Motivo
          </Label>
          <select
  name="motivo"
  value={sth.motivo}
  onChange={handleInputChange}
  style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", width: '250px', fontSize: '14px' }}
>
  <option value="">Selecione um motivo</option>
  {motivos.map((mot, index) => (
    <option key={index} value={mot}>
      {mot}
    </option>
  ))}
</select>

        </FormGroup>

        <FormGroup>
          <Label>
            <FaFileInvoice /> NF(S) STH Impactada(s)
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

        <SubmitButton type="submit" disabled={isLoading}>
  {isLoading ? <LoadingDots /> : "Adicionar Ocorrência STH"}
</SubmitButton>
      </StyledForm>
    </Container>
  );
};

export default LancarSTH;
