import React from "react";
import apiLocal from "../../../../services/apiLocal";
import { ModalContainer, ModalContent, CloseButton, ActionButton } from "./style";
import { toast } from "react-toastify";

const ModalDel = ({ viagem, onClose, onDelete }) => {
  const excluirViagem = async () => {
    try {
      await apiLocal.deleteViagem(viagem.numero_viagem);
      onDelete(); // Atualiza o relatório após a exclusão
      toast.success(`Viagem excluida com sucesso!`);
      onClose(); // Fecha o modal
    } catch (error) {
        toast.error("Erro ao excluir viagem:", error);
    }
  };

  return (
    <ModalContainer>
      <ModalContent>
        <h3 style={{color:'#000'}}>Confirmar exclusão</h3>
        <p style={{color:'#000'}}>Tem certeza que deseja excluir a viagem <strong>{viagem.numero_viagem}</strong>?</p>
        <ActionButton onClick={excluirViagem} style={{ backgroundColor: "red", color: "white" }}>
          Excluir
        </ActionButton>
        <CloseButton onClick={onClose}>Cancelar</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalDel;
