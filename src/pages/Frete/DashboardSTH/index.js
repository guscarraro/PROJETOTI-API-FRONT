import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Row, Col, FormGroup, Label, Input, Button } from "reactstrap";
import apiLocal from "../../../services/apiLocal";
import { Box, CardStyle } from "./style";
import { FaChartBar, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import ChartClientes from "./ChartClientes";
import ChartMotivos from "./ChartMotivos";
import ChartDestinatarios from "./ChartDestinatarios";
import NoData from "../../../components/NoData";


const DashboardSTH = () => {
  const [filters, setFilters] = useState({
    dtInicio: "",
    dtFinal: "",
    motoristas: [],
    clientes: [],
    destinos: [],
  });

  const [dashboardData, setDashboardData] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await apiLocal.getDashboardSTH({
        ...filters,
        motoristas: filters.motoristas.map((m) => m.value),
        clientes: filters.clientes.map((c) => c.value),
        destinos: filters.destinos.map((d) => d.value),
      });

      const data = Array.isArray(response.data) ? response.data : [];
      setDashboardData(data);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    if (!Array.isArray(dashboardData)) {
      return {
        totalOcorrencias: 0,
        mediaOcorrenciasDia: 0,
        totalNotasAfetadas: 0,
      };
    }
  
    const totalOcorrencias = dashboardData.length;
  
    const distinctDays = new Set(
      dashboardData.map((item) =>
        new Date(item.data_inclusao).toISOString().split("T")[0]
      )
    );
    const mediaOcorrenciasDia =
      totalOcorrencias / Math.max(distinctDays.size, 1);
  
    const totalNotasAfetadas = dashboardData.reduce((total, item) => {
      const notas = item.nf_sth ? item.nf_sth.split(",").map((n) => n.trim()) : [];
      return total + notas.length;
    }, 0);
  
    return {
      totalOcorrencias,
      mediaOcorrenciasDia,
      totalNotasAfetadas,
    };
  };
  

  const { totalOcorrencias, mediaOcorrenciasDia, totalNotasAfetadas } =
    calculateStatistics();

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchDashboardData();
  };

  return (
    <Row style={{ display: "flex", flexDirection: "column", gap: 20, margin: 20, width:'100%' }}>
      <Row className="mb-4">
        {/* Filtros */}
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
        <Col md={3}>
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
        <Col md={3}>
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

      {/* Cards */}
      <Row>
  <Col md={4}>
    <CardStyle style={{ backgroundColor: "rgba(255, 99, 71, 0.2)" }}>
      <h3 style={{ color: "#FF6347" }}>
        <FaChartBar style={{ color: "#FF6347" }} /> Total Ocorrências
      </h3>
      <p style={{ fontSize: 32, fontWeight: 700 }}>
        {Math.round(totalOcorrencias) || 0}
      </p>
    </CardStyle>
  </Col>
  <Col md={4}>
    <CardStyle style={{ backgroundColor: "rgba(30, 144, 255, 0.2)" }}>
      <h3 style={{ color: "#1E90FF" }}>
        <FaCalendarAlt style={{ color: "#1E90FF" }}/> Média Ocorrências/Dia
      </h3>
      <p style={{ fontSize: 32, fontWeight: 700 }}>
        {Math.round(mediaOcorrenciasDia) || 0}
      </p>
    </CardStyle>
  </Col>
  <Col md={4}>
    <CardStyle style={{ backgroundColor: "rgba(154, 205, 50, 0.2)" }}>
      <h3 style={{ color: "#9ACD32" }}>
        <FaChartLine style={{ color: "#9ACD32" }}/> Notas Afetadas STH
      </h3>
      <p style={{ fontSize: 32, fontWeight: 700 }}>
        {Math.round(totalNotasAfetadas) || 0}
      </p>
    </CardStyle>
  </Col>
</Row>


      {/* Gráficos */}
      <Row style={{gap:10}}>
        <Col md={12}>
          <Box>
            <h3>Clientes</h3>
            {Array.isArray(dashboardData) && dashboardData.length > 0 ? (
              <ChartClientes data={dashboardData} motoristas={motoristas} destinatarios={destinos} clientes={clientes} />
            ) : (
              <NoData />
            )}
          </Box>
        </Col>
        <Col md={12}>
          <Box>
            <h3>Destinatário</h3>
            {Array.isArray(dashboardData) && dashboardData.length > 0 ? (
              <ChartDestinatarios data={dashboardData} motoristas={motoristas} destinatarios={destinos} clientes={clientes} />
            ) : (
              <NoData />
            )}
          </Box>
        </Col>
        <Col md={12}>
          <Box>
            <h3>Motivos</h3>
            {Array.isArray(dashboardData) && dashboardData.length > 0 ? (
              <ChartMotivos data={dashboardData} motoristas={motoristas} clientes={clientes} />
            ) : (
              <NoData />
            )}

          </Box>
        </Col>
      </Row>
      </Row>
  );
};

export default DashboardSTH;
