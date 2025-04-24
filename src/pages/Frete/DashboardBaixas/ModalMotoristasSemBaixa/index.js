import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Button
} from "reactstrap";

const ModalMotoristasSemBaixa = ({ motoristas, onClose }) => {
  return (
    <Modal isOpen={true} toggle={onClose} size="lg">
      <ModalHeader toggle={onClose}>Motoristas sem baixa via app</ModalHeader>
      <ModalBody>
        <Table bordered striped responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome Completo</th>
            </tr>
          </thead>
          <tbody>
            {motoristas.map((m, i) => (
              <tr key={m.id || i}>
                <td>{i + 1}</td>
                <td>{m.nome}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {motoristas.length === 0 && <p>Nenhum motorista encontrado.</p>}
        <div className="text-end mt-3">
          <Button color="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ModalMotoristasSemBaixa;
