import React from "react";
import { Button } from "reactstrap";
import { TitleBar, H1, Actions } from "../style";
import { FiLock, FiUnlock } from "react-icons/fi";

export default function HeaderBar({ projetoNome, accent, locked, canUnlockByRole, loadingAny, onBack, onToggleLock, onOpenCost, onSave }) {
  return (
    <TitleBar>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button color="secondary" onClick={onBack}>⟵ Voltar</Button>
        <H1 $accent={accent}>{projetoNome}</H1>
      </div>
      <Actions>
        <Button
          color={locked ? "secondary" : "dark"}
          onClick={onToggleLock}
          title={locked ? "Destrancar" : "Trancar"}
          disabled={!canUnlockByRole || loadingAny}
        >
          {locked ? <FiLock size={16} /> : <FiUnlock size={16} />}
        </Button>

        <Button color="danger" onClick={onOpenCost} disabled={loadingAny}>
          Adicionar custo
        </Button>
        <Button color="success" onClick={onSave} disabled={loadingAny}>
          Salvar alterações
        </Button>
      </Actions>
    </TitleBar>
  );
}