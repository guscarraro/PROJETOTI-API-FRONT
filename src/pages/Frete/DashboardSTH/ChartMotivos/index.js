import React, { useState, useMemo } from "react";
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

const ChartMotivos = ({ data, motoristas, clientes }) => {
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Criar mapeamento de IDs para nomes com base no `value` e `label` do pai
  const motoristaMap = useMemo(
    () => Object.fromEntries(motoristas.map((m) => [m.value, m.label])),
    [motoristas]
  );
  const clienteMap = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.value, c.label])),
    [clientes]
  );

  // Processar e agrupar os dados por motivo, ordenando do maior para o menor
  const processedData = useMemo(() => {
    const motivosMap = {};

    if (data && data.length > 0) {
      data.forEach((item) => {
        const motivo = item.motivo || "Sem motivo"; // Verificar motivo
        if (!motivosMap[motivo]) {
          motivosMap[motivo] = { motivo, quantidade: 0, details: [] };
        }
        motivosMap[motivo].quantidade += 1; // Incrementar quantidade
        motivosMap[motivo].details.push({
          NF: item.nf,
          motorista: motoristaMap[item.motorista_id] || "Desconhecido",
          cliente: clienteMap[item.cliente_id] || "Desconhecido",
        });
      });
    }

    return Object.values(motivosMap).sort((a, b) => b.quantidade - a.quantidade); // Ordenar por quantidade
  }, [data, motoristaMap, clienteMap]);

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

  const chartHeight = Math.max(300, processedData.length * 40 + 50);

  return (
    <div style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          onClick={handleBarClick}
          barCategoryGap="10%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tick={{ fill: "#fff" }}
            allowDecimals={false}
            tickFormatter={(tick) => tick.toString()} // Garantir exibição correta
          />
          <YAxis
            dataKey="motivo"
            type="category"
            tick={{ fill: "#fff" }}
            width={150}
            tickFormatter={(tick) =>
              tick.length > 22 ? `${tick.substring(0, 22)}...` : tick
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="quantidade"
            fill="#0080FF" // Cor fixa azul
          >
            {/* Exibir números na base das barras */}
            <LabelList
              dataKey="quantidade"
              position="insideLeft" // Alinhamento na base
              fill="#fff"
              fontSize={12}
              fontWeight="bold"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Modal para exibir detalhes */}
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
            <h4>{modalData.motivo}</h4>
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

export default ChartMotivos;
