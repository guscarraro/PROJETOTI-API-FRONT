import React from "react";
import { InfoGrid } from "../style";
import { StatusCard, DateCard, DaysCard, CostsCard } from "../components/InfoCards";

export default function InfoSummary({ projeto, accent, daysCount, totalCustosBRL, canOpenStatus, onOpenStatusMenu, onOpenCosts }) {
  return (
    <InfoGrid>
      <div onClick={onOpenStatusMenu} style={{ cursor: canOpenStatus ? "pointer" : "default" }}>
        <StatusCard status={projeto.status} accent={accent} />
      </div>
      <DateCard label="Início" dateISO={projeto.inicio} />
      <DateCard label="Previsão de término" dateISO={projeto.fim} />
      <DaysCard total={daysCount} />
      <CostsCard totalBRL={totalCustosBRL} onClick={onOpenCosts} />
    </InfoGrid>
  );
}