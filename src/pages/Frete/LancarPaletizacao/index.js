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
  TableWrapper,
  Table,
  Th,
  Td,
} from "./style";
import {
  FaClipboardList,
  FaUser,
  FaBuilding,
  FaCalendar,
  FaDollarSign,
} from "react-icons/fa";
import { fetchDocumento, fetchNotaFiscal } from "../../../services/api";
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
  const [tipoBusca, setTipoBusca] = useState("CTE");
  const [numeroBusca, setNumeroBusca] = useState("");

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

  // Carregar clientes/destinos
  const fetchClientes = async () => {
    try {
      const response = await apiLocal.getClientes();
      setClientes(response?.data?.data ?? []);
    } catch {
      toast.error("Erro ao buscar clientes");
      setClientes([]);
    }
  };

  const fetchDestinos = async () => {
    try {
      const response = await apiLocal.getDestinos();
      setDestinos(response?.data?.data ?? []);
    } catch {
      toast.error("Erro ao buscar destinos");
      setDestinos([]);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchDestinos();
  }, []);

  // Helpers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaletizacao((prev) => ({ ...prev, [name]: value }));
  };

  const convertToSaoPauloISOString = (input) => {
    if (!input) return null;
    const date = new Date(input);
    const sp = new Date(
      date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    return sp.toISOString();
  };

  const hasPaletizacaoService = (detalhe) => {
    const servicos = detalhe?.valor_receita_sep?.servicos;
    if (!Array.isArray(servicos)) return false;
    for (let i = 0; i < servicos.length; i += 1) {
      const s = servicos[i];
      if (typeof s === "string" && s.toLowerCase().includes("paletiza")) {
        return true;
      }
    }
    return false;
  };

  // Buscar por NF
  const buscarNF = async () => {
    const numero = (numeroBusca || "").trim();
    if (!numero) return;
    setLoadingCTE(true);

    try {
      const response = await fetchNotaFiscal(numero);
      if (!response || !Array.isArray(response)) {
        throw new Error("Resposta inválida da API.");
      }

      const dados = response.filter(
        (n) => n.NF?.toString().trim() === numero
      );

      if (dados.length > 1) {
        setOpcoesCTE(dados);
        setModalVisible(true);
        return;
      }

      const data = dados[0];
      if (!data) {
        toast.error("Nota Fiscal não encontrada.");
        return;
      }

      setPaletizacao((prev) => ({
        ...prev,
        nf_ref: String(data.NF || ""),
        cliente_id: data.remetente || "",
        destino_id: data.destinatario || "",
      }));

      toast.success("Dados da NF carregados com sucesso.");
    } catch {
      toast.error("Erro ao buscar NF.");
    } finally {
      setLoadingCTE(false);
    }
  };

  // Buscar por CTE
  const buscarCTE = async (cteSelecionado = null) => {
    const numero = cteSelecionado ? null : (numeroBusca || "").trim();
    if (!numero && !cteSelecionado) return;

    setLoadingCTE(true);

    try {
      const response = cteSelecionado
        ? { detalhe: cteSelecionado }
        : await fetchDocumento(numero);

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

      const nfNumeros = Array.isArray(detalhe.nfs)
        ? detalhe.nfs.map((nf) => nf.numero).join(", ")
        : "";

      const temServicoPaletizacao = hasPaletizacaoService(detalhe);

      const verificado = "PENDENTE";
      const nrCobranca = temServicoPaletizacao ? (detalhe.docTransporte || "") : "";
      const valorPaletizacao = temServicoPaletizacao
        ? detalhe?.valor_receita_sep?.valores?.paletizacao ?? ""
        : "";

      setPaletizacao((prev) => ({
        ...prev,
        nf_ref: String(nfNumeros || ""),
        cliente_id: detalhe?.tomador || "",
        destino_id: detalhe?.destino || "",
        agendamento: detalhe?.agendamento || "",
        verificado,
        nr_cobranca: nrCobranca,
        valor: valorPaletizacao,
        documento_transporte: String(
          detalhe?.docTransporte || prev.documento_transporte || ""
        ),
      }));

      toast.success("Dados carregados com sucesso.");
    } catch {
      toast.error("Erro ao buscar CTE.");
    } finally {
      setLoadingCTE(false);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposObrigatorios = [
      { nome: "cliente_id", label: "Cliente" },
      { nome: "destino_id", label: "Destino" },
      { nome: "nf_ref", label: "NF Referência" },
      { nome: "dt_inicio", label: "Data de Início" },
      { nome: "dt_final", label: "Data de Fim" },
      { nome: "qtde_palet", label: "Quantidade de Paletes" },
    ];

    const camposVazios = [];
    for (let i = 0; i < camposObrigatorios.length; i += 1) {
      const { nome, label } = camposObrigatorios[i];
      const valor = paletizacao[nome];
      if (nome === "qtde_palet") {
        if (!valor || Number(valor) <= 0) camposVazios.push(label);
      } else if (!valor || valor.toString().trim() === "") {
        camposVazios.push(label);
      }
    }

    if (camposVazios.length > 0) {
      const listaCampos = camposVazios.map((c) => `- ${c}`).join("\n");
      toast.error(`Preencha os seguintes campos obrigatórios:\n${listaCampos}`);
      return;
    }

    setIsLoading(true);

    try {
      // cliente
      let clienteID;
      for (let i = 0; i < clientes.length; i += 1) {
        const c = clientes[i];
        const ok =
          (c?.nome || "").trim().toLowerCase() ===
          (paletizacao?.cliente_id || "").trim().toLowerCase();
        if (ok) {
          clienteID = c.id;
          break;
        }
      }
      if (!clienteID) {
        const novoCliente = {
          nome: paletizacao.cliente_id,
          hr_permanencia: paletizacao.hr_permanencia?.trim() || null,
        };
        const resCliente = await apiLocal.createOrUpdateCliente(novoCliente);
        clienteID = resCliente?.data?.data?.id;
        if (!clienteID) throw new Error("Erro ao cadastrar cliente.");
        toast.success("Cliente cadastrado automaticamente.");
      }

      // destino
      let destinoID;
      for (let i = 0; i < destinos.length; i += 1) {
        const d = destinos[i];
        const ok =
          (d?.nome || "").trim().toLowerCase() ===
          (paletizacao?.destino_id || "").trim().toLowerCase();
        if (ok) {
          destinoID = d.id;
          break;
        }
      }
      if (!destinoID) {
        const novoDestino = {
          nome: paletizacao.destino_id,
          endereco: null,
          cidade: "",
        };
        const resDestino = await apiLocal.createOrUpdateDestino(novoDestino);
        destinoID = resDestino?.data?.data?.id;
        if (!destinoID) throw new Error("Erro ao cadastrar destino.");
        toast.success("Destino cadastrado automaticamente.");
      }

      const payload = {
        ...paletizacao,
        documento_transporte: String(paletizacao.documento_transporte || ""),
        nf_ref: String(paletizacao.nf_ref || ""),
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
        verificado: "PENDENTE",
      };

      const response = await apiLocal.createOrUpdatePaletizacao(payload);

      if (response?.data) {
        toast.success("Paletização lançada com sucesso");
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
        setNumeroBusca("");
        if (onActionComplete) onActionComplete();
      }
    } catch (error) {
      if (
        error?.response &&
        error.response.status === 400 &&
        error.response.data?.detail?.includes("já cadastrado")
      ) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(error?.message || "Erro ao lançar paletização");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Preenchimento via Modal (NF)
  const preencherDadosNF = (data) => {
    setPaletizacao((prev) => ({
      ...prev,
      nf_ref: String(data?.NF || ""),
      cliente_id: data?.remetente || "",
      destino_id: data?.destinatario || "",
    }));
  };

  return (
    <Container>
      <Title>Lançar Paletização</Title>

      <ModalSelectDoc
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        opcoes={opcoesCTE}
        onSelect={(itemSelecionado) => {
          setModalVisible(false);
          if (tipoBusca === "CTE") buscarCTE(itemSelecionado);
          else preencherDadosNF(itemSelecionado);
        }}
      />

      <StyledForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Buscar por:</Label>
          <Select
            value={tipoBusca}
            onChange={(e) => {
              setTipoBusca(e.target.value);
              setNumeroBusca("");
            }}
          >
            <option value="CTE">CTE</option>
            <option value="NF">Nota Fiscal</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>
            {tipoBusca === "CTE" ? "Documento Transporte (CTE)" : "Nota Fiscal"}
          </Label>
          <div style={{ position: "relative" }}>
            <Input
              type="text"
              name={tipoBusca === "CTE" ? "documento_transporte" : "nota_fiscal"}
              value={numeroBusca}
              onChange={(e) => {
                const v = e.target.value;
                setNumeroBusca(v);
                if (v && v.length >= 5 && !loadingCTE) {
                  if (tipoBusca === "CTE") buscarCTE();
                  else buscarNF();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Tab") {
                  if (tipoBusca === "CTE") buscarCTE();
                  else buscarNF();
                }
              }}
              disabled={loadingCTE}
              style={{ paddingRight: "30px" }}
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
            value={paletizacao.nf_ref || ""}
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
            value={paletizacao.cliente_id || ""}
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
            value={paletizacao.destino_id || ""}
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
            value={paletizacao.dt_inicio || ""}
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
            value={paletizacao.dt_final || ""}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Quantidade de Paletes</Label>
          <Input
            type="number"
            name="qtde_palet"
            value={paletizacao.qtde_palet || ""}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Agendamento</Label>
          <Input
            type="text"
            name="agendamento"
            value={paletizacao.agendamento || ""}
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
            value={paletizacao.valor || ""}
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
            value={paletizacao.verificado || "PENDENTE"}
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
            value={paletizacao.nr_cobranca || ""}
            readOnly
            style={{ color: "#fff" }}
            disabled
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <LoadingDots /> : "Lançar Paletização"}
        </SubmitButton>
      </StyledForm>

      {/* ===== EXEMPLO DE TABELA RESPONSIVA (substitua pelas suas linhas) ===== */}
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>CTE</Th>
              <Th>NF(s)</Th>
              <Th>Cliente</Th>
              <Th>Destino</Th>
              <Th>Agendamento</Th>
              <Th>Valor</Th>
              <Th>Status</Th>
              <Th>Nº Cobrança</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>{paletizacao.documento_transporte || "-"}</Td>
              <Td>{paletizacao.nf_ref || "-"}</Td>
              <Td>{paletizacao.cliente_id || "-"}</Td>
              <Td>{paletizacao.destino_id || "-"}</Td>
              <Td>{paletizacao.agendamento?.toString() || "-"}</Td>
              <Td>{paletizacao.valor !== "" && paletizacao.valor != null ? paletizacao.valor : "-"}</Td>
              <Td>{paletizacao.verificado || "PENDENTE"}</Td>
              <Td>{paletizacao.nr_cobranca || "-"}</Td>
            </tr>
          </tbody>
        </Table>
      </TableWrapper>
      {/* ===================================================================== */}
    </Container>
  );
};

export default LancarPaletizacao;
