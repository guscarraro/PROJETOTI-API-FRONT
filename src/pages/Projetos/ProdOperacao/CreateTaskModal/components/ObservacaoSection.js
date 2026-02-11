import React from "react";
import { Field, Label, TextArea } from "../style";

export default function ObservacaoSection({ busy, observacao, setObservacao }) {
  return (
    <Field style={{ gridColumn: "1 / -1" }}>
      <Label>Observação</Label>
      <TextArea
        rows={3}
        value={observacao}
        disabled={busy}
        onChange={(e) => setObservacao(e.target.value)}
        placeholder="Ex: prioridade, doca, restrições..."
      />
    </Field>
  );
}
