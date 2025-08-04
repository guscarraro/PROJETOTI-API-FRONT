
import { Container, Row, Col } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { LoadingContainer, LoadingText, Loader, BtnOcultarGrafico, CarouselWrapper } from './styles';


import DashboardFilters from './DashboardFilters';
import DashboardActions from './DashboardActions';
import DashboardCharts from './DashboardCharts';
import CarouselCards from './CarouselCards';

import useDashboardData from '../../hooks/useDashboardData';
import TelevisaoLayout from './TelevisaoLayout';



const Dashboard = () => {
  const {
    loading,
    isFullScreen,
    setIsFullScreen,
    ref,
    filteredData,
    groupedDataByStatus,
    totalNotasDashboard,
    calculateTotalNotesByStatus,
    calculateOverallNotes,
    dropdownOpen,
    toggleDropdown,
    ocorrenciasPorNota,
    loadingOcorrencias,
    setShowCharts,
    showCharts,
    dataInicial,
    dataFinal,
    filters,
    exportarDetalhado,
    exportarParaExcel,
    exportarTudoSemClientes,
    handlers,
  } = useDashboardData();

  const navigate = useNavigate();

const toggleFullScreen = () => {
  const element = document.documentElement;

  if (!document.fullscreenElement) {
    element.requestFullscreen()
      .then(() => {
        setIsFullScreen(true);
      })
      .catch((err) => {
        console.error("Erro ao entrar em fullscreen:", err);
      });

    const handleExit = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        document.removeEventListener("fullscreenchange", handleExit);
      }
    };

    document.addEventListener("fullscreenchange", handleExit);
  }
};


  if (isFullScreen) {
    return (
      <>
        {/* Layout fullscreen, se existir */}
          <TelevisaoLayout
        data={filteredData}
        dataInicial={dataInicial}
        dataFinal={dataFinal}
      />
      </>
    );
  }

  return (
    <Container fluid className="boxGeneral" ref={ref}>
      {loading ? (
        <LoadingContainer>
          <LoadingText>Carregando dados . . .</LoadingText>
          <Loader />
        </LoadingContainer>
      ) : (
        <>
          <Row>
            
            <DashboardFilters
              responsaveis={filters.responsaveis}
              remetentesResponsavel={filters.remetentesResponsavel}
              {...handlers}
              {...filters}
            />

            <DashboardActions
              exportarParaExcel={exportarParaExcel}
              exportarTudoSemClientes={exportarTudoSemClientes}
              exportarDetalhado={exportarDetalhado}
              navigate={navigate}
              handleFullScreen={toggleFullScreen}
            />

            <Col md="12">
              <BtnOcultarGrafico showCharts={showCharts} onClick={() => setShowCharts(!showCharts)}>
                {showCharts ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
              </BtnOcultarGrafico>
            </Col>
          </Row>

          {showCharts && (
            <Col md="12">

            <DashboardCharts
              filteredData={filteredData}
              ocorrenciasPorNota={ocorrenciasPorNota}
              groupedDataByStatus={groupedDataByStatus}
              calculateTotalNotesByStatus={calculateTotalNotesByStatus}
              dataInicial={dataInicial}
              dataFinal={dataFinal}
              />
              </Col>
          )}

          {filteredData.length > 0 && (
            <CarouselWrapper>

              <CarouselCards
                groupedDataByStatus={groupedDataByStatus}
                totalNotasDashboard={totalNotasDashboard}
                calculateTotalNotesByStatus={calculateTotalNotesByStatus}
                calculateOverallNotes={calculateOverallNotes}
                dropdownOpen={dropdownOpen}
                toggleDropdown={toggleDropdown}
                filteredData={filteredData}
                ocorrenciasPorNota={ocorrenciasPorNota}
                loadingOcorrencias={loadingOcorrencias}
              />
            </CarouselWrapper>
          )}
        </>
      )}
    </Container>
  );
};

export default Dashboard;
