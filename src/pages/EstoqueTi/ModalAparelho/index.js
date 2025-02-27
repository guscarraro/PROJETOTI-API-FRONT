import React from 'react';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';

const ModalAparelho = ({ isOpen, toggle, equipamentos }) => {
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
