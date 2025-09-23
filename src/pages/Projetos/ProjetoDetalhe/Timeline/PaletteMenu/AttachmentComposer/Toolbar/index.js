// src/pages/Projetos/ProjetoDetalhe/Timeline/PaletteMenu/AttachmentComposer/components/Toolbar.js
import React from "react";
import { FiBold, FiList, FiTrash2 } from "react-icons/fi";
import { ToolbarWrap, TIcon, ColorRow, Swatch } from "../style";

export default function Toolbar({
  isBold,
  isList,
  activeColorName,
  onBold,
  onUL,
  onPickColorName,
  onClearAll,
  swatches,
  disabled,
}) {
  return (
    <ToolbarWrap>
      <TIcon type="button" title="Negrito" onClick={onBold} disabled={disabled} $active={isBold}>
        <FiBold size={14} />
      </TIcon>
      <TIcon type="button" title="Tópicos (bullets)" onClick={onUL} disabled={disabled} $active={isList}>
        <FiList size={14} />
      </TIcon>

      <ColorRow>
        {swatches.map((c) => (
          <Swatch
            key={c.name}
            title={c.name === "default" ? "Cor padrão (preto/branco no dark)" : `Cor ${c.name}`}
            $bg={c.hex}
            $active={activeColorName === c.name}
            onClick={() => onPickColorName(c.name)}
            disabled={disabled}
          />
        ))}
      </ColorRow>

      <div style={{ marginLeft: "auto" }} />
      <TIcon type="button" title="Limpar texto e formatação" onClick={onClearAll} $active={false} disabled={disabled}>
        <FiTrash2 size={14} />
      </TIcon>
    </ToolbarWrap>
  );
}
