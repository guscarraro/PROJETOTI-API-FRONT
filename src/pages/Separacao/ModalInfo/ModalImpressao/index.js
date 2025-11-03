import React, { useMemo, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { SmallMuted, Field, TinyBtn } from "../../style";

export default function ModalImpressao({ isOpen, onClose, onConfirm }) {
  const [caixas, setCaixas] = useState([{ tipo: "PEQUENA", peso: "" }]);

  function addCaixa() {
    const next = caixas.slice();
    next.push({ tipo: "PEQUENA", peso: "" });
    setCaixas(next);
  }
  function removeCaixa(idx) {
    if (caixas.length === 1) return;
    const next = [];
    for (let i = 0; i < caixas.length; i++) {
      if (i !== idx) next.push(caixas[i]);
    }
    setCaixas(next);
  }
  function update(idx, key, value) {
    const next = caixas.slice();
    next[idx] = { ...next[idx], [key]: value };
    setCaixas(next);
  }

  const totalCaixas = caixas.length;
  const pesoTotal = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < caixas.length; i++) {
      const n = Number(String(caixas[i]?.peso || "").replace(",", "."));
      if (!isNaN(n)) sum += n;
    }
    return sum;
  }, [caixas]);

  function confirmar() {
    // normaliza números (sem reduce)
    const out = [];
    for (let i = 0; i < caixas.length; i++) {
      const c = caixas[i] || {};
      const tipo = String(c.tipo || "PEQUENA").toUpperCase();
      const n = Number(String(c.peso || "").replace(",", "."));
      out.push({ tipo, peso: isNaN(n) ? 0 : n });
    }
    onConfirm({ caixas: out }); // quem chama injeta conferente
  }

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="md" contentClassName="project-modal">
      <ModalHeader toggle={onClose}>Imprimir Etiquetas</ModalHeader>
      <ModalBody>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
            <div><SmallMuted>Total de caixas</SmallMuted><div style={{ fontWeight: 800, fontSize: 18 }}>{totalCaixas}</div></div>
            <div><SmallMuted>Peso total</SmallMuted><div style={{ fontWeight: 800 }}>{pesoTotal.toFixed(2)} kg</div></div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {caixas.map((cx, idx) => (
              <div key={idx} style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 10,
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 8,
                alignItems: "center"
              }}>
                <div>
                  <SmallMuted>Tipo da caixa</SmallMuted>
                  <select
                    value={cx.tipo}
                    onChange={(e) => update(idx, "tipo", e.target.value)}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                  >
                    <option value="PEQUENA">Pequena</option>
                    <option value="MEDIA">Média</option>
                    <option value="GRANDE">Grande</option>
                    <option value="GIGANTE">Gigante</option>
                  </select>
                </div>

                <div>
                  <SmallMuted>Peso (kg)</SmallMuted>
                  <Field
                    value={cx.peso}
                    onChange={(e) => update(idx, "peso", e.target.value)}
                    placeholder="Ex.: 8.5"
                  />
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <TinyBtn onClick={() => removeCaixa(idx)} disabled={caixas.length === 1}>Remover</TinyBtn>
                </div>
              </div>
            ))}
          </div>

          <div>
            <TinyBtn onClick={addCaixa}>+ Adicionar caixa</TinyBtn>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>Cancelar</Button>
        <Button color="primary" onClick={confirmar}>Gerar etiquetas</Button>
      </ModalFooter>
    </Modal>
  );
}
