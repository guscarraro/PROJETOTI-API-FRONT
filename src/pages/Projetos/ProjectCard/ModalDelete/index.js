import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { MODAL_CLASS } from "../../style";

export default function ModalDelete({
  isOpen,
  onCancel,
  onConfirm,
  busy = false,
  projectName = "",
}) {
  return (
    <Modal
      isOpen={isOpen}
      toggle={busy ? undefined : onCancel}
      size="sm"
      contentClassName={MODAL_CLASS}
    >
      <ModalHeader toggle={busy ? undefined : onCancel}>
        Confirmar exclusão
      </ModalHeader>
      <ModalBody>
        Tem certeza que deseja excluir o projeto{" "}
        <b>&ldquo;{projectName}&rdquo;</b>?<br />
        Esta ação é <b>irreversível</b>.
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button color="danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Excluindo..." : "Excluir"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
