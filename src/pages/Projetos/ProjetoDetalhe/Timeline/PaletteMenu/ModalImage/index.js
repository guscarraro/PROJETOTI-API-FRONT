// src/pages/Projetos/ProjetoDetalhe/Timeline/ModalImage/index.js
import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function ModalImage({ isOpen, src, alt = "visualização", onClose }) {
  // Efeito: ESC fecha + trava/destrava o scroll do body enquanto o modal está aberto
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2005,
        background: "rgba(0,0,0,.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Botão fechar */}
      <button
        type="button"
        onClick={onClose}
        title="Fechar"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,.25)",
          background: "rgba(0,0,0,.4)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <FiX size={18} />
      </button>

      {/* Conteúdo (impede o clique de fechar) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "95vw", maxHeight: "90vh" }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: "95vw",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
            display: "block",
            borderRadius: 12,
            boxShadow: "0 20px 60px rgba(0,0,0,.5)",
            cursor: "zoom-out",
          }}
          onClick={onClose}
          draggable={false}
        />
      </div>
    </div>
  );
}
