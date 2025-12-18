import React, { useMemo } from "react";
import { ModalBackdrop, ModalCard, ModalTitle, CloseBtn, Table, THead, TRow, TCell } from "../style";

function formatXAxisDate(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

function sortByDateAsc(a, b) {
  return String(a?.data || "").localeCompare(String(b?.data || ""));
}

function toPtWeekday(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return "-";

  // aceita "Monday", "monday", "Mon", etc.
  if (s.startsWith("mon")) return "Segunda";
  if (s.startsWith("tue")) return "Terça";
  if (s.startsWith("wed")) return "Quarta";
  if (s.startsWith("thu")) return "Quinta";
  if (s.startsWith("fri")) return "Sexta";
  if (s.startsWith("sat")) return "Sábado";
  if (s.startsWith("sun")) return "Domingo";

  // se vier número 0-6 (caso algum backend mande)
  const n = Number(s);
  if (!Number.isNaN(n)) {
    // comum: 0=Domingo ... 6=Sábado
    const map = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return map[n] || "-";
  }

  return v; // fallback
}

export default function ModalPossiveisFaltas({ open, payload, onClose }) {
  const items = useMemo(() => {
    const arr = Array.isArray(payload?.items) ? payload.items.slice() : [];
    arr.sort(sortByDateAsc);
    return arr;
  }, [payload]);

  if (!open) return null;

  const titleUser = payload?.usuario_label || payload?.usuario_key || "-";
  const dayTitle = payload?.day ? formatXAxisDate(payload.day) : "";

  return (
    <ModalBackdrop onMouseDown={onClose}>
      <ModalCard onMouseDown={(e) => e.stopPropagation()} style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <ModalTitle>
              Possíveis faltas (algoritmo) • {titleUser}
              {dayTitle ? ` • ${dayTitle}` : ""}
            </ModalTitle>

            {/* Aviso roxo/azul */}
            <div
              style={{
                marginTop: 10,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(99,102,241,0.25)",
                background: "rgba(99,102,241,0.12)",
                color: "inherit",
                fontSize: 12,
                lineHeight: 1.35,
              }}
            >
              <strong style={{ color: "#6366f1" }}>Sugestão:</strong>{" "}
              após a análise dos dados das <strong>datas filtradas</strong>, pode ser que esteja faltando o{" "}
              <strong>lançamento</strong> da rota <strong>X</strong> ou <strong>Y</strong> no Performaxxi.
              <span style={{ opacity: 0.8 }}> (Somente conferência — sem ação direta aqui.)</span>
            </div>
          </div>

          <CloseBtn type="button" onClick={onClose}>
            ✕
          </CloseBtn>
        </div>

        <div style={{ marginTop: 12 }}>
          <Table>
            <THead>
              <tr>
                <th>Data</th>
                <th>Dia da semana</th>
                <th>Rota</th>
                <th>Padrão detectado</th>
                <th>Histórico</th>
              </tr>
            </THead>

            <tbody>
              {items.map((m, idx) => {
                const pat = Array.isArray(m.pattern_weekdays)
                  ? m.pattern_weekdays.map(toPtWeekday).join(", ")
                  : "-";

                const hist =
                  m?.hist_range?.start && m?.hist_range?.end
                    ? `${formatXAxisDate(m.hist_range.start)} → ${formatXAxisDate(m.hist_range.end)}`
                    : "-";

                return (
                  <TRow key={`${m.usuario_key}-${m.data}-${m.rota}-${idx}`}>
                    <TCell>{formatXAxisDate(m.data)}</TCell>
                    <TCell>{toPtWeekday(m.weekday)}</TCell>
                    <TCell>{m.rota || "-"}</TCell>
                    <TCell style={{ opacity: 0.9 }}>{pat}</TCell>
                    <TCell style={{ opacity: 0.75 }}>{hist}</TCell>
                  </TRow>
                );
              })}

              {items.length === 0 && (
                <tr>
                  <TCell colSpan={5} style={{ opacity: 0.8, padding: 14 }}>
                    Nenhuma sugestão para esse dia/usuário.
                  </TCell>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </ModalCard>
    </ModalBackdrop>
  );
}
