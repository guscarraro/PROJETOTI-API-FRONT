// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/AttachmentComposer/styles.js
import styled from "styled-components";

export const ComposerWrap = styled.div`
  margin-top: 8px;
  position: relative;
`;

export const ToolbarWrap = styled.div`
  display: flex; align-items: center; gap: 6px;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, #ffffff, #fafafa);
  @media (prefers-color-scheme: dark) {
    background: linear-gradient(180deg, #0b1220, #0f172a); border-color: #334155;
  }
  .dark &, [data-theme="dark"] & {
    background: linear-gradient(180deg, #0b1220, #0f172a); border-color: #334155;
  }
`;

export const TIcon = styled.button`
  width: 32px; height: 28px;
  display: grid; place-items: center;
  border-radius: 6px;
  border: 1px solid ${(p)=>p.$active ? "#60a5fa" : "#e5e7eb"};
  background: ${(p)=>p.$active ? "rgba(96,165,250,.15)" : "#fff"};
  color: ${(p)=>p.$active ? "#1d4ed8" : "#111827"};
  cursor: pointer;
  &:hover { background: ${(p)=>p.$active ? "rgba(96,165,250,.2)" : "#f9fafb"}; }
  &:disabled { opacity: .6; cursor: not-allowed; }

  @media (prefers-color-scheme: dark) {
    border-color: ${(p)=>p.$active ? "#60a5fa" : "#334155"};
    background: ${(p)=>p.$active ? "rgba(96,165,250,.22)" : "#0f172a"};
    color: ${(p)=>p.$active ? "#93c5fd" : "#e5e7eb"};
    &:hover { background: ${(p)=>p.$active ? "rgba(96,165,250,.28)" : "#111a2d"}; }
  }
  .dark &, [data-theme="dark"] & {
    border-color: ${(p)=>p.$active ? "#60a5fa" : "#334155"};
    background: ${(p)=>p.$active ? "rgba(96,165,250,.22)" : "#0f172a"};
    color: ${(p)=>p.$active ? "#93c5fd" : "#e5e7eb"};
    &:hover { background: ${(p)=>p.$active ? "rgba(96,165,250,.28)" : "#111a2d"}; }
  }
`;

export const ColorRow = styled.div`
  display: flex; align-items: center; gap: 6px; margin-left: 4px;
`;

export const Swatch = styled.button`
  width: 22px; height: 22px; border-radius: 999px;
  border: 2px solid ${(p)=>p.$active ? "#60a5fa" : "rgba(0,0,0,.1)"};
  background: ${(p)=>p.$bg};
  cursor: pointer;
  box-shadow: ${(p)=>p.$active ? "0 0 0 2px rgba(96,165,250,.25)" : "none"};

  @media (prefers-color-scheme: dark) {
    border-color: ${(p)=>p.$active ? "#60a5fa" : "#334155"};
  }
  .dark &, [data-theme="dark"] & {
    border-color: ${(p)=>p.$active ? "#60a5fa" : "#334155"};
  }
`;

export const EditorBox = styled.div`
  position: relative;
  border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; background: #fff;
  @media (prefers-color-scheme: dark) { border-color: #334155; background: #0f172a; }
  .dark &, [data-theme="dark"] & { border-color: #334155; background: #0f172a; }
`;

export const Editable = styled.div`
  min-height: 96px; max-height: 220px; overflow: auto;
  padding: 10px 40px 10px 10px; font-size: 14px; color: #111827;
  white-space: pre-wrap; outline: none;
  @media (prefers-color-scheme: dark) { color: #e5e7eb; }
  .dark &, [data-theme="dark"] & { color: #e5e7eb; }

  .sector-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 2px 8px; border-radius: 999px;
    border: 1px solid rgba(0,0,0,.08);
    background: #f3f4f6; color: #111827;
    font-size: 12px; line-height: 18px; margin: 0 4px 0 0;
  }
  .sector-pill .dot {
    width: 8px; height: 8px; border-radius: 999px;
    background: var(--pill-color, #9ca3af);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
  }
  @media (prefers-color-scheme: dark) {
    .sector-pill { background: #111a2d; border-color: #334155; color: #e5e7eb; }
  }
  .dark & .sector-pill, [data-theme="dark"] & .sector-pill {
    background: #111a2d; border-color: #334155; color: #e5e7eb;
  }

  ul { padding-left: 20px; }
`;

