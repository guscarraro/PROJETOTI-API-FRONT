// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/CommentList/index.js
import React from "react";
import styled from "styled-components";
import { CommentBubble, DeleteCommentBtn, SectorDot } from "../../../../style";
import { FiTrash2 } from "react-icons/fi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { SiMicrosoftexcel } from "react-icons/si";
import { toast } from "react-toastify";
import { parseMessageParts, openDataUrlInNewTab } from "../utils";
import InlineSpinner from "../InlineSpinner";

const RichHtml = styled.div`
  font-size: 14px;
  color: inherit;
  white-space: pre-wrap; /* <<< preserva quebras (\n) */
  ul, ol { padding-left: 20px; margin: 6px 0; }
  li { margin: 2px 0; }
  p, div { margin: 4px 0; }
  .sector-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 2px 8px; border-radius: 999px;
    border: 1px solid rgba(0,0,0,.08);
    background: #f3f4f6; color: inherit;
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

// pega só o HTML antes do primeiro ",data:" (anexos vêm depois)
function extractHtmlFromMessage(msg) {
  const s = String(msg || "");
  const i = s.indexOf(",data:");
  return (i >= 0 ? s.slice(0, i) : s).trim();
}

export default function CommentList({
  comments = [],
  palette,
  setPalette,
  canDeleteCommentCell,
  onDeleteComment,
  setImgPreview,
  deletingId,
  setDeletingId,
}) {
  return (
    <>
      {Array.isArray(comments) &&
        comments
          .filter((c) => !c?.deleted)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map((c) => {
            const canDeleteThis = !!canDeleteCommentCell(palette.rowId, palette.dayISO, c);
            const raw = String(c.message || "");
            const parts = parseMessageParts(raw);
            const html = extractHtmlFromMessage(raw);
            const htmlWithBR = html.replace(/(\r\n|\n|\r)/g, "<br/>"); // <<< garante \n como <br/>

            return (
              <div
                key={c.id}
                style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "6px 0" }}
              >
                <SectorDot $color="#111827">
                  {(c.authorInitial || "U").toUpperCase()}
                </SectorDot>

                <CommentBubble>
                  <div
                    style={{
                      fontSize: 11, opacity: 0.7, marginBottom: 2,
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    {new Date(c.created_at).toLocaleString()}
                    {canDeleteThis && (
                      <DeleteCommentBtn
                        onClick={async () => {
                          try {
                            setDeletingId(c.id);
                            await onDeleteComment?.(palette.rowId, palette.dayISO, c.id);
                            setPalette((prev) => {
                              if (!prev) return prev;
                              const filtered = (prev.comments || []).filter(
                                (x) => String(x.id) !== String(c.id)
                              );
                              return { ...prev, comments: filtered };
                            });
                          } catch (err) {
                            const s = err?.response?.status;
                            const d = err?.response?.data?.detail;
                            if (s === 403) toast.error("Sem permissão para excluir este comentário.");
                            else if (s === 423) toast.error("Projeto bloqueado. Ação não permitida.");
                            else toast.error(d || "Falha ao excluir comentário.");
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        title="Apagar comentário"
                        disabled={deletingId === c.id}
                        aria-busy={deletingId === c.id}
                      >
                        {deletingId === c.id ? <InlineSpinner size={14} /> : <FiTrash2 />}
                      </DeleteCommentBtn>
                    )}
                  </div>

                  {html && <RichHtml dangerouslySetInnerHTML={{ __html: htmlWithBR }} />}

                  {parts.images.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      {parts.images.map(({ src, name }, idx) => (
                        <img
                          key={`${c.id}-img-${idx}`}
                          src={src}
                          alt={name}
                          title={name}
                          style={{
                            width: 96, height: 72, objectFit: "cover",
                            borderRadius: 8, cursor: "pointer", border: "1px solid rgba(0,0,0,.08)",
                          }}
                          onClick={() => setImgPreview(src)}
                        />
                      ))}
                    </div>
                  )}

                  {parts.pdfs.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      {parts.pdfs.map(({ src, name }, idx) => (
                        <button
                          key={`${c.id}-pdf-${idx}`}
                          type="button"
                          onClick={() => openDataUrlInNewTab(src, name, false)}
                          title={`Abrir ${name}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "8px 10px", borderRadius: 8,
                            border: "1px solid rgba(0,0,0,.08)", background: "#fff", cursor: "pointer",
                          }}
                        >
                          <AiOutlineFilePdf size={18} color="#ef4444" />
                          <span
                            style={{
                              fontSize: 12, maxWidth: 180, overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            {name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {parts.sheets.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      {parts.sheets.map(({ src, name }, idx) => (
                        <button
                          key={`${c.id}-xls-${idx}`}
                          type="button"
                          onClick={() => openDataUrlInNewTab(src, name, true)}
                          title={`Baixar ${name}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "8px 10px", borderRadius: 8,
                            border: "1px solid rgba(0,0,0,.08)", background: "#fff", cursor: "pointer",
                          }}
                        >
                          <SiMicrosoftexcel size={18} color="#16a34a" />
                          <span
                            style={{
                              fontSize: 12, maxWidth: 180, overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            {name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </CommentBubble>
              </div>
            );
          })}
    </>
  );
}
