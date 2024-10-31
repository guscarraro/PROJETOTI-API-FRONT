// src/components/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PrivateRoute = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao buscar usuário:', error);
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return user ? element : <Navigate to="/" />;
};

export default PrivateRoute;
