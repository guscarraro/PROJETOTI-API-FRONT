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
  Legend,
  LabelList,
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

  const rotas = Object.values(rotasMap).map((rotaObj) => {
    const viagens = Array.from(rotaObj.viagensSet);
    const receitaTotal = viagens.reduce(
      (soma, viagem) => soma + rotaObj.viagensReceita[viagem],
      0
    );

    return {
      rota: rotaObj.rota,
      viagens: viagens.length,
      receita: receitaTotal,
    };
  });

  return (
    <Card className="custom-card">
      <CardBody>
        <h5 style={{ color: '#fff' }}>📍 Receita e Viagens por Rota</h5>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={rotas}>
            <defs>
              <linearGradient id="viagensGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#42a5f5" />
                <stop offset="100%" stopColor="#1e88e5" />
              </linearGradient>
              <linearGradient id="receitaGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffb74d" />
                <stop offset="100%" stopColor="#ff9800" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="rota" tick={{ fill: '#fff', fontSize: 10 }} />
            <YAxis
              yAxisId="left"
              label={{ value: 'Viagens', angle: -90, position: 'insideLeft', fill: '#fff' }}
              allowDecimals={false}
              tick={{ fill: '#fff' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Receita (R$)', angle: -90, position: 'insideRight', fill: '#fff' }}
              tickFormatter={(v) => `R$ ${v.toLocaleString('pt-BR')}`}
              tick={{ fill: '#fff' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#333", borderColor: "#888", color: "#fff" }}
              formatter={(value, name) =>
                name === 'Receita (R$)'
                  ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : value
              }
            />
            <Legend wrapperStyle={{ color: '#fff' }} />

            <Bar
              yAxisId="left"
              dataKey="viagens"
              fill="url(#viagensGradient)"
              name="Viagens"
              barSize={30}
            >
              <LabelList dataKey="viagens" position="top" fill="#fff" />
            </Bar>

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="receita"
              stroke="url(#receitaGradient)"
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
