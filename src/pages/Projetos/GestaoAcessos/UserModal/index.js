// src/pages/Projetos/GestaoAcessos/UserModal.js
import React, { useState } from "react";
import { Button } from "reactstrap";
import { ModalOverlay, ModalBox, Field, Actions, Help } from "../style";
import { FiMail, FiKey, FiSave, FiX } from "react-icons/fi";

// UUID do perfil Admin (apenas para exibir na dica abaixo)
const ADMIN_UUID = "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";

export default function UserModal({ title, initialEmail = "", onCancel, onSubmit }) {
  const [email, setEmail] = useState(initialEmail);
  const [senha, setSenha] = useState("");

  const handleSave = () => {
    onSubmit?.({
      email: email.trim(),
      senha: senha.trim(), // no PUT, envie somente se quiser trocar a senha (backend aplica bcrypt)
      setores: [],         // os setores são definidos/alterados na tela principal
    });
  };

  return (
    <ModalOverlay onMouseDown={onCancel}>
      <ModalBox onMouseDown={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h3>

        <Field>
          <label>
            <FiMail style={{ marginRight: 6 }} />
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@empresa.com"
          />
        </Field>

        <Field>
          <label>
            <FiKey style={{ marginRight: 6 }} />
            Senha{" "}
            {initialEmail && (
              <small style={{ opacity: 0.7 }}>(deixe em branco para não alterar)</small>
            )}
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <Help>
          Dica de API: ao salvar, envie um JSON no <b>POST/PUT</b> com
          <br />
          <code>{`{ email, senha?, setores: [uuid...], tipo: (inclua ${ADMIN_UUID} para admin) }`}</code>
          <br />
          O backend deve guardar a senha usando <b>bcrypt</b>.
        </Help>

        <Actions>
          <Button color="secondary" onClick={onCancel}>
            <FiX style={{ marginRight: 6 }} />
            Cancelar
          </Button>
          <Button color="primary" onClick={handleSave}>
            <FiSave style={{ marginRight: 6 }} />
            Salvar
          </Button>
        </Actions>
      </ModalBox>
    </ModalOverlay>
  );
}
