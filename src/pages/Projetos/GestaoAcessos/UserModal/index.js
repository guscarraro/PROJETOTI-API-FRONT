// src/pages/Projetos/GestaoAcessos/UserModal.js
import React, { useMemo, useState } from "react";
import { Button } from "reactstrap";
import { ModalOverlay, ModalBox, Field, Actions, Help } from "../style";
import { FiMail, FiKey, FiSave, FiX } from "react-icons/fi";

/**
 * Props:
 * - title: string ("Novo usuário" | "Editar usuário")
 * - initialEmail?: string
 * - setoresOptions: Array<{ id: number|string, nome: string }>
 * - initialSetorIds?: Array<number|string>
 * - onCancel: () => void
 * - onSubmit: (payload) => void
 *   payload = { email, senha?, setor_ids: number[] }
 */
export default function UserModal({
  title,
  initialEmail = "",
  setoresOptions = [],
  initialSetorIds = [],
  onCancel,
  onSubmit,
}) {
  const isEdit = useMemo(() => !!initialEmail, [initialEmail]);

  const [email, setEmail] = useState(initialEmail);
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [setorIdsSel, setSetorIdsSel] = useState(
    (initialSetorIds || []).map(String)
  );
  const [errors, setErrors] = useState({});

  const toggleSetor = (id) => {
    const sid = String(id);
    setSetorIdsSel((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  };

  const validate = () => {
    const e = {};

    if (!email.trim()) e.email = "E-mail é obrigatório.";

    // criação: senha obrigatória; edição: opcional
    if (!isEdit) {
      if (!senha.trim()) e.senha = "Senha é obrigatória.";
      if (!confirmSenha.trim()) e.confirm = "Confirme a senha.";
    }
    if (senha.trim() || confirmSenha.trim()) {
      if (senha.trim().length < 6)
        e.senha = "Senha deve ter ao menos 6 caracteres.";
      if (senha.trim() !== confirmSenha.trim())
        e.confirm = "As senhas não conferem.";
    }

    if (!Array.isArray(setorIdsSel) || setorIdsSel.length === 0) {
      e.setores = "Selecione ao menos um setor.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const setor_ids = setorIdsSel.map((v) =>
      typeof v === "string" && /^\d+$/.test(v) ? parseInt(v, 10) : Number(v)
    );

    onSubmit?.({
      email: email.trim(),
      ...(senha.trim() ? { senha: senha.trim() } : {}),
      setor_ids,
    });
  };

  return (
    <ModalOverlay onMouseDown={onCancel}>
      <ModalBox
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          maxHeight: "90vh",
          width: "min(92vw, 720px)",
          maxWidth: 720,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h3>

        {/* Conteúdo rolável para modais longos */}
        <div
          style={{
            overflowY: "auto",
            paddingRight: 8, // respiro pro scrollbar
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Field>
            <label>
              <FiMail style={{ marginRight: 6 }} />
              E-mail
            </label>
            <input
              autoComplete="username"
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@empresa.com"
            />
            {errors.email && (
              <small style={{ color: "#ef4444" }}>{errors.email}</small>
            )}
          </Field>

          <Field>
            <label>
              <FiKey style={{ marginRight: 6 }} />
              Senha{" "}
              {isEdit && (
                <small style={{ opacity: 0.7 }}>
                  (deixe em branco para não alterar)
                </small>
              )}
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
            {errors.senha && (
              <small style={{ color: "#ef4444" }}>{errors.senha}</small>
            )}
          </Field>

          <Field>
            <label>
              <FiKey style={{ marginRight: 6 }} />
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              placeholder="••••••••"
            />
            {errors.confirm && (
              <small style={{ color: "#ef4444" }}>{errors.confirm}</small>
            )}
          </Field>

          {/* Setores (checkboxes) em linha com quebra */}
          <Field>
            <label>Setores *</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              {setoresOptions.map((s) => {
                const sid = String(s.id);
                const checked = setorIdsSel.includes(sid);
                return (
                  <label
                    key={sid}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSetor(sid)}
                      style={{ margin: 0 }}
                    />
                    <span>{s.nome}</span>
                  </label>
                );
              })}
            </div>
            {errors.setores && (
              <small style={{ color: "#ef4444" }}>{errors.setores}</small>
            )}
          </Field>

          <Help>
            Envie no POST/PUT: <code>{`{ email, senha?, setor_ids: [ids...] }`}</code>
            <br />
            (Dark mode é controlado apenas pelo botão no NavBar.)
          </Help>
        </div>

        {/* Ações fixas no rodapé do modal */}
        <Actions
          style={{
            marginTop: 12,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            paddingTop: 12,
            position: "sticky",
            bottom: 0,
            background: "var(--modal-bg, inherit)",
          }}
        >
          <Button color="secondary" size="sm" onClick={onCancel}>
            <FiX style={{ marginRight: 6 }} />
            Cancelar
          </Button>
          <Button color="primary" size="sm" onClick={handleSave}>
            <FiSave style={{ marginRight: 6 }} />
            Salvar
          </Button>
        </Actions>
      </ModalBox>
    </ModalOverlay>
  );
}
