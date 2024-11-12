import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Container, Row, Col } from 'reactstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { FaEye, FaExclamationTriangle, FaClipboardCheck } from 'react-icons/fa';
import './style.css';
import { Legend } from 'chart.js';

const Box = styled.div`
  background-color: ${(props) => props.bgColor || 'rgba(0, 0, 0, 0.7)'};
  color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin: 10px;
  text-align: center;
  height: auto;
  opacity: 0.9;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const ProgressBar = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  height: 8px;
  position: relative;
  margin-top: 10px;

  &::after {
    content: '';
    display: block;
    height: 100%;
    background-color: #00C49F;
    width: ${(props) => props.progress}%;
  }
`;

const NoteList = styled.div`
  margin-top: 10px;
  text-align: left;
  font-size: 0.9rem;
`;

const NoteItem = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 5px;
  border-radius: 5px;
  margin-bottom: 5px;
`;

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [counts, setCounts] = useState({
    today: 0,
    tomorrow: 0,
    overdue: 0,
    noDeliveryDate: 0,
    completed: 0,
  });

  const fetchData = async () => {
    const response = await fetch('https://projetoti-api-production.up.railway.app/dados-otimizados');
    const jsonData = await response.json();
    setData(jsonData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const counts = {
      today: 0,
      tomorrow: 0,
      overdue: 0,
      noDeliveryDate: 0,
      completed: 0,
    };

    data.forEach((item) => {
      const deliveryDate = item.previsao_entrega ? new Date(item.previsao_entrega) : null;
      const entregue = item.cte_entregue === 1;

      if (entregue) {
        counts.completed++;
      } else if (deliveryDate) {
        if (deliveryDate.toDateString() === today.toDateString()) {
          counts.today++;
        } else if (deliveryDate.toDateString() === tomorrow.toDateString()) {
          counts.tomorrow++;
        } else if (deliveryDate < today) {
          counts.overdue++;
        }
      } else {
        counts.noDeliveryDate++;
      }
    });

    setCounts(counts);
  }, [data]);

  const totalDeliveries = data.length;
  const completedPercent = ((counts.completed / totalDeliveries) * 100).toFixed(1);

  const chartData = [
    { name: 'Hoje', value: counts.today },
    { name: 'Amanhã', value: counts.tomorrow },
    { name: 'Atrasadas', value: counts.overdue },
    { name: 'Sem Previsão', value: counts.noDeliveryDate },
  ];

  const performanceData = [
    { name: 'Dia 1', percent: 90 },
    { name: 'Dia 2', percent: 85 },
    { name: 'Dia 3', percent: 80 },
    { name: 'Dia 4', percent: 82 },
    { name: 'Dia 5', percent: 88 },
  ];

  const COLORS = ['#00FF7F', '#FFD700', '#FF4500', '#8A2BE2'];

  const boxColors = {
    today: 'rgba(255, 215, 0, 0.35)',
    tomorrow: 'rgba(0, 255, 127, 0.35)',
    overdue: 'rgba(255, 69, 0, 0.35)',
    noDeliveryDate: 'rgba(138, 43, 226, 0.35)',
  };

  const getGroupedNotesCountByRemetente = (status) => {
    const notesByStatus = data.filter((item) => {
      const deliveryDate = item.previsao_entrega ? new Date(item.previsao_entrega) : null;
      const hoje = new Date().toDateString();
      const amanha = new Date(Date.now() + 86400000).toDateString();

      switch (status) {
        case 'today':
          return deliveryDate && deliveryDate.toDateString() === hoje && item.cte_entregue !== 1;
        case 'tomorrow':
          return deliveryDate && deliveryDate.toDateString() === amanha && item.cte_entregue !== 1;
        case 'overdue':
          return deliveryDate && deliveryDate < new Date() && item.cte_entregue !== 1;
        case 'noDeliveryDate':
          return !deliveryDate && item.cte_entregue !== 1;
        default:
          return false;
      }
    });

    const grouped = {};
    notesByStatus.forEach(note => {
      const remetente = note.remetente;
      if (!grouped[remetente]) {
        grouped[remetente] = 0;
      }
      grouped[remetente]++;
    });

    return grouped;
  };

  return (
    <div className='boxGeneral'>
      <Container fluid>
      <Row>
  <Col md="6">
  <Box style={{ maxHeight: '350px', backgroundColor: 'rgba(0, 0, 0, 0.7)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}>
  <h5>Percentual de Entregas Completas</h5>
  <h2>{completedPercent}%</h2>
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        outerRadius={100}
        fill="#8884d8"
        label={(entry) => `${entry.name}: ${entry.value}`}
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="bottom" height={36} />
    </PieChart>
  </ResponsiveContainer>
</Box>

  </Col>
  <Col md="6">
    <Box style={{ minHeight: '350px', backgroundColor: 'rgba(0, 0, 0, 0.7)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}>
      <h5>Nível de Serviço ao Longo do Tempo</h5>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={performanceData}>
          <XAxis dataKey="name" />
          <YAxis domain={[70, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="percent" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  </Col>
</Row>

        <Row>
          {['today', 'tomorrow', 'overdue', 'noDeliveryDate'].map((status, index) => (
            <Col md="6" lg="3" key={index}>
              <Box bgColor={boxColors[status]}>
                {status === 'today' && <><FaEye size={30} color="#FFD700" /><h5>Entregas Hoje</h5></>}
                {status === 'tomorrow' && <><FaClipboardCheck size={30} color="#00FF7F" /><h5>Entregas Amanhã</h5></>}
                {status === 'overdue' && <><FaExclamationTriangle size={30} color="#FF4500" /><h5>Atrasadas</h5></>}
                {status === 'noDeliveryDate' && <><FaExclamationTriangle size={30} color="#8A2BE2" /><h5>Sem Previsão</h5></>}
                <p className="lead">{counts[status]}</p>
                <ProgressBar progress={(counts[status] / totalDeliveries) * 100} />
                <NoteList>
                  {Object.entries(getGroupedNotesCountByRemetente(status)).map(([remetente, count], idx) => (
                    <NoteItem key={idx}>
                    {remetente}:<br></br> <span style={{fontSize:'20px', fontWeight:500}}> {count} {count === 1 ? 'nota' : 'notas'}
                    </span>
                  </NoteItem>
                  ))}
                </NoteList>
              </Box>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
