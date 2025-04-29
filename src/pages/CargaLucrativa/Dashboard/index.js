import React, { useEffect, useState } from "react";
import apiLocal from "../../../services/apiLocal";
import { Box, CardStyle } from "./style";
import { Row, Col } from "reactstrap";

const metasPorOperacao = {
  "MTZ - 1": 37,
  "MTZ - 2": 37,
  "MTZ - 3": 45,
  "MTZ - 4": 50,
  "MTZ": 25,
  "MTZ - Transferencia CAS": 18,
  "MTZ - Transferencia GUA":18, 
  "MTZ - Transferencia IBI":18,
  "MTZ - Transferencia MGA":18, 
  "MTZ - Transferencia PTO":18, 
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

  useEffect(() => {
    fetchViagens();
  }, []);

  const fetchViagens = async () => {
    try {
      const response = await apiLocal.getViagens();
      const viagensData = response.data;
      setViagens(viagensData);

      let somaMargem = 0;
      let quantidade = 0;
      const operacoesTemp = {};

      viagensData.forEach((v) => {
        if (v.margem_custo !== null && v.margem_custo !== undefined) {
          somaMargem += parseFloat(v.margem_custo);
          quantidade++;
        }

        if (v.tipo_operacao) {
          if (!operacoesTemp[v.tipo_operacao]) {
            operacoesTemp[v.tipo_operacao] = {
              soma: 0,
              quantidade: 0,
            };
          }
          operacoesTemp[v.tipo_operacao].soma += parseFloat(v.margem_custo || 0);
          operacoesTemp[v.tipo_operacao].quantidade++;
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
    } catch (error) {
      console.error("Erro ao buscar viagens", error);
    }
  };

  const getCorMeta = (meta, valor) => {
    if (valor === 0) return ;
    return valor <= meta ? "rgba(0, 255, 127, 0.35)" : "rgba(255, 69, 0, 0.35)";
  };

  return (
    <Row style={{ display: "flex", flexDirection: "column", gap: 20, margin: 20, width: "100%" }}>
      {/* Meta geral */}
      <Col md={12} style={{ textAlign: "center", marginBottom: 20 }}>
        <CardStyle>
          <h2>Média Geral</h2>
          <h1 style={{ fontSize: 50 }}>{mediaGeral}%</h1>
          <p>({quantidadeTotal} viagens)</p>
        

      {/* Metas por operação */}
      <Row style={{ gap: 20 , display:'flex',justifyContent:'center'}}>
        {Object.keys(metasPorOperacao).map((operacao) => (
          <Col key={operacao} md={2}>
            <CardStyle
              bgColor={getCorMeta(metasPorOperacao[operacao], parseFloat(mediasPorOperacao[operacao]?.media))}
            >
              <h4>{operacao}</h4>
              <h2>{mediasPorOperacao[operacao]?.media || 0}%</h2>
              <p>{mediasPorOperacao[operacao]?.quantidade || 0} viagens</p>
            </CardStyle>
          </Col>
        ))}
      </Row>
      </CardStyle>
      </Col>
    </Row>
  );
};

export default DashboardViagens;