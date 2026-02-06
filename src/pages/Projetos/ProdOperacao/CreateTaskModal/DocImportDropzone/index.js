import React, { useRef } from "react";
import { DropZone } from "../style";

export default function DocImportDropzone({ disabled, onFiles }) {
  const inputRef = useRef(null);

  const pickFiles = () => {
    if (disabled) return;
    if (inputRef.current) inputRef.current.click();
  };

  const onInputChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (disabled) return;

    const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length) onFiles(files);
  };

  return (
    <>
      <DropZone
        role="button"
        tabIndex={0}
        onClick={pickFiles}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        aria-disabled={disabled ? "true" : "false"}
        style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
        title="Clique para selecionar ou arraste arquivos"
      >
        Solte aqui (.xml ou .zip) ou clique para selecionar
      </DropZone>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".xml,.zip,application/xml,application/zip"
        onChange={onInputChange}
        style={{ display: "none" }}
        disabled={disabled}
      />
    </>
  );
}
