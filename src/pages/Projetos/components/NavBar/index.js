import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  NavWrap,
  NavInner,
  NavItem,
  NavIcon,
  NavLabel,
  NavSpacer,
} from "./style";
import {
  FiHome,
  FiFolder,
  FiTruck,
  FiMoon,
  FiSun,
  FiShield,
  FiHeadphones,
  FiLogOut,
} from "react-icons/fi";
import apiLocal from "../../../../services/apiLocal";

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

  const [allSectors, setAllSectors] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiLocal.getSetores(); // GET /setor/
        setAllSectors(res.data || []);
      } catch {
        setAllSectors([]);
      }
    })();
  }, []);

  // Sincroniza darkmode no backend quando mudar localmente
  useEffect(() => {
    (async () => {
      try {
        if (user?.id) {
          const res = await apiLocal.setUsuarioDarkmode(user.id, dark);
          const updated = res?.data?.data || res?.data;

          // Se o back devolver o usuário atualizado, use-o.
          // Caso não devolva, apenas atualize o cache local sem novo GET.
          const nextUser = updated?.id ? updated : { ...user, darkmode: dark };

          localStorage.setItem("user", JSON.stringify(nextUser));
          setUser(nextUser);
        }
      } catch {
        /* silencioso */
      }
    })();
  }, [dark, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const userSectorNames = useMemo(() => {
    const ids =
      (Array.isArray(user?.setor_ids) && user.setor_ids) ||
      (Array.isArray(user?.setores) && user.setores) ||
      [];
    return ids
      .map(
        (sid) =>
          allSectors.find(
            (s) => String(s.id) === String(sid) || Number(s.id) === Number(sid)
          )?.nome
      )
      .filter(Boolean);
  }, [user, allSectors]);

  const isAdmin = useMemo(() => {
    return (
      user?.tipo === ADMIN_UUID ||
      userSectorNames.some((n) => n?.toLowerCase() === "admin")
    );
  }, [user?.tipo, userSectorNames]);

  const items = useMemo(() => {
    const base = [
      {
        key: "projetos",
        label: "Projetos",
        icon: <FiFolder />,
        to: "/projetos",
      },
      {
        key: "frete",
        label: "Ir para o Frete",
        icon: <FiTruck />,
        to: "/frete",
      },
      {
        key: "sac",
        label: "Ir para o SAC",
        icon: <FiHeadphones />,
        to: "/sac",
      },
    ];
    if (isAdmin) {
      base.unshift({ key: "geral", label: "Geral", icon: <FiHome />, to: "/" });
      base.push({
        key: "acessos",
        label: "Gestão de Acessos",
        icon: <FiShield />,
        to: "/projetos/gestaoacessos",
      });
    }
    return base;
  }, [isAdmin]);

  const avatarInitial =
    userSectorNames[0]?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const handleLogout = async () => {
    try {
      await apiLocal.logout?.();
    } catch {}
    const theme = localStorage.getItem("theme"); // preserva o tema
    localStorage.clear();
    if (theme) localStorage.setItem("theme", theme);
    navigate("/");
  };

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

        {user && (
          <NavItem
            title={
              userSectorNames.length ? userSectorNames.join(", ") : "Usuário"
            }
          >
            <NavIcon>
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
                  border: "1px solid #fff",
                  color: "#fff",
                  userSelect: "none",
                }}
              >
                {avatarInitial}
              </span>
            </NavIcon>
            <NavLabel>
              {userSectorNames.length
                ? userSectorNames[0]
                : user?.email || "Usuário"}
            </NavLabel>
          </NavItem>
        )}
        <NavItem role="button" onClick={handleLogout} title="Sair">
          <NavIcon>
            <FiLogOut />
          </NavIcon>
          <NavLabel>Sair</NavLabel>
        </NavItem>

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
