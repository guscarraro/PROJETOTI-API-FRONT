import React, { useState, useEffect } from "react";
import { FaFolder, FaTruck, FaBoxOpen, FaCheckCircle, FaFileAlt, FaChevronUp, FaChevronDown } from "react-icons/fa";
import {
  ContainerGeral,
  Card,
  Header,
  Etapas,
  Etapa,
  IconWrapper,
  Box,
  Linha,
} from "./styles";
import { Col, Row } from "reactstrap";
import { fetchOcorrencias } from "../../services/api";
import { formatarHorasMinutos } from "../../helpers";
import { StyledSelect } from "../../components/StyledSelect";

const formatarData = (data)=>{
  if (!data) return "-";

  // Converte a string para o formato ISO caso necessário
  const dataFormatada = new Date(data.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));

  if (isNaN(dataFormatada)) return "Data inválida";
  
  const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };
  return dataFormatada.toLocaleString("pt-BR", options);
}





const etapas = [
  { tipo: "DATA XML IMPORTADO", label: "Data XML", icon: <FaFolder /> },
  { tipo: "EMISSAO DE CTE", label: "Emissão CTE", icon: <FaFileAlt /> },
  { tipo: "MERCADORIA SEPARADA/CONFERIDA", label: "Separação/Conferência", icon: <FaBoxOpen /> },
  { tipo: "EM ROTA", label: "Em Rota", icon: <FaTruck /> },
  { tipo: "ENTREGA CONFIRMADA", label: "Entrega Confirmada", icon: <FaCheckCircle /> },
];
const etapasTransferencia = [
  { tipo: "DATA XML IMPORTADO", label: "Data XML", icon: <FaFolder /> },
  { tipo: "EMISSAO DE CTE", label: "Emissão CTE", icon: <FaFileAlt /> },
  { tipo: "MERCADORIA SEPARADA/CONFERIDA", label: "Separação/Conferência", icon: <FaBoxOpen /> },
  { tipo: "EM ROTA DE TRANSFERENCIA", label: "Em Rota de Transferência", icon: <FaTruck /> }, // Ícone escolhido
  { tipo: "CHEGADA NA BASE", label: "Chegada na Base", icon: <FaChevronDown /> }, // Ícone escolhido
  { tipo: "EM ROTA", label: "Em Rota", icon: <FaTruck /> },
  { tipo: "ENTREGA CONFIRMADA", label: "Entrega Confirmada", icon: <FaCheckCircle /> },
];
const etapasPendentesOptions = [
  { value: "", label: "Todas" },
  { value: "EMISSAO DE CTE", label: "Emissão CTE" },
  { value: "MERCADORIA SEPARADA/CONFERIDA", label: "Separação/Conferência" },
  { value: "EM ROTA", label: "Em Rota" },
  { value: "EM ROTA DE TRANSFERENCIA", label: "Em Rota de Transferência" },
  { value: "CHEGADA NA BASE", label: "Chegada na Base" },
  { value: "ENTREGA CONFIRMADA", label: "Entrega Confirmada" },
];


