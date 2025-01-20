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

const ChartClientes = ({ data, motoristas, destinatarios, clientes }) => {
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Criar mapeamento de IDs para nomes de motoristas
  const motoristaMap = useMemo(
    () => Object.fromEntries(motoristas.map((m) => [m.value, m.label])),
    [motoristas]
  );

  // Criar mapeamento de IDs para nomes de destinatários
  const destinatarioMap = useMemo(() => {
    return Object.fromEntries(
      destinatarios.map((d) => [
        d.value,
        {
          nome: d.label.split(" - ")[0], // Pega apenas o nome
          cidade: d.label.split(" - ")[1] || "Sem cidade", // Pega a cidade
        },
      ])
    );
  }, [destinatarios]);

  // Criar mapeamento de IDs para nomes de clientes
  const clienteMap = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.value, c.label])),
    [clientes]
  );

  // Processar dados do gráfico
  const processedData = useMemo(() => {
    const clienteDataMap = {};

    if (data && data.length > 0) {
      data.forEach((item) => {
        const clienteNome = clienteMap[item.cliente_id] || "Desconhecido";

        if (!clienteDataMap[clienteNome]) {
          clienteDataMap[clienteNome] = {
            name: clienteNome,
            total: 0,
            details: [],
          };
        }

        clienteDataMap[clienteNome].total += 1; // Incrementar total de ocorrências
        clienteDataMap[clienteNome].details.push({
          NF: item.nf,
          motorista: motoristaMap[item.motorista_id] || "Desconhecido",
          cliente: clienteNome,
          cidade: item.cidade || "Sem cidade",
        });
      });
    }

    return Object.values(clienteDataMap).sort((a, b) => b.total - a.total); // Ordenar por total
  }, [data, motoristaMap, clienteMap]);

  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setModalData(data.activePayload[0].payload);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const chartHeight = Math.max(300, processedData.length * 50 + 50);

  return (
    <div style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          barCategoryGap="5%"
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tick={{ fill: "#fff" }}
            allowDecimals={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: "#fff" }}
            width={150}
            tickFormatter={(tick) =>
              tick.length > 22 ? `${tick.substring(0, 22)}...` : tick
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="total"
            fill="#0dcaf0"
            barSize={140}
          >
            <LabelList
              dataKey="total"
              position="insideLeft"
              fill="#fff"
              fontSize={14}
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
            <h4>{modalData.name}</h4>
            <p>Quantidade: {modalData.total}</p>

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
                      <th style={cellStyle}>Cidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.details.map((item, idx) => (
                      <tr key={idx}>
                        <td style={cellStyle}>{item.NF}</td>
                        <td style={cellStyle}>{item.motorista}</td>
                        <td style={cellStyle}>{item.cliente}</td>
                        <td style={cellStyle}>{item.cidade}</td>
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

export default ChartClientes;

