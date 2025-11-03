import React from "react";
import { Table } from "reactstrap";

const ORANGE_BG = "rgba(245,158,11,.12)";   // fraco
const ORANGE_BORDER = "rgba(245,158,11,.45)"; // forte
const ROW_BG = "rgba(251, 146, 60, .08)";    // linhas

export default function OcorrenciasTable({ ocorrencias, styles }) {
  const tdBg = (base = {}) => ({ ...base, background: ROW_BG });

  return (
    <div>
      <div style={{ fontSize: 12, color: "#7c2d12", fontWeight: 900, letterSpacing: .25 }}>
        Ocorrências
      </div>

      {ocorrencias.length === 0 && (
        <div style={{ fontSize: 12, opacity: .7, marginTop: 6 }}>Nenhuma ocorrência.</div>
      )}

      {ocorrencias.length > 0 && (
        <div
          style={{
            border: `1px solid ${ORANGE_BORDER}`,
            background: ORANGE_BG,
            borderRadius: 12,
            overflow: "hidden",
            marginTop: 8,
          }}
        >
          <Table responsive bordered={false} size="sm" style={{ margin: 0 }}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Item/EAN</th>
                <th style={styles.th}>Detalhe</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ocorrencias.map((o, i) => (
                <tr key={i}>
                  <td style={tdBg({ fontWeight: 700 })}>{o.tipo}</td>
                  <td style={tdBg()}>{o.itemCod || o.bar || "—"}</td>
                  <td style={tdBg()}>{o.detalhe || "—"}</td>
                  <td style={tdBg()}>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
