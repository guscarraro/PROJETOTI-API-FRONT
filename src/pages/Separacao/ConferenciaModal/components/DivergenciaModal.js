import React from "react";
import { Button } from "reactstrap";
import { Field, SmallMuted } from "../../style";

export default function DivergenciaModal({
  isOpen,
  onClose,
  linhas,
  foraLista,
  divTipo,
  setDivTipo,
  divItemCod,
  setDivItemCod,
  divDetalhe,
  setDivDetalhe,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 1300,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(680px, 94vw)",
          background: "var(--card-bg, #fff)",
          borderRadius: 14,
          padding: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
        }}
      >
        <h5 style={{ margin: 0 }}>Abrir divergência</h5>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <div>
            <SmallMuted>Tipo</SmallMuted>
            <select
              value={divTipo}
              onChange={(e) => setDivTipo(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "var(--input-bg, #fff)",
                color: "var(--input-fg, #111827)",
              }}
            >
              <option value="falta">Falta</option>
              <option value="avaria">Avaria</option>
              <option value="lote_errado">Lote errado</option>
              <option value="item_errado">Item errado</option>
              <option value="produto_divergente">Produto divergente</option>
              <option value="excedente_lote">Excedente de lote</option>
              <option value="lote_ambiguidade">Lote ambíguo</option>
            </select>
          </div>

          <div>
            <SmallMuted>Item relacionado (opcional)</SmallMuted>
            <select
              value={divItemCod}
              onChange={(e) => setDivItemCod(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "var(--input-bg, #fff)",
                color: "var(--input-fg, #111827)",
              }}
            >
              <option value="">—</option>
              {linhas.map((r) => (
                <option key={r.cod} value={r.cod}>
                  {r.cod} — {r.bar}
                </option>
              ))}
              {foraLista.map((f, i) => (
                <option key={`fora-${i}`} value={`fora:${f.bar}`}>
                  FORA • {f.bar}
                </option>
              ))}
            </select>
          </div>

          <div>
            <SmallMuted>Detalhamento</SmallMuted>
            <Field
              as="textarea"
              rows={3}
              value={divDetalhe}
              onChange={(e) => setDivDetalhe(e.target.value)}
              placeholder="Descreva a divergência"
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 10,
          }}
        >
          <Button color="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button color="warning" onClick={onSubmit}>
            Registrar
          </Button>
        </div>
      </div>
    </div>
  );
}
