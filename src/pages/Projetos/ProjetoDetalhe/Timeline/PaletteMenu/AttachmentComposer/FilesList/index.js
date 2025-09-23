// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/AttachmentComposer/components/FilesList.js
import React from "react";
import { FiPaperclip } from "react-icons/fi";
import { AttachBtn } from "../style";

export default function FilesList({ fileInputRef, onPickFile, disabled }) {
  return (
    <>
      <AttachBtn
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Anexar arquivo (imagem/PDF/Excel)"
        disabled={disabled}
      >
        <FiPaperclip size={16} />
      </AttachBtn>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,.xlsx"
        onChange={onPickFile}
        style={{ display: "none" }}
      />
    </>
  );
}
