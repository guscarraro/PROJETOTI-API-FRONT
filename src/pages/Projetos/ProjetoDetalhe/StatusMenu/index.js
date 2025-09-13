import React from "react";
import { Overlay, MenuBox, MenuItem } from "../style";

export default function StatusMenu({ visible, canChange, x, y, onClose, onChange }) {
  if (!visible || !canChange) return null;
  return (
    <>
      <Overlay onClick={onClose} />
      <MenuBox style={{ position: "fixed", left: x, top: y, zIndex: 1100, width: 220 }}>
        <MenuItem onClick={() => onChange("ANDAMENTO")}>Em andamento</MenuItem>
        <MenuItem onClick={() => onChange("STANDBY")}>Stand by</MenuItem>
        <MenuItem onClick={() => onChange("CONCLUIDO")}>Concluído</MenuItem>
        <MenuItem onClick={() => onChange("CANCELADO")}>Cancelado</MenuItem>
      </MenuBox>
    </>
  );
}