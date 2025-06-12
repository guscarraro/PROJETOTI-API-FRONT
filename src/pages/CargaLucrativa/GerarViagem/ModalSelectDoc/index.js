import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ModalSelectDoc = ({ isOpen, onClose, opcoes, onSelect }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>Selecione o CTE correto</ModalHeader>
      <ModalBody>
        {opcoes.map((cte, index) => (
          <div
            key={index}
            onClick={() => onSelect(cte)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "10px",
              marginBottom: "10px",
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
            }}
          >
            <strong>CTE:</strong> {cte.docTransporte} <br />
            <strong>Destino:</strong> {cte.destino} <br />
            <strong>Peso:</strong> {cte.peso}
          </div>
        ))}
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
