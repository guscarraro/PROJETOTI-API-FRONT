import React from 'react';
import { Row, Col } from 'reactstrap';
import { Box } from '../styles';
import ServiceLevelChart from '../ServiceLevelChart';
import DailyDeliveryChart from '../DailyDeliveryChart';
import PendenciaChart from '../PendenciaChart';
import TopRemetentesChart from '../TopRemetentesChart';
import MedidorProdutividade from '../MedidorLeadTime';

const DashboardCharts = ({
  filteredData,
  ocorrenciasPorNota,
  groupedDataByStatus,
  calculateTotalNotesByStatus,
  dataInicial,
  dataFinal
}) => (
  <Row>
    <Col md="12">
      <Box>
        <ServiceLevelChart data={filteredData} />
      </Box>
    </Col>
    <Col md="12">
      <Box>
        <TopRemetentesChart data={filteredData} />
      </Box>
    </Col>
    <Col md="12">
      <Box>
        <DailyDeliveryChart data={filteredData} dataInicial={dataInicial} dataFinal={dataFinal} />
      </Box>
    </Col>
    {/* <Col md="12">
      <Box>
       <MedidorProdutividade
  notas={filteredData.flatMap(item => item.NF?.split(',').map(n => n.trim()) || [])}
  ocorrenciasPorNota={ocorrenciasPorNota}
/>
      </Box>
    </Col> */}
  </Row>
);

export default DashboardCharts;
