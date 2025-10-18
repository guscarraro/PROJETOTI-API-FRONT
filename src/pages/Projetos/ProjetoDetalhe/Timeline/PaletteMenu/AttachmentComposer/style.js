// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/AttachmentComposer/styles.js
import styled from "styled-components";

export const ComposerWrap = styled.div`
  margin-top: 8px;
  position: relative;
`;

/* ===== Toolbar ===== */

export const ToolbarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border: 1px solid var(--border);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
`;

export const TIcon = styled.button`
  width: 32px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  border: 1px solid ${(p) => (p.$active ? "#60a5fa" : "var(--border)")};
  background: ${(p) => (p.$active ? "rgba(96,165,250,.15)" : "var(--bg-panel)")};
  color: ${(p) => (p.$active ? "#1d4ed8" : "var(--text)")};
  cursor: pointer;

  &:hover {
    background: ${(p) => (p.$active ? "rgba(96,165,250,.2)" : "var(--bg-panel-2)")};
  }
  &:disabled { opacity: .6; cursor: not-allowed; }
`;

export const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
`;

export const Swatch = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid ${(p) => (p.$active ? "#60a5fa" : "var(--border)")};
  background: ${(p) => p.$bg};
  cursor: pointer;
  box-shadow: ${(p) => (p.$active ? "0 0 0 2px rgba(96,165,250,.25)" : "none")};
`;

/* ===== Editor ===== */

export const EditorBox = styled.div`
  position: relative;
  border: 1px solid var(--border);
  border-radius: 0 0 8px 8px;
  background: var(--bg-panel);
`;

export const Editable = styled.div`
  min-height: 96px;
  max-height: 220px;
  overflow: auto;
  padding: 10px 40px 10px 10px;
  font-size: 14px;
  color: var(--text);
  white-space: pre-wrap;
  outline: none;

  .sector-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--chip-border);
    background: var(--chip-bg);
    color: var(--text);
    font-size: 12px;
    line-height: 18px;
    margin: 0 4px 0 0;
  }
  .sector-pill .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--pill-color, #9ca3af);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
  }

  ul { padding-left: 20px; }
`;

export const Placeholder = styled.div`
  pointer-events: none;
  position: absolute;
  left: 10px;
  top: 10px;
  font-size: 13px;
  color: var(--muted);
`;

export const AttachBtn = styled.button`
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid; place-items: center;
  border: 1px solid var(--border);
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
`;

/* ===== Mention ===== */

export const MentionListWrap = styled.div`
  position: fixed; z-index: 2000;
  max-height: 260px; overflow: auto;
  padding: 6px; border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-panel-2);
  box-shadow: var(--shadow);
`;

export const MentionItem = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px;
  font-size: 14px; cursor: pointer;
  color: var(--text);
  background: ${(p) => (p.$active ? "rgba(96,165,250,.15)" : "transparent")};
  &:hover { background: rgba(0,0,0,.04); }
`;

export const Dot = styled.span`
  width: 10px; height: 10px; border-radius: 999px;
  background: ${(p) => p.$c || "#9ca3af"};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
`;

/* ===== Files ===== */

export const FilesWrap = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;
`;

export const Thumb = styled.div`
  position: relative; width: 140px; height: 96px;
  border-radius: 8px; overflow: hidden;
  border: 1px solid var(--border);
  display: grid; place-items: center;
  background: var(--thumb-bg);
`;

export const ThumbName = styled.div`
  position: absolute; left: 4px; right: 24px; bottom: 4px;
  font-size: 10px; background: rgba(255,255,255,.9);
  padding: 2px 4px; border-radius: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  /* em dark a layer translúcida sobre o fundo escuro fica boa mesmo sem condicional */
  color: var(--text);
`;

export const RemoveBtn = styled.button`
  position: absolute; top: 4px; right: 4px;
  width: 20px; height: 20px; border-radius: 6px;
  display: grid; place-items: center; border: none;
  background: rgba(17,24,39,.8); color: #fff; cursor: pointer;
`;
