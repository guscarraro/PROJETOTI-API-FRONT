import React from "react";
import { Table, Button } from "reactstrap";
import { ProgressPill } from "../../style";
import { FiCheckCircle, FiClock, FiAlertTriangle, FiCornerUpLeft } from "react-icons/fi";

const GREEN_ROW = "rgba(16,185,129,.12)"; // fundo verde p/ linha ok

function StatusPill({ ok, exced }) {
  if (exced) {
    return (
      <ProgressPill style={{ background: "#f59e0b", color: "#111827", display: "inline-flex", gap: 6, alignItems: "center" }}>
        <FiAlertTriangle size={14} /> excedido
      </ProgressPill>
    );
  }
  if (ok) {
    return (
      <ProgressPill data-ok="1" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <FiCheckCircle size={14} /> OK
      </ProgressPill>
    );
  }
  return (
    <ProgressPill style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <FiClock size={14} /> pendente
    </ProgressPill>
  );
}

export default function ItemsTable({
  linhas,
  selectedCod,
  onSelectCod,
  styles,
  loteChipStyles,
  onDevolvidoExcedente,
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: .2 }}>
        Itens
      </div>

      <Table responsive hover size="sm" className="mt-2" style={{ borderRadius: 12, overflow: "hidden" }}>
        <thead style={styles.thead}>
          <tr>
            <th style={{ ...styles.th, width: 32 }}></th>
            <th style={styles.th}>Produto</th>
            <th style={styles.th}>EAN</th>
            <th style={styles.th}>UM</th>
            <th style={styles.th}>Qtd</th>
            <th style={styles.th}>Lidos</th>
            <th style={styles.th}>Lote</th>
            <th style={styles.th}>Status</th>
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
            const selected = String(r.cod) === String(selectedCod);

            const hasWarns = (r.warns || []).length > 0;
            // fundo da linha -> aplicado nos TDs (Bootstrap colore células)
            const rowBg =
              ok && !hasWarns
                ? GREEN_ROW
                : selected
                ? "rgba(59,130,246,.08)"
                : idx % 2
                ? "rgba(0,0,0,.015)"
                : undefined;

            const tdBg = (base = {}) => ({ ...base, background: rowBg });

            const hasExcedLoteWarn = (r.warns || []).some(w =>
              /excedente.*lote/i.test(w) || /tentativa de excedente via lote/i.test(w)
            );

            return (
              <tr key={idx} onClick={() => onSelectCod(r.cod)} style={{ cursor: "pointer" }}>
                <td style={tdBg()}>
                  <input type="radio" checked={selected} onChange={() => onSelectCod(r.cod)} />
                </td>

                <td style={tdBg({ fontWeight: 600 })}>{r.cod || "—"}</td>
                <td style={tdBg({ ...styles.tdMono })}>{r.bar || "—"}</td>
                <td style={tdBg()}>{r.um || "—"}</td>
                <td style={tdBg({ fontWeight: 700 })}>{q}</td>
                <td style={tdBg({ fontWeight: 800 })}>{s}</td>
                <td style={tdBg()}>
                  {(r.lotes || []).length === 0 ? (
                    <span style={{ opacity: 0.6 }}>—</span>
                  ) : (
                    (r.lotes || []).map((l, i) => (
                      <span key={i} style={{ ...loteChipStyles, marginRight: 6 }}>{l}</span>
                    ))
                  )}
                </td>

                <td style={tdBg()}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <StatusPill ok={ok} exced={exced} />

                    {hasExcedLoteWarn && typeof onDevolvidoExcedente === "function" && (
                      <Button
                        size="sm"
                        color="secondary"
                        onClick={(e) => { e.stopPropagation(); onDevolvidoExcedente(r.cod); }}
                        title="Informar que o material excedente foi devolvido ao local"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <FiCornerUpLeft size={14} /> Devolvido ao local
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
    </div>
  );
}
