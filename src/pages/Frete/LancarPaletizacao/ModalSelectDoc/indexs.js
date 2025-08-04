import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalSelectDoc = ({ isOpen, onClose, opcoes, onSelect }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>Selecionar Documento</ModalHeader>
      <ModalBody>
        <p>Foram encontrados múltiplos documentos com o mesmo número:</p>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {opcoes.map((doc, index) => {
            const remetente = doc.remetente || "Remetente não informado";
            const destinatario = doc.destinatario || "Destinatário não informado";
            const chave =
              doc?.nfs?.[0]?.chave || // formato CTE
              doc?.chave ||           // formato NF simples
              "Chave não disponível";

            return (
              <li
                key={index}
                style={{ cursor: "pointer", marginBottom: "12px", padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }}
                onClick={() => onSelect(doc)}
              >
                <strong>Remetente:</strong> {remetente} <br />
                <strong>Destinatário:</strong> {destinatario} <br />
                <strong>Chave:</strong> {chave}
              </li>
            );
          })}
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
