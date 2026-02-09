import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "reactstrap";
import { toast } from "react-toastify";
import apiLocal from "../../../../services/apiLocal";

function onlyDigits(s) {
  return String(s || "").replace(/\D/g, "");
}

function sanitizeChave44(raw) {
  const d = onlyDigits(raw);
  if (d.length !== 44) return "";
  return d;
}

function sumDocsTotals(docs) {
  let totalPeso = 0;
  let totalVol = 0;
  let totalPal = 0;

  const arr = Array.isArray(docs) ? docs : [];
  for (let i = 0; i < arr.length; i++) {
    const it = arr[i] || {};
    const kg = Number(it.pesoKg ?? it.peso_kg ?? 0);
    totalPeso += Math.round(kg * 100) / 100;
    totalVol += Number(it.volumes || 0);
    totalPal += Number(it.pallets || 0);
  }

  return {
    totalPesoKg: totalPeso,
    totalVolumes: totalVol,
    totalPallets: totalPal,
  };
}

function errMsg(e) {
  return String(e?.response?.data?.detail || e?.message || e || "Erro");
}

function normalizeCliente(clienteAny) {
  if (!clienteAny) return { nome: "—", cnpj: "" };

  if (typeof clienteAny === "string") {
    return { nome: clienteAny, cnpj: "" };
  }

  if (typeof clienteAny === "object") {
    const nome = String(clienteAny.nome || clienteAny.cliente_nome || "—");
    const cnpj = String(
      clienteAny.cnpj || clienteAny.doc || clienteAny.cliente_doc || "",
    );
    return { nome, cnpj };
  }

  return { nome: "—", cnpj: "" };
}

