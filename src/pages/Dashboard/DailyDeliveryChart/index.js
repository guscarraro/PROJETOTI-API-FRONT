import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DailyDeliveryChartByPraça = ({ data, dataInicial, dataFinal }) => {
  const [praçaDeliveryData, setPraçaDeliveryData] = useState([]);
  const colorPalette = ['#32CD32', '#FF4500', '#8A2BE2', '#FFD700', '#FF6347', '#1E90FF', '#f1f', '#4682B4'];

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`); // Ignora hora
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const processPraçaDeliveryData = () => {
    const groupedData = {};
    const allDates = new Set();
  
    // Ajusta a dataFinal para incluir o próximo dia
    const adjustedFinalDate = new Date(parseDate(dataFinal));
    adjustedFinalDate.setDate(adjustedFinalDate.getDate() + 1); // Adiciona 1 dia
    adjustedFinalDate.setHours(23, 59, 59, 999); // Ajusta para 23:59:59 do próximo dia
  
    // Agora usa o adjustedFinalDate em vez de dataFinal
    data.forEach((item) => {
      if (item.entregue_em && item['praça_destino'] && item.cte_entregue === 1) {
        const entregaDate = parseDate(item.entregue_em);
        const previsaoDate = item.previsao_entrega ? parseDate(item.previsao_entrega) : null;
        const formattedDate = entregaDate.toISOString().split('T')[0];
        const praça = item['praça_destino'];
        const notas = item.NF ? item.NF.split(',').map((nf) => nf.trim()) : [];
  
        // Filtro de data: Só processa os itens dentro do intervalo
        if (entregaDate >= parseDate(dataInicial) && entregaDate <= adjustedFinalDate) {
          allDates.add(formattedDate);
  
          if (!groupedData[praça]) {
            groupedData[praça] = {};
          }
  
          if (!groupedData[praça][formattedDate]) {
            groupedData[praça][formattedDate] = 0;
          }
  
          notas.forEach(() => {
            if (previsaoDate && entregaDate > previsaoDate && item.atraso_cliente === 0) {
              groupedData[praça][formattedDate] += 1;
            }
          });
        }
      }
    });
  
    // Adiciona 1 dia a cada data para corrigir a exibição
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
    const result = sortedDates.map((date) => {
      const entry = { date: formatDate(new Date(new Date(date).setDate(new Date(date).getDate() + 1))) }; // Adiciona 1 dia
      Object.keys(groupedData).forEach((praça) => {
        entry[praça] = groupedData[praça][date] || 0;
      });
      return entry;
    });
  
    setPraçaDeliveryData(result);
  };
  
  
  

  useEffect(() => {
    if (data.length > 0 && dataInicial && dataFinal) {
      processPraçaDeliveryData();
    }
  }, [data, dataInicial, dataFinal]);

  return (
    <>
      <h5>Notas Atrasadas por Praça</h5>
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={praçaDeliveryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" interval={0} tickFormatter={(value) => value} style={{ fontSize: 16, fill:'#fff'}} />
          <YAxis style={{ fontSize: 15, fill:'#fff'}}/>
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
