import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import { FaCheckCircle, FaEye, FaExclamationTriangle, FaTrash } from "react-icons/fa";
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
import { fetchDocumento, fetchViagem } from "../../../services/api";
import { Row } from "reactstrap";

const GerarViagem = () => {
  const [numeroViagem, setNumeroViagem] = useState("");
  const [numeroCTE, setNumeroCTE] = useState("");
  const [custoViagem, setCustoViagem] = useState(0);
  const [ctes, setCtes] = useState([]);
  const [rentabilidade, setRentabilidade] = useState({ percentual: 0, cor: "gray", status: "" });
  const [oldPercentual, setOldPercentual] = useState(0);

 

  const buscarViagem = async () => {
    if (!numeroViagem) return;
  
    try {
        const response = await fetchViagem(numeroViagem);

      if (response.data && response.data.detalhe) {
        setCtes(response.data.detalhe.documentos_transporte || []);
        calcularRentabilidade(response.data.detalhe.documentos_transporte, custoViagem);
      }
    } catch (error) {
      console.error("Erro ao buscar viagem:", error);
    }
  };
  const buscarCTE = async () => {
    if (!numeroCTE) return;
  
    try {
      const response = await fetchDocumento(numeroCTE);
  
      if (response.detalhe) {
        const novoCTE = {
            numero_cte: response.detalhe.docTransporte || numeroCTE,
            peso: response.detalhe.peso || 0,
            volume: response.detalhe.vol || 0,  // Garante que tenha um valor válido
            quantidade: response.detalhe.qtde || 0,
            tomador: response.detalhe.tomador,
            destino: response.detalhe.destino,
            cidade: response.detalhe.cidade,
            prazo_entrega: response.detalhe.prazo_entrega || 0,
            valor_receita_total: response.detalhe.valor_receita_total || 0,
            valor_frete: response.detalhe.valor_receita_sep.valor_frete || 0,
            icms: response.detalhe.valor_receita_sep.icms || 0,
            ad_valorem: response.detalhe.valor_receita_sep.gris || 0,
            valor_mercadoria: response.detalhe.valor_mercadoria || 0,
            peso_total: response.detalhe.peso_total || 0,
            cubagem_total: response.detalhe.cubagem_total || 0,
            nfs: response.detalhe.nfs || []
          };
          
  
        // Atualiza o estado com os novos CTEs e garante a atualização correta da rentabilidade
        setCtes((prevCtes) => {
          const novosCtes = [...prevCtes, novoCTE];
          return novosCtes;
        });
  
        setNumeroCTE(""); // Limpa o input após adicionar o CTE
        setTimeout(() => document.getElementById("inputCTE").focus(), 100); // Mantém o foco no campo
        
      }
    } catch (error) {
      console.error("Erro ao buscar CTE:", error);
    }
  };
  
  // Monitora o estado ctes e recalcula a rentabilidade quando muda
  useEffect(() => {
    calcularRentabilidade(ctes, custoViagem);
  }, [ctes, custoViagem]); // Recalcula sempre que ctes ou custoViagem mudar
  

  const removerCTE = (index) => {
    const novaLista = [...ctes];
    novaLista.splice(index, 1);
    setCtes(novaLista);
    calcularRentabilidade(novaLista, custoViagem);
  };

  const calcularRentabilidade = (listaCtes, custo) => {
    let receitaTotal = listaCtes.reduce((total, cte) => total + cte.valor_receita_total, 0);
    
    const lucro = receitaTotal - custo;
    const percentual = custo !== 0 ? ((lucro / custo) * 100).toFixed(2) : 0; 
  
    setOldPercentual(rentabilidade.percentual);
  
    setRentabilidade({
      percentual: percentual >= 0 ? `+${percentual}` : percentual,  // Mostra "+" para valores positivos
      status: lucro > 0 ? `Viagem lucrativa` : 
             lucro === 0 ? "Viagem sem lucro." : `Viagem no prejuízo`,
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

  console.log(ctes )

  return (
    <Container>
        <p style={{textAlign:'start', width:'100%', fontSize:50, fontWeight:700}}>Carga Lucrativa</p>
        <InputContainer>
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontSize: 15 }}>Número da Viagem</label>
    <Input
      type="text"
      placeholder="Buscar por Número da Viagem"
      value={numeroViagem}
      onChange={(e) => setNumeroViagem(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && buscarViagem()}
    />
  </div>

  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontSize: 15 }}>Número do CTE</label>
    <Input
  id="inputCTE"
  type="text"
  placeholder="Buscar por Número do CTE"
  value={numeroCTE}
  onChange={(e) => setNumeroCTE(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault(); // Evita pular de campo
      buscarCTE();
    }
  }}
/>

  </div>

  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontSize: 15 }}>Custo da Viagem</label>
    <Input
      type="number"
      placeholder="Custo da Viagem"
      value={custoViagem}
      onChange={atualizarCusto}
    />
  </div>
</InputContainer>




      <CardContainer>
        <Row>
      <table>
    <thead>
      <tr>
        <th>CTE</th>
        <th>Cliente</th>
        <th>Receita Total</th>
        <th>Quantidade de Notas</th>
        <th>Prazo de Entrega</th>
        <th>Peso Total</th>
        <th>Volume</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      {ctes.length > 0 ? (
        ctes.map((cte, index) => {
          const lucroCte = cte.valor_receita_total - custoViagem / ctes.length;
          const cteStatus =
            lucroCte > 0 ? { icon: <FaCheckCircle style={{ color: "green" }} /> } :
            lucroCte === 0 ? { icon: <FaEye style={{ color: "gold" }} /> } :
            { icon: <FaExclamationTriangle style={{ color: "red" }} /> };

          return (
            <tr key={index}>
              <td>{cteStatus.icon} <strong>{cte.numero_cte}</strong></td>
              <td className="truncate">{cte.tomador}</td>
              <td>R$ {cte.valor_receita_total.toFixed(2)}</td>
              <td>{cte.nfs.length}</td>
              <td>{cte.prazo_entrega}</td>
              <td>{cte.peso_total} kg</td>
              <td>{cte.volume}</td>
              <td>
                <RemoveButton onClick={() => removerCTE(index)}>
                  <FaTrash size={16} />
                </RemoveButton>
              </td>
            </tr>
          );
        })
      ) : (
        <tr><td colSpan="8">Nenhum CTE carregado.</td></tr>
      )}
    </tbody>
  </table>

        <LucroContainer style={{ background: rentabilidade.backgroundColor }}>
  <LucroPercentual cor={rentabilidade.cor}>
    {rentabilidade.percentual > 0 ? "+" : ""}
    <CountUp 
      start={oldPercentual} 
      end={rentabilidade.percentual} 
      duration={1.5} 
      decimals={2} 
    />
    %
  </LucroPercentual>
  <p>{rentabilidade.status}</p>
  <SaveButton onClick={salvarViagem}>Salvar Viagem</SaveButton>
</LucroContainer>
</Row>
      </CardContainer>
    </Container>
  );
};

export default GerarViagem;
