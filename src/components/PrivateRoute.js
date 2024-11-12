// src/components/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('supabase.auth.token'); // Verifica se o token existe no localStorage
      setIsAuthenticated(!!token); // Define autenticação com base no token
      setLoading(false); // Define carregamento como concluído
    };

    checkAuthentication();
  }, []);

  if (loading) {
    return <div>Carregando...</div>; // Exibe enquanto verifica autenticação
  }

  // Redireciona para login caso não autenticado
  return isAuthenticated ? element : <Navigate to="/" />;
};

export default PrivateRoute;
