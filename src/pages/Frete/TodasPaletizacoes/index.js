import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "reactstrap";
import {
  FaFileExcel,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaHourglassHalf,
  FaClock,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import apiLocal from "../../../services/apiLocal";
import {
  HeaderContainer,
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "./style";
import LoadingDots from "../../../components/Loading";
import ModalEdit from "./ModalEdit";

const CARD_COLORS = {
  today: "rgba(255, 215, 0, 0.35)",     // Aguardando
  tomorrow: "rgba(0, 255, 127, 0.35)",  // Concluído
  inTwoDays: "rgba(255, 165, 0, 0.35)", // Cancelado
  overdue: "rgba(255, 69, 0, 0.35)",    // Pendente
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});
const formatMoney = (v) => currency.format(Number(v || 0));

const TodasPaletizacoes = () => {
  const [paletizacoes, setPaletizacoes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);

  const [clienteFilter, setClienteFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loadingFiltro, setLoadingFiltro] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPaletizacao, setSelectedPaletizacao] = useState(null);

  useEffect(() => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const formatar = (d) => d.toISOString().split("T")[0];

    setDataInicio(formatar(primeiroDia));
    setDataFim(formatar(ultimoDia));

    fetchData(formatar(primeiroDia), formatar(ultimoDia), "");
  }, []);

  const fetchData = async (inicio = "", fim = "", clienteId = "") => {
    setLoading(true);
    try {
      const [palRes, clientesRes, destinosRes] = await Promise.all([
        apiLocal.getPaletizacoes(),
        apiLocal.getClientes(),
        apiLocal.getDestinos(),
      ]);

      let data = palRes.data;

      if (inicio && fim) {
        const dIni = new Date(inicio);
        const dFim = new Date(fim);
        dFim.setHours(23, 59, 59, 999); // inclui o dia final inteiro
        const tmp = [];
        for (const item of data) {
          const dt = new Date(item.dt_inclusao);
          if (dt >= dIni && dt <= dFim) tmp.push(item);
        }
        data = tmp;
      }

      if (clienteId) {
        const idNum = parseInt(clienteId);
        const tmp = [];
        for (const item of data) {
          if (item.cliente_id === idNum) tmp.push(item);
        }
        data = tmp;
      }

      data.sort((a, b) => b.id - a.id);

      setClientes(clientesRes.data);
      setDestinos(destinosRes.data);
      setPaletizacoes(data);
    } catch (err) {
      toast.error("Erro ao carregar paletizações");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parseValorBR = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const cleaned = v.replace(/\./g, "").replace(",", ".");
      const num = Number(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Lê uma propriedade apenas se existir no objeto (para diferenciar "não veio" de "0")
  const readMaybe = (obj, ...keys) => {
    if (!obj) return null;
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) {
        return parseValorBR(obj[k]);
      }
    }
    return null;
  };

  useEffect(() => {
    if (!paletizacoes.length || !destinos.length || !clientes.length) return;

    const destinosMap = {};
    for (const d of destinos) {
      destinosMap[d.id?.toString()] = {
        nome: d.nome,
        cidade: d.cidade,
        // aceitar "valor_palet" e "valor_pallet"
        valor_palet_num: readMaybe(d, "valor_palet", "valor_pallet"),
      };
    }

    const clientesMap = {};
    for (const c of clientes) {
      clientesMap[c.id?.toString()] = {
        ...c,
        // aceitar "valor_palet" e "valor_pallet"
        valor_pallet_num: readMaybe(c, "valor_pallet", "valor_palet"),
      };
    }

    const enriched = [];
    for (const p of paletizacoes) {
      const destinoIdStr = p.destino_id?.toString();
      const clienteIdStr = p.cliente_id?.toString();

      const destino = destinosMap[destinoIdStr];
      const cliente = clientesMap[clienteIdStr];

      const qtd = Number(p.qtde_palet) || 0;

      // prioridade para manter o que funcionava antes:
      // 1) cliente  2) item  3) destino
      const unitFromCliente = readMaybe(cliente, "valor_pallet_num");
      const unitFromItem = readMaybe(p, "valor_palet", "valor_pallet");
      const unitFromDestino = readMaybe(destino, "valor_palet_num");

      const valorUnit =
        (unitFromCliente !== null ? unitFromCliente : null) ??
        (unitFromItem !== null ? unitFromItem : null) ??
        (unitFromDestino !== null ? unitFromDestino : null) ??
        0;

      const valor_total = qtd * (Number(valorUnit) || 0);

      const valor_cobrado_num = readMaybe(p, "valor_cobrado");
      const valor_nao_cobrado_num = readMaybe(p, "valor_nao_cobrado");

      const cte_numero =
        p.documento_transporte?.length === 44
          ? p.documento_transporte.slice(24, 33)
          : p.documento_transporte;

      enriched.push({
        ...p,
        cliente_nome: cliente?.nome || "N/A",
        destino_nome: destino?.nome || "N/A",
        destino_cidade: destino?.cidade || "N/A",
        cte_numero,
        valor_unit: Number(valorUnit) || 0,
        valor_total,
        valor_cobrado_num: valor_cobrado_num ?? 0,
        valor_nao_cobrado_num: valor_nao_cobrado_num ?? 0,
      });
    }

    setFiltered(enriched);
  }, [paletizacoes, destinos, clientes]);

  // Totais dos cards: preferir (cobrado / não cobrado) e cair para valor_total se não vier
  const totalsByStatus = useMemo(() => {
    const base = { pendente: 0, concluido: 0, cancelado: 0, aguardando: 0 };
    for (const p of filtered) {
      const s = String(p.verificado || "").toUpperCase().trim();
      const totalCobrado = p.valor_cobrado_num || 0;
      const totalNaoCobrado = p.valor_nao_cobrado_num || 0;
      const fallback = p.valor_total || 0;

      if (s === "CONFIRMADO") {
        base.concluido += totalCobrado || fallback;
      } else if (s === "CANCELADO") {
        base.cancelado += totalNaoCobrado || fallback;
      } else if (s === "PENDENTE") {
        base.pendente += totalNaoCobrado || fallback;
      } else if (s === "AGUARDANDO RETORNO") {
        base.aguardando += totalNaoCobrado || fallback;
      }
    }
    return base;
  }, [filtered]);

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      toast.warning("Nenhum dado para exportar");
      return;
    }

    const rows = [];
    for (const p of filtered) {
      rows.push({
        ID: p.id,
        "Documento Transporte": p.documento_transporte,
        "NF Referência": p.nf_ref,
        Cliente: p.cliente_nome,
        Destino: p.destino_nome,
        Cidade: p.destino_cidade,
        "Data Inclusão": p.dt_inclusao ? new Date(p.dt_inclusao).toLocaleString() : "",
        "Data Início": p.dt_inicio ? new Date(p.dt_inicio).toLocaleString() : "",
        "Data Final": p.dt_final ? new Date(p.dt_final).toLocaleString() : "",
        "Qtd Palet": p.qtde_palet,
        Agendamento: p.agendamento ? "Sim" : "Não",
        // exporta o mesmo valor da coluna (valor_total calculado)
        Valor: Number(p.valor_total || 0).toFixed(2),
        Verificado: p.verificado || "",
        "Nº Cobrança": p.nr_cobranca || "",
      });
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paletizações");
    XLSX.writeFile(wb, "RelatorioPaletizacoes.xlsx");
  };

  const aplicarFiltro = () => {
    setLoadingFiltro(true);
    fetchData(dataInicio, dataFim, clienteFilter).finally(() =>
      setLoadingFiltro(false)
    );
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <ModalEdit
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        paletizacao={selectedPaletizacao}
        onSave={() => {
          setModalVisible(false);
          fetchData(dataInicio, dataFim, clienteFilter);
        }}
      />

      {/* Cards de totais */}
      <div
        style={{
          width: "100%",
          maxWidth: 1400,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          padding: "8px 12px",
        }}
      >
        <div
          style={{
            background: CARD_COLORS.overdue,
            borderRadius: 16,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Pendente</span>
            <strong style={{ fontSize: 20 }}>
              {formatMoney(totalsByStatus.pendente || 0)}
            </strong>
          </div>
          <FaHourglassHalf size={26} />
        </div>

        <div
          style={{
            background: CARD_COLORS.tomorrow,
            borderRadius: 16,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Concluído</span>
            <strong style={{ fontSize: 20 }}>
              {formatMoney(totalsByStatus.concluido || 0)}
            </strong>
          </div>
          <FaCheckCircle size={26} />
        </div>

        <div
          style={{
            background: CARD_COLORS.inTwoDays,
            borderRadius: 16,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Cancelado</span>
            <strong style={{ fontSize: 20 }}>
              {formatMoney(totalsByStatus.cancelado || 0)}
            </strong>
          </div>
          <FaTimesCircle size={26} />
        </div>

        <div
          style={{
            background: CARD_COLORS.today,
            borderRadius: 16,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Aguardando</span>
            <strong style={{ fontSize: 20 }}>
              {formatMoney(totalsByStatus.aguardando || 0)}
            </strong>
          </div>
          <FaClock size={26} />
        </div>
      </div>

      {/* Filtros */}
      <HeaderContainer>
        <Button color="success" onClick={handleExportExcel} style={{width:120}}>
          <FaFileExcel /> Exportar
        </Button>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div>
            <label>Data Início:</label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label>Data Fim:</label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <div>
            <label>Cliente:</label>
            <Input
              type="select"
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
              style={{ width: 200 }}
            >
              <option value="">Todos os Clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Input>
          </div>
          <div style={{ display: "flex", alignItems: "end" }}>
            <Button
              color="primary"
              onClick={aplicarFiltro}
              disabled={loadingFiltro}
            >
              {loadingFiltro ? "Filtrando..." : "Filtrar"}
            </Button>
          </div>
        </div>
      </HeaderContainer>

      {/* Tabela com wrapper para não quebrar a página */}
      {loading ? (
        <LoadingDots />
      ) : (
        <div style={{ width: "100%", maxWidth: 1400, overflowX: "auto" }}>
          <Table style={{ minWidth: 1200 }}>
            <thead>
              <TableRow>
                <TableHeader>ID</TableHeader>
                <TableHeader>Documento</TableHeader>
                <TableHeader>NF Referência</TableHeader>
                <TableHeader>Cliente</TableHeader>
                <TableHeader>Destino</TableHeader>
                <TableHeader>Cidade</TableHeader>
                <TableHeader>Dt Inclusão</TableHeader>
                <TableHeader>Início</TableHeader>
                <TableHeader>Fim</TableHeader>
                <TableHeader>Qtd Palet</TableHeader>
                <TableHeader>Agendado</TableHeader>
                <TableHeader>Valor</TableHeader>
                <TableHeader>Verificado</TableHeader>
                <TableHeader>Nº Cobrança</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const s = String(p.verificado || "").toUpperCase().trim();

                const badgeColor = (() => {
                  if (s === "CONFIRMADO") return "green";
                  if (s === "CANCELADO") return "red";
                  if (s === "AGUARDANDO RETORNO") return "orange";
                  if (s === "PENDENTE") return "gray";
                  return "gray";
                })();

                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.cte_numero}</TableCell>

                    <TableCell style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.nf_ref}
                    </TableCell>
                    <TableCell style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.cliente_nome}
                    </TableCell>
                    <TableCell style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.destino_nome}
                    </TableCell>
                    <TableCell style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.destino_cidade}
                    </TableCell>
                    <TableCell>
                      {p.dt_inclusao ? new Date(p.dt_inclusao).toLocaleString() : ""}
                    </TableCell>
                    <TableCell>
                      {p.dt_inicio ? new Date(p.dt_inicio).toLocaleString() : ""}
                    </TableCell>
                    <TableCell>
                      {p.dt_final ? new Date(p.dt_final).toLocaleString() : ""}
                    </TableCell>
                    <TableCell>{p.qtde_palet}</TableCell>
                    <TableCell>{p.agendamento ? "Sim" : "Não"}</TableCell>

                    {/* VOLTA a exibir exatamente o valor_total calculado (linha a linha) */}
                    <TableCell>{formatMoney(p.valor_total || 0)}</TableCell>

                    <TableCell>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          whiteSpace: "nowrap",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          color: "#fff",
                          backgroundColor: badgeColor,
                        }}
                      >
                        {s === "CONFIRMADO" && <FaCheckCircle />}
                        {s === "CANCELADO" && <FaTimesCircle />}
                        {(s === "AGUARDANDO RETORNO" || s === "PENDENTE") && <FaEdit />}
                        <span>{p.verificado}</span>
                      </div>
                    </TableCell>

                    <TableCell>{p.nr_cobranca || ""}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          setSelectedPaletizacao(p);
                          setModalVisible(true);
                        }}
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FaEdit /> Editar
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TodasPaletizacoes;
