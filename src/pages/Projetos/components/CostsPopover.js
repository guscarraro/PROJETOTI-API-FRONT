// src/pages/Projetos/components/CostsPopover.js
import React, { useMemo } from "react";
import { Button } from "reactstrap";
import { Palette as Pop } from "../style"; // reuso do estilo "Palette" como popover

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

export default function CostsPopover({ custos = [], onClose }) {
  const total = useMemo(
    () => custos.reduce((acc, c) => acc + Number(c.valorTotal || 0), 0),
    [custos]
  );

  return (
    <div style={{ position: "fixed", right: 24, top: 140, zIndex: 60 }}>
      <Pop onMouseLeave={onClose} style={{ width: 420, maxHeight: "60vh", overflowY: "auto" }}>
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
          return (
            <div
              key={c.id || c.descricao}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <b>{c.descricao}</b>
                <span>
                  {Number(c.valorTotal || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>

              {/* grid de cards de parcelas */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                  gap: 10,
                }}
              >
                {parcelas.map((p) => (
                  <div
                    key={p.idx}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 10,
                      background: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          background: "rgba(96,165,250,.15)",
                          color: "#1d4ed8",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        Parcela {p.idx}
                      </span>
                      <b>
                        {p.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </b>
                    </div>
                    <small style={{ color: "#374151" }}>
                      Vencimento: {new Date(p.date).toLocaleDateString("pt-BR")}
                    </small>
                  </div>
                ))}
              </div>
            </div>
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
