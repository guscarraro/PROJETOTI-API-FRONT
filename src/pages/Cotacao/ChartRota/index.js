import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardBody } from 'reactstrap';

const ChartRota = ({ data }) => {
  const rotasMap = {};

  data.forEach((row) => {
    const rota = row['Rota'];
    const viagem = row['Viagem'];
    const receita = parseFloat(row.receita || 0);

    if (!rotasMap[rota]) {
      rotasMap[rota] = {
        rota,
        viagensSet: new Set(),
        viagensReceita: {},
      };
    }

    rotasMap[rota].viagensSet.add(viagem);

    if (!rotasMap[rota].viagensReceita[viagem]) {
      rotasMap[rota].viagensReceita[viagem] = 0;
    }

    rotasMap[rota].viagensReceita[viagem] += receita;
  });

  // Transformar os dados agregados
  const rotas = Object.values(rotasMap).map((rotaObj) => {
    const viagens = Array.from(rotaObj.viagensSet);
    const receitaTotal = viagens.reduce(
      (soma, viagem) => soma + rotaObj.viagensReceita[viagem],
      0
    );

    return {
      rota: rotaObj.rota,
      viagens: viagens.length,
      receita: receitaTotal
    };
  });

  return (
    <Card className="custom-card">
      <CardBody>
        <h5>📍 Receita e Viagens por Rota</h5>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={rotas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rota" tick={{ fontSize: 10 }} />
            <YAxis
              yAxisId="left"
              label={{ value: 'Viagens', angle: -90, position: 'insideLeft' }}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Receita (R$)', angle: -90, position: 'insideRight' }}
              tickFormatter={(v) => `R$ ${v.toLocaleString('pt-BR')}`}
            />
            <Tooltip
              formatter={(value, name) =>
                name === 'Receita (R$)'
                  ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : value
              }
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="viagens"
              fill="#00FFFF"
              name="Viagens"
              barSize={30}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="receita"
              stroke="#FF9800"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Receita (R$)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default ChartRota;
