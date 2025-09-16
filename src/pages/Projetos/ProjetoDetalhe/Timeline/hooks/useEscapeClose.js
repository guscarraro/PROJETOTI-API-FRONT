// pages/ProjetoDetalhe/Timeline/hooks/useEscapeClose.js
import { useEffect } from "react";

export default function useEscapeClose(onEscape) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onEscape(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEscape]);
}
