import React from 'react';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';
import { FaLaptop, FaDesktop, FaNetworkWired, FaWifi, FaMobileAlt, FaBox } from 'react-icons/fa';

const ModalAparelho = ({ isOpen, toggle, equipamentos }) => {
  // Mapeamento dos ícones por tipo de aparelho
  const iconePorTipo = {
    Notebook: <FaLaptop size={30} />,
    Desktop: <FaDesktop size={30} />,
    Switch: <FaNetworkWired size={30} />,
    Roteador: <FaWifi size={30} />,
    Celular: <FaMobileAlt size={30} />,
  };

  // Agrupar os tipos de aparelhos por setor
  const agrupados = {};
  
  equipamentos.forEach(({ setor, tipo_aparelho }) => {
    if (!agrupados[setor]) {
      agrupados[setor] = {};
    }
    if (!agrupados[setor][tipo_aparelho]) {
      agrupados[setor][tipo_aparelho] = 1;
    } else {
      agrupados[setor][tipo_aparelho]++;
    }
  });

  // Contagem total de cada tipo de aparelho
  const totalPorTipo = {};
  Object.values(agrupados).forEach((setor) => {
    Object.entries(setor).forEach(([tipo, quantidade]) => {
      if (!totalPorTipo[tipo]) {
        totalPorTipo[tipo] = quantidade;
      } else {
        totalPorTipo[tipo] += quantidade;
      }
    });
  });

  // Converter para um array para exibição na tabela
  const dadosTabela = [];
  Object.entries(agrupados).forEach(([setor, aparelhos]) => {
    Object.entries(aparelhos).forEach(([tipo, quantidade]) => {
      dadosTabela.push({ setor, tipo, quantidade });
    });
  });

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Quantidade de Aparelhos por Setor</ModalHeader>
      <ModalBody>

        {/* Linha de Ícones com Contadores */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {Object.entries(totalPorTipo).map(([tipo, quantidade]) => (
            <div key={tipo} style={{ textAlign: 'center' }}>
              {iconePorTipo[tipo] || <FaBox size={30} />} {/* Ícone padrão se não houver */}
              {/* Ícone padrão se não houver */}
              <h2>{quantidade}</h2>
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{tipo}</p>
            </div>
          ))}
        </div>

        {/* Tabela de Quantidades por Setor */}
        <Table bordered>
          <thead>
            <tr>
              <th>Setor</th>
              <th>Tipo de Aparelho</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {dadosTabela.map((item, index) => (
              <tr key={index}>
                <td>{item.setor}</td>
                <td>{item.tipo}</td>
                <td>{item.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </Table>

      </ModalBody>
    </Modal>
  );
};

export default ModalAparelho;
