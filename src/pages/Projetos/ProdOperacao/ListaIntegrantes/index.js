import React, { useMemo } from "react";
import { Wrap, Title, Chips, Chip } from "./style";
import { FaUserCheck, FaUser } from "react-icons/fa6";

function normalizeName(v) {
  return String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acento
    .replace(/\s+/g, " ")           // espaços duplicados
    .trim()
    .toLowerCase();
}

function extractResponsaveis(t) {
  const raw = t?.responsaveis;

  // array de strings: ["Ana", "Bruno"]
  if (Array.isArray(raw)) {
    const out = [];
    for (let i = 0; i < raw.length; i++) {
      const it = raw[i];

      // array de objetos: [{nome:"Ana"}] ou [{name:"Ana"}]
      if (it && typeof it === "object") {
        const n = it.nome || it.name || it.usuario || it.email;
        if (n) out.push(String(n));
      } else if (typeof it === "string") {
        out.push(it);
      }
    }
    return out;
  }

  // string "Ana, Bruno" ou "Ana;Bruno"
  if (typeof raw === "string") {
    const parts = raw.split(/[,;|]/g);
    const out = [];
    for (let i = 0; i < parts.length; i++) {
      const p = String(parts[i] || "").trim();
      if (p) out.push(p);
    }
    return out;
  }

  return [];
}

export default function ListaIntegrantes({ operadores = [], tasks = [] }) {
  const semTarefa = useMemo(() => {
    // monta set de ocupados normalizado
    const busy = {};

    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];

      const st = String(t?.status || "").toUpperCase().trim();
      if (st === "CONCLUIDA" || st === "CANCELADA") continue;

      const rs = extractResponsaveis(t);
      for (let j = 0; j < rs.length; j++) {
        const key = normalizeName(rs[j]);
        if (key) busy[key] = true;
      }
    }

    // filtra operadores que NÃO estão no busy
    const out = [];
    for (let i = 0; i < operadores.length; i++) {
      const op = operadores[i];
      const key = normalizeName(op);
      if (!key) continue;
      if (!busy[key]) out.push(op);
    }

    // dedupe por normalização (pra não repetir "Ana" e "ANA")
    const seen = {};
    const deduped = [];
    for (let i = 0; i < out.length; i++) {
      const k = normalizeName(out[i]);
      if (!seen[k]) {
        seen[k] = true;
        deduped.push(out[i]);
      }
    }

    return deduped;
  }, [operadores, tasks]);

  return (
    <Wrap>
      <Title>
        <FaUserCheck /> Operadores sem tarefa
        <span>({semTarefa.length})</span>
      </Title>

      <Chips>
        {semTarefa.length ? (
          semTarefa.map((n) => (
            <Chip key={normalizeName(n)}>
              <FaUser />
              {n}
            </Chip>
          ))
        ) : (
          <div style={{ opacity: 0.7, fontSize: 13, fontWeight: 800 }}>
            Todo mundo já tem tarefa
          </div>
        )}
      </Chips>
    </Wrap>
  );
}
