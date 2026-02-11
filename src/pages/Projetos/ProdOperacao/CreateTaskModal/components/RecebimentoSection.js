import React from "react";
import {
  Field,
  SectionTitle,
  CompactGrid4,
  CompactField,
  Label,
  MicroSelect,
  MiniInput,
  Hint,
} from "../style";

export default function RecebimentoSection({
  show,
  busy,
  recebimento,
  setRecebimento,
  safeMotoristas,
  safePlacas,
}) {
  if (!show) return null;

  return (
    <Field style={{ gridColumn: "1 / -1" }}>
      <SectionTitle>Recebimento</SectionTitle>

      <CompactGrid4>
        <CompactField>
          <Label>Motorista *</Label>
          <MicroSelect
            value={recebimento.motorista || ""}
            disabled={busy}
            onChange={(e) =>
              setRecebimento((p) => ({
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
          <Hint>Vem do cadastro de motoristas.</Hint>
        </CompactField>

        <CompactField>
          <Label>Chegada *</Label>
          <MiniInput
            disabled={busy}
            type="datetime-local"
            value={recebimento.chegadaAt || ""}
            onChange={(e) =>
              setRecebimento((p) => ({
                ...p,
                chegadaAt: e.target.value,
              }))
            }
          />
        </CompactField>

        <CompactField>
          <Label>Placa cavalo *</Label>
          <MicroSelect
            value={recebimento.placaCavalo || ""}
            disabled={busy}
            onChange={(e) =>
              setRecebimento((p) => ({
                ...p,
                placaCavalo: e.target.value,
              }))
            }
          >
            <option value="">Selecione...</option>
            {safePlacas.map((pl) => (
              <option key={`cav-${pl}`} value={String(pl)}>
                {String(pl)}
              </option>
            ))}
          </MicroSelect>
          <Hint>Vem do cadastro de placas.</Hint>
        </CompactField>

        <CompactField>
          <Label>Placa carreta</Label>
          <MicroSelect
            value={recebimento.placaCarreta || ""}
            disabled={busy}
            onChange={(e) =>
              setRecebimento((p) => ({
                ...p,
                placaCarreta: e.target.value,
              }))
            }
          >
            <option value="">Selecione...</option>
            {safePlacas.map((pl) => (
              <option key={`car-${pl}`} value={String(pl)}>
                {String(pl)}
              </option>
            ))}
          </MicroSelect>
          <Hint>Vem do cadastro de placas.</Hint>
        </CompactField>
      </CompactGrid4>

      <Hint>Chegada agora é dia + hora.</Hint>
    </Field>
  );
}
