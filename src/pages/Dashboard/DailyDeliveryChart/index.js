import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DailyDeliveryChartByPraça = ({ data }) => {
  const [praçaDeliveryData, setPraçaDeliveryData] = useState([]);
  const colorPalette = ['#32CD32', '#FF4500', '#8A2BE2', '#FFD700', '#FF6347', '#1E90FF', '#f1f', '#4682B4'];

  const processPraçaDeliveryData = () => {
    const groupedData = {};
    const allDates = new Set();
  
    data.forEach((item) => {
      if (item.entregue_em && item['praça_destino']) {
        const entregaDate = parseDate(item.entregue_em);
        const formattedDate = entregaDate.toISOString().split('T')[0];
        allDates.add(formattedDate);
  
        const praça = item['praça_destino'];
        const notas = item.NF ? item.NF.split(",").map((nf) => nf.trim()) : []; // Divide as notas
  
        if (!groupedData[praça]) {
          groupedData[praça] = {};
        }
        if (!groupedData[praça][formattedDate]) {
          groupedData[praça][formattedDate] = 0;
        }
  
        const previsaoDate = parseDate(item.previsao_entrega);
  
        // Incrementa por cada nota individual
        notas.forEach(() => {
          if (entregaDate > previsaoDate && item.atraso_cliente === 0) { // Verifica se não é culpa do cliente
            groupedData[praça][formattedDate] += 1;
          }
        });
      }
    });
  
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
  
    const result = sortedDates.map((date) => {
      const entry = { date: formatDate(date) };
      Object.keys(groupedData).forEach((praça) => {
        entry[praça] = groupedData[praça][date] || 0;
      });
      return entry;
    });
  
    setPraçaDeliveryData(result);
  };
  

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  useEffect(() => {
    if (data.length > 0) {
      processPraçaDeliveryData();
    }
  }, [data]);

  return (
    <>
      <h5>Entregas Atrasadas por Praça</h5>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={praçaDeliveryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" interval={0} style={{ fontSize: 15 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(praçaDeliveryData[0] || {})
            .filter((key) => key !== 'date')
            .map((praça, index) => (
              <Line
                key={praça}
                type="monotone"
                dataKey={praça}
                stroke={colorPalette[index % colorPalette.length]}
                name={`Praça: ${praça}`}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default DailyDeliveryChartByPraça;
