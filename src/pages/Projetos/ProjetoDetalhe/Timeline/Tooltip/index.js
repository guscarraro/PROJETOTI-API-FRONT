// src/pages/Projetos/ProjetoDetalhe/Timeline/Tooltip.jsx
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { TooltipBox, SectorDot } from "../../../style";

/* helper: separa texto e imagens (base64) */
function parseMessageParts(message) {
  const out = { text: "", images: [] };
  if (!message || typeof message !== "string") return out;

  // separa apenas nos pontos onde começam data URLs de imagem
  const parts = message.split(/,\s*(?=data:image\/[a-zA-Z0-9.+-]+;base64,)/);

  const textParts = [];
  for (let i = 0; i < parts.length; i++) {
    const raw = parts[i];
    const p = raw.trim();
    if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(p)) {
      out.images.push(p);
    } else {
      textParts.push(raw); // preserva vírgulas normais
    }
  }
  out.text = textParts.join(",");
  return out;
}

export default function Tooltip({ tooltip }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, ready: false });

  // 🔽 parse do conteúdo para remover base64 do texto e contar imagens
  const parts = useMemo(
    () => parseMessageParts(String(tooltip?.text || "")),
    [tooltip?.text]
  );

  useLayoutEffect(() => {
    if (!tooltip) return;
    const GAP = 12;      // distância do cursor
    const MARGIN = 8;    // margem da viewport

    let left = tooltip.x + GAP;
    let top = tooltip.y + GAP;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    setPos({ left: -9999, top: -9999, ready: false });

    requestAnimationFrame(() => {
      const el = ref.current;
      const w = el ? el.offsetWidth : 260;
      const h = el ? el.offsetHeight : 120;

      if (left + w > vw - MARGIN) left = Math.max(MARGIN, vw - w - MARGIN);

      if (top + h > vh - MARGIN) {
        top = tooltip.y - h - GAP; // sobe
        if (top < MARGIN) top = Math.max(MARGIN, vh - h - MARGIN);
      }

      setPos({ left, top, ready: true });
    });
  }, [tooltip]);

  if (!tooltip) return null;

  return (
    <TooltipBox
      ref={ref}
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        visibility: pos.ready ? "visible" : "hidden",
        maxHeight: "calc(100vh - 24px)",
        overflowY: "auto",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <SectorDot $color="#111827">{(tooltip.authorInitial || "U").toUpperCase()}</SectorDot>
        <strong>Comentário</strong>
      </div>

      {/* texto sem base64 */}
      {parts.text && (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {parts.text}
        </div>
      )}

      {/* indicador de imagens anexadas */}
      {parts.images.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
          + {parts.images.length} {parts.images.length > 1 ? "imagens" : "imagem"} anexada
          {parts.images.length > 1 ? "s" : ""}
        </div>
      )}
    </TooltipBox>
  );
}
