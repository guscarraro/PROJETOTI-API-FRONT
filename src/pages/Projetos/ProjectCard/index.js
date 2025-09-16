import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Card, Badge, Muted, FlexRow, SectorDot } from "../style";
import { FaCalendarAlt } from "react-icons/fa";
import { FiLock, FiTrash2, FiUnlock, FiClock } from "react-icons/fi";
import { STATUS } from "../utils";
import apiLocal from "../../../services/apiLocal";
import { toast } from "react-toastify";
import { DeleteBtn, LockBtn, OverlapRow } from "./style";
import ModalDelete from "./ModalDelete";

/* mapeia rótulos -> chave e define paleta por status */
const STATUS_KEY_BY_LABEL = Object.fromEntries(
  Object.entries(STATUS).map(([k, v]) => [String(v).toLowerCase(), k])
);

const STATUS_COLORS = {
  ANDAMENTO: {
    bg: "rgba(37,99,235,.10)",
    fg: "#1e40af",
    border: "rgba(37,99,235,.55)",
  },
  STANDBY: {
    bg: "rgba(245,158,11,.10)",
    fg: "#92400e",
    border: "rgba(245,158,11,.55)",
  },
  CANCELADO: {
    bg: "rgba(239,68,68,.10)",
    fg: "#991b1b",
    border: "rgba(239,68,68,.55)",
  },
  CONCLUIDO: {
    bg: "rgba(5,150,105,.10)",
    fg: "#065f46",
    border: "rgba(5,150,105,.55)",
  },
};

