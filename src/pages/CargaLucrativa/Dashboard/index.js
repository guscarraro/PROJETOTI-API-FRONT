// IMPORTS
import React, { useEffect, useState } from "react";
import apiLocal from "../../../services/apiLocal";
import { Box, CardStyle } from "./style";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import { FiArrowDownRight } from "react-icons/fi";
import { FaArrowUp, FaTruck } from "react-icons/fa";
import classnames from "classnames";

// METAS POR OPERAÇÃO
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
  const [mediasPorOperacao, setMediasPorOperacao] = useState({});
  const [abaAtiva, setAbaAtiva] = useState("geral");
  const user = JSON.parse(localStorage.getItem("user"));
  const tipoUsuario = user?.tipo;
  const isAdminFrete = tipoUsuario === "FreteAdmin" || tipoUsuario === "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";

  const [mediaGeral, setMediaGeral] = useState(0);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);
  const [somaCustoTotal, setSomaCustoTotal] = useState(0);
  const [somaLucroTotal, setSomaLucroTotal] = useState(0);
  const [fatorPorTipoVeiculo, setFatorPorTipoVeiculo] = useState({});

  useEffect(() => {
    fetchViagens();
  }, []);

  const fetchViagens = async () => {
    try {
      const response = await apiLocal.getViagens();
      const viagensData = response.data;
      setViagens(viagensData);

      const operacoesTemp = {};
      let somaMargem = 0;
      let quantidade = 0;
      let custoTotal = 0;
      let receitaTotal = 0;
      const veiculoPerfis = {};

      viagensData.forEach((v) => {
        const margem = parseFloat(v.margem_custo || 0);
        const custo = parseFloat(v.total_custo || 0);
        const receita = parseFloat(v.total_receita || 0);
        const operacao = v.tipo_operacao;

        if (!operacao) return;
        if (!operacoesTemp[operacao]) {
          operacoesTemp[operacao] = { soma: 0, quantidade: 0 };
        }
        operacoesTemp[operacao].soma += margem;
        operacoesTemp[operacao].quantidade++;

        somaMargem += margem;
        custoTotal += custo;
        receitaTotal += receita;
        quantidade++;

        const tipo = v.tipo_veiculo;
        if (tipo) {
          if (!veiculoPerfis[tipo]) veiculoPerfis[tipo] = { somaMargem: 0, quantidade: 0 };
          veiculoPerfis[tipo].somaMargem += margem;
          veiculoPerfis[tipo].quantidade++;
        }
      });

      setQuantidadeTotal(quantidade);
      setMediaGeral((somaMargem / quantidade).toFixed(2));
      setSomaCustoTotal(custoTotal);
      setSomaLucroTotal(receitaTotal);

      const perfis = {};
      Object.keys(veiculoPerfis).forEach((tipo) => {
        const item = veiculoPerfis[tipo];
        perfis[tipo] = {
          percentual: (item.somaMargem / item.quantidade).toFixed(2),
          quantidade: item.quantidade,
        };
      });
      setFatorPorTipoVeiculo(perfis);

      const operacoesMedias = {};
      Object.keys(metasPorOperacao).forEach((op) => {
        if (operacoesTemp[op]) {
          operacoesMedias[op] = {
            media: (operacoesTemp[op].soma / operacoesTemp[op].quantidade).toFixed(2),
            quantidade: operacoesTemp[op].quantidade,
          };
        } else {
          operacoesMedias[op] = { media: 0, quantidade: 0 };
        }
      });
      setMediasPorOperacao(operacoesMedias);
    } catch (error) {
      console.error("Erro ao buscar viagens", error);
    }
  };

  const getCorMeta = (meta, valor) => {
    if (valor === 0) return;
    return valor <= meta ? "rgba(0, 255, 127, 0.35)" : "rgba(255, 69, 0, 0.35)";
  };

  const filtrarPorAba = () => {
    switch (abaAtiva) {
      case "transferencias":
        return Object.keys(metasPorOperacao).filter((op) => op.toLowerCase().includes("transferencia"));
      case "pto":
        return Object.keys(metasPorOperacao).filter((op) => op.startsWith("PTO"));
      case "mtz":
        return Object.keys(metasPorOperacao).filter((op) => op.startsWith("MTZ") && !op.includes("Transferencia"));
      case "mga":
        return Object.keys(metasPorOperacao).filter((op) => op.startsWith("MGA"));
      default:
        return Object.keys(metasPorOperacao);
    }
  };

  return (
    <div style={{ margin: 20, minWidth: '95%', maxWidth: '95%' }}>
      <Nav tabs style={{ marginBottom: 20 }}>
        {['geral', 'transferencias', 'pto', 'mtz', 'mga'].map((tab) => (
          <NavItem key={tab}>
            <NavLink
              style={{ color: abaAtiva === tab ? '#000' : '#fff' }}
              className={classnames({ active: abaAtiva === tab })}
              onClick={() => setAbaAtiva(tab)}
            >
              {tab.toUpperCase()}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      {/* CARDS GERAIS */}
      <Row style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <Col md={4}>
          <CardStyle>
            <h5><FaTruck style={{ marginRight: 5 }} />Fator custo frete por Veículo</h5>
            {Object.entries(fatorPorTipoVeiculo).map(([tipo, dados]) => (
              <h2 key={tipo}>{tipo}: {dados.percentual}% ({dados.quantidade})</h2>
            ))}
          </CardStyle>
        </Col>

        <Col md={8}>
          <CardStyle style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Row style={{ width: '100%', display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <h5><FiArrowDownRight style={{ marginRight: 5 }} />Custo Total</h5>
                <h2>{isAdminFrete ? `-${somaCustoTotal?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ``}</h2>
              </div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <h2>Média Geral Custo Frete</h2>
                <h1 style={{ fontSize: 165 }}>{mediaGeral}%</h1>
                <p style={{ fontSize: '20px' }}>({quantidadeTotal} viagens)</p>
              </div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <h5><FaArrowUp style={{ marginRight: 5 }} />Receita Total</h5>
                <h2>{isAdminFrete ? somaLucroTotal?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : ``}</h2>
              </div>
            </Row>
          </CardStyle>
        </Col>
        <Col md={3}></Col>
      </Row>

      {/* CARDS POR OPERAÇÃO */}
      <Row style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {filtrarPorAba().map((operacao) => {
          const media = parseFloat(mediasPorOperacao[operacao]?.media || 0);
          const quantidadeOp = mediasPorOperacao[operacao]?.quantidade || 0;
          const meta = metasPorOperacao[operacao];
          const viagensOp = viagens.filter(v => v.tipo_operacao === operacao);

          const veiculosPorTipo = {};
          viagensOp.forEach(v => {
            const tipo = v.tipo_veiculo;
            if (!tipo) return;
            if (!veiculosPorTipo[tipo]) veiculosPorTipo[tipo] = 0;
            veiculosPorTipo[tipo]++;
          });

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
            <Col key={operacao} md={2} style={{ padding: 5 }}>
              <CardStyle bgColor={getCorMeta(meta, media)} style={{ minHeight: 230, height: '100%', display: "flex", flexDirection: "row", justifyContent: "space-between", padding: 5 }}>
                <div style={{ flex: 1, paddingRight: 10 }}>
                  <h5>{operacao}</h5>
                  <h1>{media}%</h1>
                  <p style={{ fontSize: '20px' }}>{quantidadeOp} viagens</p>
                </div>
                <div style={{ width: 1, backgroundColor: "#ccc", margin: "0 10px" }} />
                <div style={{ flex: 1 }}>
                  <h5>Veículos:</h5>
                  {Object.entries(veiculosPorTipo).map(([tipo, qtd]) => (
                    <p key={tipo}>{tipo}: {qtd}</p>
                  ))}
                  <h5 style={{ marginTop: 10 }}>{acimaMeta ? "Lucro" : "Perda"}:</h5>
                  <p style={{ fontWeight: "bold", color: acimaMeta ? "white" : "white" }}>
                    {isAdminFrete
                      ? `${lucroOuPreju.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (${Math.abs(diferenca).toFixed(2)}%)`
                      : `${Math.abs(diferenca).toFixed(2)}%`}
                  </p>
                </div>
              </CardStyle>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default DashboardViagens;
