// src/pages/Login.js
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Form, Container, Row, Col } from 'reactstrap';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import LogoCarraro from '../../images/logologin.png';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import IconInput from '../../components/IconInput';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      // Consulta o banco de dados Supabase para buscar o usuário pelo email
      const { data: user, error } = await supabase
        .from('usuarios') // Nome da tabela
        .select('*')
        .eq('email', email)
        .single();
  
      if (error || !user) {
        throw new Error('Usuário ou senha inválidos!');
      }
  
      // Verificar se a senha informada corresponde ao hash armazenado
      const bcrypt = await import('bcryptjs'); // Biblioteca para verificar hash
      const isPasswordValid = await bcrypt.compare(password, user.senha);
  
      if (!isPasswordValid) {
        throw new Error('Usuário ou senha inválidos!');
      }
  
      // Armazena os dados do usuário no localStorage
      localStorage.setItem('user', JSON.stringify({ setor: user.setor, tipo: user.tipo }));
  
      toast.success('Login realizado com sucesso!');
      navigate('/SAC'); // Redireciona para o dashboard
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer login');
    }
  };
  
  

  return (
    <Container fluid className="ContainerPagina d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col md={{ size: 4, offset: 4 }} className="text-center">
          <Form onSubmit={handleLogin} className="form-container p-4 rounded">
            <img src={LogoCarraro} style={{ width: 100 }} alt="Logo Carraro" />
            <h4>Login Dashboard</h4>
            <IconInput
              icon={FaEnvelope}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <IconInput
              icon={FaLock}
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button color="success" type="submit" className="w-50 mt-3 login-btn">
              Entrar
            </Button>
          </Form>
        </Col>
      </Row>
      <ToastContainer />
    </Container>
  );
}

export default Login;
