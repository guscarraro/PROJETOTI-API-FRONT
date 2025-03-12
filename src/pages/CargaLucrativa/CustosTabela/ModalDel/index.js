import React from "react";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import {
  ModalContainer,
  ModalContent,
  CloseButton,
  DeleteButton
} from "../style";

const ModalDel = ({ onClose, onDelete, custo }) => {
  const handleDelete = async () => {
    try {
      await apiLocal.deleteCustosFrete(custo.id);
      toast.success("Custo de frete excluído com sucesso!");
      onDelete();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir custo:", error);
      toast.error("Erro ao excluir custo de frete.");
    }
  };

  return (
    <ModalContainer style={{color:'#000'}}>
      <ModalContent>
        <h3>Tem certeza que deseja excluir este custo?</h3>
        <p><strong>Origem:</strong> {custo.origem}</p>
        <p><strong>Destino:</strong> {custo.destino}</p>
        <p><strong>Tipo de Veículo:</strong> {custo.tipo_veiculo}</p>
        <p><strong>Valor:</strong> R$ {parseFloat(custo.valor).toFixed(2)}</p>

        <DeleteButton onClick={handleDelete}>Excluir</DeleteButton>
        <CloseButton onClick={onClose}>Cancelar</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalDel;
