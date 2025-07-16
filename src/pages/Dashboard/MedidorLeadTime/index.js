import React from 'react';
import { Card, CardBody, CardTitle, Row, Table } from 'reactstrap';
import { FaClock, FaRoad, FaTruck, FaFileAlt, FaBoxes } from 'react-icons/fa';

const fluxosPorTpVg = {
  ETPFRA: [
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
  TRANS: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
    "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA",
    "VIAGEM CRIADA",
    "EM ROTA DE TRANSFERENCIA",
    "CHEGADA NA BASE/FILIAL",
    "EM ROTA",
    "CHEGADA NO LOCAL",
    "INICIO DE DESCARGA",
    "FIM DE DESCARGA",
  ],
  FRA: [
    "ENTRADA DE XML NO SISTEMA",
    "DOCUMENTO EMITIDO",
    "MERCADORIA SEPARADA/CONFERIDA",
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
  "CHEGADA NA BASE/FILIAL": <FaTruck size={16} />, 
  "INICIO DE DESCARGA": <FaBoxes size={16} />, 
  "FIM DE DESCARGA": <FaBoxes size={16} />, 
};

const mediasFalsas = {
  "ENTRADA DE XML NO SISTEMA → DOCUMENTO EMITIDO": "00:15",
  "DOCUMENTO EMITIDO → MERCADORIA SEPARADA/CONFERIDA": "01:10",
  "MERCADORIA SEPARADA/CONFERIDA → AGUARDANDO ROTERIZACAO": "00:45",
  "AGUARDANDO ROTERIZACAO → VIAGEM CRIADA": "02:00",
  "VIAGEM CRIADA → EM ROTA": "00:30",
  "EM ROTA → CHEGADA NO LOCAL": "05:20",
  "CHEGADA NO LOCAL → INICIO DE DESCARGA": "00:20",
  "INICIO DE DESCARGA → FIM DE DESCARGA": "00:50",
  "AGUARDANDO ROTERIZACAO DE TRANSFERENCIA → VIAGEM CRIADA": "01:20",
  "VIAGEM CRIADA → EM ROTA DE TRANSFERENCIA": "04:30",
  "EM ROTA DE TRANSFERENCIA → CHEGADA NA BASE/FILIAL": "02:40",
  "CHEGADA NA BASE/FILIAL → EM ROTA": "01:15",
  "MERCADORIA SEPARADA/CONFERIDA → EM ROTA": "02:00",
};

const MedidorLeadTime = () => {
  const renderResumoGeral = () => (
    <Card style={{ backgroundColor: '#212121', color: '#fff', padding: 16, marginBottom: 20 }}>
      <h5 style={{ marginBottom: 10 }}>Resumo Geral</h5>
      <Row>
        <div style={{ fontWeight: 600, fontSize: 16, padding: '0 16px' }}>Média Geral: 03:42</div>
        <div style={{ padding: '0 16px' }}>ETPFRA: 03:30</div>
        <div style={{ padding: '0 16px' }}>TRANS: 04:20</div>
        <div style={{ padding: '0 16px' }}>FRA: 02:50</div>
      </Row>
    </Card>
  );

  const renderTabelaEtapas = (tipo) => {
    const etapas = fluxosPorTpVg[tipo];
    return (
      <div style={{ marginBottom: 32 }}>
        <h6 style={{ color: '#888', marginBottom: 8 }}>Lead Time por etapa: {tipo}</h6>
        <Table responsive bordered size="sm">
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th>Etapa</th>
              <th>Destino</th>
              <th>Tempo Médio</th>
            </tr>
          </thead>
          <tbody>
            {etapas.slice(0, -1).map((etapa, idx) => {
              const destino = etapas[idx + 1];
              const desc = `${etapa} → ${destino}`;
              const tempo = mediasFalsas[desc] || '--:--';
              return (
                <tr key={desc}>
                  <td>{icones[etapa]} {etapa}</td>
                  <td>{icones[destino]} {destino}</td>
                  <td style={{ fontWeight: 'bold' }}>{tempo}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      {renderResumoGeral()}
      {Object.keys(fluxosPorTpVg).map((tipo) => renderTabelaEtapas(tipo))}
    </div>
  );
};

export default MedidorLeadTime;
