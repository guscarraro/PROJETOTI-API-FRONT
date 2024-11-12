import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Container, Row, Col } from 'reactstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Legend } from 'recharts';
import { FaEye, FaExclamationTriangle, FaClipboardCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './style.css';

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
  color: ${(props) => (props.isOpen ? '#b6fff9' : '#fff')};
  opacity: ${(props) => (props.isOpen ? 0.9 : 1)};
`;

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [counts, setCounts] = useState({
    today: 0,
    tomorrow: 0,
    overdue: 0,
    inTwoDays: 0,
    completed: 0,
  });
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [performanceData, setPerformanceData] = useState([]);

  const fetchData = async () => {
    const response = await fetch('https://projetoti-api-production.up.railway.app/dados-otimizados');
    const jsonData = await response.json();
    setData(jsonData);
    setPerformanceData(getPerformanceData(jsonData)); // Atualiza o desempenho com os dados de entregas diárias
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    const inTwoDays = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    inTwoDays.setDate(today.getDate() + 2);

    const counts = {
      today: 0,
      tomorrow: 0,
      overdue: 0,
      inTwoDays: 0,
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
        } else if (deliveryDate.toDateString() === inTwoDays.toDateString()) {
          counts.inTwoDays++;
        } else if (deliveryDate < today) {
          counts.overdue++;
        }
      }
    });

    setCounts(counts);
  }, [data]);

  const totalDeliveries = data.length;
  const completedPercent = ((counts.completed / totalDeliveries) * 100).toFixed(1);
  const totalPending = counts.today + counts.tomorrow + counts.inTwoDays + counts.overdue;

  const chartData = [
    { name: 'Hoje', value: counts.today },
    { name: 'Em 1 Dia', value: counts.tomorrow },
    { name: 'Em 2 Dias', value: counts.inTwoDays },
    { name: 'Atrasadas', value: counts.overdue },
  ];

  const COLORS = ['#00FF7F', '#FFD700', '#FFA500', '#FF4500'];

  const boxColors = {
    today: 'rgba(255, 215, 0, 0.35)',
    tomorrow: 'rgba(0, 255, 127, 0.35)',
    inTwoDays: 'rgba(255, 165, 0, 0.35)',
    overdue: 'rgba(255, 69, 0, 0.35)',
  };

  // Função para agrupar dados de desempenho de entrega diária (no prazo e atrasadas)
  const getPerformanceData = (data) => {
    const groupedByDate = {};
  
    data.forEach((item) => {
      const date = item.entregue_em ? new Date(item.entregue_em).toLocaleDateString() : null;
      if (!date) return;
  
      if (!groupedByDate[date]) {
        groupedByDate[date] = { onTime: 0, late: 0 };
      }
      
      if (item.cte_no_prazo) {
        groupedByDate[date].onTime += 1;
      } else {
        groupedByDate[date].late += 1;
      }
    });
  
    return Object.keys(groupedByDate)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        name: date,
        EntregasNoPrazo: groupedByDate[date].onTime,
        EntregasAtrasadas: groupedByDate[date].late,
      }));
  };
  

  const getGroupedNotesCountByRemetente = (status) => {
    const notesByStatus = data.filter((item) => {
      const deliveryDate = item.previsao_entrega ? new Date(item.previsao_entrega) : null;
      const hoje = new Date().toDateString();
      const amanha = new Date(Date.now() + 86400000).toDateString();
      const doisDias = new Date(Date.now() + 2 * 86400000).toDateString();

      switch (status) {
        case 'today':
          return deliveryDate && deliveryDate.toDateString() === hoje && item.cte_entregue !== 1;
        case 'tomorrow':
          return deliveryDate && deliveryDate.toDateString() === amanha && item.cte_entregue !== 1;
        case 'inTwoDays':
          return deliveryDate && deliveryDate.toDateString() === doisDias && item.cte_entregue !== 1;
        case 'overdue':
          return deliveryDate && deliveryDate < new Date() && item.cte_entregue !== 1;
        default:
          return false;
      }
    });

    const grouped = {};
    notesByStatus.forEach(note => {
      const remetente = note.remetente;
      if (!grouped[remetente]) {
        grouped[remetente] = [];
      }
      grouped[remetente].push(note.NF); // Armazena apenas os números das notas
    });

    return grouped;
  };

  const toggleDropdown = (remetente) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [remetente]: !prev[remetente],
    }));
  };

  return (
    <div className='boxGeneral'>
      <Container fluid>
        <Row>
          <Col md="6">
            <Box style={{ maxHeight: '400px', backgroundColor: 'rgba(0, 0, 0, 0.7)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}>
              <h5>Percentual de Entregas Completas</h5>
              <h2>{completedPercent}%</h2>
              <ResponsiveContainer width="100%" height={280}>
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
            <Box style={{ minHeight: '400px', backgroundColor: 'rgba(0, 0, 0, 0.7)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}>
              <h5>Entregas Diárias: No Prazo vs. Atrasadas</h5>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="stepBefore" dataKey="EntregasNoPrazo" stroke="#00FF7F" />
                  <Line type="stepBefore" dataKey="EntregasAtrasadas" stroke="#FF4500" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Col>
        </Row>

        <Row>
          {['inTwoDays', 'tomorrow', 'today', 'overdue'].map((status, index) => (
            <Col md="6" lg="3" key={index}>
              <Box bgColor={boxColors[status]}>
                {status === 'inTwoDays' && <><FaClipboardCheck size={30} color="#FFA500" /><h5>Entregas em 2 Dias</h5></>}
                {status === 'today' && <><FaEye size={30} color="#FFD700" /><h5>Entregas Hoje</h5></>}
                {status === 'tomorrow' && <><FaClipboardCheck size={30} color="#00FF7F" /><h5>Entregas em 1 Dia</h5></>}
                {status === 'overdue' && <><FaExclamationTriangle size={30} color="#FF4500" /><h5>Atrasadas</h5></>}
                <p className="lead">{counts[status]}</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
          <ProgressBar progress={(counts[status] / totalPending) * 100} />
          <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
            {Math.round((counts[status] / totalPending) * 100)}%
          </span>
        </div>

                <NoteList>
                  {Object.entries(getGroupedNotesCountByRemetente(status)).map(([remetente, notas], idx) => (
                    <NoteItem key={idx} isOpen={dropdownOpen[remetente]}>
                      <div onClick={() => toggleDropdown(remetente)} style={{ cursor: 'pointer', display:'flex', flexDirection:'column'}}>
                        {remetente}:<br />
                        <span style={{ fontSize: '20px', fontWeight: 500 , display:'flex', justifyContent:'space-between', alignItems:'center'}}> {notas.length} {notas.length === 1 ? 'nota' : 'notas'}
                        {dropdownOpen[remetente] ? <FaChevronUp /> : <FaChevronDown />}</span>
                      </div>
                      {dropdownOpen[remetente] && (
                        <ul style={{ paddingLeft: '15px' }}>
                          {notas.map((nf, index) => (
                            <li key={index}>NF: {nf}</li>
                          ))}
                        </ul>
                      )}
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
