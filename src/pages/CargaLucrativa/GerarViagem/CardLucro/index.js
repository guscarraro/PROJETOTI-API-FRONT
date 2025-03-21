import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import { LucroContainer, CustoPercentual, SaveButton, MiniCard, MiniCardContainer } from "../style";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import { Row, Col } from "reactstrap";
import { FaWeightHanging, FaTruckMoving, FaMoneyBillWave, FaChartLine, FaDollarSign, FaCut, FaArrowUp, FaWallet, FaHandHoldingUsd } from "react-icons/fa";
import LoadingDots from "../../../../components/Loading";

const CardLucro = ({ ctes, custoViagem, numeroViagem, setCtes, setNumeroViagem, setNumeroCTE, setCustoViagem,setFilialOrigem,setFilialDestino,setObs,setTipoVeiculo,setTipoOperacao, tipoVeiculo, obs, custoManual,setCargaDividida,setCustoManual, cargaDividida, tipoOperacao }) => {
  const [rentabilidade, setRentabilidade] = useState({ custoPercentual: 0, lucroPercentual: 0, status: "", totalPeso: 0, lucroValor: 0,receitaTotal: 0  });
  const [oldCustoPercentual, setOldCustoPercentual] = useState(0);
  const [loading, setLoading] = useState(false);

  let metaRentabilidade;

  if (tipoOperacao === "MTZ - 1") {
    metaRentabilidade = 37;
  } else if (tipoOperacao === "MTZ - 2") {
    metaRentabilidade = 37;
  } else if (tipoOperacao === "MTZ - 3") {
    metaRentabilidade = 45;
  } else if (tipoOperacao === "MTZ - 4") {
    metaRentabilidade = 50;
  } else if (tipoOperacao === "MTZ") {
    metaRentabilidade = 25;
  } else if (tipoOperacao === "MTZ - Transferencia") {
    metaRentabilidade = 18;
  } else {
    metaRentabilidade = 30; // Padrão para outras operações
  }

  useEffect(() => {
    calcularRentabilidade(ctes, custoViagem);
  }, [ctes, custoViagem, tipoOperacao]);

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
      receitaTotal: receitaTotal,
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
    if (!Array.isArray(ctes) || ctes.length === 0) {
        toast.error("Adicione pelo menos um CTE antes de salvar a viagem.");
        return;
    }

    if ((!rentabilidade.metaAtingida || custoManual) && !obs.trim()) {
        toast.error("É obrigatório preencher a observação quando a meta não for atingida ou o custo manual estiver ativado.");
        return;
    }

    if (!tipoOperacao) {
        toast.error("É obrigatório selecionar o Tipo de Operação antes de salvar a viagem.");
        return;
    }

    if (!tipoVeiculo) {
        toast.error("É obrigatório selecionar o Tipo de Veículo antes de salvar a viagem.");
        return;
    }

    setLoading(true);
    
    let receitaTotal = 0;
    let totalPeso = 0;
    for (let i = 0; i < ctes.length; i++) {
        receitaTotal += ctes[i]?.valor_receita_total || 0;
        totalPeso += ctes[i]?.peso_total || 0;
    }

    const viagemData = {
        numero_viagem: numeroViagem,
        data_inclusao: new Date().toISOString().slice(0, 19).replace("T", " "),
        total_receita: receitaTotal,
        total_entregas: ctes.length,
        total_peso: totalPeso,
        total_custo: custoViagem,
        margem_custo: rentabilidade.custoPercentual,
        filial_origem: ctes.length > 0 ? [...new Set(ctes.map(cte => cte?.filialOrigem).filter(Boolean))].join("/") : "",
        filial_destino: ctes.length > 0 ? [...new Set(ctes.map(cte => cte?.filialDestino).filter(Boolean))].join("/") : "",
        placa: "NA",
        motorista: "NA",
        obs: obs || "",
        custo_manual: custoManual ? "S" : "N",
        carga_dividida: cargaDividida ? "S" : "N",
        tipo_operacao: tipoOperacao || "",
        tipo_veiculo: tipoVeiculo || ""
    };

    try {
        const parseDate = (dateString) => {
            if (!dateString) return null;

            const dateParts = dateString.split(" ");
            if (dateParts.length !== 2) return null; 

            const [day, month, year] = dateParts[0].split("/"); 
            const time = dateParts[1];

            const formattedDate = `${year}-${month}-${day}T${time}`;
            const dateObject = new Date(formattedDate);

            return isNaN(dateObject.getTime()) ? null : dateObject.toISOString();
        };

        // 🔥 Evita erro ao mapear notas fiscais dentro dos CTEs
        const documentosTransporte = ctes.map(cte => {
            
          
          const formatarPrazoEntrega = (prazo) => {
            if (!prazo || prazo.trim() === "" || prazo === "0000-00-00 00:00:00") {
                return null; // ✅ Envia null corretamente
            }
            return prazo; // Mantém a data original se já estiver correta
        };
          const formatarAgendameto = (agendamento) => {
            if (!agendamento || agendamento.trim() === "" || agendamento === "0000-00-00 00:00:00") {
                return null; // ✅ Envia null corretamente
            }
            return agendamento; // Mantém a data original se já estiver correta
        };
        
            return {
                numero_cte: String(cte?.numero_cte || ""),
                peso: cte?.peso || 0,
                volume: cte?.volume || 0,
                quantidade: cte?.quantidade || 0,
                tomador: cte?.tomador || "",
                destino: cte?.destino || "",
                cidade: cte?.cidade || "",
                prazo_entrega: formatarPrazoEntrega(cte.prazo_entrega), 
                agendamento: formatarAgendameto(cte.agendamento), 
                valor_receita_total: cte?.valor_receita_total || 0,
                valor_frete: cte?.valor_frete || 0,
                icms: cte?.icms || 0,
                ad_valorem: cte?.ad_valorem || 0,
                outros_valores: {},
                valor_mercadoria: cte?.valor_mercadoria || 0,
                peso_total: cte?.peso_total || 0,
                cubagem_total: cte?.cubagem_total || 0,
                filial_origem: cte?.filialOrigem || "",  // Adiciona a filial de origem
                filial_destino: cte?.filialDestino || "",
                notas_fiscais: Array.isArray(cte?.nfs)
                    ? cte.nfs.map(nf => ({
                        numero_nf: String(nf?.numero_nf || "0"),
                        peso: nf?.peso || 0,
                        valor: nf?.valor || 0,
                        cubagem: nf?.cubagem || 0
                    }))
                    : []
            };
        });

        viagemData.documentos_transporte = documentosTransporte;
       
        
        await apiLocal.createOrUpdateViagem(viagemData);

        toast.success("Viagem salva com sucesso!");
        setLoading(false);
        setCtes([]);
        setNumeroViagem("");
        setNumeroCTE("");
        setCustoViagem(0);
        setFilialOrigem("");
        setFilialDestino("");
        setTipoVeiculo(null);
        setTipoOperacao(null);
        setCargaDividida(false)
        setCustoManual(false)
        setObs("");
    } catch (error) {
        console.error("Erro ao salvar viagem:", error.response ? error.response.data : error);
        toast.error("Erro ao salvar viagem.");
    } finally {
        setLoading(false);
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
    <FaHandHoldingUsd   size={24} />
    <span>Reiceita faltante para Meta</span>
    <strong>
      R$ <CountUp 
        end={Math.max(0, (custoViagem / (metaRentabilidade / 100)) - rentabilidade.receitaTotal)} 
        duration={1.5} 
        decimals={2} 
      />
    </strong>
  </MiniCard>
</Col>
<Col md="6">
  <MiniCard style={{ backgroundColor: rentabilidade.backgroundColor?.replace("0.35", "0.1") || "rgba(255, 255, 255, 1)" }}>
    <FaCut  size={24} />
    <span>Reduzir Custo para bater Meta</span>
    <strong>
      R$ -<CountUp 
        end={Math.max(0, custoViagem - (rentabilidade.receitaTotal * (metaRentabilidade / 100)))} 
        duration={1.5} 
        decimals={2} 
      />
    </strong>
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
              <span>Limite de custo</span>
              <strong><CountUp end={metaRentabilidade} duration={1.5} decimals={2} />%</strong>

            </MiniCard>
          </Col>
          <Col md="12">
            <MiniCard style={{ backgroundColor: rentabilidade.backgroundColor?.replace("0.35", "0.1") || "rgba(255, 255, 255, 1)" }}>



              <FaDollarSign size={35} />
              <span>Saldo</span>
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
              <SaveButton onClick={salvarViagem} disabled={loading}>
                {loading ? <LoadingDots/> : "Salvar Viagem"}
              </SaveButton>

            </>
          ) : (
            <>
              <>Meta Não Alcançada ❌</>
              <SaveButton onClick={salvarViagem} disabled={loading}>
                {loading ? <LoadingDots/> : "Salvar Viagem"}
              </SaveButton>

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
