// src/pages/Projetos/components/ModalDemanda.js
import React, { useEffect, useState } from "react";
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input
} from "reactstrap";
import { MODAL_CLASS } from "../../style";

export default function ModalDemanda({
  isOpen,
  toggle,
  onConfirm,                 // ({ titulo, sectorKeys }) => void
  sectorOptions = [],        // [{key, label}]
}) {
  const [titulo, setTitulo] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (isOpen) { setTitulo(""); setSelected([]); }
  }, [isOpen]);

  const toggleKey = (k) =>
    setSelected((prev) => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);

  const handleSave = () => {
    if (!titulo.trim()) return alert("Informe o descritivo da demanda.");
    onConfirm?.({ titulo: titulo.trim(), sectorKeys: selected });
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="md"
      contentClassName={MODAL_CLASS}   // <- dark mode
    >
      <ModalHeader toggle={toggle}>Nova demanda</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>Título / Descritivo</Label>
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Levantar requisitos do módulo X"
          />
        </FormGroup>

        <FormGroup>
          <Label>Setores responsáveis (opcional)</Label>
          {sectorOptions.length === 0 ? (
            <div style={{ fontSize: 12, opacity: .7 }}>
              Nenhum setor participante definido para este projeto.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {sectorOptions.map((opt) => (
                <label key={opt.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.key)}
                    onChange={() => toggleKey(opt.key)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Cancelar</Button>
        <Button color="primary" onClick={handleSave}>Criar demanda</Button>
      </ModalFooter>
    </Modal>
  );
}
