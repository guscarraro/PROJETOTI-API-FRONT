import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { toast } from "react-toastify"; // ✅ importar o toast
import apiLocal from "../../../../services/apiLocal";

const ModalEdit = ({ destino, isOpen, onClose, onSaveSuccess }) => {
  const [paletizado, setPaletizado] = useState(destino.paletizado || false);
  const [valorPalet, setValorPalet] = useState(destino.valor_palet || "");

  const handleSave = async () => {
    try {
      await apiLocal.updateCamposPaletizacaoDestino(destino.id, {
        paletizado,
        valor_palet: parseFloat(valorPalet.replace(",", ".") || 0),
      });

      toast.success("Paletização atualizada com sucesso!"); // ✅ toast de sucesso
      onSaveSuccess();
    } catch (error) {
      console.error("Erro ao atualizar destino:", error);
      toast.error("Erro ao atualizar paletização."); // ❌ toast de erro
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>Editar Paletização</ModalHeader>
      <ModalBody>
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={paletizado}
            onChange={(e) => setPaletizado(e.target.checked)}
            id="paletizadoCheck"
          />
          <label className="form-check-label" htmlFor="paletizadoCheck">
            Paletizado
          </label>
        </div>
        <div className="mb-3">
          <label>Valor do Pallet (R$):</label>
          <input
            type="text"
            className="form-control"
            value={valorPalet}
            onChange={(e) => setValorPalet(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSave}>
          Salvar
        </Button>
        <Button color="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalEdit;
