import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Container,
  Title,
  StyledForm,
  FormGroup,
  Label,
  Input,
  Select,
  SubmitButton,
} from "./style";
import {
  FaClipboardList,
  FaUser,
  FaBuilding,
  FaCalendar,
  FaDollarSign,
} from "react-icons/fa";
import { fetchDocumento } from "../../../services/api";
import LoadingDots from "../../../components/Loading";
import apiLocal from "../../../services/apiLocal";
import ModalSelectDoc from "./ModalSelectDoc/indexs";

const LancarPaletizacao = ({ onActionComplete }) => {
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCTE, setLoadingCTE] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [opcoesCTE, setOpcoesCTE] = useState([]);

  const [paletizacao, setPaletizacao] = useState({
    documento_transporte: "",
    nf_ref: "",
    cliente_id: "",
    destino_id: "",
    dt_inicio: "",
    dt_final: "",
    qtde_palet: "",
    agendamento: "",
    valor: "",
    verificado: "",
    nr_cobranca: "",
  });

  const fetchClientes = async () => {
    try {
      const response = await apiLocal.getClientes();
      setClientes(response.data);
    } catch (error) {
      toast.error("Erro ao buscar clientes");
    }
  };

  const fetchDestinos = async () => {
    try {
      const response = await apiLocal.getDestinos();
      setDestinos(response.data);
    } catch (error) {
      toast.error("Erro ao buscar destinos");
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchDestinos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaletizacao({ ...paletizacao, [name]: value });
  };

  const buscarCTE = async (cteSelecionado = null) => {
    if (!paletizacao.documento_transporte && !cteSelecionado) return;
    setLoadingCTE(true);

    try {
      const response = cteSelecionado
        ? { detalhe: cteSelecionado }
        : await fetchDocumento(paletizacao.documento_transporte);

      if (Array.isArray(response) && response.length > 1) {
        setOpcoesCTE(response);
        setModalVisible(true);
        return;
      }

      const detalhe = Array.isArray(response) ? response[0] : response?.detalhe;
      if (!detalhe) {
        toast.error("CTE não encontrado.");
        return;
      }

      const nfNumeros = (detalhe.nfs || []).map((nf) => nf.numero).join(", ");
      const temServicoPaletizacao =
        detalhe?.valor_receita_sep?.servicos?.includes("paletizacao");

      const verificado = temServicoPaletizacao ? "S" : "N";
      const nrCobranca = temServicoPaletizacao ? detalhe.docTransporte : "";
      const valorPaletizacao = temServicoPaletizacao
        ? detalhe.valor_receita_sep?.valores?.paletizacao || ""
        : "";

      setPaletizacao((prev) => ({
        ...prev,
        nf_ref: nfNumeros,
        cliente_id: detalhe.tomador,
        destino_id: detalhe.destino,
        agendamento: detalhe.agendamento || "",
        verificado,
        nr_cobranca: nrCobranca,
        valor: valorPaletizacao,
      }));
      toast.success("Dados carregados com sucesso.");
    } catch (err) {
      toast.error("Erro ao buscar CTE.");
    } finally {
      setLoadingCTE(false);
    }
  };
  const convertToSaoPauloISOString = (input) => {
    if (!input) return null;
    const date = new Date(input);
    return new Date(
      date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    ).toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let clienteID, destinoID;

      // Verifica se o cliente já existe
      const clienteExistente = clientes.find(
        (cliente) =>
          cliente.nome?.trim().toLowerCase() ===
          paletizacao.cliente_id?.trim().toLowerCase()
      );

      if (!clienteExistente) {
        const novoCliente = {
          nome: paletizacao.cliente_id,
          hr_permanencia: paletizacao.hr_permanencia?.trim() || null,
        };
        const resCliente = await apiLocal.createOrUpdateCliente(novoCliente);
        clienteID = resCliente.data?.data?.id;

        if (!clienteID) throw new Error("Erro ao cadastrar cliente.");
        toast.success("Cliente cadastrado automaticamente.");
      } else {
        clienteID = clienteExistente.id;
      }

      // Verifica se o destino já existe
      const destinoExistente = destinos.find(
        (destino) =>
          destino.nome?.trim().toLowerCase() ===
          paletizacao.destino_id?.trim().toLowerCase()
      );

      if (!destinoExistente) {
        const novoDestino = {
          nome: paletizacao.destino_id,
          endereco: null,
          cidade: "",
          // opcional, adicione se você tiver paletizacao.cidade
        };
        const resDestino = await apiLocal.createOrUpdateDestino(novoDestino);
        destinoID = resDestino.data?.data?.id;

        if (!destinoID) throw new Error("Erro ao cadastrar destino.");
        toast.success("Destino cadastrado automaticamente.");
      } else {
        destinoID = destinoExistente.id;
      }

      // Monta payload com os IDs atualizados
      const payload = {
        ...paletizacao,
        cliente_id: clienteID,
        destino_id: destinoID,
        agendamento:
          paletizacao.agendamento === "S" || paletizacao.agendamento === true,
        valor:
          paletizacao.valor === "" || paletizacao.valor == null
            ? null
            : parseFloat(paletizacao.valor),
        dt_inicio: convertToSaoPauloISOString(paletizacao.dt_inicio),
        dt_final: convertToSaoPauloISOString(paletizacao.dt_final),
      };

      const response = await apiLocal.createOrUpdatePaletizacao(payload);

      if (response.data) {
        toast.success("Paletização lançada com sucesso");

        // Limpa o formulário
        setPaletizacao({
          documento_transporte: "",
          nf_ref: "",
          cliente_id: "",
          destino_id: "",
          dt_inicio: "",
          dt_final: "",
          qtde_palet: "",
          agendamento: "",
          valor: "",
          verificado: "",
          nr_cobranca: "",
        });

        if (onActionComplete) onActionComplete();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.detail?.includes("já cadastrado")
      ) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(error.message || "Erro ao lançar paletização");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Lançar Paletização</Title>
      <ModalSelectDoc
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        opcoes={opcoesCTE}
        onSelect={(cteSelecionado) => {
          setModalVisible(false);
          buscarCTE(cteSelecionado);
        }}
      />
      <StyledForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            <FaClipboardList /> Documento Transporte (CTE)
          </Label>
          <div style={{ position: "relative" }}>
            <Input
              type="text"
              name="documento_transporte"
              value={paletizacao.documento_transporte}
              onChange={handleInputChange}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === "Tab") && buscarCTE()
              }
              disabled={loadingCTE}
              style={{ paddingRight: "30px" }} // Espaço para o loader não cobrir texto
            />
            {loadingCTE && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <LoadingDots />
              </div>
            )}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>
            <FaClipboardList /> NF Referência
          </Label>
          <Input
            type="text"
            style={{ color: "#fff" }}
            name="nf_ref"
            value={paletizacao.nf_ref}
            readOnly
            disabled
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaUser /> Cliente
          </Label>
          <Input
            type="text"
            style={{ color: "#fff" }}
            name="cliente_id"
            value={paletizacao.cliente_id}
            readOnly
            disabled
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaBuilding /> Destino
          </Label>
          <Input
            type="text"
            style={{ color: "#fff" }}
            name="destino_id"
            value={paletizacao.destino_id}
            readOnly
            disabled
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaCalendar /> Início
          </Label>
          <Input
            type="datetime-local"
            name="dt_inicio"
            value={paletizacao.dt_inicio}
            onChange={handleInputChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaCalendar /> Fim
          </Label>
          <Input
            type="datetime-local"
            name="dt_final"
            value={paletizacao.dt_final}
            onChange={handleInputChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>Quantidade de Paletes</Label>
          <Input
            type="number"
            name="qtde_palet"
            value={paletizacao.qtde_palet}
            onChange={handleInputChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>Agendamento</Label>
          <Input
            type="text"
            name="agendamento"
            value={paletizacao.agendamento}
            readOnly
            style={{ color: "#fff" }}
            disabled
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaDollarSign /> Valor
          </Label>
          <Input
            type="number"
            step="0.01"
            name="valor"
            value={paletizacao.valor}
            onChange={handleInputChange}
            style={{ color: "#fff" }}
            disabled
          />
        </FormGroup>
        <FormGroup>
          <Label>Verificado</Label>
          <Input
            type="text"
            name="verificado"
            value={paletizacao.verificado}
            readOnly
            style={{ color: "#fff" }}
            disabled
          />
        </FormGroup>
        <FormGroup>
          <Label>Número da Cobrança</Label>
          <Input
            type="text"
            name="nr_cobranca"
            value={paletizacao.nr_cobranca}
            readOnly
            style={{ color: "#fff" }}
            disabled
          />
        </FormGroup>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <LoadingDots /> : "Lançar Paletização"}
        </SubmitButton>
      </StyledForm>
    </Container>
  );
};

export default LancarPaletizacao;
