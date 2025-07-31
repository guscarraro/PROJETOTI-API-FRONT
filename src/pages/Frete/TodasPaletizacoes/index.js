import React, { useEffect, useState } from "react";
import { Button, Input } from "reactstrap";
import {
  FaFileExcel,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
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

const TodasPaletizacoes = () => {
  const [paletizacoes, setPaletizacoes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
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
      const [palRes, clientesRes] = await Promise.all([
        apiLocal.getPaletizacoes(),
        apiLocal.getClientes(),
      ]);

      const clientesMap = {};
      clientesRes.data.forEach((c) => {
        clientesMap[c.id] = c.nome;
      });

      let data = palRes.data;

      if (inicio && fim) {
        const dIni = new Date(inicio);
        const dFim = new Date(fim);
        data = data.filter((item) => {
          const dt = new Date(item.dt_inclusao);
          return dt >= dIni && dt <= dFim;
        });
      }

      if (clienteId) {
        data = data.filter((item) => item.cliente_id === parseInt(clienteId));
      }

      const finalData = data.map((p) => ({
        ...p,
        cliente_nome: clientesMap[p.cliente_id] || "N/A",
      }));

      finalData.sort((a, b) => b.id - a.id);

      setClientes(clientesRes.data);
      setPaletizacoes(finalData);
      setFiltered(finalData);
    } catch (err) {
      toast.error("Erro ao carregar paletizações");
    } finally {
      setLoading(false);
    }
  };

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
      Destino: p.destino_id,
      "Data Inclusão": new Date(p.dt_inclusao).toLocaleString(),
      "Data Início": p.dt_inicio ? new Date(p.dt_inicio).toLocaleString() : "",
      "Data Final": p.dt_final ? new Date(p.dt_final).toLocaleString() : "",
      "Qtd Palet": p.qtde_palet,
      Agendamento: p.agendamento ? "Sim" : "Não",
      Valor: p.valor,
      Verificado: p.verificado ? "Sim" : "Não",
      "Nº Cobrança": p.nr_cobranca,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
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
              <TableHeader>Dt Inclusão</TableHeader>
              <TableHeader>Início</TableHeader>
              <TableHeader>Fim</TableHeader>
              <TableHeader>Qtd Palet</TableHeader>
              <TableHeader>Agendado</TableHeader>
              <TableHeader>Valor</TableHeader>
              <TableHeader>Verificado</TableHeader>
              <TableHeader>Nº Cobrança</TableHeader>
              <TableHeader></TableHeader> {/* Botão editar */}
            </TableRow>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.documento_transporte}</TableCell>
                <TableCell>{p.nf_ref}</TableCell>
                <TableCell>{p.cliente_nome}</TableCell>
                <TableCell>{p.destino_id}</TableCell>
                <TableCell>
                  {new Date(p.dt_inclusao).toLocaleString()}
                </TableCell>
                <TableCell>
                  {p.dt_inicio ? new Date(p.dt_inicio).toLocaleString() : ""}
                </TableCell>
                <TableCell>
                  {p.dt_final ? new Date(p.dt_final).toLocaleString() : ""}
                </TableCell>
                <TableCell>{p.qtde_palet}</TableCell>
                <TableCell>{p.agendamento ? "Sim" : "Não"}</TableCell>
                <TableCell>{parseFloat(p.valor || 0).toFixed(2)}</TableCell>
                <TableCell>
                  {p.nr_cobranca ? (
                    <FaCheckCircle color="green" />
                  ) : (
                    <FaTimesCircle color="red" />
                  )}
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
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default TodasPaletizacoes;
