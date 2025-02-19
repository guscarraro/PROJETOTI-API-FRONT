import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaEye, FaExclamationTriangle } from "react-icons/fa";
import apiLocal from "../../../../services/apiLocal";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";

const InfoOcorren = ({ ocorrencias }) => {
  const [clientes, setClientes] = useState({});
  const [motoristas, setMotoristas] = useState({});
  const [tipoocorrencia, setTipoocorrencia] = useState({});

  useEffect(() => {
    fetchAdditionalData();
  }, []);

  const fetchAdditionalData = async () => {
    try {
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
      setTipoocorrencia(tpOcorrenciaMap)

      setClientes(clientesMap);
      setMotoristas(motoristasMap);
    } catch (error) {
      console.error("Erro ao buscar dados de clientes e motoristas", error);
    }
  };

  const calculateCardStyle = (horarioChegada) => {
    const now = new Date();
    const chegada = new Date(horarioChegada);
    const diffMinutes = Math.floor((now - chegada) / 60000);

    if (diffMinutes <= 20)
      return { backgroundColor: "rgba(0, 255, 127, 0.35)", border: "2px solid green", message: "Aberto dentro de 20 min", icon: <FaCheckCircle style={{ color: "green" }} /> };
    if (diffMinutes <= 40)
      return { backgroundColor: "rgba(255, 215, 0, 0.35)", border: "2px solid yellow", message: "Aberto dentro de 40 min", icon: <FaEye style={{ color: "yellow" }} /> };
    if (diffMinutes <= 60)
      return { backgroundColor: "rgba(255, 165, 0, 0.35)", border: "2px solid orange", message: "Aberto dentro de 60 min", icon: <FaExclamationTriangle style={{ color: "orange" }} /> };

    return { backgroundColor: "rgba(255, 69, 0, 0.35)", border: "2px solid #FF4500", message: "Aberto há mais de 1 hora", icon: <FaExclamationTriangle style={{ color: "#FF4500" }} /> };
  };

  // Ordenando as ocorrências da mais antiga para a mais recente
  const sortedOcorrencias = [...ocorrencias].sort((a, b) => new Date(a.datainclusao) - new Date(b.datainclusao));

  return (
    <>
      <h1>Ocorrências em Aberto</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        {sortedOcorrencias.map((ocorrencia) => {
          const { backgroundColor, border, message, icon } = calculateCardStyle(ocorrencia.datainclusao);
          return (
            <Card key={ocorrencia.id} style={{ backgroundColor, border, width: "300px", padding: "10px", color: "#fff" }}>
              <CardBody style={{display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                <CardTitle tag="h5">
                                  {icon} Nota Fiscal: {ocorrencia.nf}
                                </CardTitle>
                <CardText>Cliente: <strong>{clientes[ocorrencia.cliente_id] || "Desconhecido"}</strong></CardText>
                <CardText>Motorista: <strong>{motoristas[ocorrencia.motorista_id] || "Desconhecido"}</strong></CardText>
                <CardText>
                                  Tipo de ocorrencia: <strong>{tipoocorrencia[ocorrencia.tipoocorrencia_id] || "Desconhecido"}</strong>
                                </CardText>
                                <CardText>
                                  Hora de Chegada: <strong>{new Date(ocorrencia.horario_chegada).toLocaleTimeString()}</strong>
                                </CardText>
                <CardText>Ocorrência aberta: <strong>{new Date(ocorrencia.datainclusao).toLocaleTimeString()}</strong></CardText>
                <CardText style={{ fontStyle: "italic", fontWeight: "bold" }}>{message}</CardText>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default InfoOcorren;
