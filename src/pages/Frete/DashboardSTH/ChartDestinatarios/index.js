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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "reactstrap";

const ChartDestinatarios = ({ data, motoristas, destinatarios, clientes }) => {
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const destinatarioMap = useMemo(() => {
    return Object.fromEntries(
      destinatarios.map((d) => [
        d.value,
        {
          nome: d.label.split(" - ")[0],
          cidade: d.label.split(" - ")[1] || "Sem cidade",
        },
      ])
    );
  }, [destinatarios]);

  const motoristaMap = useMemo(
    () => Object.fromEntries(motoristas.map((m) => [m.value, m.label])),
    [motoristas]
  );

  const clienteMap = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.value, c.label])),
    [clientes]
  );
  const formatDate = (date) => {
    if (!date || date === "N/A") return "N/A"; // Caso não haja data
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const processedData = useMemo(() => {
    const destinatarioDataMap = {};

    if (data && data.length > 0) {
      data.forEach((item) => {
        const destinatarioInfo = destinatarioMap[item.destino_id] || {
          nome: "Desconhecido",
          cidade: "Sem cidade",
        };

        if (!destinatarioDataMap[destinatarioInfo.nome]) {
          destinatarioDataMap[destinatarioInfo.nome] = {
            nome: destinatarioInfo.nome,
            cidade: destinatarioInfo.cidade,
            total: 0,
            details: [],
          };
        }

        destinatarioDataMap[destinatarioInfo.nome].total += 1;
        destinatarioDataMap[destinatarioInfo.nome].details.push({
          NF: item.nf,
          motorista: motoristaMap[item.motorista_id] || "Desconhecido",
          cliente: clienteMap[item.cliente_id] || "Desconhecido",
          tipo: item.motivo || "N/A",
          data: formatDate(item.data_viagem || "N/A"),
        });
      });
    }

    return Object.values(destinatarioDataMap).sort((a, b) => b.total - a.total);
  }, [data, motoristaMap, destinatarioMap, clienteMap]);

  const groupByClient = (details) => {
    const grouped = {};
    details.forEach((item) => {
      const cliente = item.cliente || "Desconhecido";
      grouped[cliente] = (grouped[cliente] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, quantidade]) => ({
      name,
      quantidade,
    }));
  };

  const handleBarClick = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      const selectedData = e.activePayload[0].payload;
      setModalData({
        ...selectedData,
        groupedClients: groupByClient(selectedData.details),
      });
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const chartHeight = Math.max(300, processedData.length * 40 + 50);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA46BE"];

  return (
    <div style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
  <BarChart
    data={processedData}
    layout="vertical"
    margin={{ top: 20, right: 30, left: 100, bottom: 5 }} // Alinhado com ChartClientes
    barCategoryGap="5%"
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
      width={150}
      tick={{ fill: "#fff" }}
      axisLine={{ stroke: "#fff" }}
      tickLine={{ stroke: "#fff" }}
      tickFormatter={(tick) =>
        tick.length > 15 ? `${tick.substring(0, 13)}...` : tick
      }
    />
    <Tooltip />
    <Bar dataKey="total" fill="#82ca9d" barSize={140}> {/* Barras ajustadas */}
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
              <h5>Gráfico de Pizza</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={modalData.groupedClients.slice(0, 5)}
                    dataKey="quantidade"
                    nameKey="name"
                    outerRadius={100}
                    fill="#8884d8"
                    label={(entry) => `${entry.name}: ${entry.quantidade}`}
                  >
                    {modalData.groupedClients.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
                  <th style={cellStyle}>Tipo</th>
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
