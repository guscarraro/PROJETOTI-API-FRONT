// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/AttachmentComposer/index.js
import React, { useRef, useState, useEffect } from "react";
import { FiPaperclip, FiX, FiFile } from "react-icons/fi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { SiMicrosoftexcel } from "react-icons/si";
import { toast } from "react-toastify";
import {
  addNameToDataUrl,
  extractNameFromDataUrl,
  openDataUrlInNewTab,
} from "../utils";
import {
  ComposerWrap,
  EditorBox,
  Placeholder,
  FilesWrap,
  Thumb,
  ThumbName,
  RemoveBtn,
} from "./style";
import {
  applyCmd,
  onPastePlain,
  isInside,
  getTextBeforeCaret,
  rangeFromTextOffsets,
  rgbToHex,
  normHex,
} from "./utils/editorUtils";
import Toolbar from "./Toolbar";
import EditableArea from "./EditableArea";
import MentionList from "./MentionList";
import FilesList from "./FilesList";

export default function AttachmentComposer({
  draftText,
  setDraftText,
  draftFiles,
  setDraftFiles,
  canCreateComment,
  setImgPreview,
  sectors = [],
  users = [],
}) {
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQ, setMentionQ] = useState("");
  const [mentionPos, setMentionPos] = useState({ x: 0, y: 0 });
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionEnd, setMentionEnd] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);

  const [isBold, setIsBold] = useState(false);
  const [isList, setIsList] = useState(false);
  const [activeColorName, setActiveColorName] = useState("default"); // default|red|green|blue

  // suprimir a próxima abertura de menções após Backspace/Delete que remove uma pill
  const skipMentionOnceRef = useRef(false);

  const THEME_DEFAULT_LIGHT = "#111827";
  const THEME_DEFAULT_DARK = "#e5e7eb";
  const RED = "#ef4444";
  const GREEN = "#16a34a";
  const BLUE = "#3b82f6";

  // detectar dark-mode também por classe/atributo do app
  const isDarkMode = () => {
    if (typeof window === "undefined") return false;
    const doc = document.documentElement;
    const classDark = doc.classList && doc.classList.contains("dark");
    const attrDark =
      doc.getAttribute && doc.getAttribute("data-theme") === "dark";
    const mql =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    return !!(classDark || attrDark || (mql && mql.matches));
  };

  const defaultColorHex = () =>
    isDarkMode() ? THEME_DEFAULT_DARK : THEME_DEFAULT_LIGHT;

  const colorFromName = (name) => {
    if (name === "red") return RED;
    if (name === "green") return GREEN;
    if (name === "blue") return BLUE;
    return defaultColorHex();
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const cur = String(el.innerHTML || "");
    const next = String(draftText || "");
    if (cur !== next) el.innerHTML = next;
  }, [draftText]);

  const syncToState = () => {
    const el = editorRef.current;
    if (!el) return;
    setDraftText(el.innerHTML);
  };

  const focusEditor = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection && window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const enforceTypingColor = () => {
  // só aplica cor se NÃO for default
  if (activeColorName === "default") return;
  applyCmd("styleWithCSS", true);
  applyCmd("foreColor", colorFromName(activeColorName));
};


  const refreshMention = () => {
    // se marcado para pular UMA vez (após apagar uma pill), limpa o flag e não abre menções
    if (skipMentionOnceRef.current) {
      skipMentionOnceRef.current = false;
      setMentionOpen(false);
      setMentionQ("");
      return;
    }

    const root = editorRef.current;
    if (!root) return;
    const { text, rect } = getTextBeforeCaret(root);
    const m = text.match(/@([^\s@]{0,30})$/);
    if (m) {
      const query = m[1] || "";
      const end = text.length;
      const start = end - (query.length + 1);
      const x = rect ? rect.left : 0;
      const y = rect ? rect.bottom + 6 : 0;
      setMentionQ(query);
      setMentionStart(start);
      setMentionEnd(end);
      setMentionPos({ x, y });
      setMentionIndex(0);
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
      setMentionQ("");
    }
  };

  const selectSectorMention = (s) => {
    const root = editorRef.current;
    if (!root) return;
    const r = rangeFromTextOffsets(root, mentionStart, mentionEnd);
    r.deleteContents();

    const span = document.createElement("span");
    span.className = "sector-pill";
    span.setAttribute("contenteditable", "false");
    span.setAttribute("data-sector", s.key);
    span.setAttribute("style", `--pill-color:${s.color || "#9ca3af"}`);
    const dot = document.createElement("span");
    dot.className = "dot";
    const text = document.createTextNode(s.label || s.key);
    span.appendChild(dot);
    span.appendChild(document.createTextNode(" "));
    span.appendChild(text);

    const wrap = document.createElement("div");
    wrap.className = "mention-block";
    wrap.setAttribute("contenteditable", "false");
    wrap.setAttribute("data-type", "sector");
    wrap.style.cssText =
      "display:inline-block;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25);border-radius:6px;padding:2px 6px;margin:0 2px;";
    wrap.appendChild(span);

    r.insertNode(wrap);

    const space = document.createTextNode(" ");
    wrap.after(space);

    const sel = window.getSelection && window.getSelection();
    if (sel) {
      const after = document.createRange();
      after.setStart(space, 1);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    }

    setMentionOpen(false);
    setMentionQ("");
    syncToState();
    focusEditor();
    enforceTypingColor();
  };

  const selectUserMention = (u) => {
    const root = editorRef.current;
    if (!root) return;
    const r = rangeFromTextOffsets(root, mentionStart, mentionEnd);
    r.deleteContents();

    const span = document.createElement("span");
    span.className = "user-pill";
    span.setAttribute("contenteditable", "false");
    span.setAttribute("data-user", String(u.id));
    const text = document.createTextNode(u.label || String(u.id));
    span.appendChild(text);

    const wrap = document.createElement("div");
    wrap.className = "mention-block";
    wrap.setAttribute("contenteditable", "false");
    wrap.setAttribute("data-type", "user");
    wrap.style.cssText =
      "display:inline-block;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25);border-radius:6px;padding:2px 6px;margin:0 2px;";
    wrap.appendChild(span);

    r.insertNode(wrap);

    const space = document.createTextNode(" ");
    wrap.after(space);

    const sel = window.getSelection && window.getSelection();
    if (sel) {
      const after = document.createRange();
      after.setStart(space, 1);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    }

    setMentionOpen(false);
    setMentionQ("");
    syncToState();
    focusEditor();
    enforceTypingColor();
  };

  const handleSelectMention = (item) => {
    if (!item) return;
    if (item.__type === "user") return selectUserMention(item);
    return selectSectorMention(item);
  };

  const onBold = () => {
    focusEditor();
    applyCmd("bold");
    enforceTypingColor();
    syncToState();
    updateToolbarState();
  };

  const onUL = () => {
    focusEditor();
    applyCmd("insertUnorderedList");
    enforceTypingColor();
    syncToState();
    updateToolbarState();
  };

