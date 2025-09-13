import React from "react";
import { Button } from "reactstrap";
import Timeline from "../components/Timeline";

export default function TimelineArea({
  canAddRow,
  onAddRow,
  days,
  rows,
  custos,
  sectorInitial,
  readOnly,
  timelineEnabled,
  onPickColor,
  onSetCellComment,
  onSetRowSector,
  onToggleBaseline,
}) {
  return (
    <>
      {!timelineEnabled && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          Timeline indisponível (tabelas não encontradas).
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Button color="secondary" outline onClick={onAddRow} disabled={!canAddRow}>
          + Nova linha (demanda)
        </Button>
      </div>

      <Timeline
        days={days}
        rows={rows}
        custos={custos}
        currentUserInitial={sectorInitial}
        onPickColor={readOnly || !timelineEnabled ? undefined : onPickColor}
        onSetCellComment={readOnly || !timelineEnabled ? undefined : onSetCellComment}
        onSetRowSector={readOnly || !timelineEnabled ? undefined : onSetRowSector}
        canMarkBaseline={!readOnly && timelineEnabled}
        baselineColor="#0ea5e9"
        onToggleBaseline={readOnly || !timelineEnabled ? undefined : onToggleBaseline}
      />
    </>
  );
}