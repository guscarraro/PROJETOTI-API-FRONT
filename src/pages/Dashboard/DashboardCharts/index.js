import React, { useMemo } from 'react';
import { Row, Col } from 'reactstrap';
import { Box } from '../styles';
import ServiceLevelChart from '../ServiceLevelChart';
import DailyDeliveryChart from '../DailyDeliveryChart';
import PendenciaChart from '../PendenciaChart';
import TopRemetentesChart from '../TopRemetentesChart';
import MedidorProdutividade from '../MedidorLeadTime';

const DashboardCharts = ({
  filteredData,
  ocorrenciasPorNota,
  groupedDataByStatus,          // mantido se precisar depois
  calculateTotalNotesByStatus,  // mantido se precisar depois
  selectedTipoNota,
  dataInicial,
  dataFinal
}) => {
  // extrai NFs de um item (array `notas` OU string `NF` com vírgulas)
  const getNfsFromItem = (item) => {
    if (!item) return [];
    if (Array.isArray(item?.notas) && item.notas.length) {
      return item.notas.map((n) => String(n).trim()).filter(Boolean);
    }
    const raw = String(item?.NF || '').trim();
    if (!raw) return [];
    return raw.split(',').map((n) => n.trim()).filter(Boolean);
  };

  // verifica se UMA NF específica é agendada olhando o array ocorrenciasPorNota
  const isNFNumberAgendada = (nf) => {
    if (!nf) return false;
    if (!Array.isArray(ocorrenciasPorNota)) return false;

    const info = ocorrenciasPorNota.find((o) => {
      const nfsDoRegistro = String(o?.NF || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      return nfsDoRegistro.includes(String(nf).trim());
    });

    const ocorrs = info?.Ocorren;
    const temEntregaAgendada =
      Array.isArray(ocorrs) &&
      ocorrs.some((oc) =>
        /ENTREGA\s+AGENDADA/i.test(
          String(oc?.tipo || oc?.ocorrencia || oc?.descricao || '')
        )
      );

    return !!temEntregaAgendada;
  };

  // um item é "agendado" se: flag no próprio item OU qualquer NF dele é agendada
  const isItemAgendada = (item) => {
    const flagAgendado =
      item?.agendado === true ||
      /\(AGENDADO\)/i.test(String(item?.statusViagem || ''));

    if (flagAgendado) return true;

    const nfs = getNfsFromItem(item);
    if (!nfs.length) return false;

    return nfs.some(isNFNumberAgendada);
  };

  const matchesTipoNota = (item) => {
    if (!selectedTipoNota || selectedTipoNota === 'todas') return true;
    if (selectedTipoNota === 'agendadas') return isItemAgendada(item);
    if (selectedTipoNota === 'normais') return !isItemAgendada(item);
    return true;
  };

  // base FILTRADA para os gráficos
  const dataForCharts = useMemo(() => {
    if (!Array.isArray(filteredData)) return [];
    return filteredData.filter(matchesTipoNota);
  }, [filteredData, selectedTipoNota, ocorrenciasPorNota]);

  return (
    <Row>
      <Col md="12">
        <Box>
          <ServiceLevelChart data={dataForCharts} />
        </Box>
      </Col>

      <Col md="12">
        <Box>
          <TopRemetentesChart data={dataForCharts} />
        </Box>
      </Col>

      <Col md="12">
        <Box>
          <DailyDeliveryChart
            data={dataForCharts}
            dataInicial={dataInicial}
            dataFinal={dataFinal}
          />
        </Box>
      </Col>

      {/* Exemplo já usando a base filtrada:
      <Col md="12">
        <Box>
          <MedidorProdutividade
            notas={dataForCharts.flatMap(item => getNfsFromItem(item))}
            ocorrenciasPorNota={ocorrenciasPorNota}
          />
        </Box>
      </Col>
      */}
    </Row>
  );
};

export default DashboardCharts;
