// components/CargaSection.js
import React from "react";
import { Field, Label, Row, Pill, Hint } from "../style";

export default function CargaSection({
  busy,
  paletizada,
  setPaletizada,
  setPaletizadaTouched,
  pushLog,
}) {
  return (
    <Field>
      <Label>Carga</Label>
      <Row style={{ gap: 6 }}>
        <Pill
          type="button"
          disabled={busy}
          $active={!paletizada}
          onClick={() => {
            if (busy) return;
            setPaletizadaTouched(true);
            setPaletizada(false);
            pushLog("Carga: SOLTA");
          }}
        >
          Solta
        </Pill>

        <Pill
          type="button"
          disabled={busy}
          $active={paletizada}
          onClick={() => {
            if (busy) return;
            setPaletizadaTouched(true);
            setPaletizada(true);
            pushLog("Carga: PALETIZADA");
          }}
        >
          Paletizada
        </Pill>
      </Row>
      <Hint>{paletizada ? "Total por pallets." : "Total por volumes."}</Hint>
    </Field>
  );
}
