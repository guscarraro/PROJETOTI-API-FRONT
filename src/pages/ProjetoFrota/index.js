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
    1500, // Mensalidade de 1500
    months
  );

  const infoWorkerCosts = calculateCumulativeCosts(
    Array(5).fill(6000), // 5 parcelas de 6000
    2000, // Mensalidade de 2000
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

  // Cálculo de médias mensais
  const averageCostCurrentOperation = operationCosts[months - 1] / months;
  const averageCostOperationSmall = operationSmallCosts[months - 1] / months;
  const averageCostBitys = bitysCosts[months - 1] / months;
  const averageCostInfoWorker = infoWorkerCosts[months - 1] / months;

  // Cálculo dos ganhos (diferença entre operação atual e alternativas)
  const gainWithBitys = averageCostCurrentOperation - (averageCostOperationSmall + averageCostBitys);
  const gainWithInfoWorker = averageCostCurrentOperation - (averageCostOperationSmall + averageCostInfoWorker);

  // Ganhos em 1 ano (12 meses)
  const gainWithBitys1Year = operationCosts[11] - (operationSmallCosts[11] + bitysCosts[11]);
  const gainWithInfoWorker1Year = operationCosts[11] - (operationSmallCosts[11] + infoWorkerCosts[11]);

  // Ganhos em 2 anos (24 meses)
  const gainWithBitys2Years = operationCosts[23] - (operationSmallCosts[23] + bitysCosts[23]);
  const gainWithInfoWorker2Years = operationCosts[23] - (operationSmallCosts[23] + infoWorkerCosts[23]);

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

          {/* Comparação de Custos e Ganhos */}
          <Col md={6}>
            <Card className="custom-card">
              <CardBody>
                <h5 style={{ color: 'white' }}>Média Mensal e Ganhos</h5>
                <p style={{ color: 'white' }}>
                  <strong>Média Mensal Operação Atual:</strong> {formatCurrency(averageCostCurrentOperation)}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com Bitys em 1 ano:</strong> {formatCurrency(gainWithBitys1Year)}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com Bitys em 2 anos:</strong> {formatCurrency(gainWithBitys2Years)}
                </p>
               
                
              </CardBody>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="custom-card">
              <CardBody>
                <h5 style={{ color: 'white' }}>Média Mensal e Ganhos</h5>
                <p style={{ color: 'white' }}>
                  <strong>Média Mensal Operação Atual:</strong> {formatCurrency(averageCostCurrentOperation)}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com InfoWorker em 1 ano:</strong> {formatCurrency(gainWithInfoWorker1Year)}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com InfoWorker em 2 anos:</strong> {formatCurrency(gainWithInfoWorker2Years)}
                </p>
                
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ComparacaoOrcamentos;