export default function ProjectCard({
  project,
  onOpen,
  onToggleLock,
  onDeleted, // callback após excluir (id)
  sectorList = [],
}) {
  const rawStatus = String(project.status || "").trim();
  const statusKey = (() => {
    const upper = rawStatus.toUpperCase();
    if (STATUS[upper]) return upper;
    return STATUS_KEY_BY_LABEL[rawStatus.toLowerCase()] || "ANDAMENTO";
  })();
  const statusLabel = STATUS[statusKey] || rawStatus;
  const badgeColors = STATUS_COLORS[statusKey] || STATUS_COLORS.ANDAMENTO;

  // usuário atual e checagem de ADM
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const userSectorIds = useMemo(
    () => (Array.isArray(user?.setor_ids) ? user.setor_ids.map(Number) : []),
    [user]
  );
  const isAdmin = useMemo(() => {
    return userSectorIds.some((id) => {
      const s = sectorList.find((x) => Number(x.id) === Number(id));
      const n = (s?.nome || "").trim().toLowerCase();
      return n === "adm" || n === "admin";
    });
  }, [userSectorIds, sectorList]);
  const actorSectorId = userSectorIds[0] || null;

  // visuais
  const getLabelFromId = (id) =>
    sectorList.find((s) => String(s.id) === String(id))?.nome || null;
  const getInitials = (name) => {
    const n = String(name || "").trim();
    if (!n) return "?";
    const words = n.split(/\s+/).filter(Boolean);
    if (words.length === 1)
      return n.length <= 3 ? n.toUpperCase() : n[0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  const palette = [
    "#2563eb",
    "#059669",
    "#f59e0b",
    "#ef4444",
    "#0ea5e9",
    "#8b5cf6",
    "#14b8a6",
    "#f97316",
  ];
  const colorFor = (name) => {
    const s = String(name || "");
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  };

  const sectorNames = (project.setores || [])
    .filter(
      (v) =>
        String(v).toLowerCase() !== "adm" &&
        String(getLabelFromId(v) || "").toLowerCase() !== "adm"
    )
    .map((v) =>
      typeof v === "number" || /^\d+$/.test(String(v))
        ? getLabelFromId(v)
        : String(v)
    )
    .filter(Boolean);
  const uniqueNames = Array.from(new Set(sectorNames));

  const [busy, setBusy] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // ===== contador de dias restantes até a previsão =====
  const daysLeft = useMemo(() => {
    if (!project?.fim) return null;
    const end = new Date(project.fim);
    if (isNaN(end)) return null;
    const endUTC = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    const now = new Date();
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const diff = Math.ceil((endUTC - nowUTC) / 86400000);
    return diff <= 0 ? 0 : diff;
  }, [project?.fim]);

  const timePill = useMemo(() => {
    if (daysLeft == null) return null;
    if (daysLeft === 0)
      return {
        fg: "#374151",
        bg: "rgba(107,114,128,.15)",
        border: "rgba(107,114,128,.35)",
        title: "Encerrado",
      };
    if (daysLeft <= 3)
      return {
        fg: "#991b1b",
        bg: "rgba(239,68,68,.10)",
        border: "rgba(239,68,68,.45)",
        title: "Prazo crítico",
      };
    if (daysLeft <= 10)
      return {
        fg: "#92400e",
        bg: "rgba(245,158,11,.12)",
        border: "rgba(245,158,11,.45)",
        title: "Prazo próximo",
      };
    return {
      fg: "#065f46",
      bg: "rgba(16,185,129,.12)",
      border: "rgba(16,185,129,.45)",
      title: "Dentro do prazo",
    };
  }, [daysLeft]);

  const runDelete = async () => {
    if (!isAdmin) return;
    if (!actorSectorId) {
      toast.error("Setor do ator não identificado.");
      return;
    }
    setBusy(true);
    try {
      await apiLocal.deleteProjeto(project.id, Number(actorSectorId));
      toast.success("Projeto excluído com sucesso!");
      setShowDelete(false);
      onDeleted?.(project.id);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao excluir projeto.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card
        onClick={onOpen}
        title={
          project.locked
            ? "Projeto trancado (leitura)"
            : "Projeto destrancado (edição liberada)"
        }
      >
        <h3
          style={{
            margin: 0,
            marginBottom: 10,
            flex: 1,
            minWidth: 0, // <- permite o ellipsis funcionar em flex
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={project.nome} // <- mostra nome completo no hover
        >
          {project.nome}
        </h3>
        <FlexRow>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge
              style={{
                background: badgeColors.bg,
                color: badgeColors.fg,
                border: `1px solid ${badgeColors.border}`,
              }}
            >
              {statusLabel}
            </Badge>
          </div>

          <OverlapRow onClick={(e) => e.stopPropagation()}>
            {uniqueNames.slice(0, 3).map((label, idx) => (
              <SectorDot
                key={`${label}-${idx}`}
                $color={colorFor(label)}
                title={label}
                style={{ zIndex: 50 - idx }}
              >
                {getInitials(label)}
              </SectorDot>
            ))}
            {uniqueNames.length > 3 && (
              <SectorDot
                key="more"
                $color="#9ca3af"
                title={`+${uniqueNames.length - 3} setores`}
                style={{ fontSize: 10, fontWeight: 700 }}
              >
                +{uniqueNames.length - 3}
              </SectorDot>
            )}
          </OverlapRow>
        </FlexRow>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div>
            <Muted>
              <FaCalendarAlt style={{ marginRight: 6 }} />
              Início:{" "}
              {project.inicio && /^\d{4}-\d{2}-\d{2}$/.test(project.inicio)
                ? project.inicio.split("-").reverse().join("/")
                : new Date(project.inicio).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}
            </Muted>{" "}
            <br />
            <Muted>
              <FaCalendarAlt style={{ marginRight: 6 }} />
              Previsão:{" "}
              {project.fim && /^\d{4}-\d{2}-\d{2}$/.test(project.fim)
                ? project.fim.split("-").reverse().join("/")
                : new Date(project.fim).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}
              {timePill && (
                <span
                  title={`${timePill.title} — ${daysLeft} dia${daysLeft === 1 ? "" : "s"} restante${daysLeft === 1 ? "" : "s"}`}
                  style={{
                    marginLeft: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    color: timePill.fg,
                    background: timePill.bg,
                    border: `1px solid ${timePill.border}`,
                  }}
                >
                  <FiClock size={12} />
                  {daysLeft}d
                </span>
              )}
            </Muted>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LockBtn
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!busy) onToggleLock?.();
              }}
              $locked={!!project.locked}
              aria-pressed={!!project.locked}
              title={project.locked ? "Destrancar projeto" : "Trancar projeto"}
              disabled={busy}
            >
              {project.locked ? <FiLock size={16} /> : <FiUnlock size={16} />}
            </LockBtn>

            {isAdmin && (
              <DeleteBtn
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDelete(true);
                }}
                title="Excluir projeto"
                disabled={busy}
              >
                <FiTrash2 size={16} />
              </DeleteBtn>
            )}
          </div>
        </div>
      </Card>

      <ModalDelete
        isOpen={showDelete}
        onCancel={() => (busy ? null : setShowDelete(false))}
        onConfirm={runDelete}
        busy={busy}
        projectName={project.nome}
      />
    </>
  );
}
