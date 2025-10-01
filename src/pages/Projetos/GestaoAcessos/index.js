import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Page,
  TopBar,
  Title,
  RightActions,
  SearchBox,
  List,
  UserCard,
  Chip,
  SectorChecks,
  CheckRow,
  Divider,
  Help,
  Inline,
} from "./style";
import { Button, Input } from "reactstrap";
import NavBar from "../components/NavBar";
import { FiUserPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import UserModal from "./UserModal";
import ModalAddSetor from "./ModalAddSetor";
import apiLocal from "../../../services/apiLocal";
import useLoading from "../../../hooks/useLoading";
import { PageLoader } from "../components/Loader";
import CardUsersSetor from "./CardUsersSetor";

const ADMIN_UUID = "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";

export default function GestaoAcessos() {
  const loading = useLoading();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const isAdmin = !!(
    user?.tipo === ADMIN_UUID || user?.setores?.includes?.(ADMIN_UUID)
  );

  const [users, setUsers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [addingSector, setAddingSector] = useState(false);
  const [sectorError, setSectorError] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    loading.wrap("init", async () => {
      const [sects, usrs] = await Promise.all([
        apiLocal.getSetores(),
        apiLocal.getUsuarios(),
      ]);
      setSectors(sects.data);
      setUsers(usrs.data);
    });
  }, []);

  const setoresOptions = useMemo(
    () => sectors.map((s) => ({ id: s.id, nome: s.nome })),
    [sectors]
  );

  const usersBySector = useMemo(() => {
  const idx = new Map(sectors.map(s => [Number(s.id), { sector: s, users: [] }]));
  for (const u of users) {
    const sids = Array.isArray(u.setor_ids) ? u.setor_ids.map(Number) : [];
    for (const sid of sids) {
      if (idx.has(sid)) idx.get(sid).users.push(u);
    }
  }
  // ordena usuários por e-mail para cada setor
  for (const g of idx.values()) {
    g.users.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
  }
  return Array.from(idx.values());
}, [users, sectors]);


  const filtered = useMemo(() => {
    if (!q) return users;
    const term = q.toLowerCase();
    return users.filter((u) => {
      const byEmail = u.email?.toLowerCase().includes(term);
      const bySector = u.setor_ids?.some?.((sid) => {
        const s = sectors.find((x) => Number(x.id) === Number(sid));
        return s?.nome?.toLowerCase().includes(term);
      });
      return byEmail || bySector;
    });
  }, [q, users, sectors]);

  if (!isAdmin) {
    return (
      <>
        <NavBar />
        <Page>
          <PageLoader active={loading.any()} text="Processando..." />
          <TopBar>
            <Title>Gestão de Acessos</Title>
          </TopBar>
          <Help>Somente administradores podem acessar esta página.</Help>
        </Page>
      </>
    );
  }

  const validateNewSectorName = (nome) => {
    const exists = sectors.some(
      (s) => s.nome.toLowerCase() === nome.toLowerCase()
    );
    return exists ? "Já existe um setor com esse nome." : null;
  };

  return (
    <>
      <PageLoader active={loading.any()} text="Processando..." />
      <NavBar />
      <Page>
        <TopBar>
          <Title>Gestão de Acessos</Title>
          <RightActions style={{ gap: 8, flexWrap: "wrap" }}>
            <SearchBox>
              <Input
                type="search"
                name="q"
                bsSize="sm"
                innerRef={searchRef}
                autoComplete="off"
                placeholder="Buscar por e-mail ou setor…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </SearchBox>
            <Button
              color="info"
              outline
              size="sm"
              onClick={() => setAddingSector(true)}
              disabled={loading.any([
                "createSetor",
                "init",
                "createUser",
                "updateUser",
                "deleteUser",
              ])}
            >
              + Novo setor
            </Button>
            <Button
              color="success"
              size="sm"
              onClick={() => setCreating(true)}
              disabled={loading.any(["createUser", "init"])}
            >
              <FiUserPlus style={{ marginRight: 6 }} />
              Novo usuário
            </Button>
          </RightActions>
        </TopBar>

        <List style={{ marginBottom: 16 }}>
          <UserCard>
            <Inline>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  Setores cadastrados
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {sectors.map((s) => (
                    <Chip key={s.id}>
                      {s.nome} (id: {s.id})
                    </Chip>
                  ))}
                </div>
              </div>
            </Inline>
            
            {sectorError && (
              <Help style={{ color: "#ef4444", marginTop: 8 }}>
                {sectorError}
              </Help>
            )}
          </UserCard>
        </List>
<List style={{ marginTop: 16 }}>
  {usersBySector.map(({ sector, users }) => (
    <CardUsersSetor key={sector.id} sector={sector} users={users} />
  ))}
</List>
        <h3>Usuarios</h3>
        <List>
          {filtered.map((u) => {
            const isOpen = expanded === u.id;
            const isUserAdmin =
              Array.isArray(u.setor_ids) &&
              u.setor_ids.some(
                (sid) =>
                  (
                    sectors.find((x) => Number(x.id) === Number(sid))?.nome ||
                    ""
                  ).toLowerCase() === "admin"
              );

            return (
              <UserCard key={u.id}>
                <Inline>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, wordBreak: "break-all" }}>
                      {u.email}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginTop: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      {(u.setor_ids || []).map((sid) => {
                        const s = sectors.find(
                          (x) => Number(x.id) === Number(sid)
                        );
                        if (!s) return null;
                        return (
                          <Chip key={sid}>
                            {s.nome} (id: {s.id})
                          </Chip>
                        );
                      })}
                      {isUserAdmin && <Chip $accent>Admin</Chip>}
                    </div>
                  </div>

                  <RightActions
                    style={{
                      gap: 6,
                      flexWrap: "wrap",
                      alignSelf: "flex-start",
                      minWidth: 180,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      color="secondary"
                      outline
                      size="sm"
                      disabled={
                        loading.is(`update-user-${u.id}`) ||
                        loading.any(["deleteUser"])
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (searchRef.current) {
                          searchRef.current.blur();
                        }
                        setEditing({
                          id: u.id,
                          email: u.email,
                          setor_ids: u.setor_ids || [],
                        });
                      }}
                    >
                      <FiEdit2 style={{ marginRight: 6 }} /> Editar
                    </Button>
                    <Button
                      color="warning"
                      outline
                      size="sm"
                      disabled={loading.any([
                        `revoke-${u.id}`,
                        `update-user-${u.id}`,
                        "deleteUser",
                      ])}
                      onClick={async () => {
                        if (
                          !window.confirm(
                            "Derrubar todas as sessões deste usuário?"
                          )
                        )
                          return;
                        await loading.wrap(`revoke-${u.id}`, async () => {
                          await apiLocal.adminRevokeUserSessions(u.id);
                        });
                        // opcional: feedback visual
                        alert(
                          "Sessões derrubadas. O usuário precisará fazer login novamente."
                        );
                      }}
                    >
                      Derrubar
                    </Button>

                    <Button
                      color="danger"
                      outline
                      size="sm"
                      disabled={loading.any([
                        `update-user-${u.id}`,
                        "deleteUser",
                      ])}
                      onClick={async () => {
                        if (window.confirm("Excluir usuário?")) {
                          await loading.wrap("deleteUser", async () => {
                            await apiLocal.deleteUsuario(u.id);
                            setUsers((await apiLocal.getUsuarios()).data);
                          });
                        }
                      }}
                    >
                      <FiTrash2 style={{ marginRight: 6 }} /> Excluir
                    </Button>

                    <Button
                      color="primary"
                      size="sm"
                      disabled={loading.is(`update-user-${u.id}`)}
                      onClick={() => setExpanded(isOpen ? null : u.id)}
                    >
                      {isOpen ? "Fechar setores" : "Definir setores"}
                    </Button>
                  </RightActions>
                </Inline>

                {isOpen && (
                  <>
                    <Divider />
                    <SectorChecks>
                      {sectors.map((s) => {
                        const checked =
                          Array.isArray(u.setor_ids) &&
                          u.setor_ids.map(Number).includes(Number(s.id));
                        return (
                          <CheckRow key={s.id}>
                            <label>
                              <input
                                type="checkbox"
                                checked={!!checked}
                                disabled={loading.is(`update-user-${u.id}`)}
                                onChange={async (e) => {
                                  const next = new Set(
                                    (u.setor_ids || []).map(Number)
                                  );
                                  if (e.target.checked) next.add(Number(s.id));
                                  else next.delete(Number(s.id));
                                  const updated = await loading.wrap(
                                    `update-user-${u.id}`,
                                    async () =>
                                      apiLocal.updateUsuario(u.id, {
                                        setor_ids: Array.from(next),
                                      })
                                  );
                                  setUsers((prev) =>
                                    prev.map((x) =>
                                      x.id === u.id ? updated.data.data : x
                                    )
                                  );
                                }}
                              />
                              <span>{s.nome}</span>
                            </label>
                          </CheckRow>
                        );
                      })}
                    </SectorChecks>
                  </>
                )}
              </UserCard>
            );
          })}
        </List>

        {creating && (
          <UserModal
            title="Novo usuário"
            setoresOptions={setoresOptions}
            onCancel={() => setCreating(false)}
            onSubmit={async (data) => {
              await loading.wrap("createUser", async () => {
                await apiLocal.createUsuario(data);
                setUsers((await apiLocal.getUsuarios()).data);
              });
              setCreating(false);
            }}
          />
        )}

        {editing && (
          <UserModal
            title="Editar usuário"
            initialEmail={editing.email}
            initialSetorIds={editing.setor_ids || []}
            setoresOptions={setoresOptions}
            onCancel={() => setEditing(null)}
            onSubmit={async (data) => {
              const patch = {};
              if (data.email) patch.email = data.email;
              if (data.senha) patch.senha = data.senha;
              if (Array.isArray(data.setor_ids))
                patch.setor_ids = data.setor_ids;
              await loading.wrap(`update-user-${editing.id}`, async () => {
                await apiLocal.updateUsuario(editing.id, patch);
                setUsers((await apiLocal.getUsuarios()).data);
              });
              setEditing(null);
            }}
          />
        )}

        {addingSector && (
          <ModalAddSetor
            validateName={validateNewSectorName}
            onCancel={() => {
              setSectorError(null);
              setAddingSector(false);
            }}
            onSubmit={async ({ nome }) => {
              try {
                await loading.wrap("createSetor", async () => {
                  await apiLocal.createSetor({ nome });
                  setSectors((await apiLocal.getSetores()).data);
                });
                setAddingSector(false);
                setSectorError(null);
              } catch (err) {
                setSectorError(err?.message || "Erro ao criar setor.");
              }
            }}
          />
        )}
      </Page>
    </>
  );
}
