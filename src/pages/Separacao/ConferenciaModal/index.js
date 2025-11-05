import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Wrap, Controls, Shots, ShotThumb, Tag } from "./style";
import { Row, Field, SmallMuted } from "../style";
import BenchPhoto from "./BenchPhoto";
import ItemScanner from "./ItemScanner";
import { ItemsTable, ForaListaTable, OcorrenciasTable } from "./tables";
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
  // Etapas: 'setup' (conferente + fotos) -> 'scan' (leitura)
  const [phase, setPhase] = useState("setup");
  const [conferente, setConferente] = useState("");

  // Evidências (capturadas do vídeo ao vivo pelo BenchPhoto): máx. 7
  const [benchShots, setBenchShots] = useState([]);

  // Cronômetro (só roda na etapa de leitura)
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Linhas: {cod, bar, um, qtd, scanned, lotes[], loteScans{lote:qtd}, warns[]}
  const [linhas, setLinhas] = useState([]);
  const [foraLista, setForaLista] = useState([]); // {bar, count}
  const [selectedCod, setSelectedCod] = useState(null);

  // Ocorrências (auto e manuais)
  const [ocorrencias, setOcorrencias] = useState([]); // {tipo, detalhe, itemCod?, bar?, lote?, quantidade?, status}

  // Toasts simples
  const [toasts, setToasts] = useState([]);
  const [savingSubmit, setSavingSubmit] = useState(false); // <— NOVO
  // {id, text, tone}
  function toast(text, tone = "info") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  // Linhas iniciais
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

  // Ao abrir o modal, inicia na ETAPA 1
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
    setSelectedCod(linhasInicial[0]?.cod || null);
    setOcorrencias([]);
    setToasts([]);
    setElapsed(0);

    if (timerRef.current) clearInterval(timerRef.current);
  }, [isOpen, linhasInicial, pedido]);

  // Cronômetro: só na etapa de leitura
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

  // Esperados para beep
  const expectedBars = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < linhas.length; i++) {
      const bar = String(linhas[i].bar || "").trim();
      if (bar) set.add(bar);
    }
    return Array.from(set);
  }, [linhas]);

  // Tudo conferido?
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

  // ====== Fotos ao vivo (BenchPhoto) — máx. 7 ======
  function handleBenchCapture(imgDataUrl) {
    if (!imgDataUrl) return;
    if (benchShots.length >= 7) {
      toast("Limite de 7 fotos atingido.", "warn");
      return;
    }
    const next = [];
    for (let i = 0; i < benchShots.length; i++) next.push(benchShots[i]);
    next.push(imgDataUrl);
    setBenchShots(next);
  }
  function removeBenchShot(idx) {
    const next = [];
    for (let i = 0; i < benchShots.length; i++) {
      if (i !== idx) next.push(benchShots[i]);
    }
    setBenchShots(next);
  }

  // ====== Leitura EAN (unitária) ======
  function handleScanEAN(code) {
    const barcode = String(code || "").trim();
    if (!barcode) return;

    let barNaLista = false;
    for (let i = 0; i < linhas.length; i++) {
      if (String(linhas[i].bar || "").trim() === barcode) {
        barNaLista = true;
        break;
      }
    }
    if (!barNaLista) {
      setForaLista((curr) => {
        const arr = [];
        let found = false;
        for (let j = 0; j < curr.length; j++) {
          const it = curr[j];
          if (String(it.bar || "").trim() === barcode) {
            arr.push({ bar: it.bar, count: Number(it.count || 0) + 1 });
            found = true;
          } else arr.push(it);
        }
        if (!found) arr.push({ bar: barcode, count: 1 });
        return arr;
      });
      setOcorrencias((oc) => {
        const out = oc.slice();
        out.push({
          tipo: "produto_divergente",
          detalhe: "Leitura de EAN que não pertence ao pedido.",
          bar: barcode,
          status: "aberta",
        });
        return out;
      });
      toast("Produto fora da lista! Devolver material.", "error");
      return;
    }

    setLinhas((prev) => {
      const next = [];
      for (let i = 0; i < prev.length; i++) {
        const r = prev[i];
        if (String(r.bar || "").trim() === barcode) {
          const qtdSolic = Number(r.qtd || 0);
          const atual = Number(r.scanned || 0);
          if (atual + 1 > qtdSolic) {
            const warns = (r.warns || []).slice();
            warns.push("Excedente lido. Devolver material.");
            next.push({ ...r, warns });
            toast(`Excedente no item ${r.cod}. Não contabilizado.`, "warn");
          } else {
            next.push({ ...r, scanned: atual + 1 });
          }
        } else next.push(r);
      }
      return next;
    });
  }

  // ====== Leitura LOTE + QTD ======
