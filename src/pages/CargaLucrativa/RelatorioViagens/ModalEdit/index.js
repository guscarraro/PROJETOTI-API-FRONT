import React, { useState, useEffect } from "react";
import Select from "react-select"; // 📌 react-select para dropdowns
import {
  ModalContainer,
  ModalContent,
  CloseButton,
  ActionButton,
  InputStyled,
  FormGroup,
} from "./style";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";

const ModalEdit = ({ viagem, onClose, onSave }) => {
  const [numeroViagem, setNumeroViagem] = useState(viagem.numero_viagem);
  const [placa, setPlaca] = useState({
    label: viagem.placa,
    value: viagem.placa,
  });
  const [motorista, setMotorista] = useState({
    label: viagem.motorista,
    value: viagem.motorista,
  });
  const [motoristas, setMotoristas] = useState([]);
  const [placas, setPlacas] = useState([]);

  // 🔄 Carregar motoristas e placas disponíveis
  useEffect(() => {
    async function fetchMotoristas() {
      try {
        const response = await apiLocal.getMotoristas();
        const motoristasFormatados = response.data.map((motorista) => ({
          label: motorista.nome,
          value: motorista.nome,
          placa: motorista.placa, // Relaciona placa ao motorista
        }));

        setMotoristas(motoristasFormatados);
        setPlacas(
          [...new Set(motoristasFormatados.map((m) => m.placa))].map((p) => ({
            label: p,
            value: p,
          }))
        );
      } catch (error) {
        console.error("Erro ao buscar motoristas:", error);
      }
    }

    fetchMotoristas();
  }, []);

  // 🔄 Atualizar Viagem com validação
  const handleSave = async () => {
    // 🔥 Valida se todos os campos estão preenchidos
    if (!numeroViagem.trim()) {
      toast.error("O número da viagem é obrigatório.");
      return;
    }
    if (!placa.value) {
      toast.error("Selecione uma placa válida.");
      return;
    }
    if (!motorista.value) {
      toast.error("Selecione um motorista válido.");
      return;
    }

    try {
      await apiLocal.updateViagem(viagem.id, {
        numero_viagem: numeroViagem, // 🔥 Agora permite alterar o número da viagem
        placa: placa.value,
        motorista: motorista.value,
      });

      toast.success("Viagem atualizada com sucesso!");
      onSave(); // Atualiza a lista de viagens
      onClose(); // Fecha o modal
    } catch (error) {
      toast.error("Erro ao atualizar viagem.");
      console.error("Erro ao atualizar viagem:", error);
    }
  };

  return (
    <ModalContainer>
      <ModalContent>
        <h3 style={{ color: "#000", marginBottom: "15px" }}>
          Editar Viagem{" "}
          <span style={{ color: "#007bff" }}>{viagem.numero_viagem}</span>
        </h3>

        {/* Formulário com inputs alinhados */}
        <FormGroup>
          {/* Número da Viagem */}
          <label>Número da Viagem</label>
          <InputStyled
            type="text"
            value={numeroViagem}
            onChange={(e) => setNumeroViagem(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          {/* Placa */}
          <label>Placa</label>
          <Select
            options={placas}
            value={placa}
            onChange={setPlaca}
            placeholder="Selecione uma placa"
          />
        </FormGroup>

        <FormGroup>
          {/* Motorista */}
          <label>Motorista</label>
          <Select
            options={motoristas}
            value={motorista}
            onChange={setMotorista}
            placeholder="Selecione um motorista"
          />
        </FormGroup>

        {/* Botões de ação */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "15px",
          }}
        >
          <CloseButton onClick={onClose}>Fechar</CloseButton>
          <ActionButton
            style={{ background: "green", color: "#fff" }}
            onClick={handleSave}
          >
            Salvar Alterações
          </ActionButton>
        </div>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalEdit;
