// src/pages/Projetos/components/CostsPopover/index.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "reactstrap";
import { Palette as Pop } from "../../style";
import { FiCheckCircle } from "react-icons/fi";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import useLoading from "../../../../hooks/useLoading";
import { PageLoader } from "../Loader";
import { CostBox, HeadRow, ParcelsGrid, Chip, ParcelCard, ParcelHead, PaidMark, DueText } from "./style";

/* ---------- helpers ---------- */
const toBRL = (n) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function normalizeCost(c) {
  const description = c.description ?? c.descricao ?? "";
  const totalValue  = Number(c.total_value ?? c.valorTotal ?? 0);
  const parcelCount =
    typeof c.parcels === "number" ? c.parcels :
    typeof c.parcelas === "number" ? c.parcelas :
    Array.isArray(c.parcels) ? c.parcels.length :
    1;

  const firstDue =
    c.first_due ?? c.primeiraParcela ?? c.firstDue ?? null;

  const intervalDays = Number(
    c.interval_days ?? c.intervalDias ?? c.intervalDays ?? 30
  );

  return {
    id: c.id || c.cost_id,
    description,
    total_value: totalValue,
    parcels: parcelCount,
    first_due: firstDue,
    interval_days: intervalDays,
  };
}

function normalizeParcel(p) {
  const idx   = Number(p.parcel_index ?? p.index ?? p.idx);
  const date  = p.due_date ?? p.dueDate ?? p.date ?? null;
  const valor = Number(p.amount ?? p.valor ?? 0);
  const paid  = typeof p.paid === "boolean" ? p.paid : Boolean(p.pago ?? p.paid_at);
  return { idx, date, valor, paid };
}

const renderDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
};

/* ---------- componente ---------- */
export default function CostsPopover({
  projectId,
  actorSectorId,
  custos = [],
  onClose,
}) {
  const loading = useLoading();

  const [items, setItems] = useState(() =>
    (Array.isArray(custos) ? custos : []).map(normalizeCost)
  );
  const [parcelsByCost, setParcelsByCost] = useState({}); // { costId: [{idx,date,valor,paid}, ...] }

  const total = useMemo(
    () => items.reduce((acc, c) => acc + Number(c.total_value || 0), 0),
    [items]
  );

  // centraliza o fetch das parcelas de 1 custo
  const fetchParcelsForCost = useCallback(async (costId) => {
    const r = await apiLocal.getProjetoParcels(projectId, costId);
    const list = (r.data || []).map(normalizeParcel);
    setParcelsByCost(prev => ({ ...prev, [costId]: list }));
  }, [projectId]);

  // busca todas as parcelas (sempre do servidor; NÃO usa raw.parcels)
  const fetchAllParcels = useCallback(async (list) => {
    const next = {};
    for (const c of list) {
      const r = await apiLocal.getProjetoParcels(projectId, c.id);
      next[c.id] = (r.data || []).map(normalizeParcel);
    }
    setParcelsByCost(next);
  }, [projectId]);

  // normaliza custos e busca parcelas reais do back (com loader)
  useEffect(() => {
    const list = (Array.isArray(custos) ? custos : []).map(normalizeCost);
    setItems(list);
    loading.wrap("costs-fetch-parcels", async () => {
      try {
        await fetchAllParcels(list);
      } catch {
        // em caso de erro, mantém estado atual (ou você pode gerar fallback local aqui se quiser)
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custos, projectId]);

  // toggle pagar/desmarcar (com loader e refetch daquele custo)
  const handleTogglePay = async (costId, parcelIdx) => {
    if (!projectId) {
      toast.error("Projeto sem ID.");
      return;
    }
    const asid = Number(actorSectorId);
    if (!Number.isInteger(asid) || asid <= 0) {
      toast.error("actorSectorId inválido.");
      return;
    }

    const current = parcelsByCost[costId] || [];
    const target = current.find((p) => p.idx === parcelIdx);
    if (!target) {
      toast.error("Parcela não encontrada.");
      return;
    }

    const op = target.paid ? "unpay" : "pay";
    try {
      await loading.wrap(`${op}-${costId}-${parcelIdx}`, async () => {
        if (target.paid) {
          await apiLocal.unpayParcela(projectId, costId, parcelIdx, asid);
        } else {
          await apiLocal.payParcela(projectId, costId, parcelIdx, asid);
        }
      });

      // 1) otimista: atualiza só o item local
      setParcelsByCost((prev) => ({
        ...prev,
        [costId]: (prev[costId] || []).map((p) =>
          p.idx === parcelIdx ? { ...p, paid: !target.paid } : p
        ),
      }));

      // 2) verdade do servidor: refetch do custo alterado (garante consistência ao reabrir)
      await fetchParcelsForCost(costId);

      toast.success(target.paid ? "Pagamento desfeito." : "Parcela marcada como paga.");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.detail || err.message;
      if (status === 403)
        toast.error("Apenas ADM/Diretoria podem alterar o status de pagamento.");
      else toast.error(`Falha ao alterar pagamento: ${msg}`);
    }
  };

  return (
    <div style={{ position: "fixed", right: 24, top: 140, zIndex: 60 }}>
      <Pop style={{ width: 520, maxHeight: "60vh", overflowY: "auto", position: "relative" }}>
        <PageLoader active={loading.any()} text="Processando..." />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <strong>Custos do projeto</strong>
          <div><b>Total:</b> {toBRL(total)}</div>
        </div>

        {items.length === 0 && <div style={{ color: "#6b7280" }}>Nenhum custo informado.</div>}

        {items.map((c) => {
          const list = parcelsByCost[c.id] || [];
          return (
            <CostBox key={c.id || c.description}>
              <HeadRow>
                <b>{c.description}</b>
                <span>{toBRL(c.total_value)}</span>
              </HeadRow>

              <ParcelsGrid>
                {list.map((p) => {
                  const paid = Boolean(p.paid);
                  return (
                    <ParcelCard
                      key={`${c.id}:${p.idx}`}
                      $paid={paid}
                      onClick={() => handleTogglePay(c.id, p.idx)}
                      title={paid ? "Desmarcar pagamento" : "Marcar como pago"}
                      disabled={loading.any()}
                    >
                      <ParcelHead>
                        <Chip>Parcela {p.idx}</Chip>
                        <b>{toBRL(p.valor)}</b>
                      </ParcelHead>

                      <DueText>Vencimento: {renderDate(p.date)}</DueText>

                      <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                        <PaidMark $visible={paid}>
                          <FiCheckCircle size={16} /> Pago
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
          <Button size="sm" color="secondary" onClick={onClose} disabled={loading.any()}>
            Fechar
          </Button>
        </div>
      </Pop>
    </div>
  );
}
