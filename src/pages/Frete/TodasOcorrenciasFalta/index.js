import React, { useEffect, useState } from "react";
import { Button, Table, Input } from "reactstrap";
import { FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import apiLocal from "../../../services/apiLocal";
import { HeaderContainer, StyledTable } from "./style";

const TodasOcorrenciasFalta = () => {
  const [faltas, setFaltas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filteredFaltas, setFilteredFaltas] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [faltasRes, clientesRes, motoristasRes, destinosRes] = await Promise.all([
        apiLocal.getFaltas(),
        apiLocal.getClientes(),
        apiLocal.getMotoristas(),
        apiLocal.getDestinos(),
      ]);

      // Mapeamento de IDs para nomes
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

      // Adiciona nomes às faltas
      const faltasWithNames = faltasRes.data.map((falta) => ({
        ...falta,
        cliente_nome: clientesMap[falta.cliente_id] || "N/A",
        motorista_nome: motoristasMap[falta.motorista_id] || "N/A",
        destino_nome: destinosMap[falta.destino_id] || "N/A",
      }));

      setFaltas(faltasWithNames.sort((a, b) => a.id - b.id)); // Ordena por ID
      setFilteredFaltas(faltasWithNames);
    } catch (error) {
      toast.error("Erro ao buscar dados das faltas.");
      console.error(error);
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

        {/* Filtro por Status */}
        {/* <Input
          type="select"
          value={statusFilter}
          onChange={(e) => handleFilter(e.target.value)}
          style={{ width: 250 }}
        >
          <option value="">Todos os Status</option>
          <option value="Pendente">Pendente</option>
          <option value="Resolvido">Resolvido</option>
          <option value="Não entregue">Não entregue</option>
        </Input> */}
      </HeaderContainer>

      <StyledTable bordered>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nota Fiscal</th>
            <th>Cliente</th>
            <th>Motorista</th>
            <th>Destino</th>
            <th>Cidade</th>
            <th>Valor da Falta</th>
            <th>Data de Inclusão</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          {filteredFaltas.map((falta) => (
            <tr key={falta.id}>
              <td>{falta.id}</td>
              <td>{falta.nf}</td>
              <td>{falta.cliente_nome}</td>
              <td>{falta.motorista_nome}</td>
              <td>{falta.destino_nome}</td>
              <td>{falta.cidade}</td>
              <td>{parseFloat(falta.valor_falta).toFixed(2)}</td>
              <td>{new Date(falta.data_inclusao).toLocaleString()}</td>
              <td>{falta.obs}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </div>
  );
};

export default TodasOcorrenciasFalta;
