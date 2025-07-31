import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "reactstrap";
import { toast } from "react-toastify";
import apiLocal from "../../../../services/apiLocal";

const ModalEdit = ({ isOpen, onClose, paletizacao, onSave }) => {
  const [nrCobranca, setNrCobranca] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paletizacao) {
      setNrCobranca(paletizacao.nr_cobranca || "");
    }
  }, [isOpen, paletizacao]);

  const handleSave = async () => {
    if (!paletizacao?.id) return;

    setLoading(true);
    try {
      await apiLocal.atualizarNrCobranca(paletizacao.id, nrCobranca);

      toast.success("Cobrança atualizada com sucesso");
      onSave(); // recarrega dados
    } catch (error) {
      toast.error("Erro ao atualizar cobrança");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>Editar Cobrança</ModalHeader>
      <ModalBody>
        <label>Número da Cobrança:</label>
        <Input
          type="text"
          value={nrCobranca}
          onChange={(e) => setNrCobranca(e.target.value)}
          disabled={loading}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
        <Button color="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalEdit;
