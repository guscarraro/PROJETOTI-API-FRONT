import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaTruck,
  FaUsers,
  FaFileAlt,
  FaPlusCircle,
  FaCaretDown,
} from "react-icons/fa";
import { FaHouseFlag, FaArrowRight } from "react-icons/fa6";
import { SiGooglemaps } from "react-icons/si";
import {
  NavbarContainer,
  NavButton,
  NavIcon,
  Dropdown,
  DropdownItem,
  ContainerGeralFrete,
} from "./styles"; // Estilos atualizados
import Dashboard from "./Dashboard";
import OcorrenAbertas from "./OcorrenAbertas";
import LancarOcorren from "./LancarOcorren";
import RastreioMotorista from "./RastreioMot";
import TipoOcorren from "./TipoOcorren";
import Motorista from "./Motorista";
import Cliente from "./Cliente";
import Destino from "./Destino";
import LancarFalta from "./LancarFalta";
import LancarSTH from "./LancarSTH";
import TodasOcorrencias from "./TodasOcorrencias";
import TodasOcorrenciasFalta from "./TodasOcorrenciasFalta";
import TodasOcorrenciasSTH from "./TodasOcorrenciasSTH";
import DashboardFalta from "./DashboardFaltas";

const Navbar = ({ currentTab, setCurrentTab }) => {
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [selectedOption, setSelectedOption] = useState({
    dashboard: "Dashboard",
    novaOcorrencia: "Lançar Nova Ocorrência",
    cadastros: "Cadastros",
    relatorios: "Relatórios",
  });
  const navigate = useNavigate();

  const toggleDropdown = (menu) => {
    setDropdownVisible(dropdownVisible === menu ? null : menu);
  };

  const handleSelection = (menu, option, tab) => {
    setSelectedOption((prev) => ({ ...prev, [menu]: option }));
    setCurrentTab(tab);
    setDropdownVisible(null);
  };

  const isActive = (tab) => currentTab === tab;

  return (
    <NavbarContainer>
      {/* Dashboard com Dropdown */}
      <NavButton
        onClick={() => toggleDropdown("dashboard")}
        className={isActive("dashboard") || isActive("dashboardFaltas") || isActive("dashboardSTH") ? "active" : ""}
      >
        <NavIcon>
          <FaTachometerAlt />
        </NavIcon>
        {selectedOption.dashboard} <FaCaretDown />
        {dropdownVisible === "dashboard" && (
          <Dropdown>
            <DropdownItem
              onClick={() => handleSelection("dashboard", "Dashboard Ocorrência", "dashboard")}
            >
              Dashboard Ocorrência
            </DropdownItem>
            <DropdownItem
              onClick={() => handleSelection("dashboard", "Dashboard Faltas", "dashboardFaltas")}
            >
              Dashboard Faltas
            </DropdownItem>
            <DropdownItem
              onClick={() => handleSelection("dashboard", "Dashboard STH", "dashboardSTH")}
            >
              Dashboard STH
            </DropdownItem>
          </Dropdown>
        )}
      </NavButton>

      {/* Lançar Nova Ocorrência com Dropdown */}
      <NavButton
        onClick={() => toggleDropdown("novaOcorrencia")}
        className={isActive("novaOcorrencia") || isActive("ocorrenciaFalta") || isActive("ocorrenciaSTH") ? "active" : ""}
      >
        <NavIcon>
          <FaPlusCircle />
        </NavIcon>
        {selectedOption.novaOcorrencia} <FaCaretDown />
        {dropdownVisible === "novaOcorrencia" && (
          <Dropdown>
            <DropdownItem
              onClick={() => handleSelection("novaOcorrencia", "Lançar Nova Ocorrência", "novaOcorrencia")}
            >
              Lançar Nova Ocorrência
            </DropdownItem>
            <DropdownItem
              onClick={() => handleSelection("novaOcorrencia", "Lançar Falta", "ocorrenciaFalta")}
            >
              Lançar Falta
            </DropdownItem>
            <DropdownItem
              onClick={() => handleSelection("novaOcorrencia", "Lançar STH", "ocorrenciaSTH")}
            >
              Lançar STH
            </DropdownItem>
          </Dropdown>
        )}
      </NavButton>

      {/* Ocorrências em Aberto */}
      <NavButton
        onClick={() => setCurrentTab("ocorrencias")}
        className={isActive("ocorrencias") ? "active" : ""}
      >
        <NavIcon>
          <FaClipboardList />
        </NavIcon>
        Ocorrências em Aberto
      </NavButton>

      {/* Rastreamento de Motorista */}
      {/* <NavButton
        onClick={() => setCurrentTab("rastreio")}
        className={isActive("rastreio") ? "active" : ""}
      >
        <NavIcon>
          <SiGooglemaps />
        </NavIcon>
        Rastreio motorista
      </NavButton> */}

      {/* Menu Cadastros */}
      <NavButton
        onClick={() => toggleDropdown("cadastros")}
        className={
          isActive("tiposOcorrencias") ||
          isActive("motoristas") ||
          isActive("clientes") ||
          isActive("destino")
            ? "active"
            : ""
        }
      >
        <NavIcon>
          <FaClipboardList />
        </NavIcon>
        {selectedOption.cadastros} <FaCaretDown />
        {dropdownVisible === "cadastros" && (
          <Dropdown>
            <DropdownItem
              onClick={() => handleSelection("cadastros", "Tipo de Ocorrência", "tiposOcorrencias")}
            >
              Tipo de Ocorrência
            </DropdownItem>
            <DropdownItem
              onClick={() => handleSelection("cadastros", "Motoristas", "motoristas")}
            >
              Motoristas
            </DropdownItem>
            <DropdownItem
              onClick={() => handleSelection("cadastros", "Clientes", "clientes")}
            >
              Clientes
            </DropdownItem>
            <DropdownItem
              onClick={() => handleSelection("cadastros", "Destinatários", "destino")}
            >
              Destinatários
            </DropdownItem>
          </Dropdown>
        )}
      </NavButton>

      {/* Menu Relatórios */}
      <NavButton
        onClick={() => toggleDropdown("relatorios")}
        className={
          isActive("todasOcorrencias") ||
          isActive("todasOcorrenciaFalta") ||
          isActive("todasOcorrenciaSTH")
            ? "active"
            : ""
        }
      >
        <NavIcon>
          <FaFileAlt />
        </NavIcon>
        {selectedOption.relatorios} <FaCaretDown />
        {dropdownVisible === "relatorios" && (
          <Dropdown>
            <DropdownItem
              onClick={() => handleSelection("relatorios", "Todas as Ocorrências", "todasOcorrencias")}
            >
              Todas as Ocorrências
            </DropdownItem>
            <DropdownItem
              onClick={() => handleSelection("relatorios", "Faltas", "todasOcorrenciaFalta")}
            >
              Todas as Faltas
            </DropdownItem>
            <DropdownItem
              onClick={() => handleSelection("relatorios", "STH", "todasOcorrenciaSTH")}
            >
              Todos os STH
            </DropdownItem>
          </Dropdown>
        )}
      </NavButton>

      {/* SAC Navigation */}
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
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setSuccessMessage(null);
    }
  }, [successMessage]);

  return (
    <ContainerGeralFrete>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div style={{ width: "100%", height: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
        {currentTab === "dashboard" && <Dashboard />}
        {currentTab === "dashboardFaltas" && <DashboardFalta />}
        {currentTab === "dashboardSTH" && <div>Layout em desenvolvimento...</div>}
        {currentTab === "ocorrencias" && <OcorrenAbertas />}
        {currentTab === "novaOcorrencia" && <LancarOcorren onActionComplete={setSuccessMessage} />}
        {currentTab === "ocorrenciaFalta" && <LancarFalta />}
        {currentTab === "ocorrenciaSTH" && <LancarSTH />}
        {currentTab === "rastreio" && <RastreioMotorista />}
        {currentTab === "tiposOcorrencias" && <TipoOcorren />}
        {currentTab === "todasOcorrencias" && <TodasOcorrencias />}
        {currentTab === "todasOcorrenciaFalta" && <TodasOcorrenciasFalta />}
        {currentTab === "todasOcorrenciaSTH" && <TodasOcorrenciasSTH />}
        {currentTab === "motoristas" && <Motorista />}
        {currentTab === "clientes" && <Cliente />}
        {currentTab === "destino" && <Destino />}
      </div>
    </ContainerGeralFrete>
  );
};

export default Frete;
