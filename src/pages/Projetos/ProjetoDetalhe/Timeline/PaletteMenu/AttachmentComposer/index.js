// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/AttachmentComposer/index.js
import React, { useRef } from "react";
import { FiPaperclip, FiX, FiFile } from "react-icons/fi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { SiMicrosoftexcel } from "react-icons/si";
import { toast } from "react-toastify";
import {
  addNameToDataUrl,
  extractNameFromDataUrl,
  openDataUrlInNewTab,
} from "../utils";

export default function AttachmentComposer({
  draftText,
  setDraftText,
  draftFiles,
  setDraftFiles,
  canCreateComment,
  setImgPreview,
}) {
  const fileInputRef = useRef(null);

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
      toast.error(isImage ? "Imagem muito grande (máx 3MB)." : "Arquivo muito grande (máx 8MB).");
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
      setDraftFiles((prev) =>
        Array.isArray(prev) ? prev.concat([finalUrl]) : [finalUrl]
      );
    };
    reader.onerror = () => toast.error("Erro ao ler o arquivo.");
    reader.readAsDataURL(f);
    ev.target.value = "";
  };

  const removeDraftFile = (idx) => {
    setDraftFiles((prev) => {
      const cur = Array.isArray(prev) ? prev.slice() : [];
      cur.splice(idx, 1);
      return cur;
    });
  };

  return (
    <div style={{ marginTop: 8, position: "relative" }}>
      <textarea
        rows={3}
        placeholder={
          canCreateComment
            ? "Adicionar novo comentário... (clipe para anexar imagem/PDF/Excel)"
            : "Você não pode comentar aqui"
        }
        className="palette-textarea"
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        disabled={!canCreateComment}
        style={{
          opacity: canCreateComment ? 1 : 0.5,
          width: "100%",
          resize: "vertical",
          paddingRight: 36,
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Anexar arquivo (imagem/PDF/Excel)"
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
        accept="image/*,application/pdf,.pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,.xlsx"
        onChange={onPickFile}
        style={{ display: "none" }}
      />

      {Array.isArray(draftFiles) && draftFiles.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 8,
          }}
        >
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
              <div
                key={`draft-file-${i}`}
                style={{
                  position: "relative",
                  width: 140,
                  height: 96,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,.08)",
                  display: "grid",
                  placeItems: "center",
                  background: "#fff",
                }}
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
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : isPdf ? (
                  <AiOutlineFilePdf size={28} color="#ef4444" />
                ) : isExcel ? (
                  <SiMicrosoftexcel size={28} color="#16a34a" />
                ) : (
                  <FiFile size={24} />
                )}

                <div
                  style={{
                    position: "absolute",
                    left: 4,
                    right: 24,
                    bottom: 4,
                    fontSize: 10,
                    background: "rgba(255,255,255,.9)",
                    padding: "2px 4px",
                    borderRadius: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fname}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDraftFile(i);
                  }}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
