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
    valor_pallet: cliente.valor_pallet || "",
    cobra_armazenagem: cliente.cobra_armazenagem ?? "",
    dias_inicio_cobranca_armazenagem: cliente.dias_inicio_cobranca_armazenagem ?? "",
    valor_pallet_dia: cliente.valor_pallet_dia ?? "",
  });

  useEffect(() => {
    setFormData({
      id: cliente.id || null,
      nome: cliente.nome || "",
      hr_permanencia: cliente.hr_perm || "",
      tde: cliente.tde || "não",
      valor_permanencia: cliente.valor_permanencia || "",
      paletizado: cliente.paletizado || "não",
      valor_pallet: cliente.valor_pallet || "",
      cobra_armazenagem: cliente.cobra_armazenagem ?? "",
      dias_inicio_cobranca_armazenagem: cliente.dias_inicio_cobranca_armazenagem ?? "",
      valor_pallet_dia: cliente.valor_pallet_dia ?? "",
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

  // 3) FUNÇÕES utilitárias (acima do handleSave, junto do formatTime)
  const toInt = (v) => (v === "" || v == null ? null : parseInt(v, 10));
  const toFloat = (v) =>
    v === "" || v == null ? null : parseFloat(String(v).replace(/\./g, "").replace(",", "."));


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
        valor_pallet: formData.valor_pallet,

        // envia sempre; "" vira null
        cobra_armazenagem:
          formData.cobra_armazenagem === "" ? null : formData.cobra_armazenagem,
        dias_inicio_cobranca_armazenagem:
          formData.dias_inicio_cobranca_armazenagem === ""
            ? null
            : toInt(formData.dias_inicio_cobranca_armazenagem),
        valor_pallet_dia:
          formData.valor_pallet_dia === ""
            ? null
            : toFloat(formData.valor_pallet_dia),
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
          <Label>Cobra armazenagem?</Label>
          <Input
            type="select"
            value={formData.cobra_armazenagem}
            onChange={(e) => handleChange("cobra_armazenagem", e.target.value)}
          >
            <option value="">-- selecione --</option>
            <option value="s">Sim</option>
            <option value="n">Não</option>
          </Input>
        </div>

        <div className="mb-3">
          <Label>Após quantos dias será cobrado</Label>
          <Input
            type="number"
            min="0"
            placeholder="Ex: 5"
            value={formData.dias_inicio_cobranca_armazenagem}
            onChange={(e) =>
              handleChange("dias_inicio_cobranca_armazenagem", e.target.value)
            }
          />
        </div>

        <div className="mb-3">
          <Label>Valor por pallet/dia (R$)</Label>
          <Input
            type="text"
            placeholder="Ex: 7,00"
            value={formData.valor_pallet_dia}
            onChange={(e) => handleChange("valor_pallet_dia", e.target.value)}
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
