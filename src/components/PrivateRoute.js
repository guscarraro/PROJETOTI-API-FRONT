import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import apiLocal from "../services/apiLocal";

const ADMIN_UUID = "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";
const norm = (v) => String(v ?? "").trim().toLowerCase();

export default function PrivateRoute({ element, allowedSectors }) {
  const [checking, setChecking] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  // Se não tem user no LS, tenta restaurar a partir do cookie de sessão
  useEffect(() => {
    let alive = true;
    if (!user) {
      setChecking(true);
      apiLocal.authMe()
        .then(({ data }) => {
          if (!alive) return;
          localStorage.setItem("user", JSON.stringify(data));
          setUser(data);
        })
        .catch(() => {})
        .finally(() => { if (alive) setChecking(false); });
    }
    return () => { alive = false; };
  }, []); // uma vez

  if (!user) {
    // enquanto verifica, não navega
    if (checking) return null;
    return <Navigate to="/" replace />;
  }

  // Admin sempre pode
  const isAdmin =
    user?.tipo === ADMIN_UUID ||
    (Array.isArray(user?.setores) && user.setores.map(norm).includes("admin"));
  if (isAdmin) return element;

  // Se não há filtro, basta estar logado
  if (!allowedSectors || allowedSectors.length === 0) return element;

  // Setores do usuário (nomes + ids)
  const userSectorNames = [
    ...(user?.setor ? [user.setor] : []),
    ...(Array.isArray(user?.setores) ? user.setores : []),
  ].map(norm);
  const userSectorIds = (Array.isArray(user?.setor_ids) ? user.setor_ids : []).map(
    (x) => String(x)
  );

  // Lista permitida (separar nomes de ids)
  const allowNames = allowedSectors.filter((s) => isNaN(Number(s))).map(norm);
  const allowIds = allowedSectors.filter((s) => !isNaN(Number(s))).map((s) => String(s));

  const allowed =
    userSectorNames.some((n) => allowNames.includes(n)) ||
    userSectorIds.some((id) => allowIds.includes(id));

  const isSetor26 = Array.isArray(user?.setor_ids) && user.setor_ids.map(Number).includes(26);
return allowed
  ? element
  : <Navigate to={isSetor26 ? "/Frota/Analise-Performaxxi" : "/Projetos"} replace />;

}
