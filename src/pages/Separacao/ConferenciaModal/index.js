import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from "reactstrap";
import { Wrap, Controls, Shots, ShotThumb, Tag, ProgressPill } from "./style";
import { Row, Field, SmallMuted } from "../style";
import BenchPhoto from "./BenchPhoto";
import ItemScanner from "./ItemScanner";

const COLOR_EXC = "#f59e0b";

export default function ConferenciaModal({ isOpen, onClose, pedido, onConfirm }) {
  const [conferente, setConferente] = useState("");
  const [phase, setPhase] = useState("foto"); // "foto" | "scan" | "fim"
  const [benchShot, setBenchShot] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const [linhasScan, setLinhasScan] = useState([]);
  const [foraLista, setForaLista] = useState([]); // {bar, count}
  const [justificativa, setJustificativa] = useState("");

  const linhasInicial = useMemo(() => {
    const arr = [];
    const itens = Array.isArray(pedido?.itens) ? pedido.itens : [];
    for (let i = 0; i < itens.length; i++) {
      const it = itens[i] || {};
      const bc = String(it.bar_code || it.cod_prod || "").trim();
      arr.push({
        cod: String(it.cod_prod || "").trim(),
        bar: bc,
        um: it.um_med || "",
        qtd: Number(it.qtde || 0),
        scanned: 0
      });
    }
    return arr;
  }, [pedido]);

  useEffect(() => {
    if (!isOpen) return;
    setConferente("");
    setBenchShot(null);
    setLinhasScan(linhasInicial);
    setForaLista([]);
    setJustificativa("");
    setPhase(Number(pedido?.volumes || 0) < 50 ? "foto" : "scan");
    setScanLoading(false);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [isOpen, linhasInicial, pedido]);

  // cronômetro
  useEffect(() => {
    if (phase === "scan") {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase]);

  const requireBench = (Number(pedido?.volumes || 0) < 50);

  const expectedBars = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < linhasScan.length; i++) {
      const bar = String(linhasScan[i].bar || "").trim();
      if (bar) set.add(bar);
    }
    return Array.from(set);
  }, [linhasScan]);

  const allOk = useMemo(() => {
    for (let i = 0; i < linhasScan.length; i++) {
      if (Number(linhasScan[i].scanned || 0) < Number(linhasScan[i].qtd || 0)) return false;
    }
    return linhasScan.length > 0;
  }, [linhasScan]);

  const temExcedido = useMemo(() => {
    for (let i = 0; i < linhasScan.length; i++) {
      if (Number(linhasScan[i].scanned || 0) > Number(linhasScan[i].qtd || 0)) return true;
    }
    return false;
  }, [linhasScan]);
  const precisaJust = (foraLista.length > 0) || temExcedido;
  const podeSalvar = (conferente.trim().length > 0) && allOk && (!precisaJust || justificativa.trim().length > 0);

  // >>>>>>> FIX: usar state updater para não perder contagens em leituras rápidas
  async function onScan(barcode) {
    if (!barcode) return;
    setScanLoading(true);

    // incrementa nas linhas que batem
    setLinhasScan(prev => {
      const next = [];
      let matched = false;
      for (let i = 0; i < prev.length; i++) {
        const r = prev[i];
        if (String(r.bar || "").trim() === String(barcode).trim()) {
          const prevCount = Number(r.scanned || 0);
          next.push({ ...r, scanned: prevCount + 1 }); // SEM teto: marca excedido
          matched = true;
        } else {
          next.push(r);
        }
      }

      // se não pertence à lista, contabiliza separado
      if (!matched) {
        setForaLista(curr => {
          const arr = [];
          let found = false;
          for (let j = 0; j < curr.length; j++) {
            const it = curr[j];
            if (String(it.bar || "").trim() === String(barcode).trim()) {
              arr.push({ bar: it.bar, count: Number(it.count || 0) + 1 });
              found = true;
            } else arr.push(it);
          }
          if (!found) arr.push({ bar: String(barcode).trim(), count: 1 });
          return arr;
        });
      }

      return next;
    });

    await new Promise(r => setTimeout(r, 140));
    setScanLoading(false);
  }
  // <<<<<<<< FIX

  function onBenchPhotoDone(imgDataUrl) {
    setBenchShot(imgDataUrl);
    setPhase("scan");
  }

  function confirm() {
    if (!podeSalvar) return;
    const scanMap = {};
    for (let i = 0; i < linhasScan.length; i++) {
      const k = linhasScan[i].bar || linhasScan[i].cod;
      scanMap[k] = Number(linhasScan[i].scanned || 0);
    }
    onConfirm({
      conferente: String(conferente || "").trim(),
      elapsedSeconds: elapsed,
      benchPhoto: benchShot || null,
      scans: scanMap,
      foraLista: foraLista.slice(),
      justificativa: precisaJust ? justificativa.trim() : null,
    });
  }

  function fmtTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" contentClassName="project-modal">
      <ModalHeader toggle={onClose}>Conferência — Pedido #{pedido?.nr_pedido}</ModalHeader>
      <ModalBody>
        <Wrap>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            {/* Cabeçalho */}
            <div>
              <SmallMuted>Conferente</SmallMuted>
              <Row style={{ marginTop: 6, gap: 8, flexWrap: "wrap" }}>
                <Field
                  style={{ minWidth: 220, maxWidth: 320 }}
                  placeholder="Informe o nome do conferente"
                  value={conferente}
                  onChange={(e) => setConferente(e.target.value)}
                />
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {phase === "scan" ? `⏱ Tempo: ${fmtTime(elapsed)}` : "⏱ Aguardando início"}
                </div>
              </Row>
            </div>

            {/* Foto da bancada */}
            {phase === "foto" && Number(pedido?.volumes || 0) < 50 && (
              <div>
                <SmallMuted>Foto da bancada (câmera superior)</SmallMuted>
                <div style={{ marginTop: 8 }}>
                  <BenchPhoto onCapture={onBenchPhotoDone} />
                </div>
              </div>
            )}

            {/* Scanner */}
            {phase === "scan" && (
              <div>
                <SmallMuted>Leitura dos itens</SmallMuted>
                <div style={{ marginTop: 8 }}>
                  <ItemScanner
                    onScan={onScan}
                    loading={scanLoading}
                    expectedBars={expectedBars}
                  />
                </div>
              </div>
            )}

            {/* Lista de itens */}
            <div>
              <SmallMuted>Itens para conferir</SmallMuted>
              <Table responsive size="sm" className="mt-2">
                <thead>
                  <tr>
                    <th>Produto</th><th>Barcode</th><th>UM</th>
                    <th>Qtd</th><th>Lidos</th><th>Status</th><th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {linhasScan.length === 0 && (
                    <tr><td colSpan={7} style={{ opacity: .7 }}>Sem itens</td></tr>
                  )}
                  {linhasScan.map((r, idx) => {
                    const q = Number(r.qtd || 0);
                    const s = Number(r.scanned || 0);
                    const ok = s >= q;
                    const exced = s > q;
                    const rowStyle = scanLoading && !ok ? { background: "rgba(37,99,235,.08)" } : undefined;
                    return (
                      <tr key={idx} style={rowStyle}>
                        <td>{r.cod || "—"}</td>
                        <td>{r.bar || "—"}</td>
                        <td>{r.um || "—"}</td>
                        <td>{q}</td>
                        <td>{s}</td>
                        <td>
                          {exced ? (
                            <ProgressPill style={{ background: COLOR_EXC, color: "#111827" }}>excedido</ProgressPill>
                          ) : ok ? (
                            <ProgressPill data-ok="1">OK ✅</ProgressPill>
                          ) : (
                            <ProgressPill>pendente</ProgressPill>
                          )}
                        </td>
                        <td>
                          {(exced) && (
                            <Button size="sm" color="warning" onClick={() => { /* abrir ocorrência excedido */ }}>
                              Abrir ocorrência
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {/* Fora da lista */}
            {foraLista.length > 0 && (
              <div>
                <SmallMuted>Itens fora da lista</SmallMuted>
                <Table responsive size="sm" className="mt-2">
                  <thead>
                    <tr><th>Barcode</th><th>Lidos</th><th>Ação</th></tr>
                  </thead>
                  <tbody>
                    {foraLista.map((r, i) => (
                      <tr key={i} style={{ background: "rgba(239,68,68,.08)" }}>
                        <td>{r.bar}</td>
                        <td>{Number(r.count || 0)}</td>
                        <td>
                          <Button size="sm" color="danger" onClick={() => { /* abrir ocorrência fora da lista */ }}>
                            Abrir ocorrência
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Justificativa */}
            {precisaJust && (
              <div>
                <SmallMuted>Justificativa / Ocorrência</SmallMuted>
                <Field
                  as="textarea"
                  rows={3}
                  placeholder='Descreva o motivo (ex.: peça fora do pedido, embalagem com 12 unidades, etc.)'
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                />
              </div>
            )}

            {/* Miniatura da bancada */}
            {benchShot && (
              <Controls style={{ marginTop: 4 }}>
                <SmallMuted>Registro da bancada</SmallMuted>
                <Shots>
                  <ShotThumb>
                    <img src={benchShot} alt="bancada" />
                    <Tag>#1</Tag>
                  </ShotThumb>
                </Shots>
              </Controls>
            )}
          </div>
        </Wrap>
      </ModalBody>

      <ModalFooter style={{ flexWrap: "wrap", gap: 8 }}>
        <Button color="secondary" onClick={onClose}>Cancelar</Button>
        <Button color="primary" disabled={!podeSalvar} onClick={confirm}>
          Salvar conferência
        </Button>
      </ModalFooter>
    </Modal>
  );
}
