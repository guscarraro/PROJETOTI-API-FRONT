// LancarArmazenagem/index.jsx
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
import { fetchDocumento, fetchNotaFiscal } from "../../../services/api";
import LoadingDots from "../../../components/Loading";
import apiLocal from "../../../services/apiLocal";
import ModalSelectDoc from "./ModalSelectDoc/indexs";

const LancarArmazenagem = ({ onActionComplete }) => {
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCTE, setLoadingCTE] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [opcoesCTE, setOpcoesCTE] = useState([]);
  const [tipoBusca, setTipoBusca] = useState("CTE"); // "CTE" ou "NF"
  const [numeroBusca, setNumeroBusca] = useState("");

  const [armazenagem, setArmazenagem] = useState({
    documento_transporte: "",
    nf_ref: "",
    cliente_id: "",
    destino_id: "",
    dt_inicio: "", // emissão do CTE
    dt_final: "",  // saída do armazém
    qtde_dias: "", // dias de armazenagem
    valor: "",     // opcional (pode ficar null)
    verificado: "",
    nr_cobranca: "",
  });

  const fetchClientes = async () => {
    try {
      const response = await apiLocal.getClientes();
      setClientes(response.data);
    } catch {
      toast.error("Erro ao buscar clientes");
    }
  };

  const fetchDestinos = async () => {
    try {
      const response = await apiLocal.getDestinos();
      setDestinos(response.data);
    } catch {
      toast.error("Erro ao buscar destinos");
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchDestinos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArmazenagem((prev) => ({ ...prev, [name]: value }));
  };

  // Para <input type="datetime-local">: "YYYY-MM-DDTHH:mm"
  const toInputLocalFromAny = (anyDate) => {
    if (!anyDate) return "";
    const d = new Date(anyDate);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  // Converte p/ ISO em America/Sao_Paulo
  const convertToSaoPauloISOString = (input) => {
    if (!input) return null;
    const date = new Date(input);
    return new Date(
      date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    ).toISOString();
  };

  // Calcula qtde de dias com base apenas nas datas (mesma lógica do back)
  const toDateOnly = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const computeDias = (start, end) => {
    const di = toDateOnly(start);
    const df = toDateOnly(end);
    if (!di || !df) return "";
    const diff = Math.round((df - di) / 86400000); // 1000*60*60*24
    return diff >= 0 ? String(diff) : "";
  };

  // Atualiza qtde_dias quando dt_inicio/dt_final mudarem
  useEffect(() => {
    if (armazenagem.dt_inicio && armazenagem.dt_final) {
      const qtd = computeDias(armazenagem.dt_inicio, armazenagem.dt_final);
      setArmazenagem((prev) => ({ ...prev, qtde_dias: qtd }));
    }
  }, [armazenagem.dt_inicio, armazenagem.dt_final]);

  const buscarNF = async () => {
    if (!numeroBusca) return;
    setLoadingCTE(true);
    try {
      const response = await fetchNotaFiscal(numeroBusca.trim());
      if (!response || !Array.isArray(response))
        throw new Error("Resposta inválida da API.");

      const dados = response.filter(
        (n) => n.NF?.toString().trim() === numeroBusca.trim()
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

      setArmazenagem((prev) => ({
        ...prev,
        nf_ref: String(data.NF || ""),
        cliente_id: data.remetente,
        destino_id: data.destinatario,
      }));

      toast.success("Dados da NF carregados com sucesso.");
    } catch {
      toast.error("Erro ao buscar NF.");
    } finally {
      setLoadingCTE(false);
    }
  };

  const buscarCTE = async (cteSelecionado = null) => {
    const numero = cteSelecionado ? null : numeroBusca.trim();
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

      // tenta pegar a emissão do CTE em campos comuns
      const emissaoRaw =
        detalhe?.emissao ||
        detalhe?.dhEmi ||
        detalhe?.dtEmissao ||
        detalhe?.dataEmissao;

      const emissaoInput = toInputLocalFromAny(emissaoRaw);

      const nfNumeros = (detalhe.nfs || []).map((nf) => nf.numero).join(", ");

      setArmazenagem((prev) => ({
        ...prev,
        nf_ref: String(nfNumeros || ""),
        cliente_id: detalhe.tomador,
        destino_id: detalhe.destino,
        documento_transporte: String(detalhe.docTransporte || prev.documento_transporte || "").trim(),

        dt_inicio: emissaoInput, // emissão do CTE
        verificado: "PENDENTE",
        nr_cobranca: "", // deixa vazio; cobrado depois
      }));

      toast.success("Dados do CTE carregados com sucesso.");
    } catch {
      toast.error("Erro ao buscar CTE.");
    } finally {
      setLoadingCTE(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposObrigatorios = [
      { nome: "cliente_id", label: "Cliente" },
      { nome: "destino_id", label: "Destino" },
      { nome: "nf_ref", label: "NF Referência" },
      { nome: "dt_inicio", label: "Data de Início (emissão CTE)" },
      { nome: "dt_final", label: "Data de Fim (saída armazém)" },
      { nome: "qtde_dias", label: "Quantidade de Dias" },
    ];

    const camposVazios = camposObrigatorios.filter(({ nome }) => {
      const valor = armazenagem[nome];
      if (nome === "qtde_dias") return !valor || Number(valor) < 0;
      return !valor || valor.toString().trim() === "";
    });

    if (camposVazios.length > 0) {
      const listaCampos = camposVazios.map((c) => `- ${c.label}`).join("\n");
      toast.error(`Preencha os seguintes campos obrigatórios:\n${listaCampos}`);
      return;
    }

    setIsLoading(true);
    try {
      // resolve IDs (cadastra cliente/destino se necessário)
      let clienteID, destinoID;

      const clienteExistente = clientes.find(
        (c) =>
          c.nome?.trim().toLowerCase() ===
          armazenagem.cliente_id?.trim().toLowerCase()
      );

      if (!clienteExistente) {
        const novoCliente = {
          nome: armazenagem.cliente_id,
          hr_permanencia: null,
        };
        const resCliente = await apiLocal.createOrUpdateCliente(novoCliente);
        clienteID = resCliente.data?.data?.id;
        if (!clienteID) throw new Error("Erro ao cadastrar cliente.");
        toast.success("Cliente cadastrado automaticamente.");
      } else {
        clienteID = clienteExistente.id;
      }

      const destinoExistente = destinos.find(
        (d) =>
          d.nome?.trim().toLowerCase() ===
          armazenagem.destino_id?.trim().toLowerCase()
      );

      if (!destinoExistente) {
        const novoDestino = { nome: armazenagem.destino_id, endereco: null, cidade: "" };
        const resDestino = await apiLocal.createOrUpdateDestino(novoDestino);
        destinoID = resDestino.data?.data?.id;
        if (!destinoID) throw new Error("Erro ao cadastrar destino.");
        toast.success("Destino cadastrado automaticamente.");
      } else {
        destinoID = destinoExistente.id;
      }

const docTransp = (armazenagem.documento_transporte ?? "").toString().trim();

const payload = {
  ...armazenagem,
  documento_transporte: docTransp === "" ? null : docTransp, // <- evita "" duplicado
  nf_ref: String(armazenagem.nf_ref || ""),
  cliente_id: clienteID,
  destino_id: destinoID,
  valor:
    armazenagem.valor === "" || armazenagem.valor == null
      ? null
      : parseFloat(armazenagem.valor),
  dt_inicio: convertToSaoPauloISOString(armazenagem.dt_inicio),
  dt_final: convertToSaoPauloISOString(armazenagem.dt_final),
  qtde_dias:
    armazenagem.qtde_dias === "" || armazenagem.qtde_dias == null
      ? null
      : parseInt(armazenagem.qtde_dias, 10),
  verificado: "PENDENTE",
};


      const response = await apiLocal.createOrUpdateArmazenagem(payload);

      if (response.data) {
        toast.success("Armazenagem lançada com sucesso");
        setArmazenagem({
          documento_transporte: "",
          nf_ref: "",
          cliente_id: "",
          destino_id: "",
          dt_inicio: "",
          dt_final: "",
          qtde_dias: "",
          valor: "",
          verificado: "",
          nr_cobranca: "",
        });
        setNumeroBusca("");
        if (onActionComplete) onActionComplete();
      }
    } catch (error) {
      if (
        error?.response?.status === 400 &&
        error.response?.data?.detail?.includes("já cadastrado")
      ) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(error.message || "Erro ao lançar armazenagem");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const preencherDadosNF = (data) => {
    setArmazenagem((prev) => ({
      ...prev,
      nf_ref: String(data.NF || ""),
      cliente_id: data.remetente,
      destino_id: data.destinatario,
    }));
  };

  return (
    <Container>
      <Title>Lançar Armazenagem</Title>

      <ModalSelectDoc
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        opcoes={opcoesCTE}
        onSelect={(itemSelecionado) => {
          setModalVisible(false);
          tipoBusca === "CTE"
            ? buscarCTE(itemSelecionado)
            : preencherDadosNF(itemSelecionado);
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
        </FormGroup>

        <FormGroup>
          <div style={{ position: "relative" }}>
            <Input
              type="text"
              name={tipoBusca === "CTE" ? "documento_transporte" : "nota_fiscal"}
              value={numeroBusca}
              onChange={(e) => setNumeroBusca(e.target.value)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === "Tab") &&
                (tipoBusca === "CTE" ? buscarCTE() : buscarNF())
              }
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
          <Input type="text" name="nf_ref" style={{color:"#fff"}} value={armazenagem.nf_ref} readOnly disabled />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaUser /> Cliente
          </Label>
          <Input type="text" name="cliente_id" style={{color:"#fff"}}  value={armazenagem.cliente_id} readOnly disabled />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaBuilding /> Destino
          </Label>
          <Input type="text" name="destino_id" style={{color:"#fff"}}  value={armazenagem.destino_id} readOnly disabled />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaCalendar /> Início (emissão CTE)
          </Label>
          <Input
            type="datetime-local"
            name="dt_inicio"
            value={armazenagem.dt_inicio}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaCalendar /> Fim (saída armazém)
          </Label>
          <Input
            type="datetime-local"
            name="dt_final"
            value={armazenagem.dt_final}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Quantidade de Dias</Label>
          <Input
            type="number"
            name="qtde_dias"
            value={armazenagem.qtde_dias}
            onChange={handleInputChange}
            placeholder="Calculado por dt_início e dt_final"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaDollarSign /> Valor (opcional)
          </Label>
          <Input
            type="number"
            step="0.01"
            name="valor"
            value={armazenagem.valor}
            onChange={handleInputChange}
            style={{color:"grey"}} 
          />
        </FormGroup>

        <FormGroup>
          <Label>Verificado</Label>
          <Input
            type="text"
            name="verificado"
            value={armazenagem.verificado || "PENDENTE"}
            readOnly
            disabled
            style={{color:"#fff"}} 
          />
        </FormGroup>

        <FormGroup>
          <Label>Número da Cobrança</Label>
          <Input
            type="text"
            name="nr_cobranca"
            value={armazenagem.nr_cobranca}
            readOnly
            disabled
            style={{color:"#fff"}} 
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <LoadingDots /> : "Lançar Armazenagem"}
        </SubmitButton>
      </StyledForm>
    </Container>
  );
};

export default LancarArmazenagem;
