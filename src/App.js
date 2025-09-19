import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminNavbar from './components/AdminNavbar';
import Dashboard from './pages/Dashboard';
import ProjetoFrota from './pages/ProjetoFrota';
import Cotacao from './pages/Cotacao';
import Frete from './pages/Frete';
import CargaLucrativa from './pages/CargaLucrativa';
import Projetos from './pages/Projetos';
import ProjetoDetalhe from './pages/Projetos/ProjetoDetalhe';
import GestaoAcessos from './pages/Projetos/GestaoAcessos';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import OperacaoFechamento from './pages/OperacaoFechamento';
import EstoqueTi from './pages/EstoqueTi';

import apiLocal from './services/apiLocal';
import { useInactivityLogout } from './hooks/useInactivityLogout';

const ADMIN_UUID = 'c1b389cb-7dee-4f91-9687-b1fad9acbf4c';

const SECTORS = {
  ADMIN: 6,
  SAC: 3,
  FRETE: 4,
  OPERACAO: 5,
  TI: 2,
  GERENTE_OPERACAO: 16,
};

const App = () => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });

  // 🔐 Autologout por inatividade (front < back)
  useInactivityLogout({
    timeoutMs: 25 * 60 * 1000,
    onTimeout: async () => {
      try { await apiLocal.authLogout(); } catch {}
      localStorage.removeItem('user');
      window.location.href = '/'; // tua rota de login é "/"
    },
  });

  // ♻️ Bootstrap do usuário a partir do cookie (tenta só UMA vez)
  const bootTriedRef = useRef(false);
  useEffect(() => {
    if (user || bootTriedRef.current) return;
    bootTriedRef.current = true;

    apiLocal.authMe()
      .then(({ data }) => {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      })
      .catch(() => {
        // 401 sem cookie? beleza, fica na tela de login sem redirecionar
      });
  }, [user]);

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

  return (
    <>
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
              allowedSectors={[SECTORS.FRETE, SECTORS.SAC, SECTORS.OPERACAO, SECTORS.GERENTE_OPERACAO, SECTORS.ADMIN]}
            />
          }
        />

        {/* Frete */}
        <Route
          path="/Frete"
          element={
            <PrivateRoute
              element={<Frete />}
              allowedSectors={[SECTORS.FRETE, SECTORS.SAC, SECTORS.OPERACAO, SECTORS.GERENTE_OPERACAO, SECTORS.ADMIN]}
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
              allowedSectors={[SECTORS.FRETE, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO]}
            />
          }
        />
        <Route
          path="/gerar-viagem/dashboard"
          element={
            <PrivateRoute
              element={<CargaLucrativa />}
              allowedSectors={[SECTORS.FRETE, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO]}
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
              allowedSectors={[SECTORS.FRETE, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO]}
            />
          }
        />

        {/* Operação */}
        <Route
          path="/Operacao"
          element={
            <PrivateRoute
              element={<OperacaoFechamento />}
              allowedSectors={[SECTORS.OPERACAO, SECTORS.ADMIN, SECTORS.GERENTE_OPERACAO]}
            />
          }
        />

        {/* Projeto Frota / Cotação */}
        <Route
          path="/ProjetoFrota"
          element={<PrivateRoute element={<ProjetoFrota />} allowedSectors={[SECTORS.ADMIN]} />}
        />
        <Route
          path="/Cotacao"
          element={<PrivateRoute element={<Cotacao />} allowedSectors={[SECTORS.ADMIN]} />}
        />

        {/* TI */}
        <Route
          path="/ti"
          element={<PrivateRoute element={<EstoqueTi />} allowedSectors={[SECTORS.TI, SECTORS.ADMIN]} />}
        />

        {/* Projetos */}
        <Route path="/Projetos" element={<PrivateRoute element={<Projetos />} />} />
        <Route path="/Projetos/:id" element={<PrivateRoute element={<ProjetoDetalhe />} />} />

        {/* Gestão de Acessos */}
        <Route
          path="/Projetos/GestaoAcessos"
          element={<PrivateRoute element={<GestaoAcessos />} allowedSectors={[SECTORS.ADMIN]} />}
        />
      </Routes>
    </>
  );
};

export default App;
