import React from "react";
import { ModalBg, ModalBox, ModalHeader, BtnSave } from "../modalStyle";
import apiLocal from "../../../../services/apiLocal";

export default function ModalDelete({ integrante, onClose, onDelete }) {
  const handleDelete = async () => {
    // await apiLocal.deleteIntegrante(integrante.id);
    await apiLocal.deleteIntegrante(integrante.id);

    onDelete();
    onClose();
  };

  return (
    <ModalBg>
      <ModalBox>
        <ModalHeader>
          <h3>Remover Integrante</h3>
          <button onClick={onClose}>×</button>
        </ModalHeader>

        <p style={{ marginBottom: 20 }}>
          Tem certeza que deseja remover <b>{integrante.nome} {integrante.sobrenome}</b>?
        </p>

        <BtnSave style={{ background: "#ef4444" }} onClick={handleDelete}>
          Confirmar Exclusão
        </BtnSave>
      </ModalBox>
    </ModalBg>
  );
}
