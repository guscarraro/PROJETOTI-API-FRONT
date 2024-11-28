import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, allowedSectors }) => {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const validateUser = () => {
      const user = JSON.parse(localStorage.getItem('user')); // Pega dados do usuário armazenados no localStorage.

      if (!user) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      // Se o tipo for Admin, concede acesso irrestrito
      if (user.tipo === 'c1b389cb-7dee-4f91-9687-b1fad9acbf4c') {
        setIsAllowed(true);
        setLoading(false);
        return;
      }

      // Caso contrário, verifica se o setor está permitido
      if (allowedSectors.includes(user.setor)) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
      }
      setLoading(false);
    };

    validateUser();
  }, [allowedSectors]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAllowed) {
    return <Navigate to="/" />;
  }

  return element;
};

export default PrivateRoute;
