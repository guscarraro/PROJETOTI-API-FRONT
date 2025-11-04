import React from "react";
import { Table } from "reactstrap";
import styled from "styled-components";
import { SmallMuted } from "../../style";

export default function InfoOcorren({ conferencia, ocorrencias }) {
  const evidences = Array.isArray(conferencia?.evidences) ? conferencia.evidences : [];
  const confBy = conferencia?.conferente || "-";
  const confAt = conferencia?.created_at
    ? new Date(conferencia.created_at).toLocaleString("pt-BR")
    : "—";
  const elapsed = Number(conferencia?.elapsed_seconds || conferencia?.elapsedSeconds || 0);

  function fmtTime(total) {
    const mm = String(Math.floor(total / 60)).padStart(2, "0");
    const ss = String(total % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  return (
    <CardWrap>
      <CardHeader>Informações da conferência</CardHeader>

      <MetaWrap>
        <MetaPill><strong>Conferente:</strong> {confBy}</MetaPill>
        <MetaPill><strong>Duração:</strong> {fmtTime(elapsed)}</MetaPill>
        <MetaPill><strong>Data/Hora:</strong> {confAt}</MetaPill>
      </MetaWrap>

      <SectionTitle>Imagens captadas</SectionTitle>
      {evidences.length === 0 ? (
        <SmallMuted>Nenhuma imagem registrada.</SmallMuted>
      ) : (
        <ShotsGrid>
          {evidences.map((src, idx) => (
            <Shot key={idx} title={`Evidência #${idx + 1}`}>
              {/* evita estourar layout; scroll horizontal geral está no container da tabela abaixo */}
              <img src={src} alt={`Evidência ${idx + 1}`} onClick={() => window.open(src, "_blank")} />
              <span className="tag">#{idx + 1}</span>
            </Shot>
          ))}
        </ShotsGrid>
      )}

      <SectionTitle style={{ marginTop: 16 }}>Ocorrências registradas</SectionTitle>
      {Array.isArray(ocorrencias) && ocorrencias.length > 0 ? (
        <ScrollX>
          <Table responsive hover borderless className="mb-0">
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Data/Hora</th>
                <th style={{ whiteSpace: "nowrap" }}>Tipo</th>
                <th>Detalhe</th>
                <th style={{ whiteSpace: "nowrap" }}>Item</th>
                <th style={{ whiteSpace: "nowrap" }}>EAN</th>
                <th style={{ whiteSpace: "nowrap" }}>Lote</th>
                <th style={{ whiteSpace: "nowrap" }}>Qtd</th>
                <th style={{ whiteSpace: "nowrap" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ocorrencias.map((o) => (
                <tr key={o.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {o.created_at ? new Date(o.created_at).toLocaleString("pt-BR") : "—"}
                  </td>
                  <td style={{ textTransform: "capitalize", fontWeight: 700 }}>{o.tipo}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{o.detalhe || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{o.item_cod || "—"}</td>
                  <td style={{ whiteSpace: "nowrap", fontFamily: "monospace" }}>{o.bar || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{o.lote || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{o.quantidade != null ? Number(o.quantidade) : "—"}</td>
                  <td style={{ whiteSpace: "nowrap", fontWeight: 700 }}>{o.status || "aberta"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollX>
      ) : (
        <SmallMuted>Nenhuma ocorrência registrada.</SmallMuted>
      )}
    </CardWrap>
  );
}

/* ===== styled ===== */

const CardWrap = styled.div`
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
    background: #fef3c7;
  border: 1px solid #fdba74;
  color: #9a3412;

  @media (prefers-color-scheme: dark) {
    border-color: rgba(255,255,255,0.08);
    background: #0f172a; /* slate-900 */
  }
`;

const CardHeader = styled.div`
  font-weight: 800;
  margin-bottom: 8px;
  color: #0f172a;

  @media (prefers-color-scheme: dark) {
    color: #e5e7eb;
  }
`;

const MetaWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  background: #eef2ff;  /* indigo-100 */
  color: #3730a3;       /* indigo-800 */
  border: 1px solid #c7d2fe;

  @media (prefers-color-scheme: dark) {
    background: rgba(99,102,241,0.15);
    color: #c7d2fe;
    border-color: rgba(199,210,254,0.3);
  }
`;

const SectionTitle = styled.div`
  margin-top: 6px;
  margin-bottom: 6px;
  font-weight: 700;
  color: #111827;

  @media (prefers-color-scheme: dark) {
    color: #e5e7eb;
  }
`;

const ShotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
`;

const Shot = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #fff;

  @media (prefers-color-scheme: dark) {
    border-color: rgba(255,255,255,0.08);
    background: #0b1220;
  }

  img {
    display: block;
    width: 100%;
    height: 92px;
    object-fit: cover;
    cursor: pointer;
  }

  .tag {
    position: absolute;
    left: 6px;
    top: 6px;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(0,0,0,0.65);
    color: #fff;
  }
`;

const ScrollX = styled.div`
  margin-top: 8px;
  overflow-x: auto;  /* scroll horizontal somente se necessário */
  border: 1px solid #fecaca;
  border-radius: 12px;
background: #fef3c7;
  @media (prefers-color-scheme: dark) {
    border-color: rgba(248,113,113,0.35);
  }

  table thead {
    background: #fee2e2;
    color: #7f1d1d;
    border-bottom: 1px solid #fecaca;
  }

  table tbody tr + tr {
    border-top: 1px solid #ffe4e6;
  }

  @media (prefers-color-scheme: dark) {
    table thead {
      background: rgba(248,113,113,0.12);
      color: #fecaca;
      border-bottom-color: rgba(248,113,113,0.35);
    }
    table tbody tr + tr {
      border-top-color: rgba(248,113,113,0.2);
    }
  }
`;
