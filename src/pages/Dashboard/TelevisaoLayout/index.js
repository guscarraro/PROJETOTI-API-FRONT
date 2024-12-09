import React, { useState, useEffect } from "react";
import { Box } from "../styles";
import ServiceLevelChart from "../ServiceLevelChart";
import TopRemetentesChart from "../TopRemetentesChart";
import DailyDeliveryChartByPraça from "../DailyDeliveryChart";

const TelevisaoLayout = ({ data,dataFinal,dataInicial  }) => {
  const [currentChart, setCurrentChart] = useState(0); // 0 para ServiceLevelChart, 1 para outros gráficos

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChart((prev) => (prev === 0 ? 1 : 0)); // Alterna entre 0 e 1 a cada 60 segundos
    }, 60000); // 60 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, []);

  return (
    <div style={{ width: "99%", height: "99%",  color: "#fff" }}>
      {currentChart === 0 ? (
        <div style={{ padding: "20px" }}>
          <Box>
            <ServiceLevelChart data={data} />
          </Box>
        </div>
      ) : (
        <div style={{ padding: "20px" }}>
          <Box>
            <TopRemetentesChart data={data} />
          </Box>
          <Box>
            <DailyDeliveryChartByPraça data={data} dataFinal={dataFinal} dataInicial={dataInicial}/>
          </Box>
        </div>
      )}
    </div>
  );
};

export default TelevisaoLayout;
