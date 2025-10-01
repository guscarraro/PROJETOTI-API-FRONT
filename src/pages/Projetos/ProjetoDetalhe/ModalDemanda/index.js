// src/pages/Projetos/components/ModalDemanda.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { MODAL_CLASS } from "../../style";

export default function ModalDemanda({
  isOpen,
  toggle,
  onConfirm,
  /** [{ key:number|string, label:string }] */
  sectorOptions = [],
  /** { [sectorId:number]: [{ id, nome?, email? }] } */
  usersBySector = {},
  /** [{ no:number, label?:string }] */
  stages = [],
}) {
  const [titulo, setTitulo] = useState("");
  const [selectedSectors, setSelectedSectors] = useState([]); // **ids** dos setores
  const [submitting, setSubmitting] = useState(false);

  // Responsável (opcional)
  const [assigneeUserId, setAssigneeUserId] = useState(""); // string

  // Etapas
  const [stageNo, setStageNo] = useState("1");      // string
  const [stageLabel, setStageLabel] = useState(""); // string

  // Mapas auxiliares de setor (id -> label)
  const sectorNameById = useMemo(() => {
    const m = new Map();
    for (const s of sectorOptions) {
      m.set(Number(s.key), String(s.label || "").trim());
    }
    return m;
  }, [sectorOptions]);

  // Mapa etapa->label das etapas existentes
  const stageMap = useMemo(() => {
    const m = new Map();
    for (const s of stages || []) {
      const n = Number(s.no);
      if (!Number.isNaN(n)) m.set(n, s.label || "");
    }
    return m;
  }, [stages]);

  // Opções de etapa: existentes + próxima (max+1) / vazio → 1 (nova)
  const stageOptions = useMemo(() => {
    const existing = [...stageMap.keys()].sort((a, b) => a - b);
    if (existing.length === 0) {
      return [{ no: 1, label: "1 (nova)" }];
    }
    const maxNo = existing[existing.length - 1];
    const opts = existing.map((n) => ({
      no: n,
      label: `${n} — ${stageMap.get(n) || "Sem rótulo"}`,
    }));
    opts.push({ no: maxNo + 1, label: `${maxNo + 1} (nova)` });
    return opts;
  }, [stageMap]);

  // Reset ao abrir
  useEffect(() => {
    if (!isOpen) return;
    setTitulo("");
    setSelectedSectors([]);
    setAssigneeUserId("");
    setSubmitting(false);

    // etapa default → próxima (max+1) ou 1
    const firstNo = stageOptions.length ? stageOptions[0].no : 1;
    setStageNo(String(firstNo));
    const n = Number(firstNo);
    setStageLabel(stageMap.has(n) ? (stageMap.get(n) || "") : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // União de usuários dos setores selecionados + rótulo "nomeUsuario (Setor)"
  const availableUsers = useMemo(() => {
    if (!selectedSectors.length) return [];

    const selectedIds = selectedSectors.map((k) => Number(k));
    const seen = new Set();
    const merged = [];

    for (const sid of selectedIds) {
      const arr = usersBySector[sid] || [];
      for (const u of arr) {
        const uid = String(u.id);
        if (seen.has(uid)) continue;
        seen.add(uid);

        const email = String(u.email || "");
        const beforeAt = email.includes("@") ? email.split("@")[0] : (u.nome || email || uid);
        const sectorLabel = sectorNameById.get(sid) || "Sem setor";
        merged.push({
          ...u,
          __label: `${beforeAt} (${sectorLabel})`,
          __firstSector: sid, // setor do primeiro encontro (para assignee_setor_id)
        });
      }
    }

    merged.sort((a, b) => (a.__label || "").localeCompare(b.__label || ""));
    return merged;
  }, [selectedSectors, usersBySector, sectorNameById]);

  // Se o responsável atual sair da lista, limpa seleção
  useEffect(() => {
    if (!assigneeUserId) return;
    const stillThere = availableUsers.some((u) => String(u.id) === String(assigneeUserId));
    if (!stillThere) setAssigneeUserId("");
  }, [availableUsers, assigneeUserId]);

  // Troca etapa: se existente puxa label, se nova limpa para digitar
  const handleChangeStage = (val) => {
    setStageNo(val);
    const n = Number(val);
    if (stageMap.has(n)) {
      setStageLabel(stageMap.get(n) || "");
    } else {
      setStageLabel("");
    }
  };

  const toggleSector = (k) => {
    setSelectedSectors((prev) => {
      const exists = prev.includes(k);
      return exists ? prev.filter((x) => x !== k) : [...prev, k];
    });
  };

  // Determina o setor do usuário responsável para enviar como assignee_setor_id
  const findSectorForAssignee = (uid) => {
    if (!uid) return null;
    const selectedIds = selectedSectors.map((k) => Number(k));
    for (const sid of selectedIds) {
      const arr = usersBySector[sid] || [];
      if (arr.some((u) => String(u.id) === String(uid))) {
        return sid;
      }
    }
    const found = availableUsers.find((u) => String(u.id) === String(uid));
    return found?.__firstSector ?? null;
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      alert("Informe o descritivo da demanda.");
      return;
    }

    const n = Number(stageNo);
    const validStage = !Number.isNaN(n) && n >= 1 ? n : 1;

    const label =
      stageMap.has(validStage) ? (stageMap.get(validStage) || "") : (stageLabel || "");

    const assigneeSetorId = findSectorForAssignee(assigneeUserId);

    // >>> payload (row_sectors agora vai como **nomes**/labels)
    const payload = {
      title: titulo.trim(),
      row_sectors: selectedSectors.map(k => (sectorNameById.get(Number(k)) || String(k)).toUpperCase()),

      assignees: assigneeUserId ? [String(assigneeUserId)] : [],
      stage_no: validStage,
      stage_label: label,
      ...(assigneeSetorId ? { assignee_setor_id: Number(assigneeSetorId) } : {}),
    };

    try {
      setSubmitting(true);
      await onConfirm?.(payload);
      toggle?.();
    } finally {
      setSubmitting(false);
    }
  };

  // Filtra para NUNCA mostrar setor ADM no checklist
  const sectorOptionsNoADM = useMemo(
    () => sectorOptions.filter((opt) => String(opt.label).toUpperCase() !== "ADM"),
    [sectorOptions]
  );

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      contentClassName={MODAL_CLASS}
    >
      <ModalHeader toggle={toggle}>Nova demanda</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>Título / Descritivo</Label>
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Levantar requisitos do módulo X"
          />
        </FormGroup>

        <FormGroup>
          <Label>Setores responsáveis</Label>
          {sectorOptionsNoADM.length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Nenhum setor participante definido para este projeto.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {sectorOptionsNoADM.map((opt) => (
                <label
                  key={opt.key}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSectors.includes(opt.key)}
                    onChange={() => toggleSector(opt.key)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            Se não escolher um responsável, a demanda ficará atribuída aos setores marcados.
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Responsável (opcional)</Label>
          <Input
            type="select"
            value={assigneeUserId}
            onChange={(e) => setAssigneeUserId(e.target.value)}
            disabled={availableUsers.length === 0}
          >
            <option value="">— sem responsável —</option>
            {availableUsers.map((u) => (
              <option key={String(u.id)} value={String(u.id)}>
                {u.__label /* ex.: joao.silva (Frete) */}
              </option>
            ))}
          </Input>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            A lista mostra usuários dos setores selecionados (nomeAntesDo@ + setor).
          </div>
        </FormGroup>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 8 }}>
          <FormGroup style={{ marginBottom: 0 }}>
            <Label>Etapa (mín. 1)</Label>
            <Input
              type="select"
              value={stageNo}
              onChange={(e) => handleChangeStage(e.target.value)}
            >
              {stageOptions.map((opt) => (
                <option key={opt.no} value={String(opt.no)}>
                  {opt.label}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup style={{ marginBottom: 0 }}>
            <Label>Rótulo da etapa</Label>
            <Input
              placeholder={
                stageMap.has(Number(stageNo))
                  ? "(rótulo carregado automaticamente)"
                  : `ex.: Etapa ${stageNo}`
              }
              value={stageLabel}
              onChange={(e) => setStageLabel(e.target.value)}
              disabled={stageMap.has(Number(stageNo))}
            />
          </FormGroup>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={submitting}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSave} disabled={submitting}>
          {submitting ? "Criando..." : "Criar demanda"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
