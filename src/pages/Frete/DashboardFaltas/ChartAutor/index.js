import React, { useState } from "react";
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
import { Modal, ModalHeader, ModalBody, Table, Button } from "reactstrap";
import ChartPieType from "./ChartPieType";

const ChartAutor = ({ data }) => {
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Agrupar os dados por "autor_por"
  const groupedData = {};
  data.forEach((item) => {
    const autor = item.autor_por || "Não informado";
    if (!groupedData[autor]) {
      groupedData[autor] = [];
    }
    groupedData[autor].push(item);
  });

  // Converter os dados agrupados para o formato do gráfico e ordenar
  const chartData = Object.entries(groupedData)
    .map(([name, values]) => ({
      name,
      value: values.length,
      details: values,
      totalValue: values.reduce((acc, item) => acc + parseFloat(item.valor_falta || 0), 0), // Totalizar o valor
    }))
    .sort((a, b) => b.value - a.value); // Ordenar do maior para o menor

  const handleBarClick = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      setModalData(e.activePayload[0].payload);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalData(null);
    setIsModalOpen(false);
  };

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          barCategoryGap="10%"
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            style={{ fontSize: 14, fill: "#fff" }}
            tick={{ angle: 0, fontSize: 12 }}
          />
          <YAxis
            type="number"
            style={{ fontSize: 14, fill: "#fff" }}
            allowDecimals={false}
          />
          <Tooltip formatter={(value, name) => [`${value} ocorrência(s)`, name]} />
          <Bar dataKey="value" fill="#1E90FF">
            {/* Colocar os valores na base das barras */}
            <LabelList
              dataKey="value"
              position="insideBottom"
              fill="#fff"
              fontSize={14}
              fontWeight="bold"
              style={{ textAnchor: "middle" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {isModalOpen && modalData && (
        <Modal
        isOpen={isModalOpen}
        toggle={closeModal}
        size="xl" // Torna o modal extra largo
        style={{ maxWidth: "90%", width: "auto" }} // Adapta a largura ao conteúdo
      >
        <ModalHeader toggle={closeModal}>
          Autor: {modalData.name} | Total: R$ {modalData.totalValue.toFixed(2)}
        </ModalHeader>
        <ModalBody>
          {/* Gráfico de Pizza */}
          <div style={{ marginBottom: "20px", paddingTop: "20px" }}>
            <ChartPieType data={modalData.details} />
          </div>
          {/* Tabela com bordas */}
          <Table responsive striped bordered>
            <thead>
              <tr>
                <th>Nota Fiscal</th>
                <th>Descrição</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Tipo de Ocorrência</th>
                <th>Motorista</th>
              </tr>
            </thead>
            <tbody>
              {modalData.details.map((item, index) => (
                <tr key={index}>
                  <td>{item.nf || "N/A"}</td>
                  <td>{item.obs || "Sem descrição"}</td>
                  <td>{item.cliente_nome || "Desconhecido"}</td>
                  <td>R$ {parseFloat(item.valor_falta || 0).toFixed(2)}</td>
                  <td>
                    {item.tipo_ocorren === "F"
                      ? "Falta"
                      : item.tipo_ocorren === "A"
                      ? "Avaria"
                      : "Inversão"}
                  </td>
                  <td>{item.motorista_nome || "Desconhecido"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button color="secondary" onClick={closeModal}>
            Fechar
          </Button>
        </ModalBody>
      </Modal>
      
      )}
    </div>
  );
};

export default ChartAutor;
