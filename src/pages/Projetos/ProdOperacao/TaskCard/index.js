import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Card,
  TopRow,
  Left,
  IconWrap,
  TitleCol,
  Title,
  Sub,
  StatusCol,
  StatusWrap,
  Badge,
  LockPill,
  TimeRow,
  TimeText,
  MetaRow,
  MetaLine,
  MetaGrid,
  MetaItem,
  Obs,
  RecvGrid,
  RecvBox,
  RecvLine,
  BtnRow,
  BtnPrimary,
  BtnGhost,
} from "./style";

import {
  FaTruck,
  FaBoxesStacked,
  FaTruckFast,
  FaClipboardCheck,
  FaPlay,
  FaFlagCheckered,
  FaClock,
  FaWeightHanging,
  FaBoxOpen,
  FaIdBadge,
  FaCarSide,
  FaUser,
  FaCirclePlay,
  FaCirclePause,
  FaCircleCheck,
  FaRegClock,
  FaBan,
  FaPallet,
  FaCalendarDays,
} from "react-icons/fa6";
import { FiLock } from "react-icons/fi";
import { Loader } from "../style";

function pickStatusVariant(status) {
  if (status === "EM_ANDAMENTO") return "run";
  if (status === "PAUSADA") return "pause";
  if (status === "CONCLUIDA") return "done";
  if (status === "CANCELADA") return "cancel";
  return "prog";
}

function prettyStatus(status) {
  if (status === "EM_ANDAMENTO") return "Em andamento";
  if (status === "PAUSADA") return "Pausada";
  if (status === "CONCLUIDA") return "Concluída";
  if (status === "CANCELADA") return "Cancelada";
  return "Programada";
}

function StatusIcon({ status }) {
  if (status === "EM_ANDAMENTO") return <FaCirclePlay />;
  if (status === "PAUSADA") return <FaCirclePause />;
  if (status === "CONCLUIDA") return <FaCircleCheck />;
  if (status === "CANCELADA") return <FaBan />;
  return <FaRegClock />;
}

function TipoIcon({ tipo }) {
  if (tipo === "Recebimento") return <FaTruck />;
  if (tipo === "Separação") return <FaBoxesStacked />;
  if (tipo === "Expedição") return <FaTruckFast />;
  if (tipo === "Conferência") return <FaClipboardCheck />;
  return <FaBoxOpen />;
}

function n2(v) {
  const x = Number(v || 0);
  return Math.round(x * 100) / 100;
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

function fmtDt(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return "—";
  }
}

function safeDateMs(v) {
  if (!v) return 0;
  try {
    const ms = new Date(v).getTime();
    if (!Number.isFinite(ms)) return 0;
    return ms;
  } catch {
    return 0;
  }
}

