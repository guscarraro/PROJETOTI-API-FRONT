import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormGroup,
  Label,
  Select,
} from "reactstrap";
import { toast } from "react-toastify";
import { FaCheckCircle, FaEye, FaExclamationTriangle } from "react-icons/fa";
import apiLocal from "../../../services/apiLocal";
import { Container, ContainerCards } from "./styles";

const OcorrenAbertas = () => {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [clientes, setClientes] = useState({});
  const [motoristas, setMotoristas] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState(null);
  const [horarioSaida, setHorarioSaida] = useState("");
  const [cobrancaAdicional, setCobrancaAdicional] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const ocorrenciasResponse = await apiLocal.getOcorrencias();
      const abertas = ocorrenciasResponse.data.filter(
        (ocorrencia) => ocorrencia.status === "Pendente"
      );

      const clientesResponse = await apiLocal.getClientes();
      const motoristasResponse = await apiLocal.getMotoristas();

      const clientesMap = {};
      clientesResponse.data.forEach((cliente) => {
        clientesMap[cliente.id] = cliente.nome;
      });

      const motoristasMap = {};
      motoristasResponse.data.forEach((motorista) => {
        motoristasMap[motorista.id] = motorista.nome;
      });

      setOcorrencias(abertas);
      setClientes(clientesMap);
      setMotoristas(motoristasMap);
    } catch (error) {
      toast.error("Erro ao buscar dados.");
      console.error(error);
    }
  };

  const calculateCardStyle = (horarioChegada) => {
    const now = new Date();
    const chegada = new Date(horarioChegada);
    const diffMinutes = Math.floor((now - chegada) / 60000);

    if (diffMinutes <= 20)
      return {
        backgroundColor: "rgba(0, 255, 127, 0.35)",
        icon: <FaCheckCircle style={styles.greenIcon} />,
      };
    if (diffMinutes <= 40)
      return {
        backgroundColor: "rgba(255, 215, 0, 0.35)",
        icon: <FaEye style={styles.yellowIcon} />,
      };
    if (diffMinutes <= 60)
      return {
        backgroundColor: "rgba(255, 165, 0, 0.35)",
        icon: <FaExclamationTriangle style={styles.orangeIcon} />,
      };
    return {
      backgroundColor: "rgba(255, 69, 0, 0.35)",
      icon: <FaExclamationTriangle style={styles.redIcon} />,
    };
  };

  const filteredOcorrencias = ocorrencias.filter((occ) => {
    const nomeMotorista = motoristas[occ.motorista_id] || "";
    const nomeCliente = clientes[occ.cliente_id] || "";
    const nf = occ.nf?.toString() || "";

    const termo = searchTerm.toLowerCase();
    return (
      nomeMotorista.toLowerCase().includes(termo) ||
      nomeCliente.toLowerCase().includes(termo) ||
      nf.toLowerCase().includes(termo)
    );
  });

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    setHorarioSaida("");
    setCobrancaAdicional("");
  };

  const toggleObsModal = () => {
    setObsModalOpen(!obsModalOpen);
  };

  const handleCardClick = (ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    toggleObsModal();
  };

  const handleEncerrar = (ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    toggleModal();
  };

  const handleStatusUpdate = async (status) => {
    if (!horarioSaida) {
      toast.error("Por favor, insira a data e hora de encerramento.");
      return;
    }

    if (!cobrancaAdicional) {
      toast.error("Por favor, selecione se houve cobrança adicional.");
      return;
    }

    const horarioSaidaDate = new Date(horarioSaida);
    const horarioChegadaDate = new Date(selectedOcorrencia.horario_chegada);

    if (horarioSaidaDate < horarioChegadaDate) {
      toast.error("A data e hora de saída não podem ser menores que a de chegada.");
      return;
    }

    try {
      await apiLocal.createOrUpdateOcorrencia({
        ...selectedOcorrencia,
        status,
        horario_saida: horarioSaida,
        cobranca_adicional: cobrancaAdicional,
      });
      toast.success(`Ocorrência marcada como "${status}" com sucesso!`);
      toggleModal();
      fetchData();
    } catch (error) {
      toast.error("Erro ao atualizar status da ocorrência.");
      console.error(error);
    }
  };

  return (
    <Container>
      <div style={{ marginBottom: 20, marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <Label style={{ color: "#fff", margin: 0 }}>Filtrar:</Label>
        <Input
          type="text"
          placeholder="Motorista, Cliente ou NF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
      </div>

      <ContainerCards style={styles.cardContainer}>
        {filteredOcorrencias.map((ocorrencia) => {
          const { backgroundColor, icon } = calculateCardStyle(ocorrencia.horario_chegada);
          return (
            <Card
              key={ocorrencia.id}
              style={{ ...styles.card, backgroundColor, color: "#fff", minHeight: "280px" }}
              onClick={() => handleCardClick(ocorrencia)}
            >
              <CardBody
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardTitle tag="h5">
                  {icon} Nota Fiscal: {ocorrencia.nf}
                </CardTitle>
                <CardText>
                  Motorista: <strong>{motoristas[ocorrencia.motorista_id] || "Desconhecido"}</strong>
                </CardText>
                <CardText>
                  Hora de Chegada: <strong>{new Date(ocorrencia.horario_chegada).toLocaleString()}</strong>
                </CardText>
                <CardText>
                  Cliente: <strong>{clientes[ocorrencia.cliente_id] || "Desconhecido"}</strong>
                </CardText>
                <Button
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEncerrar(ocorrencia);
                  }}
                >
                  Encerrar
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </ContainerCards>

      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Encerrar Ocorrência</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="horario_saida">Data e Hora de Saída</Label>
            <Input
              type="datetime-local"
              id="horario_saida"
              value={horarioSaida}
              onChange={(e) => setHorarioSaida(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="cobranca_adicional">Cobrança Adicional</Label>
            <Input
              type="select"
              id="cobranca_adicional"
              value={cobrancaAdicional}
              onChange={(e) => setCobrancaAdicional(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="S">Sim</option>
              <option value="N">Não</option>
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
        <Label>A nota foi entregue com sucesso?</Label>
          <Button color="success" onClick={() => handleStatusUpdate("Resolvido")}>Sim</Button>
          <Button color="danger" onClick={() => handleStatusUpdate("Não entregue")}>Não</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={obsModalOpen} toggle={toggleObsModal}>
        <ModalHeader toggle={toggleObsModal}>Observações da Ocorrência</ModalHeader>
        <ModalBody>
          {selectedOcorrencia?.obs ? selectedOcorrencia.obs : "Nenhuma observação foi adicionada."}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleObsModal}>Fechar</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

const styles = {
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
  },
  greenIcon: { color: "rgba(0, 255, 127, 0.8)", marginRight: "8px" },
  yellowIcon: { color: "rgba(255, 215, 0, 0.8)", marginRight: "8px" },
  orangeIcon: { color: "rgba(255, 165, 0, 0.8)", marginRight: "8px" },
  redIcon: { color: "rgba(255, 69, 0, 0.8)", marginRight: "8px" },
};

export default OcorrenAbertas;
