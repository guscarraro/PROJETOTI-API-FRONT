// src/pages/Projetos/ProjetoDetalhe/Timeline/AssigneeMenu.jsx
import React, { useMemo, useState } from "react";

export default function AssigneeMenu({
  assigneeMenu,              // { rowId, x, y } | null
  rows,
  usersBySector = {},        // { [setor_id|string]: Array<User> }
  sectorIdByKey = {},        // { [sectorKey]: setor_id(string) }  (usado só na inferência)
  usersIndex = {},           // { [userId]: { id, email, nome?, setor_ids?: number[] } }
  pickAssignee,              // (rowId, userId | null, assigneeSetorId?) => Promise|void
  close,
  currentUserId = null,      // <<< novo: id do usuário logado para destacar na UI
}) {
  const [pendingUserId, setPendingUserId] = useState(null);

  // row selecionada (apenas para inferência de setor; não filtra mais usuários por ela)
  const row = useMemo(() => {
    const rowId = assigneeMenu?.rowId;
    if (!rowId) return undefined;
    return rows.find((r) => String(r.id) === String(rowId));
  }, [assigneeMenu?.rowId, rows]);

  const assigneeSectorId =
    row?.assignee_setor_id ?? row?.assigneeSetorId ?? null;

  const currentAssigneeId =
    Array.isArray(row?.assignees) && row.assignees[0]
      ? String(row.assignees[0])
      : null;

  // tema
  const isDark = useMemo(() => {
    try {
      return (
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
      );
    } catch {
      return false;
    }
  }, []);

  const palette = useMemo(
    () =>
      isDark
        ? {
            bg: "var(--assignee-menu-bg, #0b1220)",
            fg: "var(--assignee-menu-fg, #e5e7eb)",
            border: "var(--assignee-menu-border, rgba(255,255,255,.12))",
            hover: "var(--assignee-menu-hover, rgba(255,255,255,.06))",
            muted: "var(--assignee-menu-muted, #9ca3af)",
            activeBg: "var(--assignee-menu-activeBg, rgba(59,130,246,.15))",
            shadow: "0 12px 40px rgba(0,0,0,.5)",
          }
        : {
            bg: "var(--assignee-menu-bg, #fff)",
            fg: "var(--assignee-menu-fg, #111827)",
            border: "var(--assignee-menu-border, rgba(0,0,0,.08))",
            hover: "var(--assignee-menu-hover, rgba(0,0,0,.04))",
            muted: "var(--assignee-menu-muted, #6b7280)",
            activeBg: "var(--assignee-menu-activeBg, rgba(59,130,246,.10))",
            shadow: "0 12px 40px rgba(0,0,0,.15)",
          },
    [isDark]
  );

  // === LISTA DE USUÁRIOS: união de TODOS os usuários de usersBySector (sem validação)
  // Remove o usuário admin (nunca deve aparecer).
  const users = useMemo(() => {
    const map = new Map();
    for (const arr of Object.values(usersBySector || {})) {
      const list = Array.isArray(arr) ? arr : [];
      for (const u of list) {
        if (!u?.id) continue;
        const email = String(u.email || "").toLowerCase();
        const nome  = String(u.nome  || "").toLowerCase();
        // remove ADMIN (ex.: admin@carraro.com)
        if (email === "admin@carraro.com" || nome === "admin@carraro.com") continue;
        map.set(String(u.id), u);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      (a.nome || a.email || "").localeCompare(b.nome || b.email || "")
    );
  }, [usersBySector]);

  // === Inferência leve de assignee_setor_id ===
  const inferAssigneeSetorId = (uid) => {
    if (!uid) return null;

    // pega o user do índice rápido, senão procura na lista agregada
    let u =
      usersIndex?.[String(uid)] ||
      users.find((x) => String(x?.id) === String(uid));
    if (!u) return null;

    const userSids = Array.isArray(u.setor_ids)
      ? u.setor_ids.map(Number).filter(Number.isFinite)
      : [];

    // conjunto de ids que a row "aceita" (se existir)
    const rowAllowed = new Set();

    if (Array.isArray(row?.row_sectors)) {
      for (const sid of row.row_sectors) {
        const n = Number(sid);
        if (Number.isFinite(n)) rowAllowed.add(n);
      }
    }

    if (Array.isArray(row?.sectors)) {
      for (const k of row.sectors) {
        const mapped = sectorIdByKey?.[String(k)];
        const n = Number(mapped);
        if (Number.isFinite(n)) rowAllowed.add(n);
      }
    }

    if (assigneeSectorId != null) {
      const n = Number(assigneeSectorId);
      if (Number.isFinite(n)) rowAllowed.add(n);
    }

    // 1) interseção userSids x rowAllowed
    const match = userSids.find((sid) => rowAllowed.has(sid));
    if (Number.isFinite(match)) return match;

    // 2) fallback: primeiro setor do usuário (se existir)
    if (Number.isFinite(userSids?.[0])) return userSids[0];

    // 3) sem setor
    return null;
  };

  const baseBtn = useMemo(
    () => ({
      width: "100%",
      textAlign: "left",
      border: "none",
      background: "transparent",
      padding: "8px 10px",
      borderRadius: 8,
      cursor: "pointer",
      color: palette.fg,
    }),
    [palette.fg]
  );

  const onPick = async (userIdOrNull) => {
    try {
      setPendingUserId(userIdOrNull ? String(userIdOrNull) : "__none__");
      const sid = userIdOrNull ? inferAssigneeSetorId(userIdOrNull) : null;
      await pickAssignee?.(assigneeMenu?.rowId, userIdOrNull, sid);
      close?.();
    } finally {
      setPendingUserId(null);
    }
  };

  if (!assigneeMenu) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: assigneeMenu.x,
        top: assigneeMenu.y,
        width: 300,
        maxHeight: 360,
        overflow: "auto",
        borderRadius: 12,
        boxShadow: palette.shadow,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        zIndex: 9999,
        padding: 10,
        backdropFilter: "saturate(140%) blur(6px)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 8,
          color: palette.fg,
          letterSpacing: 0.2,
          fontSize: 14,
        }}
      >
        Definir responsável
      </div>

      <button
        type="button"
        onClick={() => onPick(null)}
        disabled={pendingUserId !== null}
        style={{
          ...baseBtn,
          display: "flex",
          alignItems: "center",
          gap: 8,
          opacity: pendingUserId ? 0.7 : 1,
          background: !currentAssigneeId ? palette.activeBg : "transparent",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = palette.hover)}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = !currentAssigneeId
            ? palette.activeBg
            : "transparent")
        }
        title="Remover responsável"
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            border: `2px dashed ${
              isDark ? "rgba(255,255,255,.45)" : "rgba(0,0,0,.35)"
            }`,
            boxSizing: "border-box",
          }}
        />
        <span>Sem responsável</span>
        {pendingUserId === "__none__" && (
          <span
            style={{ marginLeft: "auto", fontSize: 12, color: palette.muted }}
          >
            salvando…
          </span>
        )}
      </button>

      {users.length === 0 ? (
        <div style={{ fontSize: 12, color: palette.muted, padding: "6px 2px" }}>
          Nenhum usuário disponível.
        </div>
      ) : (
        users.map((u) => {
          const uid = String(u.id);
          const isCurrent = currentAssigneeId === uid;
          const isLogged = currentUserId && String(currentUserId) === uid;

          return (
            <button
              key={uid}
              type="button"
              onClick={() => onPick(uid)}
              disabled={pendingUserId !== null}
              style={{
                ...baseBtn,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: isCurrent ? palette.activeBg : "transparent",
                opacity: pendingUserId ? 0.7 : 1,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = palette.hover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = isCurrent
                  ? palette.activeBg
                  : "transparent")
              }
              title={u.email || u.nome || uid}
            >
              {/* Badge: se for o usuário logado, fica laranja com texto branco */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: isLogged
                    ? "#f97316" // laranja
                    : isDark
                    ? "rgba(255,255,255,.08)"
                    : "rgba(0,0,0,.05)",
                  color: isLogged ? "#fff" : palette.fg,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {(u.nome || u.email || uid).slice(0, 1).toUpperCase()}
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", minWidth: 0 }}
              >
                <span
                  style={{
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {u.nome || u.email || uid}
                  {isLogged ? " (Você)" : ""}
                </span>
                {u.email && (
                  <span
                    style={{
                      fontSize: 12,
                      color: palette.muted,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {u.email}
                  </span>
                )}
              </div>

              {isCurrent && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: palette.muted,
                  }}
                >
                  atual ✓
                </span>
              )}

              {pendingUserId === uid && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: palette.muted,
                  }}
                >
                  salvando…
                </span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
