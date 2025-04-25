import React, { useEffect, useState } from "react";
import ChartEscadaClientes from "./ChartEscadaClientes"; // Gráfico de escada reutilizado
import apiLocal from "../../../services/apiLocal"; // API para chamadas
import { Box, CardStyle } from "./style";
import { FaSyncAlt } from "react-icons/fa";
import { GiBrokenBottle } from "react-icons/gi";
import { BiSolidError } from "react-icons/bi";
import { Button, Col, FormGroup, Input, Label, Row } from "reactstrap";
import Select from "react-select";
import ChartPieRespon from "./ChartPieRespon";
import ChartAutor from "./ChartAutor";
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
  const [filters, setFilters] = useState({
    dtInicio: "",
    dtFinal: "",
    motoristas: [],
    clientes: [],
    destinos: [],
    responsaveis: [],
  });
  
  const [motoristas, setMotoristas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);

  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchFaltasData();
    fetchFilters();
    setDefaultDateRange();
  }, []);
  
  const fetchFilters = async () => {
    try {
      const [motoristasResp, clientesResp, destinosResp] = await Promise.all([
        apiLocal.getMotoristas(),
        apiLocal.getClientes(),
        apiLocal.getDestinos(),
      ]);
  
      setMotoristas(
        motoristasResp.data.map((item) => ({
          value: item.id,
          label: item.nome,
        }))
      );
      setClientes(
        clientesResp.data.map((item) => ({
          value: item.id,
          label: item.nome,
        }))
      );
      setDestinos(
        destinosResp.data.map((item) => ({
          value: item.id,
          label: `${item.nome} - ${item.cidade || "Sem cidade"}`,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar filtros:", error);
    }
  };
  
  const setDefaultDateRange = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    setFilters((prev) => ({ ...prev, dtInicio: firstDay, dtFinal: lastDay }));
  };
  
  const fetchFaltasData = async () => {
    setLoading(true);
    try {
      // Carrega os dados de clientes e motoristas para mapeamento
      const [clientesResp, motoristasResp] = await Promise.all([
        apiLocal.getClientes(),
        apiLocal.getMotoristas(),
      ]);
  
      const clientesMapTemp = {};
      clientesResp.data.forEach((cliente) => {
        clientesMapTemp[cliente.id] = cliente.nome;
      });
      setClientesMap(clientesMapTemp);
  
      const motoristasMapTemp = {};
      motoristasResp.data.forEach((motorista) => {
        motoristasMapTemp[motorista.id] = motorista.nome;
      });
      setMotoristasMap(motoristasMapTemp);
  
      // Faz a requisição para buscar as faltas com os filtros aplicados
      const response = await apiLocal.getFaltasFiltradas({
        ...filters,
        motoristas: filters.motoristas.map((m) => m.value),
        clientes: filters.clientes.map((c) => c.value),
        destinos: filters.destinos.map((d) => d.value),
        responsaveis: filters.responsaveis.map((r) => r.value),
      });
      
  
      const faltas = response.data.map((item) => ({
        ...item,
        cliente_nome: clientesMapTemp[item.cliente_id] || "Desconhecido",
        motorista_nome: motoristasMapTemp[item.motorista_id] || "Desconhecido",
      }));
  
      setFaltasData(faltas);
  
      // Calcula totais de Avarias, Inversões e Faltas
      const avarias = faltas.filter((f) => f.tipo_ocorren === "A");
      const inversoes = faltas.filter((f) => f.tipo_ocorren === "I");
      const faltasTotais = faltas.filter((f) => f.tipo_ocorren === "F");
  
      setTotalAvarias(avarias.length);
      setTotalInversoes(inversoes.length);
      setTotalFaltas(faltasTotais.length);
  
      // Calcula valores totais
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
      const responsaveisUnicos = [...new Set(response.data.map(item => item.responsavel).filter(Boolean))].map(r => ({ value: r, label: r }));
setResponsaveis(responsaveisUnicos);

      // Monta dados para o gráfico de clientes
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
          cliente: clientesMapTemp[clienteId] || "Desconhecido",
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
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    fetchFaltasData();
  };
  

  return (
    <Row style={{ display: "flex", flexDirection: "column", gap: 20, margin: 20, width: "100%" }}>
      {/* Cards de métricas */}
      <Row>
      <Row className="mb-4">
  <Col md={1}>
    <FormGroup>
      <Label for="dtInicio">Data Início</Label>
      <Input
        type="date"
        id="dtInicio"
        value={filters.dtInicio}
        onChange={(e) => handleFilterChange("dtInicio", e.target.value)}
      />
    </FormGroup>
  </Col>
  <Col md={1}>
    <FormGroup>
      <Label for="dtFinal">Data Final</Label>
      <Input
        type="date"
        id="dtFinal"
        value={filters.dtFinal}
        onChange={(e) => handleFilterChange("dtFinal", e.target.value)}
      />
    </FormGroup>
  </Col>
  <Col md={2}>
    <FormGroup>
      <Label>Motoristas</Label>
      <Select
        options={motoristas}
        isMulti
        value={filters.motoristas}
        onChange={(value) => handleFilterChange("motoristas", value)}
        placeholder="Selecione motoristas"
        styles={{
          option: (provided) => ({
            ...provided,
            color: "#000", // Cor do texto das opções
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "#000", // Cor do texto do valor selecionado
          }),
          multiValue: (provided) => ({
            ...provided,
            color: "#000", // Cor do texto em seleções múltiplas
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "#888", // Cor do texto do placeholder
          }),
        }}
      />
    </FormGroup>
  </Col>
  <Col md={2}>
  <FormGroup>
    <Label>Responsáveis</Label>
    <Select
      options={responsaveis}
      isMulti
      value={filters.responsaveis}
      onChange={(value) => handleFilterChange("responsaveis", value)}
      placeholder="Selecione responsáveis"
      styles={{
        option: (provided) => ({
          ...provided,
          color: "#000",
        }),
        singleValue: (provided) => ({
          ...provided,
          color: "#000",
        }),
        multiValue: (provided) => ({
          ...provided,
          color: "#000",
        }),
        placeholder: (provided) => ({
          ...provided,
          color: "#888",
        }),
      }}
    />
  </FormGroup>
</Col>

  <Col md={2}>
    <FormGroup>
      <Label>Clientes</Label>
      <Select
        options={clientes}
        isMulti
        value={filters.clientes}
        onChange={(value) => handleFilterChange("clientes", value)}
        placeholder="Selecione clientes"
        styles={{
          option: (provided) => ({
            ...provided,
            color: "#000", // Cor do texto das opções
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "#000", // Cor do texto do valor selecionado
          }),
          multiValue: (provided) => ({
            ...provided,
            color: "#000", // Cor do texto em seleções múltiplas
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "#888", // Cor do texto do placeholder
          }),
        }}
      />
    </FormGroup>
  </Col>
  <Col md={2}>
    <FormGroup>
      <Label>Destinos</Label>
      <Select
        options={destinos}
        isMulti
        value={filters.destinos}
        onChange={(value) => handleFilterChange("destinos", value)}
        placeholder="Selecione destinos"
        styles={{
          option: (provided) => ({
            ...provided,
            color: "#000", // Cor do texto das opções
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "#000", // Cor do texto do valor selecionado
          }),
          multiValue: (provided) => ({
            ...provided,
            color: "#000", // Cor do texto em seleções múltiplas
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "#888", // Cor do texto do placeholder
          }),
        }}
      />
    </FormGroup>
  </Col>
  <Col md={1} className="text-right">
    <Button
      color="primary"
      onClick={applyFilters}
      disabled={loading}
      style={{ marginTop: 30 }}
    >
      {loading ? "Carregando..." : "Aplicar Filtros"}
    </Button>
  </Col>
</Row>

        {/* Card 1: Total de Avarias */}
        <Col md={4}>
          <CardStyle bgColor="rgba(154, 205, 50, 0.2)" iconColor="#9ACD32">
            <h3>
              <GiBrokenBottle /> Total de Avarias
            </h3>
            <p style={{ fontSize: 32, fontWeight: 700 }}>{totalAvarias}</p>
            <ChartPieRespon data={faltasData} tipoOcorrencia="A" />
            <Box
              style={{
                background: "rgba(154, 205, 50, 0.2)",
                padding: 15,
                marginTop: 10,
                borderRadius: 5,
              }}
            >
              <p style={{ fontSize: 30, fontWeight: 700, color: "#fff" }}>
                Total: R$ {valorAvarias.toFixed(2)}
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
            <ChartPieRespon data={faltasData} tipoOcorrencia="I" />
            <Box
              style={{
                background: "rgba(30, 144, 255, 0.2)",
                padding: 15,
                marginTop: 10,
                borderRadius: 5,
              }}
            >
              <p style={{ fontSize: 30, fontWeight: 700, color: "#fff" }}>
                Total: R$ {valorInversoes.toFixed(2)}
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
            <ChartPieRespon data={faltasData} tipoOcorrencia="F" />
            <Box
              style={{
                background: "rgba(255, 99, 71, 0.2)",
                padding: 15,
                marginTop: 10,
                borderRadius: 5,
              }}
            >
              <p style={{ fontSize: 30, fontWeight: 700, color: "#fff" }}>
                Total: R$ {valorFaltas.toFixed(2)}
              </p>
            </Box>
          </CardStyle>
        </Col>
      </Row>

      {/* Gráfico de Escada por Cliente */}
      <Col md={12}>
        <Box>
          <h3>Autorizado por</h3>
          <ChartAutor data={faltasData} />
        </Box>
      </Col>
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
