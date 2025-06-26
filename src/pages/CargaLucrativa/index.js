import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowRight, FaCaretDown } from "react-icons/fa6";
import {
  NavbarContainer,
  NavButton,
  NavIcon,
  Dropdown,
  DropdownItem,
  ContainerGeralCargaLucrativa,
} from "./style"; // Estilos atualizados
import RelatorioViagens from "./RelatorioViagens";
import GerarViagem from "./GerarViagem";
import Dashboard from "./Dashboard";
import CustosTabela from "./CustosTabela";
import LancarColeta from "./LancarColeta";
import RelatorioColetas from "./RelatorioColetas";

// ✅ NAVBAR
const Navbar = ({ currentTab, setCurrentTab, setNumeroViagem }) => {
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Relatórios");

  const user = JSON.parse(localStorage.getItem("user"));
  const setor = user?.setor;

  const isRestrictedUser =
    setor === "7a84e2cb-cb4c-4705-b676-9f0a0db5469a" ||
    setor === "9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4";

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSelection = (option, tab) => {
  if (!tab.includes("relatorio")) {
    setSelectedOption(option);
  }

  setCurrentTab(tab);
  setNumeroViagem(null);
  setDropdownVisible(false);

  // Atualiza a URL de forma clara
  switch (tab) {
    case "gerarViagem":
      navigate("/gerar-viagem");
      break;
    case "dashboard":
      navigate("/gerar-viagem/dashboard");
      break;
    case "custosTabela":
      navigate("/gerar-viagem/custos");
      break;
    case "relatorioViagem":
      navigate("/gerar-viagem/relatorio");
      break;
    default:
      navigate("/gerar-viagem");
  }
};


  return (
    <NavbarContainer>
      {!isRestrictedUser && (
        <NavButton
          className={currentTab === "dashboard" ? "active" : ""}
          onClick={() => handleSelection("Dashboard", "dashboard")}
        >
          Dashboard Viagens
        </NavButton>
      )}

      <NavButton
        className={currentTab === "gerarViagem" ? "active" : ""}
        onClick={() => handleSelection("Gerar Viagem", "gerarViagem")}
      >
        Gerar Viagem
      </NavButton>

      {!isRestrictedUser && (
        <NavButton
          className={currentTab === "custosTabela" ? "active" : ""}
          onClick={() => handleSelection("Tabela de Custos", "custosTabela")}
        >
          Tabela de custos
        </NavButton>
      )}

      {/* Dropdown de Relatórios */}
      <NavButton
        onClick={toggleDropdown}
        className={currentTab.includes("relatorio") ? "active" : ""}
      >
        Relatórios <FaCaretDown />
        {dropdownVisible && (
          <Dropdown>
            <DropdownItem
              onClick={() =>
                handleSelection("Relatório de Viagens", "relatorioViagem")
              }
            >
              Relatório de Viagens
            </DropdownItem>
          </Dropdown>
        )}
      </NavButton>

      {!isRestrictedUser && (
        <NavButton onClick={() => navigate("/Frete")}>
          <NavIcon>
            <FaArrowRight />
          </NavIcon>
          Ir para Ocorrências
        </NavButton>
      )}
    </NavbarContainer>
  );
};

// ✅ CARGA LUCRATIVA
const CargaLucrativa = () => {
  const { numero_viagem } = useParams(); // captura da URL
  const [currentTab, setCurrentTab] = useState(
    numero_viagem ? "gerarViagem" : "relatorioViagem"
  );
  const [numeroViagem, setNumeroViagem] = useState(numero_viagem || null);

  useEffect(() => {
    if (numero_viagem) {
      setCurrentTab("gerarViagem");
      setNumeroViagem(numero_viagem);
    }
  }, [numero_viagem]);

  return (
    <ContainerGeralCargaLucrativa>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setNumeroViagem={setNumeroViagem}
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
        {currentTab === "dashboard" && <Dashboard />}
        {currentTab === "gerarViagem" && (
          <GerarViagem numeroViagemParam={numeroViagem} />
        )}
        {currentTab === "custosTabela" && <CustosTabela />}
        {currentTab === "relatorioViagem" && (
          <RelatorioViagens
            setCurrentTab={setCurrentTab}
            setNumeroViagem={setNumeroViagem}
          />
        )}
        {/* {currentTab === "relatorioColetas" && <RelatorioColetas />} */}
      </div>
    </ContainerGeralCargaLucrativa>
  );
};

export default CargaLucrativa;
