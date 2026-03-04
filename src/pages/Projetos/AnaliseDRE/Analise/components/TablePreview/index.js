import React from 'react';
import { Container, Header, CountPill, Divider, Wrap, Table, Th, Td, TdCompact } from './style';

export default function TablePreview({ itens, loading, formatBRL, showDate }) {
  return (
    <Container>
      <Header>
        <div style={{ fontWeight: 900, fontSize: 13 }}>Preview (últimos 50)</div>
        <CountPill>{itens.length} itens</CountPill>
      </Header>

      <Divider />

      <Wrap>
        <Table>
          <thead>
            <tr>
              {[
                "Número doc",
                "Data",
                "Doc (CNPJ/CPF)",
                "Pessoa",
                "Item",
                "CFIn cód",
                "CFIn nome",
                "Empresa",
                "Valor doc",
                "Setor",
              ].map((h) => (
                <Th key={h} style={{ whiteSpace: "nowrap", padding: "6px 8px" }}>
                  {h}
                </Th>
              ))}
            </tr>
          </thead>

          <tbody>
            {itens.slice(Math.max(0, itens.length - 50)).map((r) => (
              <tr key={r.id}>
                <TdCompact>{r.numero_doc || "—"}</TdCompact>
                <TdCompact>{showDate(r)}</TdCompact>
                <TdCompact>{r.doc || "—"}</TdCompact>
                <TdCompact>{r.pessoa || "—"}</TdCompact>
                <TdCompact style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.item || "—"}
                </TdCompact>
                <TdCompact>{r.cfin_codigo || "—"}</TdCompact>
                <TdCompact>{r.cfin_nome || "—"}</TdCompact>
                <TdCompact>{r.empresa || "—"}</TdCompact>
                <TdCompact style={{ textAlign: "right" }}>{formatBRL(r.valor_doc)}</TdCompact>
                <TdCompact>{r.setor || "—"}</TdCompact>
              </tr>
            ))}

            {!itens.length && !loading && (
              <tr>
                <Td colSpan={10} style={{ textAlign: "center", opacity: 0.7, padding: 10 }}>
                  Nenhum item importado ainda.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Wrap>
    </Container>
  );
}