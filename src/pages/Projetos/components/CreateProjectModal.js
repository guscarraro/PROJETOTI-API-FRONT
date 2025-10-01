// src/pages/Projetos/components/CreateProjectModal.js
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
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { STATUS, formatDate } from "../utils";
import apiLocal from "../../../services/apiLocal";
import useLoading from "../../../hooks/useLoading";
import { MODAL_CLASS, GlobalModalStyles } from "../style";
import CardSetor from "./CardSetor";

export default function CreateProjectModal({
  isOpen,
  toggle,
  actorSectorId,
  onCreated,
}) {
  const loading = useLoading();

  const [nome, setNome] = useState("");
  const [inicio, setInicio] = useState(formatDate(new Date()));
  const [fim, setFim] = useState(
    formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30))
  );
  const [status, setStatus] = useState("ANDAMENTO");

  // setores & usuários
  const [allSectors, setAllSectors] = useState([]); // sem ADM
  const [allUsers, setAllUsers] = useState([]);     // todos usuários

  // seleção (setores e usuários)
  const [setoresSel, setSetoresSel] = useState([]); // int[]
  // mapa: setor_id (int) -> string[] (uuids)
  const [setorUsersSel, setSetorUsersSel] = useState({});

  // carregar setores (sem ADM) e usuários
  useEffect(() => {
    (async () => {
      try {
        const [secRes, usrRes] = await Promise.all([
          apiLocal.getSetores(),
          apiLocal.getUsuarios(),
        ]);
        const rawSectors = secRes.data || [];
        const list = rawSectors.filter((s) => {
          const n = (s.nome || "").trim().toLowerCase();
          return n !== "adm" && n !== "admin";
        });
        setAllSectors(list);

        const users = (usrRes.data || []).map((u) => ({
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
        setAllSectors([]);
        setAllUsers([]);
      }
    })();
  }, []);

  // usuários agrupados por setor_id (considera tanto u.setor quanto u.setor_ids[])
  const usersBySector = useMemo(() => {
    const map = new Map(); // setor_id -> array users
    for (const s of allSectors) map.set(Number(s.id), []);
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
  }, [allSectors, allUsers]);

  const resetForm = () => {
    setNome("");
    setInicio(formatDate(new Date()));
    setFim(formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)));
    setStatus("ANDAMENTO");
    setSetoresSel([]);
    setSetorUsersSel({});
  };

  // ---- handlers de seleção ----
  const toggleSector = (sectorId) => {
    const idNum = Number(sectorId);
    setSetoresSel((prev) => {
      const exists = prev.includes(idNum);
      const next = exists ? prev.filter((x) => x !== idNum) : [...prev, idNum];

      // ao selecionar um setor, por padrão seleciona todos os usuários do setor
      setSetorUsersSel((old) => {
        const current = { ...old };
        if (!exists) {
          const users = (usersBySector.get(idNum) || []).map((u) => String(u.id));
          current[idNum] = users;
        } else {
          // desmarcando o setor, limpa os usuários selecionados deste setor
          delete current[idNum];
        }
        return current;
      });

      return next;
    });
  };

  const toggleUser = (sectorId, userId, checked) => {
    const idNum = Number(sectorId);
    // garantir setor selecionado (se marcar um user e setor não estiver marcado, marca setor)
    setSetoresSel((prev) => (prev.includes(idNum) ? prev : [...prev, idNum]));
    setSetorUsersSel((prev) => {
      const cur = new Set(prev[idNum] || []);
      if (checked) {
        cur.add(String(userId));
      } else {
        cur.delete(String(userId));
      }
      return { ...prev, [idNum]: Array.from(cur) };
    });
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.warn("Informe o nome do projeto.");
      return;
    }
    if (new Date(fim) < new Date(inicio)) {
      toast.warn("A data de término deve ser após a data de início.");
      return;
    }
    if (!actorSectorId) {
      toast.error("Setor do criador não identificado.");
      return;
    }
    if (setoresSel.length === 0) {
      toast.warn("Selecione ao menos um setor.");
      return;
    }

    // monta setor_users apenas para setores selecionados
    const setor_users = {};
    for (const sid of setoresSel) {
      const selectedForSector = setorUsersSel[sid] || [];
      // se por algum motivo estiver vazio (usuário desmarcou todos),
      // podemos enviar [] (sem participantes) — o back trata como opcional.
      setor_users[sid] = selectedForSector;
    }

    try {
      const res = await loading.wrap("createProject", async () => {
        const payload = {
          nome: nome.trim(),
          inicio,
          fim,
          status,
          descricao: null,
          created_by_sector_id: Number(actorSectorId),
          setores: setoresSel.map(Number),   // sem ADM; back garante criador/ADM
          setor_users,                       // << NOVO campo
        };
        return apiLocal.createProjeto(payload);
      });

      const data = res?.data?.data || res?.data;
      toast.success("Projeto criado com sucesso!");
      onCreated?.(data);
      resetForm();
      toggle?.();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao criar projeto.";
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
          Novo Projeto
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Nome do projeto</Label>
              <Input
                disabled={loading.any()}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Implantação ERP"
              />
            </FormGroup>

            <div style={{ display: "flex", gap: 12 }}>
              <FormGroup style={{ flex: 1 }}>
                <Label>Início</Label>
                <Input
                  disabled={loading.any()}
                  type="date"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                />
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <Label>Previsão de término</Label>
                <Input
                  disabled={loading.any()}
                  type="date"
                  value={fim}
                  onChange={(e) => setFim(e.target.value)}
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Status</Label>
              <Input
                disabled={loading.any()}
                type="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {Object.entries(STATUS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Input>
            </FormGroup>

            <FormGroup>
              <Label>Setores e participantes</Label>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                Dica: clique no card do setor para selecionar/desselecionar todo
                o setor. Depois ajuste os usuários pelo check individual.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                {allSectors.map((s) => {
                  const sid = Number(s.id);
                  const sectorChecked = setoresSel.includes(sid);
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
                      onToggleUser={(uid, checked) =>
                        toggleUser(sid, uid, checked)
                      }
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
            onClick={handleSubmit}
            disabled={loading.any() || !nome.trim()}
          >
            <FaPlus style={{ marginRight: 6 }} />
            {loading.is("createProject") ? "Criando..." : "Criar"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
