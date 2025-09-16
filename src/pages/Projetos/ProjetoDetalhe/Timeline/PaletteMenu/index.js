import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Palette,
  ColorsRow,
  ColorDot,
  ClearBtn,
  ActionsRow,
  CommentBubble,
  DeleteCommentBtn,
  SectorDot,
  BaselineMark,
} from "../../../style";
import { Button } from "reactstrap";
import { FiTrash2, FiFlag, FiPaperclip, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import ModalImage from "./ModalImage";

/* ===== helpers para (de)compor message com base64 ===== */
function parseMessageParts(message) {
  const out = { text: "", images: [] };
  if (!message || typeof message !== "string") return out;

  const parts = message.split(/,\s*(?=data:image\/[a-zA-Z0-9.+-]+;base64,)/);

  const textParts = [];
  for (let i = 0; i < parts.length; i++) {
    const raw = parts[i];
    const p = raw.trim();
    if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(p)) {
      out.images.push(p);
    } else {
      textParts.push(raw); // preserva vírgulas “não-imagem”
    }
  }
  out.text = textParts.join(",");
  return out;
}

export default function PaletteMenu({
  palette,
  setPalette,
  colors,

  // handlers (TODOS retornam Promise)
  onPickColor, // (color)  -> Promise
  onSetCellComment, // (rowId, dayISO, message, initial) -> Promise<createdComment?>
  onToggleBaseline, // (rowId, dayISO, enabled)          -> Promise
  onDeleteComment, // (rowId, dayISO, commentId)        -> Promise

  // contexto
  currentUserInitial,
  canMarkBaseline,
  baselineColor,
  close,
  submitting,

  // permissões
  isAdmin = false,
  currentUserId,
  canEditColorCell = () => true, // (rowId, dayISO) => bool
  canToggleBaselineCell = () => true, // (rowId, dayISO) => bool
  canCreateCommentCell = () => true, // (rowId, dayISO) => bool
  canDeleteCommentCell = () => true, // (rowId, dayISO, comment) => bool
}) {
  // ===== Hooks SEMPRE no topo =====
  const fileInputRef = useRef(null);
  const commentsRef = useRef(null);
  const [imgPreview, setImgPreview] = useState(null);

  const baselineDirty = useMemo(() => {
    if (!palette) return false;
    if (typeof palette.baselineOriginal === "undefined") return false;
    return !!palette.baseline !== !!palette.baselineOriginal;
  }, [palette?.baseline, palette?.baselineOriginal]);

  useEffect(() => {
    if (!palette) return;
    requestAnimationFrame(() => {
      if (commentsRef.current) {
        commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette?.rowId, palette?.dayISO]);

  useEffect(() => {
    if (!palette) return;
    requestAnimationFrame(() => {
      if (commentsRef.current) {
        commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
      }
    });
  }, [palette?.comments?.length]);

  const canEditColorHere = palette
    ? !!canEditColorCell(palette.rowId, palette.dayISO)
    : false;
  const canToggleBaseHere = palette
    ? !!canMarkBaseline &&
      !!canToggleBaselineCell(palette.rowId, palette.dayISO)
    : false;
  const canCreateComment = palette
    ? !!canCreateCommentCell(palette.rowId, palette.dayISO)
    : false;
  const draftText = palette?.commentDraft || "";
  const draftImages = Array.isArray(palette?.attachments)
    ? palette.attachments
    : [];

  const saveDisabled =
    submitting ||
    (!baselineDirty &&
      !(draftText || "").trim().length &&
      draftImages.length === 0);

  if (!palette) return null;

  // upload -> converte pra base64 e guarda em palette.attachments (não suja o textarea)
  const onPickFile = async (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;

    if (!/^image\//i.test(f.type)) {
      toast.error("Apenas imagens são permitidas.");
      ev.target.value = "";
      return;
    }
    const MAX = 3 * 1024 * 1024; // 3MB
    if (f.size > MAX) {
      toast.error("Imagem muito grande (máx 3MB).");
      ev.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(dataUrl)) {
        toast.error("Falha ao carregar a imagem.");
        return;
      }
      setPalette((prev) => {
        if (!prev) return prev;
        const cur = Array.isArray(prev.attachments) ? prev.attachments : [];
        return { ...prev, attachments: cur.concat([dataUrl]) };
      });
    };
    reader.onerror = () => toast.error("Erro ao ler a imagem.");
    reader.readAsDataURL(f);
    ev.target.value = "";
  };

  const removeDraftImage = (idx) => {
    setPalette((prev) => {
      if (!prev) return prev;
      const cur = Array.isArray(prev.attachments)
        ? prev.attachments.slice()
        : [];
      cur.splice(idx, 1);
      return { ...prev, attachments: cur };
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        left: palette.x,
        top: palette.y,
        zIndex: 1001,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Palette
        style={{
          width: 360,
          maxWidth: "calc(100vw - 16px)",
          maxHeight: "min(80vh, 560px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Paleta de cores + baseline */}
        <div style={{ paddingBottom: 6 }}>
          <ColorsRow>
            {colors.map((c) => (
              <ColorDot
                key={c}
                $color={c}
                style={{
                  opacity: canEditColorHere ? 1 : 0.4,
                  cursor: canEditColorHere ? "pointer" : "not-allowed",
                }}
                onClick={async () => {
                  if (!canEditColorHere) {
                    toast.error("Sem permissão para alterar a cor.");
                    return;
                  }
                  try {
                    const r = onPickColor?.(c);
                    if (r && typeof r.then === "function") await r;
                  } catch (err) {
                    const s = err?.response?.status;
                    const d = err?.response?.data?.detail;
                    if (s === 403)
                      toast.error("Sem permissão para alterar a cor.");
                    else if (s === 423)
                      toast.error("Projeto bloqueado. Ação não permitida.");
                    else toast.error(d || "Falha ao alterar a cor.");
                  }
                }}
              />
            ))}
            <ClearBtn
              type="button"
              style={{
                opacity: canEditColorHere ? 1 : 0.4,
                cursor: canEditColorHere ? "pointer" : "not-allowed",
              }}
              onClick={async () => {
                if (!canEditColorHere) {
                  toast.error("Sem permissão para limpar a cor.");
                  return;
                }
                try {
                  const r = onPickColor?.(undefined);
                  if (r && typeof r.then === "function") await r;
                } catch (err) {
                  const s = err?.response?.status;
                  const d = err?.response?.data?.detail;
                  if (s === 403)
                    toast.error("Sem permissão para limpar a cor.");
                  else if (s === 423)
                    toast.error("Projeto bloqueado. Ação não permitida.");
                  else toast.error(d || "Falha ao limpar a cor.");
                }
              }}
            >
              Limpar
            </ClearBtn>
          </ColorsRow>

          {canToggleBaseHere && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                margin: "6px 0 4px",
              }}
            >
              <input
                type="checkbox"
                checked={!!palette.baseline}
                onChange={(e) =>
                  setPalette((prev) => ({
                    ...prev,
                    baseline: e.target.checked,
                  }))
                }
              />
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span>Marco do plano</span>
                <span style={{ position: "relative", width: 18, height: 18 }}>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "inline-block",
                    }}
                  >
                    <BaselineMark $color={baselineColor}>
                      <FiFlag size={12} />
                    </BaselineMark>
                  </span>
                </span>
              </span>
            </label>
          )}
        </div>

        {/* Histórico de comentários (scroll) */}
        <div
          ref={commentsRef}
          style={{
            flex: 1,
            minHeight: 80,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {Array.isArray(palette.comments) &&
            palette.comments
              .filter((c) => !c?.deleted)
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
              .map((c) => {
                const canDeleteThis = !!canDeleteCommentCell(
                  palette.rowId,
                  palette.dayISO,
                  c
                );
                const parts = parseMessageParts(String(c.message || ""));

                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      margin: "6px 0",
                    }}
                  >
                    <SectorDot $color="#111827">
                      {(c.authorInitial || "U").toUpperCase()}
                    </SectorDot>

                    <CommentBubble>
                      <div
                        style={{
                          fontSize: 11,
                          opacity: 0.7,
                          marginBottom: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {new Date(c.created_at).toLocaleString()}
                        {canDeleteThis && (
                          <DeleteCommentBtn
                            onClick={async () => {
                              try {
                                await onDeleteComment?.(
                                  palette.rowId,
                                  palette.dayISO,
                                  c.id
                                );
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
                                if (s === 403)
                                  toast.error(
                                    "Sem permissão para excluir este comentário."
                                  );
                                else if (s === 423)
                                  toast.error(
                                    "Projeto bloqueado. Ação não permitida."
                                  );
                                else
                                  toast.error(
                                    d || "Falha ao excluir comentário."
                                  );
                              }
                            }}
                            title="Apagar comentário"
                          >
                            <FiTrash2 />
                          </DeleteCommentBtn>
                        )}
                      </div>

                      {/* texto (se houver) */}
                      {parts.text && (
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {parts.text}
                        </div>
                      )}

                      {/* imagens */}
                      {parts.images.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 6,
                          }}
                        >
                          {parts.images.map((src, idx) => (
                            <img
                              key={`${c.id}-img-${idx}`}
                              src={src}
                              alt="anexo"
                              style={{
                                width: 96,
                                height: 72,
                                objectFit: "cover",
                                borderRadius: 8,
                                cursor: "pointer",
                                border: "1px solid rgba(0,0,0,.08)",
                              }}
                              onClick={() => setImgPreview(src)}
                            />
                          ))}
                        </div>
                      )}
                    </CommentBubble>
                  </div>
                );
              })}
        </div>

        {/* Novo comentário + clipe + previews */}
        <div style={{ marginTop: 8, position: "relative" }}>
          <textarea
            rows={3}
            placeholder={
              canCreateComment
                ? "Adicionar novo comentário... (use o clipe para anexar imagens)"
                : "Você não pode comentar aqui"
            }
            className="palette-textarea"
            value={draftText}
            onChange={(e) =>
              setPalette((prev) => ({ ...prev, commentDraft: e.target.value }))
            }
            disabled={!canCreateComment}
            style={{
              opacity: canCreateComment ? 1 : 0.5,
              width: "100%",
              resize: "vertical",
              paddingRight: 36, // espaço pro botão do clipe
            }}
          />

          {/* botão clipe */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar imagem"
            style={{
              position: "absolute",
              right: 6,
              bottom: 6,
              width: 28,
              height: 28,
              borderRadius: 8,
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(0,0,0,.08)",
              background: "transparent",
              color: "grey",
              cursor: "pointer",
            }}
            disabled={!canCreateComment}
          >
            <FiPaperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            style={{ display: "none" }}
          />

          {/* previews dos anexos do draft */}
          {draftImages.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              {draftImages.map((src, i) => (
                <div
                  key={`draft-img-${i}`}
                  style={{
                    position: "relative",
                    width: 96,
                    height: 72,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,.08)",
                  }}
                >
                  <img
                    src={src}
                    alt="anexo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeDraftImage(i)}
                    title="Remover"
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      display: "grid",
                      placeItems: "center",
                      border: "none",
                      background: "rgba(17,24,39,.8)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <ActionsRow>
          <Button size="sm" color="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button
            size="sm"
            color="primary"
            disabled={saveDisabled}
            onClick={async () => {
              try {
                // monta a message final: [texto?, ...imagens]
                const text = String(draftText || "").trim();
                const pieces = [];
                if (text) pieces.push(text);
                for (let i = 0; i < draftImages.length; i++)
                  pieces.push(draftImages[i]);
                const message = pieces.join(",");

                // comenta (se houver algo)
                if (
                  message &&
                  canCreateComment &&
                  typeof onSetCellComment === "function"
                ) {
                  const created = await onSetCellComment(
                    palette.rowId,
                    palette.dayISO,
                    message,
                    currentUserInitial
                  );

                  setPalette((prev) =>
                    prev
                      ? {
                          ...prev,
                          commentDraft: "",
                          attachments: [],
                          comments: [
                            ...(Array.isArray(prev.comments)
                              ? prev.comments
                              : []),
                            created || {
                              id: `tmp-${Date.now()}`,
                              authorInitial: currentUserInitial,
                              message,
                              created_at: new Date().toISOString(),
                              deleted: false,
                            },
                          ],
                        }
                      : prev
                  );
                }

                // baseline (se mudou)
                if (
                  baselineDirty &&
                  canToggleBaseHere &&
                  typeof onToggleBaseline === "function"
                ) {
                  await onToggleBaseline(
                    palette.rowId,
                    palette.dayISO,
                    !!palette.baseline
                  );
                }

                close();
              } catch (err) {
                const s = err?.response?.status;
                const d = err?.response?.data?.detail;
                if (s === 403)
                  toast.error("Sem permissão para executar esta ação.");
                else if (s === 423)
                  toast.error("Projeto bloqueado. Ação não permitida.");
                else toast.error(d || "Falha ao salvar alterações.");
              }
            }}
          >
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </ActionsRow>
      </Palette>
      <ModalImage
        isOpen={!!imgPreview}
        src={imgPreview}
        onClose={() => setImgPreview(null)}
      />
    </div>
  );
}
