import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
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
        <Label>Viagens por Semana do Mês</Label>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="viagens" fill="#00FFFF" name="Viagens" />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default ChartViagem;
