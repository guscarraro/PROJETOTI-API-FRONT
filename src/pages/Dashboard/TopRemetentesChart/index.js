import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { toast } from 'react-toastify';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(0, 0, 0, 0.8)', padding: '10px', borderRadius: '5px', color: '#fff' }}>
        <p>{`Notas: ${payload[0].value}`}</p>
        <p style={{ fontSize: '12px', fontStyle: 'italic' }}>CLIQUE PARA VER MAIS</p>
      </div>
    );
  }
  return null;
};

const TopRemetentesChart = ({ data }) => {
  const [topRemetentes, setTopRemetentes] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  const processTopRemetentes = () => {
    const overdueNotes = data.filter((item) => {
      const entregaDate = parseDate(item.entregue_em);
      const previsaoDate = parseDate(item.previsao_entrega);
      return (
        item.cte_entregue === 1 &&
        entregaDate &&
        previsaoDate &&
        entregaDate > previsaoDate &&
        item.atraso_cliente === 0 // Verifica se o atraso não é culpa do cliente
      );
    });
  
    const remetenteCount = {};
    const remetenteDetails = {};
  
    overdueNotes.forEach((item) => {
      const remetente = item.remetente;
  
      // Dividir o campo NF em notas individuais
      const notas = item.NF ? item.NF.split(",").map((nf) => nf.trim()) : [];
  
      if (!remetenteCount[remetente]) {
        remetenteCount[remetente] = 0;
        remetenteDetails[remetente] = [];
      }
  
      // Incrementar o contador e armazenar detalhes para cada nota
      notas.forEach((nota) => {
        remetenteCount[remetente] += 1;
        remetenteDetails[remetente].push({
          NF: nota,
          destinatario: item.destinatario,
          entregue_em: item.entregue_em,
          previsao_entrega: item.previsao_entrega,
        });
      });
    });
  
    const sortedRemetentes = Object.entries(remetenteCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([remetente, count]) => ({
        remetente,
        count,
        details: remetenteDetails[remetente],
      }));
  
    setTopRemetentes(sortedRemetentes);
  };
  

  const toggleModal = (remetenteData) => {
    setModalData(remetenteData);
    setIsModalOpen(!isModalOpen);
  };

  const copyTableToClipboard = () => {
    if (!modalData) return;

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

    const tableFooter = `</tbody></table>`;

    const fullTable = `
      <h3>${modalData.remetente}</h3>
      ${tableHeader}
      ${tableBody}
      ${tableFooter}
    `;

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
      });
    } catch (err) {
      toast.error('Erro ao copiar a tabela.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }

    document.body.removeChild(tempDiv);
  };
  const colors = [
    '#FF4500', // Laranja bem escuro
    '#FF5400', // Laranja intenso
    '#FF6500', // Laranja intermediário
    '#FF7500', // Laranja médio
    '#FF8500', // Laranja um pouco mais claro
    '#FF9400', // Laranja claro médio
    '#FF9900', // Laranja claro médio
  ];
  
  
  
  
  const getBarColor = (index) => {
    return colors[index % colors.length]; // Retorna uma cor com base no índice
  };

  useEffect(() => {
    if (data.length > 0) {
      processTopRemetentes();
    }
  }, [data]);

  return (
    <>
      <h5>Top 7 Clientes com maior atraso</h5>
      <ResponsiveContainer width="100%" height={350}>
      <BarChart
  data={topRemetentes}
  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
  onClick={(e) => {
    if (e && e.activePayload && e.activePayload.length) {
      const remetenteData = e.activePayload[0].payload;
      toggleModal(remetenteData);
    }
  }}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis
    dataKey="remetente"
    interval={0}
    style={{ fontSize: 16 }}
    tick={{
      fill: '#fff',
      dy: (tick, index) => (index % 2 === 0 ? 0 : 15), // Adiciona margem para itens ímpares
    }}
    tickFormatter={(tick, index) => {
      const maxLength = 15; // Define o tamanho máximo do nome
      return tick.length > maxLength ? `${tick.substring(0, maxLength)}...` : tick;
    }}
  />
  <YAxis style={{ fontSize: 16, fill: '#fff' }} />
  <Tooltip content={<CustomTooltip />} />
  <Bar
  dataKey="count"
  label={{
    position: 'insideTop',
    fill: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  }}
  shape={(props) => {
    const { x, y, width, height, index } = props;
    const color = getBarColor(index);
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="#000"
        strokeWidth={1}
      />
    );
  }}
/>


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
            <p>Total de Notas: {modalData.count}</p>
            <p>Notas em Atraso:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Número da Nota</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Destinatário</th>
                </tr>
              </thead>
              <tbody>
                {modalData.details.map((item, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.NF}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.destinatario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default TopRemetentesChart;
