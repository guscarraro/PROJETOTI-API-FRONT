import React from "react";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import {
  ModalContainer,
  ModalContent,
  CloseButton,
  DeleteButton,
} from "../style";

const ModalDel = ({ onClose, onDelete, coleta }) => {
  const handleDelete = async () => {
    try {
      await apiLocal.deleteColeta(coleta.id);
      toast.success("Coleta excluída com sucesso!");
      onDelete();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir coleta:", error);
      toast.error("Erro ao excluir coleta.");
    }
  };

  return (
    <ModalContainer>
      <ModalContent style={{color:'#000'}}>
        <h3>Tem certeza que deseja excluir esta coleta?</h3>
        <p><strong>Data:</strong> {new Date(coleta.data_coleta).toLocaleDateString()}</p>
        <p><strong>Motorista:</strong> {coleta.motorista_id}</p>
        <p><strong>Cliente:</strong> {coleta.cliente_id}</p>
        <p><strong>Valor:</strong> R$ {parseFloat(coleta.valor).toFixed(2)}</p>

        <DeleteButton onClick={handleDelete}>Excluir</DeleteButton>
        <CloseButton onClick={onClose}>Cancelar</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalDel;
