import React, { useEffect, useState } from "react";
import { Button, Input } from "reactstrap";
import { FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import apiLocal from "../../../services/apiLocal";
import { HeaderContainer, Table,
  TableRow,
  TableCell,
  TableHeader, } from "./style";
import LoadingDots from "../../../components/Loading";

const TodasOcorrencias = () => {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [filteredOcorrencias, setFilteredOcorrencias] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [
        ocorrenciasRes,
        clientesRes,
        motoristasRes,
        destinosRes,
        nomesOcorrenciasRes,
      ] = await Promise.all([
        apiLocal.getOcorrencias(),
        apiLocal.getClientes(),
        apiLocal.getMotoristas(),
        apiLocal.getDestinos(),
        apiLocal.getNomesOcorrencias(),
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

      const nomesOcorrenciasMap = {};
      nomesOcorrenciasRes.data.forEach((tipo) => {
        nomesOcorrenciasMap[tipo.id] = tipo.nome;
      });

      const ocorrenciasWithNames = ocorrenciasRes.data.map((ocorrencia) => ({
        ...ocorrencia,
        cliente_nome: clientesMap[ocorrencia.cliente_id] || "N/A",
        motorista_nome: motoristasMap[ocorrencia.motorista_id] || "N/A",
        destino_nome: destinosMap[ocorrencia.destino_id] || "N/A",
        tipo_ocorrencia: nomesOcorrenciasMap[ocorrencia.tipoocorrencia_id] || "N/A",
        permanencia: calcularPermanencia(
          ocorrencia.horario_chegada,
          ocorrencia.horario_saida
        ),
        tempo_para_abrir: calcularTempoParaAbrir(
          ocorrencia.datainclusao,
          ocorrencia.horario_chegada
        ),
      }));
      setOcorrencias(ocorrenciasWithNames);
      setFilteredOcorrencias(ocorrenciasWithNames);
      setLoading(false);
    } catch (error) {
      toast.error("Erro ao buscar dados das ocorrências.");
      console.error(error);
    } finally {
      setLoading(false);
    }

  };

  const calcularPermanencia = (chegada, saida) => {
    if (!chegada || !saida) return "N/A";
    const diffMs = new Date(saida) - new Date(chegada);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  const calcularTempoParaAbrir = (inclusao, chegada) => {
    if (!inclusao || !chegada) return "N/A";
    const diffMs = new Date(inclusao) - new Date(chegada);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...filteredOcorrencias].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredOcorrencias(sorted);
    setSortConfig({ key, direction });
  };

  const handleExportExcel = () => {
    if (filteredOcorrencias.length === 0) {
      toast.warning("Nenhuma ocorrência para exportar.");
      return;
    }

    const dataToExport = filteredOcorrencias.map((ocorrencia) => ({
      ID: ocorrencia.id,
      "Nota Fiscal": ocorrencia.nf,
      Cliente: ocorrencia.cliente_nome,
      Motorista: ocorrencia.motorista_nome,
      Destino: ocorrencia.destino_nome,
      Status: ocorrencia.status,
      "Data de Inclusão": new Date(ocorrencia.datainclusao).toLocaleString(),
      "Hora de Chegada": ocorrencia.horario_chegada
        ? new Date(ocorrencia.horario_chegada).toLocaleString()
        : "N/A",
      "Hora de Saída": ocorrencia.horario_saida
        ? new Date(ocorrencia.horario_saida).toLocaleString()
        : "N/A",
      Permanência: ocorrencia.permanencia,
      "Tempo para Abrir": ocorrencia.tempo_para_abrir,
      "Tipo de Ocorrência": ocorrencia.tipo_ocorrencia,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ocorrencias");
    XLSX.writeFile(workbook, "TodasOcorrencias.xlsx");
  };

  const handleFilter = (status) => {
    setStatusFilter(status);
    if (status === "") {
      setFilteredOcorrencias(ocorrencias);
    } else {
      setFilteredOcorrencias(
        ocorrencias.filter((ocorrencia) => ocorrencia.status === status)
      );
    }
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
        <Button color="success" onClick={handleExportExcel}>
          <FaFileExcel /> Exportar para Excel
        </Button>

        <Input
          type="select"
          value={statusFilter}
          onChange={(e) => handleFilter(e.target.value)}
          style={{ width: 250 }}
        >
          <option value="">Todos os Status</option>
          <option value="Pendente">Pendente</option>
          <option value="Resolvido">Resolvido</option>
          <option value="Não entregue">Não entregue</option>
        </Input>
      </HeaderContainer>

      {loading ? (
        <LoadingDots/> // Ou utilize um componente de loading
      ) : (
        <Table>
          <thead>
            <TableRow>
              <TableHeader onClick={() => handleSort("id")}>ID</TableHeader>
              <TableHeader onClick={() => handleSort("nf")}>Nota Fiscal</TableHeader>
              <TableHeader onClick={() => handleSort("cliente_nome")}>Cliente</TableHeader>
              <TableHeader onClick={() => handleSort("motorista_nome")}>Motorista</TableHeader>
              <TableHeader onClick={() => handleSort("destino_nome")}>Destino</TableHeader>
              <TableHeader onClick={() => handleSort("status")}>Status</TableHeader>
              <TableHeader onClick={() => handleSort("datainclusao")}>Data de Inclusão</TableHeader>
              <TableHeader onClick={() => handleSort("horario_chegada")}>Hora de Chegada</TableHeader>
              <TableHeader onClick={() => handleSort("horario_saida")}>Hora de Saída</TableHeader>
              <TableHeader onClick={() => handleSort("permanencia")}>Permanência</TableHeader>
              <TableHeader onClick={() => handleSort("tempo_para_abrir")}>Tempo para Abrir</TableHeader>
              <TableHeader onClick={() => handleSort("tipo_ocorrencia")}>Tipo de Ocorrência</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {filteredOcorrencias.map((ocorrencia) => (
              <TableRow key={ocorrencia.id}>
                <TableCell>{ocorrencia.id}</TableCell>
                <TableCell>{ocorrencia.nf}</TableCell>
                <TableCell>{ocorrencia.cliente_nome}</TableCell>
                <TableCell>{ocorrencia.motorista_nome}</TableCell>
                <TableCell>{ocorrencia.destino_nome}</TableCell>
                <TableCell>{ocorrencia.status}</TableCell>
                <TableCell>{new Date(ocorrencia.datainclusao).toLocaleString()}</TableCell>
                <TableCell>
                  {ocorrencia.horario_chegada
                    ? new Date(ocorrencia.horario_chegada).toLocaleString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {ocorrencia.horario_saida
                    ? new Date(ocorrencia.horario_saida).toLocaleString()
                    : "N/A"}
                </TableCell>
                <TableCell>{ocorrencia.permanencia}</TableCell>
                <TableCell>{ocorrencia.tempo_para_abrir}</TableCell>
                <TableCell>{ocorrencia.tipo_ocorrencia}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

    </div>
  );
};

export default TodasOcorrencias;
