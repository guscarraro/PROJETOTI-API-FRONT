import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Gera um array de dias do mês (1..31).
 */
const generateDays = () => Array.from({ length: 31 }, (_, i) => i + 1);

/**
 * Componente que exibe um gráfico de linhas para:
 * - Ocorrências resolvidas
 * - Ocorrências não resolvidas ("Não entregue")
 * Eixo X: dia do mês
 * Eixo Y: quantidade de ocorrências
 */
const LineOcorrenDias = ({ data }) => {
  /**
   * Aqui, assumimos que `data` é o array de ocorrências completo
   * que você quer processar. Cada item deve ter, no mínimo:
   * {
   *   datainclusao: "2023-09-22T12:00:00.000Z",
   *   status: "Resolvido" ou "Não entregue" (por exemplo),
   *   ...
   * }
   *
   * Se no seu sistema "status" for outro texto, ajuste abaixo.
   */

  // Passo 1: criar um map day -> { resolvidas, naoResolvidas }
  const dayMap = {};
  generateDays().forEach((day) => {
    dayMap[day] = { resolvidas: 0, naoResolvidas: 0 };
  });

  // Passo 2: iterar sobre 'data', pegar o dia do 'datainclusao' e incrementar
  data.forEach((oc) => {
    // Se não tiver "datainclusao" nem "horario_saida", ignoramos
    if (!oc.datainclusao && !oc.horario_saida) return;
  
    // Se a ocorrência estiver resolvida ou não entregue,
    // usamos 'horario_saida' (se existir) para definir o dia;
    // senão, usamos 'datainclusao'.
    let dateToUse = oc.datainclusao;
    if ((oc.status === "Resolvido" || oc.status === "Não entregue") && oc.horario_saida) {
      dateToUse = oc.horario_saida;
    }
  
    const dateObj = new Date(dateToUse);
    const day = dateObj.getDate(); // dia do mês (1..31)
  
    // Garante que o map tenha o dia
    if (!dayMap[day]) {
      dayMap[day] = { resolvidas: 0, naoResolvidas: 0 };
    }
  
    // Checa status e incrementa
    if (oc.status === "Resolvido") {
      dayMap[day].resolvidas += 1;
    } else if (oc.status === "Não entregue") {
      dayMap[day].naoResolvidas += 1;
    }
  });
  

  // Passo 3: converter dayMap em array de objetos para o Recharts
  // Formato final: [ { day: 1, resolvidas: X, naoResolvidas: Y }, ... ]
  const chartData = generateDays().map((day) => ({
    day: day,
    resolvidas: dayMap[day].resolvidas,
    naoResolvidas: dayMap[day].naoResolvidas,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        
        {/* Eixo X -> o dia do mês */}
        <XAxis
          dataKey="day"
          tick={{ fill: "#fff", fontSize: 12 }}
          label={{ value: "Dia do Mês", position: "insideBottom", fill: "#fff" }}
        />
        
        {/* Eixo Y -> quantidade de ocorrências */}
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#fff", fontSize: 12 }}
          label={{
            value: "Quantidade",
            angle: -90,
            position: "insideLeft",
            fill: "#fff",
          }}
        />
        
        <Tooltip
  labelFormatter={(value) => `Dia: ${value}`}
  contentStyle={{ backgroundColor: "#333", border: "1px solid #fff" }}
  labelStyle={{ color: "#fff" }}
  itemStyle={{ color: "#fff" }}
/>

        <Legend wrapperStyle={{ color: "#fff" }} />

        {/* Linha para as ocorrências resolvidas */}
        <Line
          type="monotone"
          dataKey="resolvidas"
          stroke="#4CAF50" // verde
          strokeWidth={2}
          activeDot={{ r: 8 }}
          name="Resolvidas"
        />

        {/* Linha para as não resolvidas */}
        <Line
          type="monotone"
          dataKey="naoResolvidas"
          stroke="#F44336" // vermelho
          strokeWidth={2}
          activeDot={{ r: 8 }}
          name="Não Resolvidas"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineOcorrenDias;
