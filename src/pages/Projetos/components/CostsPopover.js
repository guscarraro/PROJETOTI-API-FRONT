// src/pages/Projetos/components/CostsPopover.js
import React from "react";
import styled, { css } from "styled-components";
import { Button } from "reactstrap";
import { Palette as Pop } from "../style"; // reuso do estilo "Palette" como popover
import { FiCheckCircle } from "react-icons/fi";

/* ---------- helpers ---------- */
function gerarParcelas(item) {
  const parcelas = Number(item.parcelas || 1);
  const intervalo = Number(item.intervaloDias || 30);
  const valorParcela = Number(item.valorTotal || 0) / (parcelas || 1);
  const first = new Date(item.primeiraParcela);

  const out = [];
  for (let i = 0; i < parcelas; i++) {
    const d = new Date(first);
    d.setDate(d.getDate() + i * intervalo);
    out.push({
      idx: i + 1,
      date: d.toISOString().slice(0, 10),
      valor: valorParcela,
    });
  }
  return out;
}

/* ---------- styled ---------- */
const CostBox = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 8px 24px rgba(2,6,23,.35);
  }
`;

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  b { font-weight: 800; }
`;

const ParcelsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
`;

const Chip = styled.span`
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(96,165,250,.15);
  color: #1d4ed8;

  [data-theme="dark"] & {
    background: rgba(99,102,241,.22);
    color: #c7d2fe;
  }
`;

/* card da parcela: clicável e com estado "pago" */
const ParcelCard = styled.button`
  text-align: left;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  background: #f9fafb;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;

  &:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(0,0,0,.08); }

  ${(p) => p.$paid && css`
    background: rgba(16,185,129,.12);            /* verde claro */
    border-color: #10b981;
    box-shadow: inset 0 0 0 1px rgba(16,185,129,.35);
  `}

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);

    ${(p) => p.$paid && css`
      background: rgba(16,185,129,.22);
      border-color: rgba(16,185,129,.6);
      box-shadow: inset 0 0 0 1px rgba(16,185,129,.55);
    `}
  }
`;

const ParcelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;

  b { font-weight: 800; }
`;

const PaidMark = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #10b981;
  ${(p) => !p.$visible && css`opacity: 0;`}

  [data-theme="dark"] & { color: #34d399; }
`;

const DueText = styled.small`
  color: #374151;
  [data-theme="dark"] & { color: #cbd5e1; }
`;

/* ---------- componente ---------- */
export default function CostsPopover({
  custos = [],
  paidSet = new Set(),              // <<< RECEBE do pai
  onTogglePaid = () => {},          // <<< RECEBE do pai
  onClose,
}) {
  // total SEM reduce:
  let total = 0;
  for (const c of custos) {
    total += Number(c.valorTotal || 0);
  }

  return (
    <div style={{ position: "fixed", right: 24, top: 140, zIndex: 60 }}>
      <Pop onMouseLeave={onClose} style={{ width: 480, maxHeight: "60vh", overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <strong>Custos do projeto</strong>
          <div>
            <b>Total:</b>{" "}
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </div>

        {custos.length === 0 && (
          <div style={{ color: "#6b7280" }}>Nenhum custo informado.</div>
        )}

        {custos.map((c) => {
          const parcelas = gerarParcelas(c);
          const groupId = c.id || c.descricao;

          return (
            <CostBox key={groupId}>
              <HeadRow>
                <b>{c.descricao}</b>
                <span>
                  {Number(c.valorTotal || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </HeadRow>

              <ParcelsGrid>
                {parcelas.map((p) => {
                  const key = `${groupId}__${p.idx}`;          // chave única da parcela
                  const isPaid = paidSet.has(key);

                  return (
                    <ParcelCard
                      key={key}
                      $paid={isPaid}
                      onClick={() => onTogglePaid(key)}
                      title={isPaid ? "Pago (clique para desfazer)" : "Marcar como pago"}
                    >
                      <ParcelHead>
                        <Chip>Parcela {p.idx}</Chip>
                        <b>
                          {p.valor.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </b>
                      </ParcelHead>

                      <DueText>
                        Vencimento: {new Date(p.date).toLocaleDateString("pt-BR")}
                      </DueText>

                      <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                        <PaidMark $visible={isPaid}>
                          <FiCheckCircle size={16} />
                          Pago
                        </PaidMark>
                      </div>
                    </ParcelCard>
                  );
                })}
              </ParcelsGrid>
            </CostBox>
          );
        })}

        <div style={{ textAlign: "right", marginTop: 6 }}>
          <Button size="sm" color="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Pop>
    </div>
  );
}
