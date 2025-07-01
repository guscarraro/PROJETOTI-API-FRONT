// ChartRoi.js
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardBody } from "reactstrap";

const ChartRoi = ({ receitaTotal, custoTotal }) => {
  const lucroMes = receitaTotal - custoTotal;

  const formatMoeda = (valor) =>
    `R$ ${valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const projecao = [
    {
      periodo: "6 meses",
      receita: receitaTotal * 6,
      custo: custoTotal * 6,
      retorno: lucroMes * 6,
    },
    {
      periodo: "1 ano",
      receita: receitaTotal * 12,
      custo: custoTotal * 12,
      retorno: lucroMes * 12,
    },
    {
      periodo: "2 anos",
      receita: receitaTotal * 24,
      custo: custoTotal * 24,
      retorno: lucroMes * 24,
    },
    {
      periodo: "3 anos",
      receita: receitaTotal * 36,
      custo: custoTotal * 36,
      retorno: lucroMes * 36,
    },
  ];

  return (
    <Card className="custom-card">
      <CardBody>
        <h5 style={{ color: "#fff" }}>📈 Projeção de ROI (Retorno)</h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={projecao}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="periodo" stroke="#fff" />
            <YAxis
              stroke="#fff"
              tickFormatter={(value) => formatMoeda(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#333",
                borderColor: "#888",
                color: "#fff",
              }}
              formatter={(value) => formatMoeda(value)}
            />
            <Legend wrapperStyle={{ color: "#fff" }} />

            <Line
              type="monotone"
              dataKey="receita"
              stroke="url(#gradientReceita)"
              name="Receita Total"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="custo"
              stroke="url(#gradientCusto)"
              name="Custo Total"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="retorno"
              stroke="url(#gradientLucro)"
              name="Lucro (ROI)"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />

            <defs>
              <linearGradient id="gradientReceita" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00c6ff" />
                <stop offset="100%" stopColor="#0072ff" />
              </linearGradient>
              <linearGradient id="gradientCusto" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff8a00" />
                <stop offset="100%" stopColor="#e52e71" />
              </linearGradient>
              <linearGradient id="gradientLucro" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00e676" />
                <stop offset="100%" stopColor="#00c853" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default ChartRoi;
