import React from "react";
import { MenuBox, MenuItem, SectorDot } from "../../../style";

export default function SectorMenu({ sectors, rows, sectorMenu, pickSector, close }) {
  if (!sectorMenu) return null;
  const row = rows.find((r) => r.id === sectorMenu.rowId);

  return (
    <MenuBox style={{ position: "fixed", left: sectorMenu.x, top: sectorMenu.y }} onClick={(e)=>e.stopPropagation()}>
      {sectors.map((s) => {
        const selected = Array.isArray(row?.sectors) ? row.sectors.includes(s.key) : row?.sector === s.key;
        return (
          <MenuItem key={s.key} onClick={() => pickSector(s.key)} $active={selected}>
            <SectorDot $color={s.color} style={{ marginRight: 8 }}>{s.initial}</SectorDot>
            {s.label}
          </MenuItem>
        );
      })}
    </MenuBox>
  );
}
