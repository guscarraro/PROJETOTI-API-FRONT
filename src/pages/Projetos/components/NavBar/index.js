import React, { useEffect, useMemo, useRef, useState } from "react";
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
import Notifications from "./Notifications";
import Notas from "./Notas";

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
        const res = await apiLocal.getSetores();
        setAllSectors(res.data || []);
      } catch {
        setAllSectors([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (user?.id) {
          const res = await apiLocal.setUsuarioDarkmode(user.id, dark);
          const updated = res?.data?.data || res?.data;
          const nextUser = updated?.id ? updated : { ...user, darkmode: dark };
          localStorage.setItem("user", JSON.stringify(nextUser));
          setUser(nextUser);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark, user?.id]);

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

  const avatarInitial = (
    user?.email?.split("@")[0]?.slice(0, 2) || "U"
  ).toUpperCase();

  const handleLogout = async () => {
    try {
      await apiLocal.logout?.();
    } catch {}
    const theme = localStorage.getItem("theme");
    localStorage.clear();
    if (theme) localStorage.setItem("theme", theme);
    navigate("/");
  };

  // Medir largura atual da navbar e repassar para <Notifications />
  const navWrapRef = useRef(null);
  const [navWidth, setNavWidth] = useState(0);
  useEffect(() => {
    const el = navWrapRef.current;
    if (!el) return;
    const update = () => setNavWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <NavWrap ref={navWrapRef}>
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
            role="button"
            title="Notas de atualização"
            $active={false}
            onClick={(e) => e.stopPropagation()}
          >
            <NavIcon style={{ position: "relative" }}>
              <Notas version="1.2" /> {/* << ADICIONE ESTA LINHA */}
            </NavIcon>
            <NavLabel>Notas nova versão</NavLabel>
          </NavItem>
        )}
        {/* {user && (
          <NavItem
            role="button"
            title="Notificações"
            $active={false}
            onClick={(e) => {
              e.stopPropagation();
              // o próprio componente controla abrir/fechar
              // (clicar fora fecha)
            }}
          >
            <NavIcon style={{ position: "relative" }}>
              <Notifications
                user={user}
                navWidth={navWidth} // <<<<<< repassa a largura
                onOpenProject={(pid) => navigate(`/projetos/${pid}`)}
              />
            </NavIcon>
            <NavLabel>Notificações</NavLabel>
          </NavItem>
        )} */}

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
