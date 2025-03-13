import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import { LucroContainer, CustoPercentual, SaveButton, MiniCard, MiniCardContainer } from "../style";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import { Row, Col } from "reactstrap";
import { FaWeightHanging, FaTruckMoving, FaMoneyBillWave, FaChartLine, FaCheckCircle, FaTimesCircle, FaDollarSign } from "react-icons/fa";

const CardLucro = ({ ctes, custoViagem, numeroViagem, setCtes, setNumeroViagem, setNumeroCTE, setCustoViagem }) => {
  const [rentabilidade, setRentabilidade] = useState({ custoPercentual: 0, lucroPercentual: 0, status: "", totalPeso: 0, lucroValor: 0 });
  const [oldCustoPercentual, setOldCustoPercentual] = useState(0);
  const metaRentabilidade = 18; // Meta de 18% da receita

  useEffect(() => {
    calcularRentabilidade(ctes, custoViagem);
  }, [ctes, custoViagem]);
  
  useEffect(() => {
    if (custoViagem === 0 && ctes.length === 0) {
      setRentabilidade((prev) => ({
        ...prev,
        backgroundColor: "transparent", // Cinza escuro quando não há dados
        status: "Aguardando dados",
        custoPercentual: 0,
        lucroPercentual: 0,
        lucroValor: 0,
      }));
    }
  }, [custoViagem, ctes]);
  
  const calcularRentabilidade = (listaCtes, custo) => {
    let receitaTotal = 0;
    let totalPeso = 0;
    let totalEntregas = listaCtes.length;

    for (let i = 0; i < listaCtes.length; i++) {
      receitaTotal += listaCtes[i].valor_receita_total;
      totalPeso += listaCtes[i].peso_total;
    }

    const custoPercentual = receitaTotal !== 0 ? ((custo / receitaTotal) * 100).toFixed(2) : 100;
    const metaAtingida = custoPercentual <= metaRentabilidade;
    
    const lucro = receitaTotal - custo;
    const lucroPercentual = receitaTotal !== 0 ? ((lucro / receitaTotal) * 100).toFixed(2) : 0;

    setOldCustoPercentual(rentabilidade.custoPercentual);
    setRentabilidade({
        custoPercentual: custoPercentual,
        lucroPercentual: lucroPercentual,
        lucroValor: receitaTotal !== 0 ? lucro : 0,
      
        status:
          receitaTotal === 0 && custo === 0
            ? "Aguardando dados"
            : lucro > 0
            ? "Viagem lucrativa"
            : lucro === 0
            ? "Viagem sem lucro."
            : "Viagem no prejuízo",
      
        backgroundColor:
          receitaTotal === 0 && custo === 0
            ? "transparent" // Cinza escuro quando não há dados
            : metaAtingida
            ? "rgba(0, 255, 127, 0.35)" // Verde quando a meta é atingida
            : "rgba(255, 69, 0, 0.35)", // Vermelho quando não atingida
      
        totalEntregas,
        totalPeso,
        metaAtingida,
      });
      
  };

  const salvarViagem = async () => {
    if (ctes.length === 0) {
      toast.error("Adicione pelo menos um CTE antes de salvar a viagem.");
      return;
    }

    let receitaTotal = 0;
    let totalPeso = 0;
    for (let i = 0; i < ctes.length; i++) {
      receitaTotal += ctes[i].valor_receita_total;
      totalPeso += ctes[i].peso_total;
    }

    const viagemData = {
      numero_viagem: numeroViagem || `V${Date.now()}`,
      data_inclusao: new Date().toISOString(),
      total_receita: receitaTotal,
      total_entregas: ctes.length,
      total_peso: totalPeso,
      total_custo: custoViagem
    };

    try {
      await apiLocal.createOrUpdateViagem(viagemData);
      toast.success("Viagem salva com sucesso!");
      setCtes([]);
      setNumeroViagem("");
      setNumeroCTE("");
      setCustoViagem(1500);
    } catch (error) {
      toast.error("Erro ao salvar viagem.");
    }
  };

  return (
    <LucroContainer style={{ backgroundColor: rentabilidade.backgroundColor }}>
      {/* Exibir Percentual de Custo */}
      <CustoPercentual>
        <CountUp start={oldCustoPercentual} end={parseFloat(rentabilidade.custoPercentual)} duration={1.5} decimals={2} /> %
      </CustoPercentual>

      <MiniCardContainer>
        <Row>
          <Col md="6">
            <MiniCard style={{ backgroundColor: rentabilidade.backgroundColor?.replace("0.35", "0.1") || "rgba(255, 255, 255, 1)" }}>


              <FaTruckMoving size={24} />
              <span>Entregas</span>
              <strong><CountUp end={rentabilidade.totalEntregas} duration={1.5} /></strong>

            </MiniCard>
          </Col>
          <Col md="6">
            <MiniCard style={{ backgroundColor: rentabilidade.backgroundColor?.replace("0.35", "0.1") || "rgba(255, 255, 255, 1)" }}>


              <FaWeightHanging size={24} />
              <span>Peso Total</span>
              <strong><CountUp end={rentabilidade.totalPeso} duration={1.5} decimals={2} /> kg</strong>

            </MiniCard>
          </Col>
          <Col md="6">
            <MiniCard style={{ backgroundColor: rentabilidade.backgroundColor?.replace("0.35", "0.1") || "rgba(255, 255, 255, 1)" }}>


              <FaMoneyBillWave size={24} />
              <span>Custo</span>
              <strong>R$ <CountUp end={custoViagem} duration={1.5} decimals={2} /></strong>

            </MiniCard>
          </Col>
          <Col md="6">
            <MiniCard style={{ backgroundColor: rentabilidade.backgroundColor?.replace("0.35", "0.1") || "rgba(255, 255, 255, 1)" }}>


              <FaChartLine size={24} />
              <span>Meta Rentabilidade</span>
              <strong><CountUp end={metaRentabilidade} duration={1.5} decimals={2} />%</strong>

            </MiniCard>
          </Col>
          <Col md="12">
            <MiniCard style={{ backgroundColor: rentabilidade.backgroundColor?.replace("0.35", "0.1") || "rgba(255, 255, 255, 1)" }}>


                
              <FaDollarSign size={35} />
              <span>Lucro Previsto</span>
              <strong>R$ <CountUp end={rentabilidade.lucroValor} duration={1.5} decimals={2} /></strong>


                
            </MiniCard>
          </Col>
        </Row>
      </MiniCardContainer>

      {rentabilidade.backgroundColor !== "transparent" && (
  <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}>
    {rentabilidade.metaAtingida ? (
      <>
      <>Meta Atingida ✅</>
      <SaveButton onClick={salvarViagem}>Salvar Viagem</SaveButton>
      </>
    ) : (
      <>
      <>Meta Não Alcançada ❌</>
      <SaveButton onClick={salvarViagem}>Salvar Viagem</SaveButton>
      </>
    )}
  </p>
)}

{/* 
      <SaveButton onClick={salvarViagem}>Salvar Viagem</SaveButton> */}
    </LucroContainer>
  );
};

export default CardLucro;
