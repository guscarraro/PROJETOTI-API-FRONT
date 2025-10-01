// src/pages/Projetos/components/EditProject/ModalEdit.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { toast } from "react-toastify";
import { MODAL_CLASS, GlobalModalStyles } from "../../style";
import useLoading from "../../../../hooks/useLoading";
import apiLocal from "../../../../services/apiLocal";
import CardSetor from "../../components/CardSetor";

export default function ModalEdit({
  isOpen,
  toggle,
  project,
  sectors = [],     // [{id,nome}, ...] (pode incluir ADM — filtramos abaixo)
  actorSectorId,    // int
  canSave = false,  // true se Admin (só Admin salva)
  onSaved,          // callback(projectLean)
}) {
  const loading = useLoading();

  const [nome, setNome] = useState(project?.nome || "");
  const creatorSid = Number(project?.created_by_sector_id) || null;

  // Setores do projeto (lista final) — vindo do projeto
  const baseSetores = useMemo(
    () => (Array.isArray(project?.setores) ? project.setores.map(Number) : []),
    [project?.setores]
  );
  const [selectedSetores, setSelectedSetores] = useState(baseSetores);

  // Todos os setores selecionáveis (sem ADM/Admin)
  const selectable = useMemo(() => {
    return (sectors || []).filter((s) => {
      const n = (s?.nome || "").trim().toLowerCase();
      return n !== "adm" && n !== "admin";
    });
  }, [sectors]);

  // Usuários
  const [allUsers, setAllUsers] = useState([]); // [{id, email, nome, setor, setor_ids: number[]}]
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiLocal.getUsuarios();
        const users = (resp.data || []).map((u) => ({
          id: u.id,
          email: u.email,
          nome: u.nome || u.email,
          setor: u.setor ?? null,
          setor_ids: Array.isArray(u.setor_ids)
            ? u.setor_ids.map((x) => Number(x))
            : (u.setor_ids ? [Number(u.setor_ids)] : []),
        }));
        setAllUsers(users);
      } catch {
        setAllUsers([]);
      }
    })();
  }, []);

  // Agrupa usuários por setor_id (considera tanto u.setor quanto u.setor_ids[])
  const usersBySector = useMemo(() => {
    const map = new Map(); // setor_id -> array users
    for (const s of selectable) map.set(Number(s.id), []);
    for (const u of allUsers) {
      const primary = u.setor ? [Number(u.setor)] : [];
      const extras = (u.setor_ids || []).map(Number);
      const all = Array.from(new Set([...primary, ...extras]));
      for (const sid of all) {
        if (!map.has(sid)) map.set(sid, []);
        map.get(sid).push(u);
      }
    }
    // ordena por nome
    for (const [sid, arr] of map.entries()) {
      arr.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
      map.set(sid, arr);
    }
    return map;
  }, [selectable, allUsers]);

  // Mapa: setor_id -> string[] (uuids) dos usuários selecionados
  const [setorUsersSel, setSetorUsersSel] = useState({});

  // Converte e saneia o mapa vindo do back (project.setor_users) para { [sid:number]: string[] }
  const normalizeSetorUsersMap = (raw) => {
    const out = {};
    if (!raw || typeof raw !== "object") return out;

    // Limita aos setores selecionáveis (sem ADM) e que existem no projeto
    const selectableIds = new Set(selectable.map((s) => Number(s.id)));
    const projectSectors = new Set(baseSetores);

    for (const [sidKey, arr] of Object.entries(raw)) {
      const sid = Number(sidKey);
      if (!selectableIds.has(sid)) continue;        // ignora ADM etc.
      if (!projectSectors.has(sid)) continue;       // ignora setor que nem está no projeto
      const ids = Array.isArray(arr) ? arr.map(String) : [];
      out[sid] = Array.from(new Set(ids));          // dedup
    }
    return out;
  };

  // Busca do servidor o mapa setor→usuários se não vier no objeto 'project'
  const fetchAndSetSetorUsers = async (projectId) => {
    try {
      const res = await apiLocal.getProjetoById(projectId);
      const p = res.data || {};
      const map = normalizeSetorUsersMap(p.setor_users || {});
      setSetorUsersSel(map);
      // Garante que setores ligados a participantes estejam marcados
      const withUsersSectors = Object.keys(map).map((k) => Number(k));
      if (withUsersSectors.length) {
        setSelectedSetores((prev) =>
          Array.from(new Set([...(prev || []), ...withUsersSectors]))
        );
      }
    } catch {
      // mantém vazio
    }
  };

  // Sincroniza quando mudar de projeto
  useEffect(() => {
    setNome(project?.nome || "");
    setSelectedSetores(baseSetores);

    // Se já veio o mapa do back no objeto do projeto, usa.
    // Senão, busca no back (para garantir que a edição reflita o que está salvo).
    const initialMap = normalizeSetorUsersMap(project?.setor_users || {});
    if (Object.keys(initialMap).length > 0) {
      setSetorUsersSel(initialMap);
    } else if (project?.id) {
      // busca apenas se não temos o mapa
      fetchAndSetSetorUsers(project.id);
    } else {
      setSetorUsersSel({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, project?.nome, JSON.stringify(baseSetores)]);

  // ---- handlers de seleção ----
  const toggleSector = (sectorId) => {
    const idNum = Number(sectorId);
    setSelectedSetores((prev) => {
      const exists = prev.includes(idNum);
      const next = exists ? prev.filter((x) => x !== idNum) : [...prev, idNum];

      setSetorUsersSel((old) => {
        const current = { ...old };
        if (!exists) {
          // selecionando setor → marca todos os usuários daquele setor por padrão
          const users = (usersBySector.get(idNum) || []).map((u) => String(u.id));
          current[idNum] = users;
        } else {
          // desmarcando setor → limpa usuários desse setor
          delete current[idNum];
        }
        return current;
      });

      return next;
    });
  };

  const toggleUser = (sectorId, userId, checked) => {
    const idNum = Number(sectorId);
    // Se marcar um usuário e o setor não estiver marcado, marca setor
    setSelectedSetores((prev) => (prev.includes(idNum) ? prev : [...prev, idNum]));
    setSetorUsersSel((prev) => {
      const cur = new Set(prev[idNum] || []);
      if (checked) cur.add(String(userId));
      else cur.delete(String(userId));
      return { ...prev, [idNum]: Array.from(cur) };
    });
  };

  const handleSave = async () => {
    if (!canSave) {
      toast.error("Apenas o setor Admin pode salvar estas alterações.");
      return;
    }
    if (!actorSectorId) {
      toast.error("Setor do ator não identificado.");
      return;
    }

    const nomeChanged = (nome || "").trim() !== (project?.nome || "");

    // Monta setor_users apenas para setores selecionados
    const setor_users = {};
    for (const sid of selectedSetores) {
      setor_users[sid] = (setorUsersSel[sid] || []);
    }

    // Se nada mudou (nome igual, setores iguais e mapa igual)
    const sectorsEqual =
      JSON.stringify([...selectedSetores].sort()) === JSON.stringify([...baseSetores].sort());
    const currentMap = normalizeSetorUsersMap(project?.setor_users || {});
    const mapEqual =
      JSON.stringify(setor_users, Object.keys(setor_users).sort()) ===
      JSON.stringify(currentMap, Object.keys(currentMap).sort());

    if (!nomeChanged && sectorsEqual && mapEqual) {
      toast.info("Nada para atualizar.");
      return;
    }

    try {
      const res = await loading.wrap("patch-meta", async () =>
        apiLocal.patchProjetoMeta(project.id, {
          ...(nomeChanged ? { nome: (nome || "").trim() } : {}),
          setores: selectedSetores.map(Number), // lista final (back garante ADM + criador)
          setor_users,                          // mapeamento de usuários por setor
        }, Number(actorSectorId))
      );
      const updated = res?.data; // LeanProjectOut
      toast.success("Projeto atualizado!");
      onSaved?.(updated);
      toggle?.();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Falha ao atualizar projeto.";
      toast.error(msg);
    }
  };

  return (
    <>
      <GlobalModalStyles />
      <Modal
        isOpen={isOpen}
        toggle={loading.any() ? undefined : toggle}
        size="lg"
        contentClassName={MODAL_CLASS}
      >
        <ModalHeader toggle={loading.any() ? undefined : toggle}>
          Editar nome do projeto e participantes
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Novo nome (opcional)</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading.any()}
                placeholder="Digite o novo nome do projeto"
              />
            </FormGroup>

            <FormGroup>
              <Label>Setores e participantes</Label>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                Dica: clique no card do setor para selecionar/desselecionar todo o setor.
                Depois ajuste os usuários pelo check individual.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                {selectable.map((s) => {
                  const sid = Number(s.id);
                  const sectorChecked = selectedSetores.includes(sid);
                  const users = usersBySector.get(sid) || [];
                  return (
                    <CardSetor
                      key={sid}
                      sector={s}
                      users={users}
                      sectorChecked={sectorChecked}
                      selectedUserIds={setorUsersSel[sid] || []}
                      disabled={loading.any()}
                      onToggleSector={() => toggleSector(sid)}
                      onToggleUser={(uid, checked) => toggleUser(sid, uid, checked)}
                    />
                  );
                })}
              </div>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={loading.any()}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onClick={handleSave}
            disabled={loading.any() || !canSave}
            title={!canSave ? "Somente Admin pode salvar" : "Salvar alterações"}
          >
            {loading.is("patch-meta") ? "Salvando..." : "Salvar"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
