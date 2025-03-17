import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import { LucroContainer, CustoPercentual, SaveButton, MiniCard, MiniCardContainer } from "../style";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import { Row, Col } from "reactstrap";
import { FaWeightHanging, FaTruckMoving, FaMoneyBillWave, FaChartLine, FaDollarSign } from "react-icons/fa";
import LoadingDots from "../../../../components/Loading";

const CardLucro = ({ ctes, custoViagem, numeroViagem, setCtes, setNumeroViagem, setNumeroCTE, setCustoViagem,setFilialOrigem,setFilialDestino,setObs,setTipoVeiculo,setTipoOperacao, tipoVeiculo, obs, custoManual, cargaDividida, tipoOperacao }) => {
  const [rentabilidade, setRentabilidade] = useState({ custoPercentual: 0, lucroPercentual: 0, status: "", totalPeso: 0, lucroValor: 0 });
  const [oldCustoPercentual, setOldCustoPercentual] = useState(0);
  const [loading, setLoading] = useState(false);

  let metaRentabilidade;

  if (tipoOperacao === "MTZ - Metropolitana") {
    metaRentabilidade = 30;
  } else if (tipoOperacao === "MTZ - Raio 2") {
    metaRentabilidade = 35;
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
      receitaTotal += ctes[i].valor_receita_total;
      totalPeso += ctes[i].peso_total;
    }

    const viagemData = {
      numero_viagem: numeroViagem || `V${Date.now()}`,
      data_inclusao: new Date().toISOString().slice(0, 19).replace("T", " "),

      total_receita: receitaTotal,
      total_entregas: ctes.length,
      total_peso: totalPeso,
      total_custo: custoViagem,
      margem_custo: rentabilidade.custoPercentual,
      filial_origem: ctes.length > 0 ? [...new Set(ctes.map(cte => cte.filialOrigem).filter(Boolean))].join("/") : "",
      filial_destino: ctes.length > 0 ? [...new Set(ctes.map(cte => cte.filialDestino).filter(Boolean))].join("/") : "",
      placa: "NA",
      motorista: "NA",
      obs: obs || "",
      custo_manual: custoManual ? "S" : "N",  // 🔥 Adicionando Custo Manual
      carga_dividida: cargaDividida ? "S" : "N",  // 🔥 Adicionando Carga Dividida
      tipo_operacao: tipoOperacao || "",



      tipo_veiculo: tipoVeiculo || "", // Certifica-se de que o tipo do veículo foi preenchido
    };


    try {
      const parseDate = (dateString) => {
        if (!dateString) return null;

        const dateParts = dateString.split(" ");
        if (dateParts.length !== 2) return null; // Certifica-se de que a string tem data e hora

        const [day, month, year] = dateParts[0].split("/"); // Divide a parte da data
        const time = dateParts[1]; // Pega a parte da hora

        // Monta a data no formato correto para o JavaScript (YYYY-MM-DDTHH:mm:ss)
        const formattedDate = `${year}-${month}-${day}T${time}`;
        const dateObject = new Date(formattedDate);

        return isNaN(dateObject.getTime()) ? null : dateObject.toISOString(); // Retorna ISO se válido
      };

      const documentosTransporte = ctes.map(cte => {
        console.log("Prazo Entrega antes da conversão:", cte.prazo_entrega);
        const prazoFormatado = parseDate(cte.prazo_entrega);
        console.log("Prazo Entrega após conversão:", prazoFormatado);

        return {
          numero_cte: String(cte.numero_cte),
          peso: cte.peso,
          volume: cte.volume,
          quantidade: cte.quantidade,
          tomador: cte.tomador,
          destino: cte.destino,
          cidade: cte.cidade,
          prazo_entrega: prazoFormatado ? prazoFormatado.slice(0, 10) : null, // Retorna apenas YYYY-MM-DD
          valor_receita_total: cte.valor_receita_total,
          valor_frete: cte.valor_frete,
          icms: cte.icms,
          ad_valorem: cte.ad_valorem,
          outros_valores: {},
          valor_mercadoria: cte.valor_mercadoria,
          peso_total: cte.peso_total,
          cubagem_total: cte.cubagem_total,
          notas_fiscais: cte.nfs.map(nf => ({
            numero_nf: String(nf.numero_nf || "0"), // Define um valor padrão para evitar erro
            peso: nf.peso,
            valor: nf.valor,
            cubagem: nf.cubagem || 0,
          })),
        };
      });



      viagemData.documentos_transporte = documentosTransporte;
      console.log(viagemData)
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
      setObs("");
    } catch (error) {
      console.error("Erro ao salvar viagem:", error.response ? error.response.data : error);
      toast.error("Erro ao salvar viagem.");
    } finally {
      setLoading(false); // Desativa o loading
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
