// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/AttachmentComposer/components/EditableArea.js
import React from "react";
import { Editable } from "../style";

export default function EditableArea({
  editorRef,
  disabled,
  onInput,
  onBlur,
  onPaste,
  onKeyDown,
  onMouseUp,
  onKeyUp,
}) {
  return (
    <Editable
      ref={editorRef}
      contentEditable={!disabled}
      role="textbox"
      aria-multiline="true"
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
      inputMode="text"
      onInput={onInput}
      onBlur={onBlur}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
      onMouseUp={onMouseUp}
      onKeyUp={onKeyUp}
      title={disabled ? "Comentários desativados" : "Digite aqui. Toolbar acima. '@' para marcar setor."}
      style={{ caretColor: disabled ? "transparent" : undefined }}
    />
  );
}
