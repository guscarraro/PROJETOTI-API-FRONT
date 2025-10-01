// src/pages/.../CardUsersSetor.jsx
import React from "react";
import { UserCard, Inline, Chip, Divider } from "../style";

export default function CardUsersSetor({ sector, users = [] }) {
  return (
    <UserCard>
      <Inline style={{ alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800 }}>
          {sector?.nome || "Sem setor"}
        </div>
        <Chip $accent>{users.length} usuário{users.length === 1 ? "" : "s"}</Chip>
      </Inline>

      <Divider />

      {users.length === 0 ? (
        <div style={{ opacity: 0.7, fontSize: 13 }}>Nenhum usuário neste setor.</div>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {users.map(u => (
            <Chip key={u.id} title={u.email}>
              {u.email}
            </Chip>
          ))}
        </div>
      )}
    </UserCard>
  );
}
