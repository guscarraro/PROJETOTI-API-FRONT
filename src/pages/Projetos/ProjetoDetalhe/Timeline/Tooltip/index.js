// src/pages/Projetos/ProjetoDetalhe/Timeline/Tooltip.jsx
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { TooltipBox, SectorDot } from "../../../style";
import { parseMessageParts } from "../PaletteMenu/utils";

export default function Tooltip({ tooltip }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, ready: false });

  // usa o parser unificado (texto + imagens + pdfs + sheets)
  const parts = useMemo(
    () => parseMessageParts(String(tooltip?.text || "")),
    [tooltip?.text]
  );

  useLayoutEffect(() => {
    if (!tooltip) return;
    const GAP = 12; // distância do cursor
    const MARGIN = 8; // margem da viewport

    let left = tooltip.x + GAP;
    let top = tooltip.y + GAP;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // mede fora da tela para evitar flicker
    setPos({ left: -9999, top: -9999, ready: false });

    requestAnimationFrame(() => {
      const el = ref.current;
      const w = el ? el.offsetWidth : 260;
      const h = el ? el.offsetHeight : 120;

      // clamp horizontal
      if (left + w > vw - MARGIN) left = Math.max(MARGIN, vw - w - MARGIN);

      // flip/clamp vertical
      if (top + h > vh - MARGIN) {
        top = tooltip.y - h - GAP; // sobe
        if (top < MARGIN) top = Math.max(MARGIN, vh - h - MARGIN);
      }

      setPos({ left, top, ready: true });
    });
  }, [tooltip]);

  if (!tooltip) return null;

  const imgCount = parts.images?.length || 0;
  const pdfCount = parts.pdfs?.length || 0;
  const xlsCount = parts.sheets?.length || 0;

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
        <SectorDot $color="#111827">
          {(tooltip.authorInitial || "U").toUpperCase()}
        </SectorDot>
        <strong>Comentário</strong>
      </div>

      {/* texto limpo (sem data URLs) */}
      {parts.text && (
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {parts.text}
        </div>
      )}

      {/* avisos de anexos (sem base64 no corpo) */}
      {(imgCount > 0 || pdfCount > 0 || xlsCount > 0) && (
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85, display: "grid", gap: 2 }}>
          {imgCount > 0 && (
            <div>
              + {imgCount} {imgCount > 1 ? "imagens" : "imagem"} anexada
              {imgCount > 1 ? "s" : ""}
            </div>
          )}
          {pdfCount > 0 && (
            <div>
              + {pdfCount} {pdfCount > 1 ? "PDFs" : "PDF"} anexado
              {pdfCount > 1 ? "s" : ""}
            </div>
          )}
          {xlsCount > 0 && (
            <div>
              + {xlsCount} {xlsCount > 1 ? "planilhas" : "planilha"} anexada
              {xlsCount > 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </TooltipBox>
  );
}
