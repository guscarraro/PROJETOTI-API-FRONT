import React, { useEffect, useState } from "react";
import apiLocal from "../../../../services/apiLocal";
import { ModalBackdrop, ModalCard, ModalTitle, CloseBtn, Field, Select, TinyLabel } from "../style";

export default function ModalJustificativa({ open, rowId, actor, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [statusAjuste, setStatusAjuste] = useState("");
  const [obs, setObs] = useState("");
  const [justificativa, setJustificativa] = useState("");

  useEffect(() => {
    if (!open || !rowId) return;

    (async () => {
      setLoading(true);
      try {
        const resp = await apiLocal.getHorarioAlmocoById(rowId);
        const d = resp?.data || {};
        setStatusAjuste(d.status_ajuste || "");
        setObs(d.obs || "");
        setJustificativa(d.justificativa || "");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, rowId]);

  async function salvar() {
    if (!rowId) return;

    setLoading(true);
    try {
      await apiLocal.updateHorarioAlmoco(
        rowId,
        {
          status_ajuste: statusAjuste || null,
          obs: obs || null,
          justificativa: justificativa || null,
        },
        actor || "unknown"
      );
      await onSaved?.();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <ModalBackdrop onMouseDown={loading ? undefined : onClose}>
      <ModalCard onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <ModalTitle>Justificativa</ModalTitle>
          <CloseBtn type="button" onClick={onClose} disabled={loading}>
            ✕
          </CloseBtn>
        </div>

        <div style={{ marginTop: 12 }}>
          <TinyLabel>Status</TinyLabel>
          <Select value={statusAjuste} onChange={(e) => setStatusAjuste(e.target.value)} disabled={loading}>
            <option value="">Pendente</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Erro performaxxi">Erro performaxxi</option>
            <option value="Ajustado">Ajustado</option>
          </Select>
        </div>

        <div style={{ marginTop: 12 }}>
          <TinyLabel>Obs</TinyLabel>
          <Field
            as="textarea"
            rows={3}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="observação interna..."
            disabled={loading}
            style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <TinyLabel>Justificativa</TinyLabel>
          <Field
            as="textarea"
            rows={4}
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="explique o motivo..."
            disabled={loading}
            style={{ height: "auto", paddingTop: 10, paddingBottom: 10 }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid var(--border, #e5e7eb)",
              background: "transparent",
              color: "inherit",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background: "rgba(34, 211, 238, 0.95)",
              color: "#0b1120",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </ModalCard>
    </ModalBackdrop>
  );
}
