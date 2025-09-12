import React, { useState } from "react";
import { Button } from "reactstrap";
import { ModalOverlay, ModalBox, Field, Actions, Help } from "../style";
import { FiSave, FiX } from "react-icons/fi";
import { Spinner } from "../../components/Loader";

/**
 * Props:
 * - onCancel: () => void
 * - onSubmit: ({ id?: string, nome: string }) => void
 *   - Se o back gerar o id, você pode ignorar o campo id no submit.
 * - validateName?: (nome: string) => string | null   // retorna string com erro ou null se ok
 */
export default function ModalAddSetor({ onCancel, onSubmit, validateName }) {
  const [nome, setNome] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    const trimmed = nome.trim();
    if (!trimmed) {
      setError("O nome do setor é obrigatório.");
      return;
    }
    if (validateName) {
      const e = validateName(trimmed);
      if (e) {
        setError(e);
        return;
      }
    }
    // Se o backend que gera o id, remova o id daqui e envie apenas { nome }
    (async () => {
      try {
        setSaving(true);
        await onSubmit?.({ nome: trimmed }); // id é do back
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <ModalOverlay onMouseDown={onCancel}>
      <ModalBox onMouseDown={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Novo setor</h3>

        <Field>
          <label>Nome do setor *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setError(null);
            }}
            placeholder="Ex.: Financeiro, Jurídico, Comercial…"
          />
          {error && <small style={{ color: "#ef4444" }}>{error}</small>}
        </Field>

        <Help>
          Dica de API: envie <code>{`{ nome }`}</code> em um{" "}
          <b>POST /setor/setores</b>. O backend deve retornar{" "}
          <code>{`{ id, nome }`}</code>.
        </Help>

        <Actions>
          <Button color="secondary" onClick={onCancel} disabled={saving}>
            <FiX style={{ marginRight: 6 }} />
            Cancelar
          </Button>
          <Button color="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Spinner size={14} />
            ) : (
              <FiSave style={{ marginRight: 6 }} />
            )}
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </Actions>
      </ModalBox>
    </ModalOverlay>
  );
}
