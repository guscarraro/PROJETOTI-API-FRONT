import React from 'react';
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

const ADMIN_UUID = 'c1b389cb-7dee-4f91-9687-b1fad9acbf4c';

// Nomes de setores “humanos” para usar na autorização
const SECTORS = {
  ADMIN: 6,
  SAC: 3,
  FRETE: 4,
  OPERACAO: 5,
  TI: 2,
  GERENTE_OPERACAO: 16,
};

const App = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <>
      {/* Navbar somente para Admin (mantido como estava) */}
      {user?.tipo === ADMIN_UUID && <AdminNavbar />}

      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* SAC (somente setor SAC (ou admin, se seu PrivateRoute tratar “Admin”/privilegiado) */}
        <Route
          path="/SAC"
          element={
            <PrivateRoute
              element={<Dashboard />}
              allowedSectors={[SECTORS.FRETE, SECTORS.SAC,SECTORS.OPERACAO, SECTORS.GERENTE_OPERACAO , SECTORS.ADMIN]}
            />
          }
        />

        {/* Frete */}
        <Route
          path="/Frete"
          element={
            <PrivateRoute
              element={<Frete />}
              allowedSectors={[SECTORS.FRETE, SECTORS.SAC,SECTORS.OPERACAO, SECTORS.GERENTE_OPERACAO  ,SECTORS.ADMIN]}
            />
          }
        />

        {/* Carga Lucrativa (subpáginas do Frete) */}
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

        {/* Projeto Frota / Cotação – restritos (ex.: admin) */}
        <Route
          path="/ProjetoFrota"
          element={
            <PrivateRoute
              element={<ProjetoFrota />}
              allowedSectors={[SECTORS.ADMIN]}
            />
          }
        />
        <Route
          path="/Cotacao"
          element={
            <PrivateRoute
              element={<Cotacao />}
              allowedSectors={[SECTORS.ADMIN]}
            />
          }
        />

        {/* TI */}
        <Route
          path="/ti"
          element={
            <PrivateRoute
              element={<EstoqueTi />}
              allowedSectors={[SECTORS.TI, SECTORS.ADMIN]}
            />
          }
        />

        {/* Projetos: landing e detalhe — qualquer usuário autenticado */}
        <Route
          path="/Projetos"
          element={<PrivateRoute element={<Projetos />} />}
        />
        <Route
          path="/Projetos/:id"
          element={<PrivateRoute element={<ProjetoDetalhe />} />}
        />

        {/* Gestão de Acessos — restrito (ex.: admin) */}
        <Route
          path="/Projetos/GestaoAcessos"
          element={
            <PrivateRoute
              element={<GestaoAcessos />}
              allowedSectors={[SECTORS.ADMIN]}
            />
          }
        />
      </Routes>
    </>
  );
};

export default App;
