// src/pages/Login/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import {
  LoginWrap,
  GridFx,
  Particles,
  Bubble,
  GlassCard,
  AccentBar,
  BrandRow,
  BrandLogo,
  Heading,
  Sub,
  StyledForm,
  Field,
  IconBox,
  TextInput,
  Submit,
  HintRow,
} from "./style";
import LogoCarraro from "../../images/logologin.png";
import apiLocal from "../../services/apiLocal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // respeita tema salvo
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const root = document.documentElement;
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Informe e-mail e senha.");
      return;
    }
    setBusy(true);
    try {
      // 1) cria sessão + cookie HttpOnly
      const { data } = await apiLocal.authLogin(email, password);
      // 2) opcional: confirma estado “oficial” via /auth/me (garante cookie aplicado)
      try {
        const me = await apiLocal.authMe();
        if (me?.data) {
          localStorage.setItem("user", JSON.stringify(me.data));
        } else if (data?.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch {
        if (data?.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }
      toast.success("Login realizado com sucesso!");

      // 🔹 Se for cliente Fersa (id 23 ou setor Fersa_Cliente), vai pra /conferencia
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (
        userData?.setor_ids == 23 ||
        userData?.setores?.some?.((s) => s.toLowerCase() === "fersa_cliente")
      ) {
        navigate("/conferencia");
      } else {
        navigate("/Projetos");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || "Erro ao fazer login";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <LoginWrap>
      <GridFx />
      <Particles>
        <Bubble
          style={{
            width: 120,
            height: 120,
            left: "8%",
            top: "12%",
            "--dur": "9s",
          }}
        />
        <Bubble
          style={{
            width: 90,
            height: 90,
            left: "18%",
            bottom: "10%",
            "--dur": "11s",
          }}
          blur
        />
        <Bubble
          style={{
            width: 140,
            height: 140,
            right: "14%",
            top: "16%",
            "--dur": "10s",
          }}
        />
        <Bubble
          style={{
            width: 110,
            height: 110,
            right: "10%",
            bottom: "14%",
            "--dur": "12s",
          }}
          blur
        />
        <Bubble
          style={{
            width: 70,
            height: 70,
            left: "45%",
            top: "8%",
            "--dur": "8.5s",
          }}
        />
      </Particles>

      <GlassCard>
        <AccentBar />
        <BrandRow>
          <BrandLogo src={LogoCarraro} alt="Carraro" />
          <Heading>Bem-vindo</Heading>
        </BrandRow>
        <Sub>Acesse sua área de gestão e organização.</Sub>

        <StyledForm onSubmit={handleLogin}>
          <Field>
            <IconBox>
              <FaEnvelope />
            </IconBox>
            <TextInput
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              autoComplete="email"
            />
          </Field>

          <Field>
            <IconBox>
              <FaLock />
            </IconBox>
            <TextInput
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>

          <Submit type="submit" disabled={busy}>
            {busy ? "Entrando..." : "Entrar"}
            <FaArrowRight />
          </Submit>

          <HintRow>
            <span style={{ opacity: 0.8 }}>Problemas para entrar?</span>
            <span style={{ opacity: 0.6 }}>Fale com o administrador</span>
          </HintRow>
        </StyledForm>
      </GlassCard>
    </LoginWrap>
  );
}
