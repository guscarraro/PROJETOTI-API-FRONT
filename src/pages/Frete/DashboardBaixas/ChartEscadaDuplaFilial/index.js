import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";


const ChartEscadaDuplaFilial = ({ data }) => {
  const porFilial = {};

  data.forEach((item) => {
    const filial = item.filial?.trim() || "Desconhecida";
    const tipo = item.tp_colaborador?.trim();

    if (!porFilial[filial]) {
      porFilial[filial] = { MOTORISTA: 0, COLABORADOR: 0 };
    }

    if (tipo === "MOTORISTA") {
      porFilial[filial].MOTORISTA += 1;
    } else {
      porFilial[filial].COLABORADOR += 1;
    }
  });

  const chartData = Object.entries(porFilial).map(([filial, valores]) => ({
    filial,
    ...valores,
  }));

  return (
    <div style={{ width: "90vw", maxWidth: "100%", height: 400, paddingLeft: 20, paddingRight: 20 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fill: "#fff" }}/>
          <YAxis dataKey="filial" type="category" width={200} tick={{ fill: "#fff" }}/>
          <Tooltip />
          <Legend />
          <Bar dataKey="COLABORADOR" fill="#FF6347" name="Por Colaborador" />
          <Bar dataKey="MOTORISTA" fill="#1E90FF" name="Por Motorista" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  
};

export default ChartEscadaDuplaFilial;
