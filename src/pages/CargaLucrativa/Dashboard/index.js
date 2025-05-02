import React, { useEffect, useState } from "react";
import apiLocal from "../../../services/apiLocal";
import { Box, CardStyle } from "./style";
import { Row, Col } from "reactstrap";
import { FiArrowDownRight } from "react-icons/fi";
import { FaArrowUp, FaTruck } from "react-icons/fa";


const metasPorOperacao = {
  "MTZ": 25,
  "MTZ - 1": 37,
  "MTZ - 2": 37,
  "MTZ - 3": 45,
  "MTZ - 4": 50,
  "MTZ - Transferencia CAS": 18,
  "MTZ - Transferencia GUA": 18,
  "MTZ - Transferencia IBI": 18,
  "MTZ - Transferencia MGA": 18,
  "MTZ - Transferencia PTO": 18,
  "PTO - 1": 20,
  "PTO - 2": 30,
  "PTO - 3": 40,
  "PTO - 4": 50,
  "MGA - 1": 20,
  "MGA - 2": 30,
  "MGA - 3": 40,
  "MGA - 4": 50,
};

const DashboardViagens = () => {
  const [viagens, setViagens] = useState([]);
  const [mediaGeral, setMediaGeral] = useState(0);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);
  const [mediasPorOperacao, setMediasPorOperacao] = useState({});
  const [custoTransferencia, setCustoTransferencia] = useState(0);
  const [fatorPorTipoVeiculo, setFatorPorTipoVeiculo] = useState({});
  const [custoUltimaPerna, setCustoUltimaPerna] = useState(0);
  const [valorAcimaMeta, setValorAcimaMeta] = useState(null);
  const [percentualAcimaMeta, setPercentualAcimaMeta] = useState(null);
  const [lucroMetaGeral, setLucroMetaGeral] = useState(null);
  const [somaCustoTotal, setSomaCustoTotal] = useState(0);
const [somaLucroTotal, setSomaLucroTotal] = useState(0);

