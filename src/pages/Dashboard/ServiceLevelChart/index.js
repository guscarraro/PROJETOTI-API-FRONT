import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const ServiceLevelChart = ({ data }) => {
  const [generalServiceLevel, setGeneralServiceLevel] = useState({ onTime: 0, late: 0, level: 0 });
  const [serviceLevelByPraça, setServiceLevelByPraça] = useState([]);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  const calculateGeneralServiceLevel = (filteredData) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const deliveredNotes = filteredData.filter((item) => {
      const entregaDate = item.entregue_em ? parseDate(item.entregue_em) : null;
      return (
        item.cte_entregue === 1 &&
        entregaDate &&
        entregaDate.getMonth() === currentMonth &&
        entregaDate.getFullYear() === currentYear
      );
    });

    const onTime = deliveredNotes.filter((item) => {
      const entregaDate = item.entregue_em ? parseDate(item.entregue_em) : null;
      const previsaoDate = item.previsao_entrega ? parseDate(item.previsao_entrega) : null;
      return entregaDate && previsaoDate && entregaDate <= previsaoDate;
    }).length;

    const late = deliveredNotes.length - onTime;

    setGeneralServiceLevel({
      onTime,
      late,
      level: deliveredNotes.length > 0 ? ((onTime / deliveredNotes.length) * 100).toFixed(1) : 0,
    });
  };

  const calculateServiceLevelByPraça = (filteredData) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const dataByPraça = {};

    filteredData.forEach((item) => {
      const entregaDate = item.entregue_em ? parseDate(item.entregue_em) : null;
      if (
        item.cte_entregue === 1 &&
        entregaDate &&
        entregaDate.getMonth() === currentMonth &&
        entregaDate.getFullYear() === currentYear
      ) {
        const praça = item['praça_destino'];
        if (!praça) return; // Ignorar caso a praça seja nula
        if (!dataByPraça[praça]) {
          dataByPraça[praça] = { onTime: 0, late: 0, total: 0 };
        }
        const previsaoDate = item.previsao_entrega ? parseDate(item.previsao_entrega) : null;
        if (entregaDate && previsaoDate) {
          if (entregaDate <= previsaoDate) {
            dataByPraça[praça].onTime += 1;
          } else {
            dataByPraça[praça].late += 1;
          }
          dataByPraça[praça].total += 1;
        }
      }
    });

    const serviceLevelData = Object.keys(dataByPraça)
      .filter((praça) => dataByPraça[praça].total > 0) // Filtrar praças com total > 0
      .map((praça) => ({
        praça,
        onTime: dataByPraça[praça].onTime,
        late: dataByPraça[praça].late,
        level:
          dataByPraça[praça].total > 0
            ? ((dataByPraça[praça].onTime / dataByPraça[praça].total) * 100).toFixed(1)
            : 0,
      }));

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
      {/* Nível de Serviço Geral */}
      <h5>Nível de Serviço Geral</h5>
      <h2>{generalServiceLevel.level} %</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={[
              { name: `No Prazo (${generalServiceLevel.onTime})`, value: generalServiceLevel.onTime },
              { name: `Atrasadas (${generalServiceLevel.late})`, value: generalServiceLevel.late },
            ]}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {[{ name: 'No Prazo', value: generalServiceLevel.onTime }, { name: 'Atrasadas', value: generalServiceLevel.late }].map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#00FF7F' : '#FF4500'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>

      {/* Nível de Serviço por Praça */}
      <h5>Nível de Serviço por Praça</h5>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {serviceLevelByPraça.map((praçaData, index) => (
          <div key={index} style={{ width: '300px', marginBottom: '20px', textAlign: 'center' }}>
            <h6>{praçaData.praça}</h6>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#00FF7F' }}>
              {praçaData.level} %
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: `No Prazo (${praçaData.onTime})`, value: praçaData.onTime },
                    { name: `Atrasadas (${praçaData.late})`, value: praçaData.late },
                  ]}
                  dataKey="value"
                  outerRadius={80}
                  label={false}
                >
                  {[{ name: 'No Prazo', value: praçaData.onTime }, { name: 'Atrasadas', value: praçaData.late }].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#00FF7F' : '#FF4500'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </>
  );
};

export default ServiceLevelChart;
