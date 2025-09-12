import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  NavWrap,
  NavInner,
  NavItem,
  NavIcon,
  NavLabel,
  NavSpacer,
  ToggleRow,
} from "./style";
import {
  FiHome,
  FiFolder,
  FiUsers,
  FiTruck,
  FiMoon,
  FiSun,
  FiShield,
  FiHeadphones, // ícone de SAC (suporte)
  FiUser, // ícone para usuário
} from "react-icons/fi";

const ADMIN_UUID = "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";

export default function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (localStorage.getItem("theme") || "") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isAdmin = !!(
    user?.tipo === ADMIN_UUID ||
    (Array.isArray(user?.setores) && user.setores.includes(ADMIN_UUID))
  );

  const items = [
    { key: "geral", label: "Geral", icon: <FiHome />, to: "/" },
    { key: "projetos", label: "Projetos", icon: <FiFolder />, to: "/projetos" },
    { key: "frete", label: "Ir para o Frete", icon: <FiTruck />, to: "/frete" },
    { key: "sac", label: "Ir para o SAC", icon: <FiHeadphones />, to: "/sac" }, // novo item
    ...(isAdmin
      ? [
          {
            key: "acessos",
            label: "Gestão de Acessos",
            icon: <FiShield />,
            to: "/projetos/gestaoacessos",
          },
        ]
      : []),
  ];

  return (
    <NavWrap>
      <NavInner>
        {items.map((it) => (
          <NavItem
            key={it.key}
            $active={pathname.toLowerCase() === it.to.toLowerCase()}
            onClick={() => navigate(it.to)}
            title={it.label}
          >
            <NavIcon>{it.icon}</NavIcon>
            <NavLabel>{it.label}</NavLabel>
          </NavItem>
        ))}

        <NavSpacer />

        {/* Botão com nome do usuário */}
        {/* Avatar dinâmico com inicial de tarefa_projeto */}
        {user && (
          <NavItem
            title={
              Array.isArray(user?.tarefa_projeto) && user.tarefa_projeto[0]
                ? user.tarefa_projeto[0]
                : "Usuário"
            }
          >
            <NavIcon>
              {(() => {
                const arr = Array.isArray(user?.tarefa_projeto)
                  ? user.tarefa_projeto
                  : [];
                const label = (arr[0] || "").trim();
                const initial =
                  label[0]?.toUpperCase() ||
                  (isAdmin ? "A" : user?.nome?.[0]?.toUpperCase() || "?");
                return (
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                      backgroundColor: "transparent",
                      border: "1px solid #fff", // cor fixa (azul)
                      color: "#fff",
                      userSelect: "none",
                    }}
                  >
                    {initial}
                  </span>
                );
              })()}
            </NavIcon>
            <NavLabel>{user?.tarefa_projeto || "Usuário"}</NavLabel>
          </NavItem>
        )}

        {/* Toggle Dark Mode */}
        <NavItem
          role="button"
          onClick={() => setDark((v) => !v)}
          title={dark ? "Desativar Dark Mode" : "Ativar Dark Mode"}
        >
          <NavIcon>{dark ? <FiSun /> : <FiMoon />}</NavIcon>
          <NavLabel>{dark ? "Claro" : "Escuro"}</NavLabel>
        </NavItem>
      </NavInner>
    </NavWrap>
  );
}
