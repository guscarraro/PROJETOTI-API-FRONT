// src/pages/Login.js
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
      localStorage.setItem(
        'user',
        JSON.stringify({ setor: user.setor, tipo: user.tipo })
      );
  
      // Define o redirecionamento com base no setor ou tipo do usuário
      const redirectPath = (() => {
        if (user.setor === '43350e26-12f4-4094-8cfb-2a66f250838d') {
          return '/SAC'; // SAC
        }
        if (user.setor === 'b1122334-56ab-78cd-90ef-123456789abc') {
          return '/SAC'; // SAC
        }
        if (user.setor === '442ec24d-4c7d-4b7e-b1dd-8261c9376d0f') {
          return '/Operacao'; // Operação
        }
        if (user.setor === '37edd156-ba95-4864-8247-642ff20d8587') {
          return '/Financeiro'; // Financeiro
        }
        if (user.setor === '123e4567-e89b-12d3-a456-426614174000') {
          return '/Frete'; // Frete
        }
        if (user.setor === '958db54e-add5-45f6-8aef-739d6ba7cb4c') {
          return '/Frete'; // Frete
        }
        if (user.setor === '2c17e352-ffcd-4c7b-a771-1964aaee1f79') {
          return '/Frete'; // Frete
        }
        if (user.setor === 'd2c5a1b8-4f23-4f93-b1e5-3d9f9b8a9a3f') {
          return '/ti'; // Frete
        }
        if (user.setor === '7a84e2cb-cb4c-4705-b676-9f0a0db5469a') {
          return '/Frete/CargaLucrativa'; // Frete
        }
        if (user.setor === '9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4') {
          return '/Frete/CargaLucrativa'; // Frete
        }
        // Para outros setores ou Admin (tipo de usuário)
        if (user.tipo === 'c1b389cb-7dee-4f91-9687-b1fad9acbf4c') {
          return '/SAC'; // Admin ou dashboard padrão
        }
        return '/'; // Redireciona para login se nenhum setor/tipo for identificado
      })();
  
      toast.success('Login realizado com sucesso!');
      navigate(redirectPath); // Redireciona dinamicamente
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
    </Container>
  );
}

export default Login;
