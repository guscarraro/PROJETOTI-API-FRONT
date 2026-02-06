import React, { useMemo } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

export default function ModalFinalizar({ isOpen, toggle, task, onConfirm }) {
  const title = useMemo(() => {
    if (!task) return "Finalizar tarefa";
    return `Finalizar ${task.id}`;
  }, [task]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered contentClassName="prodop-modal">
      <ModalHeader toggle={toggle}>{title}</ModalHeader>

      <ModalBody>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>
          Tem certeza que deseja encerrar essa atividade?
        </div>

        {task ? (
          <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.35 }}>
            <div>
              <b>Tipo:</b> {task.tipo}
            </div>
            <div>
              <b>Cliente:</b> {task.cliente}
            </div>
            <div>
              <b>Status atual:</b> {task.status}
            </div>
            <div>
              <b>Tempo:</b> {task.elapsedSeconds != null ? `${task.elapsedSeconds}s` : "—"}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, opacity: 0.85 }}>—</div>
        )}

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
          Dica: depois de finalizada ela fica <b>travada</b> (sem edição).
        </div>
      </ModalBody>

      <ModalFooter style={{ display: "flex", gap: 10 }}>
        <Button color="secondary" outline onClick={toggle}>
          Não
        </Button>
        <Button color="primary" onClick={onConfirm} disabled={!task}>
          Sim, finalizar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
