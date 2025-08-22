import React, { useMemo, useState } from "react";
import { tableStyle, cellStyle, tableWrapperStyle, stickyThStyle } from "../styles";
import {
  formatarDataHora,
  getDestinatarioFromRow,
  calcPermanenciaMin,
  formatHHMM,
} from "../utils";

const Th = ({ children, onClick }) => (
  <th
    style={{ ...cellStyle, ...stickyThStyle, fontWeight: 600, cursor: "pointer" }}
    onClick={onClick}
  >
    {children}
  </th>
);

const Td = ({ children }) => <td style={cellStyle}>{children}</td>;

const SubTable = ({ rows }) => {
  const [sort, setSort] = useState({ key: null, direction: "asc" });

  // 🔹 Enriquecemos cada linha com permanência calculada
  const rowsComputed = useMemo(() => {
    return (rows ?? []).map((row) => {
      const permanenciaMin = calcPermanenciaMin(row?.horario_ocorrencia, row?.horario_saida);
      return {
        ...row,
        permanencia_min: permanenciaMin,            // número (minutos) para ordenação/cálculo
        permanencia_fmt: formatHHMM(permanenciaMin) // string "HH:MM" para exibição
      };
    });
  }, [rows]);

  const sorted = useMemo(() => {
    if (!sort.key) return rowsComputed;
    const copy = [...rowsComputed];

    copy.sort((a, b) => {
      const getVal = (row) => {
        switch (sort.key) {
          case "destinatario":
            return (getDestinatarioFromRow(row) || "").toString().toLowerCase();
          case "permanencia_min":
            return row?.permanencia_min ?? null;
          case "horario_ocorrencia":
            return row?.horario_ocorrencia ? new Date(row.horario_ocorrencia).getTime() : null;
          default:
            return row?.[sort.key] ?? null;
        }
      };

      const av = getVal(a);
      const bv = getVal(b);

      // coloca nulos por últimos
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      // número vs número
      if (typeof av === "number" && typeof bv === "number") {
        return sort.direction === "asc" ? av - bv : bv - av;
      }

      // comparação padrão (string/number)
      if (av < bv) return sort.direction === "asc" ? -1 : 1;
      if (av > bv) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [rowsComputed, sort]);

  const clickSort = (key) => {
    setSort((s) => {
      if (s.key === key) {
        return { key, direction: s.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div style={tableWrapperStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <Th onClick={() => clickSort("nf")}>Nota</Th>
            <Th onClick={() => clickSort("cliente")}>Cliente</Th>
            <Th onClick={() => clickSort("destinatario")}>Destinatário</Th>
            <Th onClick={() => clickSort("cte")}>CTE / Justificativa / Nº</Th>
            <Th onClick={() => clickSort("horario_ocorrencia")}>Hora da Ocorrência</Th>
            <Th onClick={() => clickSort("horario_saida")}>Hora da Ocorrência</Th>
            <Th onClick={() => clickSort("permanencia_min")}>Permanência (hh:mm)</Th>
            <Th onClick={() => clickSort("motorista")}>Motorista</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, idx) => (
            <tr key={idx}>
              <Td>{item.nf}</Td>
              <Td>{item.cliente}</Td>
              <Td>{getDestinatarioFromRow(item) || "-"}</Td>
              <Td>{item.cte}</Td>
              <Td>{formatarDataHora(item.horario_ocorrencia)}</Td>
              <Td>{formatarDataHora(item.horario_saida)}</Td>
              <Td>{item.permanencia_fmt}</Td>
              <Td>{item.motorista}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubTable;
