import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Container, Button, Row, Col, Card, CardBody } from 'reactstrap';
import './style.css';


const initialCostData = [
  { month: 'January', cost: 1000, investment: 1500 },
  { month: 'February', cost: 2000, investment: 3000 },
  { month: 'March', cost: 4000, investment: 6000 },
  { month: 'April', cost: 3500, investment: 5000 },
  { month: 'May', cost: 3000, investment: 4500 },
  { month: 'June', cost: 2500, investment: 4000},
  // Adicione mais meses se necessário
];

const sectorCostData = [
  { sector: 'Manutenção', cost: 25000, investment: 30000 },
  { sector: 'Administração', cost: 15000, investment: 20000 },
  { sector: 'Operações', cost: 20000, investment: 25000 },
  { sector: 'Segurança', cost: 12000, investment: 15000 },
];
const custoPessoalDepFrota = {
  base: "09/2024",
  total: "R$ 72.825,28",
  pessoas: [
      { tipo: "CLT", nome: "JEAN MARCEL", valor: "R$ 4.727,08", funcao:"Emissor CTE" },
      { tipo: "CLT", nome: "LEVI KARLAY", valor: "R$ 4.345,42", funcao:"Analista"},
      { tipo: "CLT", nome: "MARCOS AURELIO", valor: "R$ 4.525,17", funcao:"Analista"},
      { tipo: "CLT", nome: "VICTOR THIYLER", valor: "R$ 3.988,07", funcao:"Emissor CTE" },
      { tipo: "CLT", nome: "Emissor 4", valor: "R$ 3.988,07", funcao:"Emissor CTE" },
      { tipo: "PJ", nome: "FABIO DAMBROSKI", valor: "R$ 6.750,00", funcao:"Supervisão" },
      { tipo: "PJ", nome: "ISABELE CONFORTO", valor: "R$ 8.000,00", funcao:"Gestão Administrativa"},
      { tipo: "PJ", nome: "FABIANO SANTANA", valor: "R$ 7.583,33",funcao:"Gestão Manutenção" },
      { tipo: "PJ", nome: "MARCIO BALDON", valor: "R$ 13.433,35",funcao:"Gestão Manutenção" },
      { tipo: "PJ", nome: "PAULO CESAR", valor: "R$ 6.472,85",funcao:"Emissor CTE" },
      { tipo: "PJ", nome: "RAFAELA BARBOSA", valor: "R$ 5.958,33",funcao:"Supervisão" },
      { tipo: "PJ", nome: "SANDRO FERREIRA", valor: "R$ 7.041,67",funcao:"Operador Manutenção" }
  ]
};

const custoSoftware = {
  base: "09/2024",
  total: "R$ 95.343,88",
  despesas: [
      { despesa: "Gerenciamento de Risco GS CARGO", valor: "R$ 8.623,01", ativo: 's'},
      { despesa: "Gerenciamento de Risco FORZA", valor: "R$ 6.610,10",ativo: 's' },
      { despesa: "Gerenciamento de Risco GOBRAX", valor: "R$ 16.639,42",ativo: 's' },
      { despesa: "Gerenciamento de Risco ZALF", valor: "R$ 2.298,47",ativo: 's' },
      { despesa: "Gerenciamento de Risco GLOBAL", valor: "R$ 16.384,97",ativo: 's' },
      { despesa: "Gerenciamento de Risco SASCAR", valor: "R$ 641,12",ativo: 's' },
      { despesa: "Gerenciamento de Risco NACIONALSAT", valor: "R$ 15.388,00",ativo: 's' },
      { despesa: "Gerenciamento de Risco TRUCKS", valor: "R$ 22.344,22",ativo: 's' },
      { despesa: "Gerenciamento de Risco CHECKLIST", valor: "R$ 2.298,47",ativo: 's' },
      { despesa: "Escalasoft", valor: "R$ 1200,00",ativo: 's' },
      { despesa: "Auto de Infração/ Multas", valor: "R$ 613,66",ativo: 's' },
      { despesa: "Software Controle de Jornada", valor: "R$ 3.502,44",ativo: 's' },
      { despesa: "Investimento Software Carra", valor: "R$ 3.502,44", parcelas: 24,ativo: 'n'}
  ]
};

