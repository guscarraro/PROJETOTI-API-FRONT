// src/pages/.../Analise_Performaxxi/ModalMotoristaViagensProblemas.js
import React, { useEffect, useState } from "react";
import apiLocal from "../../../../../services/apiLocal";
import {
  ModalBackdrop,
  ModalCard,
  TwoCols,
  ModalTitle,
  CloseBtn,
  Table,
  THead,
  TRow,
  TCell,
  Badge,
} from "../style";

const COLORS = {
  gravissimo: "#ef4444",
  sla: "#fb7185",
  mercadorias: "#34d399",
  devolucao: "#60a5fa",
};

function safe(v) {
  return v == null || String(v).trim() === "" ? "-" : String(v);
}

function formatDateBR(iso) {
  if (!iso) return "-";
  const p = String(iso).split("-");
  if (p.length !== 3) return iso;
  return `${p[2]}/${p[1]}`;
}

function bgTint(hex) {
  // cria um “tint” simples (funciona bem em fundo escuro)
  return `${hex}22`; // alpha ~ 0.13
}

function titleByType(t, metaSlaPct) {
  if (t === "gravissimo") return "Gravíssimo • Finalizada sem lançar almoço";
  if (t === "sla") return `SLA • abaixo da meta (${metaSlaPct}%)`;
  if (t === "mercadorias") return "Mercadorias • abaixo de 100%";
  if (t === "devolucao") return "Devoluções • houve devolução";
  return "Ocorrências";
}

export default function ModalMotoristaViagensProblemas({ open, payload, onClose }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    if (!payload) return;

    const params = {
      data_ini: payload.data_ini,
      data_fim: payload.data_fim,
      motorista: payload.motorista,
      meta_sla_pct: payload.meta_sla_pct,
      event_type: payload.eventType,
      page: 1,
      page_size: 200,
    };

    if (payload.usuario_key) params.usuario_key = payload.usuario_key;

    setLoading(true);
    try {
      const r = await apiLocal.getAnaliseRotasDetalheEventos(params);
      const arr = Array.isArray(r?.data?.items) ? r.data.items : [];
      setItems(arr);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payload?.eventType, payload?.motorista, payload?.usuario_key, payload?.data_ini, payload?.data_fim]);

  if (!open) return null;

  const color = COLORS[payload?.eventType] || "#94a3b8";
  const title = titleByType(payload?.eventType, payload?.meta_sla_pct);

  return (
    <ModalBackdrop>
      <ModalCard style={{ maxWidth: 1120 }}>
        <TwoCols>
          <div>
            <ModalTitle>
              {safe(payload?.motorista)} • {safe(payload?.cd)}
            </ModalTitle>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
              <Badge $variant="warn">
                {title}
              </Badge>
              <span style={{ marginLeft: 10 }}>
                Período: <b>{formatDateBR(payload?.data_ini)}</b> até <b>{formatDateBR(payload?.data_fim)}</b>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {loading ? "Carregando..." : `${items.length} viagens`}
            </div>
            <CloseBtn onClick={onClose}>✕</CloseBtn>
          </div>
        </TwoCols>

        {/* Subcard do tipo clicado */}
        <div
          style={{
            marginTop: 14,
            borderRadius: 14,
            border: `1px solid ${color}55`,
            background: bgTint(color),
            padding: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontWeight: 900 }}>
              <span style={{ color }}>{title}</span>
            </div>
            <div style={{ fontWeight: 900 }}>
              Total: <span style={{ color }}>{items.length}</span>
            </div>
          </div>

          <div style={{ overflow: "auto" }}>
            <Table>
              <THead>
                <tr>
                  <th>Data</th>
                  <th>Rota</th>
                  <th>Status</th>
                  <th>Entregas</th>
                  <th>SLA</th>
                  <th>Mercadorias</th>
                  <th>Devoluções</th>
                  <th>Almoço</th>
                  <th>Última atividade</th>
                </tr>
              </THead>
              <tbody>
                {items.map((it) => (
                  <TRow key={it.id}>
                    <TCell>{formatDateBR(it.data)}</TCell>
                    <TCell style={{ fontWeight: 900 }}>{safe(it.rota)}</TCell>
                    <TCell>{safe(it.status_rota)}</TCell>
                    <TCell>
                      {Number(it.entregas_realizadas || 0)} / {Number(it.entregas_total || 0)}
                    </TCell>
                    <TCell>
                      <Badge $variant={Number(it.sla_entrega_pct || 0) >= 100 ? "ok" : "danger"}>
                        {Number(it.sla_entrega_pct || 0).toFixed(0)}%
                      </Badge>
                    </TCell>
                    <TCell>{Number(it.mercadorias_pct || 0).toFixed(0)}%</TCell>
                    <TCell>
                      {Number(it.devolucoes_qtd || 0)} / {Number(it.devolucoes_total || 0)}
                    </TCell>
                    <TCell>
                      <Badge $variant={it.almoco_lancado ? "ok" : "danger"}>
                        {it.almoco_lancado ? "Lançado" : "Pendente"}
                      </Badge>
                    </TCell>
                    <TCell>{safe(it.ultima_atividade)}</TCell>
                  </TRow>
                ))}

                {!loading && items.length === 0 && (
                  <TRow>
                    <TCell colSpan={9} style={{ opacity: 0.8 }}>
                      Sem viagens para este filtro.
                    </TCell>
                  </TRow>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </ModalCard>
    </ModalBackdrop>
  );
}
