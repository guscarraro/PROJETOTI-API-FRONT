import React, { useState } from "react";
import { Button } from "reactstrap";
import ChartCteCobrado from "./ChartCteCobrado";
import * as XLSX from "xlsx"; // ✅ Importa XLSX para exportação

const ModalCteCobrado = ({ data, onClose }) => {
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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...sortedData].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedData(sorted);
    setSortConfig({ key, direction });
  };

  // 🔹 Agrupar CTEs por Cliente para o gráfico
  const ctePorCliente = [];
  data.forEach((item) => {
    const clienteIndex = ctePorCliente.findIndex(
      (cliente) => cliente.name === item.cliente
    );
    if (clienteIndex === -1) {
      ctePorCliente.push({ name: item.cliente, quantidade: 1 });
    } else {
      ctePorCliente[clienteIndex].quantidade++;
    }
  });

  // 🔥 **Função para exportar para Excel**
  const exportarParaExcel = () => {
    const dadosFormatados = sortedData.map((item) => ({
      "Nota Fiscal": item.nf,
      "Cliente": item.cliente,
      "CTE Gerado": item.cte,
      "Hora da Ocorrência": formatarDataHora(item.horario_ocorrencia),
      "Motorista": item.motorista,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CTEs_Cobrados");
    XLSX.writeFile(wb, "CTEs_Cobrados.xlsx");
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
        {/* 🔥 Título + Botão de Exportação */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>CTEs Cobrados</h4>
          <Button color="success" onClick={exportarParaExcel} size="sm">
            Exportar para Excel
          </Button>
        </div>

        {/* Gráfico de CTEs por Cliente */}
        <div style={{ marginBottom: 20 }}>
          <h5>Top 7 Clientes com Mais CTEs Cobrados</h5>
          <ChartCteCobrado data={ctePorCliente.slice(0, 7)} />
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
              <th style={cellStyle} onClick={() => handleSort("cte")}>
                CTE
              </th>
              <th style={cellStyle} onClick={() => handleSort("horario_ocorrencia")}>
                Hora da Ocorrência
              </th>
              <th style={cellStyle} onClick={() => handleSort("motorista")}>
                Motorista
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={index}>
                <td style={cellStyle}>{item.nf}</td>
                <td style={cellStyle}>{item.cliente}</td>
                <td style={cellStyle}>{item.cte}</td>
                <td style={cellStyle}>{formatarDataHora(item.horario_ocorrencia)}</td>
                <td style={cellStyle}>{item.motorista}</td>
              </tr>
            ))}
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

export default ModalCteCobrado;
