import React from "react";
import { Button } from "reactstrap";
import { TitleBar, H1, Actions } from "../../style";
import { LuArrowBigLeft } from "react-icons/lu";
import { FiLock, FiUnlock } from "react-icons/fi";

export default function HeaderBar({
  accent, locked, canUnlockByRole, onToggleLock, onBack, onOpenCosts, readOnly, title
}) {
  return (
    <TitleBar>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button color="secondary" onClick={onBack}>
          <LuArrowBigLeft /> Voltar
        </Button>
        <H1 $accent={accent}>{title}</H1>
      </div>
      <Actions>
        <Button
          color={locked ? "secondary" : "dark"}
          onClick={onToggleLock}
          title={locked ? "Destrancar" : "Trancar"}
          disabled={!canUnlockByRole}
        >
          {locked ? <FiLock size={16} /> : <FiUnlock size={16} />}
        </Button>
        <Button color="warning" onClick={onOpenCosts} disabled={readOnly}>
          Adicionar custo
        </Button>
      </Actions>
    </TitleBar>
  );
}
