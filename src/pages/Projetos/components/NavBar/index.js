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
  FiPackage,
  FiChevronDown,
  FiClipboard,
  FiUsers,
} from "react-icons/fi";
import apiLocal from "../../../../services/apiLocal";
import Notifications from "./Notifications";
import Notas from "./Notas";
import { FaFileArchive } from "react-icons/fa";

const ADMIN_UUID = "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";

export default function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [confOpen, setConfOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (localStorage.getItem("theme") || "") === "dark";
  });

  useEffect(() => {
    setConfOpen(false);
    setMobileOpen(false);
  }, [pathname]);

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
  const setorIds = (Array.isArray(user?.setor_ids) ? user.setor_ids : []).map(
    Number
  );

  const isSetor23 = setorIds.includes(23);
  const isSetor6 = setorIds.includes(6);
  const isSetor9 = setorIds.includes(9);
  const isSetor25 = setorIds.includes(25);
  const lowerSetores = Array.isArray(user?.setores)
    ? user.setores.map((s) => String(s).toLowerCase())
    : [];

  const isRestrictedUser =
    isSetor23 ||
    isSetor25 ||
    lowerSetores.includes("fersa_cliente") ||
    lowerSetores.includes("coletores") ||
    userSectorNames.some((n) => {
      const nome = String(n || "").toLowerCase();
      return nome === "fersa_cliente" || nome === "coletores";
    });
  if (isRestrictedUser) {
    return (
      <NavWrap ref={navWrapRef} data-open={mobileOpen}>
        {/* Botão Hamburguer (mobile) */}
        <button
          className="nav-hamburger"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen((v) => !v);
          }}
        >
          <span className="line" />
        </button>

        <NavInner>
          {(isSetor6 || isSetor9 || isSetor23 || isSetor25) && (
            <div style={{ position: "relative" }}>
              <NavItem
                key="conferencia"
                $active={pathname.toLowerCase().startsWith("/conferencia")}
                onClick={() => setConfOpen((v) => !v)}
                title="Conferência"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-around",
                }}
              >
                <NavIcon>
                  <FiPackage />
                </NavIcon>
                <NavLabel>Conferência</NavLabel>
                <NavIcon
                  style={{
                    transition: "transform 0.2s ease",
                    transform: confOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <FiChevronDown />
                </NavIcon>
              </NavItem>

              {confOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    background: "var(--nav-bg, #0f172a)",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 10,
                    padding: 6,
                    marginTop: 6,
                    minWidth: "100%",
                    boxShadow: "0 10px 20px rgba(0,0,0,.3)",
                    zIndex: 10,
                  }}
                >
                  <NavItem
                    $active={pathname === "/conferencia"}
                    onClick={() => {
                      setConfOpen(false);
                      setMobileOpen(false);
                      navigate("/conferencia");
                    }}
                    title="Pedidos"
                    style={{ width: "100%" }}
                  >
                    <NavIcon>
                      <FiClipboard />
                    </NavIcon>
                    <NavLabel>Pedidos</NavLabel>
                  </NavItem>
                </div>
              )}
            </div>
          )}
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

          <NavItem
            role="button"
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            title="Sair"
          >
            <NavIcon>
              <FiLogOut />
            </NavIcon>
            <NavLabel>Sair</NavLabel>
          </NavItem>

          <NavItem
            role="button"
            onClick={() => {
              setMobileOpen(false);
              setDark((v) => !v);
            }}
            title={dark ? "Desativar Dark Mode" : "Ativar Dark Mode"}
          >
            <NavIcon>{dark ? <FiSun /> : <FiMoon />}</NavIcon>
            <NavLabel>{dark ? "Claro" : "Escuro"}</NavLabel>
          </NavItem>
        </NavInner>
      </NavWrap>
    );
  }

  if (!user) return null;

  return (
    <NavWrap ref={navWrapRef} data-open={mobileOpen}>
      {/* Botão Hamburguer (mobile) */}
      <button
        className="nav-hamburger"
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        onClick={(e) => {
          e.stopPropagation();
          setMobileOpen((v) => !v);
        }}
      >
        <span className="line" />
      </button>

      <NavInner>
        {items.map((it) => (
          <NavItem
            key={it.key}
            $active={pathname.toLowerCase() === it.to.toLowerCase()}
            onClick={() => {
              setMobileOpen(false);
              navigate(it.to);
            }}
            title={it.label}
          >
            <NavIcon>{it.icon}</NavIcon>
            <NavLabel>{it.label}</NavLabel>
          </NavItem>
        ))}

        {(isSetor6 || isSetor9 || isSetor23 || isSetor25) && (
          <div style={{ position: "relative" }}>
            <NavItem
              key="conferencia"
              $active={pathname.toLowerCase().startsWith("/conferencia")}
              onClick={() => setConfOpen((v) => !v)}
              title="Conferência"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <NavIcon>
                <FiPackage />
              </NavIcon>
              <NavLabel>Conferência</NavLabel>
              <NavIcon
                style={{
                  transition: "transform 0.2s ease",
                  transform: confOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <FiChevronDown />
              </NavIcon>
            </NavItem>

            {confOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  background: "var(--nav-bg, #0f172a)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 10,
                  padding: 6,
                  marginTop: 6,
                  minWidth: "100%",
                  boxShadow: "0 10px 20px rgba(0,0,0,.3)",
                  zIndex: 10,
                }}
              >
                <NavItem
                  $active={pathname === "/conferencia"}
                  onClick={() => {
                    setConfOpen(false);
                    setMobileOpen(false);
                    navigate("/conferencia");
                  }}
                  title="Pedidos"
                  style={{ width: "100%" }}
                >
                  <NavIcon>
                    <FiClipboard />
                  </NavIcon>
                  <NavLabel>Pedidos</NavLabel>
                </NavItem>
                {!isSetor23 && !isSetor25 && (
                  <NavItem
                    $active={pathname === "/conferencia/integrantes"}
                    onClick={() => {
                      setConfOpen(false);
                      setMobileOpen(false);
                      navigate("/conferencia/integrantes");
                    }}
                    title="Integrantes"
                    style={{ width: "100%" }}
                  >
                    <NavIcon>
                      <FiUsers />
                    </NavIcon>
                    <NavLabel>Integrantes</NavLabel>
                  </NavItem>
                )}
                {!isSetor23 && !isSetor25 && (
                  <NavItem
                    $active={pathname === "/conferencia/relatorio"}
                    onClick={() => {
                      setConfOpen(false);
                      setMobileOpen(false);
                      navigate("/conferencia/relatorio");
                    }}
                    title="Relatorio"
                    style={{ width: "100%" }}
                  >
                    <NavIcon>
                      <FaFileArchive />
                    </NavIcon>
                    <NavLabel>Relatório</NavLabel>
                  </NavItem>
                )}
              </div>
            )}
          </div>
        )}

        <NavSpacer />

        {user && (
          <NavItem
            role="button"
            title="Notas de atualização"
            $active={false}
            onClick={(e) => e.stopPropagation()}
          >
            <NavIcon style={{ position: "relative" }}>
              <Notas version="1.2.5" />
            </NavIcon>
            <NavLabel>Notas nova versão</NavLabel>
          </NavItem>
        )}

        {user && (
          <NavItem
            role="button"
            title="Notificações"
            $active={false}
            onClick={(e) => e.stopPropagation()}
          >
            <NavIcon style={{ position: "relative" }}>
              <Notifications
                user={user}
                navWidth={navWidth}
                onOpenProject={(pid) => navigate(`/projetos/${pid}`)}
              />
            </NavIcon>
            <NavLabel>Notificações</NavLabel>
          </NavItem>
        )}

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

        <NavItem
          role="button"
          onClick={() => {
            setMobileOpen(false);
            handleLogout();
          }}
          title="Sair"
        >
          <NavIcon>
            <FiLogOut />
          </NavIcon>
          <NavLabel>Sair</NavLabel>
        </NavItem>

        <NavItem
          role="button"
          onClick={() => {
            setMobileOpen(false);
            setDark((v) => !v);
          }}
          title={dark ? "Desativar Dark Mode" : "Ativar Dark Mode"}
        >
          <NavIcon>{dark ? <FiSun /> : <FiMoon />}</NavIcon>
          <NavLabel>{dark ? "Claro" : "Escuro"}</NavLabel>
        </NavItem>
                
          

            <NavLabel>Versão 1.2.5</NavLabel>
          
       
      </NavInner>
    </NavWrap>
  );
}
