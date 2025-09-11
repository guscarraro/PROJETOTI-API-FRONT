// src/pages/Projetos/components/ProjectCard.js
import React from "react";
import styled from "styled-components";
import { Card, Badge, Muted, FlexRow, SectorDot } from "../style";
import { FaCalendarAlt } from "react-icons/fa";
import { FiLock, FiUnlock } from "react-icons/fi";
import { STATUS } from "../utils";

/* Botão de cadeado com animação e suporte a dark mode */
const LockBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  cursor: pointer;
  transition: transform .18s ease, background .18s ease, box-shadow .18s ease, border-color .18s ease, color .18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(0,0,0,.08);
  }

  svg {
    transition: transform .25s ease;
    transform: ${p => (p.$locked ? "rotate(-10deg) scale(0.95)" : "rotate(0deg) scale(1)")};
  }

  /* Estado visual quando trancado (light) */
  ${p => p.$locked && `
    background: rgba(16,185,129,.12);
    border-color: rgba(16,185,129,.35);
    color: #065f46;
  `}

  /* Dark mode com respeito ao estado $locked */
  [data-theme="dark"] & {
    background: ${p => p.$locked ? "rgba(16,185,129,.18)" : "#0f172a"};
    border-color: ${p => p.$locked ? "rgba(16,185,129,.5)" : "rgba(255,255,255,.08)"};
    color: ${p => p.$locked ? "#34d399" : "#e5e7eb"};
    box-shadow: 0 8px 16px rgba(2,6,23,.4);

    &:hover {
      box-shadow: 0 10px 18px rgba(2,6,23,.55);
      border-color: ${p => p.$locked ? "rgba(16,185,129,.6)" : "rgba(255,255,255,.12)"};
    }
  }
`;
const ADMIN_UUID = "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";
const TI_UUID = "d2c5a1b8-4f23-4f93-b1e5-3d9f9b8a9a3f";
const FRETE_UUID = "958db54e-add5-45f6-8aef-739d6ba7cb4c";
const SAC_UUID = "43350e26-12f4-4094-8cfb-2a66f250838d";
const OPER_UUID = "442ec24d-4c7d-4b7e-b1dd-8261c9376d0f";
const DIRET_UUID = "9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4";

const SECTORS = [
  { id: SAC_UUID, label: "SAC", initial: "S", color: "#2563eb" },
  { id: OPER_UUID, label: "Operação", initial: "O", color: "#059669" },
  { id: FRETE_UUID, label: "Frete", initial: "F", color: "#f59e0b" },
  { id: DIRET_UUID, label: "Diretoria", initial: "D", color: "#ef4444" },
  { id: TI_UUID, label: "TI", initial: "T", color: "#0ea5e9" },
  { id: ADMIN_UUID, label: "Admin", initial: "A", color: "#111827" },
];
const SECTOR_MAP = Object.fromEntries(SECTORS.map(s => [s.id, s]));

export default function ProjectCard({ project, onOpen, onToggleLock }) {
  const variant =
    project.status === STATUS.ANDAMENTO
      ? "andamento"
      : project.status === STATUS.STANDBY
        ? "standby"
        : "cancelado";

  return (
    <Card onClick={onOpen} title={project.locked ? "Projeto trancado (leitura)" : "Projeto destrancado (edição liberada)"}>
      <FlexRow>
        <h3 style={{ margin: 0 }}>{project.nome}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge $variant={variant}>{project.status}</Badge>
        </div>
        <div
          style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          {(project.setores || []).map((sid) => {
            const s = SECTOR_MAP[sid];
            if (!s) return null;
            return (
              <SectorDot key={sid} $color={s.color} title={s.label}>
                {s.initial}
              </SectorDot>
            );
          })}
        </div>

      </FlexRow>

      <div style={{ marginTop: 8, display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <Muted><FaCalendarAlt style={{ marginRight: 6 }} />Início: {project.inicio}</Muted><br />
          <Muted><FaCalendarAlt style={{ marginRight: 6 }} />Previsão: {project.fim}</Muted>
        </div>

        {/* Cadeado por projeto — não abre o card quando clicado */}
        <LockBtn
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleLock?.(); }}
          $locked={!!project.locked}
          aria-pressed={!!project.locked}
          title={project.locked ? "Destrancar projeto" : "Trancar projeto"}
        >
          {project.locked ? <FiLock size={16} /> : <FiUnlock size={16} />}
        </LockBtn>
      </div>
    </Card>
  );
}
