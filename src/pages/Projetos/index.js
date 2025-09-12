// src/pages/Projetos/index.js  (ProjetosListPage)
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Page, TitleBar, H1, CardGrid } from "./style";
import CreateProjectModal from "./components/CreateProjectModal";
import NavBar from "./components/NavBar";
import apiLocal from "../../services/apiLocal";
import { STATUS } from "./utils";
import useLoading from "../../hooks/useLoading";
import { PageLoader } from "./components/Loader";
import ProjectCard from "./ProjectCard";

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default function ProjetosListPage() {
  const navigate = useNavigate();
  const loading = useLoading();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const actorSectorId = useMemo(() => {
    const first =
      Array.isArray(user?.setor_ids) && user.setor_ids.length
        ? user.setor_ids[0]
        : null;
    return first ? Number(first) : null;
  }, [user]);

  const [sectors, setSectors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  const isAdmin = useCallback(
    (names) =>
      names.some(
        (n) => n?.toLowerCase() === "adm" || n?.toLowerCase() === "admin"
      ),
    []
  );
  const isDiretoria = useCallback(
    (names) => names.some((n) => n?.toLowerCase() === "diretoria"),
    []
  );

  const mySectorNames = useMemo(() => {
    if (!Array.isArray(user?.setor_ids) || !sectors.length) return [];
    const names = user.setor_ids
      .map((id) => sectors.find((s) => Number(s.id) === Number(id))?.nome)
      .filter(Boolean);
    return Array.from(new Set(names.map((s) => (s || "").trim())));
  }, [user, sectors]);

  const fetchSectors = useCallback(async () => {
    try {
      const r = await apiLocal.getSetores();
      setSectors(r.data || []);
    } catch {
      setSectors([]);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    await loading.wrap("fetchProjects", async () => {
      try {
        const visibleFor = Array.isArray(user?.setor_ids)
          ? user.setor_ids.map(Number)
          : [];
        const r = await apiLocal.getProjetos(visibleFor);
        setProjects(r.data || []);
      } catch (e) {
        setProjects([]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // ❗ não inclua `loading` para evitar loop

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const role = useMemo(() => {
    if (isAdmin(mySectorNames)) return "adm";
    if (isDiretoria(mySectorNames)) return "diretoria";
    return "user";
  }, [mySectorNames, isAdmin, isDiretoria]);

  const canEditStatus = (p) => {
    const creator = Number(actorSectorId) === Number(p.created_by_sector_id);
    if (p.locked && p.lock_by === "adm") return isAdmin(mySectorNames);
    if (p.locked && p.lock_by === "diretoria")
      return isAdmin(mySectorNames) || isDiretoria(mySectorNames);
    return isAdmin(mySectorNames) || isDiretoria(mySectorNames) || creator;
  };

  const toggleProjectLock = async (p) => {
    try {
      const action = p.locked ? "unlock" : "lock";
      const res = await loading.wrap(`lock-${p.id}`, async () =>
        apiLocal.lockProjeto(p.id, action, Number(actorSectorId))
      );
      const updated = res.data?.data || res.data;
      setProjects((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch {
      /* silencioso */
    }
  };

  const changeStatus = async (p, nextStatus) => {
    try {
      if (!Object.values(STATUS).includes(nextStatus)) return;
      const res = await loading.wrap(`status-${p.id}`, async () =>
        apiLocal.changeProjetoStatus(p.id, nextStatus, Number(actorSectorId))
      );
      const updated = res.data?.data || res.data;
      setProjects((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch {
      /* silencioso */
    }
  };

  return (
    <>
    <Page>
      <PageLoader active={loading.any()} text="Processando..." />
      <NavBar />


      <TitleBar>
        <H1>Projetos</H1>
        <RightActions>
          <Button
            color="primary"
            onClick={() => setOpenCreate(true)}
            disabled={loading.any() || !actorSectorId}
            >
            + Criar novo projeto
          </Button>
        </RightActions>
      </TitleBar>

      <CardGrid>
        {projects.map((p) => (
          <ProjectCard
          key={p.id}
          project={p}
          sectorList={sectors}
          onOpen={() => navigate(`/projetos/${p.id}`)}
          onToggleLock={() => toggleProjectLock(p)}
          canEditStatus={() => canEditStatus(p)}
          onChangeStatus={(next) => changeStatus(p, next)}
          onDeleted={(id) => setProjects(prev => prev.filter(x => x.id !== id))} 
          />
        ))}

        {!loading.any() && projects.length === 0 && (
          <div style={{ opacity: 0.7 }}>
            Nenhum projeto visível para seus setores.
          </div>
        )}
      </CardGrid>

      <CreateProjectModal
        isOpen={openCreate}
        toggle={() => setOpenCreate((v) => !v)}
        actorSectorId={actorSectorId}
        onCreated={() => fetchProjects()}
        />
    </Page>
        </>
  );
}
