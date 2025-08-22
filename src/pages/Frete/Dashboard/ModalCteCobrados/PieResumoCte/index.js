import React from "react";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

/**
 * data esperado:
 * [{ name: "ACORDO...", value: 10 }, ...]
 */
const PieResumoCte = ({ data }) => {
  const total = data.reduce((acc, d) => acc + (d.value || 0), 0);

  // Cores fixas por status (mantém consistência entre renders)
  const COLOR_BY_NAME = {
    "ACORDO COMERCIAL VIGENTE": "#4CAF50",        // verde
    "CARGA LOTAÇÃO NO DESTINATARIO": "#2196F3",   // azul
    "CLIENTE NÃO AUTORIZOU PERMANÊNCIA": "#FF9800", // laranja
    "NÚMERO DA COBRANÇA": "#E91E63",              // rosa/vermelho
  };

  // fallback para itens fora do mapa (se um dia entrarem mais categorias)
  const FALLBACK = ["#9C27B0", "#009688", "#795548", "#3F51B5", "#FFC107"];

  const getColor = (name, idx) => COLOR_BY_NAME[name] || FALLBACK[idx % FALLBACK.length];

  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            dataKey="value"
            nameKey="name"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={(entry) =>
              `${entry.name} (${entry.value}${
                total ? ` / ${Math.round((entry.value / total) * 100)}%` : ""
              })`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieResumoCte;
