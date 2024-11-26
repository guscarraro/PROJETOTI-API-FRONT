import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(0, 0, 0, 0.8)', padding: '10px', borderRadius: '5px', color: '#fff' }}>
        <p>{`Notas: ${payload[0].value}`}</p>
        <p style={{ fontSize: '12px', fontStyle: 'italic' }}>CLIQUE AQUI E SAIBA MAIS</p>
      </div>
    );
  }
  return null;
};

const TopRemetentesChart = ({ data, selectedAtendente, filterDataByAtendente }) => {
  const [topRemetentes, setTopRemetentes] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const processTopRemetentes = (filteredData) => {
    const overdueNotes = filteredData.filter((item) => {
      const entregaDate = parseDate(item.entregue_em);
      const previsaoDate = parseDate(item.previsao_entrega);
      return (
        item.cte_entregue === 1 && 
        entregaDate && previsaoDate && 
        entregaDate > previsaoDate 
      );
    });

    const remetenteCount = {};
    const remetenteDetails = {};

    overdueNotes.forEach((item) => {
      const remetente = item.remetente;
      if (!remetenteCount[remetente]) {
        remetenteCount[remetente] = 0;
        remetenteDetails[remetente] = [];
      }
      remetenteCount[remetente] += 1;

      remetenteDetails[remetente].push({
        NF: item.NF,
        destinatario: item.destinatario,
        entregue_em: item.entregue_em,
        previsao_entrega: item.previsao_entrega,
      });
    });

    const sortedRemetentes = Object.entries(remetenteCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([name, count]) => ({
        remetente: name,
        notas: count,
        details: remetenteDetails[name],
      }));

    setTopRemetentes(sortedRemetentes);
  };

  const calculateDelayDays = (entregueEm, previsaoEntrega) => {
    const entregaDate = parseDate(entregueEm);
    const previsaoDate = parseDate(previsaoEntrega);
    if (entregaDate && previsaoDate && entregaDate > previsaoDate) {
      const diffTime = Math.abs(entregaDate - previsaoDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    }
    return 0; 
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  const toggleModal = (remetenteData) => {
    setModalData(remetenteData);
    setIsModalOpen(!isModalOpen);
  };

  const copyTableToClipboard = () => {
    if (!modalData) return;
  
    // Criação da tabela em formato HTML
    const tableHeader = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left;">Número da Nota</th>
            <th style="padding: 8px; text-align: left;">Destinatário</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    const tableBody = modalData.details
      .map(
        (item) => `
          <tr>
            <td style="padding: 8px;">${item.NF}</td>
            <td style="padding: 8px;">${item.destinatario}</td>
          </tr>
        `
      )
      .join('');
  
    const tableFooter = `
        </tbody>
      </table>
    `;
  
    const fullTable = `
      <h3>${modalData.remetente}</h3>
      ${tableHeader}
      ${tableBody}
      ${tableFooter}
    `;
  
    // Criar um elemento temporário para copiar o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullTable;
    document.body.appendChild(tempDiv);
  
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
  
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  
    try {
      document.execCommand('copy');
      toast.success('Tabela copiada com sucesso!', {
        position: 'top-right',
        autoClose: 3000,
        zIndex: 1000,
      });
    } catch (err) {
      toast.error('Erro ao copiar a tabela.', {
        position: 'top-right',
        autoClose: 3000,
        zIndex: 1000,
      });
    }
  
    // Remover o elemento temporário
    document.body.removeChild(tempDiv);
  };
  
  
  
  

  useEffect(() => {
    const filteredData = filterDataByAtendente(data);
    if (filteredData.length > 0) {
      processTopRemetentes(filteredData);
    }
  }, [data, selectedAtendente]);

  return (
    <>
      <h5>Top 7 Clientes com maior atraso</h5>
      <ResponsiveContainer width="100%" height={330}>
        <BarChart
          data={topRemetentes}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onClick={(e) => {
            if (e && e.activePayload && e.activePayload.length) {
              const remetenteData = e.activePayload[0].payload;
              toggleModal(remetenteData);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="remetente" interval={0} style={{ fontSize: 13 }} tick={{ fill: '#fff' }} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="notas" fill="#FF4500" />
        </BarChart>
      </ResponsiveContainer>

      {modalData && (
        <Modal isOpen={isModalOpen} toggle={() => toggleModal(null)} style={{ height: '420px' }}>
          <ModalHeader toggle={() => toggleModal(null)}>
            Detalhes do Remetente: {modalData.remetente}
          </ModalHeader>
          <ModalBody style={{ height: '65vh', overflow: 'overlay' }}>
            <Button color="primary" style={{ marginBottom: '10px' }} onClick={copyTableToClipboard}>
              Copiar Tabela
            </Button>
            <p>Total de Notas: {modalData.notas}</p>
            <p>Notas em Atraso:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Número da Nota</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Destinatário</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Dias de Atraso</th>
                </tr>
              </thead>
              <tbody>
                {modalData.details
                  .slice()
                  .sort((a, b) => a.destinatario.localeCompare(b.destinatario))
                  .map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.NF}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.destinatario}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        {calculateDelayDays(item.entregue_em, item.previsao_entrega)} dias
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ModalBody>
        </Modal>
      )}

      <ToastContainer />
    </>
  );
};

export default TopRemetentesChart;
