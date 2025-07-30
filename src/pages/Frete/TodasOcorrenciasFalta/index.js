import React, { useEffect, useState } from "react";
import { Button, Input } from "reactstrap";
import { FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import apiLocal from "../../../services/apiLocal";
import {
  HeaderContainer, Table,
  TableRow,
  TableCell,
  TableHeader,
} from "./style";
import LoadingDots from "../../../components/Loading";

const TodasOcorrenciasFalta = () => {
  const [faltas, setFaltas] = useState([]);
  const [filteredFaltas, setFilteredFaltas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteFilter, setClienteFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loadingFiltro, setLoadingFiltro] = useState(false);


  useEffect(() => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const formatar = (data) => data.toISOString().split("T")[0];

    setDataInicio(formatar(primeiroDia));
    setDataFim(formatar(ultimoDia));

    fetchData(formatar(primeiroDia), formatar(ultimoDia), "");
  }, []);


  const fetchData = async (inicio = "", fim = "", clienteId = "") => {
    setLoading(true);
    try {
      const [faltasRes, clientesRes, motoristasRes, destinosRes] = await Promise.all([
        apiLocal.getFaltas(),
        apiLocal.getClientes(),
        apiLocal.getMotoristas(),
        apiLocal.getDestinos(),
      ]);

      const clientesMap = {};
      clientesRes.data.forEach((cliente) => {
        clientesMap[cliente.id] = cliente.nome;
      });

      const motoristasMap = {};
      motoristasRes.data.forEach((motorista) => {
        motoristasMap[motorista.id] = motorista.nome;
      });

      const destinosMap = {};
      destinosRes.data.forEach((destino) => {
        destinosMap[destino.id] = destino.nome;
      });

      let filtradas = faltasRes.data;

      if (inicio && fim) {
        const dIni = new Date(inicio);
        const dFim = new Date(fim);
        filtradas = filtradas.filter((f) => {
          const data = new Date(f.data_inclusao);
          return data >= dIni && data <= dFim;
        });
      }

      if (clienteId) {
        filtradas = filtradas.filter((f) => f.cliente_id === parseInt(clienteId));
      }

      const faltasWithNames = filtradas.map((falta) => ({
        ...falta,
        cliente_nome: clientesMap[falta.cliente_id] || "N/A",
        motorista_nome: motoristasMap[falta.motorista_id] || "N/A",
        destino_nome: destinosMap[falta.destino_id] || "N/A",
      }));

      // Ordenar por ID decrescente
      faltasWithNames.sort((a, b) => b.id - a.id);

      setClientes(clientesRes.data);
      setFaltas(faltasWithNames);
      setFilteredFaltas(faltasWithNames);
    } catch (error) {
      toast.error("Erro ao buscar dados das faltas.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (filteredFaltas.length === 0) {
      toast.warning("Nenhuma falta para exportar.");
      return;
    }

    // Reorganizar os campos para coincidir com a ordem da tabela
    const dataToExport = filteredFaltas.map((falta) => ({
      ID: falta.id,
      "Nota Fiscal": falta.nf,
      Cliente: falta.cliente_nome,
      Motorista: falta.motorista_nome,
      Destino: falta.destino_nome,
      Cidade: falta.cidade,
      "Valor da Falta": falta.valor_falta,
      "Data de Inclusão": new Date(falta.data_inclusao).toLocaleString(),
      Observação: falta.obs,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faltas");
    XLSX.writeFile(workbook, "TodasFaltas.xlsx");
  };

  const handleFilter = (status) => {
    setStatusFilter(status);
    if (status === "") {
      setFilteredFaltas(faltas);
    } else {
      setFilteredFaltas(
        faltas.filter((falta) => falta.status === status)
      );
    }
  };
  const aplicarFiltroCompleto = () => {
    setLoadingFiltro(true);
    fetchData(dataInicio, dataFim, clienteFilter).finally(() =>
      setLoadingFiltro(false)
    );
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <HeaderContainer>
        {/* Exportar para Excel */}
        <Button color="success" onClick={handleExportExcel}>
          <FaFileExcel /> Exportar para Excel
        </Button>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div>
            <label>Data Início:</label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label>Data Fim:</label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <div>
            <label>Cliente:</label>
            <Input
              type="select"
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
              style={{ width: 200 }}
            >
              <option value="">Todos os Clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Input>
          </div>

          <div style={{ display: "flex", alignItems: "end" }}>
            <Button
              color="primary"
              onClick={aplicarFiltroCompleto}
              disabled={loadingFiltro}
            >
              {loadingFiltro ? "Filtrando..." : "Filtrar"}
            </Button>
          </div>
        </div>


      </HeaderContainer>

      {loading ? (
        <LoadingDots /> // Ou use um componente de loading
      ) : (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Nota Fiscal</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Motorista</TableHeader>
              <TableHeader>Destino</TableHeader>
              <TableHeader>Cidade</TableHeader>
              <TableHeader>Valor da Falta</TableHeader>
              <TableHeader>Data de Inclusão</TableHeader>
              <TableHeader>Observação</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {filteredFaltas.map((falta) => (
              <TableRow key={falta.id}>
                <TableCell>{falta.id}</TableCell>
                <TableCell>{falta.nf}</TableCell>
                <TableCell>{falta.cliente_nome}</TableCell>
                <TableCell>{falta.motorista_nome}</TableCell>
                <TableCell>{falta.destino_nome}</TableCell>
                <TableCell>{falta.cidade}</TableCell>
                <TableCell>{parseFloat(falta.valor_falta).toFixed(2)}</TableCell>
                <TableCell>{new Date(falta.data_inclusao).toLocaleString()}</TableCell>
                <TableCell>{falta.obs}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

    </div>
  );
};

export default TodasOcorrenciasFalta;
