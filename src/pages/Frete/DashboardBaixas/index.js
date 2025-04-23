import React, { useEffect, useState } from "react";
import { Row, Col, Button } from "reactstrap";
import ChartPizzaTipoColaborador from "./ChartPizzaTipoColaborador";
import ChartEscadaDuplaFilial from "./ChartEscadaDuplaFilial";
import { fetchEntregasConfirmadas } from "../../../services/api";
import LoadingDots from "../../../components/Loading";

const DashboardBaixas = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarEntregas();
  }, []);

 
  
  const carregarEntregas = async () => {
    setLoading(true);
    try {
      const resultado = await fetchEntregasConfirmadas(); // já virá como array
      console.log("🔎 Entregas recebidas:", resultado);
      setDados(resultado);
    } catch (error) {
      console.error("Erro ao buscar entregas:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <Row style={{ padding: 20, flexDirection: "column", gap: 20 }}>
            {loading ? <LoadingDots /> : <></>}
      

      <Row className="mt-4">
  <Col md={12}>
    <h4>Distribuição por Tipo de Colaborador</h4>
    <ChartPizzaTipoColaborador data={dados} />
  </Col>
</Row>

<Row className="mt-4">
  <Col md={12}>
    <h4>Entregas Confirmadas por Filial</h4>
    <ChartEscadaDuplaFilial data={dados} />
  </Col>
</Row>

    </Row>
  );
};

export default DashboardBaixas;
