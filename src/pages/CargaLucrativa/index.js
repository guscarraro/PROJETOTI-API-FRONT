import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import {
  NavbarContainer,
  NavButton,
  NavIcon,
  ContainerGeralCargaLucrativa,
} from "./style"; // Estilos atualizados
import RelatorioViagens from "./RelatorioViagens";
import GerarViagem from "./GerarViagem";
import Dashboard from "./Dashboard";
import CustosTabela from "./CustosTabela";

const Navbar = ({ currentTab, setCurrentTab, setNumeroViagem }) => {
  const navigate = useNavigate();

  const handleSelection = (tab, viagemId = null) => {
    setCurrentTab(tab);
    setNumeroViagem(viagemId); // ✅ Agora passamos corretamente
  };

  return (
    <NavbarContainer>
      <NavButton
        active={currentTab === "dashboard"}
        onClick={() => handleSelection("dashboard")}
      >
        Dashboard Viagens
      </NavButton>

      <NavButton active={currentTab === "gerarViagem"} onClick={() => handleSelection("gerarViagem", null)}>
        Gerar Viagem
      </NavButton>

      <NavButton
        active={currentTab === "custosTabela"}
        onClick={() => handleSelection("custosTabela")}
      >
        Tabela de custos
      </NavButton>

      <NavButton
        active={currentTab === "relatorioViagem"}
        onClick={() => handleSelection("relatorioViagem")}
      >
        Relatório de Viagens
      </NavButton>

      <NavButton onClick={() => navigate("/Frete")}>
        <NavIcon>
          <FaArrowRight />
        </NavIcon>
        Ir para Ocorrências
      </NavButton>
    </NavbarContainer>
  );
};

const CargaLucrativa = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [numeroViagem, setNumeroViagem] = useState(null); // ✅ Adicionando estado

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
        {currentTab === "custosTabela" && <CustosTabela />}
        {currentTab === "relatorioViagem" && (
          <RelatorioViagens setCurrentTab={setCurrentTab} setNumeroViagem={setNumeroViagem} />
        )}
      </div>
    </ContainerGeralCargaLucrativa>
  );
};

export default CargaLucrativa;
