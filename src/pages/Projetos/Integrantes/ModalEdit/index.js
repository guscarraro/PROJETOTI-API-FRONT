import React, { useState } from "react";
import { ModalBg, ModalBox, ModalHeader, Form, Input, BtnSave } from "../modalStyle";
import apiLocal from "../../../../services/apiLocal";

export default function ModalEdit({ integrante, onClose, onSave }) {
  const [form, setForm] = useState(integrante);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // await apiLocal.updateIntegrante(form.id, form);
    await apiLocal.updateIntegrante(form.id, form);

    onSave();
    onClose();
  };

  return (
    <ModalBg>
      <ModalBox>
        <ModalHeader>
          <h3>Editar Integrante</h3>
          <button onClick={onClose}>×</button>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <label>Nome</label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <label>Sobrenome</label>
          <Input value={form.sobrenome} onChange={(e) => setForm({ ...form, sobrenome: e.target.value })} required />
          <label>CPF</label>
          <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} required />

          <BtnSave type="submit">Salvar Alterações</BtnSave>
        </Form>
      </ModalBox>
    </ModalBg>
  );
}
