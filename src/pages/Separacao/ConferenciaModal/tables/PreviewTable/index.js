import React from "react";
import { Table } from "reactstrap";
import { TableWrap } from "../../tableStyles";

export default function PreviewTable({ linhas, styles, loteChipStyles }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: .2 }}>
        Prévia de itens
      </div>
      <TableWrap>
        <Table responsive size="sm" className="mt-2">
          <thead className={`sticky ${styles?.theadClass || "thead-default"}`}>
            <tr>
              <th style={styles.th}>Produto</th>
              <th style={styles.th}>Barcode</th>
              <th className="col-hide-sm" style={styles.th}>UM</th>
              <th style={styles.th}>Qtd</th>
              <th className="col-hide-sm" style={styles.th}>Lote</th>
            </tr>
          </thead>
          <tbody>
            {(linhas || []).map((r, idx) => (
              <tr key={idx}>
                <td>{r.cod}</td>
                <td className="mono">{r.bar}</td>
                <td className="col-hide-sm">{r.um}</td>
                <td>{r.qtd}</td>
                <td className="col-hide-sm">
                  {(r.lotes || []).length === 0 ? (
                    <span style={{ opacity: 0.6 }}>—</span>
                  ) : (
                    (r.lotes || []).map((l, i) => (
                      <span key={i} style={{ ...loteChipStyles, marginRight: 6 }}>{l}</span>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}
