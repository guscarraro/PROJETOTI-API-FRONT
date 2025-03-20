import React, { useState } from "react";
import { Button } from "reactstrap";
import ChartClientesNaoEntregues from "./ChartClientesNaoEntregues";
import * as XLSX from "xlsx"; // ✅ Importa XLSX para exportação

const ModalNaoEntregue = ({ data, onClose }) => {
  const [sortedData, setSortedData] = useState([...data]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const formatarDataHora = (dataHora) => {
    if (!dataHora) return "Indisponível";
    const data = new Date(dataHora);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const exportarParaExcel = () => {
    const dadosFormatados = sortedData.map((item) => ({
      "Nota Fiscal": item.nf,
      Cliente: item.cliente,
      "Hora de Chegada": formatarDataHora(item.horario_chegada),
      "Hora da Ocorrência": formatarDataHora(item.horario_ocorrencia),
      "Hora de Saída": formatarDataHora(item.horario_saida),
      "Permanência Após Ocorrências": calcularTempoPermanencia(
        item.horario_ocorrencia,
        item.horario_saida
      ).formatado,
      Motorista: item.motorista,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chamados_Nao_Entregues");
    XLSX.writeFile(wb, "Chamados_Nao_Entregues.xlsx");
  };

  const calcularTempoPermanencia = (chegada, saida) => {
    const chegadaDate = new Date(chegada);
    const saidaDate = new Date(saida);

    if (!chegadaDate || !saidaDate || chegadaDate > saidaDate) {
      return { horas: 0, minutos: 0, formatado: "Indisponível" };
    }

    const diffMs = saidaDate - chegadaDate;
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
          a.horario_ocorrencia,
          a.horario_saida
        );
        const tempoB = calcularTempoPermanencia(
          b.horario_ocorrencia,
          b.horario_saida
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

  const clientesNaoEntregues = [];
  data.forEach((item) => {
    const clienteIndex = clientesNaoEntregues.findIndex(
      (cliente) => cliente.name === item.cliente
    );
    if (clienteIndex === -1) {
      clientesNaoEntregues.push({ name: item.cliente, quantidade: 1 });
    } else {
      clientesNaoEntregues[clienteIndex].quantidade++;
    }
  });

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
        zIndex: 9999,
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
          <h4>Chamados Não Entregues</h4>
          <Button color="success" onClick={exportarParaExcel} size="sm">
            Exportar para Excel
          </Button>
        </div>

        {/* Gráfico de Clientes */}
        <div style={{ marginBottom: 20 }}>
          <h5>Top 7 Clientes com Chamados Não Entregues</h5>
          <ChartClientesNaoEntregues data={clientesNaoEntregues.slice(0, 7)} />
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 20,
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
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
                Hora de Chegada
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
                item.horario_ocorrencia,
                item.horario_saida
              );

              const isTempoExcedido = permanencia.horas >= 1;

              return (
                <tr
                  key={index}
                  style={{
                    background: isTempoExcedido ? "#f8d7da" : "inherit",
                    color: isTempoExcedido ? "#721c24" : "inherit",
                  }}
                >
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
    </div>
  );
};

const cellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
  cursor: "pointer",
};

export default ModalNaoEntregue;
