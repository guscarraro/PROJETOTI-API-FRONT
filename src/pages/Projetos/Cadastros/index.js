import React, { useMemo } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

// ✅ Layout reaproveitado do módulo Projetos
import { Page, TitleBar, H1 } from "../style";
import NavBar from "../components/NavBar";

// ✅ Páginas internas (CRUDs)
import MotoristasPage from "./Motoristas";
import ResponsaveisPage from "./Responsaveis";
import VeiculosPage from "./Veiculos";

/* ---------- estilos auxiliares ---------- */
const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Tabs = styled.div`
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(31, 41, 55, 0.06);
  border: 1px solid rgba(31, 41, 55, 0.12);

  [data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

const TabBtn = styled.button`
  border: 0;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 13px;

  background: ${(p) => (p.$active ? "rgba(96,165,250,0.22)" : "transparent")};
  color: ${(p) => (p.$active ? "#111827" : "rgba(17,24,39,.72)")};
  box-shadow: ${(p) =>
    p.$active ? "inset 0 0 0 1px rgba(96,165,250,0.35)" : "none"};

  transition: background 0.18s ease, transform 0.12s ease, color 0.18s ease;

  &:hover {
    background: rgba(96, 165, 250, 0.16);
  }
  &:active {
    transform: translateY(1px);
  }

  [data-theme="dark"] & {
    color: ${(p) => (p.$active ? "#fff" : "rgba(229,231,235,.75)")};
    background: ${(p) => (p.$active ? "rgba(96,165,250,0.18)" : "transparent")};
    box-shadow: ${(p) =>
      p.$active ? "inset 0 0 0 1px rgba(96,165,250,0.30)" : "none"};

    &:hover {
      background: rgba(96, 165, 250, 0.14);
    }
  }
`;

export default function Cadastros() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const current = useMemo(() => {
    const p = String(pathname || "").toLowerCase();
    if (p.includes("/cadastros/veiculos")) return "veiculos";
    if (p.includes("/cadastros/responsaveis")) return "responsaveis";
    return "motoristas";
  }, [pathname]);

  return (
    <Page>
      <NavBar />

      <TitleBar style={{ zIndex: 1100 }}>
        <H1>Cadastros</H1>

        <RightActions>
          <Tabs>
            <TabBtn
              type="button"
              $active={current === "motoristas"}
              onClick={() => navigate("/cadastros/motoristas")}
              title="Cadastros de Motoristas"
            >
              Motoristas
            </TabBtn>

            <TabBtn
              type="button"
              $active={current === "responsaveis"}
              onClick={() => navigate("/cadastros/responsaveis")}
              title="Cadastros de Responsáveis"
            >
              Responsáveis
            </TabBtn>

            <TabBtn
              type="button"
              $active={current === "veiculos"}
              onClick={() => navigate("/cadastros/veiculos")}
              title="Cadastros de Veículos"
            >
              Veículos
            </TabBtn>
          </Tabs>
        </RightActions>
      </TitleBar>

      <Routes>
        {/* default */}
        <Route path="/" element={<Navigate to="motoristas" replace />} />

        <Route path="motoristas" element={<MotoristasPage />} />
        <Route path="responsaveis" element={<ResponsaveisPage />} />
        <Route path="veiculos" element={<VeiculosPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="motoristas" replace />} />
      </Routes>
    </Page>
  );
}
