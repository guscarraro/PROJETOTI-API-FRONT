// src/pages/.../Analise_Performaxxi/ModalDetalheErros.js
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

function safe(v) {
  return v == null || String(v).trim() === "" ? "-" : String(v);
}

function formatXAxisDate(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

function getTitle(eventType) {
  if (eventType === "sla") return "Erros • SLA";
  if (eventType === "entregas") return "Erros • Entregas";
  if (eventType === "mercadorias") return "Erros • Mercadorias < 100%";
  if (eventType === "devolucao") return "Divergências • Devolução";
  if (eventType === "almoco_pendente") return "Almoço • Pendente";
  if (eventType === "gravissimo") return "Almoço • Finalizado sem lançar";
  return "Eventos • Geral";
}

function getHint(eventType, metaSlaPct) {
  if (eventType === "sla") return <Badge $variant="danger">SLA &lt; {metaSlaPct}%</Badge>;
  if (eventType === "entregas") return <Badge $variant="warn">realizadas &lt; total</Badge>;
  if (eventType === "mercadorias") return <Badge $variant="warn">mercadorias &lt; 100%</Badge>;
  if (eventType === "devolucao") return <Badge $variant="info">devoluções &gt; 0</Badge>;
  if (eventType === "almoco_pendente") return <Badge $variant="warn">almoço não lançado</Badge>;
  if (eventType === "gravissimo") return <Badge $variant="danger">finalizada sem almoço</Badge>;
  return <Badge $variant="info">qualquer evento</Badge>;
}

export default function ModalDetalheErros({ open, payload, onClose }) {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  async function load() {
    if (!payload) return;

    const dayISO = payload?.filters?.day_iso || payload?.dayISO || null;

    const params = {
      data_ini: payload?.filters?.data_ini,
      data_fim: payload?.filters?.data_fim,

      // ✅ v2
      event_type: payload?.event_type || payload?.error_type || "geral",
      meta_sla_pct: payload?.meta_sla_pct ?? 100,

      ...(dayISO ? { day_iso: dayISO } : {}),

      ...(payload?.filters?.usuario_key ? { usuario_key: payload.filters.usuario_key } : {}),
      ...(payload?.filters?.motorista ? { motorista: payload.filters.motorista } : {}),
      ...(payload?.filters?.rota ? { rota: payload.filters.rota } : {}),
      ...(payload?.filters?.status_rota ? { status_rota: payload.filters.status_rota } : {}),

      page: 1,
      page_size: 200,
    };

    setLoading(true);
    setErrMsg("");
    try {
      const r = await apiLocal.getAnaliseRotasDetalheEventos(params);
      setResp(r?.data || null);
    } catch (e) {
      setResp(null);
      setErrMsg(
        e?.response?.data?.detail
          ? JSON.stringify(e.response.data.detail)
          : e?.message || "Erro ao carregar detalhes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    payload?.event_type,
    payload?.filters?.day_iso,
    payload?.filters?.usuario_key,
    payload?.filters?.motorista,
    payload?.filters?.rota,
    payload?.filters?.status_rota,
    payload?.meta_sla_pct,
  ]);

  if (!open) return null;

  const items = Array.isArray(resp?.items) ? resp.items : [];
  const eventType = resp?.event_type || payload?.event_type || payload?.error_type || "geral";
  const title = getTitle(eventType);

  const dayLabel = payload?.filters?.day_iso
    ? formatXAxisDate(payload.filters.day_iso)
    : payload?.dayISO
      ? formatXAxisDate(payload.dayISO)
      : "Período";

  return (
    <ModalBackdrop>
      <ModalCard>
        <TwoCols>
          <div>
            <ModalTitle>
              {title} • {dayLabel}
            </ModalTitle>

            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
              {getHint(eventType, payload?.meta_sla_pct ?? 100)}
            </div>

            {errMsg && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#fb7185" }}>
                {errMsg}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {loading ? "Carregando..." : `${items.length} itens`}
            </div>
            <CloseBtn onClick={onClose}>✕</CloseBtn>
          </div>
        </TwoCols>

        <div style={{ marginTop: 12, overflow: "auto" }}>
          <Table>
            <THead>
              <tr>
                <th>Data</th>
                <th>Rota</th>
                <th>Motorista</th>
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
                  <TCell>{formatXAxisDate(it.data)}</TCell>
                  <TCell style={{ fontWeight: 900 }}>{safe(it.rota)}</TCell>
                  <TCell>{safe(it.motorista)}</TCell>
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

              {!loading && items.length === 0 && !errMsg && (
                <TRow>
                  <TCell colSpan={10} style={{ opacity: 0.8 }}>
                    Sem ocorrências para este filtro.
                  </TCell>
                </TRow>
              )}
            </tbody>
          </Table>
        </div>
      </ModalCard>
    </ModalBackdrop>
  );
}
