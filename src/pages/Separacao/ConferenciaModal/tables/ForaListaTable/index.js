import React from "react";
import { Table, Button } from "reactstrap";
import { TableWrap } from "../../tableStyles";

const RED_BG = "rgba(239,68,68,.10)";
const RED_BORDER = "rgba(239,68,68,.45)";
const ROW_BG = "rgba(239,68,68,.06)";

export default function ForaListaTable({ foraLista, onDevolvido, styles }) {
  const tdBg = (base = {}) => ({ ...base, background: ROW_BG });

  return (
    <div>
      <div style={{ fontSize: 12, color: "#9a3412", fontWeight: 800, letterSpacing: .2 }}>
        Itens fora da lista
      </div>

      <TableWrap>
        <div
          style={{
            border: `1px solid ${RED_BORDER}`,
            background: RED_BG,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Table responsive size="sm" style={{ margin: 0 }}>
            <thead className={`sticky ${styles?.theadClass || "thead-default"}`}>
              <tr>
                <th style={styles.th}>EAN</th>
                <th style={styles.th}>Lidos</th>
                <th style={styles.th}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {foraLista.map((r, i) => (
                <tr key={i}>
                  <td style={tdBg({ fontFamily: "ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" })}>
                    {r.bar}
                    <span className="mobile-row-actions">
                      <Button
                        size="sm"
                        color="secondary"
                        onClick={() => onDevolvido(r.bar)}
                        title="Devolver material ao local de origem"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        Devolvido
                      </Button>
                    </span>
                  </td>
                  <td style={tdBg()}>{Number(r.count || 0)}</td>
                  <td style={tdBg()}>
                    <div className="mobile-row-actions">
                      <Button
                        size="sm"
                        color="secondary"
                        onClick={() => onDevolvido(r.bar)}
                        title="Devolver material ao local de origem"
                      >
                        Devolvido ao local
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {foraLista.length === 0 && (
                <tr>
                  <td colSpan={3} style={tdBg({ opacity:.7 })}>Nenhum item fora da lista.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </TableWrap>

      <div style={{ fontSize: 12, marginTop: 6, color: "#9a3412" }}>
        Produto divergente. Devolver material e registrar ocorrência.
      </div>
    </div>
  );
}
