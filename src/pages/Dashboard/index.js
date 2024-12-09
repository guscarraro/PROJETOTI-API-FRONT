import React, { useEffect, useRef, useState } from 'react';
import { Box, ProgressBar, NoteList, NoteItem, BtnOcultarGrafico, LoadingContainer, Loader, LoadingText } from './styles';
import { Container, Row, Col } from 'reactstrap';
import { FaEye, FaExclamationTriangle, FaClipboardCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Atendentes from './FiltroAtentende/index';
import './style.css';
import { LuMonitorX } from "react-icons/lu";
import DailyDeliveryChart from './DailyDeliveryChart';
import TopRemetentesChart from './TopRemetentesChart';
import ServiceLevelChart from './ServiceLevelChart';
import TelevisaoLayout from './TelevisaoLayout';
import { MdOutlineScreenshotMonitor } from 'react-icons/md';
import { loadIndiceAtendimento } from '../../services/indiceService';
import { formatDate } from '../../helpers';
import { getAuthToken } from '../../services/api';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [selectedAtendente, setSelectedAtendente] = useState('Todos');
  const [selectedRemetente, setSelectedRemetente] = useState('Todos');
  const [selectedDateFilter, setSelectedDateFilter] = useState('last15Days'); // Filtro padrão: últimos 15 dias
  const [dataInicial, setDataInicial] = useState(''); // Estado para armazenar a data inicial
  const [dataFinal, setDataFinal] = useState('');
  const prevDataInicial = useRef(dataInicial);
  const prevDataFinal = useRef(dataFinal);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [updating, setUpdating] = useState(false); // Indica atualização silenciosa
  const reconnectInterval = useRef(null);




  const fetchData = async (silentUpdate = false) => {
    if (!silentUpdate) setLoading(true);

    try {
      console.log('Fetching data for:', dataInicial, dataFinal);

      // Verifique se o token está prestes a expirar ou é inválido, e renove se necessário
      const validToken = await getAuthToken();

      if (validToken) {
        // Chama a API com o token válido
        const indiceData = await loadIndiceAtendimento(dataInicial, dataFinal);

        // Garante que só atualiza se os dados retornados não forem vazios
        if (indiceData && indiceData.length > 0) {
          setData(indiceData); // Atualiza com os novos dados
          console.log('Dados atualizados com sucesso');
        } else {
          console.warn('Dados retornados estão vazios. Mantendo os dados atuais.');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar os dados:', error.message);
      // Caso haja erro, mantemos os dados antigos
      console.warn('Falha na atualização. Mantendo dados antigos.');
    } finally {
      if (!silentUpdate) setLoading(false);
    }
  };
  
  
  useEffect(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 15);
  
    setDataInicial(formatDate(startDate));
    setDataFinal(formatDate(today));
  }, []);
  
  

  // Atualiza os dados quando `dataInicial` ou `dataFinal` são alterados
  useEffect(() => {
    if (dataInicial && dataFinal) {
      // Verifica se as datas mudaram antes de chamar o fetchData
      if (dataInicial !== prevDataInicial.current || dataFinal !== prevDataFinal.current) {
        fetchData();
      }

      // Atualiza as refs com as novas datas
      prevDataInicial.current = dataInicial;
      prevDataFinal.current = dataFinal;
    }
  }, [dataInicial, dataFinal]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true); // Atualiza silenciosamente a cada 20 minutos
    }, 1 * 60000); // 20 minutos em milissegundos
  
    // Limpa o intervalo quando o componente desmontar ou as dependências mudarem
    return () => {
      clearInterval(interval); // Limpa o intervalo
    };
  }, [dataInicial, dataFinal]); // Adicionando dataInicial e dataFinal como dependências
  
  useEffect(() => {
    return () => {
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
      }
    };
  }, []);

  const handleDateFilterChange = (filter) => {
    setSelectedDateFilter(filter);
    const today = new Date();
    let startDate, endDate;

    switch (filter) {
      case 'currentMonth': // Mês atual
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;

      case 'lastMonth': // Mês anterior
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;

      case 'last30Days': // Últimos 30 dias
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = today;
        break;

      case 'last15Days': // Últimos 15 dias
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 15);
        endDate = today;
        break;
    }

    setDataInicial(formatDate(startDate));
    setDataFinal(formatDate(endDate));
  };




  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      console.warn("Documento não está em modo fullscreen.");
    }
  };
  
  
  const handleFullScreen = () => {
    const element = document.documentElement; // Seleciona a página inteira
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      // Para navegadores baseados no WebKit, como Safari
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Para Firefox
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      // Para IE/Edge
      element.msRequestFullscreen();
    }
  };
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      handleFullScreen();
    } else {
      exitFullScreen();
    }
    setIsFullScreen(!isFullScreen);
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
  
    // Aplicar filtro de atendente
    if (selectedAtendente !== 'Todos') {
      const atendente = Atendentes.find((a) => a.nome === selectedAtendente);
      filteredData = filteredData.filter((item) =>
        atendente?.remetentes.some((remetente) =>
          item.remetente?.toUpperCase().includes(remetente.toUpperCase())
        )
      );
    }
  
    // Aplicar filtro de remetente
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
  
    const result = new Set(); // Usa Set para evitar duplicação
  
    filteredData.forEach((item) => {
      const deliveryDate = item.previsao_entrega ? parseDate(item.previsao_entrega).getTime() : null;
      const notas = item.NF ? item.NF.split(",").map((nf) => nf.trim()) : [];
  
      if (!deliveryDate) return;
  
      const include = (() => {
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
      })();
  
      if (include) {
        notas.forEach((nf) => {
          // Adiciona ao Set uma combinação única de nota e status
          result.add(`${item.remetente}-${nf}`);
        });
      }
    });
  
    // Converte o Set de volta para um array de objetos únicos
    return Array.from(result).map((key) => {
      const [remetente, nf] = key.split("-");
      return { remetente, NF: nf };
    });
  };
  

  const groupByRemetente = (filteredData) => {
    const grouped = {};
    filteredData.forEach((item) => {
      const remetente = item.remetente;
      const notas = item.NF ? item.NF.split(",").map((nf) => nf.trim()) : [];
  
      if (!grouped[remetente]) {
        grouped[remetente] = new Set();
      }
  
      // Adiciona cada nota ao Set para evitar duplicatas
      notas.forEach((nf) => {
        grouped[remetente].add(nf); // Armazena apenas os números das notas
      });
    });
  
    // Converte Sets para arrays
    for (const remetente in grouped) {
      grouped[remetente] = Array.from(grouped[remetente]);
    }
  
    return grouped;
  };
  
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
  
    document.addEventListener("fullscreenchange", handleFullScreenChange);
  
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);
  useEffect(() => {
    // Só inicia o intervalo de atualização automática se estiver no modo fullscreen
    if (isFullScreen) {
      const interval = setInterval(() => {
        fetchData(true); // Atualiza silenciosamente a cada 20 minutos
      }, 5 * 60000); // 20 minutos em milissegundos
  
      // Limpa o intervalo quando o componente desmontar ou a tela sair do modo fullscreen
      return () => {
        clearInterval(interval); // Limpa o intervalo
      };
    }
  
    // Caso não esteja em fullscreen, não faz nada.
    return () => {};
  }, [isFullScreen]); // O efeito depende do estado de fullscreen
  
  
  



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
      {isFullScreen ? (
        <>
  <TelevisaoLayout data={filteredData} dataFinal={dataFinal} dataInicial={dataInicial}/>
  <button
    onClick={toggleFullScreen}
    style={{
      position: "fixed",
      top: "10px",
      left: "10px",
      zIndex: 1000,
      background: "none",
      border: "none",
      color: "#fff",
      cursor: "pointer",
      fontSize: "18px",
      display: "flex",
      alignItems: "center",
    }}
  >
    <LuMonitorX  size={24} style={{ marginRight: "5px" }} />
    Sair fullscreen
  </button>

  </>
) : (

      <Container fluid>

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
<label> Filtrar por data:</label>
            <select
              value={selectedDateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
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
              <option value="currentMonth">Mês Atual</option>
              <option value="lastMonth">Mês Passado</option>
              <option value="last30Days">Últimos 30 Dias</option>
              <option value="last15Days">Últimos 15 Dias</option>
            </select>
<Col md="12" style={{ textAlign: "right", marginBottom: "10px" }}>
<button
  onClick={handleFullScreen}
  style={{
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
  }}
>
  <MdOutlineScreenshotMonitor size={24} style={{ marginRight: "5px" }} />
  Tela Cheia
</button>

</Col>




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
                    <DailyDeliveryChart data={filteredData} dataFinal={dataFinal} dataInicial={dataInicial}/>
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
    (total, notas) => total + notas.length, // Cada nota agora é única
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
            {notas.map((nf, noteIdx) => (
              <li key={noteIdx}>NF: {nf}</li>
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
  )}
    </div>
  );
};

export default Dashboard;
