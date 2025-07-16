import React, { useEffect, useRef, useState } from 'react';
import { Box, ProgressBar, NoteList, NoteItem, BtnOcultarGrafico, LoadingContainer, Loader, LoadingText } from './styles';
import { Container, Row, Col, Button } from 'reactstrap';
import { FaEye, FaExclamationTriangle, FaClipboardCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import './style.css';
import { LuMonitorX } from "react-icons/lu";
import DailyDeliveryChart from './DailyDeliveryChart';
import TopRemetentesChart from './TopRemetentesChart';
import ServiceLevelChart from './ServiceLevelChart';
import TelevisaoLayout from './TelevisaoLayout';
import { MdOutlineScreenshotMonitor } from 'react-icons/md';
import { formatDate } from '../../helpers';
import { fetchIndiceAtendimento } from '../../services/api';
import { useNavigate } from "react-router-dom";
import apiLocal from '../../services/apiLocal';
import CarouselCards from './CarouselCards';
// import MedidorLeadTime from './MedidorLeadTime';

// const fluxosPorTpVg = {
//   ETPFRA: [
//     "ENTRADA DE XML NO SISTEMA",
//     "DOCUMENTO EMITIDO",
//     "MERCADORIA SEPARADA/CONFERIDA",
//     "AGUARDANDO ROTERIZACAO",
//     "VIAGEM CRIADA",
//     "EM ROTA",
//     "CHEGADA NO LOCAL",
//     "INICIO DE DESCARGA",
//     "FIM DE DESCARGA",
//   ],
//   TRANS: [
//     "ENTRADA DE XML NO SISTEMA",
//     "DOCUMENTO EMITIDO",
//     "MERCADORIA SEPARADA/CONFERIDA",
//     "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA",
//     "VIAGEM CRIADA",
//     "EM ROTA DE TRANSFERENCIA",
//     "CHEGADA NA BASE/FILIAL",
//     "EM ROTA",
//     "CHEGADA NO LOCAL",
//     "INICIO DE DESCARGA",
//     "FIM DE DESCARGA",
//   ],
//   FRA: [
//     "ENTRADA DE XML NO SISTEMA",
//     "DOCUMENTO EMITIDO",
//     "MERCADORIA SEPARADA/CONFERIDA",
//     "AGUARDANDO ROTERIZACAO",
//     "VIAGEM CRIADA",
//     "EM ROTA",
//   ],
// };

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [selectedAtendente, setSelectedAtendente] = useState('Todos');
  const [selectedRemetente, setSelectedRemetente] = useState('Todos');
  const [selectedDateFilter, setSelectedDateFilter] = useState('currentMonth'); // Filtro padrão: últimos 15 dias
  const [dataInicial, setDataInicial] = useState(''); // Estado para armazenar a data inicial
  const [dataFinal, setDataFinal] = useState('');
  const prevDataInicial = useRef(dataInicial);
  const prevDataFinal = useRef(dataFinal);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [updating, setUpdating] = useState(false); // Indica atualização silenciosa
  const reconnectInterval = useRef(null);
  const navigate = useNavigate();
  const [responsaveis, setResponsaveis] = useState([]);
  const [selectedResponsavel, setSelectedResponsavel] = useState('Todos');
  const [remetentesResponsavel, setRemetentesResponsavel] = useState([]);
  // const [etapaPendenteSelecionada, setEtapaPendenteSelecionada] = useState("Todas");
// const todasEtapasUnicas = Array.from(new Set(Object.values(fluxosPorTpVg).flat()));

  useEffect(() => {
    const fetchResponsaveis = async () => {
      try {
        const response = await apiLocal.getResponsaveis();
        setResponsaveis(response.data);


      } catch (error) {
        console.error("Erro ao buscar responsáveis", error);
      }
    };
    fetchResponsaveis();
  }, []);
  useEffect(() => {
    const fetchRemetentes = async () => {
      if (selectedResponsavel !== 'Todos') {
        try {
          const res = await apiLocal.getRemetentesDoResponsavel(selectedResponsavel); // novo endpoint
          setRemetentesResponsavel(res.data.remetentes);


        } catch (err) {
          console.error("Erro ao buscar remetentes do responsável", err);
        }
      } else {
        setRemetentesResponsavel([]);
      }
    };
    fetchRemetentes();
  }, [selectedResponsavel]);



  const fetchData = async (silentUpdate = false) => {
    if (!silentUpdate) setLoading(true);

    try {

      const indiceData = await fetchIndiceAtendimento(dataInicial, dataFinal);

      if (indiceData && indiceData.length > 0) {
        setData(indiceData);

      } else {
        console.warn('Nenhum dado foi retornado pela API. Mantendo os dados antigos.');
      }
    } catch (error) {
      console.error('Erro ao carregar os dados:', error.message);
    } finally {
      if (!silentUpdate) setLoading(false);
    }
  };



  useEffect(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Primeiro dia do mês atual
    const endDate = today; // Hoje

    setDataInicial(formatDate(startDate));
    setDataFinal(formatDate(endDate));
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
    }, 10 * 60000); // 20 minutos em milissegundos

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
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 15);
        endDate = today;
        break;

      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Padrão: Mês atual
        endDate = today;
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
  const calculateTotalNotesByStatus = (group) => {
    let total = 0;
    group.forEach((item) => {
      total += item.count || 0; // Soma a contagem de notas
    });
    return total;
  };

  const calculateOverallNotes = (dataByStatus) => {
    let overallTotal = 0;
    Object.keys(dataByStatus).forEach((key) => {
      const group = dataByStatus[key];
      overallTotal += calculateTotalNotesByStatus(group);
    });
    return overallTotal;
  };

