import React, { useEffect, useState } from "react";
import { Button, Input } from "reactstrap";
import { FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import apiLocal from "../../../services/apiLocal";
import {
  HeaderContainer,
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "./style";
import LoadingDots from "../../../components/Loading";

const TodasOcorrenciasSTH = () => {
  const [ocorrenciasSTH, setOcorrenciasSTH] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [filteredOcorrenciasSTH, setFilteredOcorrenciasSTH] = useState([]);
  const [motoristaFilter, setMotoristaFilter] = useState([]);
  const [loading, setLoading] = useState(false);
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


  const fetchData = async (inicio = "", fim = "", motoristaId = "") => {
    setLoading(true);
    try {
      const [
        ocorrenciasSTHRes,
        clientesRes,
        motoristasRes,
        destinosRes,
        ocorrenciasRes,
        tiposOcorrenciasRes,
      ] = await Promise.all([
        apiLocal.getOcorrenciasSTH(),
        apiLocal.getClientes(),
        apiLocal.getMotoristas(),
        apiLocal.getDestinos(),
        apiLocal.getOcorrencias(),
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

      const tiposOcorrenciasMap = {};
      tiposOcorrenciasRes.data.forEach((tipo) => {
        tiposOcorrenciasMap[tipo.id] = tipo.nome;
      });

      let filtradas = ocorrenciasSTHRes.data;

      if (inicio && fim) {
        const dIni = new Date(inicio);
        const dFim = new Date(fim);
        filtradas = filtradas.filter((o) => {
          const dataViagem = new Date(o.data_viagem);
          return dataViagem >= dIni && dataViagem <= dFim;
        });
      }

      if (motoristaId) {
        filtradas = filtradas.filter((o) => o.motorista_id === parseInt(motoristaId));
      }

      const ocorrenciasWithNames = filtradas.map((ocorrenciaSTH) => {
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

      // Ordenar por ID decrescente
      ocorrenciasWithNames.sort((a, b) => b.id - a.id);

      setOcorrenciasSTH(ocorrenciasWithNames);
      setFilteredOcorrenciasSTH(ocorrenciasWithNames);
      setMotoristas(motoristasRes.data);
    } catch (error) {
      toast.error("Erro ao buscar dados das ocorrências STH.");
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

  const handleExportExcel = () => {
    if (filteredOcorrenciasSTH.length === 0) {
      toast.warning("Nenhuma ocorrência para exportar.");
      return;
    }

    let exportData = [];

    // Iterar sobre as ocorrências e duplicar a linha para cada NF STH
    filteredOcorrenciasSTH.forEach((ocorrencia) => {
      const notasFiscais = ocorrencia.nf_sth ? ocorrencia.nf_sth.split(",") : [""]; // Separa as notas pelo ","

      notasFiscais.forEach((nota) => {
        exportData.push({
          ID: ocorrencia.id,
          "NF Causadora": ocorrencia.nf,
          Cliente: ocorrencia.cliente_nome,
          Destino: ocorrencia.destino_nome,
          Motorista: ocorrencia.motorista_nome,
          Motivo: ocorrencia.motivo,
          "Notas Fiscais STH": nota.trim(), // Cada NF em uma linha separada
          "Data da Viagem": new Date(ocorrencia.data_viagem).toLocaleDateString(),
          Cidade: ocorrencia.cidade,
          "Horário de Chegada": ocorrencia.horario_chegada,
          "Horário de Saída": ocorrencia.horario_saida,
          Permanência: ocorrencia.permanencia,
          "Tipo de Ocorrência": ocorrencia.tipo_ocorrencia,
        });
      });
    });

    // Criar a planilha
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OcorrenciasSTH");
    XLSX.writeFile(workbook, "TodasOcorrenciasSTH.xlsx");
  };
  const aplicarFiltroCompleto = () => {
    setLoadingFiltro(true);
    fetchData(dataInicio, dataFim, motoristaFilter).finally(() =>
      setLoadingFiltro(false)
    );
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

        </div>


        {/* Filtro por Motorista */}
        <Input
          type="select"
          value={motoristaFilter}
          onChange={(e) => setMotoristaFilter(e.target.value)}
          style={{ width: 250 }}
        >
          <option value="">Todos os Motoristas</option>
          {motoristas.map((motorista) => (
            <option key={motorista.id} value={motorista.id}>
              {motorista.nome}
            </option>
          ))}
        </Input>
        <div style={{ display: "flex", alignItems: "end" }}>
          <Button
            color="primary"
            onClick={aplicarFiltroCompleto}
            disabled={loadingFiltro}
          >
            {loadingFiltro ? "Filtrando..." : "Filtrar"}
          </Button>
        </div>
      </HeaderContainer>

      {loading ? (
        <LoadingDots /> // Ou use um componente de loading
      ) : (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>NF Causadora</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Motorista</TableHeader>
              <TableHeader>Destino</TableHeader>
              <TableHeader>Motivo</TableHeader>
              <TableHeader>Notas Fiscais STH</TableHeader>
              <TableHeader>Data da Viagem</TableHeader>
              <TableHeader>Cidade</TableHeader>
              <TableHeader>Horário de Chegada</TableHeader>
              <TableHeader>Horário de Saída</TableHeader>
              <TableHeader>Permanência</TableHeader>
              <TableHeader>Tipo de Ocorrência</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {filteredOcorrenciasSTH.flatMap((ocorrencia) => {
              const notasFiscais = ocorrencia.nf_sth ? ocorrencia.nf_sth.split(",") : [""];
              return notasFiscais.map((nota, index) => (
                <TableRow key={`${ocorrencia.id}-${index}`}>
                  <TableCell>{ocorrencia.id}</TableCell>
                  <TableCell>{ocorrencia.nf}</TableCell>
                  <TableCell>{ocorrencia.cliente_nome}</TableCell>
                  <TableCell>{ocorrencia.motorista_nome}</TableCell>
                  <TableCell>{ocorrencia.destino_nome}</TableCell>
                  <TableCell>{ocorrencia.motivo}</TableCell>
                  <TableCell>{nota.trim()}</TableCell>
                  <TableCell>{new Date(ocorrencia.data_viagem + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{ocorrencia.cidade}</TableCell>
                  <TableCell>{ocorrencia.horario_chegada}</TableCell>
                  <TableCell>{ocorrencia.horario_saida}</TableCell>
                  <TableCell>{ocorrencia.permanencia}</TableCell>
                  <TableCell>{ocorrencia.tipo_ocorrencia}</TableCell>
                </TableRow>
              ));
            })}
          </tbody>
        </Table>
      )}


    </div>
  );
};

export default TodasOcorrenciasSTH;
