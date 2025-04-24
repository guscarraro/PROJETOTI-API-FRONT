import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import ChartTopMotoristasBaixas from "./ChartTopMotoristasBaixas";
import ChartPizzaTipoColaborador from "./ChartPizzaTipoColaborador";
import ChartEscadaDuplaFilial from "./ChartEscadaDuplaFilial";
import { fetchEntregasConfirmadas } from "../../../services/api";
import LoadingDots from "../../../components/Loading";
import { Box, CardStyle } from "./style"; // usando o estilo Box
import { FaSadTear, FaTrophy } from "react-icons/fa";
import apiLocal from "../../../services/apiLocal";
import ModalMotoristasSemBaixa from "./ModalMotoristasSemBaixa";

const DashboardBaixas = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [motoristasSemBaixa, setMotoristasSemBaixa] = useState([]);
  const [showModalSemBaixa, setShowModalSemBaixa] = useState(false);


useEffect(() => {
  const verificarMotoristasSemBaixa = async () => {
    const response = await apiLocal.getMotoristas();
    const motoristasCadastrados = response.data;

    const nomesCompletos = motoristasCadastrados.map((m) => m.nome.toLowerCase());

    const usuariosQueDeramBaixa = new Set(
      dados
        .filter((item) => item.tp_colaborador === "MOTORISTA")
        .map((item) => item.usuarioAlteracao?.toLowerCase().replace(".", " "))
    );

    const naoDeramBaixa = motoristasCadastrados.filter((m) => {
      const nomeSplit = m.nome.toLowerCase().split(" ");
      return ![...usuariosQueDeramBaixa].some((login) => {
        const loginSplit = login.split(" "); // ex: joao silva
        const [primeiro, ...resto] = loginSplit;
    
        const contemPrimeiro = m.nome.toLowerCase().includes(primeiro);
        const contemOutro = resto.some((parte) =>
          m.nome.toLowerCase().includes(parte)
        );
    
        return contemPrimeiro && contemOutro;
      });
    });
    

    setMotoristasSemBaixa(naoDeramBaixa);
  };

  if (dados.length > 0) verificarMotoristasSemBaixa();
}, [dados]);


  useEffect(() => {
    carregarEntregas();
  }, []);

  const carregarEntregas = async () => {
    setLoading(true);
    try {
      const resultado = await fetchEntregasConfirmadas();
      setDados(resultado);
    } catch (error) {
      console.error("Erro ao buscar entregas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row style={{ padding: 20, flexDirection: "column", gap: 20 }}>
      {loading && <LoadingDots />}
{showModalSemBaixa && (
  <ModalMotoristasSemBaixa
    motoristas={motoristasSemBaixa}
    onClose={() => setShowModalSemBaixa(false)}
  />
)}
      <Row>
        <Col md={12}>
          <Box style={{ backgroundColor: "rgba(72, 201, 176, 0.2)" }}>
            <h3 style={{ color: "#48C9B0" }}>Top 10 Motoristas com mais baixas  <FaTrophy
        style={{
         
          bottom: 10,
          right: 10,
          fontSize: 24,
          color: "#48C9B0",
        }}
        /></h3>
           
            <ChartTopMotoristasBaixas data={dados} />
          </Box>
          
        </Col>

       


      </Row>

      <Row className="mt-4">
        <Col md={6}>
        <Box >
          <h4>Distribuição por Tipo de Colaborador</h4>
          <ChartPizzaTipoColaborador data={dados} />
        </Box>
          
        </Col>
        <Col md={6}>
  <CardStyle
    bgColor="rgba(255, 99, 71, 0.2)"
    iconColor="#FF6347"
    onClick={() => setShowModalSemBaixa(true)} // define a função para abrir modal
    style={{ cursor: "pointer" }}
  >
    <h3>
      <FaSadTear /> Motoristas sem baixa via app
    </h3>
    <p style={{ fontSize: 32, fontWeight: 700 }}>
      {motoristasSemBaixa.length}
    </p>
    {motoristasSemBaixa.length > 0 && (
      <p style={{ fontSize: 12, fontStyle: "italic" }}>
        Clique para ver mais
      </p>
    )}
  </CardStyle>
</Col>
      </Row>

      <Row className="mt-4">
        <Col md={12}>
        <Box >
          <h4>Entregas Confirmadas por Filial</h4>
          <ChartEscadaDuplaFilial data={dados} />
          </Box>
        </Col>
      </Row>
    </Row>
  );
};

export default DashboardBaixas;
