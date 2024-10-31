// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={<PrivateRoute element={<Dashboard />} />} 
      />
      {/* Adicione outras rotas aqui, se necessário */}
    </Routes>
  );
};

export default App;
