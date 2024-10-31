import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import "./style.css";
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erro de login:', error.message);
      toast.error('Usuário ou senha inválidos!'); 
    } else {
      const { user } = await supabase.auth.getUser(); 
      console.log('Usuário logado:', user);
      navigate('/dashboard');
    }
  };

  return (
    <div className='ContainerPagina'>
      <form onSubmit={handleLogin}>
      <h1>Login</h1>
      <div className='boxInput'>

      <label>Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          />
        </div>
        <div className='boxInput'>
        <label>Senha</label>
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          />
          </div>
        <button type="submit">Entrar</button>
      </form>
      <ToastContainer /> 
    </div>
  );
}

export default Login;
