import React, { useEffect, useMemo, useState } from "react";
import { Page, TopBar, Title, RightActions, SearchBox, List, UserCard, Chip, SectorChecks, CheckRow, Divider, ModalOverlay, ModalBox, Field, Actions, Danger, Inline, Help } from "./style";
import { Button, Input } from "reactstrap";
import NavBar from "../components/NavBar";
import { FiUserPlus, FiEdit2, FiTrash2, FiSave, FiX, FiMail, FiKey } from "react-icons/fi";
import UserModal from "./UserModal";


const ADMIN_UUID = "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";
const TI_UUID = "d2c5a1b8-4f23-4f93-b1e5-3d9f9b8a9a3f";
const FRETE_UUID = "958db54e-add5-45f6-8aef-739d6ba7cb4c";
const SAC_UUID = "43350e26-12f4-4094-8cfb-2a66f250838d";
const OPER_UUID = "442ec24d-4c7d-4b7e-b1dd-8261c9376d0f";
const DIRET_UUID = "9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4";

const SECTORS = [
    { id: ADMIN_UUID, label: "Admin" },
    { id: TI_UUID, label: "TI" },
    { id: FRETE_UUID, label: "Frete" },
    { id: SAC_UUID, label: "SAC" },
    { id: OPER_UUID, label: "Operação" },
    { id: DIRET_UUID, label: "Diretoria" },
];

/* ---------- helpers de “API” (troque pelos seus endpoints) ---------- */
/* Estes helpers usam localStorage para demo. Em produção:
   - Crie endpoints:
     GET    /api/usuarios
     POST   /api/usuarios
     PUT    /api/usuarios/:id
     DELETE /api/usuarios/:id
   - Payload recomendado:
     {
       id?: string,
       email: string,
       senha?: string,              // em CREATE ou quando for alterar; o backend deve aplicar bcrypt
       setores: string[],           // lista de UUIDs dos setores
       tipo: string                 // se incluir ADMIN_UUID, defina tipo = ADMIN_UUID; caso contrário "usuario"
     }
*/
const LS_KEY = "demo_users";

const apiList = async () => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
    // seed com seu exemplo
    const seed = [
        {
            id: "9f5c3e17-8e15-4a11-a89f-df77f3a8f0aa",
            email: "basepto@carraro.com",
            tipo: "base.pto", // legado
            setores: [DIRET_UUID, FRETE_UUID], // múltiplos setores
            criado_em: "2025-03-25 14:00:00",
        },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(seed));
    return seed;
};
const apiCreate = async (u) => {
    const list = await apiList();
    const now = new Date().toISOString();
    const novo = {
        id: crypto.randomUUID(),
        email: u.email,
        tipo: u.setores?.includes(ADMIN_UUID) ? ADMIN_UUID : "usuario",
        setores: u.setores || [],
        criado_em: now,
    };
    // senha: enviar em texto no POST, backend faz bcrypt e não retorna (por segurança)
    // aqui apenas ignoramos armaz.
    const out = [...list, novo];
    localStorage.setItem(LS_KEY, JSON.stringify(out));
    return novo;
};
const apiUpdate = async (id, patch) => {
    const list = await apiList();
    const out = list.map(u => {
        if (u.id !== id) return u;
        const next = { ...u, ...patch };
        if (patch.setores) {
            next.setores = patch.setores;
            next.tipo = patch.setores.includes(ADMIN_UUID) ? ADMIN_UUID : (next.tipo === ADMIN_UUID ? "usuario" : next.tipo);
        }
        if (patch.email) next.email = patch.email;
        return next;
    });
    localStorage.setItem(LS_KEY, JSON.stringify(out));
    return out.find(u => u.id === id);
};
const apiDelete = async (id) => {
    const list = await apiList();
    const out = list.filter(u => u.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(out));
    return true;
};
/* -------------------------------------------------------------------- */

