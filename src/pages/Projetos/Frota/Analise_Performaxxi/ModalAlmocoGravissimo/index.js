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

function formatXAxisDate(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

export default function ModalAlmocoGravissimo({ open, payload, onClose }) {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);

  async function load() {
    if (!payload) return;

    const dayISO = payload.dayISO;

    const data_ini = dayISO || payload?.filters?.data_ini;
    const data_fim = dayISO || payload?.filters?.data_fim;

    if (!data_ini || !data_fim) {
      setResp({ items: [], error: "Filtro de datas ausente (data_ini/data_fim)." });
      return;
    }

    const params = {
      data_ini,
      data_fim,
      ...(payload?.filters?.usuario_key ? { usuario_key: payload.filters.usuario_key } : {}),
      ...(payload?.filters?.motorista ? { motorista: payload.filters.motorista } : {}),
      ...(payload?.filters?.rota ? { rota: payload.filters.rota } : {}),
      page: 1,
      page_size: 200, // <= 200
    };

    setLoading(true);
    try {
      const r = await apiLocal.getAnaliseRotasDetalheEventos({
  ...params,
  event_type: "gravissimo",
});

      setResp(r?.data || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payload?.dayISO, payload?.filters?.usuario_key]);

  if (!open) return null;

  const items = Array.isArray(resp?.items) ? resp.items : [];

  return (
    <ModalBackdrop>
      <ModalCard>
        <TwoCols>
          <div>
            <ModalTitle>
              Finalizado sem lançar • Rota finalizada sem almoço{" "}
              {payload?.dayISO ? `• Dia ${formatXAxisDate(payload.dayISO)}` : ""}
            </ModalTitle>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
              <Badge $variant="danger">isso não pode acontecer</Badge>
            </div>
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
                <th>Última atividade</th>
              </tr>
            </THead>
            <tbody>
              {items.map((it) => (
                <TRow key={it.id}>
                  <TCell>{formatXAxisDate(it.data)}</TCell>
                  <TCell style={{ fontWeight: 900 }}>{it.rota}</TCell>
                  <TCell>{it.motorista || "-"}</TCell>
                  <TCell>
                    <Badge $variant="danger">{it.status_rota || "finalizada"}</Badge>
                  </TCell>
                  <TCell>{it.ultima_atividade || "-"}</TCell>
                </TRow>
              ))}

              {!loading && items.length === 0 && (
                <TRow>
                  <TCell colSpan={5} style={{ opacity: 0.8 }}>
                    Zero finalizadox sem lançar (aí sim!).
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
