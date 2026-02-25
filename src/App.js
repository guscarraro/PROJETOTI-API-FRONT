import React, { useCallback, useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import AdminNavbar from "./components/AdminNavbar";
import Dashboard from "./pages/Dashboard";
import Cotacao from "./pages/Cotacao";
import Frete from "./pages/Frete";
import CargaLucrativa from "./pages/CargaLucrativa";
import Projetos from "./pages/Projetos";
import Integrantes from "./pages/Projetos/Integrantes";
import ProjetoDetalhe from "./pages/Projetos/ProjetoDetalhe";
import { GlobalThemeVars } from "./themeGlobals";
import GestaoAcessos from "./pages/Projetos/GestaoAcessos";
import Login from "./pages/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import OperacaoFechamento from "./pages/OperacaoFechamento";
import EstoqueTi from "./pages/EstoqueTi";
import Separacao from "./pages/Separacao";
import DashboardConferencia from "./pages/Separacao/DashboardConferencia";
import RelatorioConferencia from "./pages/Projetos/RelatorioConferencia";
import Projecao from "./pages/Projecao";
import Projecao2 from "./pages/Projecao2";

import apiLocal from "./services/apiLocal";
import { useInactivityLogout } from "./hooks/useInactivityLogout";
import Frota from "./pages/Projetos/Frota";
import ProdOperacao from "./pages/Projetos/ProdOperacao";
import Cadastros from "./pages/Projetos/Cadastros";
import CadastroProdutoPage from "./pages/Projetos/Produto";

const ADMIN_UUID = "c1b389cb-7dee-4f91-9687-b1fad9acbf4c";

const SECTORS = {
  TI: 2,
  SAC: 3,
  FRETE: 4,
  OPERACAO: 5,
  ADMIN: 6,
  QUALIDADE: 7,
  GERENTE_OPERACAO: 16,
  FERSA_CLIENTE: 23,
  COLETORES: 25,
  FROTA: 14,
  ARMAZENAGEM: 9,
  RAIA: 26,
};

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [authChecked, setAuthChecked] = useState(false);

  const handleTimeout = useCallback(async () => {
    try {
      await apiLocal.authLogout();
    } catch {}

    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    window.location.replace("/");
  }, []);

  // ✅ Autologout por inatividade (20 h)
  useInactivityLogout({
    timeoutMs: 20 * 60 * 60 * 1000,
    onTimeout: handleTimeout,
  });

  // ✅ valida sessão no servidor ao montar
  const bootOnceRef = useRef(false);

  useEffect(() => {
    if (bootOnceRef.current) return;
    bootOnceRef.current = true;

    (async () => {
      try {
        const { data } = await apiLocal.authMe(); // 200 se cookie OU Bearer existir
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      } catch (err) {
        // ✅ só derruba login se for 401 (sem sessão mesmo)
        const status = err?.response?.status;

        if (status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
          setUser(null);

          if (window.location.pathname !== "/") {
            window.location.replace("/");
          }
        }
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // Sync entre abas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!authChecked) return null;

  return (
    <>
      <GlobalThemeVars />
      {user?.tipo === ADMIN_UUID && <AdminNavbar />}

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/SAC"
          element={
            <PrivateRoute
              element={<Dashboard />}
              allowedSectors={[
                SECTORS.FRETE,
                SECTORS.SAC,
                SECTORS.OPERACAO,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.ADMIN,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />

        <Route
          path="/Frete"
          element={
            <PrivateRoute
              element={<Frete />}
              allowedSectors={[
                SECTORS.FRETE,
                SECTORS.SAC,
                SECTORS.OPERACAO,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.ADMIN,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />

        <Route
          path="/gerar-viagem"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[
                SECTORS.FRETE,
                SECTORS.ADMIN,
                SECTORS.GERENTE_OPERACAO,
              ]}
            />
          }
        />
        <Route
          path="/gerar-viagem/:numero_viagem"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[
                SECTORS.FRETE,
                SECTORS.ADMIN,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />
        <Route
          path="/gerar-viagem/dashboard"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[
                SECTORS.FRETE,
                SECTORS.ADMIN,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />
        <Route
          path="/gerar-viagem/custos"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[
                SECTORS.FRETE,
                SECTORS.ADMIN,
                SECTORS.GERENTE_OPERACAO,
              ]}
            />
          }
        />
        <Route
          path="/gerar-viagem/relatorio"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[
                SECTORS.FRETE,
                SECTORS.ADMIN,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />

        <Route
          path="/Operacao"
          element={
            <PrivateRoute
              element={<OperacaoFechamento />}
              allowedSectors={[
                SECTORS.OPERACAO,
                SECTORS.ADMIN,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />
        <Route
          path="/Operacao/produtividade-operacao"
          element={
            <PrivateRoute
              element={<ProdOperacao />}
              allowedSectors={[
                SECTORS.OPERACAO,
                SECTORS.ADMIN,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.QUALIDADE,
                SECTORS.SAC,
                SECTORS.FRETE
              ]}
            />
          }
        />

        <Route
          path="/cadastros/*"
          element={
            <PrivateRoute
              element={<Cadastros />}
              allowedSectors={[
                SECTORS.OPERACAO,
                SECTORS.ADMIN,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />

        <Route
          path="/Cotacao"
          element={
            <PrivateRoute element={<Cotacao />} allowedSectors={[SECTORS.ADMIN]} />
          }
        />

        <Route
          path="/ti"
          element={
            <PrivateRoute
              element={<EstoqueTi />}
              allowedSectors={[SECTORS.TI, SECTORS.ADMIN, SECTORS.QUALIDADE]}
            />
          }
        />

        <Route path="/Projetos" element={<PrivateRoute element={<Projetos />} />} />
        <Route
          path="/Projetos/:id"
          element={<PrivateRoute element={<ProjetoDetalhe />} />}
        />

        <Route
          path="/Projetos/GestaoAcessos"
          element={
            <PrivateRoute
              element={<GestaoAcessos />}
              allowedSectors={[SECTORS.ADMIN, SECTORS.TI]}
            />
          }
        />

        <Route
          path="/conferencia"
          element={
            <PrivateRoute
              element={<Separacao />}
              allowedSectors={[
                SECTORS.OPERACAO,
                SECTORS.SAC,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.ADMIN,
                SECTORS.ARMAZENAGEM,
                SECTORS.FERSA_CLIENTE,
                SECTORS.COLETORES,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />

        <Route
          path="/Frota/Analise-HA"
          element={
            <PrivateRoute
              element={<Frota />}
              allowedSectors={[SECTORS.ADMIN, SECTORS.FROTA]}
            />
          }
        />

        <Route
          path="/Frota/Analise-Performaxxi"
          element={
            <PrivateRoute
              element={<Frota />}
              allowedSectors={[
                SECTORS.ADMIN,
                SECTORS.FROTA,
                SECTORS.TI,
                SECTORS.RAIA,
              ]}
            />
          }
        />

        <Route
          path="/conferencia/integrantes"
          element={
            <PrivateRoute
              element={<Integrantes />}
              allowedSectors={[
                SECTORS.OPERACAO,
                SECTORS.SAC,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.ARMAZENAGEM,
                SECTORS.ADMIN,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />
        <Route
          path="/conferencia/cadastro-sku"
          element={
            <PrivateRoute
              element={<CadastroProdutoPage />}
              allowedSectors={[
                SECTORS.OPERACAO,
                SECTORS.SAC,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.ARMAZENAGEM,
                SECTORS.ADMIN,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />

        <Route
          path="/conferencia/dashboard"
          element={
            <PrivateRoute
              element={<DashboardConferencia />}
              allowedSectors={[
                SECTORS.OPERACAO,
                SECTORS.SAC,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.ARMAZENAGEM,
                SECTORS.FERSA_CLIENTE,
                SECTORS.ADMIN,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />

        <Route
          path="/conferencia/relatorio"
          element={
            <PrivateRoute
              element={<RelatorioConferencia />}
              allowedSectors={[
                SECTORS.ADMIN,
                SECTORS.GERENTE_OPERACAO,
                SECTORS.SAC,
                SECTORS.ARMAZENAGEM,
                SECTORS.FERSA_CLIENTE,
                SECTORS.QUALIDADE,
              ]}
            />
          }
        />

        <Route
          path="/projecao"
          element={
            <PrivateRoute element={<Projecao />} allowedSectors={[SECTORS.ADMIN, SECTORS.FROTA]} />
          }
        />
        <Route
          path="/Operacao/Dashboard"
          element={
            <PrivateRoute element={<Projecao2 />} allowedSectors={[SECTORS.ADMIN, SECTORS.FROTA, SECTORS.QUALIDADE]} />
          }
        />
      </Routes>
    </>
  );
};

export default App;
