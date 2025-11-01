import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import styled from "styled-components";

const FIXED_CODE = "123456789012";

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
  gap: 8px;
  align-items: center;
  justify-items: center;
  background: #fff;

  [data-theme="dark"] & {
    background: #0f172a;
    border-color: rgba(255,255,255,.35);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 200px 110px 110px;
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

      /* Esconde tudo por padrão */
      html, body { background: #fff !important; }
      body * { visibility: hidden !important; }

      /* Só mostra a área de impressão dentro da MODAL aberta */
      .modal.show .print-scope,
      .modal.show .print-scope * { visibility: visible !important; }

      /* Posição e layout da área de impressão ocupando a página */
      .modal.show .print-scope {
        position: absolute;
        inset: 0;
        padding: 8mm;
        background: #fff;
      }

      /* Remove backdrop e moldura da modal na impressão */
      .modal-backdrop { display: none !important; }
      .modal.show .modal-content { border: none !important; box-shadow: none !important; }

      /* Some com controles que não devem aparecer no papel */
      .print-hide { display: none !important; }
    }

    .barcode-caption {
      font: 700 12px/1.2 Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      text-align: center;
      opacity: .85;
    }
    svg { max-width: 100%; height: auto; }
  `}</style>
);

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

  const [qty, setQty] = useState(3);
  const [barHeight, setBarHeight] = useState(60);
  const [barWidth,   setBarWidth]   = useState(2);

  const seq = useMemo(() => {
    const n = Math.max(1, Number(qty) || 1);
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [qty]);

  const svgRefs = useRef({}); // {idx: SVGSVGElement}

  useEffect(() => {
    if (!isOpen || !ready || !window.JsBarcode) return;
    for (let i = 0; i < seq.length; i++) {
      const ref = svgRefs.current[i];
      if (ref && ref instanceof SVGSVGElement) {
        try {
          window.JsBarcode(ref, FIXED_CODE, {
            format: "CODE128",
            displayValue: true,
            fontSize: 12,
            width: Math.max(1, Number(barWidth) || 2),
            height: Math.max(30, Number(barHeight) || 60),
            margin: 0,
          });
        } catch {}
      }
    }
  }, [isOpen, ready, seq, barHeight, barWidth]);

  return (
    <Modal
      isOpen={!!isOpen}
      toggle={onClose}
      size="lg"
      contentClassName="project-modal"
      backdrop="static"
    >
      <PrintStyles />
      <ModalHeader toggle={onClose}>Etiquetas — Código {FIXED_CODE}</ModalHeader>

      <ModalBody>
        <div className="print-hide">
          <FormRow>
            <Field
              placeholder="Quantidade"
              type="number"
              value={qty}
              onChange={(e)=>setQty(e.target.value)}
            />
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
          <Hint>O código impresso será sempre {FIXED_CODE}. Ajuste só a quantidade e o tamanho, se quiser.</Hint>
          <hr />
        </div>

        {/* ÁREA EXATA QUE VAI PARA A IMPRESSÃO */}
        <div className="print-scope">
          <Grid>
            {seq.map((i) => (
              <LabelBox key={i}>
                {ready ? (
                  <svg ref={(el)=>{ svgRefs.current[i-1]=el; }} />
                ) : (
                  <div style={{ padding: 10, border: "1px solid rgba(0,0,0,.2)", borderRadius: 8, fontSize: 12 }}>
                    Código: <strong>{FIXED_CODE}</strong> (carregando JsBarcode)
                  </div>
                )}
                <div className="barcode-caption">{FIXED_CODE}</div>
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
