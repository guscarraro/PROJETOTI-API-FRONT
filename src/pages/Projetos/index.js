import React, { useState } from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Page, TitleBar, H1, CardGrid } from "./style";
import ProjectCard from "./components/ProjectCard";
import CreateProjectModal from "./components/CreateProjectModal";
import { STATUS, formatDate } from "./utils";


export default function ProjetosListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(() => {
    return [
      { id: 1, nome: "Implantação TMS", inicio: formatDate(new Date()), fim: formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)), status: STATUS.ANDAMENTO },
      { id: 2, nome: "Site E-commerce", inicio: "2025-09-01", fim: "2025-12-01", status: STATUS.STANDBY },
    ];
  });
  const [openCreate, setOpenCreate] = useState(false);


  const handleCreate = (proj) => {
    setProjects(prev => [{ id: Date.now(), ...proj }, ...prev]);
    setOpenCreate(false);
  };


  return (
    <Page>
      <TitleBar>
        <H1>Projetos</H1>
        <Button color="primary" onClick={() => setOpenCreate(true)}>
          + Criar novo projeto
        </Button>
      </TitleBar>


      <CardGrid>
        {projects.map(p => (
          <ProjectCard key={p.id} project={p} onOpen={() => navigate(`/projetos/${p.id}`)} />
        ))}
      </CardGrid>


      <CreateProjectModal isOpen={openCreate} toggle={() => setOpenCreate(v => !v)} onSave={handleCreate} />
    </Page>
  );
}