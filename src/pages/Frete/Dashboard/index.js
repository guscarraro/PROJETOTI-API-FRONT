import React, { useEffect, useState } from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast, ToastContainer } from "react-toastify";
import apiLocal from "../../../services/apiLocal";

const Dashboard = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      <GraficoEscadaOcorren />
      <GraficoTopClientes />
      <div style={styles.cardContainer}>
        <CardTempoMedio nome="Ocorrências Resolvidas" status="Resolvido" />
        <CardTempoMedio nome="Ocorrências Não Entregues" status="Não entregue" />
      </div>
      <ToastContainer />
    </div>
  );
};

// Gráfico de Escada para Ocorrências por Tipo
const GraficoEscadaOcorren = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiLocal.getOcorrencias();
      const ocorrenciasPorTipo = response.data.reduce((acc, curr) => {
        const tipo = curr.tipoocorrencia_id || "Desconhecido";
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      const formattedData = Object.keys(ocorrenciasPorTipo).map((key) => ({
        tipo: `Tipo ${key}`,
        quantidade: ocorrenciasPorTipo[key],
      }));

      setData(formattedData);
    } catch (error) {
      toast.error("Erro ao carregar dados para o gráfico de ocorrências.");
      console.error(error);
    }
  };

  return (
    <div>
      <h3>Gráfico de Ocorrências por Tipo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tipo" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantidade" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Gráfico de Escada para Top 10 Clientes
const GraficoTopClientes = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiLocal.getOcorrencias();
      const ocorrenciasPorCliente = response.data.reduce((acc, curr) => {
        const cliente = curr.cliente_id || "Desconhecido";
        acc[cliente] = (acc[cliente] || 0) + 1;
        return acc;
      }, {});

      const sortedClientes = Object.entries(ocorrenciasPorCliente)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([cliente, quantidade]) => ({ cliente: `Cliente ${cliente}`, quantidade }));

      setData(sortedClientes);
    } catch (error) {
      toast.error("Erro ao carregar dados para o gráfico de clientes.");
      console.error(error);
    }
  };

  return (
    <div>
      <h3>Top 10 Clientes com Mais Ocorrências</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cliente" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantidade" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Card para Tempo Médio de Permanência
const CardTempoMedio = ({ nome, status }) => {
  const [tempoMedio, setTempoMedio] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiLocal.getOcorrencias();
      const ocorrencias = response.data.filter((ocorrencia) => ocorrencia.status === status);

      const totalTempo = ocorrencias.reduce((acc, curr) => {
        const chegada = new Date(curr.horario_chegada);
        const saida = new Date(curr.horario_saida);
        const diferenca = (saida - chegada) / (1000 * 60); // Diferença em minutos
        return acc + diferenca;
      }, 0);

      const media = ocorrencias.length > 0 ? totalTempo / ocorrencias.length : 0;
      setTempoMedio(media.toFixed(2)); // Formata para 2 casas decimais
    } catch (error) {
      toast.error("Erro ao calcular o tempo médio.");
      console.error(error);
    }
  };

  return (
    <Card style={styles.card}>
      <CardBody>
        <CardTitle tag="h5">{nome}</CardTitle>
        <p>{tempoMedio ? `${tempoMedio} minutos` : "Carregando..."}</p>
      </CardBody>
    </Card>
  );
};

const styles = {
  cardContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  card: {
    width: "45%",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    padding: "20px",
  },
};

export default Dashboard;
