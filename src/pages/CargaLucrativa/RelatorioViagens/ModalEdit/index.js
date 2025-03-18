import React, { useState, useEffect } from "react";
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
import { fetchViagem } from "../../../../services/api";
import { useNavigate } from "react-router-dom";

const ModalEdit = ({ viagem, onClose, onSave, setCurrentTab, setNumeroViagem }) => {

  const [numeroViagemLocal, setNumeroViagemLocal] = useState(viagem.numero_viagem);
  const [placa, setPlaca] = useState(viagem.placa);
  const [motorista, setMotorista] = useState(viagem.motorista);


  const [divergencia, setDivergencia] = useState("N");
  const [obsDivergencia, setObsDivergencia] = useState([]);
  const [divergenciasCampos, setDivergenciasCampos] = useState({});
  const [isLoadingViagem, setIsLoadingViagem] = useState(false);

  const navigate = useNavigate();

  // 📌 Buscar viagem da API externa e comparar os dados
  const fetchViagemData = async () => {
    if (!numeroViagemLocal.trim()) return;

    setIsLoadingViagem(true);

    try {
      const response = await fetchViagem(numeroViagemLocal);
      if (!response || !response.totalReceita) {
        toast.error("Viagem não encontrada na API externa.");
        return;
      }

      let obs = [];
      let divergenciasTemp = {};

      // ✅ Valida divergência de valor de receita
      if (parseFloat(response.totalReceita) !== parseFloat(viagem.total_receita)) {
        obs.push("Valor da receita divergente");
        divergenciasTemp["total_receita"] = true;
      }

      // ✅ Valida divergência de quantidade de documentos de transporte
      if (response.docsTransp.length !== viagem.total_entregas) {
        obs.push("Número de entrega a menos");
        divergenciasTemp["total_entregas"] = true;
      }

      // ✅ Valida divergência de peso total
      if (parseFloat(response.totalPeso) !== parseFloat(viagem.total_peso)) {
        obs.push("Peso total divergente");
        divergenciasTemp["total_peso"] = true;
      }

      // ✅ Define os estados de divergência
      setDivergencia(obs.length > 0 ? "S" : "N");
      setObsDivergencia(obs);
      setDivergenciasCampos(divergenciasTemp);

      // ✅ Atualiza motorista e placa com os valores da API
      setMotorista(response.Motorista);
      setPlaca(response.Placa);
    } catch (error) {
      console.error("Erro ao buscar viagem:", error);
      toast.error("Erro ao buscar viagem.");
    } finally {
      setIsLoadingViagem(false);
    }
  };

  // 🔄 Atualizar Viagem com validação
  const handleSave = async () => {
    // 🔥 Valida se todos os campos estão preenchidos
    if (!numeroViagemLocal.trim()) {
      toast.error("O número da viagem é obrigatório.");
      return;
    }
    if (!placa) {
      toast.error("Placa inválida.");
      return;
    }
    if (!motorista) {
      toast.error("Motorista inválido.");
      return;
    }

    try {
      await apiLocal.updateViagem(viagem.id, {
        numero_viagem: numeroViagemLocal,
        placa: placa,
        motorista: motorista,
        divergencia: divergencia,
        obs_divergencia: obsDivergencia,
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

        {/* Exibir divergências ao usuário */}
        {obsDivergencia.length > 0 && (
          <div style={{ background: "#ffcccc", padding: "10px", borderRadius: "5px", marginBottom: "15px" }}>
            <strong>Atenção! Foram encontradas divergências:</strong>
            <ul>
              {obsDivergencia.map((item, index) => (
                <li key={index} style={{ color: "red" }}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Formulário com inputs alinhados */}
        <FormGroup>
          {/* Número da Viagem */}
          <label>Número da Viagem</label>
          <InputStyled
            type="text"
            value={numeroViagemLocal}
            onChange={(e) => setNumeroViagemLocal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                fetchViagemData();
              }
            }}
          />
        </FormGroup>

        {/* Placa - Apenas para exibição */}
        <FormGroup>
          <label>Placa</label>
          <InputStyled type="text" value={placa} disabled />
        </FormGroup>

        {/* Motorista - Apenas para exibição */}
        <FormGroup>
          <label>Motorista</label>
          <InputStyled type="text" value={motorista} disabled />
        </FormGroup>
        <ActionButton
  style={{ background: "#f39c12", color: "#fff", marginRight: "10px" }}
  onClick={() => {
    setCurrentTab("gerarViagem");
    setNumeroViagem(viagem.numero_viagem);
  }}
>
  Adicionar/Remover CTE
</ActionButton>



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
