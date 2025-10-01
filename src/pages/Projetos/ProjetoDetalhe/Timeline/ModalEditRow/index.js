// src/pages/Projetos/ProjetoDetalhe/Timeline/ModalEditRow.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input,
} from "reactstrap";
import { MODAL_CLASS } from "../../../style";

/**
 * Props:
 * - isOpen, onClose
 * - row: { id, titulo, sectors, assignees, stageNo, stageLabel, assignee_setor_id? }
 * - sectors: [{ key, label, color, initial }, ...]
 * - usersBySector: { [sectorKey ou setor_id]: [{ id, nome?, email?, setor_ids? }] }
 * - sectorIdByKey: { [sectorKey]: setor_id(string) }
 * - usersIndex: { [userId]: { id, email, nome?, setor_ids?: number[] } }
 * - canEdit: boolean
 * - canEditAssignee?: boolean (default = canEdit)
 * - canEditSectors?: boolean (default = canEdit)
 * - onSubmit: async (rowId, payloadDoPUT) => void
 * - stages?: [{ no:number, label?:string }]
 */
export default function ModalEditRow({
  isOpen,
  onClose,
  row,
  sectors = [],
  usersBySector = {},
  sectorIdByKey = {},
  usersIndex = {},
  canEdit = false,
  canEditAssignee: canEditAssigneeProp,
  canEditSectors: canEditSectorsProp,
  onSubmit,
  stages = [],
}) {
  const canEditAssignee = canEditAssigneeProp ?? canEdit;
  const canEditSectors = canEditSectorsProp ?? canEdit;
const [isSubmitting, setIsSubmitting] = useState(false);

  const [titulo, setTitulo] = useState(row?.titulo || "");
  const [selectedSectors, setSelectedSectors] = useState(
    Array.isArray(row?.sectors) ? row.sectors.slice() : []
  );

  const firstAssignee = (Array.isArray(row?.assignees) && row.assignees[0]) ? String(row.assignees[0]) : "";
  const [assigneeUserId, setAssigneeUserId] = useState(firstAssignee);

  const initialStageNo = Number(row?.stageNo || row?.stage_no || 1);
  const initialStageLabel = row?.stageLabel || row?.stage_label || "";
  const [stageNo, setStageNo] = useState(String(initialStageNo || 1));
  const [stageLabel, setStageLabel] = useState(initialStageLabel);

  // setor preferido do responsável (mesmo campo usado no AssigneeMenu)
  const assigneeSectorId = row?.assignee_setor_id ?? row?.assigneeSetorId ?? null;

  useEffect(() => {
    if (!isOpen) return;
    setTitulo(row?.titulo || "");
    setSelectedSectors(Array.isArray(row?.sectors) ? row.sectors.slice() : []);
    const a0 = (Array.isArray(row?.assignees) && row.assignees[0]) ? String(row.assignees[0]) : "";
    setAssigneeUserId(a0);
    const stN = Number(row?.stageNo || row?.stage_no || 1);
    setStageNo(String(stN || 1));
    setStageLabel(row?.stageLabel || row?.stage_label || "");
  }, [isOpen, row]);

  // id -> key (ex.: "7" -> "QUALIDADE")
  const idToKey = useMemo(() => {
    const m = {};
    for (const s of sectors) {
      const id = sectorIdByKey?.[s.key];
      if (id != null) m[String(id)] = s.key;
    }
    return m;
  }, [sectors, sectorIdByKey]);

  // mapa etapa->label existentes
  const stageMap = useMemo(() => {
    const m = new Map();
    for (const s of stages || []) {
      const n = Number(s.no);
      if (!Number.isNaN(n)) m.set(n, s.label || "");
    }
    return m;
  }, [stages]);

  // opções de etapa
  const stageOptions = useMemo(() => {
    const existing = [...stageMap.keys()].sort((a, b) => a - b);
    if (existing.length === 0) return [{ no: 1, label: "1 (nova)" }];
    const maxNo = existing[existing.length - 1];
    const opts = existing.map((n) => ({ no: n, label: `${n} — ${stageMap.get(n) || "Sem rótulo"}` }));
    opts.push({ no: maxNo + 1, label: `${maxNo + 1} (nova)` });
    return opts;
  }, [stageMap]);

  // === TODOS os usuários (união total: usersBySector para todas as chaves/ids + usersIndex)
  const availableUsers = useMemo(() => {
    const seen = new Set();
    const merged = [];

    // 1) varre todos os arrays de usersBySector (por key textual e por id numérico)
    for (const [k, arrAny] of Object.entries(usersBySector || {})) {
      const arr = Array.isArray(arrAny) ? arrAny : [];
      for (const u of arr) {
        const uid = String(u?.id || "");
        if (!uid) continue;
        if (/admin@/i.test(u?.email || "")) continue; // tira admin
        if (!seen.has(uid)) {
          seen.add(uid);
          merged.push(u);
        }
      }
    }

    // 2) adiciona usersIndex (garantindo todos)
    for (const u of Object.values(usersIndex || {})) {
      const uid = String(u?.id || "");
      if (!uid) continue;
      if (/admin@/i.test(u?.email || "")) continue; // tira admin
      if (!seen.has(uid)) {
        seen.add(uid);
        merged.push(u);
      }
    }

    // 3) ordena
    merged.sort((a, b) =>
      (a.nome || a.email || "").localeCompare(b.nome || b.email || "")
    );

    return merged;
  }, [usersBySector, usersIndex]);

  // quando mudar o responsável, auto-marca o(s) setor(es) do usuário se ainda não estiverem checados
  const handleChangeAssignee = (newUidStr) => {
    setAssigneeUserId(newUidStr);

    if (!newUidStr) return;

    // tenta puxar os setor_ids do usersIndex
    const uFromIndex = usersIndex?.[String(newUidStr)];

    let setorIds = Array.isArray(uFromIndex?.setor_ids)
      ? uFromIndex.setor_ids.map(Number).filter(Number.isFinite)
      : [];

    // fallback: se não tiver setor_ids, infere olhando usersBySector com chaves numéricas
    if (setorIds.length === 0) {
      const foundIds = new Set();
      for (const [k, arrAny] of Object.entries(usersBySector || {})) {
        if (!/^\d+$/.test(k)) continue; // só ids
        const arr = Array.isArray(arrAny) ? arrAny : [];
        if (arr.some((u) => String(u?.id) === String(newUidStr))) {
          foundIds.add(Number(k));
        }
      }
      setorIds = Array.from(foundIds);
    }

    if (setorIds.length === 0) return;

    // converte ids -> keys e adiciona aos selecionados
    const keysToAdd = setorIds
      .map((sid) => idToKey[String(sid)])
      .filter(Boolean);

    if (keysToAdd.length === 0) return;

    setSelectedSectors((prev) => {
      const set = new Set(prev);
      for (const k of keysToAdd) set.add(k);
      return Array.from(set);
    });
  };

  useEffect(() => {
    // se o responsável atual não estiver na lista (improvável agora), limpa
    if (!assigneeUserId) return;
    const ok = availableUsers.some((u) => String(u.id) === String(assigneeUserId));
    if (!ok) setAssigneeUserId("");
  }, [availableUsers, assigneeUserId]);

  const handleChangeStage = (val) => {
    setStageNo(val);
    const n = Number(val);
    if (stageMap.has(n)) setStageLabel(stageMap.get(n) || "");
    else setStageLabel("");
  };

  const toggleSectorKey = (k) =>
    setSelectedSectors((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );

  // determina assignee_setor_id (numérico) baseado nos setores selecionados:
  const computeAssigneeSetorId = (uid) => {
    if (!uid) return null;

    // ids dos setores atualmente selecionados
    const selectedIds = selectedSectors
      .map((k) => sectorIdByKey?.[k])
      .filter((v) => v != null)
      .map((v) => Number(v));

    // prioriza um setor do usuário que também esteja selecionado
    const u = usersIndex?.[String(uid)] || availableUsers.find((x) => String(x.id) === String(uid));
    const sids = Array.isArray(u?.setor_ids) ? u.setor_ids.map(Number) : [];

    const intersect = sids.find((sid) => selectedIds.includes(sid));
    if (Number.isFinite(intersect)) return intersect;

    // senão, usa o primeiro setor do usuário (se houver)
    if (Number.isFinite(sids?.[0])) return sids[0];

    // último fallback: setor preferido existente na row
    if (Number.isFinite(Number(assigneeSectorId))) return Number(assigneeSectorId);

    return null;
  };

  const submit = async () => {
    if (!canEdit) return;

    // etapa
    const n = Number(stageNo);
    const validStage = !Number.isNaN(n) && n >= 1 ? n : 1;
    const label = stageMap.has(validStage) ? (stageMap.get(validStage) || "") : (stageLabel || "");

    // setores (sempre array plano de string)
    const row_sectors = (selectedSectors || []).flat().map(String);

    // responsável
    const assignees = assigneeUserId ? [String(assigneeUserId)] : [];
    const assignee_setor_id = computeAssigneeSetorId(assigneeUserId);

    // título
    const title = (titulo || "").trim();

    // payload
    const payload = {
      title,
      row_sectors,
      assignees,
      stage_no: validStage,
      stage_label: label,
      ...(Number.isFinite(assignee_setor_id) ? { assignee_setor_id } : {}),
    };

    setIsSubmitting(true);
try {
  await onSubmit?.(row.id, payload);
  onClose?.();
} finally {
  setIsSubmitting(false);
}

    onClose?.();
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" contentClassName={MODAL_CLASS}>
      <ModalHeader toggle={onClose}>Editar demanda</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>Nome da demanda</Label>
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={!canEdit}
          />
        </FormGroup>

        <FormGroup>
          <Label>Setores responsáveis</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
            {sectors.map((s) => (
              <label key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={selectedSectors.includes(s.key)}
                  disabled={!canEditSectors}
                  onChange={() => toggleSectorKey(s.key)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Responsável (opcional)</Label>
          <Input
            type="select"
            value={assigneeUserId}
            onChange={(e) => handleChangeAssignee(e.target.value)}
            disabled={!canEditAssignee}
          >
            <option value="">— sem responsável —</option>
            {availableUsers.map((u) => (
              <option key={String(u.id)} value={String(u.id)}>
                {u.nome || u.email || String(u.id)}
              </option>
            ))}
          </Input>
        </FormGroup>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 8 }}>
          <FormGroup style={{ marginBottom: 0 }}>
            <Label>Etapa</Label>
            <Input
              type="select"
              value={stageNo}
              onChange={(e) => handleChangeStage(e.target.value)}
              disabled={!canEdit}
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
                (stageMap.has(Number(stageNo)) && stageLabel)
                  ? stageLabel
                  : `ex.: Etapa ${stageNo}`
              }
              value={stageLabel}
              onChange={(e) => setStageLabel(e.target.value)}
              disabled={!canEdit || stageMap.has(Number(stageNo))}
            />
          </FormGroup>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={onClose}>Cancelar</Button>
        <Button color="primary" onClick={submit} disabled={!canEdit || isSubmitting}>

          Salvar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
