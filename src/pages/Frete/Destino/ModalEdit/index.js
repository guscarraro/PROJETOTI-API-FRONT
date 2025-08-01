import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, Input } from "reactstrap";
import { toast } from "react-toastify";
import apiLocal from "../../../../services/apiLocal";

const ModalEdit = ({ destino, isOpen, onClose, onSaveSuccess }) => {
  // Converte booleano para string "sim"/"não" para exibir
  const [paletizado, setPaletizado] = useState(destino.paletizado === true ? "sim" : "não");

  const handleSave = async () => {
    try {
      // Converte "sim"/"não" de volta para booleano
      const paletizadoBool = paletizado === "sim";

      await apiLocal.updateCamposPaletizacaoDestino(destino.id, {
        paletizado: paletizadoBool,
        valor_palet: null, // remove o valor do pallet
      });

      toast.success("Paletização atualizada com sucesso!");
      onSaveSuccess();
    } catch (error) {
      console.error("Erro ao atualizar destino:", error);
      toast.error("Erro ao atualizar paletização.");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>Editar Paletização</ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <Label for="paletizadoSelect">Paletizado</Label>
          <Input
            type="select"
            id="paletizadoSelect"
            value={paletizado}
            onChange={(e) => setPaletizado(e.target.value)}
          >
            <option value="sim">Sim</option>
            <option value="não">Não</option>
          </Input>
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
