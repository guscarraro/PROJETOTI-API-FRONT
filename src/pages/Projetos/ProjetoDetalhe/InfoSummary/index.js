import React from "react";
import { STATUS } from "../../utils";
import { InfoGrid } from "../../style";
import {
  StatusCard,
  DateCard,
  DaysCard,
  CostsCard,
} from "../../components/InfoCards";

export default function InfoSummary({
  projeto,
  accent,
  daysCount = 0,
  totalCustos = 0,
  onOpenCosts,
  onOpenStatusMenu,
  canChangeStatus = false,
}) {
  // null-safe
  const statusLabel = STATUS[projeto?.status] || projeto?.status || "-";
  const inicio = projeto?.inicio || null;
  const fim = projeto?.fim || null;

  return (
    <InfoGrid>
      <div
        onClick={canChangeStatus ? onOpenStatusMenu : undefined}
        style={{ cursor: canChangeStatus ? "pointer" : "default" }}
      >
        <StatusCard status={statusLabel} accent={accent} />
      </div>

      <DateCard label="Início" dateISO={inicio} />
      <DateCard label="Previsão de término" dateISO={fim} />
      <DaysCard total={daysCount} />
      {onOpenCosts && (
        <CostsCard
          totalBRL={Number(totalCustos).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          onClick={onOpenCosts}
        />
      )}
    </InfoGrid>
  );
}
