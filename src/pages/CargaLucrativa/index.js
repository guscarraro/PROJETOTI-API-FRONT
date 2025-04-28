import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import RelatorioColetas from "./RelatorioColetas"; // ✅ Adicionando o Relatório de Coletas


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
      setSelectedOption(option); // ✅ Somente altera se não for do dropdown
    }
    setCurrentTab(tab);
    setDropdownVisible(false);
  };
  

  return (
    <NavbarContainer>
      {!isRestrictedUser && (
  <NavButton
    active={currentTab === "dashboard"}
    onClick={() => handleSelection("Dashboard", "dashboard")}
  >
    Dashboard Viagens
  </NavButton>
)}

<NavButton
  active={currentTab === "gerarViagem"}
  onClick={() => handleSelection("Gerar Viagem", "gerarViagem")}
>
  Gerar Viagem
</NavButton>

{!isRestrictedUser && (
  <NavButton
    active={currentTab === "custosTabela"}
    onClick={() => handleSelection("Tabela de Custos", "custosTabela")}
  >
    Tabela de custos
  </NavButton>
)}

{/* {!isRestrictedUser && (
  <NavButton
    active={currentTab === "lancarColeta"}
    onClick={() => handleSelection("Lançar Coleta", "lancarColeta")}
  >
    Lançar Coleta
  </NavButton>
)} */}

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

      {/* {!isRestrictedUser && (
        <DropdownItem
          onClick={() =>
            handleSelection("Relatório de Coletas", "relatorioColetas")
          }
        >
          Relatório de Coletas
        </DropdownItem>
      )} */}
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

const CargaLucrativa = () => {
  const [currentTab, setCurrentTab] = useState("relatorioViagem");
  const [numeroViagem, setNumeroViagem] = useState(null);

  return (
    <ContainerGeralCargaLucrativa>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} setNumeroViagem={setNumeroViagem} />
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
        {currentTab === "gerarViagem" && <GerarViagem numeroViagemParam={numeroViagem} />}
        {/* {currentTab === "lancarColeta" && <LancarColeta />} */}
        {currentTab === "custosTabela" && <CustosTabela />}
        {currentTab === "relatorioViagem" && (
          <RelatorioViagens setCurrentTab={setCurrentTab} setNumeroViagem={setNumeroViagem} />
        )}
        {/* {currentTab === "relatorioColetas" && <RelatorioColetas />} */}
      </div>
    </ContainerGeralCargaLucrativa>
  );
};

export default CargaLucrativa;
