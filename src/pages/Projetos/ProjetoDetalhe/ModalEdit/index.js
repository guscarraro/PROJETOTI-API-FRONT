import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { toast } from "react-toastify";
import { MODAL_CLASS, GlobalModalStyles } from "../../style";
import useLoading from "../../../../hooks/useLoading";
import apiLocal from "../../../../services/apiLocal";

export default function ModalEdit({
  isOpen,
  toggle,
  project,
  sectors = [], // [{id,nome}, ...]
  actorSectorId, // int
  canSave = false, // true se Admin (só Admin salva)
  onSaved, // callback(projectLean)
}) {
  const loading = useLoading();

  const [nome, setNome] = useState(project?.nome || "");
  const baseSetores = useMemo(
    () => (Array.isArray(project?.setores) ? project.setores.map(Number) : []),
    [project?.setores]
  );
  const creatorSid = Number(project?.created_by_sector_id) || null;
  const [selectedSetores, setSelectedSetores] = useState(baseSetores);
  // setores sem ADM/Admin
  const selectable = useMemo(() => {
    return (sectors || []).filter((s) => {
      const n = (s?.nome || "").trim().toLowerCase();
      return n !== "adm" && n !== "admin";
    });
  }, [sectors]);

  useEffect(() => {
    setNome(project?.nome || "");
    setSelectedSetores(baseSetores);
  }, [project?.id, baseSetores]);

  const handleSave = async () => {
    if (!canSave) {
      toast.error("Apenas o setor Admin pode salvar estas alterações.");
      return;
    }
    if (!actorSectorId) {
      toast.error("Setor do ator não identificado.");
      return;
    }
    const nomeChanged = (nome || "").trim() !== (project?.nome || "");
    const payload = {
      ...(nomeChanged ? { nome: (nome || "").trim() } : {}),
      setores: selectedSetores.map(Number), // lista final (criador já incluso e travado)
    };
    if (!Object.keys(payload).length) {
      toast.info("Nada para atualizar.");
      return;
    }
    try {
      const res = await loading.wrap("patch-meta", async () =>
        apiLocal.patchProjetoMeta(project.id, payload, Number(actorSectorId))
      );
      const updated = res?.data; // LeanProjectOut
      toast.success("Projeto atualizado!");
      onSaved?.(updated);
      toggle?.();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Falha ao atualizar projeto.";
      toast.error(msg);
    }
  };

  return (
    <>
      <GlobalModalStyles />
      <Modal
        isOpen={isOpen}
        toggle={loading.any() ? undefined : toggle}
        size="md"
        contentClassName={MODAL_CLASS}
      >
        <ModalHeader toggle={loading.any() ? undefined : toggle}>
          Editar nome do projeto e participantes
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Novo nome (opcional)</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading.any()}
                placeholder="Digite o novo nome do projeto"
              />
            </FormGroup>

            <FormGroup>
              <Label>Setores do projeto</Label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: 8,
                }}
              >
                {selectable.map((s) => {
                  const idNum = Number(s.id);
                  const checked = selectedSetores.includes(idNum);
                  const isCreator = idNum === creatorSid;
                  return (
                    <label
                      key={s.id}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="checkbox"
                        disabled={loading.any() || isCreator}
                        checked={checked}
                        onChange={(e) =>
                          setSelectedSetores((prev) =>
                            e.target.checked
                              ? Array.from(new Set([...prev, idNum]))
                              : prev.filter((x) => x !== idNum)
                          )
                        }
                      />
                      <span>
                        {s.nome}
                        {isCreator ? " (criador)" : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={loading.any()}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onClick={handleSave}
            disabled={loading.any() || !canSave}
            title={!canSave ? "Somente Admin pode salvar" : "Salvar alterações"}
          >
            {loading.is("patch-meta") ? "Salvando..." : "Salvar"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