//   const etapasFixas = [
//   { nome: "ENTRADA DE XML NO SISTEMA", status: "verde" },
//   { nome: "DOCUMENTO EMITIDO", status: "verde" },
//   { nome: "MERCADORIA SEPARADA/CONFERIDA", status: "vermelha" },
//   { nome: "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA", status: "verde" },
//   { nome: "EM ROTA DE TRANSFERENCIA", status: "verde" },
//   { nome: "CHEGADA NA BASE/FILIAL", status: "verde" },
//   { nome: "EM ROTA", status: "verde" },
//   { nome: "CHEGADA NO LOCAL", status: "verde" },
//   { nome: "INICIO DE DESCARGA", status: "branca" },
//   { nome: "FIM DE DESCARGA", status: "branca" },
// ];


  const applyFilters = () => {
    let filteredData = [...data];

    // Aplicar filtro de atendente
    if (selectedResponsavel !== 'Todos') {
      filteredData = filteredData.filter((item) =>
        remetentesResponsavel.some((rem) =>
          item.remetente?.toUpperCase().includes(rem.toUpperCase())
        )
      );
    }
//     if (etapaPendenteSelecionada !== "Todas") {
//   filteredData = filteredData.filter(() => {
//     const etapasPendentes = etapasFixas.filter(
//       (etapa) => etapa.status === "branca"
//     ).map((etapa) => etapa.nome);

//     return etapasPendentes.includes(etapaPendenteSelecionada);
//   });
// }


    // Filtro por remetente individual (continua o mesmo)
    if (selectedRemetente !== 'Todos') {
      filteredData = filteredData.filter((item) => item.remetente === selectedRemetente);
    }



    return filteredData;
  };


  const exportarParaExcel = async () => {
    const workbook = new ExcelJS.Workbook();

  
    const statusLabels = {
      inThreeDays: "Pendentes para entregar em 3 dias",

      inTwoDays: "Pendentes para entregar em 2 dias",
      tomorrow: "Pendentes para entregar em 1 dia",
      today: "Entregas hoje",
      overdue: "Atrasadas",
    };

    const colIndexMap = {
      inThreeDays: 1,
      inTwoDays: 3,
      tomorrow: 5,
      today: 7,
      overdue: 9,
    };

    for (const [statusKey, label] of Object.entries(statusLabels)) {
      groupedDataByStatus[statusKey].forEach(({ remetente, notas }) => {
        const safeSheetName = remetente
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[*?:\/\\[\]]/g, "-")
          .substring(0, 31);

        let sheet = workbook.getWorksheet(safeSheetName);

        if (!sheet) {
          sheet = workbook.addWorksheet(safeSheetName);

          // Cabeçalho
          sheet.addRow([
            "Pendentes para entregar em 3 dias", "Destino",

            "Pendentes para entregar em 2 dias", "Destino",
            "Pendentes para entregar em 1 dia", "Destino",
            "Entregas hoje", "Destino",
            "Atrasadas", "Destino", "Dias em atraso"
          ]);

          // Estilizar cabeçalho
          sheet.getRow(1).eachCell((cell, colNumber) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFCCE5FF" },
            };
            cell.font = { bold: true };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            sheet.getColumn(colNumber).width = 25;
          });
        }

        notas.forEach((nf, i) => {
          const rowIndex = i + 2;
          let row = sheet.getRow(rowIndex);
          const col = colIndexMap[statusKey];

          const notaInfo = filteredData.find(item =>
            item.NF?.split(",").map(s => s.trim()).includes(nf) &&
            item.remetente === remetente
          );

          const isAgendada = notaInfo?.destinatario?.includes("(AGENDADO)");
          const ehForaSJP = notaInfo?.praca_destino?.toUpperCase() !== "SJP";

          let notaComMarcador = nf;
          if (ehForaSJP && isAgendada) {
            notaComMarcador += " (VIAGEM + AGENDADO)";
          } else if (ehForaSJP) {
            notaComMarcador += " (VIAGEM)";
          } else if (isAgendada) {
            notaComMarcador += " (AGENDADO)";
          }

          // Coluna da nota
          row.getCell(col).value = notaComMarcador;
          row.getCell(col).alignment = { vertical: "middle", horizontal: "center" };
          row.getCell(col).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          // Coluna do destino (com praça)
          const destinoFormatado = `${notaInfo?.destino || "-"} (${notaInfo?.praca_destino || "-"})`;
          row.getCell(col + 1).value = destinoFormatado;
          row.getCell(col + 1).alignment = { vertical: "middle", horizontal: "center" };
          row.getCell(col + 1).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          // Dias em atraso (somente para "overdue")
          if (statusKey === "overdue") {
            const entregaInfo = filteredData.find(item =>
              item.NF?.split(",").map(s => s.trim()).includes(nf)
            );
            let diasAtraso = "";

            if (entregaInfo?.previsao_entrega) {
              const dataEntrega = parseDate(entregaInfo.previsao_entrega);
              const hoje = new Date();
              const diff = Math.floor((hoje - dataEntrega) / (1000 * 60 * 60 * 24));
              diasAtraso = diff > 0 ? diff : "";
            }

            row.getCell(col + 2).value = diasAtraso;
            row.getCell(col + 2).alignment = { vertical: "middle", horizontal: "center" };
            row.getCell(col + 2).border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }

          row.commit(); // Importante para aplicar alterações
        });
      });
    }

    // Gerar arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(blob, `Relatorio_Entregas_Formatado_${new Date().toLocaleDateString("pt-BR")}.xlsx`);
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



    const result = [];

    filteredData.forEach((item) => {
      const deliveryDate = item.previsao_entrega
        ? parseDate(item.previsao_entrega).getTime()
        : null;
      const notas = item.NF ? item.NF.split(",").map((nf) => nf.trim()) : [];

      if (!deliveryDate) return;

      let include = false;

      switch (status) {
        case 'today':
          include =
            deliveryDate >= startOfToday &&
            deliveryDate <= endOfToday &&
            item.cte_entregue !== 1;
          break;
        case 'tomorrow':
          include =
            deliveryDate >= startOfTomorrow &&
            deliveryDate <= endOfTomorrow &&
            item.cte_entregue !== 1;
          break;
        case 'inTwoDays':
          include =
            deliveryDate >= startOfInTwoDays &&
            deliveryDate <= endOfInTwoDays &&
            item.cte_entregue !== 1;
          break;
        case 'overdue':
          include =
            deliveryDate < startOfToday && item.cte_entregue !== 1;
          break;
        default:
          break;
        case 'inThreeDays':
          const inThreeDays = new Date();
          inThreeDays.setDate(today.getDate() + 3);
          const startOfInThreeDays = new Date(inThreeDays.setHours(0, 0, 0, 0)).getTime();
          const endOfInThreeDays = new Date(inThreeDays.setHours(23, 59, 59, 999)).getTime();

          include =
            deliveryDate >= startOfInThreeDays &&
            deliveryDate <= endOfInThreeDays &&
            item.cte_entregue !== 1;
          break;

      }

      if (include) {
        notas.forEach((nf) => {
          result.push({ remetente: item.remetente, NF: nf });
        });
      }
    });

    return result;
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
        grouped[remetente].add(nf);
      });
    });

    // Converte o objeto para um array ordenado por número de notas (decrescente)
    const groupedArray = Object.entries(grouped)
      .map(([remetente, notas]) => ({
        remetente,
        notas: Array.from(notas),
        count: Array.from(notas).length, // Adiciona a contagem de notas
      }))
      .sort((a, b) => b.count - a.count); // Ordena de forma decrescente pelo número de notas

    return groupedArray;
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
      }, 10 * 60000); // 20 minutos em milissegundos

      // Limpa o intervalo quando o componente desmontar ou a tela sair do modo fullscreen
      return () => {
        clearInterval(interval); // Limpa o intervalo
      };
    }

    // Caso não esteja em fullscreen, não faz nada.
    return () => { };
  }, [isFullScreen]); // O efeito depende do estado de fullscreen


  const exportarTudoSemClientes = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Notas Agendadas e Atrasadas");

    // Cabeçalho
    // Cabeçalho
    sheet.addRow([
      "Status",
      "Número do CTE",
      "Nota Fiscal",
      "Destino", // ✅ NOVO
      "Praça Destino",
      "Remetente",
      "Destinatário",
      "Previsão de Entrega",
      "Dias em Atraso"
    ]);



    // Estiliza o cabeçalho
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEFEFEF" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    const hoje = new Date();
    const statusLabels = {
      inThreeDays: "Entrega em 3 dias",
      inTwoDays: "Entrega em 2 dias",
      tomorrow: "Entrega em 1 dia",
      today: "Entrega hoje",
      overdue: "Atrasada",
    };

    for (const statusKey of ['inThreeDays', 'inTwoDays', 'tomorrow', 'today', 'overdue']) {
      groupedDataByStatus[statusKey].forEach(({ remetente, notas }) => {
        notas.forEach((nf) => {
          const notaInfo = filteredData.find((item) =>
            item.NF?.split(",").map((n) => n.trim()).includes(nf) &&
            item.remetente === remetente
          );

          if (notaInfo) {
            const previsao = notaInfo.previsao_entrega || "-";
            const entregaDate = parseDate(previsao);
            const diasAtraso =
              statusKey === "overdue" && entregaDate
                ? Math.floor((hoje - entregaDate) / (1000 * 60 * 60 * 24))
                : "";

            const isAgendada = notaInfo?.destinatario?.includes("(AGENDADO)");
            const ehForaSJP = notaInfo?.praca_destino?.toUpperCase() !== "SJP";

            let notaComMarcador = nf;
            if (ehForaSJP && isAgendada) {
              notaComMarcador += " (VIAGEM + AGENDADO)";
            } else if (ehForaSJP) {
              notaComMarcador += " (VIAGEM)";
            } else if (isAgendada) {
              notaComMarcador += " (AGENDADO)";
            }
            // Verificação de status composto (agendado, viagem, atraso)
            let statusComposto = statusLabels[statusKey]; // Ex: "Atrasada"
            if (ehForaSJP && isAgendada) {
              statusComposto += " + VIAGEM + AGENDADO";
            } else if (ehForaSJP) {
              statusComposto += " + VIAGEM";
            } else if (isAgendada) {
              statusComposto += " + AGENDADO";
            }


            sheet.addRow([
              statusComposto,
              notaInfo.CTE || "-",
              notaComMarcador,
              notaInfo.destino || "-", // ✅ NOVA COLUNA DESTINO
              notaInfo.praca_destino,
              remetente,
              notaInfo.destinatario,
              previsao,
              diasAtraso
            ]);


          }
        });
      });
    }

    // Gerar e salvar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Relatorio_Entregas_GERAL_${new Date().toLocaleDateString("pt-BR")}.xlsx`);
  };





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
    inThreeDays: groupByRemetente(filterDataByStatus(filteredData, 'inThreeDays')),

    overdue: groupByRemetente(filterDataByStatus(filteredData, 'overdue')),
  };



  return (
    <div className="boxGeneral">
      {isFullScreen ? (
        <>
          <TelevisaoLayout data={filteredData} dataFinal={dataFinal} dataInicial={dataInicial} />
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
            <LuMonitorX size={24} style={{ marginRight: "5px" }} />
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


                  <label>Responsável:</label>
                  <select
                    value={selectedResponsavel}
                    onChange={(e) => setSelectedResponsavel(e.target.value)}
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
                    {responsaveis.map((r) => (
                      <option key={r.id} value={r.id}>{r.nome}</option>
                    ))}
                  </select>

{/* <label>Etapa pendente:</label>
<select
  value={etapaPendenteSelecionada}
  onChange={(e) => setEtapaPendenteSelecionada(e.target.value)}
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
    appearance: 'none'
  }}
>
  <option value="Todas">Todas</option>
  {todasEtapasUnicas.map((etapa, idx) => (
    <option key={idx} value={etapa}>{etapa}</option>
  ))}
</select> */}

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
                  <Button color="success" onClick={exportarParaExcel} style={{ width: '250px', cursor: "pointer", }}>
                    Exportar Excel por cliente
                  </Button>
                  <Button color="success" onClick={() => exportarTudoSemClientes()} style={{ width: '250px', color: "#fff", marginLeft: 10 }}>
                    Exportar Excel geral
                  </Button>

                  <Button
                    onClick={() => navigate("/Frete")} // Navegar para Frete
                    style={{
                      marginLeft: 15,
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Ir para Ocorrências
                  </Button>
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
                      <DailyDeliveryChart data={filteredData} dataFinal={dataFinal} dataInicial={dataInicial} />
                    </Box>
                  </Col>
                  {/* <Col md="12">
                    <Box>
                
<MedidorLeadTime data={filteredData} />

                    </Box>
                  </Col> */}
                </Row>
              )}
              <CarouselCards
                groupedDataByStatus={groupedDataByStatus}
                calculateTotalNotesByStatus={calculateTotalNotesByStatus}
                calculateOverallNotes={calculateOverallNotes}
                dropdownOpen={dropdownOpen}
                toggleDropdown={toggleDropdown}
                filteredData={filteredData}
              />

            </>
          )}
        </Container>
      )}
    </div>
  );
};

export default Dashboard;
