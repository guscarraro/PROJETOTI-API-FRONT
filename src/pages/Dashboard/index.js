import React, { useEffect, useState } from 'react';
import { Box, ProgressBar, NoteList, NoteItem, BtnOcultarGrafico, LoadingContainer, Loader, LoadingText } from './styles';
import { Container, Row, Col } from 'reactstrap';
import { FaEye, FaExclamationTriangle, FaClipboardCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Atendentes from './FiltroAtentende/index';
import './style.css';
import DailyDeliveryChart from './DailyDeliveryChart';
import TopRemetentesChart from './TopRemetentesChart';
import ServiceLevelChart from './ServiceLevelChart';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [selectedAtendente, setSelectedAtendente] = useState('Todos');
  const [selectedRemetente, setSelectedRemetente] = useState('Todos');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://projetoti-api-production.up.railway.app/dados-otimizados');
      const jsonData = await response.json();
      setData(jsonData);
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

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  const applyFilters = () => {
    let filteredData = [...data];

    if (selectedAtendente !== 'Todos') {
      const atendente = Atendentes.find((a) => a.nome === selectedAtendente);
      filteredData = filteredData.filter((item) =>
        atendente?.remetentes.some((remetente) =>
          item.remetente?.toUpperCase().includes(remetente.toUpperCase())
        )
      );
    }

    if (selectedRemetente !== 'Todos') {
      filteredData = filteredData.filter((item) => item.remetente === selectedRemetente);
    }

    return filteredData;
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

  const toggleDropdown = (remetente) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [remetente]: !prev[remetente],
    }));
  };

  const filteredData = applyFilters();
  const groupedDataByStatus = {
    today: groupByRemetente(filterDataByStatus(filteredData, 'today')),
    tomorrow: groupByRemetente(filterDataByStatus(filteredData, 'tomorrow')),
    inTwoDays: groupByRemetente(filterDataByStatus(filteredData, 'inTwoDays')),
    overdue: groupByRemetente(filterDataByStatus(filteredData, 'overdue')),
  };

  return (
    <div className="boxGeneral">
      <Container fluid>
        <Row>
          
        </Row>

        {loading ? (
          <LoadingContainer>
            <LoadingText>Carregando dados . .  .</LoadingText>
            <Loader />
        </LoadingContainer>
        ) : (
          <>
            <Row>
            <Col md="12">
            <label>Atendente:</label>
            <select
              value={selectedAtendente}
              onChange={(e) => setSelectedAtendente(e.target.value)}
              style={{
                margin: '10px',
                padding: '8px',
                borderRadius: '5px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                outline: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
            >
              <option value="Todos">Todos</option>
              {Atendentes.map((atendente) => (
                <option key={atendente.nome} value={atendente.nome}>
                  {atendente.nome}
                </option>
              ))}
            </select>
            <label>Remetente:</label>
            <select
  value={selectedRemetente}
  onChange={(e) => setSelectedRemetente(e.target.value)}
  style={{
    margin: '10px',
    padding: '8px',
    borderRadius: '5px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    outline: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  }}
>
  <option value="Todos">Todos</option>
  {[...new Set(data.map((item) => item.remetente))]
    .sort((a, b) => a.localeCompare(b)) // Ordena alfabeticamente
    .map((remetente, idx) => (
      <option key={idx} value={remetente}>
        {remetente}
      </option>
    ))}
</select>

          </Col>
              <Col md="12">
                <BtnOcultarGrafico
                  showCharts={showCharts}
                  onClick={() => setShowCharts(!showCharts)}
                >
                  {showCharts ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
                </BtnOcultarGrafico>
              </Col>
            </Row>
            {showCharts && (
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
                    <DailyDeliveryChart data={filteredData} />
                  </Box>
                </Col>
              </Row>
            )}

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
                    <p className="lead">
                      {Object.values(groupedDataByStatus[status]).reduce(
                        (total, notes) => total + notes.length,
                        0
                      )}
                    </p>
                    <ProgressBar
                      progress={
                        (Object.values(groupedDataByStatus[status]).reduce(
                          (total, notes) => total + notes.length,
                          0
                        ) /
                          Object.values(groupedDataByStatus).reduce(
                            (sum, group) =>
                              sum +
                              Object.values(group).reduce(
                                (count, notes) => count + notes.length,
                                0
                              ),
                            0
                          )) *
                        100
                      }
                    />
                    <NoteList>
                      {Object.entries(groupedDataByStatus[status]).map(
                        ([remetente, notas], idx) => (
                          <NoteItem
                            key={idx}
                            isOpen={dropdownOpen[remetente]}
                          >
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
                                {dropdownOpen[remetente] ? (
                                  <FaChevronUp />
                                ) : (
                                  <FaChevronDown />
                                )}
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
                        )
                      )}
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
