import React, { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from '../../supabaseClient';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaCaretDown,
  FaCaretUp,
  FaClock,
  FaTasks,
} from "react-icons/fa";
import moment from "moment";
import { Collapse } from "react-collapse";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import "./style.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const [data, setData] = useState([]);
  const [groupedByModule, setGroupedByModule] = useState({});
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState({});

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; 
  };

  useEffect(() => {
    axios
      .get("https://projetoti-api-production.up.railway.app/dados")
      .then((response) => {
        setData(response.data);
        groupDataByModule(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados da API:", error);
      });
  }, []);

  const groupDataByModule = (data) => {
    const modules = {};
    data.forEach((item) => {
      const modulo = item.Modulo;
      if (!modules[modulo]) {
        modules[modulo] = [];
      }
      modules[modulo].push(item);
    });
    setGroupedByModule(modules);
  };

  const calculateResolutionTime = (dataItem) => {
    if (dataItem.Data && dataItem.LogDataAlteracao) {
      const openingTime = moment(dataItem.Data, "DD/MM/YYYY HH:mm");
      const closingTime = moment(dataItem.LogDataAlteracao, "DD/MM/YYYY HH:mm");
      const duration = moment.duration(closingTime.diff(openingTime));
      return `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
    }
    return "N/A";
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case "Ag. Escalasoft":
        return <FaCheckCircle color="blue" />;
      case "Ag. Homologacao":
        return <FaCheckCircle color="orange" />;
      case "Ag. Informacoes Complementares":
        return <FaExclamationCircle color="deepskyblue" />;
      case "Retorno da Escalasoft":
        return <FaCheckCircle color="green" />;
      case "Em Execucao":
        return <FaExclamationCircle color="purple" />;
      case "Encerrado":
        return <FaCheckCircle color="green" />;
      default:
        return <FaExclamationCircle color="red" />;
    }
  };

  const calculateModuleStats = (moduleData, status) => {
    const filteredData = status
      ? moduleData.filter((item) => item["Status HD"] === status)
      : moduleData;

    const total = filteredData.length;
    const resolved = filteredData.filter(
      (item) => item["Status HD"] === "Encerrado"
    ).length;
    const pending = total - resolved;
    const awaitingClosure = filteredData.filter(
      (item) => item["Status HD"] === "Retorno da Escalasoft"
    ).length;

    const totalTime = filteredData.reduce((acc, item) => {
      if (item.Data && item.LogDataAlteracao) {
        const time = moment(item.LogDataAlteracao, "DD/MM/YYYY HH:mm").diff(
          moment(item.Data, "DD/MM/YYYY HH:mm")
        );
        return acc + time;
      }
      return acc;
    }, 0);

    const averageTime =
      totalTime > 0 ? moment.duration(totalTime / filteredData.length) : null;

    return {
      total,
      resolved,
      pending,
      awaitingClosure,
      averageResolutionTime: averageTime
        ? `${Math.floor(averageTime.asHours())}h ${averageTime.minutes()}m`
        : "N/A",
    };
  };

  const applyStatusFilter = (moduleData, status) => {
    if (!status) return moduleData;
    return moduleData.filter((item) => item["Status HD"] === status);
  };

  const applyTextFilter = (moduleData) => {
    if (!searchQuery) return moduleData;
    return moduleData.filter(
      (item) =>
        item.Solicitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Data.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const toggleModuleExpansion = (modulo) => {
    setExpandedModules((prevState) => ({
      ...prevState,
      [modulo]: !prevState[modulo],
    }));
  };

  const handleFilterChange = (modulo, status) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [modulo]: status,
    }));
  };

  const countByModule = () => {
    const moduleCount = {};
    data.forEach((item) => {
      if (item.Modulo) {
        moduleCount[item.Modulo] = (moduleCount[item.Modulo] || 0) + 1;
      }
    });
    return moduleCount;
  };

  const countByVersion = () => {
    const versionCount = {};
    data.forEach((item) => {
      if (item.Versao && item.Versao !== "N/I") {
        versionCount[item.Versao] = (versionCount[item.Versao] || 0) + 1;
      }
    });
    return versionCount;
  };

  const countByDate = () => {
    const dateCount = {};
    data.forEach((item) => {
      if (
        item.Data &&
        (item["Status HD"] === "Encerrado" ||
          item["Status HD"] === "Retorno da Escalasoft")
      ) {
        const date = moment(item.Data, "DD/MM/YYYY").format("DD/MM/YYYY");
        dateCount[date] = (dateCount[date] || 0) + 1;
      }
    });
    return dateCount;
  };

  const moduleData = {
    labels: Object.keys(countByModule()),
    datasets: [
      {
        label: "Problemas por Módulo",
        data: Object.values(countByModule()),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const versionData = {
    labels: Object.keys(countByVersion()),
    datasets: [
      {
        label: "Problemas por Versão",
        data: Object.values(countByVersion()),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  const resolutionData = {
    labels: Object.keys(countByDate()),
    datasets: [
      {
        label: "Chamados Resolvidos/Respondidos por Data",
        data: Object.values(countByDate()),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    width: 400,
    height: 400,
  };

  const globalStats = calculateModuleStats(data);

  return (
    <div className="dashboard">
        
      <div className="fixed-search-bar">
      <button onClick={handleLogout}>Sair</button>
        <input
          type="text"
          placeholder="Buscar por Solicitante ou Data"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="content-offset">
        <Grid container spacing={2} className="global-stats">
          <Grid item xs={6} sm={3}>
            <Paper className="stat-card2">
              <FaTasks size={40} className="card-icon" />
              <Typography variant="h6">Total de Chamados</Typography>
              <Typography style={{ fontSize: "30px" }}>
                {globalStats.total}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper className="stat-card2">
              <FaCheckCircle size={40} className="card-icon" />{" "}
              <Typography variant="h6">Chamados Resolvidos</Typography>
              <Typography style={{ fontSize: "30px" }}>
                {globalStats.resolved}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper className="stat-card2">
              <FaExclamationCircle size={40} className="card-icon" />{" "}
              
              <Typography variant="h6">Chamados Pendentes</Typography>
              <Typography style={{ fontSize: "30px" }}>
                {globalStats.pending}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper className="stat-card2">
              <FaClock size={40} className="card-icon" /> 
              <Typography variant="h6">Média Geral de Resolução</Typography>
              <Typography style={{ fontSize: "30px" }}>
                {globalStats.averageResolutionTime}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <div className="modules-grid">
          {Object.keys(groupedByModule).map((modulo, index) => {
            const moduleData = applyTextFilter(groupedByModule[modulo]);
            const stats = calculateModuleStats(moduleData, filters[modulo]);
            return (
              <Card key={index} variant="outlined" className="module-card">
                <CardContent>
                  <Typography
                    variant="h5"
                    onClick={() => toggleModuleExpansion(modulo)}
                    className="card-header"
                  >
                    {modulo}{" "}
                    {expandedModules[modulo] ? <FaCaretUp /> : <FaCaretDown />}
                  </Typography>

                  <Grid container spacing={2} className="module-stats">
                    <Grid item xs={6} sm={2}>
                      <Paper className="stat-card">
                        <Typography variant="h6">Total de Chamados</Typography>
                        <Typography style={{ fontSize: "30px" }}>
                          {stats.total}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Paper className="stat-card">
                        <Typography variant="h6">
                          Chamados Resolvidos
                        </Typography>
                        <Typography style={{ fontSize: "30px" }}>
                          {stats.resolved}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Paper className="stat-card">
                        <Typography variant="h6">Chamados Pendentes</Typography>
                        <Typography style={{ fontSize: "30px" }}>
                          {stats.pending}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper className="stat-card">
                        <Typography variant="h6">
                          Aguardando Encerramento
                        </Typography>
                        <Typography style={{ fontSize: "30px" }}>
                          {stats.awaitingClosure}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Paper className="stat-card">
                        <Typography variant="h6">Média de Resolução</Typography>
                        <Typography style={{ fontSize: "30px" }}>
                          {stats.averageResolutionTime}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {expandedModules[modulo] && (
                    <Box mt={2} className="filter-buttons">
                      <Button
                        variant="outlined"
                        onClick={() => handleFilterChange(modulo, "")}
                        className="filter-button"
                      >
                        Todos
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          handleFilterChange(modulo, "Ag. Escalasoft")
                        }
                        className="filter-button"
                      >
                        Aguardando Escalasoft
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          handleFilterChange(modulo, "Ag. Homologacao")
                        }
                        className="filter-button"
                      >
                        Aguardando Homologação
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          handleFilterChange(
                            modulo,
                            "Ag. Informacoes Complementares"
                          )
                        }
                        className="filter-button"
                      >
                        Aguardando Informações
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          handleFilterChange(modulo, "Em Execucao")
                        }
                        className="filter-button"
                      >
                        Em Execução
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          handleFilterChange(modulo, "Retorno da Escalasoft")
                        }
                        className="filter-button"
                      >
                        Retorno Escalasoft
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleFilterChange(modulo, "Encerrado")}
                        className="filter-button"
                      >
                        Encerrados
                      </Button>
                    </Box>
                  )}

                  <Collapse isOpened={expandedModules[modulo]}>
                    <table className="module-table">
                      <thead>
                        <tr>
                          <th>Status HD</th>
                          <th>Data</th>
                          <th>Número</th>
                          <th>Solicitante</th>
                          <th>Tempo de Resolução</th>
                          <th>Assunto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applyStatusFilter(moduleData, filters[modulo]).map(
                          (item, idx) => (
                            <tr key={idx}>
                              <td>{renderStatusIcon(item["Status HD"])}</td>
                              <td>{item.Data}</td>
                              <td>{item.Numero}</td>
                              <td>{item.Solicitante}</td>
                              <td>{calculateResolutionTime(item)}</td>
                              <td>{item.Assunto}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <h2>Gráfico de Problemas por Módulo</h2>
        <div className="chart-container">
          <Bar data={moduleData} />
        </div>

        <h2>Gráfico de Problemas por Versão</h2>
        <div
          className="chart-container large-chart"
          style={{ height: "600px" }}
        >
          <Pie data={versionData} options={pieOptions} />
        </div>

        <h2>Gráfico de Chamados Resolvidos/Respondidos por Data</h2>
        <div className="chart-container">
          <Bar data={resolutionData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
