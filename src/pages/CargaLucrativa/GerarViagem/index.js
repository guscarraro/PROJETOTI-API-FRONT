import React, { useState } from "react";
import CountUp from "react-countup";
import { FaCheckCircle, FaEye, FaExclamationTriangle } from "react-icons/fa";
import apiLocal from "../../../services/apiLocal";
import {
  Container,
  InputContainer,
  Input,
  CardContainer,
  CTECard,
  RemoveButton,
  LucroContainer,
  LucroPercentual,
  SaveButton
} from "./style";

const GerarViagem = () => {
  const [numeroViagem, setNumeroViagem] = useState("");
  const [numeroCTE, setNumeroCTE] = useState("");
  const [custoViagem, setCustoViagem] = useState(1500);
  const [ctes, setCtes] = useState([]);
  const [rentabilidade, setRentabilidade] = useState({ percentual: 0, cor: "gray", status: "" });
  const [oldPercentual, setOldPercentual] = useState(0);

  const buscarCTE = async () => {
    if (!numeroCTE) return;

    try {
      const response = await apiLocal.getDocumentoTransporte(numeroCTE);
      if (response.data) {
        setCtes((prev) => [...prev, response.data]);
        calcularRentabilidade([...ctes, response.data], custoViagem);
      }
    } catch (error) {
      console.error("Erro ao buscar CTE:", error);
    }
  };

  const removerCTE = (index) => {
    const novaLista = [...ctes];
    novaLista.splice(index, 1);
    setCtes(novaLista);
    calcularRentabilidade(novaLista, custoViagem);
  };

  const calcularRentabilidade = (listaCtes, custo) => {
    let receitaTotal = 0;
    for (let i = 0; i < listaCtes.length; i++) {
      receitaTotal += listaCtes[i].valor_receita_total;
    }

    const lucro = receitaTotal - custo;
    const percentual = custo > 0 ? ((lucro / custo) * 100).toFixed(2) : 0;

    setOldPercentual(rentabilidade.percentual);

    setRentabilidade({
      percentual: parseFloat(percentual),
      status: lucro > 0 ? "Viagem lucrativa!" : lucro === 0 ? "Viagem sem lucro." : "Viagem no prejuízo!",
      backgroundColor:
        lucro > 0 ? "rgba(0, 255, 127, 0.35)" :
        lucro === 0 ? "rgba(255, 215, 0, 0.35)" : "rgba(255, 69, 0, 0.35)",
    });
  };

  const atualizarCusto = (e) => {
    const novoCusto = parseFloat(e.target.value) || 0;
    setCustoViagem(novoCusto);
    calcularRentabilidade(ctes, novoCusto);
  };

  const salvarViagem = async () => {
    if (ctes.length === 0) {
      alert("Adicione pelo menos um CTE antes de salvar a viagem.");
      return;
    }

    let receitaTotal = 0;
    let totalPeso = 0;
    for (let i = 0; i < ctes.length; i++) {
      receitaTotal += ctes[i].valor_receita_total;
      totalPeso += ctes[i].peso_total;
    }

    const margemCusto = custoViagem > 0 ? ((receitaTotal - custoViagem) / custoViagem) * 100 : 0;

    const viagemData = {
      numero_viagem: numeroViagem || `V${Date.now()}`,
      data_inclusao: new Date().toISOString(),
      total_receita: receitaTotal,
      total_entregas: ctes.length,
      total_peso: totalPeso,
      total_custo: custoViagem,
      margem_custo: margemCusto.toFixed(2),
      documentos_transporte: ctes.map(cte => ({
        numero_cte: cte.numero_cte,
        peso: cte.peso,
        volume: cte.vol,
        quantidade: cte.qtde,
        tomador: cte.tomador,
        destino: cte.destino,
        cidade: cte.cidade,
        prazo_entrega: cte.prazo_entrega,
        valor_receita_total: cte.valor_receita_total,
        icms: cte.valor_receita_sep.icms,
        valor_frete: cte.valor_receita_sep.valor_frete,
        ad_valorem: cte.valor_receita_sep.ad_valorem,
        outros_valores: cte.valor_receita_sep.outros || 0,
        valor_mercadoria: cte.valor_mercadoria,
        peso_total: cte.peso_total,
        cubagem_total: cte.cubagem_total
      }))
    };

    try {
      await apiLocal.createOrUpdateViagem(viagemData);
      alert("Viagem salva com sucesso!");
      setCtes([]);
      setNumeroViagem("");
      setNumeroCTE("");
      setCustoViagem(1500);
      setRentabilidade({ percentual: 0, status: "" });
    } catch (error) {
      console.error("Erro ao salvar viagem:", error);
      alert("Erro ao salvar viagem.");
    }
  };

  return (
    <Container>
        <p style={{textAlign:'start', width:'100%', fontSize:50, fontWeight:700}}>Carga Lucrativa</p>
   <InputContainer>
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{fontSize:15}}>Número da Viagem (opcional)</label>
    <Input
      type="text"
      placeholder="Número da Viagem (opcional)"
      value={numeroViagem}
      onChange={(e) => setNumeroViagem(e.target.value)}
    />
  </div>

  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{fontSize:15}}>Buscar por Número do CTE</label>
    <Input
      type="text"
      placeholder="Buscar por Número do CTE"
      value={numeroCTE}
      onChange={(e) => setNumeroCTE(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && buscarCTE()}
    />
  </div>

  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{fontSize:15}}>Custo da Viagem</label>
    <Input
      type="number"
      placeholder="Custo da Viagem"
      value={custoViagem}
      onChange={atualizarCusto}
    />
  </div>