function ProjetoFrota() {
  const [periodo, setPeriodo] = useState('1M');
  
  const filterDataByPeriod = (data) => {
    switch (periodo) {
      case '1M': return data.slice(-1); // Último mês
      case '6M': return data.slice(-6); // Últimos 6 meses
      case '1Y': return data; // Todos os meses (1 ano)
      case '2Y': return [...data, ...data.map(d => ({ ...d, cost: d.cost * 2, investment: d.investment * 2 }))]; // 2 anos
      default: return data;
    }
  };

  const calculateInvestmentByPeriod = (investment, months) => {
    switch (periodo) {
      case '1M': return investment; // Investimento de 1 mês
      case '6M': return investment * 6; // Investimento multiplicado por 6 meses
      case '1Y': return investment * 12; // Investimento multiplicado por 12 meses
      case '2Y': return investment * 24; // Investimento multiplicado por 24 meses
      default: return investment;
    }
  };

  // Função para calcular o total de despesas mensais
  const calcularTotalDespesas = () => {
    return custoSoftware.despesas.reduce((total, despesa) => {
      const valor = parseFloat(despesa.valor.replace("R$", "").replace(",", ".").trim());
      return total + valor;
    }, 0);
  };

  // Função para calcular o investimento baseado no período
  const calcularInvestimentoSoftware = (totalDespesas) => {
    return calculateInvestmentByPeriod(totalDespesas, filterDataByPeriod(initialCostData).length);
  };

  // Total de despesas mensais
  const totalDespesas = calcularTotalDespesas();
  const investimentoSoftware = calcularInvestimentoSoftware(totalDespesas);

  const costOptions = {
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fundo transparente
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: filterDataByPeriod(initialCostData).map(item => item.month),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Custo',
        type: 'line',
        smooth: true,
        data: filterDataByPeriod(initialCostData).map(item => item.cost),
        color: '#39FF14', // Neon verde
        lineStyle: { width: 3 },
      },
      {
        name: 'Investimento',
        type: 'line',
        smooth: true,
        data: filterDataByPeriod(initialCostData).map(item => item.investment),
        color: '#00FFFF', // Neon azul
        lineStyle: { width: 3 },
      },
    ],
  };

  const sectorCostOptions = {
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fundo transparente
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: sectorCostData.map(item => item.sector),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Custo',
        type: 'line',
        step: 'start',  // Usa escada "start" para o gráfico de Custo
        data: sectorCostData.map(item => item.cost),
        color: '#FF00FF', // Neon magenta para "Custo"
        lineStyle: { width: 3 },
      },
      {
        name: 'Investimento x Período',
        type: 'line',
        step: 'start',  // Usa escada "start" para o gráfico de Investimento
        data: sectorCostData.map(item => calculateInvestmentByPeriod(item.investment, filterDataByPeriod(initialCostData).length)),
        color: '#39FF14', // Neon verde para "Investimento"
        lineStyle: { width: 3 },
      },
    ],
  };

  // Gráfico de Pizza para Distribuição de Custo por Setor
  const pieChartOptions = {
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fundo transparente
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    series: [
      {
        name: 'Custo por Setor',
        type: 'pie',
        radius: '50%',
        data: sectorCostData.map(item => ({ name: item.sector, value: item.cost })),
        color: ['#FF00FF', '#39FF14', '#00FFFF', '#FF6361'],
      },
    ],
  };

  // Gráfico Escada para Distribuição de Despesas Mensais
  const stairChartOptions = {
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fundo transparente
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: filterDataByPeriod(initialCostData).map(item => item.month),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Despesas Mensais',
        type: 'line',
        step: 'start',
        data: Array(filterDataByPeriod(initialCostData).length).fill(totalDespesas),
        color: '#FF6361', // Neon vermelho para "Despesas Mensais"
        lineStyle: { width: 3 },
      },
    ],
  };

  return (
    <Container fluid className="ContainerPagina2 d-flex align-items-center justify-content-center">
      <Row>
        <Col md={12} className="text-center mb-4">
          <h1 style={{ color: 'white' }}>Relatório de Custos e Investimentos</h1>
          <div>
            <Button className="btnFilter" onClick={() => setPeriodo('1M')}>1 Mês</Button>
            <Button className="btnFilter" onClick={() => setPeriodo('6M')}>6 Meses</Button>
            <Button className="btnFilter" onClick={() => setPeriodo('1Y')}>1 Ano</Button>
            <Button className="btnFilter" onClick={() => setPeriodo('2Y')}>2 Anos</Button>
          </div>
        </Col>

        {/* Gráfico de Linha para Custo e Investimento */}
        <Col md={6}>
          <Card className="custom-card">
            <CardBody>
              <h5 style={{ color: 'white' }}>Custo Total vs Investimento</h5>
              <ReactECharts option={costOptions} style={{ height: '300px' }} />
            </CardBody>
          </Card>
        </Col>

        {/* Gráfico Escada Dupla para Custo por Setor e Investimento */}
        <Col md={6}>
          <Card className="custom-card">
            <CardBody>
              <h5 style={{ color: 'white' }}>Custo e Investimento por Setor</h5>
              <ReactECharts option={sectorCostOptions} style={{ height: '300px' }} />
            </CardBody>
          </Card>
        </Col>
        <Col md={12}>
          <Card className="custom-card">
            <CardBody>
              <h5 style={{ color: 'white' }}>Distribuição de Despesas Mensais</h5>
              <ReactECharts option={stairChartOptions} style={{ height: '300px' }} />
            </CardBody>
          </Card>
        </Col>
        {/* Gráfico de Pizza para Custo por Setor */}
        <Col md={6}>
          <Card className="custom-card">
            <CardBody>
              <h5 style={{ color: 'white' }}>Distribuição de Custo por Setor</h5>
              <ReactECharts option={pieChartOptions} style={{ height: '300px' }} />
            </CardBody>
          </Card>
        </Col>
       
        {/* Gráfico Escada para Despesas Mensais */}
        <Col md={6}>
          <Card className="custom-card">
            <CardBody>
              <h5 style={{ color: 'white' }}>Distribuição de Despesas Mensais</h5>
              <ReactECharts option={stairChartOptions} style={{ height: '300px' }} />
            </CardBody>
          </Card>
        </Col>
       
        <Col md={6}>
          <Card className="custom-card">
            <CardBody>
              <h5 style={{ color: 'white' }}>Distribuição de Custo por Setor</h5>
              <ReactECharts option={pieChartOptions} style={{ height: '300px' }} />
            </CardBody>
          </Card>
        </Col>

        {/* Gráfico Escada para Despesas Mensais */}
        <Col md={6}>
          <Card className="custom-card">
            <CardBody>
              <h5 style={{ color: 'white' }}>Distribuição de Despesas Mensais</h5>
              <ReactECharts option={stairChartOptions} style={{ height: '300px' }} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProjetoFrota;