function CicloPedido() {
  const [dados, setDados] = useState([]);
  const [visibilidade, setVisibilidade] = useState({});
  const [etapasPuladas, setEtapasPuladas] = useState(0);
  const [mediaEntregaSemRota, setMediaEntregaSemRota] = useState({ horas: 0, minutos: 0 });
  const [mediaEntregaComRota, setMediaEntregaComRota] = useState({ horas: 0, minutos: 0 });
  const [totalEntregasSemRota, setTotalEntregasSemRota] = useState(0);
  const [filtroTomador, setFiltroTomador] = useState(""); // Estado para filtro por tomador
  const [filtroFilial, setFiltroFilial] = useState("");
  const [filtroPendentes, setFiltroPendentes] = useState("");  // Filtro de pendências
  const [dadosOriginais, setDadosOriginais] = useState([]);



  const [mediaTempos, setMediaTempos] = useState({
    xml: { horas: 0, minutos: 0 },
    separacao: { horas: 0, minutos: 0 },
    entrega: { horas: 0, minutos: 0 },
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        const dataInicial = "16/12/2024";
        const dataInicialISO = new Date(dataInicial.split("/").reverse().join("-")); // Converte para formato ISO
        
        const resposta = await fetchOcorrencias(dataInicial);
        const dadosNormalizados = normalizarDados(resposta);
  
        // Filtra os dados pela data de emissão a partir da dataInicial
        const dadosFiltrados = dadosNormalizados.filter((item) => {
          const dataEmissao = item.dataDocTransporte ? new Date(item.dataDocTransporte) : null;
          return dataEmissao && dataEmissao >= dataInicialISO;
        });
  
        const agrupado = agruparPorCampo(dadosFiltrados, "tomador");
        setDadosOriginais(agrupado);
        setDados(agrupado);
  
        // Chama o recalcularBoxes logo após carregar os dados
        const { totalSemRota, totalComRota, totalSemRomaneio, tempoSemRotaMedia } = recalcularBoxes(agrupado);
  
        setTotalEntregasSemRota(totalSemRomaneio);
        setMediaEntregaSemRota({
          horas: Math.floor(tempoSemRotaMedia / 60) || 0,
          minutos: Math.floor(tempoSemRotaMedia % 60) || 0,
        });
        setMediaEntregaComRota({
          horas: Math.floor(totalComRota / 60) || 0,
          minutos: totalComRota % 60 || 0,
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  
    carregarDados();
  }, []);
  
  
  
  // Novo useEffect para aplicar filtros e recalcular as métricas
  useEffect(() => {
    const dadosFiltrados = aplicarFiltros(dados);
    const { totalSemRota, totalComRota, totalSemRomaneio, tempoSemRotaMedia } = recalcularBoxes(dadosFiltrados);
  
    setTotalEntregasSemRota(totalSemRomaneio);
  
    setMediaEntregaSemRota({
      horas: Math.floor(tempoSemRotaMedia / 60) || 0,
      minutos: Math.floor(tempoSemRotaMedia % 60) || 0,
    });
  
    setMediaEntregaComRota({
      horas: Math.floor(totalComRota / 60) || 0,
      minutos: totalComRota % 60 || 0,
    });
  
    calcularMediaTempos(dadosFiltrados);
  }, [dados, filtroTomador, filtroPendentes]);
  
  
  function toggleVisibilidade(remetente) {
    setVisibilidade((prev) => ({
      ...prev,
      [remetente]: !prev[remetente],
    }));
  }
  
  function normalizarDados(dados) {
    const converterParaISO = (data) => {
      if (!data) return null;
      const match = data.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        const [, dia, mes, ano, hora, minuto, segundo] = match;
        return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}`;
      }
      return null;
    };
  
    return dados.map((item) => ({
      ...item,
      tipo: item.tipo?.trim() || "",
      remetente: item.remetente?.trim() || "",
      destinatario: item.destinatario?.trim() || "",
      responsavel: item.responsavel?.trim() || "",
      tomador: item.tomador?.trim() || "",
      NotaFiscalCadastradaEm: converterParaISO(item.NotaFiscalCadastradaEm),
      dataDocTransporte: converterParaISO(item.dataDocTransporte),
      dataEntrega: converterParaISO(item.dataEntrega),
      data: converterParaISO(item.data),
    }));
  }
  

  const coresRemetente = [ 
    'rgba(0, 0, 0, 0.7)',       // Azul claro
    'rgba(11, 11, 11, 0.5)'       // Azul claro
  ];
  
  
  function agruparPorCampo(dados, campo) {
    if (!dados || !Array.isArray(dados)) return [];
  
    const agrupado = {};
  
    dados.forEach((item) => {
      const chaveAgrupamento = item[campo]?.trim();
      if (!chaveAgrupamento) return;
  
      if (!agrupado[chaveAgrupamento]) agrupado[chaveAgrupamento] = {};
  
      const filial = item.filial || "N/A";
      if (!agrupado[chaveAgrupamento][filial]) {
        agrupado[chaveAgrupamento][filial] = [];
      }
  
      // Verificar se o pedido (nota fiscal) já existe
      const pedidoJaExiste = agrupado[chaveAgrupamento][filial].some(
        (pedido) => pedido.notaFiscal === item.notaFiscal
      );
  
      if (!pedidoJaExiste) {
        const pedido = {
          notaFiscal: item.notaFiscal,
          docTransporte: item.docTransporte,
          filial: filial,
          etapas: [],
        };
  
        // Define quais etapas usar com base na filial
        const etapasSelecionadas = filial === "MTZ" ? etapas : etapasTransferencia;
  
        etapasSelecionadas.forEach((etapa) => {
          let dataEtapa = null;
        
          // Procurar por todas as ocorrências do tipo, mesmo fora de ordem
          if (etapa.tipo === "DATA XML IMPORTADO") {
            dataEtapa = item.NotaFiscalCadastradaEm || null;
          } else if (etapa.tipo === "EMISSAO DE CTE") {
            dataEtapa = item.dataDocTransporte || null;
          } else {
            // Procurar por etapas fora de ordem
            const ocorrencias = dados.filter((d) => d.tipo === etapa.tipo && d.notaFiscal === item.notaFiscal);
            if (ocorrencias.length > 0) {
              dataEtapa = ocorrencias[0].data || null;
            }
          }
        
          pedido.etapas.push({
            tipo: etapa.tipo,
            label: etapa.label,
            icon: etapa.icon,
            data: dataEtapa,
          });
        });
        
  
        agrupado[chaveAgrupamento][filial].push(pedido);
      }
    });
  
    return Object.entries(agrupado).map(([chave, filiaisObj]) => ({
      chave,
      filiais: Object.entries(filiaisObj).map(([filial, pedidos]) => ({
        filial,
        pedidos,
      })),
    }));
  }
  
  

  
  function calcularMediaTempos(dados) {
    let totalXml = 0,
      totalSeparacao = 0,
      totalEntrega = 0,
      totalEntregaComRota = 0,
      totalEntregaSemRota = 0,
      countXml = 0,
      countSeparacao = 0,
      countEntrega = 0,
      countEntregaComRota = 0,
      countEntregaSemRota = 0,
      totalPuladas = 0;
  
    if (!dados || !Array.isArray(dados)) return;
  
    dados.forEach((grupo) => {
      grupo.filiais.forEach((filial) => {
        filial.pedidos.forEach((pedido) => {
          const etapasPedido = pedido.etapas || [];
          const tiposEtapas = etapasPedido.map((e) => e.tipo);
  
          const dataXml = etapasPedido.find((e) => e.tipo === "DATA XML IMPORTADO")?.data;
          const dataCte = etapasPedido.find((e) => e.tipo === "EMISSAO DE CTE")?.data;
          const dataSeparacao = etapasPedido.find((e) => e.tipo === "MERCADORIA SEPARADA/CONFERIDA")?.data;
          const dataEntrega = etapasPedido.find((e) => e.tipo === "ENTREGA CONFIRMADA")?.data;
  
          // Cálculo de XML -> CTE
          if (dataXml && dataCte) {
            const diffXml = calcularDiferenca(dataXml, dataCte);
            if (diffXml) {
              totalXml += diffXml.horas * 60 + diffXml.minutos;
              countXml++;
            }
          }
  
          // Cálculo de CTE -> Separação
          if (dataCte && dataSeparacao) {
            const diffSeparacao = calcularDiferenca(dataCte, dataSeparacao);
            if (diffSeparacao) {
              totalSeparacao += diffSeparacao.horas * 60 + diffSeparacao.minutos;
              countSeparacao++;
            }
          }
  
          // Cálculo Separação -> Entrega
          if (dataEntrega) {
            const etapaInicio = dataSeparacao || dataCte || dataXml;
            if (etapaInicio) {
              const diffEntrega = calcularDiferenca(etapaInicio, dataEntrega);
              if (diffEntrega) {
                totalEntrega += diffEntrega.horas * 60 + diffEntrega.minutos;
                countEntrega++;
  
                if (tiposEtapas.includes("EM ROTA")) {
                  totalEntregaComRota += diffEntrega.horas * 60 + diffEntrega.minutos;
                  countEntregaComRota++;
                } else {
                  totalEntregaSemRota += diffEntrega.horas * 60 + diffEntrega.minutos;
                  countEntregaSemRota++;
                }
              }
            }
          }
  
          // Contar etapas puladas
          etapas.forEach((etapa) => {
            if (!tiposEtapas.includes(etapa.tipo)) {
              totalPuladas++;
            }
          });
        });
      });
    });
  
    // Atualizar estados
    setMediaTempos({
      xml: {
        horas: Math.floor(totalXml / countXml / 60) || 0,
        minutos: Math.floor((totalXml / countXml) % 60) || 0,
      },
      separacao: {
        horas: Math.floor(totalSeparacao / countSeparacao / 60) || 0,
        minutos: Math.floor((totalSeparacao / countSeparacao) % 60) || 0,
      },
      entrega: {
        horas: Math.floor(totalEntrega / countEntrega / 60) || 0,
        minutos: Math.floor((totalEntrega / countEntrega) % 60) || 0,
      },
    });
  
    setMediaEntregaComRota({
      horas: Math.floor(totalEntregaComRota / countEntregaComRota / 60) || 0,
      minutos: Math.floor((totalEntregaComRota / countEntregaComRota) % 60) || 0,
    });
  
    setMediaEntregaSemRota({
      horas: Math.floor(totalEntregaSemRota / countEntregaSemRota / 60) || 0,
      minutos: Math.floor((totalEntregaSemRota / countEntregaSemRota) % 60) || 0,
    });
  
    setTotalEntregasSemRota(countEntregaSemRota);
    setEtapasPuladas(totalPuladas);
  }
  
  function calcularTotalNotas(filiais) {
    let total = 0;
  
    if (Array.isArray(filiais)) {
      filiais.forEach((filial) => {
        if (Array.isArray(filial.pedidos)) {
          total += filial.pedidos.length;
        }
      });
    }
  
    return total;
  }
  
  
  
  
  
  function aplicarFiltros() {
    let dadosFiltrados = [...dadosOriginais];
  
    if (filtroTomador) {
      dadosFiltrados = dadosFiltrados.filter((grupo) => grupo.chave === filtroTomador);
    }
  
    if (filtroFilial) {
      dadosFiltrados = dadosFiltrados.map((grupo) => ({
        ...grupo,
        filiais: grupo.filiais.filter((filial) => filial.filial === filtroFilial),
      }));
    }
  
    if (filtroPendentes) {
      dadosFiltrados = dadosFiltrados.map((grupo) => ({
        ...grupo,
        filiais: grupo.filiais.map((filial) => ({
          ...filial,
          pedidos: filial.pedidos.filter((pedido) => {
            const etapasPedido = pedido.etapas;
    
            for (let i = 0; i < etapasPedido.length; i++) {
              const etapa = etapasPedido[i];
              const etapaFoiPulada = !etapa.data && etapasPedido.slice(i + 1).some((e) => e.data);
    
              // Retorna apenas as etapas sem dados e que não foram puladas
              if (!etapa.data && !etapaFoiPulada && etapa.tipo === filtroPendentes) {
                return true;
              }
            }
    
            return false;
          }),
        })).filter((filial) => filial.pedidos.length > 0),
      })).filter((grupo) => grupo.filiais.length > 0);
    }
    
  
    return dadosFiltrados;
  }
  
  
  
  function calcularDiferenca(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return null;
  
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
  
    // Verifica se as datas são válidas
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      console.warn("Data inválida detectada:", { dataInicio, dataFim });
      return null;
    }
  
    const diffMs = fim - inicio;
    if (diffMs < 0) return null;
  
    const diffMin = Math.floor(diffMs / 60000);
    const horas = Math.floor(diffMin / 60);
    const minutos = diffMin % 60;
  
    return { horas, minutos };
  }
  function recalcularBoxes(dadosFiltrados) {
    let totalSemRota = 0,
      totalComRota = 0,
      totalSemRomaneio = 0,
      tempoSemRotaTotal = 0,
      countSemRota = 0;
  
    dadosFiltrados.forEach((grupo) => {
      grupo.filiais.forEach((filial) => {
        filial.pedidos.forEach((pedido) => {
          const etapas = pedido.etapas;
  
          // Verificar entregas SEM ROMANEIO: "Separação/Conferência" sem dados
          const etapaSeparacao = etapas.find((e) => e.tipo === "MERCADORIA SEPARADA/CONFERIDA" && e.data);
          if (!etapaSeparacao) {
            totalSemRomaneio++;
          }
  
          // Verificar entregas SEM ROTA: "Em Rota" sem dados, mas "Entrega Confirmada" com dados
          const etapaEntregaConfirmada = etapas.find((e) => e.tipo === "ENTREGA CONFIRMADA" && e.data);
          const etapaEmRota = etapas.find((e) => e.tipo === "EM ROTA" && e.data);
  
          if (etapaEntregaConfirmada && !etapaEmRota) {
            totalSemRota++;
            const ultimaEtapaValida = etapas
              .filter((e) => e.data && ["DATA XML IMPORTADO", "EMISSAO DE CTE"].includes(e.tipo))
              .pop();
  
            if (ultimaEtapaValida) {
              const diferenca = calcularDiferenca(ultimaEtapaValida.data, etapaEntregaConfirmada.data);
              if (diferenca) {
                tempoSemRotaTotal += diferenca.horas * 60 + diferenca.minutos;
                countSemRota++;
              }
            }
          }
  
          // Contar entregas COM ROTA
          if (etapaEntregaConfirmada && etapaEmRota) {
            totalComRota++;
          }
        });
      });
    });
  
    return {
      totalSemRota,
      totalComRota,
      totalSemRomaneio,
      tempoSemRotaMedia: countSemRota > 0 ? tempoSemRotaTotal / countSemRota : 0,
    };
  }
  
  
  useEffect(() => {
    const dadosFiltrados = aplicarFiltros();
    setDados(dadosFiltrados);
  }, [filtroTomador, filtroFilial, filtroPendentes]);
  
  
  
  const coresFilial = [
    '#202722',     // Laranja claro
  ];
  

  return (
    <ContainerGeral>
      <h1>Ciclo do Pedido</h1>
      <Row style={{ marginBottom: "20px", width:'100%' }}>
        <Col md="4">
          <label>Filtrar por Tomador:</label>
          <StyledSelect
            options={[
              { value: "", label: "Todos" },
              ...dados.map((grupo) => ({
                value: grupo.chave,
                label: grupo.chave,
              })),
            ]}
            placeholder="Selecione um Tomador"
            onChange={(selectedOption) => setFiltroTomador(selectedOption?.value || "")}
            isClearable
          />
        </Col>

        <Col md="4">
          <label>Filtrar por Filial:</label>
          <StyledSelect
            options={[
              { value: "", label: "Todas" },
              ...Array.from(
                new Set(dados.flatMap((grupo) => grupo.filiais.map((filial) => filial.filial)))
              ).map((filial) => ({ value: filial, label: filial }))
            ]}
            placeholder="Selecione uma Filial"
            onChange={(selectedOption) => setFiltroFilial(selectedOption?.value || "")}
            isClearable
          />
        </Col>

        <Col md="4">
          <label>Filtrar por Próxima Etapa Pendente:</label>
          <StyledSelect
            options={etapasPendentesOptions}
            onChange={(selectedOption) => setFiltroPendentes(selectedOption?.value || "")}
            isClearable
            placeholder="Selecione por pendencia"
          />
        </Col>
      </Row>
      <Row style={{ width: "100%", marginBottom: "10px" }}>
        <Col md="4">
          <Box style={{ background: "rgba(255, 215, 0, 0.35)" }}>
            <h5>Média geral Emissão de CTE</h5>
            <FaFileAlt style={{ fontSize: 30 }} />
            <h2>
            {formatarHorasMinutos(mediaTempos.xml.horas, mediaTempos.xml.minutos)}
            </h2>
          </Box>
        </Col>
        <Col md="4">
          <Box style={{ background: "rgba(255, 165, 0, 0.35)" }}>
            <h5>Média geral Separação/Conferência</h5>
            <FaBoxOpen style={{ fontSize: 30 }} />
            <h2>
            {formatarHorasMinutos(mediaTempos.separacao.horas, mediaTempos.separacao.minutos)}
            </h2>
          </Box>
        </Col>
        <Col md="4">
          <Box style={{ background: "rgba(0, 255, 127, 0.35)" }}>
            <h5>Média geral Entrega</h5>
            <FaTruck style={{ fontSize: 30 }} />
            <h2>
            {formatarHorasMinutos(mediaTempos.entrega.horas, mediaTempos.entrega.minutos)}
            </h2>
          </Box>
        </Col>
          {/* <Col md="4">
  <Box style={{ background: "rgba(255, 0, 0, 0.35)" }}>
    <h5>Total de Etapas Puladas</h5>
    <FaTruck style={{ fontSize: 30 }} />
    <h2>{etapasPuladas}</h2>
  </Box>
</Col> */}
{/* <Col md="4">
  <Box style={{ background: "rgba(135, 206, 250, 0.35)" }}>
    <h5>Média Entrega Sem Rota</h5>
    <FaTruck style={{ fontSize: 30 }} />
    <h2>
      {formatarHorasMinutos(mediaEntregaSemRota.horas, mediaEntregaSemRota.minutos)}
    </h2>
  </Box>
</Col> */}
{/* 
<Col md="4">
  <Box style={{ background: "rgba(0, 191, 255, 0.35)" }}> 
    <h5>Média Entrega Com Rota</h5>
    <FaTruck style={{ fontSize: 30 }} />
    <h2>
      {formatarHorasMinutos(mediaEntregaComRota.horas, mediaEntregaComRota.minutos)}
    </h2>
  </Box>
</Col>



<Col md="4">
  <Box style={{ background: "rgba(255, 0, 0, 0.35)" }}>
    <h5>Entregas realizadas sem Romaneio</h5>
    <FaCheckCircle style={{ fontSize: 30 }} />
    <h2>{totalEntregasSemRota}</h2>
  </Box>
</Col> */}

      </Row>
     




{aplicarFiltros(dados).map((grupo, idx) => {
  const corRemetente = coresRemetente[idx % coresRemetente.length];

  return (
    <Row style={{ width: "100%" }} key={idx}>
      <Col md="12">
        <Card style={{ backgroundColor: corRemetente }}>
          <Header onClick={() => toggleVisibilidade(grupo.chave)} style={{ cursor: "pointer" }}>
            <h5>
              {grupo.chave} ({calcularTotalNotas(grupo.filiais)} nota
              {calcularTotalNotas(grupo.filiais) > 1 ? "s" : ""})
            </h5>
            {visibilidade[grupo.chave] ? <FaChevronUp /> : <FaChevronDown />}
          </Header>

          {visibilidade[grupo.chave] &&
            grupo.filiais.map((filialGrupo, filialIdx) => (
              <div
                key={filialIdx}
                style={{
                  marginTop: "20px",
                  padding: "10px",
                  borderRadius: "15px",
                  backgroundColor: coresFilial[filialIdx % coresFilial.length],
                }}
              >
                <h3>Filial: {filialGrupo.filial}</h3>
                {filialGrupo.pedidos.map((pedido, pedidoIdx) => (
                  <div key={pedidoIdx} style={{ marginBottom: "20px" }}>
                    <h6>Nota(s) Fiscal(is): {pedido.notaFiscal}</h6>
                    <Etapas>
                      {pedido.etapas.map((etapa, etapaIdx) => {
                        const etapaConcluida = !!etapa.data;
                        const etapaFoiPulada = !etapaConcluida && pedido.etapas.slice(etapaIdx + 1).some((e) => e.data);

                        return (
                          <Etapa key={etapaIdx}>
                            <Linha
                              cor={
                                etapaConcluida
                                  ? "#28a745"
                                  : etapaFoiPulada
                                  ? "#dc3545"
                                  : "#ccc"
                              }
                              isLast={etapaIdx === pedido.etapas.length - 1}
                            />
                            <IconWrapper $concluido={etapaConcluida} $erro={etapaFoiPulada}>
                              {etapa.icon}
                            </IconWrapper>
                            <div>
                              <p>{etapa.label}</p>
                              <small>
                                {etapaConcluida
                                  ? formatarData(etapa.data)
                                  : etapaFoiPulada
                                  ? "Etapa pulada"
                                  : "Aguardando dados"}
                              </small>
                            </div>
                          </Etapa>
                        );
                      })}
                    </Etapas>
                  </div>
                ))}
              </div>
            ))}
        </Card>
      </Col>
    </Row>
  );
})}




    </ContainerGeral>
  );
}

export default CicloPedido;
