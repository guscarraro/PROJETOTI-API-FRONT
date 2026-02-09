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
  FiMoon,
  FiSun,
  FiMap,
  FiShield,
  FiHeadphones,
  FiLogOut,
  FiPackage,
  FiChevronDown,
  FiClipboard,
  FiUsers,
  FiActivity,
  FiCpu,
  FiBriefcase,
  FiHash,
  FiTruck,
  FiFolder,
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
  const [frotaOpen, setFrotaOpen] = useState(false);
  const [operacaoOpen, setOperacaoOpen] = useState(false);
  const [cadOpen, setCadOpen] = useState(false); // ✅ NOVO dropdown Cadastros
  const [mobileOpen, setMobileOpen] = useState(false);

  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (localStorage.getItem("theme") || "") === "dark";
  });

  const [allSectors, setAllSectors] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const userSafe = user || {};

  // ✅ fecha dropdowns ao trocar rota
  useEffect(() => {
    setConfOpen(false);
    setFrotaOpen(false);
    setOperacaoOpen(false);
    setCadOpen(false); // ✅ NOVO
    setMobileOpen(false);
  }, [pathname]);

  // ✅ fecha dropdowns quando o menu mobile fecha
  useEffect(() => {
    if (!mobileOpen) {
      setConfOpen(false);
      setFrotaOpen(false);
      setOperacaoOpen(false);
      setCadOpen(false); // ✅ NOVO
    }
  }, [mobileOpen]);

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
      (Array.isArray(userSafe?.setor_ids) && userSafe.setor_ids) ||
      (Array.isArray(userSafe?.setores) && userSafe.setores) ||
      [];

    return ids
      .map(
        (sid) =>
          allSectors.find(
            (s) => String(s.id) === String(sid) || Number(s.id) === Number(sid)
          )?.nome
      )
      .filter(Boolean);
  }, [userSafe, allSectors]);

  const isAdmin = useMemo(() => {
    return (
      userSafe?.tipo === ADMIN_UUID ||
      userSectorNames.some((n) => n?.toLowerCase() === "admin")
    );
  }, [userSafe?.tipo, userSectorNames]);

  const setorIds = useMemo(() => {
    const ids = Array.isArray(userSafe?.setor_ids) ? userSafe.setor_ids : [];
    const out = [];
    for (let i = 0; i < ids.length; i++) out.push(Number(ids[i]));
    return out;
  }, [userSafe?.setor_ids]);

  const isSetor23 = setorIds.includes(23);
  const isSetor6 = setorIds.includes(6);
  const isSetor9 = setorIds.includes(9);
  const isSetorTI = setorIds.includes(2);
  const isSetor7 = setorIds.includes(7);
  const isSetor16 = setorIds.includes(16);
  const isSetor25 = setorIds.includes(25);
  const isSetor14 = setorIds.includes(14);
  const isSetor5 = setorIds.includes(5); // ✅ NOVO: acesso aos Cadastros

  const lowerSetores = Array.isArray(userSafe?.setores)
    ? userSafe.setores.map((s) => String(s).toLowerCase())
    : [];

  const isFersa =
    isSetor23 ||
    lowerSetores.includes("fersa_cliente") ||
    userSectorNames.some(
      (n) => String(n || "").toLowerCase() === "fersa_cliente"
    );

  const isColetores =
    isSetor25 ||
    lowerSetores.includes("coletores") ||
    userSectorNames.some((n) => String(n || "").toLowerCase() === "coletores");

  const isRestrictedUser = isFersa || isColetores;

  // ✅ usuário 26 (regra existente)
  const isUser26 = setorIds.includes(26) || String(userSafe?.id) === "26";

  // ✅ usuário 27: só vê Operação > Produtividade
  const isUser27 = String(userSafe?.id) === "27";

  const avatarInitial = (
    userSafe?.email?.split("@")[0]?.slice(0, 2) || "U"
  ).toUpperCase();

  const handleLogout = async () => {
    try {
      await apiLocal.authLogout?.();
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

  // ✅ itens base (default)
  const items = useMemo(() => {
    const base = [
      { key: "projetos", label: "Projetos", icon: <FiFolder />, to: "/projetos" },
      { key: "frete", label: "Frete", icon: <FiMap />, to: "/frete" },
      { key: "sac", label: "SAC", icon: <FiHeadphones />, to: "/sac" },
    ];

    // Operação dropdown (admin)
    if (isAdmin) {
      base.unshift({
        key: "operacao",
        type: "dropdown",
        label: "Operação",
        icon: <FiBriefcase />,
      });
    }

    // ✅ NOVO: Cadastros dropdown (admin OU setor 5)
    if (isAdmin || isSetor5 || isSetor7) {
      base.push({
        key: "cadastros",
        type: "dropdown",
        label: "Cadastros",
        icon: <FiUsers />,
      });
    }

    if (isAdmin || isSetorTI) {
      base.push({
        key: "acessos",
        label: "Gestão de Acessos",
        icon: <FiShield />,
        to: "/projetos/gestaoacessos",
      });
    }

    return base;
  }, [isAdmin, isSetorTI, isSetor5, isSetor7]);

  if (!user) return null;

  // ======================
  // VIEW: user 27 (somente Operação > Produtividade)
  // ======================
  if (isUser27) {
    return (
      <NavWrap ref={navWrapRef} data-open={mobileOpen}>
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
          <NavItem
            key="produtividade-operacao"
            $active={pathname.toLowerCase() === "/Operacao/produtividade-operacao"}
            onClick={() => {
              setMobileOpen(false);
              navigate("/Operacao/produtividade-operacao");
            }}
            title="Produtividade Operação"
          >
            <NavIcon>
              <FiActivity />
            </NavIcon>
            <NavLabel>Produtividade</NavLabel>
          </NavItem>

          <NavSpacer />

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

          <NavLabel>Versão 1.2.10</NavLabel>
        </NavInner>
      </NavWrap>
    );
  }

  // ======================
  // VIEW: user 26
  // ======================
  if (isUser26) {
    return (
      <NavWrap ref={navWrapRef} data-open={mobileOpen}>
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
          <NavItem
            key="analise-performaxxi"
            $active={pathname.toLowerCase() === "/frota/analise-performaxxi"}
            onClick={() => {
              setMobileOpen(false);
              navigate("/frota/analise-performaxxi");
            }}
            title="Análise Performaxxi"
          >
            <NavIcon>
              <FiActivity />
            </NavIcon>
            <NavLabel>Análise Performaxxi</NavLabel>
          </NavItem>

          <NavSpacer />

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

          <NavLabel>Versão 1.2.10</NavLabel>
        </NavInner>
      </NavWrap>
    );
  }

  // ======================
  // VIEW: restricted users
  // ======================
  if (isRestrictedUser) {
    return (
      <NavWrap ref={navWrapRef} data-open={mobileOpen}>
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
                {!isSetor25 && (
                  <NavItem
                    $active={pathname === "/conferencia/dashboard"}
                    onClick={() => {
                      setConfOpen(false);
                      setMobileOpen(false);
                      navigate("/conferencia/dashboard");
                    }}
                    title="Dashboard"
                    style={{ width: "100%" }}
                  >
                    <NavIcon>
                      <FiActivity />
                    </NavIcon>
                    <NavLabel>Dashboard</NavLabel>
                  </NavItem>
                )}

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

                {!isColetores && (
                  <NavItem
                    $active={pathname === "/conferencia/relatorio"}
                    onClick={() => {
                      setConfOpen(false);
                      setMobileOpen(false);
                      navigate("/conferencia/relatorio");
                    }}
                    title="Relatório"
                    style={{ width: "100%" }}
                  >
                    <NavIcon>
                      <FaFileArchive />
                    </NavIcon>
                    <NavLabel>Relatório</NavLabel>
                  </NavItem>
                )}

                <NavItem
                  $active={pathname === "/conferencia/cadastro-sku"}
                  onClick={() => {
                    setConfOpen(false);
                    setMobileOpen(false);
                    navigate("/conferencia/cadastro-sku");
                  }}
                  title="Cadastro SKU"
                  style={{ width: "100%" }}
                >
                  <NavIcon>
                    <FiHash />
                  </NavIcon>
                  <NavLabel>Cadastro SKU</NavLabel>
                </NavItem>
              </div>
            )}
          </div>

          <NavSpacer />

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

          <NavLabel>Versão 1.2.10</NavLabel>
        </NavInner>
      </NavWrap>
    );
  }

  // ======================
  // VIEW: default
  // ======================
  return (
    <NavWrap ref={navWrapRef} data-open={mobileOpen}>
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
        {items.map((it) => {
          // ✅ Operação dropdown (já existia)
          if (it.type === "dropdown" && it.key === "operacao") {
            return (
              <div key="operacao-dd" style={{ position: "relative" }}>
                <NavItem
                  $active={
                    pathname.toLowerCase().startsWith("/operacao") ||
                    pathname.toLowerCase().startsWith("/operacao-fechamento") ||
                    pathname.toLowerCase().startsWith("/Operacao/produtividade-operacao") ||
                    pathname.toLowerCase().startsWith("/dashboard-produtividade")
                  }
                  onClick={() => setOperacaoOpen((v) => !v)}
                  title="Operação"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  <NavIcon>{it.icon}</NavIcon>
                  <NavLabel>Operação</NavLabel>
                  <NavIcon
                    style={{
                      transition: "transform 0.2s ease",
                      transform: operacaoOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <FiChevronDown />
                  </NavIcon>
                </NavItem>

                {operacaoOpen && (
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
                      $active={pathname.toLowerCase() === "/operacao-fechamento"}
                      onClick={() => {
                        setOperacaoOpen(false);
                        setMobileOpen(false);
                        navigate("/operacao-fechamento");
                      }}
                      title="Operação (Fechamento)"
                      style={{ width: "100%" }}
                    >
                      <NavIcon>
                        <FiBriefcase />
                      </NavIcon>
                      <NavLabel>Fechamento</NavLabel>
                    </NavItem>

                    <NavItem
                      $active={pathname.toLowerCase() === "/Operacao/produtividade-operacao"}
                      onClick={() => {
                        setOperacaoOpen(false);
                        setMobileOpen(false);
                        navigate("/Operacao/produtividade-operacao");
                      }}
                      title="Produtividade Operação"
                      style={{ width: "100%" }}
                    >
                      <NavIcon>
                        <FiActivity />
                      </NavIcon>
                      <NavLabel>Produtividade</NavLabel>
                    </NavItem>

                    {/* <NavItem
                      $active={pathname.toLowerCase() === "/dashboard-produtividade"}
                      onClick={() => {
                        setOperacaoOpen(false);
                        setMobileOpen(false);
                        navigate("/dashboard-produtividade");
                      }}
                      title="Dashboard Produtividade"
                      style={{ width: "100%" }}
                    >
                      <NavIcon>
                        <FiActivity />
                      </NavIcon>
                      <NavLabel>Dashboard</NavLabel>
                    </NavItem> */}
                  </div>
                )}
              </div>
            );
          }

          // ✅ NOVO: Cadastros dropdown
          if (it.type === "dropdown" && it.key === "cadastros") {
            return (
              <div key="cadastros-dd" style={{ position: "relative" }}>
                <NavItem
                  $active={pathname.toLowerCase().startsWith("/cadastros")}
                  onClick={() => setCadOpen((v) => !v)}
                  title="Cadastros"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  <NavIcon>{it.icon}</NavIcon>
                  <NavLabel>Cadastros</NavLabel>
                  <NavIcon
                    style={{
                      transition: "transform 0.2s ease",
                      transform: cadOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <FiChevronDown />
                  </NavIcon>
                </NavItem>

                {cadOpen && (
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
                      $active={pathname.toLowerCase() === "/cadastros/motoristas"}
                      onClick={() => {
                        setCadOpen(false);
                        setMobileOpen(false);
                        navigate("/cadastros/motoristas");
                      }}
                      title="Motoristas"
                      style={{ width: "100%" }}
                    >
                      <NavIcon>
                        <FiTruck />
                      </NavIcon>
                      <NavLabel>Motoristas</NavLabel>
                    </NavItem>

                    <NavItem
                      $active={pathname.toLowerCase() === "/cadastros/responsaveis"}
                      onClick={() => {
                        setCadOpen(false);
                        setMobileOpen(false);
                        navigate("/cadastros/responsaveis");
                      }}
                      title="Responsáveis"
                      style={{ width: "100%" }}
                    >
                      <NavIcon>
                        <FiUsers />
                      </NavIcon>
                      <NavLabel>Responsáveis</NavLabel>
                    </NavItem>
                    <NavItem
                      $active={pathname.toLowerCase() === "/cadastros/veiculos"}
                      onClick={() => {
                        setCadOpen(false);
                        setMobileOpen(false);
                        navigate("/cadastros/veiculos");
                      }}
                      title="Veiculos"
                      style={{ width: "100%" }}
                    >
                      <NavIcon>
                        <FiTruck />
                      </NavIcon>
                      <NavLabel>Veiculos</NavLabel>
                    </NavItem>
                  </div>
                )}
              </div>
            );
          }

          // ✅ itens normais
          return (
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
          );
        })}

        {(isAdmin || isSetor14) && (
          <div style={{ position: "relative" }}>
            <NavItem
              key="frota"
              $active={pathname.toLowerCase().startsWith("/frota")}
              onClick={() => setFrotaOpen((v) => !v)}
              title="Frota"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <NavIcon>
                <FiTruck />
              </NavIcon>
              <NavLabel>Frota</NavLabel>
              <NavIcon
                style={{
                  transition: "transform 0.2s ease",
                  transform: frotaOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <FiChevronDown />
              </NavIcon>
            </NavItem>

            {frotaOpen && (
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
                  $active={pathname.toLowerCase() === "/frota/analise-ha"}
                  onClick={() => {
                    setFrotaOpen(false);
                    setMobileOpen(false);
                    navigate("/frota/analise-ha");
                  }}
                  title="Análise HA"
                  style={{ width: "100%" }}
                >
                  <NavIcon>
                    <FiActivity />
                  </NavIcon>
                  <NavLabel>Análise HA</NavLabel>
                </NavItem>

                <NavItem
                  $active={pathname.toLowerCase() === "/frota/analise-performaxxi"}
                  onClick={() => {
                    setConfOpen(false);
                    setFrotaOpen(false);
                    setMobileOpen(false);
                    navigate("/frota/analise-performaxxi");
                  }}
                  title="Análise Performaxxi"
                  style={{ width: "100%" }}
                >
                  <NavIcon>
                    <FiActivity />
                  </NavIcon>
                  <NavLabel>Análise Performaxxi</NavLabel>
                </NavItem>
              </div>
            )}
          </div>
        )}

        {(isSetor16 ||
          isSetor7 ||
          isSetor6 ||
          isSetor9 ||
          isSetor23 ||
          isSetor25) && (
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
                {!isSetor25 && (
                  <NavItem
                    $active={pathname === "/conferencia/dashboard"}
                    onClick={() => {
                      setConfOpen(false);
                      setMobileOpen(false);
                      navigate("/conferencia/dashboard");
                    }}
                    title="Dashboard"
                    style={{ width: "100%" }}
                  >
                    <NavIcon>
                      <FiActivity />
                    </NavIcon>
                    <NavLabel>Dashboard</NavLabel>
                  </NavItem>
                )}

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

                {!isSetor25 && (
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

                <NavItem
                  $active={pathname === "/conferencia/cadastro-sku"}
                  onClick={() => {
                    setConfOpen(false);
                    setMobileOpen(false);
                    navigate("/conferencia/cadastro-sku");
                  }}
                  title="Cadastro SKU"
                  style={{ width: "100%" }}
                >
                  <NavIcon>
                    <FiHash />
                  </NavIcon>
                  <NavLabel>Cadastro SKU</NavLabel>
                </NavItem>
              </div>
            )}
          </div>
        )}

        {(isAdmin || isSetorTI) && (
          <NavItem
            key="estoque-ti"
            $active={pathname.toLowerCase().startsWith("/ti")}
            onClick={() => {
              setMobileOpen(false);
              navigate("/ti");
            }}
            title="Estoque TI"
          >
            <NavIcon>
              <FiCpu />
            </NavIcon>
            <NavLabel>Estoque TI</NavLabel>
          </NavItem>
        )}

        <NavSpacer />

        <NavItem
          role="button"
          title="Notas de atualização"
          $active={false}
          onClick={(e) => e.stopPropagation()}
        >
          <NavIcon style={{ position: "relative" }}>
            <Notas version="1.2.10" />
          </NavIcon>
          <NavLabel>Notas nova versão</NavLabel>
        </NavItem>

        <NavItem
          role="button"
          title="Notificações"
          $active={false}
          onClick={(e) => e.stopPropagation()}
        >
          <NavIcon style={{ position: "relative" }}>
            <Notifications
              user={userSafe}
              navWidth={navWidth}
              onOpenProject={(pid) => navigate(`/projetos/${pid}`)}
            />
          </NavIcon>
          <NavLabel>Notificações</NavLabel>
        </NavItem>

        <NavItem
          title={userSectorNames.length ? userSectorNames.join(", ") : "Usuário"}
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
            {userSectorNames.length ? userSectorNames[0] : userSafe?.email || "Usuário"}
          </NavLabel>
        </NavItem>

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

        <NavLabel>Versão 1.2.10</NavLabel>
      </NavInner>
    </NavWrap>
  );
}
