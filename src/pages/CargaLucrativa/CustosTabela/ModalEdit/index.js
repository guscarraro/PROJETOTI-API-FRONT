import React, { useState, useEffect } from "react";
import Select from "react-select";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import {
  ModalContainer,
  ModalContent,
  CloseButton,
  Input,
  SaveButton
} from "../style";

const tiposVeiculoOptions = [
  { value: "TRUCK", label: "TRUCK" },
  { value: "TOCO", label: "TOCO" },
  { value: "3/4", label: "3/4" },
  { value: "VAN", label: "VAN" },
  { value: "FIORINO", label: "FIORINO" },
  { value: "CARRETA", label: "CARRETA" }
];

const ModalEdit = ({ onClose, onSave, custo }) => {
  const [formData, setFormData] = useState({ ...custo });

  useEffect(() => {
    setFormData({ ...custo });
  }, [custo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.valor || !formData.distancia_km) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    try {
      await apiLocal.createOrUpdateCustosFrete({
        ...formData,
        valor: parseFloat(formData.valor), // Converte para número
        distancia_km: parseInt(formData.distancia_km, 10) // Converte para número inteiro
      });

      toast.success("Custo de frete atualizado com sucesso!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar custo:", error);
      toast.error("Erro ao atualizar custo de frete.");
    }
  };

  return (
    <ModalContainer>
      <ModalContent>
        <h3>Editar Custo de Frete</h3>

        {/* 🔒 Bloqueado para edição */}
        <Input type="text" name="origem" placeholder="Origem" value={formData.origem} disabled />
        <Input type="text" name="uf_origem" placeholder="UF Origem" value={formData.uf_origem} disabled />
        <Input type="text" name="destino" placeholder="Destino" value={formData.destino} disabled />
        <Input type="text" name="uf_destino" placeholder="UF Destino" value={formData.uf_destino} disabled />

        {/* 🔹 Select do tipo de veículo com react-select */}
        <Select
          name="tipo_veiculo"
          options={tiposVeiculoOptions}
          placeholder="Selecione o Tipo de Veículo"
          value={tiposVeiculoOptions.find(option => option.value === formData.tipo_veiculo)}
          onChange={(selectedOption) => setFormData({ ...formData, tipo_veiculo: selectedOption.value })}
          styles={{
            control: (provided) => ({
              ...provided,
              backgroundColor: "#fff",
              borderColor: "#ccc",
              color: "#000",
              fontSize: "16px",
              height: "40px",
              width: "320px",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "#000",
            }),
            placeholder: (provided) => ({
              ...provided,
              color: "#555",
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "#fff",
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected ? "#ddd" : "#fff",
              color: "#000",
              fontSize: "16px",
            }),
          }}
        />

        {/* 🔓 Apenas esses campos são editáveis */}
        <Input type="text" name="valor" placeholder="Valor" value={formData.valor} onChange={handleChange} />
        <Input type="text" name="distancia_km" placeholder="Distância (km)" value={formData.distancia_km} onChange={handleChange} />

        <SaveButton onClick={handleSave}>Salvar Alterações</SaveButton>
        <CloseButton onClick={onClose}>Fechar</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalEdit;