const onPickColorName = (name) => {
  setActiveColorName(name);
  focusEditor();

  if (name === "default") {
    // voltando para o padrão: não force cor inline
    // (opcional) limpe cores locais da seleção atual
    try { document.execCommand("removeFormat"); } catch(_) {}
  } else {
    applyCmd("styleWithCSS", true);
    applyCmd("foreColor", colorFromName(name));
  }

  syncToState();
  updateToolbarState();
};


  const onClearAll = () => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = "";
    setDraftText("");
    setMentionOpen(false);
    setIsBold(false);
    setIsList(false);
    setActiveColorName("default");
    el.focus();
    enforceTypingColor();
  };

  const colorNameFromComputed = (colorHex) => {
    const c = normHex(colorHex);
    const map = {
      [normHex(RED)]: "red",
      [normHex(GREEN)]: "green",
      [normHex(BLUE)]: "blue",
      [normHex(THEME_DEFAULT_LIGHT)]: "default",
      [normHex(THEME_DEFAULT_DARK)]: "default",
    };
    return map[c] || "default";
  };

  // 1) Troque o updateToolbarState para NÃO mexer em activeColorName
  const updateToolbarState = () => {
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection && window.getSelection();
    if (!sel || sel.rangeCount === 0 || !isInside(sel.anchorNode, el)) {
      setIsBold(false);
      setIsList(false);
      return;
    }

    // Bold
    let bold = false;
    try {
      bold = document.queryCommandState("bold");
    } catch (_) {}
    if (!bold) {
      let n =
        sel.anchorNode.nodeType === 3
          ? sel.anchorNode.parentNode
          : sel.anchorNode;
      while (n && n !== el) {
        const tn = (n.tagName || "").toLowerCase();
        const fw = window.getComputedStyle
          ? window.getComputedStyle(n).fontWeight
          : "400";
        if (tn === "b" || tn === "strong" || parseInt(fw, 10) >= 600) {
          bold = true;
          break;
        }
        n = n.parentNode;
      }
    }
    setIsBold(!!bold);

    // List
    let list = false;
    try {
      list = document.queryCommandState("insertUnorderedList");
    } catch (_) {}
    if (!list) {
      let n =
        sel.anchorNode.nodeType === 3
          ? sel.anchorNode.parentNode
          : sel.anchorNode;
      while (n && n !== el) {
        const tn = (n.tagName || "").toLowerCase();
        if (tn === "ul" || tn === "li") {
          list = true;
          break;
        }
        n = n.parentNode;
      }
    }
    setIsList(!!list);

    // IMPORTANTE: não atualizar activeColorName aqui.
  };

  useEffect(() => {
    const onSel = () => updateToolbarState();
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPickFile = async (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;

    const type = f.type || "";
       const name = (f.name || "").toLowerCase();
    const isImage = /^image\//i.test(type);
    const isPdf = /pdf$/i.test(type) || name.endsWith(".pdf");
    const isExcel =
      /spreadsheetml\.sheet$/i.test(type) ||
      /vnd\.ms-excel$/i.test(type) ||
      name.endsWith(".xlsx") ||
      name.endsWith(".xls");

    if (!(isImage || isPdf || isExcel)) {
      toast.error("Apenas imagem, PDF ou Excel são permitidos.");
      ev.target.value = "";
      return;
    }
    const MAX = isImage ? 3 * 1024 * 1024 : 8 * 1024 * 1024;
    if (f.size > MAX) {
      toast.error(
        isImage
          ? "Imagem muito grande (máx 3MB)."
          : "Arquivo muito grande (máx 8MB)."
      );
      ev.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let dataUrl = String(reader.result || "");
      const ok =
        (isImage && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(dataUrl)) ||
        (isPdf && /^data:application\/pdf;base64,/.test(dataUrl)) ||
        (isExcel &&
          /^data:application\/(vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet);base64,/.test(
            dataUrl
          ));
      if (!ok) {
        toast.error("Falha ao carregar o arquivo.");
        return;
      }
      const finalUrl = addNameToDataUrl(dataUrl, f.name);
      setDraftFiles((prev) => {
        const cur = Array.isArray(prev) ? prev.slice() : [];
        cur.push(finalUrl);
        return cur;
      });
    };
    reader.onerror = () => toast.error("Erro ao ler o arquivo.");
    reader.readAsDataURL(f);
    ev.target.value = "";
  };

  const removeDraftFile = (idx) => {
    setDraftFiles((prev) => {
      const cur = Array.isArray(prev) ? prev.slice() : [];
      if (idx >= 0 && idx < cur.length) cur.splice(idx, 1);
      return cur;
    });
  };

  const disabled = !canCreateComment;
  const empty = !draftText || String(draftText).trim() === "";

  let mentionOptions = [];
  if (mentionOpen) {
    // Setores
    for (let i = 0; i < sectors.length; i++) {
      const s = sectors[i] || {};
      const label = (s.label || s.key || "").toString();
      const key = (s.key || "").toString();
      const q = (mentionQ || "").toLowerCase();
      const inLabel = label.toLowerCase().indexOf(q) >= 0;
      const inKey = key.toLowerCase().indexOf(q) >= 0;
      if (q === "" || inLabel || inKey)
        mentionOptions.push({ ...s, __type: "sector" });
      if (mentionOptions.length >= 8) break;
    }
    // Usuários
    if (mentionOptions.length < 8) {
      for (let i = 0; i < users.length; i++) {
        const u = users[i] || {};
        const label = (u.nome || u.email || String(u.id) || "").toString();
        const q = (mentionQ || "").toLowerCase();
        if (q === "" || label.toLowerCase().includes(q)) {
          mentionOptions.push({ __type: "user", id: String(u.id), label });
        }
        if (mentionOptions.length >= 8) break;
      }
    }
  }

  const onEditorKeyDown = (e) => {
    // Navegação/seleção do menu de menção quando aberto
    if (mentionOpen && mentionOptions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, mentionOptions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const s = mentionOptions[mentionIndex] || mentionOptions[0];
        if (s) handleSelectMention(s);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionOpen(false);
        return;
      }
    }

    // Se usuário pressionar Backspace/Delete, suprimimos a PRÓXIMA checagem de menção
    // Isso evita reabrir o menu logo após remover uma mention-block.
    if (e.key === "Backspace" || e.key === "Delete") {
      skipMentionOnceRef.current = true;
    }
  };

  const swatches = [
    { name: "default", hex: defaultColorHex() },
    { name: "red", hex: RED },
    { name: "green", hex: GREEN },
    { name: "blue", hex: BLUE },
  ];

  return (
    <ComposerWrap>
      <Toolbar
        isBold={isBold}
        isList={isList}
        activeColorName={activeColorName}
        onBold={onBold}
        onUL={onUL}
        onPickColorName={onPickColorName}
        onClearAll={onClearAll}
        swatches={swatches}
        disabled={disabled}
      />

      <EditorBox style={{ opacity: disabled ? 0.5 : 1 }}>
        {empty && (
          <Placeholder>
            {canCreateComment
              ? "Adicionar novo comentário... (clipe para anexar) — use @ para marcar setor/usuário"
              : "Você não pode comentar aqui"}
          </Placeholder>
        )}

<EditableArea
  editorRef={editorRef}
  disabled={disabled}

  // aplique a cor antes de inserir o próximo caractere
  onBeforeInput={() => {
    enforceTypingColor();          // <- aqui, antes de digitar
  }}

  onFocus={() => {
    enforceTypingColor();          // <- garante cor ao focar se swatch != default
  }}

  onInput={() => {
    // NADA de enforceTypingColor aqui
    syncToState();
    refreshMention();
    updateToolbarState();
  }}

  onBlur={() => {
    syncToState();
    setMentionOpen(false);
  }}

  onPaste={onPastePlain}
  onKeyDown={onEditorKeyDown}
  onMouseUp={updateToolbarState}
  onKeyUp={updateToolbarState}
/>


        {mentionOpen && mentionOptions.length > 0 && (
          <MentionList
            left={mentionPos.x}
            top={mentionPos.y}
            options={mentionOptions}
            activeIndex={mentionIndex}
            onHover={(i) => setMentionIndex(i)}
            onSelect={(s) => handleSelectMention(s)}
          />
        )}

        <FilesList
          fileInputRef={fileInputRef}
          onPickFile={onPickFile}
          disabled={disabled}
        />
      </EditorBox>

      {Array.isArray(draftFiles) && draftFiles.length > 0 && (
        <FilesWrap>
          {draftFiles.map((src, i) => {
            const isImg = /^data:image\//.test(src);
            const isPdf = /^data:application\/pdf;/.test(src);
            const isExcel =
              /^data:application\/(vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet);/.test(
                src
              );
            const fname =
              extractNameFromDataUrl(src) ||
              (isImg ? "Imagem" : isPdf ? "Documento.pdf" : "Planilha.xlsx");

            return (
              <Thumb
                key={`draft-file-${i}`}
                title={fname}
                onClick={() => {
                  if (isImg) setImgPreview(src);
                  else if (isPdf) openDataUrlInNewTab(src, fname, false);
                  else if (isExcel) openDataUrlInNewTab(src, fname, true);
                  else window.open(src, "_blank");
                }}
                role="button"
              >
                {isImg ? (
                  <img
                    src={src}
                    alt="anexo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : isPdf ? (
                  <AiOutlineFilePdf size={28} color="#ef4444" />
                ) : isExcel ? (
                  <SiMicrosoftexcel size={28} color="#16a34a" />
                ) : (
                  <FiFile size={24} />
                )}

                <ThumbName>{fname}</ThumbName>

                <RemoveBtn
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDraftFile(i);
                  }}
                  title="Remover"
                >
                  <FiX size={12} />
                </RemoveBtn>
              </Thumb>
            );
          })}
        </FilesWrap>
      )}
    </ComposerWrap>
  );
}
