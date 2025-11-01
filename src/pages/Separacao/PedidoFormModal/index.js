import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Field, TextArea, SmallMuted, TinyBtn } from "../style";
import { STATUS_PEDIDO } from "../constants";

export default function PedidoFormModal({ isOpen, onClose, onSubmit }) {
  const [cliente, setCliente] = useState("");
  const [nr, setNr] = useState("");
  const [destino, setDestino] = useState("");
  const [transportador, setTransportador] = useState("");
  const [separador, setSeparador] = useState("");
  const [itens, setItens] = useState([{ cod_prod: "", qtde: "", um_med: "" }]);

  const addItem = () =>
    setItens((v) => [...v, { cod_prod: "", qtde: "", um_med: "" }]);

  const setItem = (idx, key, val) => {
    const next = [];
    for (let i = 0; i < itens.length; i++) {
      if (i === idx) next.push({ ...itens[i], [key]: val });
      else next.push(itens[i]);
    }
    setItens(next);
  };

  const removeItem = (idx) => {
    const next = [];
    for (let i = 0; i < itens.length; i++) {
      if (i !== idx) next.push(itens[i]);
    }
    setItens(next);
  };

  const handleSubmit = () => {
    if (!nr || !cliente || !destino) return;

    const sane = [];
    for (let i = 0; i < itens.length; i++) {
      const it = itens[i];
      if (!it.cod_prod) continue;
      const q = Number(it.qtde || 0);
      sane.push({
        cod_prod: it.cod_prod,
        qtde: isNaN(q) ? 0 : q,
        um_med: it.um_med || "",
      });
    }
    if (!sane.length) return;

    const pedido = {
      nr_pedido: String(nr),
      cliente: cliente.trim(),
      destino: destino.trim(),
      transportador: (transportador || "").trim() || null,
      separador: (separador || "").trim() || null,
      itens: sane,
      status: STATUS_PEDIDO.PENDENTE,
      created_at: new Date().toISOString(),
      logs: [],
    };
    onSubmit(pedido);

    // reset
    setCliente("");
    setNr("");
    setDestino("");
    setTransportador("");
    setSeparador("");
    setItens([{ cod_prod: "", qtde: "", um_med: "" }]);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="project-modal">
      <ModalHeader toggle={onClose}>Novo Pedido Manual</ModalHeader>
      <ModalBody>
        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <SmallMuted>Cliente *</SmallMuted>
            <Field value={cliente} onChange={(e) => setCliente(e.target.value)} />
          </div>
          <div>
            <SmallMuted>Nº do Pedido *</SmallMuted>
            <Field value={nr} onChange={(e) => setNr(e.target.value)} />
          </div>
          <div>
            <SmallMuted>Destino *</SmallMuted>
            <Field value={destino} onChange={(e) => setDestino(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <SmallMuted>Transportadora (opcional)</SmallMuted>
              <Field value={transportador} onChange={(e) => setTransportador(e.target.value)} />
            </div>
            <div>
              <SmallMuted>Separador (opcional)</SmallMuted>
              <Field value={separador} onChange={(e) => setSeparador(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <strong>Itens</strong>
            <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
              {itens.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr .6fr .6fr auto",
                    gap: 6,
                  }}
                >
                  <Field
                    placeholder="cod_prod *"
                    value={it.cod_prod}
                    onChange={(e) => setItem(idx, "cod_prod", e.target.value)}
                  />
                  <Field
                    placeholder="qtde *"
                    value={it.qtde}
                    onChange={(e) => setItem(idx, "qtde", e.target.value)}
                  />
                  <Field
                    placeholder="um_med"
                    value={it.um_med}
                    onChange={(e) => setItem(idx, "um_med", e.target.value)}
                  />
                  <TinyBtn onClick={() => removeItem(idx)}>Remover</TinyBtn>
                </div>
              ))}
              <TinyBtn onClick={addItem}>+ Adicionar item</TinyBtn>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          Criar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
