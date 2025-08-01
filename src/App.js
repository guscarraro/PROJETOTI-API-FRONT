import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminNavbar from './components/AdminNavbar'; // Importa a Navbar do Admin
import Dashboard from './pages/Dashboard';
import CicloPedido from './pages/CicloPedido';
import ProjetoFrota from './pages/ProjetoFrota';
import Cotacao from './pages/Cotacao';
import Fiscal from './pages/Fiscal';
import Frete from './pages/Frete';
import CargaLucrativa from './pages/CargaLucrativa';

import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import OperacaoFechamento from './pages/OperacaoFechamento';
import EstoqueTi from './pages/EstoqueTi';

const App = () => {
  const user = JSON.parse(localStorage.getItem('user'));
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
        allowedSectors={[
          '43350e26-12f4-4094-8cfb-2a66f250838d', // UUID do setor SAC
          '958db54e-add5-45f6-8aef-739d6ba7cb4c',
          '2c17e352-ffcd-4c7b-a771-1964aaee1f79',
          '442ec24d-4c7d-4b7e-b1dd-8261c9376d0f',
          'b1122334-56ab-78cd-90ef-123456789abc',
          '123e4567-e89b-12d3-a456-426614174000' 
        ]}
      />
    }
  />

  {/* Frete */}
  <Route
    path="/Frete"
    element={
      <PrivateRoute
        element={<Frete />}
        allowedSectors={[
          '958db54e-add5-45f6-8aef-739d6ba7cb4c', // UUID do setor Frete
          '43350e26-12f4-4094-8cfb-2a66f250838d',
          '2c17e352-ffcd-4c7b-a771-1964aaee1f79', 
          '123e4567-e89b-12d3-a456-426614174000'
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
        '958db54e-add5-45f6-8aef-739d6ba7cb4c',
        '43350e26-12f4-4094-8cfb-2a66f250838d',
        '7a84e2cb-cb4c-4705-b676-9f0a0db5469a',
        '9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4',
        '2c17e352-ffcd-4c7b-a771-1964aaee1f79',
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
        '958db54e-add5-45f6-8aef-739d6ba7cb4c',
        '43350e26-12f4-4094-8cfb-2a66f250838d',
        '7a84e2cb-cb4c-4705-b676-9f0a0db5469a',
        '9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4',
        '2c17e352-ffcd-4c7b-a771-1964aaee1f79',
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
        '958db54e-add5-45f6-8aef-739d6ba7cb4c',
        '43350e26-12f4-4094-8cfb-2a66f250838d',
        '7a84e2cb-cb4c-4705-b676-9f0a0db5469a',
        '9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4',
        '2c17e352-ffcd-4c7b-a771-1964aaee1f79',
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
        '958db54e-add5-45f6-8aef-739d6ba7cb4c',
        '43350e26-12f4-4094-8cfb-2a66f250838d',
        '7a84e2cb-cb4c-4705-b676-9f0a0db5469a',
        '9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4',
        '2c17e352-ffcd-4c7b-a771-1964aaee1f79',
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
        '958db54e-add5-45f6-8aef-739d6ba7cb4c',
        '43350e26-12f4-4094-8cfb-2a66f250838d',
        '7a84e2cb-cb4c-4705-b676-9f0a0db5469a',
        '9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4',
        '2c17e352-ffcd-4c7b-a771-1964aaee1f79',
      ]}
    />
  }
/>




  {/* Outras rotas */}
  <Route
    path="/CicloPedido"
    element={
      <PrivateRoute
        element={<CicloPedido />}
        allowedSectors={['c1b389cb-7dee-4f91-9687-b1fad9acbf4c']}
      />
    }
  />
  <Route
    path="/Operacao"
    element={
      <PrivateRoute
        element={<OperacaoFechamento />}
        allowedSectors={['442ec24d-4c7d-4b7e-b1dd-8261c9376d0f']}
      />
    }
  />
  <Route
    path="/Financeiro"
    element={
      <PrivateRoute
        element={<Fiscal />}
        allowedSectors={['37edd156-ba95-4864-8247-642ff20d8587']}
      />
    }
  />
 
  <Route
    path="/ProjetoFrota"
    element={
      <PrivateRoute
        element={<ProjetoFrota />}
        allowedSectors={['c1b389cb-7dee-4f91-9687-b1fad9acbf4c']}
      />
    }
  />
  <Route
    path="/Cotacao"
    element={
      <PrivateRoute
        element={<Cotacao />}
        allowedSectors={['c1b389cb-7dee-4f91-9687-b1fad9acbf4c']}
      />
    }
  />
  <Route
    path="/ti"
    element={
      <PrivateRoute
        element={<EstoqueTi />}
        allowedSectors={[
          'c1b389cb-7dee-4f91-9687-b1fad9acbf4c',
          'd2c5a1b8-4f23-4f93-b1e5-3d9f9b8a9a3f',
        ]}
      />
    }
  />
</Routes>

    </>
  );
};

export default App;