export const Placeholder = styled.div`
  pointer-events: none;
  position: absolute; left: 10px; top: 10px;
  font-size: 13px; opacity: .5;
`;

export const AttachBtn = styled.button`
  position: absolute; right: 6px; bottom: 6px;
  width: 28px; height: 28px; border-radius: 8px;
  display: grid; place-items: center;
  border: 1px solid rgba(0,0,0,.08);
  background: transparent; color: grey; cursor: pointer;
  @media (prefers-color-scheme: dark) { border-color: #334155; color: #94a3b8; }
  .dark &, [data-theme="dark"] & { border-color: #334155; color: #94a3b8; }
`;

export const MentionListWrap = styled.div`
  position: fixed; z-index: 2000;
  max-height: 260px; overflow: auto;
  padding: 6px; border-radius: 12px;
  border: 1px solid #e5e7eb; background: #fff;
  box-shadow: 0 10px 30px rgba(0,0,0,.12);
  @media (prefers-color-scheme: dark) {
    background: #0b1220; border-color: #334155; box-shadow: 0 10px 30px rgba(0,0,0,.35);
  }
  .dark &, [data-theme="dark"] & {
    background: #0b1220; border-color: #334155; box-shadow: 0 10px 30px rgba(0,0,0,.35);
  }
`;

export const MentionItem = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px;
  font-size: 14px; cursor: pointer; color: #111827;
  background: ${(p)=>p.$active ? "rgba(96,165,250,.15)" : "transparent"};
  &:hover { background: rgba(0,0,0,.04); }
  @media (prefers-color-scheme: dark) {
    color: #e5e7eb; background: ${(p)=>p.$active ? "rgba(96,165,250,.25)" : "transparent"};
    &:hover { background: rgba(255,255,255,.06); }
  }
  .dark &, [data-theme="dark"] & {
    color: #e5e7eb; background: ${(p)=>p.$active ? "rgba(96,165,250,.25)" : "transparent"};
    &:hover { background: rgba(255,255,255,.06); }
  }
`;

export const Dot = styled.span`
  width: 10px; height: 10px; border-radius: 999px;
  background: ${(p)=>p.$c || "#9ca3af"};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
`;

export const FilesWrap = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;
`;

export const Thumb = styled.div`
  position: relative; width: 140px; height: 96px;
  border-radius: 8px; overflow: hidden;
  border: 1px solid rgba(0,0,0,.08);
  display: grid; place-items: center; background: #fff;
  @media (prefers-color-scheme: dark) { border-color: #334155; background: #0f172a; }
  .dark &, [data-theme="dark"] & { border-color: #334155; background: #0f172a; }
`;

export const ThumbName = styled.div`
  position: absolute; left: 4px; right: 24px; bottom: 4px;
  font-size: 10px; background: rgba(255,255,255,.9);
  padding: 2px 4px; border-radius: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  @media (prefers-color-scheme: dark) { background: rgba(15,23,42,.9); color: #e5e7eb; }
  .dark &, [data-theme="dark"] & { background: rgba(15,23,42,.9); color: #e5e7eb; }
`;

export const RemoveBtn = styled.button`
  position: absolute; top: 4px; right: 4px;
  width: 20px; height: 20px; border-radius: 6px;
  display: grid; place-items: center; border: none;
  background: rgba(17,24,39,.8); color: #fff; cursor: pointer;
`;
