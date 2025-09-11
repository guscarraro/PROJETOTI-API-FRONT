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
import { FiHome, FiFolder, FiUsers, FiTruck, FiMoon, FiSun, FiShield } from "react-icons/fi";

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
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);

  const isAdmin = !!(
    user?.tipo === ADMIN_UUID ||
    (Array.isArray(user?.setores) && user.setores.includes(ADMIN_UUID))
  );

  const items = [
    { key: "geral",    label: "Geral",             icon: <FiHome />,   to: "/" },
    { key: "projetos", label: "Projetos",          icon: <FiFolder />, to: "/projetos" },
    { key: "frete",    label: "Ir para o Frete",   icon: <FiTruck />,  to: "/frete" },
    // só admin:
    ...(isAdmin ? [{ key: "acessos", label: "Gestão de Acessos", icon: <FiShield />, to: "/projetos/gestaoacessos" }] : []),
  ];

  return (
    <NavWrap>
      <NavInner>
        {items.map(it => (
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

        <NavItem
          role="button"
          onClick={() => setDark(v => !v)}
          title={dark ? "Desativar Dark Mode" : "Ativar Dark Mode"}
        >
          <NavIcon>{dark ? <FiSun /> : <FiMoon />}</NavIcon>
          <NavLabel>{dark ? "Claro" : "Escuro"}</NavLabel>
        </NavItem>
      </NavInner>
    </NavWrap>
  );
}
