import React, { useState } from "react";
import { ModalBg, ModalBox, ModalHeader, Form, Input, BtnSave } from "../modalStyle";
import apiLocal from "../../../../services/apiLocal";

export default function ModalCreate({ onClose, onSave }) {
  const [form, setForm] = useState({ nome: "", sobrenome: "", cpf: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // await apiLocal.createIntegrante(form);
    await apiLocal.createIntegrante(form);

    onSave();
    onClose();
  };

  return (
    <ModalBg>
      <ModalBox>
        <ModalHeader>
          <h3>Novo Integrante</h3>
          <button onClick={onClose}>×</button>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <label>Nome</label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <label>Sobrenome</label>
          <Input value={form.sobrenome} onChange={(e) => setForm({ ...form, sobrenome: e.target.value })} required />
          <label>CPF</label>
          <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} required />

          <BtnSave type="submit">Salvar</BtnSave>
        </Form>
      </ModalBox>
    </ModalBg>
  );
}
