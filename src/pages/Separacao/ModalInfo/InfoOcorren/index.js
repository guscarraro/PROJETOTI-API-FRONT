import React, { useCallback, useEffect, useState } from "react";
import { Table, Modal, ModalBody, Button } from "reactstrap";
import styled from "styled-components";
import { SmallMuted } from "../../style";

export default function InfoOcorren({ conferencia, ocorrencias }) {
  const evidences = Array.isArray(conferencia?.evidences) ? conferencia.evidences : [];
  const confBy = conferencia?.conferente || "-";
  const confAt = conferencia?.created_at
    ? new Date(conferencia.created_at).toLocaleString("pt-BR")
    : "—";
  const elapsed = Number(conferencia?.elapsed_seconds || conferencia?.elapsedSeconds || 0);

  // ---- Preview Modal (uma única) ----
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);

  const openPreview = useCallback((idx) => {
    if (!evidences || evidences.length === 0) return;
    const safeIdx = Math.max(0, Math.min(idx, evidences.length - 1));
    setPreviewIdx(safeIdx);
    setPreviewOpen(true);
  }, [evidences]);

  const closePreview = useCallback(() => setPreviewOpen(false), []);
  const nextImg = useCallback(() => {
    if (!evidences || evidences.length === 0) return;
    const n = (previewIdx + 1) % evidences.length;
    setPreviewIdx(n);
  }, [previewIdx, evidences]);

  const prevImg = useCallback(() => {
    if (!evidences || evidences.length === 0) return;
    const n = (previewIdx - 1 + evidences.length) % evidences.length;
    setPreviewIdx(n);
  }, [previewIdx, evidences]);

  // teclas: Esc fecha, ←/→ navega
  useEffect(() => {
    if (!previewOpen) return;
    function onKey(e) {
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowRight") nextImg();
      if (e.key === "ArrowLeft") prevImg();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen, nextImg, prevImg, closePreview]);

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
            <Shot
              key={idx}
              title={`Evidência #${idx + 1}`}
              $selected={previewOpen && previewIdx === idx}
              onClick={() => openPreview(idx)}
            >
              <img src={src} alt={`Evidência ${idx + 1}`} />
              <span className="tag">#{idx + 1}</span>
              <SelectHint className="hint">Clique para ampliar</SelectHint>
            </Shot>
          ))}
        </ShotsGrid>
      )}

      {/* Modal Única de Preview */}
      <Modal
        isOpen={previewOpen}
        toggle={closePreview}
        size="xl"
        centered
        contentClassName="shadow-lg"
        backdrop
        scrollable
      >
        <ModalBody style={{ padding: 0 }}>
          <PreviewWrap onClick={closePreview}>
            <div className="toolbar" onClick={(e) => e.stopPropagation()}>
              <span>
                {evidences.length > 0 ? `Imagem ${previewIdx + 1} de ${evidences.length}` : "—"}
              </span>
              <div className="actions">
                <Button size="sm" color="secondary" onClick={prevImg} title="Anterior (←)">
                  ←
                </Button>
                <Button size="sm" color="secondary" onClick={nextImg} title="Próxima (→)">
                  →
                </Button>
                {evidences[previewIdx] && (
                  <a
                    href={evidences[previewIdx]}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-dark"
                    title="Abrir em nova guia"
                    style={{ marginLeft: 6 }}
                  >
                    Abrir em nova guia
                  </a>
                )}
                <Button
                  size="sm"
                  color="danger"
                  onClick={closePreview}
                  title="Fechar (Esc)"
                  style={{ marginLeft: 6 }}
                >
                  Fechar
                </Button>
              </div>
            </div>

            <div className="stage" onClick={(e) => e.stopPropagation()}>
              {evidences[previewIdx] ? (
                <img src={evidences[previewIdx]} alt={`Evidência ${previewIdx + 1}`} />
              ) : null}

              {/* botões flutuantes de navegação (clique) */}
              {evidences.length > 1 && (
                <>
                  <NavBtnLeft onClick={prevImg} title="Anterior (←)">‹</NavBtnLeft>
                  <NavBtnRight onClick={nextImg} title="Próxima (→)">›</NavBtnRight>
                </>
              )}
            </div>
          </PreviewWrap>
        </ModalBody>
      </Modal>

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
  border: 1px solid ${p => (p.$selected ? "#60a5fa" : "#e5e7eb")};
  background: #fff;
  box-shadow: ${p => (p.$selected ? "0 0 0 2px rgba(59,130,246,.25) inset" : "none")};
  cursor: zoom-in;

  @media (prefers-color-scheme: dark) {
    border-color: ${p => (p.$selected ? "rgba(96,165,250,.7)" : "rgba(255,255,255,0.08)")};
    background: #0b1220;
  }

  img {
    display: block;
    width: 100%;
    height: 92px;
    object-fit: cover;
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

const SelectHint = styled.span`
  position: absolute;
  right: 6px;
  bottom: 6px;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.9);
  color: #111827;

  @media (prefers-color-scheme: dark) {
    background: rgba(0,0,0,0.55);
    color: #e5e7eb;
  }
`;

const PreviewWrap = styled.div`
  position: relative;
  background: #0b0f19;
height: calc(100vh - 120px); 
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0;

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px;
    color: #e5e7eb;
    background: rgba(15, 23, 42, 0.9);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .stage {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    overflow: auto;
  }

  .stage img {
 max-width: 100%;
 max-height: 100%;               /* << usa toda a altura disponível */
 height: auto;                   /* << mantém proporção */
 width: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,.45);
    background: #000;
  }
`;

const NavBtnLeft = styled.button`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 0;
  background: rgba(255,255,255,0.85);
  color: #111827;
  font-size: 22px;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:hover { background: #fff; }
`;

const NavBtnRight = styled(NavBtnLeft)`
  left: auto;
  right: 10px;
`;

const ScrollX = styled.div`
  margin-top: 8px;
  overflow-x: auto;
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
