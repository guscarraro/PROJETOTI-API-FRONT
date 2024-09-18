import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "./Dashboard.css"; // Adicionando arquivo CSS para estilizar

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

  // Carregar os dados da API
  useEffect(() => {
    axios
      .get("https://projetoti-api-production.up.railway.app/dados")
      .then((response) => {
        setData(response.data);
        groupDataByModule(response.data); // Agrupar dados por módulo
      })
      .catch((error) => {
        console.error("Erro ao buscar os dados da API:", error);
      });
  }, []);

  // Função para agrupar os dados por módulo
  const groupDataByModule = (data) => {
    const modules = {};
    data.forEach((item) => {
      const modulo = item.Modulo;
      if (!modules[modulo]) {
        modules[modulo] = [];
      }
      modules[modulo].push(item.Numero); // Agrupar números de ocorrência por módulo
    });
    setGroupedByModule(modules);
  };

  // Função para contar problemas por módulo (Gráfico de Barras)
  const countByModule = () => {
    const moduleCount = {};
    data.forEach((item) => {
      if (item.Modulo) {
        moduleCount[item.Modulo] = (moduleCount[item.Modulo] || 0) + 1;
      }
    });
    return moduleCount;
  };

  // Função para contar problemas por versão (Gráfico de Pizza)
  const countByVersion = () => {
    const versionCount = {};
    data.forEach((item) => {
      if (item.Versao && item.Versao !== "N/I") {
        versionCount[item.Versao] = (versionCount[item.Versao] || 0) + 1;
      }
    });
    return versionCount;
  };

  // Dados para o gráfico de barras (módulos)
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

  // Dados para o gráfico de pizza (versões) com tamanho reduzido
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

  // Opções para o gráfico de pizza com tamanho reduzido
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    width: 200,
    height: 200,
  };

  // Tabela final com Status, Número, Solicitante, Data, Severidade e Assunto
  const renderStatusIcon = (status) => {
    if (status === "Ag. Escalasoft") {
      return <FaCheckCircle color="green" />;
    } else {
      return <FaExclamationCircle color="red" />;
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {/* Tabela por Módulo */}
      <h2>Tabela por Módulo</h2>
      <div className="table-responsive">
        <table className="module-table">
          <thead>
            <tr>
              {Object.keys(groupedByModule).map((modulo, index) => (
                <th key={index}>{modulo}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {Object.keys(groupedByModule).map((modulo, index) => (
                <td key={index}>
                  {groupedByModule[modulo].map((numero, i) => (
                    <div key={i}>{numero}</div>
                  ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gráfico em Escada (Barras) */}
      <h2>Gráfico de Problemas por Módulo</h2>
      <div className="chart-container">
        <Bar data={moduleData} />
      </div>

      {/* Gráfico de Pizza (Versão) com tamanho reduzido */}
      <h2>Gráfico de Problemas por Versão</h2>
      <div className="chart-container small-chart">
        <Pie data={versionData} options={pieOptions} />
      </div>

      {/* Tabela Detalhada */}
      <h2>Tabela Detalhada</h2>
      <table className="detailed-table">
        <thead>
          <tr>
            <th>Status HD</th>
            <th>Número</th>
            <th>Solicitante</th>
            <th>Data</th>
            <th>Severidade</th>
            <th>Assunto</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{renderStatusIcon(item["Status HD"])}</td>
              <td>{item.Numero}</td>
              <td>{item.Solicitante}</td>
              <td>{item.Data}</td>
              <td>{item.Severidade}</td>
              <td>{item.Assunto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
