import React, { useState, useEffect } from "react";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import {
  ModalContainer,
  ModalContent,
  CloseButton,
  SubmitButton,
  FormGroup,
  Label,
  Input,
} from "../style";

const ModalEdit = ({ onClose, onSave, coletaId }) => {
  const [valor, setValor] = useState("");
  const [ordemRef, setOrdemRef] = useState("");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColeta = async () => {
      try {
        if (!coletaId) return;
        const response = await apiLocal.getColetaById(coletaId); // 🔥 Novo endpoint para buscar os detalhes
        const coleta = response.data;
        setValor(coleta.valor || "");
        setOrdemRef(coleta.ordem_ref || "");
        setObs(coleta.obs || "");
      } catch (error) {
        console.error("Erro ao buscar dados da coleta:", error);
        toast.error("Erro ao carregar os dados da coleta.");
      } finally {
        setLoading(false);
      }
    };

    fetchColeta();
  }, [coletaId]);

  const handleSave = async () => {
    try {
      const payload = {
        valor: parseFloat(valor),
        ordem_ref: ordemRef.trim() || null,
        obs: obs.trim() || null,
      };

      await apiLocal.updateColetaParcial(coletaId, payload); // ✅ Chamando o endpoint correto
      toast.success("Coleta atualizada com sucesso!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar coleta:", error);
      toast.error("Erro ao atualizar coleta.");
    }
  };

  if (loading) {
    return (
      <ModalContainer>
        <ModalContent>
          <h3>Carregando...</h3>
        </ModalContent>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer>
      <ModalContent>
        <h3>Editar Coleta</h3>

        <FormGroup>
          <Label>Valor</Label>
          <Input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Ordem de Referência</Label>
          <Input
            type="text"
            value={ordemRef}
            onChange={(e) => setOrdemRef(e.target.value)}
            placeholder="Informe a ordem de referência"
          />
        </FormGroup>

        <FormGroup>
          <Label>Observação</Label>
          <Input
            type="text"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Adicione uma observação"
          />
        </FormGroup>

        <SubmitButton onClick={handleSave}>Salvar</SubmitButton>
        <CloseButton onClick={onClose}>Cancelar</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalEdit;
