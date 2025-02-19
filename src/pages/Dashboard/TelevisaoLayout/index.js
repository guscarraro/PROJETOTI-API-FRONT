import React, { useState, useEffect } from "react";
import { Box } from "../styles";
import ServiceLevelChart from "../ServiceLevelChart";
import TopRemetentesChart from "../TopRemetentesChart";
import DailyDeliveryChartByPraça from "../DailyDeliveryChart";
import InfoOcorren from "./InfoOcorren";
import apiLocal from "../../../services/apiLocal";

const TelevisaoLayout = ({ data, dataFinal, dataInicial }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ocorrencias, setOcorrencias] = useState([]);

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  useEffect(() => {
    const totalSlides = ocorrencias.length > 0 ? 3 : 2;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % totalSlides;
        if (nextSlide === 2 && ocorrencias.length > 0) {
          fetchOcorrencias(); // Atualiza as ocorrências ao chegar no slide 2
        }
        return nextSlide;
      });
    }, 60000);
  
    return () => clearInterval(interval);
  }, [ocorrencias]);
  

  const fetchOcorrencias = async () => {
    try {
      const response = await apiLocal.getOcorrencias();
      const abertas = response.data.filter(
        (ocorrencia) => ocorrencia.status === "Pendente"
      );
      setOcorrencias(abertas);
    } catch (error) {
      console.error("Erro ao buscar ocorrências", error);
    }
  };

  return (
    <div style={{ width: "99%", height: "99%", color: "#fff" }}>
      {currentSlide === 0 && (
        <div style={{ padding: "20px" }}>
          <Box>
            <ServiceLevelChart data={data} />
          </Box>
        </div>
      )}
      {currentSlide === 1 && (
        <div style={{ padding: "20px" }}>
          <Box>
            <TopRemetentesChart data={data} />
          </Box>
          <Box>
            <DailyDeliveryChartByPraça data={data} dataFinal={dataFinal} dataInicial={dataInicial} />
          </Box>
        </div>
      )}
      {currentSlide === 2 && ocorrencias.length > 0 && (
        <div style={{ padding: "20px" }}>
          <Box>
            <InfoOcorren ocorrencias={ocorrencias} />
          </Box>
        </div>
      )}
    </div>
  );
};

export default TelevisaoLayout;
