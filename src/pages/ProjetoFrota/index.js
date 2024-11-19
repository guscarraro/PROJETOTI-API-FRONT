import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import './style.css';

function ComparacaoOrcamentos() {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateCumulativeCosts = (initialPayments, monthlyPayment, months) => {
    let cumulativeCosts = [];
    let total = 0;

    for (let i = 1; i <= months; i++) {
      if (i <= initialPayments.length) {
        total += initialPayments[i - 1];
      } else {
        total += monthlyPayment;
      }
      cumulativeCosts.push(parseFloat(total.toFixed(2)));
    }

    return cumulativeCosts;
  };

  const months = 36; // 3 anos (36 meses)

  // Dados dos orçamentos
  const bitysCosts = calculateCumulativeCosts(
    Array(5).fill(5000), // 5 parcelas de 5000
    1000, // Mensalidade de 1000
    months
  );

  const fretefyCosts = calculateCumulativeCosts(
    Array(5).fill(3400), // 5 parcelas de 3400
    11000, // Mensalidade de 11000
    months
  );

  const infoWorkerCosts = calculateCumulativeCosts(
    Array(5).fill(5000), // 5 parcelas de 5000
    1000, // Mensalidade de 1000
    months
  );

  const operationCosts = calculateCumulativeCosts(
    [19176.07], // Custo inicial da operação atual
    19176.07 + 500, // Custos crescentes (500 a mais por mês)
    months
  );

  const operationSmallCosts = calculateCumulativeCosts(
    [15188.00], // Custo inicial da operação atual
    15188.00 + 500, // Custos crescentes (500 a mais por mês)
    months
  );

  // Configuração do gráfico de linha
  const lineChartOptions = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const tooltipData = params.map(
          (item) => `${item.seriesName}: ${formatCurrency(item.value)}`
        );
        return tooltipData.join('<br/>');
      },
    },
    legend: {
      data: [
        'Bitys',
        'Fretefy',
        'InfoWorker',
        'Operação Atual',
        'Operação Com menos 1 emissor',
      ],
      textStyle: { color: '#fff' },
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: months }, (_, i) => `Mês ${i + 1}`),
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#fff',
        formatter: (value) => formatCurrency(value),
      },
    },
    series: [
      {
        name: 'Bitys',
        type: 'line',
        smooth: true,
        data: bitysCosts,
        color: '#39FF14',
        lineStyle: { width: 3 },
      },
      {
        name: 'Fretefy',
        type: 'line',
        smooth: true,
        data: fretefyCosts,
        color: '#00FFFF',
        lineStyle: { width: 3 },
      },
      {
        name: 'InfoWorker',
        type: 'line',
        smooth: true,
        data: infoWorkerCosts,
        color: '#FF00FF',
        lineStyle: { width: 3 },
      },
      {
        name: 'Operação Atual',
        type: 'line',
        smooth: true,
        data: operationCosts,
        color: '#FF4500',
        lineStyle: { width: 3 },
      },
      {
        name: 'Operação Com menos 1 emissor',
        type: 'line',
        smooth: true,
        data: operationSmallCosts,
        color: 'yellow',
        lineStyle: { width: 3 },
      },
    ],
  };

  // Configuração do gráfico de pizza
  const pieChartOptions = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.seriesName}<br/>${params.name}: ${formatCurrency(params.value)} (${params.percent}%)`;
      },
    },
    series: [
      {
        name: 'Custo Total (3 anos)',
        type: 'pie',
        radius: '50%',
        data: [
          { name: 'Bitys', value: bitysCosts[months - 1] },
          { name: 'Fretefy', value: fretefyCosts[months - 1] },
          { name: 'InfoWorker', value: infoWorkerCosts[months - 1] },
          { name: 'Operação Atual', value: operationCosts[months - 1] },
          { name: 'Operação Com menos 1 emissor', value: operationSmallCosts[months - 1] },
        ],
        color: ['#39FF14', '#00FFFF', '#FF00FF', '#FF4500', 'yellow'],
      },
    ],
  };

  return (
    <div className='boxGeneral'>
    <Container fluid className="d-flex align-items-center justify-content-center">
      <Row>
        <Col md={12} className="text-center mb-4">
          <h1 style={{ color: 'white' }}>Comparação de Orçamentos e Custos</h1>
        </Col>

        {/* Gráfico de Linha */}
        <Col md={12}>
          <Card className="custom-card">
            <CardBody>
              <h5 style={{ color: 'white' }}>Custos Cumulativos ao Longo de 3 Anos</h5>
              <ReactECharts option={lineChartOptions} style={{ height: '400px' }} />
            </CardBody>
          </Card>
        </Col>

        {/* Gráfico de Pizza */}
        <Col md={6}>
          <Card className="custom-card">
            <CardBody>
              <h5 style={{ color: 'white' }}>Custo Total (3 Anos)</h5>
              <ReactECharts option={pieChartOptions} style={{ height: '400px' }} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
}

export default ComparacaoOrcamentos;
