import { useState, useEffect, useRef, useMemo } from 'react';
import {
  groupByStatus,
  groupByRemetente,
  applyEtapasStatusFilter
} from '../utils/dataUtils';
import {
  exportarParaExcelPorCliente,
  exportarTudoSemClientes as exportarGeral,
  exportarExcelDetalhadoPorStatus
} from '../utils/exporter';
import { fetchIndiceAtendimento, fetchOcorrencias } from '../services/api';
import apiLocal from '../services/apiLocal';
import { formatDate } from '../helpers';
import { TODAS_ETAPAS } from '../utils/fluxos';



const useDashboardData = () => {
  const [data, setData] = useState([]);
  const [ocorrenciasPorNota, setOcorrenciasPorNota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOcorrencias, setLoadingOcorrencias] = useState(true);

  const [showCharts, setShowCharts] = useState(true);

  const [selectedResponsavel, setSelectedResponsavel] = useState("Todos");
  const [selectedRemetente, setSelectedRemetente] = useState(["Todos"]);

  const [etapasSelecionadas, setEtapasSelecionadas] = useState([]);
  const [statusEtapasSelecionados, setStatusEtapasSelecionados] = useState([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState("currentMonth");
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [remetentesResponsavel, setRemetentesResponsavel] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const ref = useRef(null);
  const [responsaveis, setResponsaveis] = useState([]);
  const [selectedPracaDestino, setSelectedPracaDestino] = useState(null);





  const toggleDropdown = (remetente) => {
    setDropdownOpen((prev) => ({ ...prev, [remetente]: !prev[remetente] }));
  };

const toggleFullScreen = () => {
  const element = ref.current;

  if (!document.fullscreenElement && element) {
    element.requestFullscreen();
    setIsFullScreen(true);

    // Listener para detectar quando sair do fullscreen
    const handleExit = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        document.removeEventListener("fullscreenchange", handleExit);
      }
    };

    document.addEventListener("fullscreenchange", handleExit);
  } else {
    document.exitFullscreen();
    setIsFullScreen(false);
  }
};


  const handleDateFilterChange = (filter) => {
    setSelectedDateFilter(filter);
    const today = new Date();
    let startDate, endDate;

    switch (filter) {
      case 'currentMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'last30Days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = today;
        break;
      case 'last15Days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 15);
        endDate = today;
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
    }

    setDataInicial(formatDate(startDate));
    setDataFinal(formatDate(endDate));
  };

  useEffect(() => {
    handleDateFilterChange(selectedDateFilter);
  }, [selectedDateFilter]);
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
          const res = await apiLocal.getRemetentesDoResponsavel(selectedResponsavel);
          setRemetentesResponsavel(res.data.remetentes || []);
        } catch (err) {
          console.error("Erro ao buscar remetentes do responsável", err);
        }
      } else {
        setRemetentesResponsavel([]);
      }
    };
    fetchRemetentes();
  }, [selectedResponsavel]);


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const resultado = await fetchIndiceAtendimento(dataInicial, dataFinal);
      setData(resultado);
      setLoading(false);
    };
    if (dataInicial && dataFinal) {
      loadData();
    }
  }, [dataInicial, dataFinal]);

  useEffect(() => {
    const fetchOcorrenciasPorNota = async () => {
      setLoadingOcorrencias(true);
      const resultado = await fetchOcorrencias(data);
      setOcorrenciasPorNota(resultado);
      setLoadingOcorrencias(false);
    };
    if (data.length > 0) fetchOcorrenciasPorNota();
  }, [data]);

