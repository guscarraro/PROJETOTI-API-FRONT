// src/pages/Projetos/components/ModalDemanda.js
import React, { useEffect, useState } from "react";
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input
} from "reactstrap";
import { MODAL_CLASS } from "../../style";

export default function ModalDemanda({
  isOpen,
  toggle,
  onConfirm,
  sectorOptions = [],
}) {
  const [titulo, setTitulo] = useState("");
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitulo("");
      setSelected([]);
      setSubmitting(false);
    }
  }, [isOpen]);

  const toggleKey = (k) =>
    setSelected((prev) => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);

  const handleSave = async () => {
    if (!titulo.trim()) return alert("Informe o descritivo da demanda.");
    try {
      setSubmitting(true);
      await onConfirm?.({ titulo: titulo.trim(), sectorKeys: selected });
      toggle();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="md"
      contentClassName={MODAL_CLASS}
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
        <Button color="secondary" onClick={toggle} disabled={submitting}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSave} disabled={submitting}>
          {submitting ? "Criando..." : "Criar demanda"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
