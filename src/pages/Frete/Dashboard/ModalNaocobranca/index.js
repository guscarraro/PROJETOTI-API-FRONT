import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import ChartClientesAtrasos from "./ChartClientesAtrasos";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import * as XLSX from "xlsx"; // ✅ Importa XLSX para exportação

const ModalNaoCobranca = ({ data, onClose, onRefresh }) => {
  const [sortedData, setSortedData] = useState([...data]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedNota, setSelectedNota] = useState(null);
  const [isCteModalOpen, setIsCteModalOpen] = useState(false);
  const [cteValue, setCteValue] = useState("");

  const toggleCteModal = () => setIsCteModalOpen(!isCteModalOpen);

  const handleCheckboxChange = (nf) => {
    setSelectedNota(nf === selectedNota ? null : nf);
  };
  const exportarParaExcel = () => {
    const dadosFormatados = sortedData.map((item) => ({
      "Nota Fiscal": item.nf,
      Cliente: item.cliente,
      "Hora da Chegada": formatarDataHora(item.horario_chegada),
      "Hora da Ocorrência": formatarDataHora(item.horario_ocorrencia),
      "Hora de Saída": formatarDataHora(item.horario_saida),
      "Permanência Após Ocorrências": calcularTempoPermanencia(
        item.horario_chegada,
        item.horario_saida,
        item.horario_ocorrencia
      ).formatado,
      Motorista: item.motorista,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ocorrencias_Sem_Cobranca");
    XLSX.writeFile(wb, "Ocorrencias_Sem_Cobranca.xlsx");
  };

  const handleSaveCte = async () => {
    if (!selectedNota || !cteValue.trim()) {
      toast.error("Por favor, selecione uma nota e insira o número do CTE.");
      return;
    }

    try {
      const payload = {
        nf: selectedNota,
        cobranca_adicional: "S",
        cte_gerado: cteValue,
      };

      const response = await apiLocal.updateCobrancaAdicional(payload);

      if (response.status === 200) {
        toast.success("Cobrança adicional registrada com sucesso!");

        if (onRefresh) {
          onRefresh();
        }

        setSelectedNota(null);
        setCteValue("");
        toggleCteModal();
      } else {
        throw new Error("Erro ao registrar cobrança adicional.");
      }
    } catch (error) {
      console.error("Erro ao registrar cobrança adicional:", error);
      toast.error(
        "Erro ao registrar cobrança adicional. Verifique os dados e tente novamente."
      );
    }
  };

  const calcularTempoPermanencia = (chegada, saida, ocorren) => {
    const chegadaDate = new Date(chegada);
    const saidaDate = new Date(saida);
    const ocorrenDate = new Date(ocorren);
    if (!ocorrenDate || !saidaDate || ocorrenDate > saidaDate)
      return { horas: 0, minutos: 0, formatado: "Indisponível" };

    const diffMs = saidaDate - ocorrenDate;
    const diffMin = Math.floor(diffMs / 60000);
    const horas = Math.floor(diffMin / 60);
    const minutos = diffMin % 60;

    return { horas, minutos, formatado: `${horas}h ${minutos}min` };
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...sortedData].sort((a, b) => {
      if (key === "tempoPermanencia") {
        const tempoA = calcularTempoPermanencia(
          a.horario_chegada,
          a.horario_saida,
          a.horario_ocorrencia
        );
        const tempoB = calcularTempoPermanencia(
          b.horario_chegada,
          b.horario_saida,
          b.horario_ocorrencia
        );
        return direction === "asc"
          ? tempoA.horas - tempoB.horas || tempoA.minutos - tempoB.minutos
          : tempoB.horas - tempoA.horas || tempoB.minutos - tempoA.minutos;
      }

      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedData(sorted);
    setSortConfig({ key, direction });
  };

  const clientesAtrasos = [];
  data.forEach((item) => {
    const cliente = clientesAtrasos.find((c) => c.name === item.cliente);
    if (cliente) {
      cliente.quantidade += 1;
    } else {
      clientesAtrasos.push({ name: item.cliente, quantidade: 1 });
    }
  });

  const formatarDataHora = (dataHora) => {
    const data = new Date(dataHora);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          minWidth: 600,
          maxHeight: "80vh",
          overflowY: "auto",
          color: "black",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4>Ocorrências Sem Cobrança Adicional</h4>
          <Button color="success" onClick={exportarParaExcel} size="sm">
            Exportar para Excel
          </Button>
        </div>
        <div style={{ marginBottom: 20 }}>
          <h5>Top 10 Clientes com Mais Atrasos</h5>
          <ChartClientesAtrasos data={clientesAtrasos.slice(0, 10)} />

        </div>
        {selectedNota && (
          <Button
            color="primary"
            onClick={toggleCteModal}
            style={{ marginLeft: 10, marginBottom: 10 }}
          >
            Gerar Cobrança
          </Button>
        )}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 20,
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={cellStyle}></th>
              <th style={cellStyle} onClick={() => handleSort("nf")}>
                Nota
              </th>
              <th style={cellStyle} onClick={() => handleSort("cliente")}>
                Cliente
              </th>
              <th
                style={cellStyle}
                onClick={() => handleSort("horario_chegada")}
              >
                Hora da Chegada
              </th>
              <th
                style={cellStyle}
                onClick={() => handleSort("horario_ocorrencia")}
              >
                Hora da Ocorrência
              </th>
              <th style={cellStyle} onClick={() => handleSort("horario_saida")}>
                Hora de Saída
              </th>
              <th
                style={cellStyle}
                onClick={() => handleSort("tempoPermanencia")}
              >
                Permanência Após Ocorrências
              </th>
              <th style={cellStyle} onClick={() => handleSort("motorista")}>
                Motorista
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const permanencia = calcularTempoPermanencia(
                item.horario_chegada,
                item.horario_saida,
                item.horario_ocorrencia
              );
              const isTempoExcedido = permanencia.horas >= 1;

              return (
                <tr
                  key={index}
                  style={{
                    background: isTempoExcedido ? "#f8d7da" : "inherit",
                    color: isTempoExcedido ? "#721c24" : "inherit",
                    border: isTempoExcedido
                      ? "1px solid #721c24"
                      : "1px solid rgb(221, 221, 221)",
                  }}
                >
                  <td style={cellStyle}>
                    <input
                      type="checkbox"
                      checked={item.nf === selectedNota}
                      onChange={() => handleCheckboxChange(item.nf)}
                    />
                  </td>
                  <td style={cellStyle}>{item.nf}</td>
                  <td style={cellStyle}>{item.cliente}</td>
                  <td style={cellStyle}>
                    {formatarDataHora(item.horario_chegada)}
                  </td>
                  <td style={cellStyle}>
                    {formatarDataHora(item.horario_ocorrencia)}
                  </td>
                  <td style={cellStyle}>
                    {formatarDataHora(item.horario_saida)}
                  </td>
                  <td style={cellStyle}>{permanencia.formatado}</td>
                  <td style={cellStyle}>{item.motorista}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Button color="secondary" onClick={onClose}>
          Fechar
        </Button>
      </div>

      {/* Modal para gerar CTE */}
      <Modal
        isOpen={isCteModalOpen}
        toggle={toggleCteModal}
        backdrop="static"
        centered
      >
        <ModalHeader toggle={toggleCteModal}>Gerar Cobrança</ModalHeader>
        <ModalBody>
          <p>Informe o número do CTE para a nota selecionada:</p>
          <Input
            type="number"
            value={cteValue}
            onChange={(e) => setCteValue(e.target.value)}
            placeholder="Número do CTE"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveCte}>
            Salvar
          </Button>
          <Button color="secondary" onClick={toggleCteModal}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

// Função para formatar data e hora no formato "dd/MM/yyyy hh:mm"
const formatarDataHora = (dataHora) => {
  if (!dataHora) return "Indisponível";
  const data = new Date(dataHora);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
};

const cellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
  cursor: "pointer",
};

export default ModalNaoCobranca;
