import React from 'react';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';

const ModalInfo = ({ isOpen, toggle, title, data }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>CTE</th>
              <th>Data da Entrega</th>
              <th>Prazo de Entrega</th>
              <th>Número da Nota</th>
              <th>Remetente</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.CTE}</td>
                <td>{item.entregue_em}</td>
                <td>{item.previsao_entrega}</td>
                <td>{item.NF}</td>
                <td>{item.remetente}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ModalBody>
    </Modal>
  );
};

export default ModalInfo;