import React from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';
import CountUp from 'react-countup';
import { FiPieChart } from 'react-icons/fi';

const CardResumoCustos = ({ custoKm, custoMensal, titulo, destaque = false }) => {
  return (
    <Card style={{
        backgroundColor: destaque ? '#007bff22' : 'rgba(255, 255, 255, 0.1)',
        border:'none',
        borderBottom: destaque ? '2px solid #007bff' : '1px solid #ccc',
        boxShadow: destaque ? '0 0 10px #007bff55' : 'none',
       justifyContent:"center",
       justifyItems:'center',
      
      fontSize: '0.85rem',
    }}>
      <CardBody style={{ padding: '0.75rem' }}>
        <h6 style={{ color: destaque ? '#007bff' : '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
          {destaque && <FiPieChart size={18} />}
          {titulo}
        </h6>
        <Row>
          <Col md="6">
            <div><strong>R$/km:</strong> <CountUp end={custoKm} duration={0.6} separator="." decimal="," decimals={4} /></div>
          </Col>
          <Col md="6">
            <div><strong>Mensal:</strong> R$ <CountUp end={custoMensal} duration={0.6} separator="." decimal="," decimals={2} /></div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default CardResumoCustos;
