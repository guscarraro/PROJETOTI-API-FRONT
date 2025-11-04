import React, { useEffect, useMemo, useState } from "react";
import { Card, FlexRow, Muted } from "../../Projetos/style";
import { StatusPill, Row } from "../style";
import { STATUS_PEDIDO } from "../constants";
import styled from "styled-components";
import apiLocal from "../../../services/apiLocal";

export default function PedidoCard({
  pedido,
  onOpen,
  onUpdate, // ainda uso para cachear itens após buscar
}) {
  // total de itens (busca 1x se não vier no objeto)
  const [lazyTotal, setLazyTotal] = useState(null);

  const totalItens = useMemo(() => {
    let total = 0;
    const arr = Array.isArray(pedido.itens) ? pedido.itens : null;
    if (arr && arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        const n = Number(arr[i]?.qtde || 0);
        total += isNaN(n) ? 0 : n;
      }
      return total;
    }
    if (typeof lazyTotal === "number") return lazyTotal;
    if (typeof pedido.total_itens === "number") return pedido.total_itens; // caso o back já mande
    return 0;
  }, [pedido.itens, pedido.total_itens, lazyTotal]);

  // Regra: só exibir conferente se houver separador
  const conferenteNome = useMemo(() => {
    const hasSeparador = !!(pedido?.separador && String(pedido.separador).trim());
    if (!hasSeparador) return "";
    const c1 = pedido?.conferente ? String(pedido.conferente).trim() : "";
    const c2 = pedido?.primeiraConferencia?.colaborador
      ? String(pedido.primeiraConferencia.colaborador).trim()
      : "";
    return c1 || c2 || "";
  }, [pedido?.separador, pedido?.conferente, pedido?.primeiraConferencia?.colaborador]);

  // Detecta ocorrência relacionada à conferência (eventos/eventos_preview)
 // Preferir o booleano do back; se não vier, cai no fallback atual
const hasOcorrenciaConferencia = useMemo(() => {
  if (typeof pedido?.has_ocorrencia === "boolean") return pedido.has_ocorrencia;

  function matchArray(arr) {
    if (!Array.isArray(arr)) return false;
    for (let i = 0; i < arr.length; i++) {
      const ev = arr[i] || {};
      const tipo = String(ev.tipo || "").toLowerCase();
      const texto = String(ev.texto || "").toLowerCase();
      if (tipo === "ocorrencia_conferencia" || tipo === "ocorrência_conferência") return true;
      if (tipo.includes("ocorr") || tipo.includes("diverg") || tipo.includes("falta") || tipo.includes("avaria")) return true;
      if (texto.includes("ocorr") || texto.includes("diverg") || texto.includes("falta") || texto.includes("avaria")) return true;
    }
    return false;
  }

  if (matchArray(pedido?.eventos)) return true;
  if (matchArray(pedido?.eventos_preview)) return true;
  return false;
}, [pedido?.has_ocorrencia, pedido?.eventos, pedido?.eventos_preview]);

  useEffect(() => {
    // Garante o contador de itens no card SEM depender de eventos:
    // se não veio itens, busca uma vez direto do endpoint de itens.
    if (!Array.isArray(pedido.itens)) {
      (async () => {
        try {
          const resp = await apiLocal.getItensByNr(pedido.nr_pedido);
          const itens = Array.isArray(resp?.data) ? resp.data : [];
          let soma = 0;
          for (let i = 0; i < itens.length; i++) {
            const n = Number(itens[i]?.qtde || 0);
            soma += isNaN(n) ? 0 : n;
          }
          setLazyTotal(soma);
          // cache local no pai, evita refetchs em modais
          if (typeof onUpdate === "function") {
            await onUpdate(pedido.nr_pedido, { itens });
          }
        } catch {
          /* silencioso */
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido.nr_pedido]);

  const variant =
    pedido.status === STATUS_PEDIDO.CONCLUIDO
      ? "concluido"
      : pedido.status === STATUS_PEDIDO.PRIMEIRA_CONF
      ? "primeira"
      : "pendente";

  function renderPreviewLogs() {
    const ev = Array.isArray(pedido.eventos_preview)
      ? pedido.eventos_preview
      : null;

    if (ev && ev.length > 0) {
      const out = [];
      for (let i = 0; i < ev.length; i++) {
        const e = ev[i];
        const when = e.created_at ? new Date(e.created_at).toLocaleString("pt-BR") : "";
        out.push(
          <div key={e.id || i} style={{ fontSize: 12, opacity: 0.9 }}>
            • {e.texto || e.tipo} — <em>{e.user_ref || "sistema"}</em>{" "}
            <Muted>({when})</Muted>
          </div>
        );
      }
      return out;
    }

    // fallback legado (se ainda existir "logs" no objeto antigo)
    const logs = pedido.logs || [];
    if (logs.length === 0) {
      return <div style={{ opacity: 0.7, fontSize: 12 }}>Sem alterações.</div>;
    }
    const out = [];
    for (let i = logs.length - 1; i >= 0; i--) {
      const l = logs[i];
      out.push(
        <div key={i} style={{ fontSize: 12, opacity: 0.9 }}>
          • {l.text} — <em>{l.user}</em>{" "}
          <Muted>({new Date(l.at).toLocaleString("pt-BR")})</Muted>
        </div>
      );
    }
    return out;
  }

  return (
    <Card role="group" onClick={onOpen} style={{ cursor: "pointer" }}>
      <FlexRow style={{ gap: 8, alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Pedido #{pedido.nr_pedido}</h3>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>

          <StatusPill $variant={variant}>
            {variant === "pendente" && "Aguardando conferência"}
            {variant === "primeira" && "Pronto para expedir"}
            {variant === "concluido" && "Expedido"}
          </StatusPill>
        </div>
      </FlexRow>

      <div style={{ marginTop: 8 }}>
        <Row>
          <strong>Cliente:</strong>{" "}
          <span>{pedido.cliente || <em>—</em>}</span>
        </Row>
        <Row>
          <strong>Destino:</strong>{" "}
          <span>{pedido.destino || <em>—</em>}</span>
        </Row>
        <Row>
          <strong>Total volume:</strong>{" "}
          <span>{totalItens}</span>
        </Row>
        <Row>
          <strong>Nota (NF):</strong>{" "}
          <span>{pedido.nota || <em>—</em>}</span>
        </Row>
        <Row>
          <strong>Separador:</strong>{" "}
          <span>{pedido.separador || <em>—</em>}</span>
        </Row>
        <Row>
          <strong>Conferente:</strong>{" "}
          <span>{conferenteNome || <em>—</em>}</span>
        </Row>
                  {hasOcorrenciaConferencia && (
            <OccurrenceBadge title="Ocorrência registrada na conferência">
              Ocorrência na conferência
            </OccurrenceBadge>
          )}
        <Row>
          <strong>Transportadora:</strong>{" "}
          <span>{pedido.transportador || <em>—</em>}</span>
        </Row>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Eventos (últimos)</strong>
        <div style={{ marginTop: 6 }}>
          {renderPreviewLogs()}
        </div>
      </div>
    </Card>
  );
}

const OccurrenceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: #fef3c7;   /* âmbar claro 100 */
  border: 1px solid #fdba74; /* âmbar 300 */
  color: #9a3412;        /* âmbar 800 */
`;

const Overlay = styled.div`
  /* Mantive o estilo caso ainda use overlay em outras iterações */
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
`;
