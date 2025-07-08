import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

function ModalDel({ isOpen, toggle, onConfirm, itemName = "este item" }) {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirmação de Exclusão</ModalHeader>
      <ModalBody>
        Tem certeza que deseja excluir <strong>{itemName}</strong>?
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onConfirm}>Sim</Button>{' '}
        <Button color="secondary" onClick={toggle}>Não</Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalDel;
