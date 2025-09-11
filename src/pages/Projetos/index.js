import React, { useState } from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Page, TitleBar, H1, CardGrid } from "./style";
import ProjectCard from "./components/ProjectCard";
import CreateProjectModal from "./components/CreateProjectModal";
import { STATUS, formatDate } from "./utils";
import NavBar from "./components/NavBar";

/* Apenas para agrupar o botão de criar (mantive para estética) */
const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default function ProjetosListPage() {
  const navigate = useNavigate();

  // mapa de locks por projeto (id: boolean) vindo do localStorage
  const initialLockMap = (() => {
    try {
      return JSON.parse(localStorage.getItem("projects_lockmap") || "{}");
    } catch {
      return {};
    }
  })();

  const [projects, setProjects] = useState(() => {
    const base = [
      { id: 1, nome: "Implantação TMS", inicio: formatDate(new Date()), fim: formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)), status: STATUS.ANDAMENTO },
      { id: 2, nome: "Site E-commerce",  inicio: "2025-09-01", fim: "2025-12-01", status: STATUS.STANDBY },
    ];
    return base.map(p => ({ ...p, locked: !!initialLockMap[p.id] }));
  });

  const [openCreate, setOpenCreate] = useState(false);

  const persistLockMap = (list) => {
    const map = {};
    for (const p of list) map[p.id] = !!p.locked;
    localStorage.setItem("projects_lockmap", JSON.stringify(map));
  };

  const handleCreate = (proj) => {
    const newProj = { id: Date.now(), locked: false, ...proj };
    setProjects(prev => {
      const next = [newProj, ...prev];
      persistLockMap(next);
      return next;
    });
    setOpenCreate(false);
  };

  const toggleProjectLock = (id) => {
    setProjects(prev => {
      const next = prev.map(p =>
        p.id === id ? { ...p, locked: !p.locked } : p
      );
      persistLockMap(next);
      return next;
    });
  };

  return (
    <Page>
      <NavBar />

      <TitleBar>
        <H1>Projetos</H1>
        <RightActions>
          <Button color="primary" onClick={() => setOpenCreate(true)}>
            + Criar novo projeto
          </Button>
        </RightActions>
      </TitleBar>

      <CardGrid>
        {projects.map(p => (
          <ProjectCard
            key={p.id}
            project={p}
            onOpen={() => navigate(`/projetos/${p.id}`)}
            onToggleLock={() => toggleProjectLock(p.id)}
          />
        ))}
      </CardGrid>

      <CreateProjectModal
        isOpen={openCreate}
        toggle={() => setOpenCreate(v => !v)}
        onSave={handleCreate}
      />
    </Page>
  );
}
