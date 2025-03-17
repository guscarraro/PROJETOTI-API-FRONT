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
  CardFooter,
} from "reactstrap";
import { toast } from "react-toastify";
import { FaCheckCircle, FaEye, FaExclamationTriangle } from "react-icons/fa";
import apiLocal from "../../../services/apiLocal";
import { Container, ContainerCards } from "./styles";
import LoadingDots from "../../../components/Loading";

const OcorrenAbertas = () => {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [clientes, setClientes] = useState({});
  const [motoristas, setMotoristas] = useState({});
  const [tipoocorrencia, setTipoocorrencia] = useState({});
  const [cteValue, setCteValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState(null);
  const [horarioSaida, setHorarioSaida] = useState("");
  const [cobrancaAdicional, setCobrancaAdicional] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const ocorrenciasResponse = await apiLocal.getOcorrenciasPendentes();
      const abertas = ocorrenciasResponse.data;
      
      abertas.sort((a, b) => new Date(a.datainclusao) - new Date(b.datainclusao));


      const clientesResponse = await apiLocal.getClientes();
      const motoristasResponse = await apiLocal.getMotoristas();
      const tpOcorrenciaResponse = await apiLocal.getNomesOcorrencias();

      const clientesMap = {};
      clientesResponse.data.forEach((cliente) => {
        clientesMap[cliente.id] = cliente.nome;
      });

      const motoristasMap = {};
      motoristasResponse.data.forEach((motorista) => {
        motoristasMap[motorista.id] = motorista.nome;
      });
      const tpOcorrenciaMap = {};
      tpOcorrenciaResponse.data.forEach((tpocorren) => {
        tpOcorrenciaMap[tpocorren.id] = tpocorren.nome;
      });
      setOcorrencias(abertas);
      setTipoocorrencia(tpOcorrenciaMap)
      setClientes(clientesMap);
      setMotoristas(motoristasMap);
    } catch (error) {
      toast.error("Erro ao buscar dados.");
      console.error(error);
    }finally{
      setIsLoading(false)
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
  const updateCteGerado = async (nf, cteValue) => {
    try {
      if (!cteValue.trim()) {
        throw new Error("O número do CTE é obrigatório para cobrança adicional.");
      }
  
      const payload = { nf, cte_gerado: cteValue, cobranca_adicional: "S" }; // Atualiza também o cobranca_adicional para 'S'
      const response = await apiLocal.updateCobrancaAdicional(payload);
  
      if (response.status === 200) {
        toast.success("CTE e cobrança adicional atualizados com sucesso!");
      } else {
        throw new Error("Erro ao atualizar CTE e cobrança adicional.");
      }
    } catch (error) {
      console.error("Erro ao atualizar CTE e cobrança adicional:", error);
      toast.error("Erro ao atualizar CTE e cobrança adicional. Verifique os dados e tente novamente.");
    }
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
  
    if (cobrancaAdicional === "S" && !cteValue.trim()) {
      toast.error("O número do CTE é obrigatório para cobrança adicional.");
      return;
    }
  
    const horarioChegadaDate = new Date(selectedOcorrencia.horario_chegada);
    const horarioSaidaDate = new Date(horarioSaida);
    const horarioOcorrenciaDate = new Date(selectedOcorrencia.datainclusao);
  
    if (horarioSaida < horarioChegadaDate) {
      toast.error(`A data e hora de saída não podem ser menores que a de chegada: ${horarioSaidaDate}.`);
      return;
    }
  
    try {
      await apiLocal.updateOcorrenciaStatus({
        id: selectedOcorrencia.id,
        status,
        horario_saida: horarioSaida,
        cobranca_adicional: cobrancaAdicional,
        cte_gerado: cteValue || null,
      });
      
  
      // Atualiza o campo cte_gerado separadamente se necessário
      if (cobrancaAdicional === "S" && cteValue.trim()) {
        await updateCteGerado(selectedOcorrencia.nf, cteValue);
      }
  
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

      {isLoading ? <LoadingDots style={{marginTop:500}}/> :
      <>
      <ContainerCards style={styles.cardContainer}>
        {filteredOcorrencias.map((ocorrencia) => {
          const { backgroundColor, icon } = calculateCardStyle(ocorrencia.datainclusao);
          return (
            <Card
            key={ocorrencia.id}
            style={{ ...styles.card, backgroundColor, color: "#fff", minHeight: "400px" }}
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
                  Tipo de ocorrencia: <strong>{tipoocorrencia[ocorrencia.tipoocorrencia_id] || "Desconhecido"}</strong>
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
              <CardFooter>
              <CardText>
                  Hora abertura da ocorrência: <strong>{new Date(ocorrencia.datainclusao).toLocaleString()}</strong>
                </CardText>
              </CardFooter>
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
  {cobrancaAdicional === "S" && (
    <FormGroup>
      <Label for="cte_value">Número do CTE</Label>
      <Input
        type="text"
        id="cte_value"
        value={cteValue}
        onChange={(e) => setCteValue(e.target.value)}
        placeholder="Informe o número do CTE"
        />
    </FormGroup>
  )}
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
      </>}
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
