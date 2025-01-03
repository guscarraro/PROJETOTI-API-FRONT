import React, { useState } from "react";
import { Button } from "reactstrap";
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
          CLIQUE PARA VER MAIS
        </p>
      </div>
    );
  }
  return null;
};

const ChartOcorrencias = ({ data }) => {
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ordenar os dados em ordem decrescente
  const sortedData = [...data].sort((a, b) => b.quantidade - a.quantidade);

  // Gerar gradiente de cores do verde escuro ao verde claro
  const generateGradientColors = (length) => {
    const startColor = [0, 128, 0]; // Verde escuro (RGB)
    const endColor = [144, 238, 144]; // Verde claro (RGB)
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
      setModalData(e.activePayload[0].payload);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const chartHeight = Math.max(400, sortedData.length * 40 + 50);

  return (
    <div style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData} // Dados ordenados
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          onClick={handleBarClick}
          barCategoryGap="10%"
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            type="number"
            style={{ fontSize: 14, fill: "#fff" }}
            allowDecimals={false}
          />

          <YAxis
            dataKey="nome"
            type="category"
            width={100}
            style={{ fontSize: 14, fill: "#fff" }}
            tickFormatter={(tick) =>
              tick.length > 22 ? `${tick.substring(0, 22)}...` : tick
            }
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="quantidade"
            fill="#82ca9d"
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
            {/* Exibir quantidade na base das barras */}
            <LabelList
              dataKey="quantidade"
              position="insideLeft"
              fill="#fff"
              fontSize={14}
              fontWeight="bold"
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
            <p>Quantidade: {modalData.quantidade}</p>

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
                      <th style={cellStyle}>Motorista</th>
                      <th style={cellStyle}>Cliente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.details.map((item, idx) => (
                      <tr key={idx}>
                        <td style={cellStyle}>{item.NF}</td>
                        <td style={cellStyle}>{item.motorista}</td>
                        <td style={cellStyle}>{item.cliente}</td>
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

export default ChartOcorrencias;
