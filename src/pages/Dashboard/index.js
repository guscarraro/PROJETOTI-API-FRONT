import React, { useEffect, useState } from 'react';
import { Box, ProgressBar, NoteList, NoteItem } from './styles';
import { Container, Row, Col } from 'reactstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaEye, FaExclamationTriangle, FaClipboardCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './style.css';

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
  const [selectedAtendente, setSelectedAtendente] = useState('Todos');

  const atendentes = [
    { nome: 'BRUNA', remetentes: ['ACIPAR', 'ALBINO', 'ALPAGARTAS', 'BLUE', 'GEORGE', 'DOCES', 'CEPERA', 'EBBA', 'COLLI', 'FABESUL', 'MASSAS', 'NUTRISUL', 'S.S.', 'SELMI', 'ANGELO', 'CHÁ', 'PARATI', 'PETRY', 'MOCSAL', 'SUL', 'ALCA', 'MOR', 'LEKE', 'CONSOLATA', 'JUREIA'] },
    { nome: 'ALISON (ARMAZENAGEM)', remetentes: ['AGROMED', 'SOMA', 'DELUC', 'ENERGIS', 'AUDAX'] },
    { nome: 'ANA CAROLINE', remetentes: ['BETTANIN', 'ORDENE', 'PLASVALE', 'SANREMO', 'SUPERPRO', 'BABY', 'LIMPANO', 'BURN', 'FOOD'] },
    { nome: 'INGRID', remetentes: ['BEBIDAS', 'DOS', 'LA', 'METTA', 'NAT', 'ALMEIDA', 'VITAO', 'POLIBRINQ', 'BISCOTTO', 'SOETO', 'PINDUCA'] },
    { nome: 'YARA', remetentes: ['DACOLONIA', 'ZAMONER', 'ZHOQS', 'ORIGEN', 'HR', 'ZANETTE', 'MANIACS'] },
    { nome: 'ANDREIA', remetentes: ['CAFÉ', 'SEMALO'] },
    { nome: 'ISABELLA', remetentes: ['CIMED', 'CAFÉ'] },
    { nome: 'GRACIELI', remetentes: ['KARAVAGGIO', 'TW', 'LOVATO', 'ACM'] },
    { nome: 'SAMARA', remetentes: ['EMBRAST', 'MALKA', 'IRMÃOS', 'JALOTO', 'MASSAS', 'NUTRIMENTAL', 'VALE'] },
    { nome: 'LUIZ MULLER', remetentes: ['PALETES'] },
    { nome: 'GABI', remetentes: ['YOKI'] },
    { nome: 'MICHELE/BRUNO', remetentes: ['M.DIAS'] }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://projetoti-api-production.up.railway.app/dados-otimizados');
      const jsonData = await response.json();
      setData(jsonData);
      calculateServiceLevel(jsonData);
    } catch (error) {
      console.error('Erro ao buscar os dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const boxColors = {
    today: 'rgba(255, 215, 0, 0.35)',
    tomorrow: 'rgba(0, 255, 127, 0.35)',
    inTwoDays: 'rgba(255, 165, 0, 0.35)',
    overdue: 'rgba(255, 69, 0, 0.35)',
  };

  const calculateServiceLevel = (filteredData) => {
    const deliveredNotes = filteredData.filter((item) => item.cte_entregue === 1);
    const onTime = deliveredNotes.filter((item) => {
      const entregaDate = item.entregue_em ? parseDate(item.entregue_em) : null;
      const previsaoDate = item.previsao_entrega ? parseDate(item.previsao_entrega) : null;
      return entregaDate && previsaoDate && entregaDate <= previsaoDate;
    }).length;
    const totalDelivered = deliveredNotes.length;
    const serviceLevel = totalDelivered > 0 ? ((onTime / totalDelivered) * 100).toFixed(1) : 0;
    setServiceLevel(serviceLevel);
    setOnTimeCount(onTime);
    setLateCount(totalDelivered - onTime);
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  const filterDataByAtendente = () => {
    if (selectedAtendente === 'Todos') return data;
    const atendente = atendentes.find((a) => a.nome === selectedAtendente);
    return data.filter((item) => {
      return atendente?.remetentes.some((remetente) =>
        item.remetente?.toUpperCase().includes(remetente.toUpperCase())
      );
    });
  };

  const filterDataByStatus = (filteredData, status) => {
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

    return filteredData.filter((item) => {
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
  };

  const groupByRemetente = (filteredData) => {
    const grouped = {};
    filteredData.forEach((item) => {
      const remetente = item.remetente;
      if (!grouped[remetente]) {
        grouped[remetente] = [];
      }
      grouped[remetente].push(item);
    });
    return grouped;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      calculateServiceLevel(filterDataByAtendente());
    }
  }, [selectedAtendente, loading]);

  const toggleDropdown = (remetente) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [remetente]: !prev[remetente],
    }));
  };

  const groupedDataByStatus = {
    today: groupByRemetente(filterDataByStatus(filterDataByAtendente(), 'today')),
    tomorrow: groupByRemetente(filterDataByStatus(filterDataByAtendente(), 'tomorrow')),
    inTwoDays: groupByRemetente(filterDataByStatus(filterDataByAtendente(), 'inTwoDays')),
    overdue: groupByRemetente(filterDataByStatus(filterDataByAtendente(), 'overdue')),
  };

  return (
    <div className='boxGeneral'>
      <Container fluid>
        <Row>
          <Col>
            <select
              value={selectedAtendente}
              onChange={(e) => setSelectedAtendente(e.target.value)}
              style={{ margin: '10px 0', padding: '8px', borderRadius: '5px' }}
            >
              <option value="Todos">Todos</option>
              {atendentes.map((atendente) => (
                <option key={atendente.nome} value={atendente.nome}>
                  {atendente.nome}
                </option>
              ))}
            </select>
          </Col>
        </Row>

        {loading ? (
          <div className="loading-container">
            <h5>Carregando dados...</h5>
          </div>
        ) : (
          <>
            <Row>
              <Col md="6">
                <Box>
                  <h5>Nível de Serviço</h5>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: `No Prazo (${onTimeCount})`, value: parseInt(serviceLevel) },
                          { name: `Atrasadas (${lateCount})`, value: 100 - parseInt(serviceLevel) },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {[{ name: 'No Prazo', value: parseInt(serviceLevel) }, { name: 'Atrasadas', value: 100 - parseInt(serviceLevel) }].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#00FF7F' : '#FF4500'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Col>
              <Col md="6">
                <Box>
                  <h5>Nível de Serviço Geral</h5>
                  <h2 style={{ fontSize: '60px' }}>{serviceLevel}%</h2>
                </Box>
              </Col>
            </Row>
            <Row>
              {['inTwoDays', 'tomorrow', 'today', 'overdue'].map((status, index) => (
                <Col md="6" lg="3" key={index}>
                  <Box bgColor={boxColors[status]} isPulsing={status === 'overdue'}>
                    {status === 'inTwoDays' && <><FaClipboardCheck size={30} color="#FFA500" /><h5>Entregas em 2 Dias</h5></>}
                    {status === 'today' && <><FaEye size={30} color="#FFD700" /><h5>Entregas Hoje</h5></>}
                    {status === 'tomorrow' && <><FaClipboardCheck size={30} color="#00FF7F" /><h5>Entregas em 1 Dia</h5></>}
                    {status === 'overdue' && <><FaExclamationTriangle size={30} color="#FF4500" /><h5>Atrasadas</h5></>}
                    <p className="lead">{Object.values(groupedDataByStatus[status]).reduce((total, notes) => total + notes.length, 0)}</p>
                    <ProgressBar
  progress={(
    Object.values(groupedDataByStatus[status]).reduce((total, notes) => total + notes.length, 0) /
    Object.values(groupedDataByStatus).reduce((sum, group) =>
      sum + Object.values(group).reduce((count, notes) => count + notes.length, 0), 0)
  ) * 100}
/>
                    <NoteList>
                      {Object.entries(groupedDataByStatus[status]).map(([remetente, notas], idx) => (
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
                              {notas.map((note, noteIdx) => (
                                <li key={noteIdx}>NF: {note.NF}</li>
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