export default function GestaoAcessos() {
    // guarda: só admin entra (extra além do PrivateRoute)
    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem("user") || "null"); }
        catch { return null; }
    }, []);
    const isAdmin = !!(user?.tipo === ADMIN_UUID || user?.setores?.includes?.(ADMIN_UUID));

    const [users, setUsers] = useState([]);
    const [q, setQ] = useState("");
    const [expanded, setExpanded] = useState(null); // id do usuário expandido (checklist)
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(null); // {id, email}

    useEffect(() => { (async () => setUsers(await apiList()))(); }, []);

    const filtered = useMemo(() => {
        if (!q) return users;
        const term = q.toLowerCase();
        return users.filter(u =>
            u.email?.toLowerCase().includes(term) ||
            u.setores?.some?.(sid => SECTORS.find(s => s.id === sid)?.label.toLowerCase().includes(term))
        );
    }, [q, users]);

    if (!isAdmin) {
        return (
            <>
                <NavBar />
                <Page>
                    <TopBar>
                        <Title>Gestão de Acessos</Title>
                    </TopBar>
                    <Help>Somente administradores podem acessar esta página.</Help>
                </Page>
            </>
        );
    }

    return (
        <>
            <NavBar />
        <Page>

            <TopBar>
                <Title>Gestão de Acessos</Title>
                <RightActions>
                    <SearchBox>
                        <Input
                            bsSize="sm"
                            placeholder="Buscar por e-mail ou setor…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            />
                    </SearchBox>
                    <Button color="success" onClick={() => setCreating(true)}>
                        <FiUserPlus style={{ marginRight: 6 }} />
                        Novo usuário
                    </Button>
                </RightActions>
            </TopBar>

            <List>
                {filtered.map(u => {
                    const isOpen = expanded === u.id;
                    const isUserAdmin = u.tipo === ADMIN_UUID || u.setores?.includes?.(ADMIN_UUID);
                    return (
                        <UserCard key={u.id}>
                            <Inline>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{u.email}</div>
                                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexPage: "Page" }}>
                                        {(u.setores || []).map(sid => {
                                            const s = SECTORS.find(x => x.id === sid);
                                            if (!s) return null;
                                            return <Chip key={sid}>{s.label}</Chip>;
                                        })}
                                        {isUserAdmin && <Chip $accent>Admin</Chip>}
                                    </div>
                                </div>

                                <RightActions>
                                    <Button color="secondary" outline size="sm" onClick={() => setEditing({ id: u.id, email: u.email })}>
                                        <FiEdit2 style={{ marginRight: 6 }} /> Editar
                                    </Button>
                                    <Danger size="sm" onClick={async () => { if (window.confirm("Excluir usuário?")) { await apiDelete(u.id); setUsers(await apiList()); } }}>
                                        <FiTrash2 style={{ marginRight: 6 }} /> Excluir
                                    </Danger>
                                    <Button color="primary" size="sm" onClick={() => setExpanded(isOpen ? null : u.id)}>
                                        {isOpen ? "Fechar setores" : "Definir setores"}
                                    </Button>
                                </RightActions>
                            </Inline>

                            {isOpen && (
                                <>
                                    <Divider />
                                    <SectorChecks>
                                        {SECTORS.map(s => {
                                            const checked = u.setores?.includes?.(s.id);
                                            return (
                                                <CheckRow key={s.id}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!checked}
                                                            onChange={async (e) => {
                                                                const next = new Set(u.setores || []);
                                                                if (e.target.checked) next.add(s.id);
                                                                else next.delete(s.id);
                                                                const updated = await apiUpdate(u.id, { setores: Array.from(next) });
                                                                setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
                                                            }}
                                                            />
                                                        <span>{s.label}</span>
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

            {/* Modal - Novo usuário */}
            {creating && (
                <UserModal
                title="Novo usuário"
                onCancel={() => setCreating(false)}
                onSubmit={async (data) => {
                    await apiCreate(data);
                    setUsers(await apiList());
                    setCreating(false);
                }}
                />
            )}

            {/* Modal - Editar e-mail/senha */}
            {editing && (
                <UserModal
                title="Editar usuário"
                initialEmail={editing.email}
                onCancel={() => setEditing(null)}
                onSubmit={async (data) => {
                    // só envia email/senha se preenchidos (senha opcional)
                    const patch = {};
                    if (data.email) patch.email = data.email;
                    if (data.senha) patch.senha = data.senha; // backend que faz bcrypt
                    await apiUpdate(editing.id, patch);
                    setUsers(await apiList());
                    setEditing(null);
                }}
                />
            )}
        </Page>
            </>
    );
}