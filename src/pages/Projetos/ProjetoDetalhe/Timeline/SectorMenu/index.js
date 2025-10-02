import React from "react";
import { MenuBox, MenuItem, SectorDot } from "../../../style";

export default function SectorMenu({ sectors, rows, sectorMenu, pickSector, close }) {
  if (!sectorMenu) return null;
  const row = rows.find((r) => r.id === sectorMenu.rowId);
const MARGIN = 8;
const ESTIMATED_ROW_H = 36; // altura média de um item
const estimatedH = Math.min(
  (Array.isArray(sectors) ? sectors.length : 0) * ESTIMATED_ROW_H + 16,
  window.innerHeight - 2 * MARGIN
);
const clampedTop  = Math.max(
  MARGIN,
  Math.min(sectorMenu.y, window.innerHeight - estimatedH - MARGIN)
);
const MENU_W = 320; // mesmo valor do max-width
const clampedLeft = Math.max(
  MARGIN,
  Math.min(sectorMenu.x, window.innerWidth - MENU_W - MARGIN)
);

  return (
    <MenuBox
  style={{ position: "fixed", left: clampedLeft, top: clampedTop }}
  onClick={(e) => e.stopPropagation()}
>
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
