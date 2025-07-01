import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardBody } from 'reactstrap';

const ChartPeso = ({ data }) => {
  const pesoPorViagemMap = {};
  const pesoPorRotaMap = {};

  data.forEach((row) => {
    const viagem = row['Viagem'];
    const rota = row['Rota'];
    pesoPorViagemMap[viagem] = (pesoPorViagemMap[viagem] || 0) + row.peso;
    pesoPorRotaMap[rota] = (pesoPorRotaMap[rota] || new Set()).add(viagem);
  });

  const pesoPorViagem = Object.entries(pesoPorViagemMap).map(([viagem, peso]) => ({
    viagem,
    peso
  }));

  const pesoPorRota = Object.entries(pesoPorRotaMap)
    .filter(([_, viagens]) => viagens.size > 1)
    .map(([rota, viagens]) => ({
      rota,
      viagens: viagens.size
    }));

  return (
    <Card className="custom-card">
      <CardBody>
        <h5>Peso por Viagem</h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={pesoPorViagem}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="viagem" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="peso" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>

        {pesoPorRota.length > 0 && (
          <>
            <h5 className="mt-4">Rotas com múltiplas viagens</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pesoPorRota}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rota" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="viagens" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default ChartPeso;