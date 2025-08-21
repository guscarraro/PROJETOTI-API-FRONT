import React, { useMemo, useState } from "react";
import { Button } from "reactstrap";
import ChartCteCobrado from "./ChartCteCobrado";
import * as XLSX from "xlsx";

const JUSTIFICATIVAS_PERMITIDAS = [
  "ACORDO COMERCIAL VIGENTE",
  "CARGA LOTAÇÃO NO DESTINATARIO",
  "CLIENTE NÃO AUTORIZOU PERMANÊNCIA",
];

const ehNumeroCobranca = (v) => /^\d+$/.test((v ?? "").trim());

const ModalCteCobrado = ({ data, onClose }) => {
  // 🔹 Split em 4 buckets
  const {
    acordoComercial,
    cargaLotacao,
    clienteNaoAutorizou,
    numeroCobranca,
  } = useMemo(() => {
    const buckets = {
      acordoComercial: [],
      cargaLotacao: [],
      clienteNaoAutorizou: [],
      numeroCobranca: [],
    };

    (data ?? []).forEach((item) => {
      const v = (item?.cte ?? "").toString().trim();
      if (v === "ACORDO COMERCIAL VIGENTE") buckets.acordoComercial.push(item);
      else if (v === "CARGA LOTAÇÃO NO DESTINATARIO") buckets.cargaLotacao.push(item);
      else if (v === "CLIENTE NÃO AUTORIZOU PERMANÊNCIA") buckets.clienteNaoAutorizou.push(item);
      else if (ehNumeroCobranca(v)) buckets.numeroCobranca.push(item);
      // se quiser tratar “outros”, pode criar um quinto bucket
    });

    return buckets;
  }, [data]);

  // 🔹 Helper: monta série "por cliente" para o gráfico
  const seriePorCliente = (arr) => {
    const map = new Map();
    arr.forEach((i) => {
      const k = i?.cliente ?? "Indefinido";
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map, ([name, quantidade]) => ({ name, quantidade }));
  };

  // 🔥 Exporta 4 abas: uma por bloco
  const exportarParaExcel = () => {
    const wb = XLSX.utils.book_new();

    const addSheet = (nomeAba, arr) => {
      const dados = arr.map((item) => ({
        "Nota Fiscal": item.nf,
        Cliente: item.cliente,
        "CTE / Justificativa / Nº Cobrança": item.cte,
        "Hora da Ocorrência": formatarDataHora(item.horario_ocorrencia),
        Motorista: item.motorista,
      }));
      const ws = XLSX.utils.json_to_sheet(dados);
      XLSX.utils.book_append_sheet(wb, ws, nomeAba);
    };

    addSheet("Acordo Comercial Vigente", acordoComercial);
    addSheet("Carga Lotação no Destinatário", cargaLotacao);
    addSheet("Cliente Não Autorizou Perm.", clienteNaoAutorizou);
    addSheet("Número da Cobrança", numeroCobranca);

    XLSX.writeFile(wb, "CTEs_Cobrados_4_Tabelas.xlsx");
  };

  return (
    <div
      style={backdropStyle}
      onClick={onClose}
    >
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={headerStyle}>
          <h4 style={{ margin: 0 }}>CTEs Cobrados</h4>
          <div style={{ display: "flex", gap: 8 }}>
            <Button color="success" onClick={exportarParaExcel} size="sm">
              Exportar Excel (4 abas)
            </Button>
            <Button color="secondary" onClick={onClose} size="sm">
              Fechar
            </Button>
          </div>
        </div>

        {/* Grid 2x2 */}
        <div style={gridStyle}>
          <Bloco
            titulo="ACORDO COMERCIAL VIGENTE"
            data={acordoComercial}
            serie={seriePorCliente(acordoComercial)}
          />

          <Bloco
            titulo="CARGA LOTAÇÃO NO DESTINATARIO"
            data={cargaLotacao}
            serie={seriePorCliente(cargaLotacao)}
          />

          <Bloco
            titulo="CLIENTE NÃO AUTORIZOU PERMANÊNCIA"
            data={clienteNaoAutorizou}
            serie={seriePorCliente(clienteNaoAutorizou)}
          />

          <Bloco
            titulo="NÚMERO DA COBRANÇA"
            data={numeroCobranca}
            serie={seriePorCliente(numeroCobranca)}
          />
        </div>
      </div>
    </div>
  );
};

/* --------------------- Subcomponentes --------------------- */

const Bloco = ({ titulo, data, serie }) => {
  return (
    <div style={blocoStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <h5 style={{ margin: 0 }}>{titulo}</h5>
        <small style={{ opacity: 0.8 }}>Total: {data.length}</small>
      </div>

      {/* Gráfico do subset */}
      <div style={{ marginBottom: 12 }}>
        <ChartCteCobrado data={serie.slice(0, 7)} />
      </div>

      {/* Tabela do subset (com sort local) */}
      <SubTable rows={data} />
    </div>
  );
};

const SubTable = ({ rows }) => {
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sort.direction === "asc" ? -1 : 1;
      return sort.direction === "asc" ? 1 : -1;
    });
    return copy;
  }, [rows, sort]);

  const clickSort = (key) => {
    setSort((s) => {
      if (s.key === key) {
        return { key, direction: s.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <Th onClick={() => clickSort("nf")}>Nota</Th>
            <Th onClick={() => clickSort("cliente")}>Cliente</Th>
            <Th onClick={() => clickSort("cte")}>CTE / Justificativa / Nº</Th>
            <Th onClick={() => clickSort("horario_ocorrencia")}>Hora da Ocorrência</Th>
            <Th onClick={() => clickSort("motorista")}>Motorista</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, idx) => (
            <tr key={idx}>
              <Td>{item.nf}</Td>
              <Td>{item.cliente}</Td>
              <Td>{item.cte}</Td>
              <Td>{formatarDataHora(item.horario_ocorrencia)}</Td>
              <Td>{item.motorista}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* --------------------- Helpers & Estilos --------------------- */

const formatarDataHora = (dataHora) => {
  if (!dataHora) return "Indisponível";
  const d = new Date(dataHora);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Th = ({ children, onClick }) => (
  <th style={{ ...cellStyle, fontWeight: 600, cursor: "pointer" }} onClick={onClick}>
    {children}
  </th>
);

const Td = ({ children }) => (
  <td style={cellStyle}>{children}</td>
);

const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  minWidth: 900,           // um pouco maior por causa das 4 tabelas
  maxWidth: 1400,
  maxHeight: "85vh",
  overflowY: "auto",
  color: "black",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const blocoStyle = {
  border: "1px solid #e8e8e8",
  borderRadius: 10,
  padding: 12,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const cellStyle = {
  border: "1px solid #eee",
  padding: "8px",
  textAlign: "center",
};

export default ModalCteCobrado;
