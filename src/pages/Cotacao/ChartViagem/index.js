import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList, defs
} from 'recharts';
import { Card, CardBody, Label } from 'reactstrap';

const ChartViagem = ({ data }) => {
  const viagensPorSemana = {
    'Semana 1': new Set(),
    'Semana 2': new Set(),
    'Semana 3': new Set(),
    'Semana 4': new Set(),
  };

  data.forEach((row) => {
    const emissao = row.emissaoDate || row["Emissão"];
    const idViagem = row['Viagem'];
    if (!emissao || isNaN(new Date(emissao).getTime())) return;

    const date = new Date(emissao);
    const diaDoMes = date.getDate();
    const semanaDoMes = `Semana ${Math.floor((diaDoMes - 1) / 7) + 1}`;
    const chave = `${idViagem}-${date.toISOString().slice(0, 10)}`;

    if (viagensPorSemana[semanaDoMes]) {
      viagensPorSemana[semanaDoMes].add(chave);
    }
  });

  const dados = Object.entries(viagensPorSemana).map(([semana, set]) => ({
    semana,
    viagens: set.size,
  }));

  return (
    <Card className="custom-card">
      <CardBody>
        <Label style={{ color: '#fff' }}>📅 Viagens por Semana do Mês</Label>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados}>
            <defs>
              <linearGradient id="gradientViagens" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00c6ff" />
                <stop offset="100%" stopColor="#0072ff" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="semana" stroke="#fff" />
            <YAxis allowDecimals={false} stroke="#fff" />
            <Tooltip
              contentStyle={{ backgroundColor: "#333", borderColor: "#888", color: "#fff" }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              cursor={{ fill: '#666', fillOpacity: 0.1 }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="viagens" fill="url(#gradientViagens)" name="Viagens">
              <LabelList dataKey="viagens" position="top" fill="#fff" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default ChartViagem;
