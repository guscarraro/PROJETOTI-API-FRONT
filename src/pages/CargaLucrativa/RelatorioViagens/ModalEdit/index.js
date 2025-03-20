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
  
      let divergenciasTemp = {};
      let obs = [];
  
      const formatDivergencia = (campo, valorViagem, valorApi) => {
        const diferenca = parseFloat(valorApi) - parseFloat(valorViagem);
        const isCusto = campo.toLowerCase().includes("custo");
        const isPeso = campo.toLowerCase().includes("peso");
        const cor = isCusto ? (diferenca > 0 ? "red" : "green") : (diferenca > 0 ? "green" : "red");
        const sinal = diferenca > 0 ? "+" : "";
        const valorFormatado = isCusto ? `R$ ${valorApi}` : isPeso ? `${valorApi} kg` : valorApi;
        const diferencaFormatada = isCusto ? `R$ ${sinal}${diferenca}` : isPeso ? `${sinal}${diferenca} kg` : `${sinal}${diferenca}`;
  
        return (
          <div style={{ fontSize: "14px", color: "#555" }}>
            <div>{campo}</div>
            <div style={{ color: cor, fontSize: "16px" }}>
              {valorViagem} → <strong>{valorFormatado}</strong> ({diferencaFormatada})
            </div>
          </div>
        );
      };
  
      // ✅ Valida divergência de valor de receita
      if (parseFloat(response.totalReceita) !== parseFloat(viagem.total_receita)) {
        obs.push(formatDivergencia("Valor da Receita", viagem.total_receita, response.totalReceita));
        divergenciasTemp["total_receita"] = response.totalReceita;
      }
  
      // ✅ Valida divergência de quantidade de entregas
      if (response.docsTransp.length !== viagem.total_entregas) {
        obs.push(formatDivergencia("Total de Entregas", viagem.total_entregas, response.docsTransp.length));
        divergenciasTemp["total_entregas"] = response.docsTransp.length;
      }
  
      // ✅ Valida divergência de peso total
      if (parseFloat(response.totalPeso) !== parseFloat(viagem.total_peso)) {
        obs.push(formatDivergencia("Peso Total", viagem.total_peso, response.totalPeso));
        divergenciasTemp["total_peso"] = response.totalPeso;
      }
  
      // ✅ Valida divergência de custo total
      const custoTotal = response.totalCusto || response.custoTotal || response.valor_custo || 0;
      if (parseFloat(custoTotal) !== parseFloat(viagem.total_custo)) {
        obs.push(formatDivergencia("Custo Total", viagem.total_custo, custoTotal));
        divergenciasTemp["total_custo"] = custoTotal;
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
        obs_divergencia: Object.entries(divergenciasCampos).map(([campo, valor]) => `${campo}: ${valor}`), // Envia a lista de strings
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
        <h3 style={{ color: "#555", marginBottom: "15px" }}>
          Editar Viagem{" "}
          <span style={{ color: "#007bff" }}>{viagem.numero_viagem}</span>
        </h3>

        {/* Exibir divergências ao usuário */}
        {obsDivergencia.length > 0 && (
          <div style={{ background: "rgb(0 123 255 / 40%)", padding: "10px", borderRadius: "5px", marginBottom: "15px" }}>
            <strong style={{color:'#555'}}>Atenção! Foram encontradas divergências:</strong>
            <ul>
              {obsDivergencia.map((item, index) => (
                <li key={index} style={{  listStyleType: "none" }}>{item}</li>

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
        <div style={{ marginTop: "20px", textAlign: "center" }}>
  <ActionButton
    style={{ background: "#007bff", color: "#fff", padding: "10px 20px" }}
    onClick={() => {
      setCurrentTab("gerarViagem");
      setNumeroViagem(viagem.numero_viagem);
    }}
  >
    + Adicionar/ - Remover CTE
  </ActionButton>
</div>




        {/* Botões de ação */}
        <div
           style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            marginTop: "20px",
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
