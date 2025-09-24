// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/index.js
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect, useCallback } from "react";
import { Palette, ActionsRow } from "../../../style";
import { Button } from "reactstrap";
import { toast } from "react-toastify";

import PaletteHeader from "./PaletteHeader";
import CommentList from "./CommentList";
import AttachmentComposer from "./AttachmentComposer";
import LoaderOverlay from "./LoaderOverlay";
import ModalImage from "./ModalImage";

export default function PaletteMenu({
  palette,
  setPalette,
  colors,

  // handlers
  onPickColor,
  onSetCellComment,
  onToggleBaseline,
  onDeleteComment,

  // contexto
  currentUserInitial,
  canMarkBaseline,
  baselineColor,
  close,
sectorsDoProjeto = [],
  // permissões
  isAdmin = false,
  currentUserId,
  canEditColorCell = () => true,
  canToggleBaselineCell = () => true,
  canCreateCommentCell = () => true,
  canDeleteCommentCell = () => true,
  currentUserSectorId,
}) {
  const commentsRef = useRef(null);
  const containerRef = useRef(null);

  // posição ajustada para caber na viewport
  const [pos, setPos] = useState({ left: -9999, top: -9999, ready: false });

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
  }, [palette?.rowId, palette?.dayISO]);

  useEffect(() => {
    if (!palette) return;
    requestAnimationFrame(() => {
      if (commentsRef.current) {
        commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
      }
    });
  }, [palette?.comments?.length]);

  const canEditColorHere =
    palette ? !!canEditColorCell(palette.rowId, palette.dayISO) : false;
  const canToggleBaseHere = palette
    ? !!canMarkBaseline && !!canToggleBaselineCell(palette.rowId, palette.dayISO)
    : false;
  const canCreateComment = palette
    ? !!canCreateCommentCell(palette.rowId, palette.dayISO)
    : false;

  const draftText = palette?.commentDraft || "";
  const draftFiles = Array.isArray(palette?.attachments) ? palette.attachments : [];

  const [imgPreview, setImgPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const saveDisabled =
    sending ||
    (!baselineDirty && !(draftText || "").trim().length && draftFiles.length === 0);

  // ======= Posicionamento automático (clamp/flip) sem "piscar" =======
  const recomputePosition = useCallback((initial = false) => {
    if (!palette) return;

    const GAP = 12;   // distância do ponto de clique
    const MARGIN = 8; // margem interna da viewport

    const el = containerRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // usa o tamanho real se já renderizado, senão chuta tamanhos padrão
    const w = el?.offsetWidth || 360;
    const h = el?.offsetHeight || 320;

    let left = (palette.x || 0) + GAP;
    let top = (palette.y || 0) + GAP;

    // clamp horizontal
    if (left + w > vw - MARGIN) {
      left = Math.max(MARGIN, vw - w - MARGIN);
    }
    // flip/clamp vertical
    if (top + h > vh - MARGIN) {
      // tenta abrir para cima
      top = (palette.y || 0) - h - GAP;
      if (top < MARGIN) {
        // se ainda estoura, encosta no topo ou no máximo possível
        top = Math.max(MARGIN, vh - h - MARGIN);
      }
    }

    setPos(prev => {
      const next = { left, top, ready: true };
      // evita re-render desnecessário (e flicker) se posição não mudou
      if (!prev.ready || initial || prev.left !== left || prev.top !== top) return next;
      return prev;
    });
  }, [palette?.x, palette?.y, palette]);

  // 1) posiciona quando abre/muda âncora
  useLayoutEffect(() => {
    if (!palette) return;
    // primeira vez: deixa invisível até posicionar
    if (!pos.ready) {
      requestAnimationFrame(() => recomputePosition(true));
    } else {
      recomputePosition(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette?.x, palette?.y]);

  // 2) reposiciona quando o conteúdo muda significativamente
  useLayoutEffect(() => {
    if (!palette) return;
    // NÃO dependemos de draftText pra evitar recomputar a cada tecla
    recomputePosition(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette?.comments?.length, draftFiles.length]);

  // 3) window resize
  useEffect(() => {
    const onResize = () => recomputePosition(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recomputePosition]);

  // 4) observa mudanças de tamanho do próprio card (ex.: usuário redimensiona textarea)
  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => recomputePosition(false));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recomputePosition]);

  if (!palette) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        zIndex: 1001,
        visibility: pos.ready ? "visible" : "hidden",
        willChange: "left, top", // pequena dica ao navegador
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
          position: "relative",
        }}
      >
        <LoaderOverlay visible={sending} text="Enviando comentário..." />

        <PaletteHeader
          colors={colors}
          canEditColorHere={canEditColorHere}
          onPickColor={onPickColor}
          canToggleBaseHere={canToggleBaseHere}
          baselineColor={baselineColor}
          palette={palette}
          setPalette={setPalette}
        />

        <div
          ref={commentsRef}
          style={{
            flex: 1,
            minHeight: 80,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          <CommentList
            comments={palette.comments}
            palette={palette}
            setPalette={setPalette}
            canDeleteCommentCell={canDeleteCommentCell}
            onDeleteComment={onDeleteComment}
            setImgPreview={setImgPreview}
            deletingId={deletingId}
            setDeletingId={setDeletingId}
            userSectorId={currentUserSectorId}

          />
        </div>

        <AttachmentComposer
          draftText={draftText}
          setDraftText={(v) =>
            setPalette((prev) => ({ ...prev, commentDraft: v }))
          }
          draftFiles={draftFiles}
          // aceita function-updater OU array
          setDraftFiles={(updaterOrArray) =>
            setPalette((prev) => {
              const cur = Array.isArray(prev?.attachments) ? prev.attachments : [];
              const next =
                typeof updaterOrArray === "function"
                  ? updaterOrArray(cur)
                  : updaterOrArray;
              return { ...prev, attachments: next };
            })
          }
          canCreateComment={canCreateComment}
          setImgPreview={setImgPreview}
          sectors={sectorsDoProjeto}
        />

        <ActionsRow>
          <Button size="sm" color="secondary" onClick={close} disabled={sending}>
            Cancelar
          </Button>
          <Button
            size="sm"
            color="primary"
            disabled={saveDisabled}
            onClick={async () => {
              try {
                setSending(true);

                const text = String(draftText || "").trim();
                const pieces = [];
                if (text) pieces.push(text);
                for (let i = 0; i < draftFiles.length; i++) pieces.push(draftFiles[i]);
                const message = pieces.join(",");

                if (message && canCreateComment && typeof onSetCellComment === "function") {
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
                            ...(Array.isArray(prev.comments) ? prev.comments : []),
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
                if (s === 403) toast.error("Sem permissão para executar esta ação.");
                else if (s === 423) toast.error("Projeto bloqueado. Ação não permitida.");
                else toast.error(d || "Falha ao salvar alterações.");
              } finally {
                setSending(false);
              }
            }}
          >
            {sending ? "Enviando..." : "Salvar"}
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
