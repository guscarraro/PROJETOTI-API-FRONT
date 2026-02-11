import React from "react";
import {
  Field,
  SectionTitle,
  CompactGrid4,
  CompactField,
  Label,
  MicroSelect,
  MiniInput,
} from "../style";

export default function ExpedicaoSection({
  show,
  busy,
  expedicao,
  setExpedicao,
  safeMotoristas,
  safePlacas,
}) {
  if (!show) return null;

  return (
    <Field style={{ gridColumn: "1 / -1" }}>
      <SectionTitle>Expedição (quem vai carregar)</SectionTitle>

      <CompactGrid4>
        <CompactField>
          <Label>Motorista *</Label>
          <MicroSelect
            value={expedicao.motorista || ""}
            disabled={busy}
            onChange={(e) =>
              setExpedicao((p) => ({
                ...p,
                motorista: e.target.value,
              }))
            }
          >
            <option value="">Selecione...</option>
            {safeMotoristas.map((m) => (
              <option key={m} value={String(m)}>
                {String(m)}
              </option>
            ))}
          </MicroSelect>
        </CompactField>

        <CompactField>
          <Label>Chegada *</Label>
          <MiniInput
            disabled={busy}
            type="datetime-local"
            value={expedicao.chegadaAt || ""}
            onChange={(e) =>
              setExpedicao((p) => ({
                ...p,
                chegadaAt: e.target.value,
              }))
            }
          />
        </CompactField>

        <CompactField>
          <Label>Placa cavalo *</Label>
          <MicroSelect
            value={expedicao.placaCavalo || ""}
            disabled={busy}
            onChange={(e) =>
              setExpedicao((p) => ({
                ...p,
                placaCavalo: e.target.value,
              }))
            }
          >
            <option value="">Selecione...</option>
            {safePlacas.map((pl) => (
              <option key={`exp-cav-${pl}`} value={String(pl)}>
                {String(pl)}
              </option>
            ))}
          </MicroSelect>
        </CompactField>

        <CompactField>
          <Label>Placa carreta *</Label>
          <MicroSelect
            value={expedicao.placaCarreta || ""}
            disabled={busy}
            onChange={(e) =>
              setExpedicao((p) => ({
                ...p,
                placaCarreta: e.target.value,
              }))
            }
          >
            <option value="">Selecione...</option>
            {safePlacas.map((pl) => (
              <option key={`exp-car-${pl}`} value={String(pl)}>
                {String(pl)}
              </option>
            ))}
          </MicroSelect>
        </CompactField>
      </CompactGrid4>
    </Field>
  );
}