</InputContainer>



      <CardContainer>
        <div style={{ width: "70%", paddingRight: "20px" }}>
          {ctes.length > 0 ? (
            ctes.map((cte, index) => {
              const lucroCte = cte.valor_receita_total - custoViagem / ctes.length;
              const cteStatus =
                lucroCte > 0 ? { background: "rgba(0, 255, 127, 0.35)", text: "Dentro da margem", icon: <FaCheckCircle style={{ color: "green", marginRight: "8px" }} /> } :
                lucroCte === 0 ? { background: "rgba(255, 215, 0, 0.35)", text: "Sem ganho sem perda", icon: <FaEye style={{ color: "gold", marginRight: "8px" }} /> } :
                { background: "rgba(255, 69, 0, 0.35)", text: "Prejuízo", icon: <FaExclamationTriangle style={{ color: "red", marginRight: "8px" }} /> };

              return (
                <CTECard key={index} style={{ background: cteStatus.background }}>
                  <p>{cteStatus.icon} <strong>{cteStatus.text}</strong></p>
                  <p><strong>Cliente:</strong> {cte.tomador}</p>
                  <p><strong>Receita Total:</strong> R$ {cte.valor_receita_total.toFixed(2)}</p>
                  <p><strong>Quantidade de Notas:</strong> {cte.nfs.length}</p>
                  <p><strong>Prazo de Entrega:</strong> {cte.prazo_entrega}</p>
                  <p><strong>Peso Total:</strong> {cte.peso_total} kg</p>
                  <p><strong>Volume:</strong> {cte.vol}</p>
                  <RemoveButton onClick={() => removerCTE(index)}>Remover</RemoveButton>
                </CTECard>
              );
            })
          ) : (
            <p>Nenhum CTE carregado.</p>
          )}
        </div>

        <LucroContainer style={{ background: rentabilidade.backgroundColor }}>
          <LucroPercentual cor={rentabilidade.cor}><CountUp start={oldPercentual} end={rentabilidade.percentual} duration={1.5} decimals={2} />%</LucroPercentual>
          <p>{rentabilidade.status}</p>
          <SaveButton onClick={salvarViagem}>Salvar Viagem</SaveButton>
        </LucroContainer>
      </CardContainer>
    </Container>
  );
};

export default GerarViagem;
