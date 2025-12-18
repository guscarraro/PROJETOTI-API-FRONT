// src/App.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminNavbar from './components/AdminNavbar';
import Dashboard from './pages/Dashboard';
import Cotacao from './pages/Cotacao';
import Frete from './pages/Frete';
import CargaLucrativa from './pages/CargaLucrativa';
import Projetos from './pages/Projetos';
import Integrantes from './pages/Projetos/Integrantes';
import ProjetoDetalhe from './pages/Projetos/ProjetoDetalhe';
import { GlobalThemeVars } from "./themeGlobals";
import GestaoAcessos from './pages/Projetos/GestaoAcessos';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import OperacaoFechamento from './pages/OperacaoFechamento';
import EstoqueTi from './pages/EstoqueTi';
import Separacao from './pages/Separacao';
import DashboardConferencia from './pages/Separacao/DashboardConferencia';
import RelatorioConferencia from './pages/Projetos/RelatorioConferencia';
import Projecao from './pages/Projecao';

import apiLocal from './services/apiLocal';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import Frota from './pages/Projetos/Frota';

const ADMIN_UUID = 'c1b389cb-7dee-4f91-9687-b1fad9acbf4c';

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
  ARMAZENAGEM: 9
};

const App = () => {
  
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });

  // Bloqueia a UI até validar a sessão com o back
  const [authChecked, setAuthChecked] = useState(false);

  // 🔐 Autologout por inatividade (front < back)
  useInactivityLogout({
    timeoutMs: 600 * 60 * 1000,
    onTimeout: async () => {
      try { await apiLocal.authLogout(); } catch {}
      localStorage.removeItem('user');
      window.location.href = '/'; // rota de login
    },
  });

  // ✅ SEMPRE valida a sessão no servidor ao montar (independente do localStorage)
  const bootOnceRef = useRef(false);
  useEffect(() => {
    if (bootOnceRef.current) return;
    bootOnceRef.current = true;

    (async () => {
      try {
        const { data } = await apiLocal.authMe(); // 200 se a sessão (cookie) existir
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      } catch {
        // 401: sessão inválida/expirada — limpa e manda pro login se não estiver nele
        localStorage.removeItem('user');
        setUser(null);
        if (window.location.pathname !== '/') {
          window.location.replace('/');
        }
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // Sync entre abas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'user') {
        try { setUser(JSON.parse(e.newValue)); } catch { setUser(null); }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Enquanto não checar a sessão, não renderiza rotas (evita flash e estados estranhos)
  if (!authChecked) {
    return null; // ou um spinner/barrinha de progresso
  }

  return (
    <>
    <GlobalThemeVars />
      {user?.tipo === ADMIN_UUID && <AdminNavbar />}

      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* SAC */}
        <Route
          path="/SAC"
          element={
            <PrivateRoute
              element={<Dashboard />}
              allowedSectors={[SECTORS.FRETE, SECTORS.SAC, SECTORS.OPERACAO, SECTORS.GERENTE_OPERACAO, SECTORS.ADMIN, SECTORS.QUALIDADE]}
            />
          }
        />

        {/* Frete */}
        <Route
          path="/Frete"
          element={
            <PrivateRoute
              element={<Frete />}
              allowedSectors={[SECTORS.FRETE, SECTORS.SAC, SECTORS.OPERACAO, SECTORS.GERENTE_OPERACAO, SECTORS.ADMIN, SECTORS.QUALIDADE]}
            />
          }
        />

        {/* Carga Lucrativa */}
        <Route
          path="/gerar-viagem"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[SECTORS.FRETE, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO]}
            />
          }
        />
        <Route
          path="/gerar-viagem/:numero_viagem"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[SECTORS.FRETE, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO, SECTORS.QUALIDADE]}
            />
          }
        />
        <Route
          path="/gerar-viagem/dashboard"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[SECTORS.FRETE, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO, SECTORS.QUALIDADE]}
            />
          }
        />
        <Route
          path="/gerar-viagem/custos"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[SECTORS.FRETE, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO]}
            />
          }
        />
        <Route
          path="/gerar-viagem/relatorio"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[SECTORS.FRETE, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO, SECTORS.QUALIDADE]}
            />
          }
        />

        {/* Operação */}
        <Route
          path="/Operacao"
          element={
            <PrivateRoute
              element={<OperacaoFechamento />}
              allowedSectors={[SECTORS.OPERACAO, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO, SECTORS.QUALIDADE]}
            />
          }
        />

        {/* Projeto Frota / Cotação */}

        <Route
          path="/Cotacao"
          element={<PrivateRoute element={<Cotacao />} allowedSectors={[SECTORS.ADMIN]} />}
        />

        {/* TI */}
        <Route
          path="/ti"
          element={<PrivateRoute element={<EstoqueTi />} allowedSectors={[SECTORS.TI, SECTORS.ADMIN, SECTORS.QUALIDADE]} />}
        />

        {/* Projetos */}
        <Route path="/Projetos" element={<PrivateRoute element={<Projetos />} />} />
        <Route path="/Projetos/:id" element={<PrivateRoute element={<ProjetoDetalhe />} />} />

        {/* Gestão de Acessos */}
        <Route
          path="/Projetos/GestaoAcessos"
          element={<PrivateRoute element={<GestaoAcessos />} allowedSectors={[SECTORS.ADMIN, SECTORS.TI]} />}
        />
          <Route
         path="/conferencia"
         element={
           <PrivateRoute
             element={<Separacao />}
             allowedSectors={[SECTORS.OPERACAO, SECTORS.SAC, SECTORS.GERENTE_OPERACAO, SECTORS.ADMIN,SECTORS.ARMAZENAGEM, SECTORS.FERSA_CLIENTE, SECTORS.COLETORES, SECTORS.QUALIDADE]}
           />
         }
       />
          <Route
         path="/Frota"
         element={
           <PrivateRoute
             element={<Frota />}
             allowedSectors={[SECTORS.ADMIN, SECTORS.FROTA]}
           />
         }
       />
          <Route
         path="/conferencia/integrantes"
         element={
           <PrivateRoute
             element={<Integrantes />}
             allowedSectors={[SECTORS.OPERACAO, SECTORS.SAC, SECTORS.GERENTE_OPERACAO,SECTORS.ARMAZENAGEM, SECTORS.ADMIN, SECTORS.QUALIDADE]}
           />
         }
       />
                 <Route
         path="/conferencia/dashboard"
         element={
           <PrivateRoute
             element={<DashboardConferencia />}
             allowedSectors={[SECTORS.OPERACAO, SECTORS.SAC, SECTORS.GERENTE_OPERACAO,SECTORS.ARMAZENAGEM, SECTORS.FERSA_CLIENTE,SECTORS.ADMIN, SECTORS.QUALIDADE]}
           />
         }
       />
                 <Route
         path="/conferencia/relatorio"
         element={
           <PrivateRoute
             element={<RelatorioConferencia />}
             allowedSectors={[SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO, SECTORS.SAC,SECTORS.ARMAZENAGEM, SECTORS.FERSA_CLIENTE, SECTORS.QUALIDADE]}
           />
         }
       />
          <Route
         path="/projecao"
         element={
           <PrivateRoute
             element={<Projecao />}
             allowedSectors={[SECTORS.ADMIN]}
           />
         }
       />
      </Routes>
    </>
  );
};

export default App;
