import React, { useEffect, useState } from "react";
import {  toast } from "react-toastify";
import Motorista from "./Motorista";
import Cliente from "./Cliente";
import TipoOcorren from "./TipoOcorren";
import LancarOcorren from "./LancarOcorren";
import OcorrenAbertas from "./OcorrenAbertas";
import RastreioMot from "./RastreioMot";
import Dashboard from "./Dashboard";
import Destino from "./Destino";
import { FaHouseFlag , FaArrowRight } from "react-icons/fa6";
import { ContainerGeralFrete, NavbarContainer, NavButton, NavIcon } from "./styles";
import { SiGooglemaps } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaTruck,
  FaUsers,
  FaFileAlt,
  FaPlusCircle,
} from "react-icons/fa";
import RastreioMotorista from "./RastreioMot";

const Navbar = ({ currentTab, setCurrentTab }) => {
    const navigate = useNavigate(); // Defina o hook dentro do componente Navbar
  
    return (
      <NavbarContainer>
        <NavButton
          active={currentTab === "dashboard"}
          onClick={() => setCurrentTab("dashboard")}
        >
          <NavIcon>
            <FaTachometerAlt />
          </NavIcon>
          Dashboard
        </NavButton>
        <NavButton
          active={currentTab === "ocorrencias"}
          onClick={() => setCurrentTab("ocorrencias")}
        >
          <NavIcon>
            <FaClipboardList />
          </NavIcon>
          Ocorrências em Aberto
        </NavButton>
        <NavButton
          active={currentTab === "novaOcorrencia"}
          onClick={() => setCurrentTab("novaOcorrencia")}
        >
          <NavIcon>
            <FaPlusCircle />
          </NavIcon>
          Lançar Nova Ocorrência
        </NavButton>
        <NavButton
          active={currentTab === "rastreio"}
          onClick={() => setCurrentTab("rastreio")}
        >
          <NavIcon>
            <SiGooglemaps />
          </NavIcon>
          Rastreio motorista
        </NavButton>
        <NavButton
          active={currentTab === "tiposOcorrencias"}
          onClick={() => setCurrentTab("tiposOcorrencias")}
        >
          <NavIcon>
            <FaFileAlt />
          </NavIcon>
          Tipos de Ocorrências
        </NavButton>
        <NavButton
          active={currentTab === "motoristas"}
          onClick={() => setCurrentTab("motoristas")}
        >
          <NavIcon>
            <FaTruck />
          </NavIcon>
          Motoristas
        </NavButton>
        <NavButton
          active={currentTab === "clientes"}
          onClick={() => setCurrentTab("clientes")}
        >
          <NavIcon>
            <FaUsers />
          </NavIcon>
          Clientes
        </NavButton>
        <NavButton
          active={currentTab === "destino"}
          onClick={() => setCurrentTab("destino")}
        >
          <NavIcon>
            <FaHouseFlag />
          </NavIcon>
          Destinatário
        </NavButton>
        {/* Novo botão para navegação ao SAC */}
        <NavButton onClick={() => navigate("/SAC")}>
          <NavIcon>
            <FaArrowRight />
          </NavIcon>
          Ir para SAC
        </NavButton>
      </NavbarContainer>
    );
  };
  

const Frete = () => {
  const [currentTab, setCurrentTab] = useState("ocorrencias");
  const [updateFlag, setUpdateFlag] = useState(false); // Flag para atualização
  const [successMessage, setSuccessMessage] = useState(null); // Mensagem de sucesso
  const navigate = useNavigate();
  const handleActionComplete = (message) => {
    setUpdateFlag(!updateFlag); // Alterna a flag para forçar re-renderizações
    setSuccessMessage(message); // Atualiza mensagem de sucesso
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setSuccessMessage(null); // Reseta mensagem após o toast
    }
  }, [successMessage]);

  return (
    <ContainerGeralFrete>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div style={{ width: "100%", height: "auto", display:'flex',flexDirection:'column', alignItems:'center', justifyContent:'flex-start' }}>
        {currentTab === "dashboard" && <Dashboard />}
        {currentTab === "ocorrencias" && <OcorrenAbertas />}
        {currentTab === "novaOcorrencia" && (
          <LancarOcorren onActionComplete={(message) => handleActionComplete(message)} />
        )}
        {currentTab === "rastreio" && <RastreioMotorista />}
        {currentTab === "tiposOcorrencias" && <TipoOcorren />}
        {currentTab === "motoristas" && <Motorista />}
        {currentTab === "clientes" && <Cliente />}
        {currentTab === "destino" && <Destino />}
      </div>
    </ContainerGeralFrete>
  );
};

export default Frete;
