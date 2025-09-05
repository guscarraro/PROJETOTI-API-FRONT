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
import DashboardSTH from "./DashboardSTH";
import DashboardBaixas from "./DashboardBaixas";
import GrupoEco from "./GrupoEco";
import Responsavel from "./Responsavel";
import LancarPaletizacao from "./LancarPaletizacao";
import LancarArmazenagem from "./LancarArmazenagem";
import TodasPaletizacoes from "./TodasPaletizacoes";
import TodasArmazenagens from "./TodasArmazenagens";

const Navbar = ({
  currentTab,
  setCurrentTab,
  podeLancarPaletizacao,
  isOperador,
}) => {
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
      {!isOperador && (
        <NavButton
          onClick={() => toggleDropdown("dashboard")}
          className={
            isActive("dashboard") ||
            isActive("dashboardFaltas") ||
            isActive("dashboardSTH")
              ? "active"
              : ""
          }
        >
          <NavIcon>
            <FaTachometerAlt />
          </NavIcon>
          {selectedOption.dashboard} <FaCaretDown />
          {dropdownVisible === "dashboard" && (
            <Dropdown>
              <DropdownItem
                onClick={() =>
                  handleSelection("dashboard", "Dashboard Ocorrência", "dashboard")
                }
              >
                Dashboard Ocorrência
              </DropdownItem>
              <DropdownItem
                onClick={() =>
                  handleSelection("dashboard", "Dashboard Faltas", "dashboardFaltas")
                }
              >
                Dashboard Faltas
              </DropdownItem>
              <DropdownItem
                onClick={() =>
                  handleSelection("dashboard", "Dashboard STH", "dashboardSTH")
                }
              >
                Dashboard STH
              </DropdownItem>
              <DropdownItem
                onClick={() =>
                  handleSelection("dashboard", "Dashboard Baixas", "dashboardBaixas")
                }
              >
                Dashboard Baixas
              </DropdownItem>
            </Dropdown>
          )}
        </NavButton>
      )}

      <NavButton
        onClick={() => toggleDropdown("novaOcorrencia")}
        className={
          isActive("novaOcorrencia") ||
          isActive("ocorrenciaFalta") ||
          isActive("ocorrenciaSTH")
            ? "active"
            : ""
        }
      >
        <NavIcon>
          <FaPlusCircle />
        </NavIcon>
        {selectedOption.novaOcorrencia} <FaCaretDown />
        {dropdownVisible === "novaOcorrencia" && (
          <Dropdown>
            {!isOperador && (
              <DropdownItem
                onClick={() =>
                  handleSelection("novaOcorrencia", "Lançar Nova Ocorrência", "novaOcorrencia")
                }
              >
                Lançar Nova Ocorrência
              </DropdownItem>
            )}
            {!isOperador && (
              <DropdownItem
                onClick={() =>
                  handleSelection("novaOcorrencia", "Lançar Falta", "ocorrenciaFalta")
                }
              >
                Lançar Falta
              </DropdownItem>
            )}
            {!isOperador && (
              <DropdownItem
                onClick={() =>
                  handleSelection("novaOcorrencia", "Lançar STH", "ocorrenciaSTH")
                }
              >
                Lançar STH
              </DropdownItem>
            )}
            {(podeLancarPaletizacao || !isOperador) && (
              <DropdownItem
                onClick={() =>
                  handleSelection("novaOcorrencia", "Lançar Paletizacao", "Paletizacao")
                }
              >
                Lançar Paletizacao
              </DropdownItem>
            )}
             <DropdownItem
                onClick={() =>
                  handleSelection("novaOcorrencia", "Lançar Armazenagem", "Armazenagem")
                }
              >
                Lançar Armazenagem
              </DropdownItem>
          </Dropdown>
        )}
      </NavButton>

      {!isOperador && (
        <NavButton
          onClick={() => setCurrentTab("ocorrencias")}
          className={isActive("ocorrencias") ? "active" : ""}
        >
          <NavIcon>
            <FaClipboardList />
          </NavIcon>
          Ocorrências em Aberto
        </NavButton>
      )}

      {(isOperador || !isOperador) && (
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
        {!isOperador && (
          <>
            <DropdownItem
              onClick={() =>
                handleSelection("cadastros", "Tipo de Ocorrência", "tiposOcorrencias")
              }
            >
              Tipo de Ocorrência
            </DropdownItem>
            <DropdownItem
              onClick={() =>
                handleSelection("cadastros", "Motoristas", "motoristas")
              }
            >
              Motoristas
            </DropdownItem>
           
            <DropdownItem
              onClick={() =>
                handleSelection("cadastros", "Grupo Econômico", "grupoEco")
              }
            >
              Grupo Econômico
            </DropdownItem>
            <DropdownItem
              onClick={() =>
                handleSelection("cadastros", "Responsáveis", "responsavel")
              }
            >
              Responsáveis
            </DropdownItem>
          </>
        )}

        {/* Cliente disponível para todos, inclusive operador */}
        <DropdownItem
          onClick={() =>
            handleSelection("cadastros", "Clientes", "clientes")
          }
        >
          Clientes
        </DropdownItem>
         <DropdownItem
              onClick={() =>
                handleSelection("cadastros", "Destinatários", "destino")
              }
            >
              Destinatários
            </DropdownItem>
      </Dropdown>
    )}
  </NavButton>
)}


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
            {!isOperador && (
              <DropdownItem
                onClick={() =>
                  handleSelection("relatorios", "Todas as Ocorrências", "todasOcorrencias")
                }
              >
                Todas as Ocorrências
              </DropdownItem>
            )}
            {!isOperador && (
              <DropdownItem
                onClick={() =>
                  handleSelection("relatorios", "Faltas", "todasOcorrenciaFalta")
                }
              >
                Todas as Faltas
              </DropdownItem>
            )}
            
              <DropdownItem
                onClick={() =>
                  handleSelection("relatorios", "STH", "todasOcorrenciaSTH")
                }
              >
                Todos os STH
              </DropdownItem>
            
            {(podeLancarPaletizacao || !isOperador) && (
              <DropdownItem
                onClick={() =>
                  handleSelection("relatorios", "Paletizacoes", "todasPaletizacoes")
                }
              >
                Todas as paletizacoes
              </DropdownItem>
            )}
            <DropdownItem
                onClick={() =>
                  handleSelection("relatorios", "Armazenagens", "todasArmazenagens")
                }
              >
                Todas as Armazenagens
              </DropdownItem>
          </Dropdown>
        )}
      </NavButton>
 {!isOperador && (
      <NavButton onClick={() => navigate("/gerar-viagem")}>
        <NavIcon>
          <FaTruck />
        </NavIcon>
        Ir para Carga Lucrativa
      </NavButton>
)
};
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

  const user = JSON.parse(localStorage.getItem("user"));
  const tipo = user?.tipo;
  const isOperador = tipo === "Operacao";

  const podeLancarPaletizacao = isOperador;

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setSuccessMessage(null);
    }
  }, [successMessage]);

  return (
    <ContainerGeralFrete>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        podeLancarPaletizacao={podeLancarPaletizacao}
        isOperador={isOperador}
      />
      <div
        style={{
          width: "100%",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {!isOperador && currentTab === "dashboard" && <Dashboard />}
        {currentTab === "dashboardFaltas" && <DashboardFalta />}
        {currentTab === "dashboardSTH" && <DashboardSTH />}
        {currentTab === "dashboardBaixas" && <DashboardBaixas />}
        {!isOperador && currentTab === "ocorrencias" && <OcorrenAbertas />}
        {currentTab === "novaOcorrencia" && (
          <LancarOcorren onActionComplete={setSuccessMessage} />
        )}
        {currentTab === "ocorrenciaFalta" && <LancarFalta />}
        {currentTab === "ocorrenciaSTH" && <LancarSTH />}
        {currentTab === "Paletizacao" && <LancarPaletizacao />}
        {currentTab === "Armazenagem" && <LancarArmazenagem />}

        {currentTab === "todasPaletizacoes" && <TodasPaletizacoes />}
        {currentTab === "todasArmazenagens" && <TodasArmazenagens />}
        {currentTab === "rastreio" && <RastreioMotorista />}
        {currentTab === "tiposOcorrencias" && <TipoOcorren />}
        {!isOperador && currentTab === "todasOcorrencias" && (
          <TodasOcorrencias />
        )}
        {currentTab === "todasOcorrenciaFalta" && <TodasOcorrenciasFalta />}
        {currentTab === "todasOcorrenciaSTH" && <TodasOcorrenciasSTH />}
        {currentTab === "motoristas" && <Motorista />}
        {currentTab === "clientes" && <Cliente />}
        {currentTab === "destino" && <Destino />}
        {currentTab === "grupoEco" && <GrupoEco />}
        {currentTab === "responsavel" && <Responsavel />}
      </div>
    </ContainerGeralFrete>
  );
};


export default Frete;
