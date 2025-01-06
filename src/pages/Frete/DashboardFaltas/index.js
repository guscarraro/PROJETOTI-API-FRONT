import React, { useEffect, useState } from "react";
import ChartEscadaClientes from "./ChartEscadaClientes"; // Gráfico de escada reutilizado
import apiLocal from "../../../services/apiLocal"; // API para chamadas
import { Box, CardStyle } from "./style";
import { FaSyncAlt } from "react-icons/fa";
import { GiBrokenBottle } from "react-icons/gi";
import { BiSolidError } from "react-icons/bi";
import { Col, Row } from "reactstrap";

const DashboardFalta = () => {
  const [faltasData, setFaltasData] = useState([]);
  const [clientesData, setClientesData] = useState([]);
  const [clientesMap, setClientesMap] = useState({});
  const [motoristasMap, setMotoristasMap] = useState({});
  const [totalAvarias, setTotalAvarias] = useState(0);
  const [totalInversoes, setTotalInversoes] = useState(0);
  const [totalFaltas, setTotalFaltas] = useState(0);
  const [valorAvarias, setValorAvarias] = useState(0);
  const [valorInversoes, setValorInversoes] = useState(0);
  const [valorFaltas, setValorFaltas] = useState(0);

  useEffect(() => {
    fetchFaltasData();
  }, []);

  const fetchFaltasData = async () => {
    try {
      // Fetch faltas
      const respFaltas = await apiLocal.getFaltas();
      const { data: faltas } = respFaltas;
      setFaltasData(faltas);

      // Fetch clientes para mapear nomes
      const respClientes = await apiLocal.getClientes();
      const clientesList = respClientes.data;
      const clientesMapTemp = {};
      clientesList.forEach((cliente) => {
        clientesMapTemp[cliente.id] = cliente.nome;
      });
      setClientesMap(clientesMapTemp);

      // Fetch motoristas para mapear nomes
      const respMotoristas = await apiLocal.getMotoristas();
      const motoristasList = respMotoristas.data;
      const motoristasMapTemp = {};
      motoristasList.forEach((motorista) => {
        motoristasMapTemp[motorista.id] = motorista.nome;
      });
      setMotoristasMap(motoristasMapTemp);

      // Calcula totais de Avarias, Inversões e Faltas
      const avarias = faltas.filter((f) => f.tipo_ocorren === "A");
      const inversoes = faltas.filter((f) => f.tipo_ocorren === "I");
      const faltasTotais = faltas.filter((f) => f.tipo_ocorren === "F");

      setTotalAvarias(avarias.length);
      setTotalInversoes(inversoes.length);
      setTotalFaltas(faltasTotais.length);

      // Calcula valores totais sem usar reduce
      let totalValorAvarias = 0;
      avarias.forEach((item) => {
        totalValorAvarias += parseFloat(item.valor_falta || 0);
      });
      setValorAvarias(totalValorAvarias);

      let totalValorInversoes = 0;
      inversoes.forEach((item) => {
        totalValorInversoes += parseFloat(item.valor_falta || 0);
      });
      setValorInversoes(totalValorInversoes);

      let totalValorFaltas = 0;
      faltasTotais.forEach((item) => {
        totalValorFaltas += parseFloat(item.valor_falta || 0);
      });
      setValorFaltas(totalValorFaltas);

      // Monta dados para gráfico de clientes
      const clientesMapData = {};
      faltas.forEach((f) => {
        const clienteId = f.cliente_id;
        if (!clientesMapData[clienteId]) {
          clientesMapData[clienteId] = {
            nome: clientesMapTemp[clienteId] || "Desconhecido",
            quantidade: 0,
            details: [],
          };
        }
        clientesMapData[clienteId].quantidade++;
        clientesMapData[clienteId].details.push({
          tipo: f.tipo_ocorren,
          NF: f.nf,
          cliente: clientesMapTemp[f.cliente_id] || "Desconhecido",
          motorista: motoristasMapTemp[f.motorista_id] || "Desconhecido",
          obs: f.obs || "Sem descrição",
          valor: parseFloat(f.valor_falta || 0),
        });
      });

      const clientesDataFinal = Object.values(clientesMapData).map((cliente) => ({
        id: cliente.nome,
        nome: cliente.nome,
        quantidade: cliente.quantidade,
        details: cliente.details,
      }));

      setClientesData(clientesDataFinal);
    } catch (error) {
      console.error("Erro ao buscar dados de faltas", error);
    }
  };

  return (
    <Row style={{ display: "flex", flexDirection: "column", gap: 20, margin: 20, width: "100%" }}>
      {/* Cards de métricas */}
      <Row>
        {/* Card 1: Total de Avarias */}
        <Col md={4}>
          <CardStyle bgColor="rgba(154, 205, 50, 0.2)" iconColor="#9ACD32">
            <h3>
              <GiBrokenBottle /> Total de Avarias
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>{totalAvarias}</p>
            <Box
              style={{
                background: "rgba(154, 205, 50, 0.2)",
                padding: 15,
                marginTop: 10,
                borderRadius: 5,
              }}
            >
              <p style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                Valor Total: R$ {valorAvarias.toFixed(2)}
              </p>
            </Box>
          </CardStyle>
        </Col>

        {/* Card 2: Total de Inversões */}
        <Col md={4}>
          <CardStyle bgColor="rgba(30, 144, 255, 0.2)" iconColor="#1E90FF">
            <h3>
              <FaSyncAlt /> Total de Inversões
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>{totalInversoes}</p>
            <Box
              style={{
                background: "rgba(30, 144, 255, 0.2)",
                padding: 15,
                marginTop: 10,
                borderRadius: 5,
              }}
            >
              <p style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                Valor Total: R$ {valorInversoes.toFixed(2)}
              </p>
            </Box>
          </CardStyle>
        </Col>

        {/* Card 3: Total de Faltas */}
        <Col md={4}>
          <CardStyle bgColor="rgba(255, 99, 71, 0.2)" iconColor="#FF6347">
            <h3>
              <BiSolidError /> Total de Faltas
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>{totalFaltas}</p>
            <Box
              style={{
                background: "rgba(255, 99, 71, 0.2)",
                padding: 15,
                marginTop: 10,
                borderRadius: 5,
              }}
            >
              <p style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                Valor Total: R$ {valorFaltas.toFixed(2)}
              </p>
            </Box>
          </CardStyle>
        </Col>
      </Row>

      {/* Gráfico de Escada por Cliente */}
      <Col md={12}>
        <Box>
          <h3>Ocorrências por Cliente</h3>
          <ChartEscadaClientes data={clientesData} />
        </Box>
      </Col>
    </Row>
  );
};

export default DashboardFalta;
