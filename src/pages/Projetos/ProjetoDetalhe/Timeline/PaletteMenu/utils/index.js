// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/utils.js
/* Utilidades compartilhadas (composer + lista) */
export function addNameToDataUrl(dataUrl, filename) {
  if (!dataUrl || !filename) return dataUrl;
  if (!/;base64,/.test(dataUrl)) return dataUrl;
  const safe = encodeURIComponent(filename);
  return dataUrl.replace(/;base64,/, `;name=${safe};base64,`);
}

export function extractNameFromDataUrl(dataUrl) {
  const m = String(dataUrl || "").match(/;name=([^;]+);base64,/i);
  return m ? decodeURIComponent(m[1]) : null;
}

function dataUrlToBlob(dataUrl) {
  try {
    const [meta, b64] = dataUrl.split(",");
    const mime = meta.match(/^data:([^;]+);/i)?.[1] || "application/octet-stream";
    const binStr = atob(b64);
    const len = binStr.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binStr.charCodeAt(i);
    return new Blob([u8], { type: mime });
  } catch {
    return null;
  }
}

export function openDataUrlInNewTab(dataUrl, filename, preferDownload = false) {
  const blob = dataUrlToBlob(dataUrl);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  try {
    if (preferDownload) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "anexo";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      const win = window.open("");
      if (win) {
        win.opener = null;
        win.location.href = url;
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 8000);
  }
}

/** Faz o split preservando vírgulas do texto e separando blocos "data:" */
function splitMessageOnDataUrls(message) {
  if (!message || typeof message !== "string") return [""];
  // divide antes de qualquer data: que venha após vírgula
  return message.split(/,\s*(?=data:)/);
}

/** Aceita ;name=... opcional ANTES do ;base64, */
const RX_IMG = /^data:image\/[a-zA-Z0-9.+-]+;(?:name=[^;]+;)?base64,/i;
const RX_PDF = /^data:application\/pdf;(?:name=[^;]+;)?base64,/i;
const RX_XLS = /^data:application\/(?:vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet);(?:name=[^;]+;)?base64,/i;

/** Retorna { text, images:[{src,name}], pdfs:[{src,name}], sheets:[{src,name}] } */
export function parseMessageParts(message) {
  const out = { text: "", images: [], pdfs: [], sheets: [] };
  if (!message || typeof message !== "string") return out;

  const parts = splitMessageOnDataUrls(message);
  const textParts = [];

  for (let i = 0; i < parts.length; i++) {
    const raw = parts[i];
    const p = raw.trim();

    if (RX_IMG.test(p)) {
      out.images.push({ src: p, name: extractNameFromDataUrl(p) || "Imagem" });
    } else if (RX_PDF.test(p)) {
      out.pdfs.push({ src: p, name: extractNameFromDataUrl(p) || "Documento.pdf" });
    } else if (RX_XLS.test(p)) {
      const fallback = p.includes("openxmlformats-officedocument.spreadsheetml.sheet")
        ? "Planilha.xlsx"
        : "Planilha.xls";
      out.sheets.push({ src: p, name: extractNameFromDataUrl(p) || fallback });
    } else {
      textParts.push(raw);
    }
  }

  out.text = textParts.join(",");
  return out;
}
