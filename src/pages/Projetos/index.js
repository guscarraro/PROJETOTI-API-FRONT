// src/pages/Projetos/index.js  (ProjetosListPage)
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Page,
  TitleBar,
  H1,
  CardGrid,
  SearchWrap,     // <<< novo
  SearchInput,    // <<< novo
} from "./style";
import CreateProjectModal from "./components/CreateProjectModal";
import NavBar from "./components/NavBar";
import apiLocal from "../../services/apiLocal";
import { STATUS } from "./utils";
import useLoading from "../../hooks/useLoading";
import { PageLoader } from "./components/Loader";
import ProjectCard from "./ProjectCard";
import { toast } from "react-toastify";
import StatusFilterDropdown from "./StatusFilterDropdown";

/* ---------- estilos auxiliares para grupos ---------- */
const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GroupBlock = styled.section`
  margin-top: 24px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0 12px;
`;

const AccentDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: ${(p) => p.$color || "#6366f1"};
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
  flex-shrink: 0;

  [data-theme="dark"] & {
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.06);
  }
`;

const GroupTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #111827;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

const CountPill = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #1f2937;
  background: rgba(31, 41, 55, 0.08);
  border: 1px solid rgba(31, 41, 55, 0.16);

  [data-theme="dark"] & {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.16);
  }
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

  // busca livre
  const [query, setQuery] = useState("");

  // filtro de status (default: ANDAMENTO)
  const [statusFilter, setStatusFilter] = useState("ANDAMENTO");

  const normalize = useCallback((s) => {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }, []);

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

  /* ====== LOAD INICIAL ÚNICO: setores + projetos ====== */
  useEffect(() => {
    (async () => {
      const visibleFor = Array.isArray(user?.setor_ids)
        ? user.setor_ids.map(Number)
        : [];
      await loading.wrap("init", async () => {
        const [sRes, pRes] = await Promise.all([
          apiLocal.getSetores(),
          // status default = ANDAMENTO
          apiLocal.getProjetosLean(visibleFor, "ANDAMENTO"),
        ]);
        setSectors(sRes.data || []);
        setProjects(pRes.data || []);
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // não incluir `loading` para evitar loop

  /* Recarrega só projetos quando necessário (ex.: após criar) */
  const reloadProjects = useCallback(
    async (nextStatus) => {
      const visibleFor = Array.isArray(user?.setor_ids)
        ? user.setor_ids.map(Number)
        : [];
      await loading.wrap("reload-projects", async () => {
        const status = nextStatus ?? statusFilter;
        const r = await apiLocal.getProjetosLean(
          visibleFor,
          status === "TODOS" ? undefined : status
        );
        setProjects(r.data || []);
      });
    },
    [user, loading, statusFilter]
  );

  // aplica busca livre
  const projectsFiltered = useMemo(() => {
    if (!query.trim()) return projects;

    const q = normalize(query);
    return projects.filter((p) => {
      const name = normalize(p.nome || p.name || p.titulo || "");
      const status = normalize(p.status || "");

      const sectorName =
        normalize(
          sectors.find((s) => Number(s.id) === Number(p?.created_by_sector_id))?.nome ||
          p?.created_by_sector_name ||
          ""
        );

      return name.includes(q) || status.includes(q) || sectorName.includes(q);
    });
  }, [projects, sectors, query, normalize]);

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
    const action = p.locked ? "unlock" : "lock";

    if (
      action === "unlock" &&
      (p.lock_by === "adm" || p.lock_by === "diretoria") &&
      !isAdmin(mySectorNames)
    ) {
      toast.error(
        "Você não tem acesso para destrancar este projeto. Apenas o Admin pode destrancar."
      );
      return;
    }

    try {
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

  /* --------- agrupamento por setor do criador (usa filtrados) --------- */
  const groups = useMemo(() => {
    const map = new Map();

    const getSectorNameById = (id) => {
      const s = sectors.find((x) => Number(x.id) === Number(id));
      return s?.nome || null;
    };

    for (let i = 0; i < projectsFiltered.length; i++) {
      const p = projectsFiltered[i];

      const sid =
        p?.created_by_sector_id ??
        p?.criado_por_setor_id ??
        p?.sector_creator_id ??
        null;

      let sname =
        getSectorNameById(sid) ||
        p?.created_by_sector_name ||
        p?.criado_por_setor_nome ||
        "Sem setor";

      sname = String(sname || "Sem setor").trim();

      if (!map.has(sname)) map.set(sname, []);
      map.get(sname).push(p);
    }

    const arr = Array.from(map.entries());
    arr.sort(([a], [b]) => {
      if (a === "Sem setor") return 1;
      if (b === "Sem setor") return -1;
      return a.localeCompare(b, "pt-BR");
    });

    return arr;
  }, [projectsFiltered, sectors]);

  /* cor consistente por grupo (hash simples) */
  const groupColor = useCallback((name) => {
    const palette = [
      "#2563eb", // indigo/blue
      "#059669", // emerald
      "#f59e0b", // amber
      "#ef4444", // red
      "#0ea5e9", // sky
      "#8b5cf6", // violet
      "#14b8a6", // teal
      "#f97316", // orange
    ];
    const s = String(name || "");
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  }, []);

  return (
    <>
      <Page>
        {/* Loader só some depois do init/load ou reload-projects */}
        <PageLoader active={loading.any()} text="Processando..." />
        <NavBar />

        <TitleBar style={{ zIndex: 1100 }}>
          <H1>Projetos</H1>
          <RightActions>
            {/* Busca geral */}
            <SearchWrap title="Buscar por projeto, setor ou status">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M13.477 12.307a6 6 0 11-1.172 1.172l3.327 3.327a.83.83 0 001.172-1.172l-3.327-3.327zM8.5 13a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
              </svg>
              <SearchInput
                placeholder="Buscar por projeto, setor ou status..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </SearchWrap>

            {/* Filtro de status */}
            <StatusFilterDropdown
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                reloadProjects(val);
              }}
            />

            <Button
              color="primary"
              onClick={() => setOpenCreate(true)}
              disabled={loading.any() || !actorSectorId}
            >
              + Criar novo projeto
            </Button>
          </RightActions>
        </TitleBar>

        {/* Lista agrupada por setor do criador */}
        {groups.map(([groupName, list]) => (
          <GroupBlock key={groupName}>
            <GroupHeader>
              <AccentDot $color={groupColor(groupName)} />
              <GroupTitle>{groupName}</GroupTitle>
              <CountPill>{list.length}</CountPill>
            </GroupHeader>

            <CardGrid>
              {list.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  sectorList={sectors}
                  onOpen={() => navigate(`/projetos/${p.id}`)}
                  onToggleLock={() => toggleProjectLock(p)}
                  canEditStatus={() => canEditStatus(p)}
                  onChangeStatus={(next) => changeStatus(p, next)}
                  onDeleted={(id) =>
                    setProjects((prev) => prev.filter((x) => x.id !== id))
                  }
                />
              ))}
            </CardGrid>
          </GroupBlock>
        ))}

        {!loading.any() && projectsFiltered.length === 0 && (
          <div style={{ opacity: 0.7 }}>
            Nenhum projeto encontrado para esse filtro.
          </div>
        )}

        <CreateProjectModal
          isOpen={openCreate}
          toggle={() => setOpenCreate((v) => !v)}
          actorSectorId={actorSectorId}
          onCreated={() => reloadProjects()} // respeita statusFilter atual
        />
      </Page>
    </>
  );
}
