import React, { useState } from "react";
import { Button } from "reactstrap";
import PieClientes from "./PieClientes"; // Certifique-se do caminho e exportação corretos
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

const ChartEscadaClientes = ({ data }) => {
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  
  const filteredData = data
  .filter((item) => item.quantidade > 0)
  .sort((a, b) => b.quantidade - a.quantidade);
  
  const chartHeight = Math.max(400, filteredData.length * 50 + 50);
  const handleBarClick = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      setModalData(e.activePayload[0].payload);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const preparePieData = (details) => {
    if (!details || !Array.isArray(details)) return [];

    const typeCount = {};
    details.forEach((item) => {
      typeCount[item.tipo] = (typeCount[item.tipo] || 0) + 1;
    });

    return Object.entries(typeCount).map(([name, value]) => ({
      name,
      value,
    }));
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={filteredData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" style={{ fontSize: 14, fill: "#fff" }} />
          <YAxis
            dataKey="nome"
            type="category"
            width={120}
            style={{ fontSize: 14, fill: "#fff" }}
          />
          <Tooltip />
          <Bar dataKey="quantidade" fill="#00C49F">
            <LabelList dataKey="quantidade" position="insideLeft" fill="#fff" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {modalData && isModalOpen && (
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
            color:'#000'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 10,
              minWidth: 400,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>{modalData.nome}</h4>
            <p>Quantidade: {modalData.quantidade}</p>

            {/* Gráfico de Pizza */}
            <PieClientes data={preparePieData(modalData.details)} />

            {Array.isArray(modalData.details) && modalData.details.length > 0 ? (
              <>
                <p>Ocorrências Relacionadas:</p>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: 10,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#eee" }}>
                      <th style={cellStyle}>Nota</th>
                      <th style={cellStyle}>Descrição</th>
                      <th style={cellStyle}>Cliente</th>
                      <th style={cellStyle}>Motorista</th>
                      <th style={cellStyle}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.details.map((item, idx) => (
                      <tr key={idx}>
                        <td style={cellStyle}>{item.NF}</td>
                        <td style={cellStyle}>{item.obs}</td>
                        <td style={cellStyle}>{item.cliente}</td>
                        <td style={cellStyle}>{item.motorista}</td>
                        <td style={cellStyle}>R$ {item.valor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p style={{ fontStyle: "italic" }}>
                Nenhum detalhe adicional encontrado.
              </p>
            )}

            <Button onClick={closeModal} color="secondary">
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

export default ChartEscadaClientes;
