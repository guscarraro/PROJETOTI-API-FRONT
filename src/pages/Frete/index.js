import React, { useEffect, useState } from "react";
import apiLocal from "../../services/apiLocal";
import Motorista from "./Motorista";
import Cliente from "./Cliente";
import TipoOcorren from "./TipoOcorren";
import LancarOcorren from "./LancarOcorren";
import OcorrenAbertas from "./OcorrenAbertas";
import Dashboard from "./Dashboard";
import { ContainerGeralFrete, NavbarContainer, NavButton, NavIcon } from "./styles";
import { ToastContainer } from "react-toastify";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaTruck,
  FaUsers,
  FaFileAlt,
  FaPlusCircle,
} from "react-icons/fa";

const Navbar = ({ currentTab, setCurrentTab }) => {
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
      
      
    </NavbarContainer>
  );
};

const Frete = () => {
  const [currentTab, setCurrentTab] = useState("ocorrencias");
  const [updateFlag, setUpdateFlag] = useState(false); // Flag para atualização

  const handleActionComplete = () => {
    setUpdateFlag(!updateFlag); // Alterna a flag para forçar re-renderizações
  };

  return (
    <ContainerGeralFrete>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div style={{ width: "100%", height: "auto" }}>
        {currentTab === "dashboard" && <Dashboard />}
        {currentTab === "ocorrencias" && <OcorrenAbertas />}
        {currentTab === "novaOcorrencia" && (
          <LancarOcorren onActionComplete={handleActionComplete} />
        )}
        {currentTab === "tiposOcorrencias" && <TipoOcorren />}
        {currentTab === "motoristas" && <Motorista />}
        {currentTab === "clientes" && <Cliente />}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </ContainerGeralFrete>
  );
};


export default Frete;
