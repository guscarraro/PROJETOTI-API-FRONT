import React, { useEffect, useState } from "react";
import { Button, Table, Input } from "reactstrap";
import { FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import apiLocal from "../../../services/apiLocal";
import { HeaderContainer, StyledTable } from "./style";

const TodasOcorrencias = () => {
    const [ocorrencias, setOcorrencias] = useState([]);
    const [filteredOcorrencias, setFilteredOcorrencias] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
  
    useEffect(() => {
      fetchData();
    }, []);
  
    const fetchData = async () => {
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
  
        // Mapeamento de IDs para nomes/descrições usando forEach
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
  
        // Adiciona nomes/descrições às ocorrências
        const ocorrenciasWithNames = ocorrenciasRes.data
          .map((ocorrencia) => ({
            ...ocorrencia,
            cliente_nome: clientesMap[ocorrencia.cliente_id] || "N/A",
            motorista_nome: motoristasMap[ocorrencia.motorista_id] || "N/A",
            destino_nome: destinosMap[ocorrencia.destino_id] || "N/A",
            tipo_ocorrencia: nomesOcorrenciasMap[ocorrencia.tipoocorrencia_id] || "N/A",
            permanencia: calcularPermanencia(
              ocorrencia.horario_chegada,
              ocorrencia.horario_saida
            ),
          }))
          .sort((a, b) => a.id - b.id); // Ordena por ID
  
        setOcorrencias(ocorrenciasWithNames);
        setFilteredOcorrencias(ocorrenciasWithNames);
      } catch (error) {
        toast.error("Erro ao buscar dados das ocorrências.");
        console.error(error);
      }
    };
  
    const calcularPermanencia = (chegada, saida) => {
      if (!chegada || !saida) return "N/A";
      const diffMs = new Date(saida) - new Date(chegada);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}min`;
    };
  
    const handleExportExcel = () => {
      if (filteredOcorrencias.length === 0) {
        toast.warning("Nenhuma ocorrência para exportar.");
        return;
      }
  
      // Reorganizar os campos para coincidir com a ordem da tabela
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
          {/* Exportar para Excel */}
          <Button color="success" onClick={handleExportExcel}>
            <FaFileExcel /> Exportar para Excel
          </Button>
  
          {/* Filtro por Status */}
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
  
        <StyledTable bordered>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nota Fiscal</th>
              <th>Cliente</th>
              <th>Motorista</th>
              <th>Destino</th>
              <th>Status</th>
              <th>Data de Inclusão</th>
              <th>Hora de Chegada</th>
              <th>Hora de Saída</th>
              <th>Permanência</th>
              <th>Tipo de Ocorrência</th>
            </tr>
          </thead>
          <tbody>
            {filteredOcorrencias.map((ocorrencia) => (
              <tr key={ocorrencia.id}>
                <td>{ocorrencia.id}</td>
                <td>{ocorrencia.nf}</td>
                <td>{ocorrencia.cliente_nome}</td>
                <td>{ocorrencia.motorista_nome}</td>
                <td>{ocorrencia.destino_nome}</td>
                <td>{ocorrencia.status}</td>
                <td>{new Date(ocorrencia.datainclusao).toLocaleString()}</td>
                <td>
                  {ocorrencia.horario_chegada
                    ? new Date(ocorrencia.horario_chegada).toLocaleString()
                    : "N/A"}
                </td>
                <td>
                  {ocorrencia.horario_saida
                    ? new Date(ocorrencia.horario_saida).toLocaleString()
                    : "N/A"}
                </td>
                <td>{ocorrencia.permanencia}</td>
                <td>{ocorrencia.tipo_ocorrencia}</td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </div>
    );
  };
  
  export default TodasOcorrencias;
  