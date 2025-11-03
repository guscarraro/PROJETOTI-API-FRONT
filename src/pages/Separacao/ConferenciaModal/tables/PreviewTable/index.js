import React from "react";
import { Table } from "reactstrap";

export default function PreviewTable({ linhas, styles, loteChipStyles }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: .2 }}>
        Prévia de itens
      </div>
      <Table responsive size="sm" className="mt-2">
        <thead style={styles.thead}>
          <tr>
            <th style={styles.th}>Produto</th>
            <th style={styles.th}>Barcode</th>
            <th style={styles.th}>UM</th>
            <th style={styles.th}>Qtd</th>
            <th style={styles.th}>Lote</th>
          </tr>
        </thead>
        <tbody>
          {(linhas || []).map((r, idx) => (
            <tr key={idx}>
              <td>{r.cod}</td>
              <td style={styles.tdMono}>{r.bar}</td>
              <td>{r.um}</td>
              <td>{r.qtd}</td>
              <td>
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
    </div>
  );
}
