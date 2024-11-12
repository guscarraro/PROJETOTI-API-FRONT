// src/components/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('supabase.auth.token'); 
      setIsAuthenticated(!!token); 
      setLoading(false); 
    };

    checkAuthentication();
  }, []);

  if (loading) {
    return <div>Carregando...</div>; 
  }


  return isAuthenticated ? element : <Navigate to="/" />;
};

export default PrivateRoute;
