import React from 'react';
import { Card, CardBody, Row, Col, Table, Badge } from 'reactstrap';
import { fluxosPorTpVg } from '../../../utils/fluxos';
import { FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa';
import { getEtapasComStatus } from '../../../utils/exporter';

const cores = {
  verde: 'success',
  vermelha: 'danger',
  branca: 'secondary',
};

const gruposTiposViagem = {
  'ETPF / FRA': ['ETPF', 'FRA'],
  TRFBAS: ['TRFBAS'],
  TRFFIL: ['TRFFIL'],
};

const MedidorProdutividade = ({ notas = [], ocorrenciasPorNota = [] }) => {
  const contarEtapasPorStatus = (tiposViagem) => {
    const etapas = fluxosPorTpVg[tiposViagem[0]] || fluxosPorTpVg.ETPF;
    const contagem = {};

    etapas.forEach((etapa) => {
      contagem[etapa] = { verde: 0, vermelha: 0, branca: 0 };
    });

    notas.forEach((nf) => {
      const ocorrencia = ocorrenciasPorNota.find((o) => String(o.NF) === String(nf));
      if (!ocorrencia) return;

      const tipoViagem = String(ocorrencia.TpVg || "ETPF").toUpperCase();
      if (!tiposViagem.includes(tipoViagem)) return;

      // Usando a função existente para obter etapas com status
      const etapasComStatus = getEtapasComStatus(ocorrencia, tipoViagem);

      etapasComStatus.forEach((etapa) => {
        if (etapa.status && contagem[etapa.nome]?.[etapa.status] !== undefined) {
          contagem[etapa.nome][etapa.status]++;
        }
      });
    });

    return contagem;
  };

  const calcularLeadTime = (tiposViagem) => {
    const fluxo = fluxosPorTpVg[tiposViagem[0]] || fluxosPorTpVg.ETPF;
    const leadTimes = {};

    fluxo.forEach((_, idx) => {
      if (idx < fluxo.length - 1) {
        const de = fluxo[idx];
        const para = fluxo[idx + 1];
        const chave = `${de} → ${para}`;

        let totalMin = 0;
        let qtd = 0;

        notas.forEach((nf) => {
          const nota = ocorrenciasPorNota.find((o) => String(o.NF) === String(nf));
          if (!nota?.Ocorren || !nota?.TpVg) return;

          const tipoViagem = String(nota.TpVg).toUpperCase();
          if (!tiposViagem.includes(tipoViagem)) return;

          const data1 = nota.Ocorren.find((o) => o.tipo === de)?.data;
          const data2 = nota.Ocorren.find((o) => o.tipo === para)?.data;

          if (data1 && data2) {
            const d1 = new Date(data1);
            const d2 = new Date(data2);
            const diff = (d2 - d1) / 60000;
            if (diff > 0) {
              totalMin += diff;
              qtd++;
            }
          }
        });

        if (qtd > 0) {
          const media = Math.round(totalMin / qtd);
          const h = String(Math.floor(media / 60)).padStart(2, '0');
          const m = String(media % 60).padStart(2, '0');
          leadTimes[chave] = `${h}:${m}`;
        } else {
          leadTimes[chave] = '--:--';
        }
      }
    });

    return leadTimes;
  };

  const renderEtapas = (labelGrupo, tiposViagem) => {
    const contagem = contarEtapasPorStatus(tiposViagem);
    const leadTimes = calcularLeadTime(tiposViagem);

    return (
      <Card className="mb-4 shadow-sm border-0">
        <CardBody>
          <h5 className="mb-3">
            Tipo de Viagem: <Badge color="primary">{labelGrupo}</Badge>
          </h5>
          <Table dark bordered responsive size="sm" className="mb-0">
            <thead>
              <tr className="text-center">
                <th>Etapa</th>
                <th><FaCheck /> Concluídas</th>
                <th><FaTimes /> Anuladas</th>
                <th><FaHourglassHalf /> Pendentes</th>
                <th>Lead Time para próxima</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(contagem).map(([etapa, status], idx, arr) => (
                <tr key={etapa}>
                  <td>{etapa}</td>
                  <td className="text-center">
                    <Badge color={cores.verde}>{status.verde}</Badge>
                  </td>
                  <td className="text-center">
                    <Badge color={cores.vermelha}>{status.vermelha}</Badge>
                  </td>
                  <td className="text-center">
                    <Badge color={cores.branca}>{status.branca}</Badge>
                  </td>
                  <td className="text-center">
                    {leadTimes[`${etapa} → ${arr[idx + 1]?.[0]}`] || '--:--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="p-3">
      <Row>
        {Object.entries(gruposTiposViagem).map(([label, tipos], idx) => (
          <Col md={6} key={label}>
            {renderEtapas(label, tipos)}
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MedidorProdutividade;