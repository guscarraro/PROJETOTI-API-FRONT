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
import ChartClientesAtrasos from "./ChartClientesAtrasos";
import { Button } from "reactstrap";

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

const ChartDestinatarios = ({ data }) => {
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Agrupar ocorrências por cliente
  const groupByClient = (details) => {
    const grouped = {};
    details.forEach((item) => {
      const client = item.cliente || "Desconhecido";
      grouped[client] = (grouped[client] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, quantidade]) => ({
      name,
      quantidade,
    }));
  };

  // Filtrar e ordenar os dados
  const filteredData = data.filter((item) => item.total !== 0);
  const sortedData = [...filteredData]
  .sort((a, b) => b.total - a.total)
  .slice(0, 15); // <- limita ao top 15


  // Gerar gradiente de cores do azul escuro ao azul claro
  const generateGradientColors = (length) => {
    const startColor = [0, 0, 139]; // Azul escuro (RGB)
    const endColor = [70, 130, 180]; // Azul claro (RGB)
    return Array.from({ length }, (_, index) => {
      const ratio = index / (length - 1);
      const color = startColor.map((start, i) =>
        Math.round(start + ratio * (endColor[i] - start))
      );
      return `rgb(${color.join(",")})`;
    });
  };

  const colors = generateGradientColors(sortedData.length);

  const handleBarClick = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      const selectedData = e.activePayload[0].payload;
      const groupedClients = groupByClient(selectedData.details);
      setModalData({ ...selectedData, groupedClients });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const chartHeight = Math.max(300, sortedData.length * 40 + 50);

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
          <Bar
            dataKey="total"
            shape={(props) => {
              const { x, y, width, height, index } = props;
              const color = colors[index];
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={color}
                  stroke="#000"
                  strokeWidth={1}
                />
              );
            }}
          >
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
              minWidth: 400,
              maxHeight: "80vh",
              overflowY: "auto",
              color: "black",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>{modalData.nome}</h4>
            <p>Cidade: {modalData.cidade}</p>
            <p>Quantidade: {modalData.total}</p>

            <div style={{ marginBottom: 20 }}>
              <h5>Top 7 Clientes com Mais Ocorrências</h5>
              <ChartClientesAtrasos data={modalData.groupedClients.slice(0, 7)} />
            </div>

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
                  <th style={cellStyle}>Motorista</th>
                  <th style={cellStyle}>Cliente</th>
                  <th style={cellStyle}>Tipo de Ocorrência</th>
                  <th style={cellStyle}>Data</th>
                </tr>
              </thead>
              <tbody>
                {modalData.details.map((item, idx) => (
                  <tr key={idx}>
                    <td style={cellStyle}>{item.NF}</td>
                    <td style={cellStyle}>{item.motorista}</td>
                    <td style={cellStyle}>{item.cliente}</td>
                    <td style={cellStyle}>{item.tipo}</td>
                    <td style={cellStyle}>{item.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>

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

export default ChartDestinatarios;
