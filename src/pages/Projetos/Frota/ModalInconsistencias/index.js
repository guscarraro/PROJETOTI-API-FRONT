import React, { useEffect, useMemo, useState } from "react";
import apiLocal from "../../../../services/apiLocal";
import ModalJustificativa from "../ModalJustificativa";
import {
  ModalBackdrop,
  ModalCard,
  ModalTitle,
  CloseBtn,
  Table,
  THead,
  TRow,
  TCell,
  Badge,
  SmallButton,
} from "../style";

function formatXAxisDate(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

const SORT_OPTIONS = [
  { value: "tempo_desc", label: "Tempo (maior → menor)" },
  { value: "tempo_asc", label: "Tempo (menor → maior)" },
  { value: "rota_asc", label: "Rota (A → Z)" },
  { value: "motorista_asc", label: "Motorista (A → Z)" },
  { value: "placa_asc", label: "Placa (A → Z)" },
  { value: "status_asc", label: "Status (A → Z)" },
];

export default function ModalInconsistencias({ open, payload, actor, onClose, onSaved }) {
  const [selectedId, setSelectedId] = useState(null);
  const [justOpen, setJustOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);

  const [sort, setSort] = useState("tempo_desc");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const rawItems = useMemo(() => {
    return Array.isArray(result?.items) ? result.items : [];
  }, [result]);

  const items = useMemo(() => {
    const arr = rawItems.slice();

    function s(v) {
      return String(v || "").toLowerCase();
    }

    arr.sort((a, b) => {
      if (sort === "tempo_desc") return Number(b.tempo_almoco_min || 0) - Number(a.tempo_almoco_min || 0);
      if (sort === "tempo_asc") return Number(a.tempo_almoco_min || 0) - Number(b.tempo_almoco_min || 0);
      if (sort === "rota_asc") return s(a.nome_rota).localeCompare(s(b.nome_rota));
      if (sort === "motorista_asc") return s(a.nome_funcionario).localeCompare(s(b.nome_funcionario));
      if (sort === "placa_asc") return s(a.placa_mobilemaxxi).localeCompare(s(b.placa_mobilemaxxi));
      if (sort === "status_asc") return s(a.status_ajuste).localeCompare(s(b.status_ajuste));
      return 0;
    });

    return arr;
  }, [rawItems, sort]);

  const total = Number(result?.total || 0);
  const totalPages = Math.max(1, Number(result?.total_pages || Math.ceil(total / pageSize)));

  function openJust(id) {
    setSelectedId(id);
    setJustOpen(true);
  }

  function closeJust() {
    setJustOpen(false);
    setSelectedId(null);
  }

  async function loadPage(p) {
    if (!payload?.usuario_key || !payload?.day) return;

    setLoading(true);
    try {
      const resp = await apiLocal.getHorarioAlmocoInconsistencias({
        usuario_key: payload.usuario_key,
        data: payload.day,
        min_ok: payload.min_ok ?? 60,
        max_ok: payload.max_ok ?? 90,
        page: p,
        page_size: pageSize,
        ...(payload?.filters?.motorista ? { motorista: payload.filters.motorista } : {}),
        ...(payload?.filters?.placa ? { placa: payload.filters.placa } : {}),
        ...(payload?.filters?.rota ? { rota: payload.filters.rota } : {}),
      });

      setResult(resp?.data || null);

      const serverPage = Number(resp?.data?.page || p);
      if (serverPage !== p) setPage(serverPage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setSort("tempo_desc");
    setResult(null);
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payload?.usuario_key, payload?.day]);

  if (!open) return null;

  const titleUser = result?.usuario_label || payload?.usuario_label || payload?.usuario_key || "-";
  const rangeLabel = total > 0 ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} de ${total}` : "";

  return (
    <>
      <ModalBackdrop onMouseDown={loading ? undefined : onClose}>
        <ModalCard onMouseDown={(e) => e.stopPropagation()} style={{ position: "relative" }}>
          {/* loading overlay */}
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.25)",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                backdropFilter: "blur(2px)",
              }}
            >
              <div
                style={{
                  padding: "12px 18px",
                  background: "rgba(0,0,0,0.55)",
                  border: "1px solid rgba(148,163,184,0.20)",
                  borderRadius: 999,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                  fontWeight: 900,
                  color: "inherit",
                }}
              >
                Carregando...
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <ModalTitle>
                Inconsistências • {titleUser} • {formatXAxisDate(payload?.day)}
              </ModalTitle>

              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                Regra: aceitável <strong>{payload?.min_ok}</strong>.. <strong>{payload?.max_ok}</strong> min (Ajustado
                some)
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  Total: <strong>{total}</strong> • Página <strong>{page}</strong>/<strong>{totalPages}</strong>
                  {rangeLabel ? <span style={{ marginLeft: 10 }}>({rangeLabel})</span> : null}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>Ordenar:</div>

                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    disabled={loading}
                    style={{
                      height: 34,
                      borderRadius: 10,
                      border: "1px solid var(--border, #e5e7eb)",
                      background: "var(--bg-panel-2, #fafafa)",
                      color: "inherit",
                      padding: "0 10px",
                      outline: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <CloseBtn type="button" onClick={onClose} disabled={loading}>
              ✕
            </CloseBtn>
          </div>

          <div style={{ marginTop: 12 }}>
            <Table>
              <THead>
                <tr>
                  <th>Rota</th>
                  <th>Placa</th>
                  <th>Motorista</th>
                  <th>Tempo</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </THead>

              <tbody>
                {items.map((r, idx) => {
                  const st = String(r.status_ajuste || "").trim();
                  const isAdj = st === "Ajustado";

                  const badge = isAdj ? (
                    <Badge $variant="ok">Ajustado</Badge>
                  ) : st ? (
                    <Badge $variant="warn">{st}</Badge>
                  ) : (
                    <Badge $variant="danger">Pendente</Badge>
                  );

                  return (
                    <TRow key={`${r.id}-${idx}`}>
                      <TCell>{r.nome_rota || "-"}</TCell>
                      <TCell>{r.placa_mobilemaxxi || "-"}</TCell>
                      <TCell>{r.nome_funcionario || "-"}</TCell>
                      <TCell>
                        <strong>{r.tempo_almoco_min ?? "-"}</strong> min
                      </TCell>
                      <TCell style={{ opacity: 0.92 }}>
                        {r.tipo_inconsistencia === "abaixo" ? "Abaixo do mínimo" : "Acima do máximo"}
                      </TCell>
                      <TCell>{badge}</TCell>
                      <TCell>
                        <SmallButton type="button" onClick={() => openJust(r.id)} disabled={loading}>
                          Justificar
                        </SmallButton>
                      </TCell>
                    </TRow>
                  );
                })}

                {!loading && items.length === 0 && (
                  <tr>
                    <TCell colSpan={7} style={{ opacity: 0.8, padding: 14 }}>
                      Sem itens nessa página (ou tudo foi Ajustado / filtrado).
                    </TCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* paginação */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <SmallButton
                type="button"
                onClick={() => {
                  const p = Math.max(1, page - 1);
                  setPage(p);
                  loadPage(p);
                }}
                disabled={loading || page <= 1}
              >
                ◀ Anterior
              </SmallButton>

              <SmallButton
                type="button"
                onClick={() => {
                  const p = Math.min(totalPages, page + 1);
                  setPage(p);
                  loadPage(p);
                }}
                disabled={loading || page >= totalPages}
              >
                Próxima ▶
              </SmallButton>
            </div>
          </div>
        </ModalCard>
      </ModalBackdrop>

      <ModalJustificativa
        open={justOpen}
        rowId={selectedId}
        actor={actor}
        onClose={closeJust}
        onSaved={async () => {
          closeJust();
          await onSaved?.();
          await loadPage(page);
        }}
      />
    </>
  );
}
