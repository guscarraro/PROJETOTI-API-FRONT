import React, { useState } from "react";
import { Button } from "reactstrap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
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

  // Cores gradativas (exemplo)
  const colors = [
    "#FF4500",
    "#FF5400",
    "#FF6500",
    "#FF7500",
    "#FF8500",
    "#FF9400",
    "#FF9900",
  ];

  // Retorna uma cor diferente para cada barra, conforme o index
  const getBarColor = (index) => {
    return colors[index % colors.length];
  };

  // Clique na barra → abre modal com detalhes
  const handleBarClick = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      setModalData(e.activePayload[0].payload);
      setIsModalOpen(true);
    }
  };

  // Fecha o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  // Dinamicamente, definimos a altura do gráfico
  // Ex.: 50 px de "folga" + 40 px para cada item, mínimo de 400 px
  const chartHeight = Math.max(400, data.length * 40 + 50);

  return (
    <div style={{ width: "100%", height: chartHeight }}>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          onClick={handleBarClick}
          barCategoryGap="10%" // Ajuste a folga entre as barras
        >
          <CartesianGrid strokeDasharray="3 3" />

          {/* Eixo X = números (quantidade) */}
          <XAxis
            type="number"
            style={{ fontSize: 14, fill: "#fff" }}
            allowDecimals={false}
          />

          {/* 
            Eixo Y = nomes (categorias)
            width={100} por exemplo, 50 px a mais 
            (ajuste conforme necessidade, ex. 120, 150 etc.)
          */}
          <YAxis
            dataKey="nome"
            type="category"
            width={100} 
            style={{ fontSize: 14, fill: "#fff" }}
            tickFormatter={(tick) => {
              const maxLength = 22;
              return tick.length > maxLength
                ? `${tick.substring(0, maxLength)}...`
                : tick;
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="quantidade"
            label={{
              position: "insideRight", 
              fill: "#fff",
              fontSize: 14,
              fontWeight: "bold",
            }}
            shape={(props) => {
              const { x, y, width, height, index } = props;
              const color = getBarColor(index);
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
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Modal simples em DIV (sem Reactstrap), exibindo uma tabela de details */}
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
