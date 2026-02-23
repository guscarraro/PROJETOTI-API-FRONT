import React, { useMemo } from "react";
import {
  Field,
  SectionTitle,
  Label,
  MicroSelect,
  Hint,
  DocMetaBox,
  DocMetaRow,
} from "../style";

export default function ClienteSection({
  docs,
  busy,
  manualMode,
  safeClientes,
  clienteManual,
  setClienteManual,
  pushLog,
  clienteDefinido,
  mixedClientError,
  isRecebimento,
  isExpedicao,
  clientesListFromDocs,
  clientKey,
}) {
  const allowMultiClient = isRecebimento || isExpedicao;

  const hasMixed = !!(clienteDefinido?.mixed || mixedClientError);

  const titleHint = useMemo(() => {
    if (!docs.length) return null;

    // se tem mixed e pode multi -> aviso neutro
    if (hasMixed && allowMultiClient) {
      return (
        <Hint style={{ color: "#1f2937" }}>
          Múltiplos clientes detectados — <b>permitido</b>. Vou listar todos abaixo.
        </Hint>
      );
    }

    // se tem mixed e não pode -> erro
    if (hasMixed && !allowMultiClient) {
      return <Hint style={{ color: "#c0392b" }}>Múltiplos clientes detectados. Não pode misturar.</Hint>;
    }

    return null;
  }, [docs.length, hasMixed, allowMultiClient]);

  return (
    <Field style={{ gridColumn: "1 / -1" }}>
      <SectionTitle>Cliente da demanda</SectionTitle>

      {manualMode ? (
        <>
          <Label>Cliente (manual)</Label>
          <MicroSelect
            value={clienteManual ? clientKey(clienteManual) : ""}
            disabled={busy}
            onChange={(e) => {
              const key = e.target.value;
              let found = null;

              for (let i = 0; i < safeClientes.length; i++) {
                const c = safeClientes[i];
                if (clientKey(c) === key) {
                  found = c;
                  break;
                }
              }

              setClienteManual(found);
              if (found) pushLog(`Cliente manual: ${found.nome}`);
            }}
          >
            <option value="">Selecione...</option>
            {safeClientes.map((c) => (
              <option key={clientKey(c) || c.nome} value={clientKey(c)}>
                {String(c.nome || "—")}
                {String(c.cnpj || "").trim() ? ` • ${String(c.cnpj).trim()}` : ""}
              </option>
            ))}
          </MicroSelect>

          <Hint>
            Use isso apenas quando for bipar a chave (sem importar XML). Se importar XML/ZIP, o cliente vem automático.
          </Hint>
        </>
      ) : null}

      {!docs.length ? (
        <Hint>
          Sem documentos ainda.{" "}
          {isRecebimento ? "Importe XML/ZIP ou selecione cliente manual e bipa a chave." : "Bipe a chave 44."}
        </Hint>
      ) : (
        <>
          {titleHint}

          {/* ✅ SEMPRE mostra a lista */}
          {!clientesListFromDocs?.length ? (
            <Hint>Nenhum cliente identificado nos documentos.</Hint>
          ) : (
            <>
              {clientesListFromDocs.map((c, idx) => (
                <DocMetaBox key={`${c.nome}-${c.cnpj}-${idx}`}>
                  <DocMetaRow>
                    <b>Cliente:</b> {c.nome || "—"}
                  </DocMetaRow>
                  <DocMetaRow>
                    <b>CNPJ:</b> {c.cnpj || "—"}
                  </DocMetaRow>
                </DocMetaBox>
              ))}
            </>
          )}
        </>
      )}
    </Field>
  );
}