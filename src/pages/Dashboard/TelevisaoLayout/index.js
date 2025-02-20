import React, { useState, useEffect, useRef } from "react";
import { Box } from "../styles";
import ServiceLevelChart from "../ServiceLevelChart";
import TopRemetentesChart from "../TopRemetentesChart";
import DailyDeliveryChartByPraça from "../DailyDeliveryChart";
import InfoOcorren from "./InfoOcorren";
import apiLocal from "../../../services/apiLocal";

const TelevisaoLayout = ({ data, dataFinal, dataInicial }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ocorrencias, setOcorrencias] = useState([]);
  const scrollContainerRef = useRef(null);
  const [scrollDirection, setScrollDirection] = useState("down");

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  useEffect(() => {
    const totalSlides = ocorrencias.length > 0 ? 3 : 2;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % totalSlides;

        if (nextSlide === 2 && ocorrencias.length > 0) {
          fetchOcorrencias(); // Atualiza ocorrências ao entrar no slide 2
        }

        return nextSlide;
      });
    }, 100000);

    return () => clearInterval(interval);
  }, [ocorrencias]);

  useEffect(() => {
    if (currentSlide === 2 && ocorrencias.length > 0) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
  }, [currentSlide, ocorrencias]);

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

  const startAutoScroll = () => {
    stopAutoScroll(); // Garante que não criamos múltiplos intervalos

    const container = scrollContainerRef.current;
    if (!container) return;

    const contentHeight = container.scrollHeight;
    const boxHeight = container.clientHeight;

    if (contentHeight > boxHeight) {
      const scrollSpeed = 50; // Tempo entre cada scroll (menor = mais rápido)
      const scrollStep = 1; // Pixels a cada passo

      const interval = setInterval(() => {
        if (scrollDirection === "down") {
          container.scrollTop += scrollStep;
          if (container.scrollTop + boxHeight >= contentHeight - 5) {
            setScrollDirection("up");
          }
        } else {
          container.scrollTop -= scrollStep;
          if (container.scrollTop <= 0) {
            setScrollDirection("down");
          }
        }
      }, scrollSpeed);

      container.dataset.scrollInterval = interval;
    }
  };

  const stopAutoScroll = () => {
    const container = scrollContainerRef.current;
    if (container && container.dataset.scrollInterval) {
      clearInterval(container.dataset.scrollInterval);
      container.dataset.scrollInterval = null;
      container.scrollTop = 0; // Reseta ao trocar de slide
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
          <Box
            ref={scrollContainerRef}
            style={{
              maxHeight: "90vh",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <InfoOcorren ocorrencias={ocorrencias} />
          </Box>
        </div>
      )}
    </div>
  );
};

export default TelevisaoLayout;
