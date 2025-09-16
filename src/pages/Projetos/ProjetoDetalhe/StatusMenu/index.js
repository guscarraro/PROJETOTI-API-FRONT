import React from "react";
import { MenuBox, MenuItem } from "../../style";

export default function StatusMenu({ x, y, onChangeStatus }) {
  return (
    <MenuBox style={{ position: "fixed", left: x, top: y, zIndex: 1100, width: 220 }}>
      <MenuItem onClick={() => onChangeStatus("ANDAMENTO")}>Em andamento</MenuItem>
      <MenuItem onClick={() => onChangeStatus("STANDBY")}>Stand by</MenuItem>
      <MenuItem onClick={() => onChangeStatus("CONCLUIDO")}>Concluído</MenuItem>
      <MenuItem onClick={() => onChangeStatus("CANCELADO")}>Cancelado</MenuItem>
    </MenuBox>
  );
}
