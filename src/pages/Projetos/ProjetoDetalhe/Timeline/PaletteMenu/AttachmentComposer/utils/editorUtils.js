// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/AttachmentComposer/editorUtils.js
export function insertHtmlAtCursor(html) {
  const sel = window.getSelection && window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const frag = document.createDocumentFragment();
  let node, lastNode;
  while ((node = temp.firstChild)) {
    lastNode = frag.appendChild(node);
  }
  range.insertNode(frag);
  if (lastNode) {
    range.setStartAfter(lastNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export function applyCmd(cmd, val = null) {
  try { document.execCommand(cmd, false, val); } catch (e) {}
}

export function onPastePlain(e) {
  if (!e.clipboardData) return;
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  if (!text) return;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i];
    if (i > 0) insertHtmlAtCursor("<br/>");
    if (t) insertHtmlAtCursor(t.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  }
}

export function rgbToHex(rgb) {
  if (!rgb) return "";
  const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return rgb.toLowerCase();
  const r = parseInt(m[1], 10).toString(16).padStart(2, "0");
  const g = parseInt(m[2], 10).toString(16).padStart(2, "0");
  const b = parseInt(m[3], 10).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`.toLowerCase();
}
export function normHex(h) {
  if (!h) return "";
  const s = h.toLowerCase();
  if (s.length === 4 && s[0] === "#") {
    return "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  }
  return s;
}

export function isInside(node, root) {
  while (node) {
    if (node === root) return true;
    node = node.parentNode;
  }
  return false;
}

export function getTextBeforeCaret(root) {
  const sel = window.getSelection && window.getSelection();
  if (!sel || sel.rangeCount === 0) return { text: "", rect: null };
  const range = sel.getRangeAt(0).cloneRange();
  range.setStart(root, 0);
  const text = range.toString();
  const caretRange = sel.getRangeAt(0).cloneRange();
  caretRange.collapse(true);
  const rects = caretRange.getClientRects();
  const rect = rects && rects.length ? rects[rects.length - 1] : null;
  return { text, rect };
}

export function rangeFromTextOffsets(root, start, end) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let acc = 0;
  let startNode = null, startOffset = 0;
  let endNode = null, endOffset = 0;

  let n = walker.nextNode();
  while (n) {
    const len = n.nodeValue ? n.nodeValue.length : 0;
    if (startNode === null && acc + len >= start) {
      startNode = n;
      startOffset = start - acc;
    }
    if (acc + len >= end) {
      endNode = n;
      endOffset = end - acc;
      break;
    }
    acc += len;
    n = walker.nextNode();
  }
  const r = document.createRange();
  if (!startNode) { r.setStart(root, 0); } else { r.setStart(startNode, startOffset); }
  if (!endNode) { r.setEnd(root, root.childNodes.length); } else { r.setEnd(endNode, endOffset); }
  return r;
}