const user = JSON.parse(localStorage.getItem("user"));
const tipoUsuario = user?.tipo;
const isAdminFrete = tipoUsuario === "FreteAdmin" || tipoUsuario === "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";



  useEffect(() => {
    fetchViagens();
  }, []);

  const fetchViagens = async () => {
    const META_GERAL_CUSTO = 45; // 45% de custo máximo permitido

    try {
      const response = await apiLocal.getViagens();
      const viagensData = response.data;
      setViagens(viagensData);

      let somaMargem = 0;
      let quantidade = 0;
      const operacoesTemp = {};
      let somaMargemTransferencia = 0;
      let qtdTransferencia = 0;
      let somaMargemUltima = 0;
      let qtdUltima = 0;
      let somaLucroAcimaMeta = 0;
      let somaMetaTotal = 0;
      let somaReceitaTotal = 0;
      let veiculosTemp = {};

      viagensData.forEach((v) => {
        const margem = parseFloat(v.margem_custo || 0);
        const custo = parseFloat(v.total_custo || 0);
        const receita = parseFloat(v.total_receita || 0);
        const meta = metasPorOperacao[v.tipo_operacao] || 18;

        if (v.margem_custo !== null && v.margem_custo !== undefined) {
          somaMargem += margem;
          quantidade++;
        }

        if (v.tipo_operacao) {
          if (!operacoesTemp[v.tipo_operacao]) {
            operacoesTemp[v.tipo_operacao] = {
              soma: 0,
              quantidade: 0,
            };
          }
          operacoesTemp[v.tipo_operacao].soma += margem;
          operacoesTemp[v.tipo_operacao].quantidade++;
        }

        if (v.tipo_operacao?.toLowerCase().includes("transferencia")) {
          somaMargemTransferencia += margem;
          qtdTransferencia++;
        } else {
          somaMargemUltima += margem;
          qtdUltima++;
        }

        if (receita > 0) {
          const custoMeta = receita * (meta / 100);
          const lucroExtra = receita - custoMeta - custo;
          const acimaMeta = lucroExtra > 0 ? lucroExtra : 0;
          somaLucroAcimaMeta += acimaMeta;
          somaMetaTotal += custoMeta;
          somaReceitaTotal += receita;
        }

        if (v.tipo_veiculo) {
          if (!veiculosTemp[v.tipo_veiculo]) {
            veiculosTemp[v.tipo_veiculo] = {
              custo: 0,
              receita: 0,
              quantidade: 0,
            };
          }
          veiculosTemp[v.tipo_veiculo].custo += custo;
          veiculosTemp[v.tipo_veiculo].receita += receita;
          veiculosTemp[v.tipo_veiculo].quantidade++;
        }
      });

      setQuantidadeTotal(quantidade);
      setMediaGeral(quantidade > 0 ? (somaMargem / quantidade).toFixed(2) : 0);

      const operacoesMedias = {};
      Object.keys(metasPorOperacao).forEach((op) => {
        if (operacoesTemp[op]) {
          operacoesMedias[op] = {
            media: (operacoesTemp[op].soma / operacoesTemp[op].quantidade).toFixed(2),
            quantidade: operacoesTemp[op].quantidade,
          };
        } else {
          operacoesMedias[op] = {
            media: 0,
            quantidade: 0,
          };
        }
      });
      setMediasPorOperacao(operacoesMedias);
      setCustoTransferencia(qtdTransferencia ? (somaMargemTransferencia / qtdTransferencia).toFixed(2) : 0);
      setCustoUltimaPerna(qtdUltima ? (somaMargemUltima / qtdUltima).toFixed(2) : 0);

// Correção para cálculo com META GERAL 45%
const mediaCustoReal = quantidade > 0 ? (somaMargem / quantidade) : 0;
let valorAcimaMetaCorrigido = null;
let percentualAcimaMetaCorrigido = null;

if (mediaCustoReal < META_GERAL_CUSTO) {
  const percentualLucro = (META_GERAL_CUSTO - mediaCustoReal) / 100;
  valorAcimaMetaCorrigido = (somaReceitaTotal * percentualLucro).toFixed(2);
  percentualAcimaMetaCorrigido = ((META_GERAL_CUSTO - mediaCustoReal)).toFixed(2);
}

setValorAcimaMeta(valorAcimaMetaCorrigido);
setPercentualAcimaMeta(percentualAcimaMetaCorrigido);

      const veiculoPerfis = {};
      viagensData.forEach((v) => {
        const tipo = v.tipo_veiculo;
        const margem = parseFloat(v.margem_custo || 0);
      
        if (!tipo || isNaN(margem)) return;
      
        if (!veiculoPerfis[tipo]) {
          veiculoPerfis[tipo] = {
            somaMargem: 0,
            quantidade: 0,
          };
        }
      
        veiculoPerfis[tipo].somaMargem += margem;
        veiculoPerfis[tipo].quantidade++;
      });
      
      Object.keys(veiculoPerfis).forEach((tipo) => {
        const item = veiculoPerfis[tipo];
        veiculoPerfis[tipo] = {
          percentual: (item.somaMargem / item.quantidade).toFixed(2),
          quantidade: item.quantidade,
        };
      });
      
      setFatorPorTipoVeiculo(veiculoPerfis);
      // Cálculo do lucro acima da meta geral fixa de 45%
      let custoTotal = 0;
viagensData.forEach((v) => {
  custoTotal += parseFloat(v.total_custo || 0);
});

setSomaCustoTotal(custoTotal);
setSomaLucroTotal(somaReceitaTotal); // Aqui será a receita total como você pediu

      
      
    } catch (error) {
      console.error("Erro ao buscar viagens", error);
    }
  };

  const getCorMeta = (meta, valor) => {
    if (valor === 0) return;
    return valor <= meta ? "rgba(0, 255, 127, 0.35)" : "rgba(255, 69, 0, 0.35)";
  };

  return (
    <Row style={{ display: "flex", flexDirection: "column", margin: 20, width: "100%" }}>
      <Row style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <Col md={3}>
        <CardStyle
  bgColor={parseFloat(custoTransferencia) <= 18 ? "rgba(0, 255, 127, 0.35)" : "rgba(255, 69, 0, 0.35)"}
>
  <h5><FiArrowDownRight style={{ marginRight: 5 }} />Custo Total Transferências</h5>
  <h1>{custoTransferencia}%</h1>
</CardStyle>


          <CardStyle style={{ marginTop: 10 }}>
            <h5><FaTruck style={{ marginRight: 5 }} />Perfil por Veículo</h5>
            {Object.entries(fatorPorTipoVeiculo).map(([tipo, dados]) => (
              <h2 key={tipo}>{tipo}: {dados.percentual}% ({dados.quantidade})</h2>
            ))}
          </CardStyle>
        </Col>

        <Col md={6}>
        <CardStyle
  bgColor={parseFloat(mediaGeral) <= 45 ? "rgba(0, 255, 127, 0.35)" : "rgba(255, 69, 0, 0.35)"}
  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
>

    
    {/* Custo Total - esquerda */}
    <Row  style={{ width:'100%',display: "flex", justifyContent: "space-between", alignItems: "center" }}>

    <div style={{ textAlign: "center", flex: 1 }}>
      <h5><FiArrowDownRight style={{ marginRight: 5 }} />Custo Total</h5>
      <h2>{isAdminFrete ? `R$ -${somaCustoTotal?.toFixed(2) || "0.00"}` : ``}</h2>

    </div>

    {/* Média Geral - centro */}
    <div style={{ textAlign: "center", flex: 1 }}>
      <h2>Média Geral Custo Frete</h2>
      <h1 style={{ fontSize: 165 }}>{mediaGeral}%</h1>
      <p style={{ fontSize:'20px'}}>({quantidadeTotal} viagens)</p>
    </div>

    {/* Receita Total - direita */}
    <div style={{ textAlign: "center", flex: 1 }}>
      <h5><FaArrowUp style={{ marginRight: 5 }} />Receita Total</h5>
      <h2>{isAdminFrete ? `R$ ${somaLucroTotal?.toFixed(2) || "0.00"}` : ``}</h2>

    </div>
    </Row>

  </CardStyle>
</Col>


        <Col md={3}>
        <CardStyle
  bgColor={parseFloat(custoUltimaPerna) <= 45 ? "rgba(0, 255, 127, 0.35)" : "rgba(255, 69, 0, 0.35)"}
>
            <h5><FiArrowDownRight style={{ marginRight: 5 }} />Custo Última Perna</h5>
            <h1>{custoUltimaPerna}%</h1>
          </CardStyle>

          <CardStyle
  bgColor={
    valorAcimaMeta && parseFloat(valorAcimaMeta) > 0
      ? "rgba(0, 255, 127, 0.35)"
      : "rgba(255, 69, 0, 0.35)"
  }
  style={{ marginTop: 10 }}
>
  <h5><FaArrowUp style={{ marginRight: 5 }} />Lucro Acima da Meta</h5>
  {valorAcimaMeta && parseFloat(valorAcimaMeta) > 0 ? (
    <>
      <h2>{isAdminFrete ? `R$ ${valorAcimaMeta}` : `${percentualAcimaMeta}%`}</h2>

      <p style={{ fontSize:'20px'}}>{isAdminFrete ?`${percentualAcimaMeta}% acima da meta` : ''}</p>
    </>
  ) : (
    <>
      <h3>{isAdminFrete ? `R$ -${Math.abs(valorAcimaMeta || 0).toFixed(2)}` : `${percentualAcimaMeta}%`}</h3>

      <p>{Math.abs(percentualAcimaMeta || 0)}% abaixo da meta</p>
    </>
  )}
</CardStyle>

        </Col>
      </Row>

      <Row style={{  display: 'flex', justifyContent: 'center' }}>
      {Object.keys(metasPorOperacao).map((operacao) => {
  const media = parseFloat(mediasPorOperacao[operacao]?.media || 0);
  const quantidadeOp = mediasPorOperacao[operacao]?.quantidade || 0;
  const meta = metasPorOperacao[operacao];

  // Filtra viagens da operação atual
  const viagensOp = viagens.filter(v => v.tipo_operacao === operacao);

  // Total por tipo de veículo na operação
  const veiculosPorTipo = {};
  viagensOp.forEach(v => {
    const tipo = v.tipo_veiculo;
    if (!tipo) return;
    if (!veiculosPorTipo[tipo]) veiculosPorTipo[tipo] = 0;
    veiculosPorTipo[tipo]++;
  });

  // Lucro acima da meta
  let receitaTotal = 0;
  let custoTotal = 0;
  viagensOp.forEach(v => {
    receitaTotal += parseFloat(v.total_receita || 0);
    custoTotal += parseFloat(v.total_custo || 0);
  });

  const custoReal = receitaTotal > 0 ? (custoTotal / receitaTotal) * 100 : 0;
  const diferenca = meta - custoReal;
  const lucroOuPreju = receitaTotal * (Math.abs(diferenca) / 100);
  const acimaMeta = diferenca > 0;

  return (
    <Col key={operacao} md={2} style={{padding:0 ,marginBottom:5, marginRight:10,}}>
      <CardStyle
        bgColor={getCorMeta(meta, media)}
        style={{ height: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", padding: 5 }}
      >
        {/* Lado esquerdo - dados atuais */}
        <div style={{ flex: 1, paddingRight: 10 }}>
          <h5>{operacao}</h5>
          <h1>{media}%</h1>
          <p style={{ fontSize:'20px'}}>{quantidadeOp} viagens</p>
        </div>

        {/* Divisória */}
        <div style={{ width: 1, backgroundColor: "#ccc", margin: "0 10px" }} />

        {/* Lado direito - nova info */}
        <div style={{ flex: 1 }}>
          <h5>Veículos:</h5>
          {Object.entries(veiculosPorTipo).map(([tipo, qtd]) => (
            <p key={tipo}>{tipo}: {qtd}</p>
          ))}
          <h5 style={{ marginTop: 10 }}>{acimaMeta ? "Lucro" : "Perda"}:</h5>
          <p style={{ fontWeight: "bold", color: acimaMeta ? "white" : "white" }}>
  {isAdminFrete
    ? `R$ ${lucroOuPreju.toFixed(2)} (${Math.abs(diferenca).toFixed(2)}%)`
    : `${Math.abs(diferenca).toFixed(2)}%`}
</p>

        </div>
      </CardStyle>
    </Col>
  );
})}

      </Row>
    </Row>
  );
};

export default DashboardViagens;