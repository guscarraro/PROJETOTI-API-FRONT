import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import {
  Wrap,
  BodyScroll,
  Controls,
  Shots,
  ShotThumb,
  Tag,
  HeadRow,
  ScannerWrap,
} from "./style";
import { Row, Field, SmallMuted } from "../style";
import BenchPhoto from "./BenchPhoto";
import ItemScanner from "./ItemScanner";
import ItemsTable from "./tables/ItemsTable";
import ForaListaTable from "./tables/ForaListaTable";
import OcorrenciasTable from "./tables/OcorrenciasTable";
import {
  modernTableStyles,
  occTableStyles,
  loteChipStyles,
} from "./tableStyles";

export default function ConferenciaModal({
  isOpen,
  onClose,
  pedido,
  onConfirm,
}) {
  const [phase, setPhase] = useState("setup");
  const [conferente, setConferente] = useState("");
  const [benchShots, setBenchShots] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const [linhas, setLinhas] = useState([]);
  const [foraLista, setForaLista] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [savingSubmit, setSavingSubmit] = useState(false);

  // === Input-sink para coletor (HID / DataWedge) — agora sem roubar foco ===
  const sinkRef = useRef(null);
  const bufferRef = useRef("");

  function isInteractive(el) {
    if (!el) return false;
    const t = (el.tagName || "").toLowerCase();
    return (
      t === "input" ||
      t === "textarea" ||
      t === "select" ||
      el.isContentEditable === true
    );
  }

  // Só foca o sink quando NÃO há um input/textarea/select focado.
  function keepFocus(force = false) {
    if (phase !== "scan") return;
    const ae = document.activeElement;
    if (!force && isInteractive(ae)) return;
    if (sinkRef.current) {
      try {
        sinkRef.current.focus({ preventScroll: true });
      } catch {}
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    // foca ao abrir
    setTimeout(() => keepFocus(true), 0);
  }, [isOpen]);

  useEffect(() => {
    // ao entrar na fase de scan, tenta focar o sink; se o usuário focar um input depois, não retomamos
    if (phase === "scan") setTimeout(() => keepFocus(true), 0);
  }, [phase]);

  function onSinkKeyDown(e) {
    // agrega caracteres do leitor quando o foco estiver no sink
    if (e.key === "Enter" || e.key === "Tab") {
      const code = bufferRef.current.trim();
      bufferRef.current = "";
      if (code) handleScanEAN(code);
      e.preventDefault();
      return;
    }
    if (e.key && e.key.length === 1) {
      bufferRef.current += e.key;
    }
  }
  // === FIM input-sink ===

  function toast(text, tone = "info") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  const linhasInicial = useMemo(() => {
    const arr = [];
    const itens = Array.isArray(pedido?.itens) ? pedido.itens : [];
    for (let i = 0; i < itens.length; i++) {
      const it = itens[i] || {};
      const bc = String(it.bar_code || it.cod_prod || "").trim();
      const lotesArr = Array.isArray(it.lotes)
        ? it.lotes.map((x) => String(x || "").trim()).filter(Boolean)
        : it.lote
        ? [String(it.lote).trim()]
        : [];
      arr.push({
        cod: String(it.cod_prod || "").trim(),
        bar: bc,
        um: it.um_med || "",
        qtd: Number(it.qtde || 0),
        scanned: 0,
        lotes: lotesArr,
        loteScans: {},
        warns: [],
      });
    }
    return arr;
  }, [pedido]);

  const indexByBar = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < linhas.length; i++) {
      const bar = String(linhas[i].bar || "").trim();
      if (bar && !map.has(bar)) map.set(bar, i);
    }
    return map;
  }, [linhas]);

  const indexesByLote = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < linhas.length; i++) {
      const lotes = Array.isArray(linhas[i].lotes) ? linhas[i].lotes : [];
      for (let j = 0; j < lotes.length; j++) {
        const l = String(lotes[j] || "").trim().toUpperCase();
        if (!l) continue;
        const arr = map.get(l) || [];
        arr.push(i);
        map.set(l, arr);
      }
    }
    return map;
  }, [linhas]);

  useEffect(() => {
    if (!isOpen) return;
    setPhase("setup");
    const confInicial = String(
      pedido?.conferente || pedido?.primeiraConferencia?.colaborador || ""
    ).trim();
    setConferente(confInicial);
    setBenchShots([]);
    setLinhas(linhasInicial);
    setForaLista([]);
    setOcorrencias([]);
    setToasts([]);
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [isOpen, linhasInicial, pedido]);

  useEffect(() => {
    if (phase === "scan") {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
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

  const expectedBars = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < linhas.length; i++) {
      const bar = String(linhas[i].bar || "").trim();
      if (bar) set.add(bar);
    }
    return Array.from(set);
  }, [linhas]);

  const totalSolic = useMemo(() => {
    let t = 0;
    for (let i = 0; i < linhas.length; i++) t += Number(linhas[i].qtd || 0);
    return t;
  }, [linhas]);

  const totalLidos = useMemo(() => {
    let t = 0;
    for (let i = 0; i < linhas.length; i++) t += Number(linhas[i].scanned || 0);
    return t;
  }, [linhas]);

  const concluidos = useMemo(() => {
    let c = 0;
    for (let i = 0; i < linhas.length; i++) {
      if (Number(linhas[i].scanned || 0) >= Number(linhas[i].qtd || 0)) c++;
    }
    return c;
  }, [linhas]);

  const pendentes = useMemo(
    () => Math.max(0, linhas.length - concluidos),
    [linhas, concluidos]
  );

  const allOk = useMemo(() => {
    for (let i = 0; i < linhas.length; i++) {
      if (Number(linhas[i].scanned || 0) < Number(linhas[i].qtd || 0))
        return false;
    }
    return linhas.length > 0;
  }, [linhas]);

  function fmtTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function handleBenchCapture(imgDataUrl) {
    if (!imgDataUrl) return;
    if (benchShots.length >= 7) {
      toast("Limite de 7 fotos atingido.", "warn");
      return;
    }
    setBenchShots((prev) => [...prev, imgDataUrl]);
  }

  function removeBenchShot(idx) {
    setBenchShots((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleScanEAN(code) {
    const barcode = String(code || "").trim();
    if (!barcode) return;
    const idx = indexByBar.get(barcode);
    if (idx == null) {
      setForaLista((curr) => {
        const out = [];
        let inc = false;
        for (let i = 0; i < curr.length; i++) {
          const it = curr[i];
          if (String(it.bar || "").trim() === barcode) {
            out.push({ bar: it.bar, count: Number(it.count || 0) + 1 });
            inc = true;
          } else out.push(it);
        }
        if (!inc) out.push({ bar: barcode, count: 1 });
        return out;
      });
      setOcorrencias((oc) => [
        ...oc,
        {
          tipo: "produto_divergente",
          detalhe: "Leitura de EAN que não pertence ao pedido.",
          bar: barcode,
          status: "aberta",
        },
      ]);
      toast("Produto fora da lista! Devolver material.", "error");
      return;
    }
    setLinhas((prev) => {
      const next = prev.slice();
      const r = next[idx];
      const qtdSolic = Number(r.qtd || 0);
      const atual = Number(r.scanned || 0);
      if (atual + 1 > qtdSolic) {
        r.warns = [...(r.warns || []), "Excedente lido. Devolver material."];
        toast(`Excedente no item ${r.cod}. Não contabilizado.`, "warn");
      } else {
        r.scanned = atual + 1;
      }
      next[idx] = r;
      return next;
    });
  }

  function handleScanLoteQuantidade({ lote, quantidade, ean }) {
    const loteStr = String(lote || "").trim().toUpperCase();
    const qtdN = Number(quantidade || 0);
    const eanStr = String(ean || "").trim();
    if (!loteStr || !qtdN || isNaN(qtdN) || qtdN <= 0) {
      toast("Lote/quantidade inválidos.", "error");
      return false;
    }
    const candidatos = indexesByLote.get(loteStr) || [];
    let targetIdx = null;
    if (eanStr) {
      const idx = indexByBar.get(eanStr);
      if (idx == null) {
        toast(`EAN ${eanStr} não pertence ao pedido.`, "error");
        setOcorrencias((oc) => [
          ...oc,
          {
            tipo: "produto_divergente",
            detalhe: "EAN informado no fluxo de lote não pertence ao pedido.",
            bar: eanStr,
            lote: loteStr,
            quantidade: qtdN,
            status: "aberta",
          },
        ]);
        return false;
      }
      if (candidatos.length > 0 && !candidatos.includes(idx)) {
        toast(`EAN não faz parte do lote ${loteStr} para este pedido.`, "error");
        setOcorrencias((oc) => [
          ...oc,
          {
            tipo: "lote_errado",
            detalhe: `EAN não compatível com o lote ${loteStr}.`,
            itemCod: linhas[idx]?.cod,
            lote: loteStr,
            quantidade: qtdN,
            bar: eanStr,
            status: "aberta",
          },
        ]);
        return false;
      }
      targetIdx = idx;
    } else {
      if (candidatos.length === 0) {
        toast(`Lote ${loteStr} não encontrado nos itens.`, "error");
        return false;
      }
      if (candidatos.length > 1) {
        toast(
          `Lote ${loteStr} é usado por múltiplos itens. Bipe o EAN para desambiguar.`,
          "warn"
        );
        setOcorrencias((oc) => [
          ...oc,
          {
            tipo: "lote_ambiguidade",
            detalhe: `Lote ${loteStr} pertence a vários itens. É necessário informar EAN.`,
            lote: loteStr,
            quantidade: qtdN,
            status: "aberta",
          },
        ]);
        return false;
      }
      targetIdx = candidatos[0];
    }
    let abateu = false;
    setLinhas((prev) => {
      const next = prev.slice();
      const r = { ...(next[targetIdx] || {}) };
      const qtdSolic = Number(r.qtd || 0);
      const atual = Number(r.scanned || 0);
      if (atual >= qtdSolic) {
        r.warns = [
          ...(r.warns || []),
          "Tentativa de excedente via lote. Devolver material.",
        ];
        setOcorrencias((oc) => [
          ...oc,
          {
            tipo: "excedente_lote",
            detalhe: `Excedente via lote "${loteStr}" (não abatido).`,
            itemCod: r.cod,
            lote: loteStr,
            quantidade: qtdN,
            status: "aberta",
          },
        ]);
        toast(`Item ${r.cod} já completo. Excedente ignorado.`, "warn");
      } else {
        const disponivel = Math.max(0, qtdSolic - atual);
        const abatido = Math.min(disponivel, qtdN);
        if (abatido > 0) abateu = true;
        const novoLotes = { ...(r.loteScans || {}) };
        const key = loteStr || `lote_${Object.keys(novoLotes).length + 1}`;
        const prevVal = Number(novoLotes[key] || 0);
        novoLotes[key] = prevVal + abatido;
        r.scanned = atual + abatido;
        r.loteScans = novoLotes;
        if (qtdN > disponivel) {
          r.warns = [
            ...(r.warns || []),
            "Excedente no lote. Devolver material.",
          ];
          setOcorrencias((oc) => [
            ...oc,
            {
              tipo: "excedente_lote",
              detalhe: `Excedeu em ${qtdN - disponivel} un. via lote "${loteStr}".`,
              itemCod: r.cod,
              lote: loteStr,
              quantidade: qtdN,
              status: "aberta",
            },
          ]);
          toast(`Excedente no item ${r.cod}. Só ${abatido} contabilizados.`, "warn");
        }
      }
      next[targetIdx] = r;
      return next;
    });
    return abateu;
  }

  function marcarDevolvidoForaLista(barcode) {
    setForaLista((curr) =>
      curr.filter((x) => String(x.bar || "") !== String(barcode))
    );
    setOcorrencias((oc) => {
      const out = [];
      let fechou = false;
      for (let i = 0; i < oc.length; i++) {
        const o = oc[i];
        if (
          o.tipo === "produto_divergente" &&
          String(o.bar || "") === String(barcode) &&
          o.status === "aberta" &&
          !fechou
        ) {
          out.push({
            ...o,
            detalhe: (o.detalhe || "") + " • Devolvido ao local de origem.",
            status: "fechada",
          });
          fechou = true;
        } else out.push(o);
      }
      if (!fechou) {
        out.push({
          tipo: "produto_divergente",
          detalhe: "Devolvido ao local de origem.",
          bar: barcode,
          status: "fechada",
        });
      }
      return out;
    });
    toast("Material devolvido ao local de origem.", "info");
  }

  function marcarDevolvidoExcedente(cod) {
    setLinhas((prev) =>
      prev.map((r) =>
        String(r.cod) === String(cod)
          ? {
              ...r,
              warns: (r.warns || []).filter((w) => !/excedente/i.test(w)),
            }
          : r
      )
    );
    setOcorrencias((oc) => {
      const out = [];
      let fechou = false;
      for (let i = 0; i < oc.length; i++) {
        const o = oc[i];
        if (
          o.tipo === "excedente_lote" &&
          String(o.itemCod) === String(cod) &&
          o.status === "aberta" &&
          !fechou
        ) {
          out.push({
            ...o,
            detalhe: (o.detalhe || "") + " • Material devolvido ao local.",
            status: "fechada",
          });
          fechou = true;
        } else out.push(o);
      }
      if (!fechou) {
        out.push({
          tipo: "excedente_lote",
          itemCod: cod,
          detalhe: "Material devolvido ao local.",
          status: "fechada",
        });
      }
      return out;
    });
    toast("Excedente devolvido ao local de origem.", "info");
  }

  const [abrirDiv, setAbrirDiv] = useState(false);
  const [divTipo, setDivTipo] = useState("falta");
  const [divItemCod, setDivItemCod] = useState("");
  const [divDetalhe, setDivDetalhe] = useState("");

  function submitDivergencia() {
    const registro = {
      tipo: divTipo,
      detalhe: divDetalhe || "-",
      itemCod: divItemCod || null,
      status: "aberta",
    };
    setOcorrencias((x) => [...x, registro]);
    setAbrirDiv(false);
    setDivDetalhe("");
    setDivItemCod("");
    setDivTipo("falta");
  }

  const podeIrParaScan = conferente.trim().length > 0 && benchShots.length > 0;
  const podeSalvar100 =
    conferente.trim().length > 0 && allOk && foraLista.length === 0;

  async function salvarConferencia() {
    if (!podeSalvar100 || savingSubmit) return;
    setSavingSubmit(true);
    try {
      const scans = {};
      for (let i = 0; i < linhas.length; i++) {
        const k = linhas[i].bar || linhas[i].cod;
        scans[k] = Number(linhas[i].scanned || 0);
      }
      const loteScansOut = {};
      for (let i = 0; i < linhas.length; i++) {
        const r = linhas[i];
        const key = r.cod || r.bar;
        loteScansOut[key] = r.loteScans || {};
      }
      const ocorrenciasOut = ocorrencias.map((o) => ({
        tipo: o.tipo,
        detalhe: o.detalhe || "-",
        item_cod: o.itemCod || o.item_cod || null,
        bar: o.bar || null,
        lote: o.lote || null,
        quantidade: o.quantidade != null ? o.quantidade : null,
        status: o.status || "aberta",
      }));
      await onConfirm({
        conferente: conferente.trim(),
        elapsedSeconds: elapsed,
        evidences: benchShots.slice(0, 7),
        scans,
        loteScans: loteScansOut,
        foraLista: [],
        ocorrencias: ocorrenciasOut,
      });
    } finally {
      setSavingSubmit(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      size="xl"
      contentClassName="project-modal"
      scrollable
    >
      <ModalHeader toggle={onClose}>
        Conferência — Pedido #{pedido?.nr_pedido}
      </ModalHeader>
      {/* Clique em áreas vazias recaptura foco pro sink; se estiver num input, não recaptura */}
      <ModalBody onClick={() => keepFocus(false)}>
        <BodyScroll>
          <Wrap>
            {/* TOASTS */}
            <div
              style={{
                position: "fixed",
                right: 16,
                bottom: 16,
                zIndex: 2000,
                display: "grid",
                gap: 8,
              }}
            >
              {toasts.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background:
                      t.tone === "error"
                        ? "#fee2e2"
                        : t.tone === "warn"
                        ? "#fef9c3"
                        : "#e0f2fe",
                    color: "#111827",
                    border: "1px solid rgba(0,0,0,.08)",
                    borderLeft: `4px solid ${
                      t.tone === "error"
                        ? "#ef4444"
                        : t.tone === "warn"
                        ? "#f59e0b"
                        : "#38bdf8"
                    }`,
                    padding: "8px 10px",
                    borderRadius: 10,
                    boxShadow: "0 6px 20px rgba(0,0,0,.12)",
                  }}
                >
                  {t.text}
                </div>
              ))}
            </div>

            {phase === "setup" && (
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <SmallMuted>
                    Conferente{" "}
                    <span style={{ color: "#ef4444" }}>* obrigatório</span>
                  </SmallMuted>
                  <Row style={{ marginTop: 6 }}>
                    <Field
                      style={{ minWidth: 220, maxWidth: 320 }}
                      placeholder="Confirme o nome do conferente"
                      value={conferente}
                      onChange={(e) => setConferente(e.target.value)}
                      disabled
                    />
                  </Row>
                </div>

                <div>
                  <SmallMuted>
                    Fotos da bancada (mín. 1 e máx. 7){" "}
                    <span style={{ color: "#ef4444" }}>* obrigatório</span>
                  </SmallMuted>
                  <div style={{ marginTop: 8 }}>
                    <BenchPhoto
                      onCapture={handleBenchCapture}
                      facing="environment"
                    />
                  </div>

                  {benchShots.length === 0 && (
                    <div
                      style={{ marginTop: 6, fontSize: 12, color: "#9a3412" }}
                    >
                      Adicione pelo menos <strong>1 foto</strong> para
                      prosseguir.
                    </div>
                  )}

                  {benchShots.length > 0 && (
                    <Controls style={{ marginTop: 8 }}>
                      <Shots>
                        {benchShots.map((img, idx) => (
                          <ShotThumb key={idx}>
                            <img src={img} alt={`bancada ${idx + 1}`} />
                            <Tag>#{idx + 1}</Tag>
                            <button
                              onClick={() => removeBenchShot(idx)}
                              style={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                background: "rgba(0,0,0,.6)",
                                color: "#fff",
                                border: 0,
                                borderRadius: 8,
                                padding: "2px 8px",
                                cursor: "pointer",
                              }}
                              title="Remover foto"
                            >
                              Remover
                            </button>
                          </ShotThumb>
                        ))}
                      </Shots>
                    </Controls>
                  )}
                </div>
              </div>
            )}

            {phase === "scan" && (
              <div style={{ display: "grid", gap: 12 }}>
                <HeadRow>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "grid", gap: 6 }}>
                      <SmallMuted>Conferente</SmallMuted>
                      <Field
                        style={{ minWidth: 220, maxWidth: 320 }}
                        value={conferente}
                        onChange={(e) => setConferente(e.target.value)}
                        placeholder="Informe o nome do conferente"
                        disabled
                      />
                    </div>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>
                      ⏱ {fmtTime(elapsed)}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <BadgeSoft title="Itens concluídos">{concluidos}</BadgeSoft>
                    <BadgeSoft title="Itens pendentes">{pendentes}</BadgeSoft>
                    <BadgeSoft title="Peças lidas / solicitadas">
                      {totalLidos} / {totalSolic}
                    </BadgeSoft>
                  </div>
                </HeadRow>

                {/* INPUT-SINK: agora com tabIndex -1 e sem forçar foco quando há input ativo */}
                <input
                  ref={sinkRef}
                  onKeyDown={onSinkKeyDown}
                  inputMode="none"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  tabIndex={-1}
                  onBlur={() => setTimeout(() => keepFocus(false), 0)}
                  aria-hidden="true"
                  style={{
                    position: "fixed",
                    opacity: 0,
                    width: 1,
                    height: 1,
                    left: -9999,
                    top: -9999,
                  }}
                />

                <ScannerWrap>
                  <ItemScanner
                    expectedBars={expectedBars}
                    onScanEan={handleScanEAN}
                    onScanLoteQuantidade={handleScanLoteQuantidade}
                  />
                </ScannerWrap>

                <ItemsTable
                  linhas={linhas}
                  selectedCod={null}
                  onSelectCod={() => {}}
                  styles={modernTableStyles}
                  loteChipStyles={loteChipStyles}
                  onDevolvidoExcedente={marcarDevolvidoExcedente}
                />

                {foraLista.length > 0 && (
                  <ForaListaTable
                    foraLista={foraLista}
                    onDevolvido={marcarDevolvidoForaLista}
                    styles={modernTableStyles}
                  />
                )}

                <OcorrenciasTable
                  ocorrencias={ocorrencias}
                  styles={occTableStyles}
                  onDevolvidoExcedente={marcarDevolvidoExcedente}
                  onDevolvidoProduto={marcarDevolvidoForaLista}
                />
              </div>
            )}
          </Wrap>
        </BodyScroll>
      </ModalBody>

      <ModalFooter style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button color="secondary" onClick={onClose}>
          Cancelar
        </Button>
        {phase === "setup" && (
          <Button
            color="primary"
            disabled={!podeIrParaScan}
            onClick={() => setPhase("scan")}
            title={
              podeIrParaScan
                ? "Ir para etapa de leitura"
                : "Informe o conferente e adicione pelo menos 1 foto"
            }
          >
            Seguir para próxima etapa
          </Button>
        )}
        {phase === "scan" && (
          <>
            <Button color="warning" onClick={() => setAbrirDiv(true)}>
              Abrir divergência
            </Button>
            <Button
              color="success"
              disabled={!podeSalvar100 || savingSubmit}
              onClick={salvarConferencia}
              title={
                podeSalvar100
                  ? "Salvar conferência (100%)"
                  : "Pendências ainda abertas"
              }
            >
              {savingSubmit ? "Lançando..." : "Salvar conferência (100%)"}
            </Button>
          </>
        )}
      </ModalFooter>

      {abrirDiv && (
        <div
          onClick={() => setAbrirDiv(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 1300,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(680px, 94vw)",
              background: "var(--card-bg, #fff)",
              borderRadius: 14,
              padding: 14,
              boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            }}
          >
            <h5 style={{ margin: 0 }}>Abrir divergência</h5>
            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              <div>
                <SmallMuted>Tipo</SmallMuted>
                <select
                  value={divTipo}
                  onChange={(e) => setDivTipo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    background: "var(--input-bg, #fff)",
                    color: "var(--input-fg, #111827)",
                  }}
                >
                  <option value="falta">Falta</option>
                  <option value="avaria">Avaria</option>
                  <option value="lote_errado">Lote errado</option>
                  <option value="item_errado">Item errado</option>
                  <option value="produto_divergente">Produto divergente</option>
                  <option value="excedente_lote">Excedente de lote</option>
                  <option value="lote_ambiguidade">Lote ambíguo</option>
                </select>
              </div>

              <div>
                <SmallMuted>Item relacionado (opcional)</SmallMuted>
                <select
                  value={divItemCod}
                  onChange={(e) => setDivItemCod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    background: "var(--input-bg, #fff)",
                    color: "var(--input-fg, #111827)",
                  }}
                >
                  <option value="">—</option>
                  {linhas.map((r) => (
                    <option key={r.cod} value={r.cod}>
                      {r.cod} — {r.bar}
                    </option>
                  ))}
                  {foraLista.map((f, i) => (
                    <option key={`fora-${i}`} value={`fora:${f.bar}`}>
                      FORA • {f.bar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <SmallMuted>Detalhamento</SmallMuted>
                <Field
                  as="textarea"
                  rows={3}
                  value={divDetalhe}
                  onChange={(e) => setDivDetalhe(e.target.value)}
                  placeholder="Descreva a divergência"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 10,
              }}
            >
              <Button color="secondary" onClick={() => setAbrirDiv(false)}>
                Cancelar
              </Button>
              <Button color="warning" onClick={submitDivergencia}>
                Registrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function BadgeSoft({ children, title }) {
  return (
    <div
      title={title}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: "rgba(148,163,184,.18)",
        color: "var(--badge-fg,#0f172a)",
        border: "1px solid rgba(148,163,184,.35)",
      }}
    >
      {children}
    </div>
  );
}