useEffect(() => {
  let interval;

  const updateSilencioso = async () => {
    try {
      if (!loading && !loadingOcorrencias) {
        const novosDados = await fetchIndiceAtendimento(dataInicial, dataFinal);
        setData(novosDados);
        const novasOcorrencias = await fetchOcorrencias(novosDados);
        setOcorrenciasPorNota(novasOcorrencias);
      }
    } catch (err) {
      console.error("Erro na atualização silenciosa:", err);
    }
  };

  if (isFullScreen) {
    updateSilencioso(); // Atualiza imediatamente ao entrar em fullscreen
    interval = setInterval(() => {
      updateSilencioso(); // Atualiza a cada 20 minutos
    }, 20 * 60 * 1000);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isFullScreen, dataInicial, dataFinal, loading, loadingOcorrencias]);



  const filteredData = applyEtapasStatusFilter(data, ocorrenciasPorNota, {
    selectedResponsavel,
    selectedRemetente,
    etapasSelecionadas,
    statusEtapasSelecionados,
    remetentesResponsavel,
    selectedPracaDestino
  });

  const groupedDataByStatus = useMemo(() => {
    return groupByStatus(filteredData, ocorrenciasPorNota);
  }, [filteredData, ocorrenciasPorNota]);

  const totalNotasComAguardando = useMemo(() => {
    let total = 0;

    for (const status in groupedDataByStatus) {
      const grupo = groupedDataByStatus[status] || [];

      if (status === 'aguardandoAgendamento') {
        for (const o of ocorrenciasPorNota) {
          const deveIncluir =
            o.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
            !o.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

          if (!deveIncluir || !o.NF) continue;

          const nfs = String(o.NF).split(",").map((nf) => nf.trim());
          total += nfs.length;
        }
      } else if (status === 'semPrevisao') {
        for (const item of grupo) {
          if (!item.NF) continue;
          const nfs = String(item.NF).split(",").map((nf) => nf.trim());
          total += nfs.length;
        }
      } else {
        for (const item of grupo) {
          const nfs = String(item.NF).split(",").map((nf) => nf.trim());
          const nfsValidas = nfs.filter((nf) => {
            const infoNota = ocorrenciasPorNota.find((o) =>
              String(o.NF).split(",").map((x) => x.trim()).includes(nf)
            );

            const isAguardando =
              infoNota?.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
              !infoNota?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

            return !isAguardando;
          });

          total += nfsValidas.length;
        }
      }
    }

    return total;
  }, [groupedDataByStatus, ocorrenciasPorNota]);

const todasEtapasUnicas = TODAS_ETAPAS;

  const todasCoresStatus = ["branca", "verde", "vermelha"];



  const calculateTotalNotesByStatus = (
    group = [],
    status,
    ocorrencias = ocorrenciasPorNota,
    tipoPendencia = 'geral'
  ) => {
    let total = 0;
    if (!Array.isArray(group)) return 0;

    group.forEach((item) => {
      const notasUnicas = Array.from(new Set(item.notas || []));
      const notasValidas = notasUnicas.filter((nf) => {
        const infoNota = ocorrencias.find((o) => String(o.NF) === nf);
        if (!infoNota) return false;

        const temAgendamento =
          infoNota.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
          !infoNota.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

        const ehViagem = infoNota?.praca_destino?.toUpperCase() !== "SJP";

        if (tipoPendencia === "agendamento") {
          return temAgendamento && !ehViagem;
        } else if (tipoPendencia === "viagem") {
          return ehViagem && !temAgendamento;
        } else if (tipoPendencia === "viagem_agendamento") {
          return ehViagem && temAgendamento;
        } else {
          return true;
        }
      });

      total += notasValidas.length;
    });

    return total;
  };

  const calculateOverallNotes = (group) =>
    group.reduce((acc, curr) => acc + curr.notas.length, 0);

// Substitua as funções de exportação por:

const exportarParaExcel = () => {
  
  exportarParaExcelPorCliente(groupedDataByStatus, filteredData, ocorrenciasPorNota);
};


const exportarDetalhado = () => {
  exportarExcelDetalhadoPorStatus(groupedDataByStatus, filteredData, ocorrenciasPorNota);
};

const exportarTudoSemClientes = () => {
  exportarGeral(groupedDataByStatus, filteredData, ocorrenciasPorNota);
};

  return {
    data,
    filteredData,
    groupedDataByStatus,
    totalNotasDashboard: totalNotasComAguardando,
    ocorrenciasPorNota,
    loading,
    loadingOcorrencias,
    showCharts,
    setShowCharts,
    dataInicial,
    dataFinal,
    dropdownOpen,
    toggleDropdown,
    calculateTotalNotesByStatus,
    calculateOverallNotes,
    remetentesResponsavel,
    isFullScreen,
    toggleFullScreen,
    setIsFullScreen,
    ref,
    filters: {
      responsaveis,
      remetentesResponsavel,
      selectedResponsavel,
      selectedRemetente,
      etapasSelecionadas,
      statusEtapasSelecionados,
      selectedPracaDestino, 
      selectedDateFilter,
      todasEtapasUnicas,
      todasCoresStatus,
      data
    },
    handlers: {
      setSelectedResponsavel,
      setSelectedRemetente,
      setEtapasSelecionadas,
      setStatusEtapasSelecionados,
      handleDateFilterChange,
      setSelectedPracaDestino
    },
    exportarParaExcel,
    exportarTudoSemClientes,
    exportarDetalhado
  };
};

export default useDashboardData;
