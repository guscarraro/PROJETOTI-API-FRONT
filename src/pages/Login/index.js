// Login.js
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Form, Container, Row, Col } from 'reactstrap';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import IconInput from '../../components/IconInput';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error('Usuário ou senha inválidos!');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Container fluid className="ContainerPagina d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col md={{ size: 4, offset: 4 }} className="text-center">
          <Form onSubmit={handleLogin} className="form-container p-4 rounded">
        
            <FaUser fontSize={50}/>
            <h4>Login</h4>
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
            <Button color="success" type="submit" className="w-50 mt-3 login-btn">Entrar</Button>
          </Form>
        </Col>
      </Row>
      <ToastContainer />
    </Container>
  );
}

export default Login;
