import React from "react";
import { LegendBar as LegendBarWrap, LegendItem, LegendDot, SectorDot } from "../../../style";
import { LEGEND_STATUS } from "../constants";

export default function LegendBar({ sectors }) {
    
    
  return (
    <LegendBarWrap>
      {LEGEND_STATUS.map((it) => (
        <LegendItem key={it.label}>
          <LegendDot $color={it.color} />
          <span>{it.label}</span>
        </LegendItem>
      ))}
      {sectors.map((s) => (
        <LegendItem key={s.key}>
          <SectorDot $color={s.color}>{s.initial}</SectorDot>
          <span>{s.label}</span>
        </LegendItem>
      ))}
    </LegendBarWrap>
  );
}
