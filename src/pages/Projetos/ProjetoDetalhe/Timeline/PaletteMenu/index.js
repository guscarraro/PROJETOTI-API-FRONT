import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { Palette, ActionsRow, ThemeScope } from "../../../style";
import { Button } from "reactstrap";
import { toast } from "react-toastify";

import PaletteHeader from "./PaletteHeader";
import CommentList from "./CommentList";
import AttachmentComposer from "./AttachmentComposer";
import LoaderOverlay from "./LoaderOverlay";
import ModalImage from "./ModalImage";

/* --------- Hook: sempre ler de localStorage.theme, mas com fallbacks --------- */
function useLocalStorageTheme() {
  const read = () => {
    try {
      const ls = (localStorage.getItem("theme") || "").toLowerCase();
      if (ls === "dark" || ls === "light") return ls;
    } catch {}
    // fallback se localStorage não estiver setado:
    const html = document.documentElement;
    const byAttr = html.getAttribute("data-theme");
    const byClass = html.classList.contains("dark");
    const byMq = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return (byAttr === "dark" || byClass || byMq) ? "dark" : "light";
  };

  const [mode, setMode] = useState(read);

  useEffect(() => {
    // 1) outra aba mudou localStorage.theme
    const onStorage = (e) => {
      if (e.key === "theme") setMode(read());
    };
    window.addEventListener("storage", onStorage);

    // 2) mesma aba: app dispara um evento customizado sempre que trocar o tema
    const onThemeChanged = () => setMode(read());
    window.addEventListener("themechanged", onThemeChanged);

    // 3) se app mudar classe/atributo do <html>, capturamos também
    const html = document.documentElement;
    const mo = new MutationObserver(onThemeChanged);
    mo.observe(html, { attributes: true, attributeFilter: ["class", "data-theme"] });

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("themechanged", onThemeChanged);
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mode; // "dark" | "light"
}

export default function PaletteMenu({
  palette,
  setPalette,
  colors,

  // handlers
  onPickColor,
  onSetCellComment,
  onToggleBaseline,
  onDeleteComment,
  onToggleCompleted,

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
  canToggleCompletedCell = () => true,
  canCreateCommentCell = () => true,
  canDeleteCommentCell = () => true,
  currentUserSectorId,
  usersDoProjeto = [],
  canMarkCompleted = true,
}) {
  const commentsRef = useRef(null);
  const containerRef = useRef(null);

  // >>> tema vindo do localStorage (reativo)
  const themeMode = useLocalStorageTheme(); // "dark" | "light"

  // posição ajustada para caber na viewport
  const [pos, setPos] = useState({ left: -9999, top: -9999, ready: false });

  const baselineDirty = useMemo(() => {
    if (!palette) return false;
    if (typeof palette.baselineOriginal === "undefined") return false;
    return !!palette.baseline !== !!palette.baselineOriginal;
  }, [palette?.baseline, palette?.baselineOriginal]);

  const completedDirty = useMemo(() => {
    if (!palette) return false;
    if (typeof palette.completedOriginal === "undefined") return false;
    return !!palette.completed !== !!palette.completedOriginal;
  }, [palette?.completed, palette?.completedOriginal]);

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

  const canEditColorHere = palette ? !!canEditColorCell(palette.rowId, palette.dayISO) : false;
  const canToggleBaseHere = palette
    ? !!canMarkBaseline && !!canToggleBaselineCell(palette.rowId, palette.dayISO)
    : false;
  const canToggleCompletedHere = palette
    ? !!canMarkCompleted && !!canToggleCompletedCell(palette.rowId, palette.dayISO)
    : false;
  const canCreateComment = palette ? !!canCreateCommentCell(palette.rowId, palette.dayISO) : false;

  const draftText = palette?.commentDraft || "";
  const draftFiles = Array.isArray(palette?.attachments) ? palette.attachments : [];

  const [imgPreview, setImgPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const saveDisabled =
    sending ||
    (!baselineDirty &&
      !completedDirty &&
      !(draftText || "").trim().length &&
      draftFiles.length === 0);

  // ======= Posicionamento automático (clamp/flip) sem flicker =======
  const recomputePosition = useCallback(
    (initial = false) => {
      if (!palette) return;

      const GAP = 12;
      const MARGIN = 8;

      const el = containerRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const w = el?.offsetWidth || 360;
      const h = el?.offsetHeight || 320;

      let left = (palette.x || 0) + GAP;
      let top = (palette.y || 0) + GAP;

      if (left + w > vw - MARGIN) {
        left = Math.max(MARGIN, vw - w - MARGIN);
      }
      if (top + h > vh - MARGIN) {
        top = (palette.y || 0) - h - GAP;
        if (top < MARGIN) {
          top = Math.max(MARGIN, vh - h - MARGIN);
        }
      }

      setPos((prev) => {
        const next = { left, top, ready: true };
        if (!prev.ready || initial || prev.left !== left || prev.top !== top)
          return next;
        return prev;
      });
    },
    [palette?.x, palette?.y, palette]
  );

  useLayoutEffect(() => {
    if (!palette) return;
    if (!pos.ready) {
      requestAnimationFrame(() => recomputePosition(true));
    } else {
      recomputePosition(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette?.x, palette?.y]);

  useLayoutEffect(() => {
    if (!palette) return;
    recomputePosition(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette?.comments?.length, draftFiles.length]);

  useEffect(() => {
    const onResize = () => recomputePosition(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recomputePosition]);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => recomputePosition(false));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recomputePosition]);

  if (!palette) return null;

  const emailToInitials = (email) => {
    const u = String(email || "").split("@")[0] || "";
    return u.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        zIndex: 1001,
        visibility: pos.ready ? "visible" : "hidden",
        willChange: "left, top",
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
          canToggleCompletedHere={canToggleCompletedHere}
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
            currentUserId={currentUserId}
            usersDoProjeto={usersDoProjeto}
          />
        </div>

        {/* Escopo de tema controlado pelo localStorage.theme */}
        <ThemeScope
          key={`theme-${themeMode}`}       // força remount ao alternar
          $mode={themeMode}
          data-theme={themeMode}
          className={themeMode === "dark" ? "dark" : ""}
        >
          <AttachmentComposer
            draftText={draftText}
            setDraftText={(v) =>
              setPalette((prev) => ({ ...prev, commentDraft: v }))
            }
            draftFiles={draftFiles}
            setDraftFiles={(updaterOrArray) =>
              setPalette((prev) => {
                const cur = Array.isArray(prev?.attachments)
                  ? prev.attachments
                  : [];
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
            users={usersDoProjeto}
          />
        </ThemeScope>

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

                const userFromList = Array.isArray(usersDoProjeto)
                  ? usersDoProjeto.find((u) => String(u.id) === String(currentUserId))
                  : null;

                const lsUser = (() => {
                  try { return JSON.parse(localStorage.getItem("user") || "null"); }
                  catch { return null; }
                })();

                const initialsFromEmail =
                  emailToInitials(userFromList?.email) ||
                  emailToInitials(lsUser?.email);

                const initials =
                  initialsFromEmail ||
                  String(currentUserInitial || "").slice(0, 2).toUpperCase() ||
                  "U";

                if (message && canCreateComment && typeof onSetCellComment === "function") {
                  const created = await onSetCellComment(
                    palette.rowId,
                    palette.dayISO,
                    message,
                    initials
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
                              authorInitial: initials,
                              message,
                              created_at: new Date().toISOString(),
                              deleted: false,
                            },
                          ],
                        }
                      : prev
                  );
                }

                if (baselineDirty && canToggleBaseHere && typeof onToggleBaseline === "function") {
                  await onToggleBaseline(palette.rowId, palette.dayISO, !!palette.baseline);
                }
                if (completedDirty && canToggleCompletedHere && typeof onToggleCompleted === "function") {
                  await onToggleCompleted(palette.rowId, palette.dayISO, !!palette.completed);
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
