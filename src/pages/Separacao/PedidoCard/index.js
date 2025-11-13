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
  pedido.status === STATUS_PEDIDO.EXPEDIDO
    ? "concluido"
    : pedido.status === STATUS_PEDIDO.PRONTO_EXPEDICAO
    ? "primeira"
    : "pendente";


  // ---- Eventos: exibir apenas os 2 mais recentes, otimizando espaço
  function getLastTwoEvents() {
    // Preferir eventos_preview; se não houver, usar eventos; fallback logs legado
    const evPrev = Array.isArray(pedido.eventos_preview) ? pedido.eventos_preview : null;
    const evFull = Array.isArray(pedido.eventos) ? pedido.eventos : null;

    if (evPrev && evPrev.length > 0) {
      // já vem em ordem de criação do back? Para garantir, ordena por created_at desc se existir
      const copy = evPrev.slice();
      copy.sort((a, b) => {
        const ta = new Date(a.created_at || a.at || 0).getTime();
        const tb = new Date(b.created_at || b.at || 0).getTime();
        return tb - ta;
      });
      return copy.slice(0, 2);
    }

    if (evFull && evFull.length > 0) {
      const copy = evFull.slice();
      copy.sort((a, b) => {
        const ta = new Date(a.created_at || a.at || 0).getTime();
        const tb = new Date(b.created_at || b.at || 0).getTime();
        return tb - ta;
      });
      return copy.slice(0, 1);
    }

    // Fallback: logs legado (pega os 2 últimos)
    const logs = Array.isArray(pedido.logs) ? pedido.logs : [];
    if (logs.length > 0) {
      const last = [];
      for (let i = logs.length - 1; i >= 0 && last.length < 2; i--) {
        last.push(logs[i]);
      }
      return last;
    }

    return [];
  }

  function renderTwoEvents() {
    const two = getLastTwoEvents();
    if (two.length === 0) {
      return <Muted style={{ fontSize: 12 }}>Sem alterações.</Muted>;
    }

    const totalCount =
      (Array.isArray(pedido.eventos_preview) && pedido.eventos_preview.length) ||
      (Array.isArray(pedido.eventos) && pedido.eventos.length) ||
      (Array.isArray(pedido.logs) && pedido.logs.length) ||
      two.length;

    const out = [];
    for (let i = 0; i < two.length; i++) {
      const e = two[i] || {};
      const txt = e.texto || e.text || e.tipo || "—";
      const usr = e.user_ref || e.user || "sistema";
      const whenStr = (e.created_at || e.at)
        ? new Date(e.created_at || e.at).toLocaleString("pt-BR")
        : "";

      out.push(
        <EventLine key={e.id || `${i}-${txt.slice(0, 8)}`}>
          <span className="dot" />
          <span className="main" title={txt}>{txt}</span>
          <span className="meta">
            <em>{usr}</em>{whenStr ? <> · <Muted>{whenStr}</Muted></> : null}
          </span>
        </EventLine>
      );
    }

    // Indicador de “+N” para sinalizar que existem mais eventos no detalhe
    if (totalCount > 2) {
      out.push(
        <MoreHint key="more">
          +{totalCount - 2} eventos — clique para ver tudo
        </MoreHint>
      );
    }

    return out;
  }

  return (
    <Card role="group" onClick={onOpen} style={{ cursor: "pointer" }}>
      <FlexRow style={{ gap: 8, alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Pedido #{pedido.nr_pedido}</h3>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <StatusPill $variant={variant}>
            {variant === "pendente" && "Aguardando conferência"}
            {variant === "primeira" && "Pronto para expedir"}
            {variant === "concluido" && "Expedido"}
          </StatusPill>
        </div>
      </FlexRow>
        <Muted style={{ fontSize: 11, marginTop: 2 }}>OV: {pedido.ov || "—"}</Muted>

      <div style={{ marginTop: 8 }}>
        <Row>
          <strong>Cliente:</strong>{" "}
          <span className="truncate">{pedido.cliente || <em>—</em>}</span>
        </Row>
        <Row>
          <strong>Destino:</strong>{" "}
          <span className="truncate">{pedido.destino || <em>—</em>}</span>
        </Row>

        <MetaGrid>
          <div>
            <strong>Total volume:</strong>{" "}
            <span>{totalItens}</span>
          </div>
          <div>
            <strong>Nota (NF):</strong>{" "}
            <span>{pedido.nota || <em>—</em>}</span>
          </div>
          <div>
            <strong>Separador:</strong>{" "}
            <span className="truncate">{pedido.separador || <em>—</em>}</span>
          </div>
          <div>
            <strong>Conferente:</strong>{" "}
            <span className="truncate">{conferenteNome || <em>—</em>}</span>
          </div>
        </MetaGrid>

        {hasOcorrenciaConferencia && (
          <OccurrenceBadge title="Ocorrência registrada na conferência">
            Ocorrência na conferência
          </OccurrenceBadge>
        )}

        <Row>
          <strong>Transportadora:</strong>{" "}
          <span className="truncate">{pedido.transportador || <em>—</em>}</span>
        </Row>
      </div>

      <div style={{ marginTop: 10 }}>
        <strong>Eventos (2 últimos)</strong>
        <EventsBox>{renderTwoEvents()}</EventsBox>
      </div>
    </Card>
  );
}

/* ====== estilos locais do card ====== */

const EventsBox = styled.div`
  margin-top: 6px;
  display: grid;
  gap: 6px;
  min-width: 0;

`;

const EventLine = styled.div`
display: grid;
grid-template-columns: 10px 1fr;
grid-template-rows: auto auto;   /* 2 linhas: texto em cima, meta embaixo */
align-items: center;
gap: 6px 8px;
font-size: 12px;
min-width: 0; 

  .dot {
    width: 6px; height: 6px; border-radius: 999px;
    background: #9ca3af;
    [data-theme="dark"] & { background: #94a3b8; }
  }

  .main {
    min-width: 0;                  /* para ellipsis funcionar */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
   display: flex;
   gap: 4px;
   white-space: normal;   /* deixa quebrar */
   flex-wrap: wrap;       /* quebra usuário/data se precisar */
   min-width: 0;
   grid-column: 2 / -1;   /* fica abaixo do texto principal */
   justify-self: start;
    color: #6b7280;
    [data-theme="dark"] & { color: #94a3b8; }
  }

 @media (max-width: 768px) {
   .meta { font-size: 11px; opacity: .9; }
 }
`;

const MoreHint = styled.div`
  font-size: 11px;
  opacity: .75;
`;

const OccurrenceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  margin: 6px 0;

  background: #fef3c7;   /* âmbar claro 100 */
  border: 1px solid #fdba74; /* âmbar 300 */
  color: #9a3412;        /* âmbar 800 */

  [data-theme="dark"] & {
    background: rgba(245, 158, 11, 0.12);
    border-color: rgba(245, 158, 11, 0.35);
    color: #fbbf24;
  }
`;

const MetaGrid = styled.div`
  margin: 6px 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 6px 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* empilha no mobile */
  }

  .truncate {
display: block;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
