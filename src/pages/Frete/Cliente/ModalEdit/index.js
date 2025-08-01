import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label } from "reactstrap";
import { toast } from "react-toastify";
import apiLocal from "../../../../services/apiLocal";

const ModalEdit = ({ isOpen, toggle, cliente, onSaved }) => {
  const [formData, setFormData] = useState({
    id: cliente.id || null,
    nome: cliente.nome || "",
    hr_permanencia: cliente.hr_perm || "",
    tde: cliente.tde || "não",
    valor_permanencia: cliente.valor_permanencia || "",
    paletizado: cliente.paletizado || "não",
    valor_pallet: cliente.valor_pallet || ""
  });

  useEffect(() => {
    setFormData({
      id: cliente.id || null,
      nome: cliente.nome || "",
      hr_permanencia: cliente.hr_perm || "",
      tde: cliente.tde || "não",
      valor_permanencia: cliente.valor_permanencia || "",
      paletizado: cliente.paletizado || "não",
      valor_pallet: cliente.valor_pallet || ""
    });
  }, [cliente]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatTime = (raw) => {
    const digits = raw.replace(/\D/g, "").padStart(4, "0").slice(0, 4);
    const hh = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    return `${hh}:${mm}:00`;
  };

  const handleSave = async () => {
    try {
      if (!formData.id) {
        toast.error("Cliente inválido.");
        return;
      }

      const dataToSend = {
        nome: formData.nome,
        hr_permanencia: formatTime(formData.hr_permanencia),
        tde: formData.tde,
        valor_permanencia: formData.valor_permanencia,
        paletizado: formData.paletizado,
        valor_pallet: formData.valor_pallet
      };


      await apiLocal.updateCamposCliente(formData.id, dataToSend);
      toast.success("Cliente atualizado com sucesso.");
      toggle();
      onSaved();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar cliente.");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Editar Cliente</ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <Label>Nome</Label>
          <Input type="text" value={formData.nome} disabled />
        </div>

        <div className="mb-3">
          <Label>Hora de permanência (hh:mm)</Label>
          <Input
            type="text"
            placeholder="Ex: pode digitar 130 para ficar 1:30"
            value={formData.hr_permanencia}
            onChange={(e) => handleChange("hr_permanencia", e.target.value)}
          />
        </div>

        <div className="mb-3">
          <Label>TDE</Label>
          <Input
            type="select"
            value={formData.tde}
            onChange={(e) => handleChange("tde", e.target.value)}
          >
            <option value="sim">Sim</option>
            <option value="não">Não</option>
          </Input>
        </div>

        <div className="mb-3">
          <Label>Valor permanência (R$)</Label>
          <Input
            type="text"
            placeholder="Ex: 5,32"
            value={formData.valor_permanencia}
            onChange={(e) => handleChange("valor_permanencia", e.target.value)}
          />
        </div>
        <div className="mb-3">
          <Label>Paletizado</Label>
          <Input
            type="select"
            value={formData.paletizado}
            onChange={(e) => handleChange("paletizado", e.target.value)}
          >
            <option value="sim">Sim</option>
            <option value="não">Não</option>
          </Input>
        </div>

        <div className="mb-3">
          <Label>Valor pallet (R$)</Label>
          <Input
            type="text"
            placeholder="Ex: 7,00"
            value={formData.valor_pallet}
            onChange={(e) => handleChange("valor_pallet", e.target.value)}
          />
        </div>

      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={handleSave}>
          Salvar
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalEdit;