export default function ModalInfo({
  isOpen,
  toggle,
  task,
  operadores,
  actorName,
  onDidChange,
  onSaveMeta,
  isSavingMeta,
}) {
  const [loading, setLoading] = useState(false);
  const [local, setLocal] = useState(null);

  const [chaveInput, setChaveInput] = useState("");
  const [respQuery, setRespQuery] = useState("");

  const [cancelMode, setCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [isDark, setIsDark] = useState(false);
  const [obsDraft, setObsDraft] = useState("");
  const [ocType, setOcType] = useState(""); // F/A/I/S
  const [ocJust, setOcJust] = useState("");
  const [showOcForm, setShowOcForm] = useState(false);

  const safeOperadores = useMemo(
    () => (Array.isArray(operadores) ? operadores : []),
    [operadores],
  );

  useEffect(() => {
    let darkFromUser = false;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      darkFromUser = String(u?.darkmode || "").toUpperCase() === "S";
    } catch {}

    let darkFromBody = false;
    try {
      darkFromBody =
        document?.body?.classList?.contains("dark") ||
        document?.documentElement?.classList?.contains("dark") ||
        document?.documentElement?.getAttribute?.("data-theme") === "dark";
    } catch {}

    setIsDark(!!(darkFromUser || darkFromBody));
  }, [isOpen]);

  // ✅ abre com o task e depois busca detalhe no endpoint CORRETO: /info
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!isOpen || !task?.id) return;

      setLocal((prev) => {
        if (prev?.id === task.id) return prev;
        return JSON.parse(JSON.stringify(task));
      });

      setLoading(true);
      setChaveInput("");
      setRespQuery("");
      setCancelMode(false);
      setCancelReason("");

      try {
        if (typeof apiLocal.getDemandaOpcInfo !== "function") {
          toast.error(
            "Falta apiLocal.getDemandaOpcInfo (GET /demandas-opc/:id/info)",
          );
          return;
        }

        const res = await apiLocal.getDemandaOpcInfo(task.id);
        const payload = res?.data || {};

        const demanda = payload?.demanda || payload || null;

        // ✅ alguns backs devolvem docs, outros notas
        const docsBack = Array.isArray(payload?.docs)
          ? payload.docs
          : Array.isArray(payload?.notas)
            ? payload.notas
            : [];

        if (!alive) return;
        const occs = Array.isArray(demanda?.ocorrencias)
          ? demanda.ocorrencias
          : Array.isArray(task?.ocorrencias)
            ? task.ocorrencias
            : [];

        const lastOcc = occs.length ? occs[occs.length - 1] : null;

        const clienteObj =
          demanda?.cliente && typeof demanda.cliente === "object"
            ? demanda.cliente
            : demanda?.cliente_nome
              ? { nome: demanda.cliente_nome, cnpj: demanda.cliente_doc }
              : task?.cliente && typeof task.cliente === "object"
                ? task.cliente
                : task?.cliente || null;

        const recebimento = demanda?.recebimento
          ? demanda.recebimento
          : {
              motorista:
                demanda?.motorista ?? task?.recebimento?.motorista ?? null,
              chegadaAt:
                demanda?.chegada_at ??
                demanda?.chegadaAt ??
                task?.recebimento?.chegadaAt ??
                null,
              placaCavalo:
                demanda?.placa_cavalo ??
                demanda?.placaCavalo ??
                task?.recebimento?.placaCavalo ??
                null,
              placaCarreta:
                demanda?.placa_carreta ??
                demanda?.placaCarreta ??
                task?.recebimento?.placaCarreta ??
                null,
            };

        const merged = {
          id: String(demanda?.id || task.id),
          tipo: demanda?.tipo || task.tipo,
          status: demanda?.status || task.status,

          createdAt:
            demanda?.created_at ||
            demanda?.createdAt ||
            task?.createdAt ||
            null,
          startedAt:
            demanda?.started_at ||
            demanda?.startedAt ||
            task?.startedAt ||
            null,
          finishedAt:
            demanda?.finished_at ||
            demanda?.finishedAt ||
            task?.finishedAt ||
            null,
          elapsedSeconds: Number(
            demanda?.elapsed_seconds ??
              demanda?.elapsedSeconds ??
              task?.elapsedSeconds ??
              0,
          ),

          locked: !!(demanda?.locked || task.locked),
          paletizada: !!(demanda?.paletizada ?? task?.paletizada),

          cliente: clienteObj,
          observacao: demanda?.observacao || task?.observacao || "",
          // ✅ ocorrência (novo)
          ocorrencias: occs,

          responsaveis: Array.isArray(demanda?.responsaveis)
            ? demanda.responsaveis
            : Array.isArray(task?.responsaveis)
              ? task.responsaveis
              : [],
          logs: Array.isArray(demanda?.logs)
            ? demanda.logs
            : Array.isArray(task?.logs)
              ? task.logs
              : [],

          recebimento,

          docs: docsBack,

          cancelReason:
            demanda?.cancelReason ||
            demanda?.cancel_reason ||
            task?.cancelReason ||
            null,
          cancelledBy:
            demanda?.cancelledBy ||
            demanda?.cancelled_by ||
            task?.cancelledBy ||
            null,
          cancelledAt:
            demanda?.cancelledAt ||
            demanda?.cancelled_at ||
            task?.cancelledAt ||
            null,
        };

        setLocal(merged);
      } catch (e) {
        // mantém o básico
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [isOpen, task?.id]);
  const responsaveis = useMemo(
    () => (Array.isArray(local?.responsaveis) ? local.responsaveis : []),
    [local],
  );
  useEffect(() => {
    if (!isOpen) return;
    if (!local) return;

    setObsDraft(String(local.observacao || ""));
    setOcType(String(local.tp_ocorren || ""));
    setOcJust(String(local.ocorren || ""));
    setShowOcForm(false);
  }, [isOpen, local?.id]);

  const docs = useMemo(
    () => (Array.isArray(local?.docs) ? local.docs : []),
    [local],
  );
  const totals = useMemo(() => sumDocsTotals(docs), [docs]);

  const canEdit = useMemo(() => {
    if (!local) return false;
    if (local.locked) return false;
    if (local.status === "CONCLUIDA") return false;
    if (local.status === "CANCELADA") return false;
    return true;
  }, [local]);

  const responsaves = useMemo(
    () => (Array.isArray(local?.responsaveis) ? local.responsaveis : []),
    [local],
  );
  const logs = useMemo(
    () => (Array.isArray(local?.logs) ? local.logs : []),
    [local],
  );

  const clienteText = useMemo(() => {
    const c = normalizeCliente(local?.cliente);
    return c.cnpj ? `${c.nome} • ${c.cnpj}` : c.nome;
  }, [local?.cliente]);

  const addResponsavel = useCallback(
    (name) => {
      const n = String(name || "").trim();
      if (!n) return;

      setLocal((prev) => {
        if (!prev) return prev;
        const rs = Array.isArray(prev.responsaveis)
          ? [...prev.responsaveis]
          : [];
        for (let i = 0; i < rs.length; i++) if (rs[i] === n) return prev;
        rs.push(n);
        return { ...prev, responsaveis: rs };
      });

      if (onDidChange) onDidChange();
      setRespQuery("");
    },
    [onDidChange],
  );

  const removeResponsavel = useCallback(
    (name) => {
      setLocal((prev) => {
        if (!prev) return prev;
        const rs = Array.isArray(prev.responsaveis) ? prev.responsaveis : [];
        const next = [];
        for (let i = 0; i < rs.length; i++)
          if (rs[i] !== name) next.push(rs[i]);
        return { ...prev, responsaveis: next };
      });

      if (onDidChange) onDidChange();
    },
    [onDidChange],
  );

  const opsFiltered = useMemo(() => {
    const q = String(respQuery || "")
      .toLowerCase()
      .trim();
    const out = [];

    for (let i = 0; i < safeOperadores.length; i++) {
      const name = String(safeOperadores[i] || "").trim();
      if (!name) continue;

      let already = false;
      for (let j = 0; j < responsaveis.length; j++) {
        if (responsaveis[j] === name) {
          already = true;
          break;
        }
      }
      if (already) continue;

      if (!q || name.toLowerCase().includes(q)) out.push(name);
      if (out.length >= 8) break;
    }

    return out;
  }, [safeOperadores, responsaveis, respQuery]);

  const addNota = useCallback(async () => {
    if (!local?.id) return;

    const chave = sanitizeChave44(chaveInput);
    if (!chave) {
      toast.error("Chave inválida (precisa 44 dígitos).");
      return;
    }

    setLoading(true);
    try {
      const res = await apiLocal.addDocsToDemandaOpc(local.id, {
        chaves: [chave],
        by: actorName,
      });

      const payload = res?.data || {};
      const demanda = payload?.demanda || payload || null;
      const docsBack = Array.isArray(payload?.docs)
        ? payload.docs
        : Array.isArray(payload?.notas)
          ? payload.notas
          : null;

      const updated = {
        ...local,
        responsaveis: Array.isArray(demanda?.responsaveis)
          ? demanda.responsaveis
          : local.responsaveis,
        logs: Array.isArray(demanda?.logs) ? demanda.logs : local.logs,
        docs: docsBack && docsBack.length ? docsBack : local.docs,
      };

      setLocal(updated);
      if (onDidChange) onDidChange();

      setChaveInput("");
      toast.success("Nota vinculada com sucesso.");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [local, chaveInput, actorName, onDidChange]);

  const removeNota = useCallback(
    async (nfId) => {
      if (!local?.id || !nfId) return;

      setLoading(true);
      try {
        const res = await apiLocal.removeDocFromDemandaOpc(local.id, nfId, {
          by: actorName,
        });

        const payload = res?.data || {};
        const demanda = payload?.demanda || payload || null;
        const docsBack = Array.isArray(payload?.docs)
          ? payload.docs
          : Array.isArray(payload?.notas)
            ? payload.notas
            : null;

        const updated = {
          ...local,
          responsaveis: Array.isArray(demanda?.responsaveis)
            ? demanda.responsaveis
            : local.responsaveis,
          logs: Array.isArray(demanda?.logs) ? demanda.logs : local.logs,
          docs: docsBack ? docsBack : local.docs,
        };

        setLocal(updated);
        if (onDidChange) onDidChange();

        toast.success("Nota desvinculada.");
      } catch (e) {
        toast.error(errMsg(e));
      } finally {
        setLoading(false);
      }
    },
    [local, actorName, onDidChange],
  );

  const save = useCallback(async () => {
    if (!local?.id) return;

    setLoading(true);
    try {
      const res = await apiLocal.updateResponsaveisDemandaOpc(local.id, {
        responsaveis: Array.isArray(local.responsaveis)
          ? local.responsaveis
          : [],
        by: actorName,
      });

      const payload = res?.data || {};
      const demanda = payload?.demanda || payload || null;
      const docsBack = Array.isArray(payload?.docs)
        ? payload.docs
        : Array.isArray(payload?.notas)
          ? payload.notas
          : null;

      const updated = {
        ...local,
        responsaveis: Array.isArray(demanda?.responsaveis)
          ? demanda.responsaveis
          : local.responsaveis,
        logs: Array.isArray(demanda?.logs) ? demanda.logs : local.logs,
        docs: docsBack ? docsBack : local.docs,
      };

      setLocal(updated);
      if (onDidChange) onDidChange();

      toast.success("Alterações salvas.");
      if (toggle) toggle();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [local, actorName, onDidChange, toggle]);

  const saveObservacao = useCallback(async () => {
    if (!local?.id) return;

    const nextObs = String(obsDraft || "").trim();

    setLoading(true);
    try {
      if (typeof onSaveMeta !== "function") {
        toast.error("Falta onSaveMeta (pai) / patchDemandaOpcMeta (apiLocal).");
        return;
      }

      await onSaveMeta(local.id, { observacao: nextObs, by: actorName });

      setLocal((prev) => (prev ? { ...prev, observacao: nextObs } : prev));
      if (onDidChange) onDidChange();

      toast.success("Observação salva.");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [local?.id, obsDraft, actorName, onSaveMeta, onDidChange]);
  function normalizeOcType(v) {
    const x = String(v || "")
      .trim()
      .toUpperCase();
    if (x === "FALTA") return "F";
    if (x === "AVARIA") return "A";
    if (x === "INVERSAO" || x === "INVERSÃO") return "I";
    if (x === "SOBRA") return "S";
    if (x === "F" || x === "A" || x === "I" || x === "S") return x;
    return "";
  }

  const lancarOcorrencia = useCallback(async () => {
    if (!local?.id) return;

    const tp = normalizeOcType(ocType);
    const just = String(ocJust || "").trim();

    if (!tp) {
      toast.error("Selecione o tipo (F/A/I/S).");
      return;
    }
    if (!just) {
      toast.error("Informe a justificativa.");
      return;
    }

    setLoading(true);
    try {
      if (typeof onSaveMeta !== "function") {
        toast.error("Falta onSaveMeta (pai) / patchDemandaOpcMeta (apiLocal).");
        return;
      }

      await onSaveMeta(local.id, {
        tp_ocorren: tp,
        ocorren: just,
        by: actorName,
      });

      setLocal((prev) => {
        if (!prev) return prev;

        const nextOccs = Array.isArray(prev.ocorrencias)
          ? [...prev.ocorrencias]
          : [];
        nextOccs.push({
          tp,
          just,
          by: actorName,
          at: new Date().toISOString(),
        });

        return {
          ...prev,
          ocorrencias: nextOccs,
          tp_ocorren: tp,
          ocorren: just,
        };
      });

      if (onDidChange) onDidChange();

      toast.success("Ocorrência lançada.");
      setShowOcForm(false);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [local?.id, ocType, ocJust, actorName, onSaveMeta, onDidChange]);

  const confirmCancel = useCallback(async () => {
    if (!local?.id) return;

    const reason = String(cancelReason || "").trim();
    if (!reason) {
      toast.error("Informe a justificativa.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiLocal.cancelDemandaOpc(local.id, {
        reason,
        by: actorName,
      });

      const payload = res?.data || {};
      const demanda = payload?.demanda || payload || null;
      const docsBack = Array.isArray(payload?.docs)
        ? payload.docs
        : Array.isArray(payload?.notas)
          ? payload.notas
          : null;

      const updated = {
        ...local,
        status: "CANCELADA",
        locked: true,
        cancelReason: demanda?.cancelReason || demanda?.cancel_reason || reason,
        cancelledBy: demanda?.cancelledBy || demanda?.cancelled_by || actorName,
        cancelledAt:
          demanda?.cancelledAt ||
          demanda?.cancelled_at ||
          new Date().toISOString(),
        logs: Array.isArray(demanda?.logs) ? demanda.logs : local.logs,
        docs: docsBack && docsBack.length ? docsBack : local.docs,
      };

      setLocal(updated);
      if (onDidChange) onDidChange();

      toast.success("Tarefa cancelada.");
      if (toggle) toggle();
    } catch (e) {
      const updated = {
        ...local,
        status: "CANCELADA",
        locked: true,
        cancelReason: reason,
        cancelledBy: actorName,
        cancelledAt: new Date().toISOString(),
        docs: local.docs,
      };

      setLocal(updated);
      if (onDidChange) onDidChange();

      toast.warn("Back não cancelou. Cancelado localmente (sem apagar notas).");
      if (toggle) toggle();
    } finally {
      setLoading(false);
    }
  }, [local, cancelReason, actorName, onDidChange, toggle]);

  const headerId = local?.id ? local.id : task?.id || "—";
  const occsUi = Array.isArray(local?.ocorrencias) ? local.ocorrencias : [];
  return (
    <>
      <style>
        {`
.mi-modal-dark .modal-content{
  background: #0f172a;
  color: #e5e7eb;
  border: 1px solid rgba(255,255,255,.08);
}
.mi-modal-dark .modal-header,
.mi-modal-dark .modal-footer{
  border-color: rgba(255,255,255,.08) !important;
}
.mi-modal-dark .form-control{
  background-color: #0b1220 !important;
  color: #e5e7eb !important;
  border-color: rgba(255,255,255,.12) !important;
}
.mi-modal-dark .form-control::placeholder{
  color: rgba(229,231,235,.55) !important;
}
.mi-modal-dark .form-control:focus{
  box-shadow: 0 0 0 0.2rem rgba(59,130,246,.25) !important;
  border-color: rgba(59,130,246,.45) !important;
}
.mi-oplist{
  margin-top: 6px;
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 10px;
  overflow: hidden;
}
.mi-modal-dark .mi-oplist{
  border: 1px solid rgba(255,255,255,.12);
}
.mi-opitem{
  padding: 10px 12px;
  cursor: pointer;
  background: rgba(0,0,0,.02);
}
.mi-opitem:hover{
  background: rgba(0,0,0,.06);
}
.mi-modal-dark .mi-opitem{
  background: rgba(255,255,255,.03);
}
.mi-modal-dark .mi-opitem:hover{
  background: rgba(255,255,255,.06);
}
        `}
      </style>

      <Modal
        isOpen={isOpen}
        toggle={toggle}
        centered
        size="lg"
        modalClassName={isDark ? "mi-modal-dark" : ""}
        contentClassName={isDark ? "mi-modal-dark" : ""}
      >
        <ModalHeader toggle={toggle}>
          Detalhes • {headerId} — {local ? clienteText : "Carregando..."}
        </ModalHeader>

        <ModalBody>
          <div style={{ display: "grid", gap: 12 }}>
            {loading ? (
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Carregando / salvando...
              </div>
            ) : null}

            {!local ? (
              <div style={{ padding: 12, fontSize: 13, opacity: 0.8 }}>
                Abrindo detalhes...
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Tipo (travado)
                    </div>
                    <Input value={local.tipo || ""} disabled />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
                    <Input value={local.status || ""} disabled />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Volumes</div>
                    <Input value={String(totals.totalVolumes)} disabled />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Kg</div>
                    <Input
                      value={String(Number(totals.totalPesoKg || 0).toFixed(2))}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Observação</div>
                  </div>

                  <Input
                    type="textarea"
                    value={obsDraft}
                    onChange={(e) => setObsDraft(e.target.value)}
                    disabled={!canEdit || loading}
                    rows={3}
                    placeholder="Opcional: anote algo importante da tarefa..."
                  />
                  <Button
                    color="primary"
                    size="sm"
                    onClick={saveObservacao}
                    disabled={!canEdit || loading || !local}
                    style={{ marginTop: 5 }}
                  >
                    Salvar obs
                  </Button>
                </div>
                <div
                  style={{
                    borderTop: "1px solid rgba(0,0,0,.08)",
                    paddingTop: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>Ocorrência</div>

                    {canEdit ? (
                      <Button
                        color="danger"
                        outline
                        size="sm"
                        disabled={loading}
                        onClick={() => setShowOcForm((v) => !v)}
                      >
                        {showOcForm ? "Fechar" : "Lançar ocorrência"}
                      </Button>
                    ) : null}
                  </div>

                  {/* ✅ Exibição em destaque (se existir) */}

                  {occsUi.length ? (
                    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      {occsUi
                        .slice()
                        .reverse()
                        .map((o, idx) => (
                          <div
                            key={`${o.at || "x"}-${idx}`}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 12,
                              border: "1px solid rgba(185, 28, 28, 0.35)",
                              background: "rgba(220, 38, 38, 0.06)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 900,
                                color: "rgba(185, 28, 28, 0.95)",
                              }}
                            >
                              {String(o.tp || "").toUpperCase()} • {o.by || "—"}{" "}
                              •{" "}
                              <span style={{ opacity: 0.75 }}>
                                {o.at ? new Date(o.at).toLocaleString() : "—"}
                              </span>
                            </div>
                            <div style={{ marginTop: 6, fontSize: 13 }}>
                              {o.just || ""}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                      Sem ocorrência registrada.
                    </div>
                  )}

                  {/* ✅ Form */}
                  {showOcForm && canEdit ? (
                    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "160px 1fr",
                          gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, opacity: 0.7 }}>Tipo</div>
                          <Input
                            type="select"
                            value={ocType}
                            onChange={(e) => setOcType(e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Selecione...</option>
                            <option value="F">Falta (F)</option>
                            <option value="A">Avaria (A)</option>
                            <option value="I">Inversão (I)</option>
                            <option value="S">Sobra (S)</option>
                          </Input>
                        </div>

                        <div>
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            Justificativa
                          </div>
                          <Input
                            value={ocJust}
                            onChange={(e) => setOcJust(e.target.value)}
                            disabled={loading}
                            placeholder="Descreva o que aconteceu..."
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
                        <Button
                          color="danger"
                          onClick={lancarOcorrencia}
                          disabled={loading}
                        >
                          Confirmar ocorrência
                        </Button>
                        <Button
                          color="secondary"
                          outline
                          onClick={() => {
                            setShowOcForm(false);
                            setOcType(String(local?.tp_ocorren || ""));
                            setOcJust(String(local?.ocorren || ""));
                          }}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(0,0,0,.08)",
                    paddingTop: 10,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    Notas / Documentos
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Input
                      value={chaveInput}
                      onChange={(e) => setChaveInput(e.target.value)}
                      placeholder="Chave 44 dígitos"
                      disabled={!canEdit || loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addNota();
                        }
                      }}
                    />
                    <Button
                      color="primary"
                      onClick={addNota}
                      disabled={!canEdit || loading}
                    >
                      Add
                    </Button>
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    {docs.length === 0 ? (
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Nenhuma nota vinculada.
                      </div>
                    ) : (
                      docs.map((d) => {
                        const chave = String(d.chave || "");
                        const shortChave =
                          chave.length === 44
                            ? `${chave.slice(0, 6)}…${chave.slice(-4)}`
                            : chave || "—";

                        const vol = Number(d.volumes || 0);
                        const pal = Number(d.pallets || 0);
                        const kg = Number(d.pesoKg ?? d.peso_kg ?? 0);

                        return (
                          <div
                            key={d.id || chave}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 10px",
                              border: "1px solid rgba(0,0,0,.08)",
                              borderRadius: 10,
                            }}
                          >
                            <div style={{ fontSize: 13 }}>
                              <b>Chave:</b> {shortChave}
                              <span style={{ opacity: 0.7 }}>
                                {" "}
                                • Vol {vol} • Kg {kg}
                              </span>
                            </div>

                            {canEdit ? (
                              <Button
                                color="danger"
                                outline
                                size="sm"
                                disabled={loading}
                                onClick={() => removeNota(d.id)}
                              >
                                Remover
                              </Button>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(0,0,0,.08)",
                    paddingTop: 10,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    Responsáveis
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {responsaveis.length ? (
                      responsaveis.map((r) => (
                        <div
                          key={r}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 10px",
                            border: "1px solid rgba(0,0,0,.08)",
                            borderRadius: 999,
                            background: "rgba(0,0,0,.03)",
                          }}
                        >
                          <span style={{ fontSize: 13 }}>{r}</span>
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => removeResponsavel(r)}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                fontWeight: 900,
                                opacity: 0.7,
                                color: "inherit",
                              }}
                            >
                              ×
                            </button>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Sem responsáveis.
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <Input
                      value={respQuery}
                      onChange={(e) => setRespQuery(e.target.value)}
                      placeholder="Digite para buscar e selecionar operador..."
                      disabled={!canEdit || loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (opsFiltered.length > 0)
                            addResponsavel(opsFiltered[0]);
                        }
                      }}
                    />

                    {canEdit && !loading && opsFiltered.length > 0 ? (
                      <div className="mi-oplist">
                        {opsFiltered.map((op) => (
                          <div
                            key={op}
                            className="mi-opitem"
                            onClick={() => addResponsavel(op)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addResponsavel(op);
                            }}
                          >
                            {op}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(0,0,0,.08)",
                    paddingTop: 10,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>Logs</div>
                  <div
                    style={{
                      maxHeight: 220,
                      overflow: "auto",
                      border: "1px solid rgba(0,0,0,.08)",
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    {logs.length === 0 ? (
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Sem logs.
                      </div>
                    ) : (
                      logs.map((l, idx) => (
                        <div
                          key={`${l.at || "x"}-${idx}`}
                          style={{
                            padding: "6px 0",
                            borderBottom: "1px dashed rgba(0,0,0,.08)",
                          }}
                        >
                          <div style={{ fontSize: 12 }}>
                            <b>{l.by}</b> •{" "}
                            <span style={{ opacity: 0.7 }}>
                              {l.at ? new Date(l.at).toLocaleString() : "—"}
                            </span>
                          </div>
                          <div style={{ fontSize: 13 }}>{l.action}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(0,0,0,.08)",
                    paddingTop: 10,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    Cancelar tarefa
                  </div>

                  {!cancelMode ? (
                    <Button
                      color="danger"
                      outline
                      disabled={!canEdit || loading}
                      onClick={() => setCancelMode(true)}
                    >
                      Cancelar (exige justificativa)
                    </Button>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      <Input
                        type="textarea"
                        rows={3}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Justificativa do cancelamento..."
                        disabled={loading}
                      />
                      <div style={{ display: "flex", gap: 10 }}>
                        <Button
                          color="secondary"
                          disabled={loading}
                          onClick={() => {
                            setCancelMode(false);
                            setCancelReason("");
                          }}
                        >
                          Voltar
                        </Button>
                        <Button
                          color="danger"
                          disabled={loading}
                          onClick={confirmCancel}
                        >
                          Confirmar cancelamento
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={loading}>
            Fechar
          </Button>
          <Button
            color="primary"
            onClick={save}
            disabled={!canEdit || loading || !local}
          >
            Salvar alterações
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
