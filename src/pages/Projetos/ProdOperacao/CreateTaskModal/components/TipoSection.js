import React from "react";
import { Field, Label, MicroSelect, Hint, CompactTop3 } from "../style";

export default function TipoSection({
  tipo,
  setTipo,
  busy,
  safeTipos,
  pushLog,
  isRecebimento,
  isExpedicao,
}) {
  return (
    <CompactTop3>
      <Field style={{ gridColumn: "1 / -1" }}>
        <Label>Tipo</Label>
        <MicroSelect
          value={tipo}
          disabled={busy}
          onChange={(e) => {
            setTipo(e.target.value);
            pushLog(`Tipo: ${e.target.value}`);
          }}
        >
          {safeTipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </MicroSelect>

        <Hint>
          {isRecebimento
            ? "Recebimento: permite escolher NF/CT-e e carga, além de importar XML."
            : isExpedicao
              ? "Expedição: permite múltiplos clientes em notas diferentes + informar motorista/placa."
              : "Demais etapas: só bipa chave 44. Todo o resto vem automaticamente da nota."}
        </Hint>
      </Field>
    </CompactTop3>
  );
}
