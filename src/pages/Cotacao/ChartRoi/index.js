
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

  const projecao = [
    { periodo: "6 meses", retorno: lucroMes * 6 },
    { periodo: "1 ano", retorno: lucroMes * 12 },
    { periodo: "2 anos", retorno: lucroMes * 24 },
    { periodo: "3 anos", retorno: lucroMes * 36 },
  ];

  return (
    <Card className="custom-card">
      <CardBody>
        <h5>📈 Projeção de ROI (Retorno)</h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={projecao}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="retorno" stroke="#00e676" name="Retorno R$" />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default ChartRoi;
