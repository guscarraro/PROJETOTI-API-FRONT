import React from "react";
import { Field, Label, MiniInput, Hint } from "../style";

export default function TotalsSection({
  busy,
  paletizada,
  totalsFromDocs,
  totalPalletsFinal,
  setTotalPalletsOverride,
  pushLog,
}) {
  return (
    <>
      <Field>
        <Label>Total Volumes</Label>
        <MiniInput type="number" value={totalsFromDocs.totalVolumes} readOnly disabled />
        <Hint>Imutável (vem das notas).</Hint>
      </Field>

      <Field>
        <Label>Total Pallets</Label>
        <MiniInput
          type="number"
          min="0"
          value={paletizada ? totalPalletsFinal : 0}
          disabled={busy || !paletizada}
          readOnly={!paletizada}
          onChange={(e) => {
            const v = Number(e.target.value || 0);
            setTotalPalletsOverride(v);
          }}
          onBlur={() => {
            if (paletizada) pushLog(`Total pallets ajustado: ${totalPalletsFinal}`);
          }}
          placeholder="0"
        />
        <Hint>{paletizada ? "Ajustável." : "Desativado para carga solta."}</Hint>
      </Field>

      <Field>
        <Label>Total Kg</Label>
        <MiniInput
          type="number"
          value={Number(totalsFromDocs.totalPesoKg || 0).toFixed(2)}
          readOnly
          disabled
        />
        <Hint>Imutável (vem das notas).</Hint>
      </Field>
    </>
  );
}
