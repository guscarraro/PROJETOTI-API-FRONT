import React from "react";
import { Table, Button } from "reactstrap";
import { TableWrap } from "../../tableStyles";
import { ProgressPill } from "../../style";
import { FiCheckCircle, FiClock, FiAlertTriangle, FiCornerUpLeft } from "react-icons/fi";

const GREEN_ROW = "rgba(16,185,129,.12)";

function StatusPill({ ok, exced }) {
  if (exced) {
    return (
      <ProgressPill style={{ background: "#f59e0b", color: "#111827", display: "inline-flex", gap: 6, alignItems: "center" }}>
        <FiAlertTriangle size={14} />
      </ProgressPill>
    );
  }
  if (ok) {
    return (
      <ProgressPill data-ok="1" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <FiCheckCircle size={14} />
      </ProgressPill>
    );
  }
  return (
    <ProgressPill style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <FiClock size={14} />
    </ProgressPill>
  );
}

export default function ItemsTable({
  linhas,
  styles,
  loteChipStyles,
  onDevolvidoExcedente,
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: .2 }}>
        Itens
      </div>

      <TableWrap>
        <Table responsive hover size="sm" style={{ borderRadius: 12, overflow: "hidden" }}>
          <thead className={`sticky ${styles?.theadClass || "thead-default"}`}>
            <tr>
              <th style={{ ...styles.th, width: 96 }}>Status</th>
              <th style={{ ...styles.th, minWidth: 180 }}>Produto</th>
              <th style={{ ...styles.th, minWidth: 160 }}>EAN</th>
              <th className="col-hide-sm" style={{ ...styles.th, width: 64 }}>UM</th>
              <th style={{ ...styles.th, width: 64 }}>Qtd</th>
              <th style={{ ...styles.th, width: 72 }}>Lidos</th>
              <th style={{ ...styles.th, minWidth: 180 }}>Lote</th>
              <th style={{ ...styles.th, minWidth: 160 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={8} style={{ opacity: 0.7 }}>Sem itens</td>
              </tr>
            )}

            {linhas.map((r, idx) => {
              const q = Number(r.qtd || 0);
              const s = Number(r.scanned || 0);
              const ok = s >= q;
              const exced = s > q;
              const hasWarns = (r.warns || []).length > 0;

              const rowBg =
                ok && !hasWarns
                  ? GREEN_ROW
                  : idx % 2
                  ? "rgba(0,0,0,.015)"
                  : undefined;

              const tdBg = (base = {}) => ({ ...base, background: rowBg });

              const lotes = Array.isArray(r.lotes) ? r.lotes : [];
              const show = lotes.slice(0, 3);
              const extra = Math.max(0, lotes.length - show.length);

              const hasExcedLoteWarn = (r.warns || []).some(w =>
                /excedente.*lote/i.test(w) || /tentativa de excedente via lote/i.test(w)
              );

              return (
                <tr key={idx}>
                  <td style={tdBg()}>
                    <StatusPill ok={ok} exced={exced} />
                  </td>

                  <td style={tdBg({ fontWeight: 600, maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>
                    {r.cod || "—"}
                    {hasExcedLoteWarn && typeof onDevolvidoExcedente === "function" && (
                      <span className="mobile-inline-actions">
                        <Button
                          size="sm"
                          color="secondary"
                          onClick={() => onDevolvidoExcedente(r.cod)}
                          title="Material excedente devolvido ao local"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          <FiCornerUpLeft size={14} />
                          <span className="btn-label-hide-sm">Devolver</span>
                        </Button>
                      </span>
                    )}
                  </td>

                  <td style={tdBg({ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })} className="mono">
                    {r.bar || "—"}
                  </td>

                  <td style={tdBg()} className="col-hide-sm">{r.um || "—"}</td>

                  <td style={tdBg({ fontWeight: 700 })}>{q}</td>

                  <td style={tdBg({ fontWeight: 800 })}>{s}</td>

                  <td style={tdBg({ maxWidth: 260 })}>
                    {show.length === 0 ? (
                      <span style={{ opacity: 0.6 }}>—</span>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {show.map((l, i) => (
                          <span key={i} style={{ ...loteChipStyles }}>{l}</span>
                        ))}
                        {extra > 0 && (
                          <span
                            style={{
                              ...loteChipStyles,
                              background: "#e5e7eb",
                              color: "#111827",
                              borderColor: "#cbd5e1",
                              fontWeight: 700
                            }}
                          >
                            +{extra}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="actions-cell" style={tdBg()}>
                    <div className="mobile-row-actions">
                      {hasExcedLoteWarn && typeof onDevolvidoExcedente === "function" && (
                        <Button
                          size="sm"
                          color="secondary"
                          onClick={() => onDevolvidoExcedente(r.cod)}
                          title="Material excedente devolvido ao local"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          <FiCornerUpLeft size={14} />
                          <span className="btn-label-hide-sm">Devolvido</span>
                        </Button>
                      )}
                    </div>

                    {(r.warns || []).map((w, i) => (
                      <div key={i} style={{ fontSize: 11, color: "#b45309", marginTop: 4 }}>{w}</div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}
