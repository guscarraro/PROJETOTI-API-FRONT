import React from 'react';
import { Card, CardBody, Row, Table, Badge } from 'reactstrap';
import { FaClock, FaRoad, FaTruck, FaFileAlt, FaBoxes } from 'react-icons/fa';

const fluxosPorTpVg = {
  ETPF: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO",
    "VIAGEM CRIADA",
    "EM ROTA",
    "CHEGADA NO LOCAL",
    "INICIO DE DESCARGA",
    "FIM DE DESCARGA",
  ],
  TRFBAS: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA",
    "VIAGEM CRIADA",
    "EM ROTA DE TRANSFERENCIA",
    "CHEGADA NA BASE",
    "EM ROTA",
    "CHEGADA NO LOCAL",
    "INICIO DE DESCARGA",
    "FIM DE DESCARGA",
  ],
  TRFFIL: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA",
    "VIAGEM CRIADA",
    "EM ROTA DE TRANSFERENCIA",
    "CHEGADA NA FILIAL",
    "MERCADORIA RECEBIDA NA FILIAL",
    "EM ROTA",
    "CHEGADA NO LOCAL",
    "INICIO DE DESCARGA",
    "FIM DE DESCARGA",
  ],
  FRA: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO",
    "VIAGEM CRIADA",
    "EM ROTA",
  ],
};

const icones = {
  "ENTRADA DE XML NO SISTEMA": <FaFileAlt size={16} />,
  "DOCUMENTO EMITIDO": <FaFileAlt size={16} />,
  "MERCADORIA SEPARADA/CONFERIDA": <FaBoxes size={16} />,
  "AGUARDANDO ROTERIZACAO": <FaClock size={16} />,
  "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA": <FaClock size={16} />,
  "VIAGEM CRIADA": <FaTruck size={16} />,
  "EM ROTA": <FaRoad size={16} />,
  "EM ROTA DE TRANSFERENCIA": <FaRoad size={16} />,
  "CHEGADA NO LOCAL": <FaTruck size={16} />,
  "CHEGADA NA BASE": <FaTruck size={16} />,
  "CHEGADA NA FILIAL": <FaTruck size={16} />,
  "MERCADORIA RECEBIDA NA FILIAL": <FaBoxes size={16} />,
  "INICIO DE DESCARGA": <FaBoxes size={16} />,
  "FIM DE DESCARGA": <FaBoxes size={16} />,
};

const MedidorLeadTime = ({ notas, ocorrenciasPorNota }) => {
  const calcularLeadTimePorNota = (nota) => {
    const infoNota = ocorrenciasPorNota.find((o) => String(o.NF) === String(nota));
    if (!infoNota || !infoNota.Ocorren) return [];

    const fluxo = fluxosPorTpVg[infoNota.TpVg] || fluxosPorTpVg['ETPF'];
    const ocorrencias = infoNota.Ocorren;

    const mapOcorrencias = ocorrencias.reduce((map, oc) => {
      map[oc.tipo.toUpperCase()] = new Date(oc.data);
      return map;
    }, {});

    const leadTimes = [];

    for (let i = 0; i < fluxo.length - 1; i++) {
      const etapa1 = fluxo[i].toUpperCase();
      const etapa2 = fluxo[i + 1].toUpperCase();

      const data1 = mapOcorrencias[etapa1];
      const data2 = mapOcorrencias[etapa2];

      if (data1 && data2) {
        const diffMin = Math.round((data2 - data1) / 60000);
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        leadTimes.push({
          tipoViagem: infoNota.TpVg || 'ETPF',
          transicao: `${etapa1} → ${etapa2}`,
          tempo: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          diffMin,
          etapa1,
          etapa2,
        });
      }
    }

    return leadTimes;
  };

  const calcularMediaLeadTimePorTransicao = () => {
    const temposPorTipo = {};

    notas.forEach((nf) => {
      const leadTimes = calcularLeadTimePorNota(nf);
      leadTimes.forEach(({ tipoViagem, transicao, diffMin }) => {
        if (!temposPorTipo[tipoViagem]) temposPorTipo[tipoViagem] = {};
        if (!temposPorTipo[tipoViagem][transicao]) temposPorTipo[tipoViagem][transicao] = [];
        temposPorTipo[tipoViagem][transicao].push(diffMin);
      });
    });

    const mediasFormatadas = {};

    for (const tipo in temposPorTipo) {
      mediasFormatadas[tipo] = {};
      for (const transicao in temposPorTipo[tipo]) {
        const tempos = temposPorTipo[tipo][transicao];
        const mediaMin = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
        const h = Math.floor(mediaMin / 60).toString().padStart(2, '0');
        const m = (mediaMin % 60).toString().padStart(2, '0');
        mediasFormatadas[tipo][transicao] = `${h}:${m}`;
      }
    }

    return mediasFormatadas;
  };

  const medias = calcularMediaLeadTimePorTransicao();

  const renderTabelaEtapas = (tipo) => {
    const etapas = fluxosPorTpVg[tipo];
    const mediasTipo = medias[tipo] || {};

    return (
      <Card style={{ backgroundColor: '#1e1e1e', color: '#fff', marginBottom: 20 }}>
        <CardBody>
          <h5 style={{ marginBottom: 16, borderBottom: '1px solid #444', paddingBottom: 6 }}>
            Lead Time por Etapa — <Badge color="info">{tipo}</Badge>
          </h5>
          <Table responsive hover bordered size="sm" style={{ backgroundColor: '#2b2b2b', color: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#333', color: '#ccc' }}>
                <th>De</th>
                <th>Para</th>
                <th>Tempo Médio</th>
              </tr>
            </thead>
            <tbody>
              {etapas.slice(0, -1).map((etapa, idx) => {
                const destino = etapas[idx + 1];
                const desc = `${etapa.toUpperCase()} → ${destino.toUpperCase()}`;
                const tempo = mediasTipo[desc] || '--:--';
                return (
                  <tr key={desc}>
                    <td>{icones[etapa]} <span style={{ marginLeft: 8 }}>{etapa}</span></td>
                    <td>{icones[destino]} <span style={{ marginLeft: 8 }}>{destino}</span></td>
                    <td><Badge color="success" pill>{tempo}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    );
  };

  return (
    <div style={{ padding: '0 16px' }}>
      {Object.keys(fluxosPorTpVg).map((tipo) => renderTabelaEtapas(tipo))}
    </div>
  );
};

export default MedidorLeadTime;
