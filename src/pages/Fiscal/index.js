import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, Button } from "reactstrap";
import { ContainerGeral, ContainerMenu } from "./styles";

const Fiscal = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // Estado para rastrear expansões de cards
  const [filters, setFilters] = useState({}); // Filtros por grupo

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://projetoti-api-production.up.railway.app/balancete-carraro"
      );
      const jsonData = await response.json();
      setData(jsonData.Planilha1 || []);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (data) => {
    const hierarchy = {};
    data.forEach((item) => {
      const levels = item.Normal.split(".");
      let currentLevel = hierarchy;

      levels.forEach((level, index) => {
        if (!currentLevel[level]) {
          currentLevel[level] = {
            ...item,
            children: {},
          };
        }
        if (index < levels.length - 1) {
          currentLevel = currentLevel[level].children;
        }
      });
    });
    return hierarchy;
  };

  const hierarchy = buildHierarchy(data);

  const mainBlockColors = {
    "1": "rgba(0, 0, 0, 0.7)", // Azul Claro - Ativo
    "2": "rgba(0, 0, 0, 0.7)", // Amarelo Claro - Passivo
    "3": "rgba(0, 0, 0, 0.7)", // Verde Claro - Receita
    "4": "rgba(0, 0, 0, 0.7)", // Vermelho Claro - Custo Operacional
    "5": "rgba(0, 0, 0, 0.7)", // Cinza Claro - Despesa
  };

  const getCardColor = (debit, credit) => {
    if (debit === credit) return "rgba(30, 97, 33, 0.8)"; // Verde Claro para valores iguais
    if ((debit > 0 && credit === 0) || (credit > 0 && debit === 0))
      return "rgba(255, 215, 0, 0.8)"; // Amarelo para débito ou crédito exclusivo
    return "rgba(255, 69, 0, 0.9)"; // Vermelho para valores diferentes
  };

  const toggleExpand = (normal) => {
    setExpanded((prevState) => ({
      ...prevState,
      [normal]: !prevState[normal],
    }));
  };

  const applyFilter = (key, type) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: prevFilters[key] === type ? "all" : type,
    }));
  };

  const renderHierarchy = (node, depth = 0, parentKey = "") => {
    return Object.keys(node).map((key) => {
      const currentNode = node[key];
      const debit = parseFloat(currentNode.Débito?.replace(/\./g, "").replace(",", ".") || 0);
      const credit = parseFloat(currentNode.Crédito?.replace(/\./g, "").replace(",", ".") || 0);
      const difference = credit - debit;
      const filter = filters[parentKey] || "all";
      const hasChildren = Object.keys(currentNode.children).length > 0;

      if (
        (filter === "positive" && difference < 0) ||
        (filter === "negative" && difference >= 0)
      ) {
        return null;
      }

      const cardColor = getCardColor(debit, credit);
      const currentKey = `${parentKey}${key}`;

      return (
        <div key={currentKey} style={{ marginBottom: "10px", marginLeft: `${depth * 20}px` }}>
          <Card
            style={{
              backgroundColor: cardColor,
              color: "white",
            }}
          >
            <CardBody>
              <CardTitle tag="h6" style={{ display: "flex", justifyContent: "space-between", color:'black' }}>
                  <ContainerMenu>
                <span
                  style={{ cursor: hasChildren ? "pointer" : "default" }}
                  onClick={() => hasChildren && toggleExpand(currentKey)}
                >
                  {currentNode.Normal} - {currentNode.Título}{" "}
                  {hasChildren && (expanded[currentKey] ? "-" : "+")}
                </span>
                <p>
                  <strong>Débito:</strong> R${" "}
                  {debit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p>
                  <strong>Crédito:</strong> R${" "}
                  {credit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p style={{ background: difference >= 0 ? "green" : "red" }}>
                  <strong>Diferença: R$</strong>{" "}
                  {difference.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </ContainerMenu>
                {hasChildren && (
                  <div>
                    <Button
                      size="sm"
                      color={filters[currentKey] === "positive" ? "success" : "secondary"}
                      onClick={() => applyFilter(currentKey, "positive")}
                      style={{ marginRight: "5px" }}
                    >
                      Positivo
                    </Button>
                    <Button
                      size="sm"
                      color={filters[currentKey] === "negative" ? "danger" : "secondary"}
                      onClick={() => applyFilter(currentKey, "negative")}
                    >
                      Negativo
                    </Button>
                  </div>
                )}
              </CardTitle>
              
            </CardBody>
          </Card>
          {expanded[currentKey] && (
            <div style={{ marginTop: "10px" }}>
              {renderHierarchy(currentNode.children, depth + 1, currentKey)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderMainBlocks = () => {
    return Object.keys(hierarchy).map((key) => (
      <div key={key} style={{ marginBottom: "20px", marginTop:'20px' }}>
        <Card
          style={{
            backgroundColor: mainBlockColors[key] || "rgba(211, 211, 211, 0.8)",
            color: "#fff",
          }}
        >
          <CardBody>
            <CardTitle
              tag="h5"
              style={{ cursor: "pointer", fontWeight: "bold" }}
              onClick={() => toggleExpand(key)}
            >
              {hierarchy[key].Título} {expanded[key] ? "-" : "+"}
            </CardTitle>
          </CardBody>
        </Card>
        {expanded[key] && (
          <div style={{ marginTop: "10px" }}>
            {renderHierarchy(hierarchy[key].children, 1, `${key}.`)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <ContainerGeral fluid>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        
        <Row>
          <Col md="9">{renderMainBlocks()}</Col>
        </Row>
        
      )}
    </ContainerGeral>
  );
};

export default Fiscal;
