import React, { useEffect, useState } from "react";
import { Button, Table, Input } from "reactstrap";
import { FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import apiLocal from "../../../services/apiLocal";
import { HeaderContainer, StyledTable } from "./style";

const TodasOcorrenciasSTH = () => {
  const [ocorrenciasSTH, setOcorrenciasSTH] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filteredOcorrenciasSTH, setFilteredOcorrenciasSTH] = useState([]);
  const [motoristaFilter, setMotoristaFilter] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        ocorrenciasSTHRes,
        clientesRes,
        motoristasRes,
        destinosRes,
        ocorrenciasRes, // Adicionando a chamada ao getOcorrencias
        tiposOcorrenciasRes, // Endpoint para tipos de ocorrências
      ] = await Promise.all([
        apiLocal.getOcorrenciasSTH(),
        apiLocal.getClientes(),
        apiLocal.getMotoristas(),
        apiLocal.getDestinos(),
        apiLocal.getOcorrencias(), // Chamada ao endpoint de ocorrências
        apiLocal.getNomesOcorrencias(), // Chamada ao endpoint de tipos de ocorrências
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

      const tiposOcorrenciasMap = {};
      tiposOcorrenciasRes.data.forEach((tipo) => {
        tiposOcorrenciasMap[tipo.id] = tipo.nome;
      });

      // Confrontar ocorrências STH com ocorrências do endpoint `getOcorrencias`
      const ocorrenciasWithNames = ocorrenciasSTHRes.data.map((ocorrenciaSTH) => {
        const matchingOcorrencia = ocorrenciasRes.data.find(
          (ocorrencia) =>
            ocorrencia.nf === ocorrenciaSTH.nf &&
            ocorrencia.cliente_id === ocorrenciaSTH.cliente_id
        );

        return {
          ...ocorrenciaSTH,
          cliente_nome: clientesMap[ocorrenciaSTH.cliente_id] || "N/A",
          motorista_nome: motoristasMap[ocorrenciaSTH.motorista_id] || "N/A",
          destino_nome: destinosMap[ocorrenciaSTH.destino_id] || "N/A",
          horario_chegada: matchingOcorrencia
            ? new Date(matchingOcorrencia.horario_chegada).toLocaleString("pt-BR")
            : "N/A",
          horario_saida: matchingOcorrencia
            ? new Date(matchingOcorrencia.horario_saida).toLocaleString("pt-BR")
            : "N/A",
          permanencia: matchingOcorrencia
            ? calcularPermanencia(
                matchingOcorrencia.horario_chegada,
                matchingOcorrencia.horario_saida
              )
            : "N/A",
          tipo_ocorrencia: matchingOcorrencia
            ? tiposOcorrenciasMap[matchingOcorrencia.tipoocorrencia_id] || "N/A"
            : "N/A",
        };
      });

      setOcorrenciasSTH(ocorrenciasWithNames);
      setFilteredOcorrenciasSTH(ocorrenciasWithNames);
      setMotoristas(motoristasRes.data); // Popula motoristas para o filtro
    } catch (error) {
      toast.error("Erro ao buscar dados das ocorrências STH.");
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
    if (filteredOcorrenciasSTH.length === 0) {
      toast.warning("Nenhuma ocorrência para exportar.");
      return;
    }

    // Formatar dados para exportar descrições em vez de IDs
    const exportData = filteredOcorrenciasSTH.map((ocorrencia) => ({
      ID: ocorrencia.id,
      "Nota Fiscal": ocorrencia.nf,
      Cliente: ocorrencia.cliente_nome,
      Destino: ocorrencia.destino_nome,
      Motorista: ocorrencia.motorista_nome,
      Motivo: ocorrencia.motivo,
      "Notas Fiscais STH": ocorrencia.nf_sth,
      "Data da Viagem": new Date(ocorrencia.data_viagem).toLocaleDateString(),
      Cidade: ocorrencia.cidade,
      "Horário de Chegada": ocorrencia.horario_chegada,
      "Horário de Saída": ocorrencia.horario_saida,
      Permanência: ocorrencia.permanencia,
      "Tipo de Ocorrência": ocorrencia.tipo_ocorrencia,
    }));

    // Criar a planilha
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OcorrenciasSTH");
    XLSX.writeFile(workbook, "TodasOcorrenciasSTH.xlsx");
  };

  const handleFilter = (motoristaId) => {
    setMotoristaFilter(motoristaId);
    if (motoristaId === "") {
      setFilteredOcorrenciasSTH(ocorrenciasSTH);
    } else {
      setFilteredOcorrenciasSTH(
        ocorrenciasSTH.filter(
          (ocorrencia) => ocorrencia.motorista_id === parseInt(motoristaId)
        )
      );
    }
  };
  console.log(filteredOcorrenciasSTH)

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

        {/* Filtro por Motorista */}
        <Input
          type="select"
          value={motoristaFilter}
          onChange={(e) => handleFilter(e.target.value)}
          style={{ width: 250 }}
        >
          <option value="">Todos os Motoristas</option>
          {motoristas.map((motorista) => (
            <option key={motorista.id} value={motorista.id}>
              {motorista.nome}
            </option>
          ))}
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
            <th>Motivo</th>
            <th>Notas Fiscais STH</th>
            <th>Data da Viagem</th>
            <th>Cidade</th>
            <th>Horário de Chegada</th>
            <th>Horário de Saída</th>
            <th>Permanência</th>
            <th>Tipo de Ocorrência</th>
          </tr>
        </thead>
        <tbody>
          {filteredOcorrenciasSTH.map((ocorrencia) => (
            <tr key={ocorrencia.id}>
              <td>{ocorrencia.id}</td>
              <td>{ocorrencia.nf}</td>
              <td>{ocorrencia.cliente_nome}</td>
              <td>{ocorrencia.motorista_nome}</td>
              <td>{ocorrencia.destino_nome}</td>
              <td>{ocorrencia.motivo}</td>
              <td>{ocorrencia.nf_sth}</td>
              <td>{new Date(ocorrencia.data_viagem + "T00:00:00").toLocaleDateString("pt-BR")}</td>

              <td>{ocorrencia.cidade}</td>
              <td>{ocorrencia.horario_chegada}</td>
              <td>{ocorrencia.horario_saida}</td>
              <td>{ocorrencia.permanencia}</td>
              <td>{ocorrencia.tipo_ocorrencia}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </div>
  );
};

export default TodasOcorrenciasSTH;
