import React from "react";
import { Field, Label, Hint, ChipsWrap, Chip, ChipX, MiniInput, SourceBadge } from "../style";

export default function DocsChipsSection({
  docs,
  isRecebimento,
  isExpedicao,
  clienteDefinido,
  mixedClientError,
  busy,
  removeDoc,
  updateDocMetric,
}) {
  return (
    <Field style={{ gridColumn: "1 / -1" }}>
      <Label>Documentos na demanda</Label>

      {!docs.length ? (
        <Hint>Nenhuma nota ainda (não salva sem nota).</Hint>
      ) : (clienteDefinido?.mixed || mixedClientError) && !isExpedicao ? (
        <Hint style={{ color: "#c0392b" }}>Lista oculta enquanto houver conflito de cliente.</Hint>
      ) : (
        <ChipsWrap>
          {docs.map((d) => (
            <Chip key={d.id} style={{ alignItems: "center", gap: 8 }}>
              <SourceBadge $src={d.source}>
                {String(d.source || "").toUpperCase()}
              </SourceBadge>

              <span title={d.chave}>
                CHAVE {String(d.chave || "").slice(0, 6)}…{String(d.chave || "").slice(-4)}
              </span>

              {isRecebimento ? (
                <span style={{ opacity: 0.75 }}>
                  • Vol {Number(d.volumes || 0)} • Kg {Number(d.pesoKg || 0)}
                </span>
              ) : null}

              {isRecebimento && d.source === "manual" ? (
                <span style={{ display: "inline-flex", gap: 6, marginLeft: 8 }}>
                  <MiniInput
                    style={{ width: 86 }}
                    type="number"
                    min="0"
                    disabled={busy}
                    value={d.volumes}
                    onChange={(e) => updateDocMetric(d.id, "volumes", Number(e.target.value || 0))}
                    placeholder="vol"
                  />
                  <MiniInput
                    style={{ width: 86 }}
                    type="number"
                    min="0"
                    disabled={busy}
                    value={d.pesoKg}
                    onChange={(e) => updateDocMetric(d.id, "pesoKg", Number(e.target.value || 0))}
                    placeholder="kg"
                  />
                </span>
              ) : null}

              <ChipX type="button" disabled={busy} onClick={() => removeDoc(d.id)} title="Remover">
                ×
              </ChipX>
            </Chip>
          ))}
        </ChipsWrap>
      )}

      <Hint>
        {isRecebimento
          ? "Notas do recebimento (XML/manual)."
          : isExpedicao
            ? "Expedição: pode agrupar notas de clientes diferentes."
            : "Notas puxadas automaticamente do banco."}
      </Hint>
    </Field>
  );
}
