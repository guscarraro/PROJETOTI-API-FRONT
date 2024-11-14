import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Container, Row, Col } from 'reactstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaEye, FaExclamationTriangle, FaClipboardCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './style.css';

const pulseOpacity = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
`;

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
  ${(props) => props.isPulsing && css`
    animation: ${pulseOpacity} 2s infinite;
  `}
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
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    today: 0,
    tomorrow: 0,
    overdue: 0,
    inTwoDays: 0,
    completed: 0,
  });
  const [serviceLevel, setServiceLevel] = useState(0);
  const [onTimeCount, setOnTimeCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState({});

  const fetchData = async () => {
    setLoading(true); // Inicia o carregamento
    try {
      const response = await fetch('https://projetoti-api-production.up.railway.app/dados-otimizados');
      const jsonData = await response.json();
      setData(jsonData);
      calculateServiceLevel(jsonData);
    } catch (error) {
      console.error('Erro ao buscar os dados:', error);
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };
  

  const calculateServiceLevel = (data) => {
    // Filtra apenas as entregas realizadas
    const deliveredNotes = data.filter((item) => item.cte_entregue === 1);
  
    // Entregas no prazo
    const onTime = deliveredNotes.filter((item) => {
      const entregaDate = item.entregue_em ? parseDate(item.entregue_em) : null;
      const previsaoDate = item.previsao_entrega ? parseDate(item.previsao_entrega) : null;
  
      // Checa se a entrega foi feita no prazo
      return entregaDate && previsaoDate && entregaDate <= previsaoDate;
    }).length;
  
    // Total de entregas realizadas
    const totalDelivered = deliveredNotes.length;
  
    // Cálculo do nível de serviço
    const serviceLevel = totalDelivered > 0 ? ((onTime / totalDelivered) * 100).toFixed(1) : 0;
  
    setServiceLevel(serviceLevel);
    setOnTimeCount(onTime);
    setLateCount(totalDelivered - onTime); // Total entregas menos no prazo = atrasadas
  };
  
  // Função para converter datas no formato DD/MM/YYYY para objetos Date do JavaScript
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };
  


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loading || data.length === 0) return; // Aguarda o carregamento dos dados
  
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endOfToday = new Date(today.setHours(23, 59, 59, 999)).getTime();
  
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0)).getTime();
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999)).getTime();
  
    const inTwoDays = new Date(today);
    inTwoDays.setDate(today.getDate() + 2);
    const startOfInTwoDays = new Date(inTwoDays.setHours(0, 0, 0, 0)).getTime();
    const endOfInTwoDays = new Date(inTwoDays.setHours(23, 59, 59, 999)).getTime();
  
    const updatedCounts = {
      today: 0,
      tomorrow: 0,
      overdue: 0,
      inTwoDays: 0,
      completed: 0,
    };
  
    data.forEach((item) => {
      const deliveryDate = item.previsao_entrega ? parseDate(item.previsao_entrega).getTime() : null;
      const isDelivered = item.cte_entregue === 1;
  
      if (isDelivered) {
        updatedCounts.completed++;
      } else if (deliveryDate) {
        if (deliveryDate >= startOfToday && deliveryDate <= endOfToday) {
          updatedCounts.today++;
        } else if (deliveryDate >= startOfTomorrow && deliveryDate <= endOfTomorrow) {
          updatedCounts.tomorrow++;
        } else if (deliveryDate >= startOfInTwoDays && deliveryDate <= endOfInTwoDays) {
          updatedCounts.inTwoDays++;
        } else if (deliveryDate < startOfToday) {
          updatedCounts.overdue++;
        }
      }
    });
  
    setCounts(updatedCounts);
  }, [data, loading]);
  
  
  
  
  
  

  const totalPending = counts.today + counts.tomorrow + counts.inTwoDays + counts.overdue;

  const chartData = [
    { name: `No Prazo (${onTimeCount})`, value: parseInt(serviceLevel) },
    { name: `Atrasadas (${lateCount})`, value: 100 - parseInt(serviceLevel) },
  ];

  const COLORS = ['#00FF7F', '#FF4500'];

  const boxColors = {
    today: 'rgba(255, 215, 0, 0.35)',
    tomorrow: 'rgba(0, 255, 127, 0.35)',
    inTwoDays: 'rgba(255, 165, 0, 0.35)',
    overdue: 'rgba(255, 69, 0, 0.35)',
  };

  const getGroupedNotesCountByRemetente = (status) => {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endOfToday = new Date(today.setHours(23, 59, 59, 999)).getTime();
    
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0)).getTime();
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999)).getTime();
    
    const inTwoDays = new Date();
    inTwoDays.setDate(today.getDate() + 2);
    const startOfInTwoDays = new Date(inTwoDays.setHours(0, 0, 0, 0)).getTime();
    const endOfInTwoDays = new Date(inTwoDays.setHours(23, 59, 59, 999)).getTime();
  
    const notesByStatus = data.filter((item) => {
      const deliveryDate = item.previsao_entrega ? parseDate(item.previsao_entrega).getTime() : null;
      if (!deliveryDate) return false;
  
      switch (status) {
        case 'today':
          return deliveryDate >= startOfToday && deliveryDate <= endOfToday && item.cte_entregue !== 1;
        case 'tomorrow':
          return deliveryDate >= startOfTomorrow && deliveryDate <= endOfTomorrow && item.cte_entregue !== 1;
        case 'inTwoDays':
          return deliveryDate >= startOfInTwoDays && deliveryDate <= endOfInTwoDays && item.cte_entregue !== 1;
        case 'overdue':
          return deliveryDate < startOfToday && item.cte_entregue !== 1;
        default:
          return false;
      }
    });
  
    const grouped = {};
    notesByStatus.forEach((note) => {
      const remetente = note.remetente;
      if (!grouped[remetente]) {
        grouped[remetente] = [];
      }
      grouped[remetente].push(note.NF);
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
      {loading ? (
  <div className="loading-container">
    <h5>Carregando dados...</h5>
  </div>
) : (
  // Renderiza os componentes após o carregamento
<>
        <Row>
          <Col md="6">
            <Box style={{ maxHeight: '400px', backgroundColor: 'rgba(0, 0, 0, 0.7)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' }}>
              <h5>Nível de Serviço</h5>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${value}%`}
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
              <h5>Nível de Serviço Geral</h5>
              <h2 style={{ fontSize:'60px' }}>{serviceLevel}%</h2>
            </Box>
          </Col>
        </Row>
        <Row>
  {['inTwoDays', 'tomorrow', 'today', 'overdue'].map((status, index) => (
    <Col md="6" lg="3" key={index}>
      <Box bgColor={boxColors[status]} isPulsing={status === 'overdue'}>
        {status === 'inTwoDays' && (
          <>
            <FaClipboardCheck size={30} color="#FFA500" />
            <h5>Entregas em 2 Dias</h5>
          </>
        )}
        {status === 'today' && (
          <>
            <FaEye size={30} color="#FFD700" />
            <h5>Entregas Hoje</h5>
          </>
        )}
        {status === 'tomorrow' && (
          <>
            <FaClipboardCheck size={30} color="#00FF7F" />
            <h5>Entregas em 1 Dia</h5>
          </>
        )}
        {status === 'overdue' && (
          <>
            <FaExclamationTriangle size={30} color="#FF4500" />
            <h5>Atrasadas</h5>
          </>
        )}
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
              <div
                onClick={() => toggleDropdown(remetente)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {remetente}:<br />
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {notas.length} {notas.length === 1 ? 'nota' : 'notas'}
                  {dropdownOpen[remetente] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
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
        </>
)}
      </Container>
    </div>
  );
};

export default Dashboard;
