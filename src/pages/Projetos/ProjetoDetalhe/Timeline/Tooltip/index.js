// src/pages/Projetos/ProjetoDetalhe/Timeline/Tooltip.jsx
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { TooltipBox, SectorDot } from "../../../style";
import { parseMessageParts } from "../PaletteMenu/utils";

const RichHtml = styled.div`
  font-size: 13px;
  color: inherit;
  white-space: pre-wrap; /* <<< preserva quebras (\n) */
  ul, ol { padding-left: 20px; margin: 6px 0; }
  li { margin: 2px 0; }
  p, div { margin: 4px 0; }
  .sector-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 2px 8px; border-radius: 999px;
    border: 1px solid rgba(0,0,0,.08);
    background: #f3f4f6; color: grey;
    font-size: 12px; line-height: 18px; margin-right: 4px; white-space: nowrap;
  }
  .sector-pill .dot {
    width: 8px; height: 8px; border-radius: 999px;
    background: var(--pill-color, #9ca3af);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
  }
  @media (prefers-color-scheme: dark) { .sector-pill { background: #111a2d; border-color: #334155; } }
  .dark & .sector-pill, [data-theme="dark"] & .sector-pill { background: #111a2d; border-color: #334155; }
`;

// mesmo extrator simples (pega HTML antes do primeiro ",data:")
function extractHtmlFromMessage(msg) {
  const s = String(msg || "");
  const i = s.indexOf(",data:");
  return (i >= 0 ? s.slice(0, i) : s).trim();
}

export default function Tooltip({ tooltip }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, ready: false });

  const raw = String(tooltip?.text || "");
  const parts = useMemo(() => parseMessageParts(raw), [raw]);
  const html = useMemo(() => extractHtmlFromMessage(raw), [raw]);
  const htmlWithBR = useMemo(() => html.replace(/(\r\n|\n|\r)/g, "<br/>"), [html]); // <<< garante \n como <br/>

  useLayoutEffect(() => {
    if (!tooltip) return;
    const GAP = 12;
    const MARGIN = 8;

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
        top = tooltip.y - h - GAP;
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

      {html && <RichHtml dangerouslySetInnerHTML={{ __html: htmlWithBR }} />}

      {(imgCount > 0 || pdfCount > 0 || xlsCount > 0) && (
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85, display: "grid", gap: 2 }}>
          {imgCount > 0 && (
            <div>
              + {imgCount} {imgCount > 1 ? "imagens" : "imagem"} anexada{imgCount > 1 ? "s" : ""}
            </div>
          )}
          {pdfCount > 0 && (
            <div>
              + {pdfCount} {pdfCount > 1 ? "PDFs" : "PDF"} anexado{pdfCount > 1 ? "s" : ""}
            </div>
          )}
          {xlsCount > 0 && (
            <div>
              + {xlsCount} {xlsCount > 1 ? "planilhas" : "planilha"} anexada{xlsCount > 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </TooltipBox>
  );
}