function normTp(v) {
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

function trunc17(s) {
  const x = String(s || "");
  return x.length > 17 ? `${x.slice(0, 17)}...` : x;
}

export default function TaskCard({
  task,
  formatTime,
  onStart,
  onFinish,
  onOpen,
  disabled = false,
  isOpening = false,
  isStarting = false,
  isFinishing = false,
}) {
  const status = String(task?.status || "PROGRAMADA").toUpperCase();
  const isCancelled = status === "CANCELADA";

  const statusVariant = useMemo(() => pickStatusVariant(status), [status]);

  const canStart = status === "PROGRAMADA" && !isCancelled;
  const canFinish = (status === "EM_ANDAMENTO" || status === "PAUSADA") && !isCancelled;

  const paletizada = !!task?.paletizada;

  const totalVolumes = Number(task.totalVolumes ?? task.volumes ?? 0);
  const totalPesoKg = n2(task.totalPesoKg ?? task.pesoKg ?? 0);
  const totalPallets = Number(task.totalPallets ?? task.pallets ?? 0);

  const rec = task.recebimento || null;

  // ✅ BUGFIX: exp estava usando recebimento
  const exp = task.expedicao || {
    motorista: task.motorista,
    placaCavalo: task.placa_cavalo,
    placaCarreta: task.placa_carreta,
  };

  const isEffectivelyLocked = !!task.locked || isCancelled;

  const disableOpen = disabled || isOpening || isStarting || isFinishing;
  const disableStart = disableOpen || isEffectivelyLocked || !canStart;
  const disableFinish = disableOpen || isEffectivelyLocked || !canFinish;

  const isExpedicao =
    String(task?.tipo || "").toLowerCase() === "expedição" ||
    String(task?.tipo || "").toLowerCase() === "expedicao";

  const cliente = useMemo(() => normalizeCliente(task?.cliente), [task?.cliente]);
  const clienteTextRaw = cliente.cnpj ? `${cliente.nome} • ${cliente.cnpj}` : cliente.nome;
  const clienteText = useMemo(() => trunc17(clienteTextRaw), [clienteTextRaw]);

  const expMotorista = String(exp?.motorista || "").trim();
  const expPlaca =
    String(exp?.placaCavalo || exp?.placa_cavalo || "").trim() ||
    String(exp?.placaCarreta || exp?.placa_carreta || "").trim();

  const expedicaoTitle = useMemo(() => {
    const m = expMotorista || "—";
    const p = expPlaca || "—";
    return trunc17(`${m} • ${p}`);
  }, [expMotorista, expPlaca]);

  const ocorrenciasBadges = useMemo(() => {
    const arr = Array.isArray(task?.ocorrencias) ? task.ocorrencias : [];

    const seen = {};
    const out = [];

    for (let i = 0; i < arr.length; i++) {
      const tp = normTp(
        arr[i]?.tp || arr[i]?.tipo || arr[i]?.tp_ocorren || arr[i]?.tpOcorren,
      );
      if (!tp) continue;
      if (seen[tp]) continue;
      seen[tp] = true;
      out.push(tp);
    }

    if (out.length === 0) {
      const tp = normTp(task?.tp_ocorren || task?.tpOcorren);
      const just = String(task?.ocorren || "").trim();
      if (tp && just) out.push(tp);
    }

    return out;
  }, [task?.ocorrencias, task?.tp_ocorren, task?.tpOcorren, task?.ocorren]);

  const createdAt = task?.createdAt || task?.created_at || null;

  const placaCavalo = rec?.placaCavalo || rec?.placa_cavalo || "—";
  const placaCarreta = rec?.placaCarreta || rec?.placa_carreta || "—";
  const motorista = rec?.motorista || "—";
  const chegadaAt = rec?.chegadaAt || rec?.chegada_at || null;

  // =========================
  // ✅ CRONÔMETRO EM TEMPO REAL + FALLBACK CONCLUÍDA
  // =========================
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (status !== "EM_ANDAMENTO") return;

    const id = setInterval(() => {
      setTick((v) => v + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [status]);

  const startedMs = useMemo(
    () => safeDateMs(task?.startedAt || task?.started_at),
    [task?.startedAt, task?.started_at],
  );

  const finishedMs = useMemo(
    () => safeDateMs(task?.finishedAt || task?.finished_at),
    [task?.finishedAt, task?.finished_at],
  );

  const baseElapsed = useMemo(() => Number(task?.elapsedSeconds || 0), [task?.elapsedSeconds]);

  // ✅ fallback quando vem CONCLUIDA mas elapsedSeconds vem 0
  const computedElapsedIfMissing = useMemo(() => {
    if (baseElapsed > 0) return baseElapsed;
    if (!startedMs || !finishedMs) return baseElapsed;
    const diffSec = Math.floor((finishedMs - startedMs) / 1000);
    return diffSec > 0 ? diffSec : baseElapsed;
  }, [baseElapsed, startedMs, finishedMs]);

  const displaySeconds = useMemo(() => {
    if (status === "EM_ANDAMENTO") {
      if (!startedMs) return baseElapsed;

      const nowMs = Date.now();
      const diffSec = Math.floor((nowMs - startedMs) / 1000);
      if (diffSec < 0) return baseElapsed;

      return baseElapsed + diffSec;
    }

    // ✅ concluída/pausada/etc: usa fallback calculado
    return computedElapsedIfMissing;
  }, [status, baseElapsed, startedMs, tick, computedElapsedIfMissing]);

  const over40 = Number(displaySeconds || 0) >= 40 * 60;

  const handleStart = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (disableStart) return;
      if (onStart) onStart();
    },
    [onStart, disableStart],
  );

  const handleFinish = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (disableFinish) return;
      if (onFinish) onFinish();
    },
    [onFinish, disableFinish],
  );

  return (
    <Card
      $tipo={task.tipo}
      $locked={isEffectivelyLocked}
      $over40={over40}
      $cancelled={isCancelled}
      role="button"
      tabIndex={0}
      title="Clique para ver detalhes"
      onClick={() => {
        if (disableOpen) return;
        if (onOpen) onOpen(task);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onOpen && !disableOpen) onOpen(task);
      }}
      style={{
        cursor: disableOpen ? "not-allowed" : "pointer",
        opacity: disableOpen ? 0.88 : 1,
      }}
    >
      <TopRow>
        <Left>
          <IconWrap $tipo={task.tipo} aria-hidden="true">
            <TipoIcon tipo={task.tipo} />
          </IconWrap>

          <TitleCol>
            <Title title={String(task.id || "")}>Ordem: {task.id}</Title>

            <Sub>
              <span style={{ fontWeight: 900 }}>
                {isExpedicao ? expedicaoTitle : clienteText}
              </span>

              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {paletizada ? <FaPallet title="Carga paletizada" /> : <FaBoxOpen title="Carga solta" />}
                {paletizada ? "Paletizada" : "Não paletizada"}
              </span>

              {ocorrenciasBadges.length ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {ocorrenciasBadges.map((tp) => (
                    <span
                      key={tp}
                      title={`Ocorrência: ${tp}`}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 900,
                        color: "white",
                        background: "rgba(220, 38, 38, 0.95)",
                      }}
                    >
                      {tp}
                    </span>
                  ))}
                </span>
              ) : null}
            </Sub>

            <Sub style={{ marginTop: 10, opacity: 0.85, width: "200px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <FaCalendarDays />
                Criada: <b>{fmtDt(createdAt)}</b>
              </span>
            </Sub>
          </TitleCol>
        </Left>

        <StatusCol>
          <TimeRow>
            <FaClock />
            <TimeText>
              <span>{formatTime(displaySeconds)}</span>
            </TimeText>
          </TimeRow>
          <StatusWrap>
            {isEffectivelyLocked ? (
              <LockPill title={isCancelled ? "Cancelada (travada)" : "Travada"}>
                <FiLock /> {isCancelled ? "Cancelada" : "Travada"}
              </LockPill>
            ) : null}

            <Badge $variant={statusVariant} title={prettyStatus(status)}>
              <StatusIcon status={status} />
              <span>{prettyStatus(status)}</span>
            </Badge>
          </StatusWrap>
        </StatusCol>
      </TopRow>

      <MetaRow>
        <MetaLine>
          {paletizada ? <FaPallet /> : <FaBoxOpen />}
          <span>
            <b>{paletizada ? totalPallets : totalVolumes}</b> {paletizada ? "pallets" : "volumes"}
          </span>
        </MetaLine>

        <MetaLine>
          <FaWeightHanging />
          <span>
            <b>{totalPesoKg.toFixed(2)}</b> kg
          </span>
        </MetaLine>
      </MetaRow>

      <MetaGrid>
        <MetaItem>
          <small>
            <FaIdBadge /> Responsáveis
          </small>
          <div title={(task.responsaveis || []).join(", ")}>
            {task.responsaveis?.length ? task.responsaveis.join(", ") : "—"}
          </div>
        </MetaItem>

        <MetaItem>
          <small>
            <FaClock /> Início
          </small>
          <div>{task.startedAt ? fmtDt(task.startedAt) : "—"}</div>
        </MetaItem>
      </MetaGrid>

      {task.tipo === "Recebimento" ? (
        <RecvGrid>
          <RecvBox>
            <RecvLine>
              <FaCarSide />
              <span>
                Cavalo: <b>{placaCavalo}</b>
              </span>
            </RecvLine>
            <RecvLine>
              <FaCarSide />
              <span>
                Carreta: <b>{placaCarreta}</b>
              </span>
            </RecvLine>
          </RecvBox>

          <RecvBox>
            <RecvLine>
              <FaUser />
              <span>
                Motorista: <b>{motorista}</b>
              </span>
            </RecvLine>
            <RecvLine>
              <FaClock />
              <span>
                Chegada: <b>{chegadaAt ? fmtDt(chegadaAt) : "—"}</b>
              </span>
            </RecvLine>
          </RecvBox>
        </RecvGrid>
      ) : null}

      {task.cancelReason ? (
        <Obs>
          <b>Cancelamento:</b> {task.cancelReason}
        </Obs>
      ) : null}

      {task.observacao ? (
        <Obs>
          <b>Obs:</b> {task.observacao}
        </Obs>
      ) : null}

      <BtnRow onClick={(e) => e.stopPropagation()}>
        <BtnGhost onClick={handleStart} disabled={disableStart}>
          {isStarting ? (
            <Loader />
          ) : (
            <>
              <FaPlay /> Iniciar
            </>
          )}
        </BtnGhost>

        <BtnPrimary onClick={handleFinish} disabled={disableFinish}>
          {isFinishing ? (
            <Loader />
          ) : (
            <>
              <FaFlagCheckered /> Finalizar
            </>
          )}
        </BtnPrimary>
      </BtnRow>

      {isOpening ? (
        <div
          style={{
            marginTop: 10,
            opacity: 0.75,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <Loader /> Abrindo detalhes...
        </div>
      ) : null}
    </Card>
  );
}
