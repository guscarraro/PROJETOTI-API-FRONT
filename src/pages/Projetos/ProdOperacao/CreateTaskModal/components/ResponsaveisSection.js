import React from "react";
import {
  Field,
  Label,
  SearchSelectWrap,
  MiniInput,
  OptionsList,
  OptionItem,
  ChipsWrap,
  Chip,
  ChipX,
  Hint,
} from "../style";

export default function ResponsaveisSection({
  busy,
  responsaveis,
  respQuery,
  setRespQuery,
  respOpen,
  setRespOpen,
  availableOps,
  addResponsavel,
  removeResponsavel,
  onRespKeyDown,
}) {
  return (
    <Field style={{ gridColumn: "1 / -1" }}>
      <Label>Responsáveis (multi) — Operação</Label>

      <SearchSelectWrap
        onFocus={() => !busy && setRespOpen(true)}
        onBlur={() => setTimeout(() => setRespOpen(false), 120)}
      >
        <MiniInput
          value={respQuery}
          disabled={busy}
          onChange={(e) => {
            setRespQuery(e.target.value);
            setRespOpen(true);
          }}
          onKeyDown={onRespKeyDown}
          placeholder="Buscar responsável..."
        />

        {respOpen && availableOps.length > 0 ? (
          <OptionsList>
            {availableOps.slice(0, 10).map((name) => (
              <OptionItem key={name} type="button" onMouseDown={() => addResponsavel(name)} disabled={busy}>
                {name}
              </OptionItem>
            ))}
          </OptionsList>
        ) : null}
      </SearchSelectWrap>

      {responsaveis.length ? (
        <ChipsWrap>
          {responsaveis.map((n) => (
            <Chip key={n}>
              {n}
              <ChipX type="button" disabled={busy} onClick={() => removeResponsavel(n)} title="Remover">
                ×
              </ChipX>
            </Chip>
          ))}
        </ChipsWrap>
      ) : null}

      <Hint>Obrigatório: pelo menos 1 responsável.</Hint>
    </Field>
  );
}