function handleScanLoteQuantidade({ lote, quantidade }) {
  const loteStr = String(lote || "").trim();
  const qtdN = Number(quantidade || 0);

  if (!selectedCod) {
    toast("Selecione um item na tabela antes de bipar o lote.", "warn");
    return false; // <- aqui
  }

  // valida se o lote pertence à linha selecionada
  const linhaSel = linhas.find((l) => String(l.cod) === String(selectedCod));
  if (linhaSel && Array.isArray(linhaSel.lotes) && linhaSel.lotes.length > 0) {
    const pertence = linhaSel.lotes.some(
      (l) => l.toUpperCase() === loteStr.toUpperCase()
    );
    if (!pertence) {
      toast(`Lote ${loteStr} não pertence ao item ${linhaSel.cod}.`, "error");
      return false; // <- aqui
    }
  }

  if (!qtdN || isNaN(qtdN) || qtdN <= 0) {
    toast("Quantidade inválida lida para o lote.", "error");
    return false; // <- aqui
  }

  let abateu = false; // <- controla se houve abatimento

  setLinhas((prev) => {
    const next = [];
    for (let i = 0; i < prev.length; i++) {
      const r = prev[i];
      if (String(r.cod) === String(selectedCod)) {
        const qtdSolic = Number(r.qtd || 0);
        const atual = Number(r.scanned || 0);
        if (atual >= qtdSolic) {
          const warns = (r.warns || []).slice();
          warns.push("Tentativa de excedente via lote. Devolver material.");
          next.push({ ...r, warns });

          setOcorrencias((oc) => {
            const oo = oc.slice();
            oo.push({
              tipo: "excedente_lote",
              detalhe: `Excedente via lote "${loteStr}" (não abatido).`,
              itemCod: r.cod,
              lote: loteStr,
              quantidade: qtdN,
              status: "aberta",
            });
            return oo;
          });
          toast(`Item ${r.cod} já completo. Excedente ignorado.`, "warn");
        } else {
          const disponivel = Math.max(0, qtdSolic - atual);
          const abatido = Math.min(disponivel, qtdN);
          if (abatido > 0) abateu = true; // <- marca sucesso

          const novoLotes = { ...(r.loteScans || {}) };
          const key = loteStr || `lote_${Object.keys(novoLotes).length + 1}`;
          const prevVal = Number(novoLotes[key] || 0);
          novoLotes[key] = prevVal + abatido;

          const novo = {
            ...r,
            scanned: atual + abatido,
            loteScans: novoLotes,
            warns: r.warns || [],
          };

          if (qtdN > disponivel) {
            const warns2 = novo.warns.slice();
            warns2.push("Excedente no lote. Devolver material.");
            novo.warns = warns2;

            setOcorrencias((oc) => {
              const oo = oc.slice();
              oo.push({
                tipo: "excedente_lote",
                detalhe: `Excedeu em ${qtdN - disponivel} un. via lote "${loteStr}".`,
                itemCod: r.cod,
                lote: loteStr,
                quantidade: qtdN,
                status: "aberta",
              });
              return oo;
            });
            toast(`Excedente no item ${r.cod}. Só ${abatido} contabilizados.`, "warn");
          }

          next.push(novo);
        }
      } else next.push(r);
    }
    return next;
  });

  return abateu; // <- sucesso só se abateu algo
}


  // Fora da lista → devolvido
  function marcarDevolvidoForaLista(barcode) {
    setForaLista((curr) => {
      const out = [];
      for (let i = 0; i < curr.length; i++) {
        const it = curr[i];
        if (String(it.bar || "") !== String(barcode)) out.push(it);
      }
      return out;
    });
    setOcorrencias((oc) => {
      let found = false;
      const out = [];
      for (let i = 0; i < oc.length; i++) {
        const o = oc[i];
        if (
          o.tipo === "produto_divergente" &&
          String(o.bar || "") === String(barcode) &&
          o.status === "aberta"
        ) {
          found = true;
          out.push({
            ...o,
            detalhe: (o.detalhe || "") + " • Devolvido ao local de origem.",
            status: "fechada",
          });
        } else out.push(o);
      }
      if (!found) {
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

  // Excedente (lote) → devolvido
  function marcarDevolvidoExcedente(cod) {
    setLinhas((prev) => {
      const out = [];
      for (let i = 0; i < prev.length; i++) {
        const r = prev[i];
        if (String(r.cod) === String(cod)) {
          const warns = (r.warns || []).filter((w) => !/excedente/i.test(w));
          out.push({ ...r, warns });
        } else out.push(r);
      }
      return out;
    });

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

  // Divergências manuais
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
    setOcorrencias((x) => {
      const out = x.slice();
      out.push(registro);
      return out;
    });
    setAbrirDiv(false);
    setDivDetalhe("");
    setDivItemCod("");
    setDivTipo("falta");
  }

  // >>> Regras de avanço/salvar
  // Agora OBRIGATÓRIO: pelo menos 1 foto E nome do conferente
  const podeIrParaScan = conferente.trim().length > 0 && benchShots.length > 0;
  const podeSalvar100 =
    conferente.trim().length > 0 && allOk && foraLista.length === 0;

  async function salvarConferencia() {
    if (!podeSalvar100 || savingSubmit) return;

    setSavingSubmit(true); // <— inicia loading
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

      const ocorrenciasOut = [];
      for (let i = 0; i < ocorrencias.length; i++) {
        const o = ocorrencias[i] || {};
        ocorrenciasOut.push({
          tipo: o.tipo,
          detalhe: o.detalhe || "-",
          item_cod: o.itemCod || o.item_cod || null,
          bar: o.bar || null,
          lote: o.lote || null,
          quantidade: o.quantidade != null ? o.quantidade : null,
          status: o.status || "aberta",
        });
      }

      // onConfirm pode ser assíncrono — aguardamos finalizar
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
      setSavingSubmit(false); // <— encerra loading mesmo se der erro
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      size="xl"
      contentClassName="project-modal"
    >
      <ModalHeader toggle={onClose}>
        Conferência — Pedido #{pedido?.nr_pedido}
      </ModalHeader>

      <ModalBody>
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

          {/* ===== ETAPA 1: Conferente + Fotos ===== */}
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
                  <div style={{ marginTop: 6, fontSize: 12, color: "#9a3412" }}>
                    Adicione pelo menos <strong>1 foto</strong> para prosseguir.
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

          {/* ===== ETAPA 2: Leitura ===== */}
          {phase === "scan" && (
            <div style={{ display: "grid", gap: 12 }}>
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
                  />
                </div>
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  ⏱ {fmtTime(elapsed)}
                </span>
              </div>

              <ItemScanner
                expectedBars={expectedBars}
                onScanEan={handleScanEAN}
                onScanLoteQuantidade={handleScanLoteQuantidade}
              />

              <ItemsTable
                linhas={linhas}
                selectedCod={selectedCod}
                onSelectCod={setSelectedCod}
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
              />
            </div>
          )}
        </Wrap>
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

      {/* Modal interna: divergência */}
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
              background: "#fff",
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
                  }}
                >
                  <option value="falta">Falta</option>
                  <option value="avaria">Avaria</option>
                  <option value="lote_errado">Lote errado</option>
                  <option value="item_errado">Item errado</option>
                  <option value="produto_divergente">Produto divergente</option>
                  <option value="excedente_lote">Excedente de lote</option>
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
                  placeholder="Descreva a divergência (ex.: faltaram 2 unid., avaria, lote X incorreto, etc.)"
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
