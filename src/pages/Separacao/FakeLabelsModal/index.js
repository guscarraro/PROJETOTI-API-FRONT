import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import styled from "styled-components";

// === DADOS QUE VOCÊ PEDIU (2 linhas) ===
const DATA = [
  { cod_prod: "32007 x", lote: "OBBJV", ean: "AS100129001501", qtde: 5 },
  { cod_prod: "F 19033", lote: "OGASJ", ean: "19011435001068", qtde: 2 },
];

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  @media (max-width: 700px){ grid-template-columns: 1fr; }
`;

const LabelBox = styled.div`
  border: 1px dashed #222;
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 10px;
  background: #fff;

  [data-theme="dark"] & {
    background: #0f172a;
    border-color: rgba(255,255,255,.35);
  }
`;

const RowBox = styled.div`
  display: grid;
  gap: 4px;
`;

const Caption = styled.div`
  font: 600 12px/1.2 Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  opacity: .9;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 140px 140px;
  gap: 8px;
  margin-bottom: 12px;

  @media (max-width: 700px){
    grid-template-columns: 1fr 1fr;
  }
`;

const Field = styled.input`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 10px;
  background: #fff;
  color: #111827;
  outline: none;
  &:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,.35); }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.12);
  }
`;

const Hint = styled.small`
  display: block;
  opacity: .75;
  margin-top: -4px;
`;

const PrintStyles = () => (
  <style>{`
    @media print {
      @page { size: A4; margin: 8mm; }

      html, body { background: #fff !important; }
      body * { visibility: hidden !important; }

      .modal.show .print-scope,
      .modal.show .print-scope * { visibility: visible !important; }

      .modal.show .print-scope {
        position: absolute;
        inset: 0;
        padding: 8mm;
        background: #fff;
      }

      .modal-backdrop { display: none !important; }
      .modal.show .modal-content { border: none !important; box-shadow: none !important; }

      .print-hide { display: none !important; }
    }

    svg { max-width: 100%; height: auto; }
  `}</style>
);

// Carrega JsBarcode via CDN (uma vez)
function useJsBarcode() {
  const [ready, setReady] = useState(!!window.JsBarcode);
  useEffect(() => {
    if (window.JsBarcode) { setReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
    s.async = true;
    s.onload = () => setReady(true);
    s.onerror = () => setReady(false);
    document.head.appendChild(s);
  }, []);
  return ready;
}

export default function FakeLabelsModal({ isOpen, onClose }) {
  const ready = useJsBarcode();

  // controles de tamanho
  const [barHeight, setBarHeight] = useState(60);
  const [barWidth, setBarWidth]   = useState(2);

  // 2 etiquetas (uma por item)
  const labels = useMemo(() => DATA, []);

  // refs dos 4 códigos por etiqueta: { [idx]: { cod_prod: SVG, lote: SVG, ean: SVG, qtde: SVG } }
  const svgRefs = useRef({});

  // desenha códigos quando abrir/ajustar
  useEffect(() => {
    if (!isOpen || !ready || !window.JsBarcode) return;

    for (let i = 0; i < labels.length; i++) {
      const refs = svgRefs.current[i] || {};
      const cfg = {
        format: "CODE128",
        displayValue: true,
        fontSize: 12,
        width: Math.max(1, Number(barWidth) || 2),
        height: Math.max(30, Number(barHeight) || 60),
        margin: 0,
      };

      // cod_prod
      const valCodProd = String(labels[i].cod_prod || "").trim();
      if (refs.cod_prod && valCodProd) {
        try { window.JsBarcode(refs.cod_prod, valCodProd, cfg); } catch {}
      }

      // lote
      const valLote = String(labels[i].lote || "").trim();
      if (refs.lote && valLote) {
        try { window.JsBarcode(refs.lote, valLote, cfg); } catch {}
      }

      // ean (pode ter letras/números → mantém CODE128)
      const valEan = String(labels[i].ean || "").trim();
      if (refs.ean && valEan) {
        try { window.JsBarcode(refs.ean, valEan, cfg); } catch {}
      }

      // qtde (vira código também, conforme pedido)
      const valQtde = String(labels[i].qtde ?? "").trim();
      if (refs.qtde && valQtde) {
        try { window.JsBarcode(refs.qtde, valQtde, cfg); } catch {}
      }
    }
  }, [isOpen, ready, labels, barHeight, barWidth]);

  return (
    <Modal
      isOpen={!!isOpen}
      toggle={onClose}
      size="lg"
      contentClassName="project-modal"
      backdrop="static"
    >
      <PrintStyles />
      <ModalHeader toggle={onClose}>Etiquetas — 2 linhas (uma etiqueta por linha)</ModalHeader>

      <ModalBody>
        <div className="print-hide">
          <FormRow>
            <Field
              placeholder="Altura (px)"
              type="number"
              value={barHeight}
              onChange={(e)=>setBarHeight(e.target.value)}
            />
            <Field
              placeholder="Espessura"
              type="number"
              value={barWidth}
              onChange={(e)=>setBarWidth(e.target.value)}
            />
          </FormRow>
          <Hint>Gero 4 códigos de barras por etiqueta: <b>cod_prod</b>, <b>lote</b>, <b>ean</b> e <b>qtde</b> (Code128).</Hint>
          <hr />
        </div>

        {/* Área impressa */}
        <div className="print-scope">
          <Grid>
            {labels.map((row, idx) => (
              <LabelBox key={idx}>
                <RowBox>
                  <Caption>cod_prod: {row.cod_prod}</Caption>
                  {ready ? (
                    <svg ref={(el) => {
                      if (!svgRefs.current[idx]) svgRefs.current[idx] = {};
                      svgRefs.current[idx].cod_prod = el;
                    }} />
                  ) : <div>Carregando JsBarcode…</div>}
                </RowBox>

                <RowBox>
                  <Caption>lote: {row.lote}</Caption>
                  {ready ? (
                    <svg ref={(el) => {
                      if (!svgRefs.current[idx]) svgRefs.current[idx] = {};
                      svgRefs.current[idx].lote = el;
                    }} />
                  ) : <div>Carregando JsBarcode…</div>}
                </RowBox>

                <RowBox>
                  <Caption>ean: {row.ean}</Caption>
                  {ready ? (
                    <svg ref={(el) => {
                      if (!svgRefs.current[idx]) svgRefs.current[idx] = {};
                      svgRefs.current[idx].ean = el;
                    }} />
                  ) : <div>Carregando JsBarcode…</div>}
                </RowBox>

                <RowBox>
                  <Caption>qtde: {row.qtde}</Caption>
                  {ready ? (
                    <svg ref={(el) => {
                      if (!svgRefs.current[idx]) svgRefs.current[idx] = {};
                      svgRefs.current[idx].qtde = el;
                    }} />
                  ) : <div>Carregando JsBarcode…</div>}
                </RowBox>
              </LabelBox>
            ))}
          </Grid>
        </div>
      </ModalBody>

      <ModalFooter className="print-hide">
        <Button color="secondary" onClick={onClose}>Fechar</Button>
        <Button color="primary" onClick={() => window.print()}>Imprimir</Button>
      </ModalFooter>
    </Modal>
  );
}
