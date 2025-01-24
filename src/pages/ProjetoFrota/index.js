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

  // Dados fornecidos
  const initialSoftwareCost = 30000; // Custo inicial do software
  const monthlySoftwareCost = 2000; // Custo mensal do novo software

  const currentOperationCost = 18081.68; // Custo mensal atual com 4 emissores
  const reduced1EmissorCost = 13536.26; // Custo mensal com menos 1 emissor
  const reduced2EmissoresCost = 8990.84; // Custo mensal com menos 2 emissores

  // Cálculo dos custos cumulativos
  const currentOperationCosts = calculateCumulativeCosts([], currentOperationCost, months);
  const reduced1EmissorCosts = calculateCumulativeCosts([], reduced1EmissorCost, months);
  const reduced2EmissoresCosts = calculateCumulativeCosts([], reduced2EmissoresCost, months);
  const newSoftwareCosts = calculateCumulativeCosts([initialSoftwareCost], monthlySoftwareCost, months);

  // ROI: Cálculo do mês em que o investimento se paga
  const calculateROI = (currentCosts, reducedCosts, softwareCosts) => {
    for (let i = 0; i < months; i++) {
      if (currentCosts[i] > reducedCosts[i] + softwareCosts[i]) {
        return i + 1; // Retorna o mês (i + 1 porque o índice começa em 0)
      }
    }
    return null; // Retorna null caso o ROI não seja alcançado em 36 meses
  };

  const roiWith1Emissor = calculateROI(currentOperationCosts, reduced1EmissorCosts, newSoftwareCosts);
  const roiWith2Emissores = calculateROI(currentOperationCosts, reduced2EmissoresCosts, newSoftwareCosts);

  // Ganhos acumulados
  const gainWith1Emissor1Year = (currentOperationCosts[11] - reduced1EmissorCosts[11]) - newSoftwareCosts[11];
  const gainWith1Emissor2Years = (currentOperationCosts[23] - reduced1EmissorCosts[23]) - newSoftwareCosts[23];
  const gainWith1Emissor3Years = (currentOperationCosts[35] - reduced1EmissorCosts[35]) - newSoftwareCosts[35];

  const gainWith2Emissores1Year = (currentOperationCosts[11] - reduced2EmissoresCosts[11]) - newSoftwareCosts[11];
  const gainWith2Emissores2Years = (currentOperationCosts[23] - reduced2EmissoresCosts[23]) - newSoftwareCosts[23];
  const gainWith2Emissores3Years = (currentOperationCosts[35] - reduced2EmissoresCosts[35]) - newSoftwareCosts[35];

  // Dados de produtividade
  const weeklyTimeSaved = 136.42 - 26.47; // 136h 25min - 26h 28min
  const monthlyTimeSaved = 545 - 106; // 545h - 106h

  const additionalWeeklyTimeSaved = 10 - 1.05; // 10h - 1h 3min
  const additionalMonthlyTimeSaved = 40 - 5.33; // 40h - 5h 20min

  // Configuração do gráfico
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
        'Operação Atual',
        'Operação com menos 1 emissor',
        'Operação com menos 2 emissores',
        'Novo Software',
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
        name: 'Operação Atual',
        type: 'line',
        smooth: true,
        data: currentOperationCosts,
        color: '#FF4500',
        lineStyle: { width: 3 },
      },
      {
        name: 'Operação com menos 1 emissor',
        type: 'line',
        smooth: true,
        data: reduced1EmissorCosts,
        color: 'yellow',
        lineStyle: { width: 3 },
      },
      {
        name: 'Operação com menos 2 emissores',
        type: 'line',
        smooth: true,
        data: reduced2EmissoresCosts,
        color: '#39FF14',
        lineStyle: { width: 3 },
      },
      {
        name: 'Novo Software',
        type: 'line',
        smooth: true,
        data: newSoftwareCosts,
        color: '#1E90FF',
        lineStyle: { width: 3 },
      },
    ],
  };

  return (
    <div className='boxGeneral'>
      <Container fluid className="d-flex align-items-center justify-content-center">
        <Row>
          <Col md={12} className="text-center mb-4">
            <h1 style={{ color: 'white' }}>Comparação de Orçamentos e Retorno do Investimento</h1>
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

          {/* ROI e Ganhos */}
          <Col md={6}>
            <Card className="custom-card">
              <CardBody>
                <h5 style={{ color: 'white' }}>ROI e Ganhos</h5>
                <p style={{ color: 'white' }}>
                  <strong>ROI com 1 emissor a menos:</strong> {roiWith1Emissor ? `${roiWith1Emissor} meses` : 'Não alcançado em 36 meses'}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>ROI com 2 emissores a menos:</strong> {roiWith2Emissores ? `${roiWith2Emissores} meses` : 'Não alcançado em 36 meses'}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com 1 emissor a menos em 1 ano:</strong> {formatCurrency(gainWith1Emissor1Year)}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com 1 emissor a menos em 2 anos:</strong> {formatCurrency(gainWith1Emissor2Years)}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com 1 emissor a menos em 3 anos:</strong> {formatCurrency(gainWith1Emissor3Years)}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com 2 emissores a menos em 1 ano:</strong> {formatCurrency(gainWith2Emissores1Year)}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com 2 emissores a menos em 2 anos:</strong> {formatCurrency(gainWith2Emissores2Years)}
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganhos com 2 emissores a menos em 3 anos:</strong> {formatCurrency(gainWith2Emissores3Years)}
                </p>
              </CardBody>
            </Card>
          </Col>

          {/* Ganhos em Produtividade */}
          <Col md={6}>
            <Card className="custom-card">
              <CardBody>
                <h5 style={{ color: 'white' }}>Ganhos em Produtividade</h5>
                <p style={{ color: 'white' }}>
                  <strong>Tempo semanal atual:</strong> 136 horas
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Tempo mensal atual:</strong> 545 horas
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Novo tempo semanal:</strong> 26 horas
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Novo tempo mensal:</strong> 106 horas
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Tempo semanal economizado:</strong> {weeklyTimeSaved.toFixed(0)} horas
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Tempo mensal economizado:</strong> {monthlyTimeSaved.toFixed(0)} horas
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganho adicional semanal economizado:</strong> {additionalWeeklyTimeSaved.toFixed(0)} horas
                </p>
                <p style={{ color: 'white' }}>
                  <strong>Ganho adicional mensal economizado:</strong> {additionalMonthlyTimeSaved.toFixed(0)} horas
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
