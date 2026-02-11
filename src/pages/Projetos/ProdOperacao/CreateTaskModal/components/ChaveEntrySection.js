import React, { useMemo, useState, useRef } from "react";
import { Field, Label, Hint, Inline2, MiniInput, InlineBtn } from "../style";
import { Loader } from "../../style";
// import CameraScannerInline from "./CameraScannerInline";

export default function ChaveEntrySection({
  busy,
  busyKey,
  isRecebimento,
  isExpedicao,
  allowManualReceb,
  docsCount,

  chaveInput,
  setChaveInput,
  onChaveKeyDown,
  addByChave,
  pushLog,
}) {
  const [camOn, setCamOn] = useState(false);
  const lastShotAtRef = useRef(0);

  const canTypeOrScan = useMemo(() => {
    if (busy) return false;
    if (isRecebimento && !allowManualReceb) return false;
    return true;
  }, [busy, isRecebimento, allowManualReceb]);

  const onDetected = (chave44) => {
    // throttling simples pra não duplicar por frame
    const now = Date.now();
    if (now - lastShotAtRef.current < 900) return;
    lastShotAtRef.current = now;

    // chama o mesmo fluxo do enter
    addByChave(chave44);
    pushLog(`Câmera detectou: ${String(chave44).slice(0, 6)}…${String(chave44).slice(-4)}`);
  };

  return (
    <Field style={{ gridColumn: "1 / -1" }}>
      <Label>
        {isRecebimento ? "Inserção manual (último caso)" : "Bipar/Digitar chave 44"}{" "}
        <span style={{ opacity: 0.7, fontWeight: 700 }}>({docsCount})</span>
      </Label>

      <Inline2>
        <MiniInput
          value={chaveInput}
          onChange={(e) => setChaveInput(e.target.value)}
          onKeyDown={onChaveKeyDown}
          placeholder="Chave 44 dígitos + Enter"
          disabled={!canTypeOrScan}
          inputMode="numeric"
        />

        <InlineBtn
          type="button"
          disabled={
            busy ||
            (isRecebimento ? !allowManualReceb : false) ||
            !String(chaveInput || "").trim()
          }
          onClick={() => {
            const raw = chaveInput;
            setChaveInput("");
            addByChave(raw);
          }}
          title={busyKey === "add-chave" ? "Processando..." : "Adicionar"}
        >
          {busyKey === "add-chave" ? <Loader /> : "Add"}
        </InlineBtn>
{/* 
        <InlineBtn
          type="button"
          disabled={!canTypeOrScan}
          onClick={() => setCamOn((p) => !p)}
          title="Bipar pela câmera"
          style={{ minWidth: 100 }}
        >
          {camOn ? "Fechar câmera" : "Câmera"}
        </InlineBtn> */}
      </Inline2>

      {isRecebimento ? (
        !allowManualReceb ? (
          <Hint>Para bipar manual: selecione o cliente (manual) OU importe XML/ZIP.</Hint>
        ) : (
          <Hint>Agora dá pra digitar, colar ou usar a câmera. Sem modal, sem drama.</Hint>
        )
      ) : isExpedicao ? (
        <Hint>Expedição aceita múltiplos clientes. Câmera adiciona uma por vez.</Hint>
      ) : (
        <Hint>Ao bipar, puxa do banco (NF-e/CT-e). Sem misturar cliente.</Hint>
      )}

      {/* <CameraScannerInline active={camOn} disabled={!canTypeOrScan} onDetected={onDetected} /> */}
    </Field>
  );
}
