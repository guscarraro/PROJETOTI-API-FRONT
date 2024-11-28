import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminNavbar from './components/AdminNavbar'; // Importa a Navbar do Admin
import Dashboard from './pages/Dashboard';
import CicloPedido from './pages/CicloPedido';
import ProjetoFrota from './pages/ProjetoFrota';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import OperacaoFechamento from './pages/OperacaoFechamento';

const App = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Pega o usuário logado
  console.log(user)
  return (
    <>
      {/* Renderiza a Navbar apenas para o Admin */}
      {user?.tipo === 'c1b389cb-7dee-4f91-9687-b1fad9acbf4c' && <AdminNavbar />}
      
      <Routes>
        <Route path="/" element={<Login />} />

        {/* SAC */}
        <Route
          path="/SAC"
          element={
            <PrivateRoute
              element={<Dashboard />}
              allowedSectors={['43350e26-12f4-4094-8cfb-2a66f250838d']} // UUID do SAC
            />
          }
        />

        {/* Operação */}
        <Route
          path="/Operacao"
          element={
            <PrivateRoute
              element={<OperacaoFechamento />}
              allowedSectors={['442ec24d-4c7d-4b7e-b1dd-8261c9376d0f']} // UUID do Operação
            />
          }
        />

        {/* Financeiro */}
        <Route
          path="/Financeiro"
          element={
            <PrivateRoute
              element={<Dashboard />}
              allowedSectors={['37edd156-ba95-4864-8247-642ff20d8587']} // UUID do Financeiro
            />
          }
        />

        {/* Frete */}
        <Route
          path="/Frete"
          element={
            <PrivateRoute
              element={<ProjetoFrota />}
              allowedSectors={['958db54e-add5-45f6-8aef-739d6ba7cb4c']} // UUID do Frete
            />
          }
        />
      </Routes>
    </>
  );
};

export default App;
