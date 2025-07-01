import React from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList
} from 'recharts';
import { Card, CardBody } from 'reactstrap';

const ChartPeso = ({ data }) => {
  const agrupamento = {}; // chave: `${viagem}|${origem}→${destino}`


  function parseValorBr(numeroStr) {
  if (typeof numeroStr === 'number') return numeroStr;
  if (!numeroStr || typeof numeroStr !== 'string') return 0;
  return parseFloat(numeroStr.replace(/\./g, '').replace(',', '.')) || 0;
}

  for (const row of data) {
    const viagemId = row["Viagem"] || row["Número Viagem"] || row["Número CTE"];
    const origem = row["UF Orig"] || row["UF Origem"];
    const destino = row["UF Dest"] || row["UF Destino"];
    const receita = parseValorBr(row["Valor bruto"]) || row["receita"] || 0;

    const peso = parseFloat(row["Peso2"]) || row["peso"] || 0;

    if (!viagemId || !origem || !destino) continue;

    const chaveViagem = `${viagemId}|${origem}→${destino}`;

    if (!agrupamento[chaveViagem]) {
      agrupamento[chaveViagem] = {
        rota: `${origem} → ${destino}`,
        viagens: 1,
        peso: 0,
        receita: 0
      };
    }

    agrupamento[chaveViagem].peso += peso;
    agrupamento[chaveViagem].receita += receita;
  }

  // Agora agrupamos por rota novamente para somar os dados finais
  const ufMap = {}; // chave: `${UF Orig} → ${UF Dest}`

  for (const chave in agrupamento) {
    const item = agrupamento[chave];
    const rota = item.rota;

    if (!ufMap[rota]) {
      ufMap[rota] = { viagens: 0, peso: 0, receita: 0, uf: rota };
    }

    ufMap[rota].viagens += 1;
    ufMap[rota].peso += item.peso;
    ufMap[rota].receita += item.receita;
  }

  const dados = [];
  for (const chave in ufMap) {
    dados.push(ufMap[chave]);
  }

  let totalPeso = 0;
  let totalViagens = 0;
  for (let i = 0; i < dados.length; i++) {
    totalPeso += dados[i].peso;
    totalViagens += dados[i].viagens;
  }

  const mediaPeso = totalViagens > 0 ? (totalPeso / totalViagens).toFixed(2) : 0;

  return (
    <Card className="custom-card">
      <CardBody>
        <h5 style={{ color: '#fff' }}>Peso, Viagens e Receita por UF Origem → Destino</h5>
        <p style={{ color: '#fff' }}>Média de peso por viagem: <strong>{mediaPeso} kg</strong></p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="uf" tick={{ fontSize: 10, fill: '#fff' }} />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: '#fff' }}
              label={{ value: 'Viagens', angle: -90, position: 'insideLeft', fill: '#fff' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#fff' }}
              label={{ value: 'Peso / Receita', angle: -90, position: 'insideRight', fill: '#fff' }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'Receita (R$)') {
                  return [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name];
                }
                return [value, name];
              }}
              contentStyle={{ backgroundColor: '#333', borderColor: '#666', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />

            <Bar yAxisId="left" dataKey="viagens" fill="url(#colorViagens)" name="Viagens">
              <LabelList dataKey="viagens" position="top" fill="#fff" />
            </Bar>

            <Bar yAxisId="right" dataKey="peso" fill="url(#colorPeso)" name="Peso Total (kg)">
              <LabelList dataKey="peso" position="top" fill="#fff" />
            </Bar>

            <Bar yAxisId="right" dataKey="receita" fill="url(#colorReceita)" name="Receita (R$)">
              <LabelList dataKey="receita" position="top" fill="#fff" />
            </Bar>

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="receita"
              stroke="#00FF88"
              strokeWidth={3}
              name="Receita (R$)"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />

            <defs>
              <linearGradient id="colorViagens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00c6ff" stopOpacity={1} />
                <stop offset="100%" stopColor="#0072ff" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7971e" stopOpacity={1} />
                <stop offset="100%" stopColor="#ffd200" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FF88" stopOpacity={1} />
                <stop offset="100%" stopColor="#007F5F" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default ChartPeso;
