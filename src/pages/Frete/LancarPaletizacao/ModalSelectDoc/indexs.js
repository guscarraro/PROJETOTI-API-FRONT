import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalSelectDoc = ({ isOpen, onClose, opcoes, onSelect }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>Selecionar Documento</ModalHeader>
      <ModalBody>
        <p>Foram encontrados múltiplos documentos com o mesmo número:</p>
        <ul>
          {opcoes.map((cte, index) => (
            <li
              key={index}
              style={{ cursor: "pointer", marginBottom: "8px" }}
              onClick={() => onSelect(cte)}
            >
              <strong>Remetente:</strong> {cte.remetente} <br />
              <strong>Destinatário:</strong> {cte.destinatario} <br />
              <strong>Chave NF:</strong> {(cte.nfs || [])[0]?.chave || "N/A"}
            </li>
          ))}
        </ul>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalSelectDoc;
