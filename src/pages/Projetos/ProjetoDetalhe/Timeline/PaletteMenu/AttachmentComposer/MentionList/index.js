// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/AttachmentComposer/components/MentionList.js
import React from "react";
import { MentionListWrap, MentionItem, Dot } from "../style";

export default function MentionList({
  left,
  top,
  options,
  activeIndex,
  onHover,
  onSelect,
}) {
  return (
    <MentionListWrap style={{ left, top }}>
      {options.map((s, i) => (
        <MentionItem
          key={s.key}
          $active={i === activeIndex}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
        >
          <Dot $c={s.color || "#9ca3af"} />
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {s.label || s.key}
          </span>
        </MentionItem>
      ))}
    </MentionListWrap>
  );
}
