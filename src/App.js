// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import ProjetoFrota from './pages/ProjetoFrota';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={<PrivateRoute element={<Dashboard />} />} 
      />
      <Route 
        path="/projetoFrota" 
        element={<PrivateRoute element={<ProjetoFrota />} />} 
      />
    </Routes>
  );
};

export default App;
