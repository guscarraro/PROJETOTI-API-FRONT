import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Button } from "reactstrap";
import MotoristaPieChart from "./MotoristaPieChart"; // Import do novo componente

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          padding: "10px",
          borderRadius: "5px",
          color: "#fff",
        }}
      >
        <p>{`Quantidade: ${payload[0].value}`}</p>
        <p style={{ fontSize: "12px", fontStyle: "italic" }}>
          Clique para ver mais detalhes
        </p>
      </div>
    );
  }
  return null;
};

const ChartMotoristas = ({ data }) => {
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar e ordenar os dados
  const filteredData = data.filter((item) => item.total !== 0);
  const sortedData = [...filteredData].sort((a, b) => b.total - a.total);

  const chartHeight = Math.max(300, sortedData.length * 40 + 50);

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

  const pieData = modalData?.details.reduce((acc, item) => {
    const existing = acc.find((d) => d.name === item.tipo);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.tipo, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          barCategoryGap="10%"
          onClick={handleBarClick}
        >
          {/* Define o gradiente */}
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#002D62" />
              <stop offset="100%" stopColor="#00509E" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#fff" strokeDasharray="3 3" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "#fff" }}
            axisLine={{ stroke: "#fff" }}
            tickLine={{ stroke: "#fff" }}
          />
          <YAxis
            dataKey="nome"
            type="category"
            width={120}
            tick={{ fill: "#fff" }}
            axisLine={{ stroke: "#fff" }}
            tickLine={{ stroke: "#fff" }}
            tickFormatter={(tick) =>
              tick.length > 15 ? `${tick.substring(0, 13)}...` : tick
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" fill="url(#blueGradient)">
            <LabelList
              dataKey="total"
              position="insideLeft"
              fill="#fff"
              style={{ fontSize: "12px", fontWeight: "bold" }}
            />
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
            zIndex: 9999,
          }}
          onClick={closeModal}
        >
          <div
  style={{
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    minWidth: 800, // Aumenta largura
    maxHeight: "90vh",
    overflowY: "auto",
    color: "black",
  }}
  onClick={(e) => e.stopPropagation()}
>

            <h4>{modalData.nome}</h4>
            <p>Quantidade: {modalData.total}</p>

            {Array.isArray(modalData.details) && modalData.details.length > 0 ? (
              <>
                <MotoristaPieChart data={pieData} />
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
                      <th style={cellStyle}>Cliente</th>
                      <th style={cellStyle}>Tipo de Ocorrência</th>
                      <th style={cellStyle}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.details.map((item, idx) => (
                      <tr key={idx}>
                        <td style={cellStyle}>{item.NF}</td>
                        <td style={cellStyle}>{item.cliente}</td>
                        <td style={cellStyle}>{item.tipo}</td>
                        <td style={cellStyle}>{item.data}</td>
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

export default ChartMotoristas;
