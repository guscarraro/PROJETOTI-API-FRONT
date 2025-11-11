import React from "react";
import { Table, Button } from "reactstrap";
import { TableWrap } from "../../tableStyles";
import { FiCornerUpLeft, FiCheck, FiAlertTriangle } from "react-icons/fi";

const ORANGE_BG = "rgba(245,158,11,.12)";
const ORANGE_BORDER = "rgba(245,158,11,.45)";
const ROW_BG = "rgba(251, 146, 60, .08)";

export default function OcorrenciasTable({
  ocorrencias,
  styles,
  onResolverOcorrencia,   // (occId) => void
  onErroBipagem,          // (occId) => void
  onDevolvidoProduto,     // (bar) => void
  onDevolvidoExcedente,   // (itemCod) => void
}) {
  const tdBg = (base = {}) => ({ ...base, background: ROW_BG });

  function renderAcoes(o) {
    if ((o.status || "aberta").toLowerCase() !== "aberta") return null;

    if (o.tipo === "produto_divergente") {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {typeof onDevolvidoProduto === "function" && o.bar && (
            <Button
              size="sm"
              color="secondary"
              onClick={() => onDevolvidoProduto(o.bar)}
              title="Devolver material ao local de origem"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FiCornerUpLeft size={14} />
              <span className="btn-label-hide-sm">Devolvido</span>
            </Button>
          )}

          {typeof onErroBipagem === "function" && o.id && (
            <Button
              size="sm"
              color="warning"
              onClick={() => onErroBipagem(o.id)}
              title="Marcar como erro de bipagem (encerra ocorrência)"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FiAlertTriangle size={14} />
              <span className="btn-label-hide-sm">Erro de bipagem</span>
            </Button>
          )}
        </div>
      );
    }

    if (o.tipo === "excedente_lote" && typeof onDevolvidoExcedente === "function" && o.itemCod) {
      return (
        <Button
          size="sm"
          color="secondary"
          onClick={() => onDevolvidoExcedente(o.itemCod)}
          title="Material excedente devolvido ao local"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <FiCornerUpLeft size={14} />
          <span className="btn-label-hide-sm">Devolvido</span>
        </Button>
      );
    }

    if (typeof onResolverOcorrencia === "function" && o.id) {
      return (
        <Button
          size="sm"
          color="success"
          onClick={() => onResolverOcorrencia(o.id)}
          title="Marcar ocorrência como resolvida"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <FiCheck size={14} />
          <span className="btn-label-hide-sm">Resolver</span>
        </Button>
      );
    }

    return null;
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: "#7c2d12", fontWeight: 900, letterSpacing: .25 }}>
        Ocorrências
      </div>

      {(!ocorrencias || ocorrencias.length === 0) && (
        <div style={{ fontSize: 12, opacity: .7, marginTop: 6 }}>Nenhuma ocorrência.</div>
      )}

      {ocorrencias && ocorrencias.length > 0 && (
        <TableWrap>
          <div
            style={{
              border: `1px solid ${ORANGE_BORDER}`,
              background: ORANGE_BG,
              borderRadius: 12,
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <Table responsive size="sm" style={{ margin: 0 }}>
              <thead className={`sticky ${styles?.theadClass || "thead-default"}`}>
                <tr>
                  <th style={styles?.th}>Tipo</th>
                  <th style={styles?.th}>Item/EAN</th>
                  <th style={styles?.th}>Detalhe</th>
                  <th style={styles?.th}>Status</th>
                  <th style={styles?.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ocorrencias.map((o, i) => (
                  <tr key={o.id || i}>
                    <td style={tdBg({ fontWeight: 700 })}>{o.tipo}</td>
                    <td style={tdBg()}>{o.itemCod || o.bar || "—"}</td>
                    <td style={tdBg()}>{o.detalhe || "—"}</td>
                    <td style={tdBg()}>{o.status}</td>
                    <td style={tdBg()}>
                      <div className="mobile-row-actions">
                        {renderAcoes(o)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </TableWrap>
      )}
    </div>
  );
}
