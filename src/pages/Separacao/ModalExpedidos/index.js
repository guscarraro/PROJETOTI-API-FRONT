import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Button } from "reactstrap";
import { Field } from "../style";

export default function ModalExpedidos({ isOpen, onClose, pedidos, onConfirm, canExpedir }) {
  const [checks, setChecks] = useState({});
  const [notas, setNotas] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setChecks({});
      setNotas({});
      setSelectAll(false);
      setBusy(false);
    } else {
      // pré-carregar sem marcar
      const c = {};
      const n = {};
      for (let i = 0; i < pedidos.length; i++) {
        const p = pedidos[i];
        c[p.nr_pedido] = false;
        n[p.nr_pedido] = p.nota || "";
      }
      setChecks(c);
      setNotas(n);
    }
  }, [isOpen, pedidos]);

  const selecionados = useMemo(() => {
    const out = [];
    const keys = Object.keys(checks);
    for (let i = 0; i < keys.length; i++) {
      const nr = keys[i];
      if (checks[nr]) out.push({ nr_pedido: nr, nota: (notas[nr] || "").trim() || null });
    }
    return out;
  }, [checks, notas]);

  const toggleAll = () => {
    if (!canExpedir) return;
    const c = {};
    for (let i = 0; i < pedidos.length; i++) {
      c[pedidos[i].nr_pedido] = !selectAll;
    }
    setChecks(c);
    setSelectAll(!selectAll);
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalBody onClick={(e) => e.stopPropagation()}>
        <Header>
          <h3 style={{ margin: 0 }}>Selecionar pedidos para expedir</h3>
        </Header>

        {!canExpedir && (
          <Warn>Você não tem permissão para expedir pedidos.</Warn>
        )}

        {pedidos.length === 0 ? (
          <Empty>Não há pedidos prontos para expedir.</Empty>
        ) : (
          <>
            <TopBar>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={selectAll} onChange={toggleAll} />
                Selecionar todos
              </label>
            </TopBar>

            <List>
              {pedidos.map((p) => (
                <Item key={p.nr_pedido}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={!!checks[p.nr_pedido]}
                      disabled={!canExpedir}
                      onChange={(e) => {
                        if (!canExpedir) return;
                        const c = { ...checks };
                        c[p.nr_pedido] = e.target.checked;
                        setChecks(c);
                      }}
                    />
                    <div>
                      <div><strong>#{p.nr_pedido}</strong> — {p.cliente} → {p.destino}</div>
                      <small style={{ opacity: 0.8 }}>
                        Conferente: {p.conferente || p?.primeiraConferencia?.colaborador || "—"}
                      </small>
                    </div>
                  </div>
                  <div style={{ minWidth: 200 }}>
                    <label style={{ fontSize: 12, opacity: 0.8 }}>Nota (NF) — opcional</label>
                    <Field
                      value={notas[p.nr_pedido] || ""}
                      disabled={!canExpedir}
                      onChange={(e) => {
                        const n = { ...notas };
                        n[p.nr_pedido] = e.target.value;
                        setNotas(n);
                      }}
                      placeholder="Ex: 12345"
                    />
                  </div>
                </Item>
              ))}
            </List>
          </>
        )}

        <Footer>
          <Button color="secondary" onClick={onClose} disabled={busy}>Fechar</Button>
          <Button
            color="success"
disabled={!canExpedir || selecionados.length === 0 || busy}
            onClick={async () => {
              if (!canExpedir || selecionados.length === 0) return;
              try {
                setBusy(true);
                await onConfirm(selecionados);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Expedindo..." : `Expedir selecionados (${selecionados.length})`}
          </Button>
        </Footer>
      </ModalBody>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;

const ModalBody = styled.div`
  width: min(960px, 96vw);
  max-height: 86vh;
  overflow: auto;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.2);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TopBar = styled.div`
  margin: 8px 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const List = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
`;

const Item = styled.div`
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 12px;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  &:last-child { border-bottom: 0; }
`;

const Footer = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Warn = styled.div`
  background: #fff3cd;
  color: #664d03;
  border: 1px solid #ffecb5;
  padding: 8px 10px;
  border-radius: 8px;
  margin: 8px 0;
`;

const Empty = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  color: #475569;
  font-size: 14px;
`;
