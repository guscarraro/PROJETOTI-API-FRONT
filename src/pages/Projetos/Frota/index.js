import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import NavBar from "../../Projetos/components/NavBar";
import { Page, H1 } from "../../Projetos/style";

import { Content } from "./style";

import Analise_HA from "./Analise_HA";
import Analise_Performaxxi from "./Analise_Performaxxi";

const ROUTES = {
  HA: "/frota/analise-ha",
  PERFORMAXXI: "/frota/analise-performaxxi",
};

export default function Frota() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    const p = String(pathname || "").toLowerCase();
    if (p.startsWith(ROUTES.PERFORMAXXI)) return "performaxxi";
    return "ha";
  }, [pathname]);

  return (
    <Page>
      {/* ✅ TV MODE: some navbar e trava scroll */}
      <style>{`
        html.tv-mode #app-navbar { display: none !important; }
        html.tv-mode body { overflow: hidden !important; }

        /* ✅ fora do fullscreen: garante navbar "por cima" */
        #app-navbar{
          position: sticky;
          top: 0;
          z-index: 5000;
        }

        /* evita o conteúdo criar stacking acima sem querer */
        #frota-content{
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div id="app-navbar">
        <NavBar />
      </div>

      <Content id="frota-content">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <H1 $accent="#22d3ee">Frota</H1>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => navigate(ROUTES.HA)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: activeTab === "ha" ? "2px solid #22d3ee" : "1px solid rgba(148,163,184,.35)",
                background: activeTab === "ha" ? "rgba(34,211,238,.18)" : "transparent",
                color: "grey",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Análise HA
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.PERFORMAXXI)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border:
                  activeTab === "performaxxi" ? "2px solid #22d3ee" : "1px solid rgba(148,163,184,.35)",
                background: activeTab === "performaxxi" ? "rgba(34,211,238,.18)" : "transparent",
                color: "grey",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Análise Performaxxi
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {activeTab === "performaxxi" ? <Analise_Performaxxi /> : <Analise_HA />}
        </div>
      </Content>
    </Page>
  );
}
