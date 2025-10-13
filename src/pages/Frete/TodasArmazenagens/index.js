// TodasArmazenagens/index.jsx
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

const TodasArmazenagens = () => {
  const [armazenagens, setArmazenagens] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);

  const [clienteFilter, setClienteFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loadingFiltro, setLoadingFiltro] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArmazenagem, setSelectedArmazenagem] = useState(null);

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
      const [armRes, clientesRes, destinosRes] = await Promise.all([
        apiLocal.getArmazenagem(),
        apiLocal.getClientes(),
        apiLocal.getDestinos(),
      ]);

      let data = armRes.data;

      if (inicio && fim) {
        const dIni = new Date(inicio);
        const dFim = new Date(fim);
        // inclui o dia final inteiro
        dFim.setHours(23, 59, 59, 999);
        data = data.filter((item) => {
          const dt = new Date(item.dt_inclusao);
          return dt >= dIni && dt <= dFim;
        });
      }

      if (clienteId) {
        data = data.filter((item) => item.cliente_id === parseInt(clienteId));
      }

      data.sort((a, b) => b.id - a.id);

      setClientes(clientesRes.data);
      setDestinos(destinosRes.data);
      setArmazenagens(data);
    } catch (err) {
      toast.error("Erro ao carregar armazenagens");
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

  useEffect(() => {
    if (!armazenagens.length || !destinos.length || !clientes.length) return;

    const destinosMap = {};
    destinos.forEach((d) => {
      destinosMap[d.id?.toString()] = { nome: d.nome, cidade: d.cidade };
    });

    const clientesMap = {};
    clientes.forEach((c) => {
      clientesMap[c.id?.toString()] = {
        ...c,
        valor_pallet_dia_num: parseValorBR(c.valor_pallet_dia),
        cobra_armazenagem: c.cobra_armazenagem, // 's' | 'n' | null
      };
    });

    const enriched = armazenagens.map((p) => {
      const destinoIdStr = p.destino_id?.toString();
      const clienteIdStr = p.cliente_id?.toString();

      const destino = destinosMap[destinoIdStr];
      const cliente = clientesMap[clienteIdStr];

      const valorDia = cliente?.valor_pallet_dia_num || 0;
      const cobra = (cliente?.cobra_armazenagem || "").toLowerCase() === "s";
      const dias = Number(p.qtde_dias) || 0;
      const valor_total = cobra ? dias * valorDia : 0;

      return {
        ...p,
        cliente_nome: cliente?.nome || "N/A",
        destino_nome: destino?.nome || "N/A",
        destino_cidade: destino?.cidade || "N/A",
        cte_numero:
          p.documento_transporte?.length === 44
            ? p.documento_transporte.slice(24, 33)
            : p.documento_transporte,
        valor_total,
      };
    });

    setFiltered(enriched);
  }, [armazenagens, destinos, clientes]);

  const totalsByStatus = useMemo(() => {
    const base = {
      pendente: 0,
      concluido: 0,
      cancelado: 0,
      aguardando: 0,
    };
    for (const p of filtered) {
      const s = String(p.verificado || "").toUpperCase().trim();
      if (s === "PENDENTE") base.pendente += p.valor_total || 0;
      else if (s === "CONFIRMADO") base.concluido += p.valor_total || 0;
      else if (s === "CANCELADO") base.cancelado += p.valor_total || 0;
      else if (s === "AGUARDANDO RETORNO") base.aguardando += p.valor_total || 0;
    }
    return base;
  }, [filtered]);

  const handleExportExcel = () => {
    if (filtered.length === 0) {
      toast.warning("Nenhum dado para exportar");
      return;
    }

    const dataToExport = filtered.map((p) => ({
      ID: p.id,
      "Documento Transporte": p.documento_transporte,
      "NF Referência": p.nf_ref,
      Cliente: p.cliente_nome,
      Destino: p.destino_nome,
      Cidade: p.destino_cidade,
      "Data Inclusão": p.dt_inclusao ? new Date(p.dt_inclusao).toLocaleString() : "",
      "Data Início (emissão CTE)": p.dt_inicio ? new Date(p.dt_inicio).toLocaleString() : "",
      "Data Final (saída armazém)": p.dt_final ? new Date(p.dt_final).toLocaleString() : "",
      Dias: p.qtde_dias,
      Valor: Number(p.valor_total || 0).toFixed(2),
      Verificado: p.verificado,
      "Nº Cobrança": p.nr_cobranca,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Armazenagens");
    XLSX.writeFile(wb, "RelatorioArmazenagens.xlsx");
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
        armazenagem={selectedArmazenagem}
        onSave={() => {
          setModalVisible(false);
          fetchData(dataInicio, dataFim, clienteFilter);
        }}
      />

      {/* Cards de totais por status */}
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
              R$ {Number(totalsByStatus.pendente || 0).toFixed(2)}
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
              R$ {Number(totalsByStatus.concluido || 0).toFixed(2)}
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
              R$ {Number(totalsByStatus.cancelado || 0).toFixed(2)}
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
              R$ {Number(totalsByStatus.aguardando || 0).toFixed(2)}
            </strong>
          </div>
          <FaClock size={26} />
        </div>
      </div>

      {/* Filtros */}
      <HeaderContainer>
        <Button color="success" onClick={handleExportExcel}>
          <FaFileExcel /> Exportar para Excel
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

      {/* Tabela */}
      {loading ? (
        <LoadingDots />
      ) : (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>Documento</TableHeader>
              <TableHeader>NF Referência</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Destino</TableHeader>
              <TableHeader>Cidade</TableHeader>
              <TableHeader>Dt Inclusão</TableHeader>
              <TableHeader>Início (emissão CTE)</TableHeader>
              <TableHeader>Fim (saída armazém)</TableHeader>
              <TableHeader>Dias</TableHeader>
              <TableHeader>Valor</TableHeader>
              <TableHeader>Verificado</TableHeader>
              <TableHeader>Nº Cobrança</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.cte_numero}</TableCell>

                <TableCell>{p.nf_ref}</TableCell>
                <TableCell>{p.cliente_nome}</TableCell>
                <TableCell>{p.destino_nome}</TableCell>
                <TableCell>{p.destino_cidade}</TableCell>
                <TableCell>
                  {p.dt_inclusao ? new Date(p.dt_inclusao).toLocaleString() : ""}
                </TableCell>
                <TableCell>
                  {p.dt_inicio ? new Date(p.dt_inicio).toLocaleString() : ""}
                </TableCell>
                <TableCell>
                  {p.dt_final ? new Date(p.dt_final).toLocaleString() : ""}
                </TableCell>
                <TableCell>{p.qtde_dias}</TableCell>
                <TableCell>{Number(p.valor || 0).toFixed(2)}</TableCell>

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
                      backgroundColor:
                        p.verificado === "CONFIRMADO"
                          ? "green"
                          : p.verificado === "CANCELADO"
                          ? "red"
                          : p.verificado === "AGUARDANDO RETORNO"
                          ? "orange"
                          : "gray",
                    }}
                  >
                    {p.verificado === "CONFIRMADO" && <FaCheckCircle />}
                    {p.verificado === "CANCELADO" && <FaTimesCircle />}
                    {(p.verificado === "AGUARDANDO RETORNO" ||
                      p.verificado === "PENDENTE") && <FaEdit />}
                    <span>{p.verificado}</span>
                  </div>
                </TableCell>

                <TableCell>{p.nr_cobranca || ""}</TableCell>
                <TableCell>
                  <button
                    onClick={() => {
                      setSelectedArmazenagem(p);
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
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default TodasArmazenagens;
