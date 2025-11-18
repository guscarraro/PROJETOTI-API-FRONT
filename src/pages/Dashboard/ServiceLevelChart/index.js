import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import ModalInfo from "./ModalInfo";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

const ServiceLevelChart = ({ data }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [generalServiceLevel, setGeneralServiceLevel] = useState({
    onTime: 0,
    late: 0,
    level: 0,
  });
  const [serviceLevelByPraça, setServiceLevelByPraça] = useState([]);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };
  const calculateGeneralServiceLevel = (filteredData) => {
    let totalOnTime = 0;
    let totalLate = 0;

    filteredData.forEach((item) => {
      const entregaDate = item.entregue_em ? parseDate(item.entregue_em) : null;
      const previsaoDate = item.previsao_entrega
        ? parseDate(item.previsao_entrega)
        : null;

      if (item.cte_entregue === 1 && entregaDate) {
        if (
          item.atraso_cliente === 1 || // Culpa do cliente conta como "No Prazo"
          (entregaDate &&
            previsaoDate &&
            entregaDate <= previsaoDate &&
            item.atraso_cliente === 0)
        ) {
          totalOnTime += 1;
        } else if (
          entregaDate &&
          previsaoDate &&
          entregaDate > previsaoDate &&
          item.atraso_cliente === 0
        ) {
          totalLate += 1;
        }
      }
    });

    const total = totalOnTime + totalLate;

    setGeneralServiceLevel({
      onTime: totalOnTime,
      late: totalLate,
      level: total > 0 ? ((totalOnTime / total) * 100).toFixed(1) : 0,
    });
  };

  const handleSliceClick = (entry, index, chartType, selectedPraça = null) => {
    let filteredData = [];

    // Nome da praça, se for gráfico por praça
    const praça = chartType === "praça" ? selectedPraça : null;

    const titlePrefix = praça ? `${praça} - ` : "";

    if (entry.name.includes("No Prazo")) {
      filteredData = data.filter((item) => {
        const entrega = parseDate(item.entregue_em);
        const previsao = parseDate(item.previsao_entrega);

        return (
          item.cte_entregue === 1 &&
          (item.atraso_cliente === 1 ||
            (entrega &&
              previsao &&
              entrega <= previsao &&
              item.atraso_cliente === 0)) &&
          (!praça || item.praca_destino === praça)
        );
      });

      setModalTitle(`${titlePrefix}CTEs Entregues no Prazo`);
    } else {
      filteredData = data.filter((item) => {
        const entrega = parseDate(item.entregue_em);
        const previsao = parseDate(item.previsao_entrega);

        return (
          item.cte_entregue === 1 &&
          entrega &&
          previsao &&
          entrega > previsao &&
          item.atraso_cliente === 0 &&
          (!praça || item.praca_destino === praça)
        );
      });

      setModalTitle(`${titlePrefix}CTEs Entregues com Atraso`);
    }

    setModalData(filteredData);
    setModalIsOpen(true);
  };

  const calculateServiceLevelByPraça = (filteredData) => {
    const dataByPraça = {};

    filteredData.forEach((item) => {
      const entregaDate = item.entregue_em ? parseDate(item.entregue_em) : null;
      const previsaoDate = item.previsao_entrega
        ? parseDate(item.previsao_entrega)
        : null;

      if (item.cte_entregue === 1 && entregaDate) {
        const praça = item["praca_destino"];
        if (!praça) return;

        if (!dataByPraça[praça]) {
          dataByPraça[praça] = { onTime: 0, late: 0 };
        }

        if (
          item.atraso_cliente === 1 || // Culpa do cliente conta como "No Prazo"
          (entregaDate &&
            previsaoDate &&
            entregaDate <= previsaoDate &&
            item.atraso_cliente === 0)
        ) {
          dataByPraça[praça].onTime += 1;
        } else if (
          entregaDate &&
          previsaoDate &&
          entregaDate > previsaoDate &&
          item.atraso_cliente === 0
        ) {
          dataByPraça[praça].late += 1;
        }
      }
    });

    const serviceLevelData = Object.keys(dataByPraça)
      .filter(
        (praça) => dataByPraça[praça].onTime + dataByPraça[praça].late > 0
      )
      .map((praça) => {
        const onTime = dataByPraça[praça].onTime;
        const late = dataByPraça[praça].late;
        const total = onTime + late;

        return {
          praça,
          onTime,
          late,
          level: total > 0 ? ((onTime / total) * 100).toFixed(1) : 0,
        };
      });

    setServiceLevelByPraça(serviceLevelData);
  };

  useEffect(() => {
    if (data.length > 0) {
      calculateGeneralServiceLevel(data);
      calculateServiceLevelByPraça(data);
    }
  }, [data]);

  return (
    <>
      <h5>Nível de Serviço Geral</h5>
      <h2>{generalServiceLevel.level} %</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={[
              {
                name: `No Prazo (${generalServiceLevel.onTime})`,
                value: generalServiceLevel.onTime,
              },
              {
                name: `Atrasadas (${generalServiceLevel.late})`,
                value: generalServiceLevel.late,
              },
            ]}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={({ name, value }) => `${name}: ${value}`}
            onClick={(entry, index) =>
              handleSliceClick(entry, index, "general")
            }
          >
            {[
              { name: "No Prazo", value: generalServiceLevel.onTime },
              { name: "Atrasadas", value: generalServiceLevel.late },
            ].map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "#00FF7F" : "#FF4500"}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
      {/* <h5>Nível de Serviço por Praça</h5> */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}
      >
        {serviceLevelByPraça
          .filter((item) => item.praça !== "SC") // <<< AQUI, exatamente aqui!
          .map((praçaData, index) => (
            <div
              key={index}
              style={{
                width: "300px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <h6 style={{ fontSize: "20px", fontWeight: "bold" }}>
                {praçaData.praça}
              </h6>
              <p
                style={{
                  margin: 0,
                  fontWeight: "bold",
                  color: "#00FF7F",
                  fontSize: "20px",
                }}
              >
                {praçaData.level} %
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: `No Prazo (${praçaData.onTime})`,
                        value: praçaData.onTime,
                      },
                      {
                        name: `Atrasadas (${praçaData.late})`,
                        value: praçaData.late,
                      },
                    ]}
                    dataKey="value"
                    outerRadius={80}
                    label={false}
                    onClick={(entry) =>
                      handleSliceClick(entry, null, "praça", praçaData.praça)
                    }
                  >
                    {[
                      { name: "No Prazo", value: praçaData.onTime },
                      { name: "Atrasadas", value: praçaData.late },
                    ].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#00FF7F" : "#FF4500"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ))}
      </div>
      <ModalInfo
        isOpen={modalIsOpen}
        toggle={() => setModalIsOpen(!modalIsOpen)}
        title={modalTitle}
        data={modalData}
      />
    </>
  );
};

export default ServiceLevelChart;
