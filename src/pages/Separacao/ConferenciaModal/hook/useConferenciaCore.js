import { useEffect, useMemo, useRef, useState } from "react";

export function useConferenciaCore({ pedido, isOpen, onConfirm }) {
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

  // Log de bipagens
  const [scanEvents, setScanEvents] = useState([]);

  const SKIP_BENCH_PHOTOS = false;

  function newOccId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  // Helper para registrar cada bipagem
  function registrarScanEvent(evt) {
    const quantidadeNum = Number(evt.quantidade || 0);
    setScanEvents((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
        mode: evt.mode, // "ean" | "lote"
        bar: evt.bar != null ? String(evt.bar) : null,
        lote: evt.lote != null ? String(evt.lote) : null,
        quantidade: Number.isNaN(quantidadeNum) ? 0 : quantidadeNum,
        itemCod: evt.itemCod != null ? String(evt.itemCod) : null,
        result: evt.result, // "ok" | "fora_lista" | "excedente_ignorado" | "lote_errado" | "lote_ambiguidade"
      },
    ]);
  }

  const benchAreaRef = useRef(null);
  const sinkRef = useRef(null);
  const bufferRef = useRef("");

  function stopMediaStreamsIn(rootEl) {
    if (!rootEl) return;
    const videos = rootEl.querySelectorAll("video");
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      try {
        const s = v.srcObject;
        if (s && s.getTracks) s.getTracks().forEach((t) => t.stop());
        v.srcObject = null;
      } catch {
        // ignore
      }
    }
  }

  function goToScan() {
    stopMediaStreamsIn(benchAreaRef.current);
    setPhase("scan");
    setTimeout(() => keepFocus(true), 0);
  }

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

  function keepFocus(force = false) {
    if (phase !== "scan") return;
    const ae = document.activeElement;
    if (!force && isInteractive(ae)) return;
    if (sinkRef.current) {
      try {
        sinkRef.current.focus({ preventScroll: true });
      } catch {
        // ignore
      }
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    if (SKIP_BENCH_PHOTOS) {
      setPhase("scan");
    }
  }, [isOpen, SKIP_BENCH_PHOTOS]);

  useEffect(() => {
    if (phase === "scan") {
      stopMediaStreamsIn(benchAreaRef.current);
      setTimeout(() => keepFocus(true), 0);
    }
  }, [phase]);

  function onSinkKeyDown(e) {
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

  function toast(text, tone = "info") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }

  // ================== LINHAS INICIAIS ==================
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
      if (!bar) continue;
      const arr = map.get(bar) || [];
      arr.push(i);
      map.set(bar, arr);
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
    setScanEvents([]); // reset do log de bipagens
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
    for (let i = 0; i < linhas.length; i++) {
      t += Number(linhas[i].qtd || 0);
    }
    return t;
  }, [linhas]);

  const totalLidos = useMemo(() => {
    let t = 0;
    for (let i = 0; i < linhas.length; i++) {
      t += Number(linhas[i].scanned || 0);
    }
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
      if (Number(linhas[i].scanned || 0) < Number(linhas[i].qtd || 0)) {
        return false;
      }
    }
    return linhas.length > 0;
  }, [linhas]);

  const temOcorrenciaAberta = useMemo(() => {
    for (let i = 0; i < ocorrencias.length; i++) {
      const st = (ocorrencias[i].status || "aberta").toLowerCase();
      if (st !== "fechada") return true;
    }
    return false;
  }, [ocorrencias]);

  // >>> Contadores agregados de bipagem (por modo) <<<
  const totalScanUnitario = useMemo(() => {
    let c = 0;
    for (let i = 0; i < scanEvents.length; i++) {
      if (scanEvents[i].mode === "ean") c++;
    }
    return c;
  }, [scanEvents]);

  const totalScanLote = useMemo(() => {
    let c = 0;
    for (let i = 0; i < scanEvents.length; i++) {
      if (scanEvents[i].mode === "lote") c++;
    }
    return c;
  }, [scanEvents]);

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

  // ========== RECONCILIAÇÃO produto_divergente / foraLista ==========
  function ajustarDivergentePorBar(bar, modo) {
    const barStr = String(bar || "");
    if (!barStr) return;

    setOcorrencias((oc) => {
      let alterou = false;
      const novo = [];
      let usouUma = false;

      for (let i = 0; i < oc.length; i++) {
        const o = oc[i];
        const isAberta = (o.status || "aberta").toLowerCase() === "aberta";
        const isPD =
          o.tipo === "produto_divergente" && String(o.bar || "") === barStr;

        if (!usouUma && isPD && isAberta) {
          usouUma = true;
          alterou = true;

          if (modo === "erro") {
            continue; // remove
          } else {
            novo.push({
              ...o,
              status: "fechada",
              detalhe: (o.detalhe || "") + " • Devolvido ao local de origem.",
            });
          }
        } else {
          novo.push(o);
        }
      }

      if (alterou) {
        setForaLista((curr) => {
          const out = [];
          for (let i = 0; i < curr.length; i++) {
            const it = curr[i];
            if (String(it.bar) === barStr) {
              const next = Math.max(0, Number(it.count || 0) - 1);
              if (next > 0) out.push({ ...it, count: next });
            } else {
              out.push(it);
            }
          }
          return out;
        });
      }

      return novo;
    });

    toast(
      modo === "erro"
        ? "Marcado como erro de bipagem."
        : "Material devolvido ao local.",
      "info"
    );
  }

  // ========== LEITURA POR EAN (UNITÁRIA) ==========
  function handleScanEAN(code) {
    const barcode = String(code || "").trim();
    if (!barcode) return;

    const idxList = indexByBar.get(barcode);

    // fora da lista
    if (!idxList || idxList.length === 0) {
      setForaLista((curr) => {
        const out = [];
        let inc = false;
        for (let i = 0; i < curr.length; i++) {
          const it = curr[i];
          if (String(it.bar || "").trim() === barcode) {
            out.push({ bar: it.bar, count: Number(it.count || 0) + 1 });
            inc = true;
          } else {
            out.push(it);
          }
        }
        if (!inc) out.push({ bar: barcode, count: 1 });
        return out;
      });
      setOcorrencias((oc) => [
        ...oc,
        {
          id: newOccId(),
          tipo: "produto_divergente",
          detalhe: "Leitura de EAN que não pertence ao pedido.",
          bar: barcode,
          status: "aberta",
        },
      ]);
      toast(
        "Produto fora da lista! Devolver material ou marcar erro de bipagem.",
        "error"
      );

      registrarScanEvent({
        mode: "ean",
        bar: barcode,
        lote: null,
        quantidade: 1,
        itemCod: null,
        result: "fora_lista",
      });

      return;
    }

    // procura um item com saldo
    let targetIdx = null;
    for (let k = 0; k < idxList.length; k++) {
      const i = idxList[k];
      const r = linhas[i];
      const qtdSolic = Number(r.qtd || 0);
      const atual = Number(r.scanned || 0);
      if (atual < qtdSolic) {
        targetIdx = i;
        break;
      }
    }

    // excedente (todos já completos)
    if (targetIdx == null) {
      const i0 = idxList[0];
      const r0 = linhas[i0];

      setLinhas((prev) =>
        prev.map((r, idx) =>
          idx === i0
            ? {
                ...r,
                warns: [
                  ...(r.warns || []),
                  "Excedente lido. Devolver material.",
                ],
              }
            : r
        )
      );

      setOcorrencias((oc) => [
        ...oc,
        {
          id: newOccId(),
          tipo: "excedente_lote",
          detalhe: "Excedente via EAN unitário (não abatido).",
          itemCod: r0.cod,
          bar: r0.bar,
          status: "aberta",
        },
      ]);
      toast(`Excedente no item ${r0.cod}. Não contabilizado.`, "warn");

      registrarScanEvent({
        mode: "ean",
        bar: barcode,
        lote: null,
        quantidade: 1,
        itemCod: r0.cod || null,
        result: "excedente_ignorado",
      });

      return;
    }

    // abatimento normal
    const item = linhas[targetIdx];

    setLinhas((prev) =>
      prev.map((r, idx) =>
        idx === targetIdx
          ? { ...r, scanned: Number(r.scanned || 0) + 1 }
          : r
      )
    );

    registrarScanEvent({
      mode: "ean",
      bar: barcode,
      lote: null,
      quantidade: 1,
      itemCod: item?.cod || null,
      result: "ok",
    });
  }

  // ========== LEITURA POR LOTE + QTD ==========
  function handleScanLoteQuantidade({ lote, quantidade, ean }) {
    const loteStr = String(lote || "").trim().toUpperCase();
    const qtdN = Number(quantidade || 0);
    const eanStr = String(ean || "").trim();

    if (!loteStr || !qtdN || Number.isNaN(qtdN) || qtdN <= 0) {
      toast("Lote/quantidade inválidos.", "error");
      return false;
    }

    const candidatosLote = indexesByLote.get(loteStr) || [];
    let targetIdx = null;

    // fluxo com EAN informado junto
    if (eanStr) {
      const idxList = indexByBar.get(eanStr) || [];

      // EAN não pertence ao pedido
      if (idxList.length === 0) {
        toast(`EAN ${eanStr} não pertence ao pedido.`, "error");
        setOcorrencias((oc) => [
          ...oc,
          {
            id: newOccId(),
            tipo: "produto_divergente",
            detalhe: "EAN informado no fluxo de lote não pertence ao pedido.",
            bar: eanStr,
            lote: loteStr,
            quantidade: qtdN,
            status: "aberta",
          },
        ]);

        registrarScanEvent({
          mode: "lote",
          bar: eanStr,
          lote: loteStr,
          quantidade: qtdN,
          itemCod: null,
          result: "fora_lista",
        });

        return false;
      }

      let candidatosValidos = idxList;

      // *** NOVA REGRA: lote precisa existir para este pedido ***
      if (candidatosLote.length === 0) {
        toast(
          `Lote ${loteStr} não está cadastrado para nenhum item deste pedido.`,
          "error"
        );
        setOcorrencias((oc) => [
          ...oc,
          {
            id: newOccId(),
            tipo: "lote_errado",
            detalhe: `Lote ${loteStr} não encontrado para o pedido (EAN ${eanStr}).`,
            itemCod: null,
            lote: loteStr,
            quantidade: qtdN,
            bar: eanStr,
            status: "aberta",
          },
        ]);

        registrarScanEvent({
          mode: "lote",
          bar: eanStr,
          lote: loteStr,
          quantidade: qtdN,
          itemCod: null,
          result: "lote_errado",
        });

        return false;
      }

      // se tem lote mapeado, faz interseção (confere se EAN pertence àquele lote)
      const setCand = new Set(candidatosLote);
      const inter = [];
      for (let i = 0; i < idxList.length; i++) {
        if (setCand.has(idxList[i])) inter.push(idxList[i]);
      }
      candidatosValidos = inter;

      if (candidatosValidos.length === 0) {
        toast(
          `EAN não faz parte do lote ${loteStr} para este pedido.`,
          "error"
        );
        setOcorrencias((oc) => [
          ...oc,
          {
            id: newOccId(),
            tipo: "lote_errado",
            detalhe: `EAN não compatível com o lote ${loteStr}.`,
            itemCod: null,
            lote: loteStr,
            quantidade: qtdN,
            bar: eanStr,
            status: "aberta",
          },
        ]);

        registrarScanEvent({
          mode: "lote",
          bar: eanStr,
          lote: loteStr,
          quantidade: qtdN,
          itemCod: null,
          result: "lote_errado",
        });

        return false;
      }

      // escolhe item com saldo, se tiver mais de um
      for (let k = 0; k < candidatosValidos.length; k++) {
        const i = candidatosValidos[k];
        const r = linhas[i];
        const qtdSolic = Number(r.qtd || 0);
        const atual = Number(r.scanned || 0);
        if (atual < qtdSolic) {
          targetIdx = i;
          break;
        }
      }
      if (targetIdx == null) {
        targetIdx = candidatosValidos[0];
      }
    } else {
      // fluxo apenas com LOTE
      if (candidatosLote.length === 0) {
        toast(`Lote ${loteStr} não encontrado nos itens.`, "error");

        registrarScanEvent({
          mode: "lote",
          bar: null,
          lote: loteStr,
          quantidade: qtdN,
          itemCod: null,
          result: "lote_errado",
        });

        return false;
      }
      if (candidatosLote.length > 1) {
        toast(
          `Lote ${loteStr} é usado por múltiplos itens. Bipe o EAN para desambiguar.`,
          "warn"
        );
        setOcorrencias((oc) => [
          ...oc,
          {
            id: newOccId(),
            tipo: "lote_ambiguidade",
            detalhe: `Lote ${loteStr} pertence a vários itens. É necessário informar EAN.`,
            lote: loteStr,
            quantidade: qtdN,
            status: "aberta",
          },
        ]);

        registrarScanEvent({
          mode: "lote",
          bar: null,
          lote: loteStr,
          quantidade: qtdN,
          itemCod: null,
          result: "lote_ambiguidade",
        });

        return false;
      }
      targetIdx = candidatosLote[0];
    }

    const linhaAlvo = linhas[targetIdx];
    const qtdSolic = Number(linhaAlvo.qtd || 0);
    const atual = Number(linhaAlvo.scanned || 0);

    // excedente (nenhum saldo)
    if (atual >= qtdSolic) {
      setLinhas((prev) =>
        prev.map((r, idx) =>
          idx === targetIdx
            ? {
                ...r,
                warns: [
                  ...(r.warns || []),
                  "Tentativa de excedente via lote. Devolver material.",
                ],
              }
            : r
        )
      );

      setOcorrencias((oc) => [
        ...oc,
        {
          id: newOccId(),
          tipo: "excedente_lote",
          detalhe: `Excedente via lote "${loteStr}" (não abatido).`,
          itemCod: linhaAlvo.cod,
          lote: loteStr,
          quantidade: qtdN,
          status: "aberta",
        },
      ]);
      toast(
        `Item ${linhaAlvo.cod} já completo. Excedente ignorado.`,
        "warn"
      );

      registrarScanEvent({
        mode: "lote",
        bar: eanStr || linhaAlvo.bar || null,
        lote: loteStr,
        quantidade: qtdN,
        itemCod: linhaAlvo.cod || null,
        result: "excedente_ignorado",
      });

      return false;
    }

    const disponivel = Math.max(0, qtdSolic - atual);
    const abatido = Math.min(disponivel, qtdN);
    const excedenteQtd = qtdN > disponivel ? qtdN - disponivel : 0;

    // atualiza linhas (scanned + loteScans + warns)
    setLinhas((prev) => {
      const next = prev.map((r) => ({ ...r }));
      const r = next[targetIdx];

      const novoLotes = { ...(r.loteScans || {}) };
      const key = loteStr || `lote_${Object.keys(novoLotes).length + 1}`;
      const prevVal = Number(novoLotes[key] || 0);
      novoLotes[key] = prevVal + abatido;

      r.scanned = atual + abatido;
      r.loteScans = novoLotes;

      if (excedenteQtd > 0) {
        r.warns = [
          ...(r.warns || []),
          "Excedente no lote. Devolver material.",
        ];
      }

      next[targetIdx] = r;
      return next;
    });

    // se teve excedente nesse lote, gera ocorrência
    if (excedenteQtd > 0) {
      setOcorrencias((oc) => [
        ...oc,
        {
          id: newOccId(),
          tipo: "excedente_lote",
          detalhe: `Excedeu em ${excedenteQtd} un. via lote "${loteStr}".`,
          itemCod: linhaAlvo.cod,
          lote: loteStr,
          quantidade: qtdN,
          status: "aberta",
        },
      ]);
      toast(
        `Excedente no item ${linhaAlvo.cod}. Só ${abatido} contabilizados.`,
        "warn"
      );
    }

    registrarScanEvent({
      mode: "lote",
      bar: eanStr || linhaAlvo.bar || null,
      lote: loteStr,
      quantidade: qtdN,
      itemCod: linhaAlvo.cod || null,
      result: excedenteQtd > 0 ? "excedente_ignorado" : "ok",
    });

    return abatido > 0;
  }

  // ===== AÇÕES SINCRONIZADAS =====
  function marcarDevolvidoForaLista(barcode) {
    ajustarDivergentePorBar(barcode, "devolvido");
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
          !fechou &&
          o.tipo === "excedente_lote" &&
          String(o.itemCod) === String(cod) &&
          (o.status || "aberta").toLowerCase() !== "fechada"
        ) {
          out.push({
            ...o,
            detalhe: (o.detalhe || "") + " • Material devolvido ao local.",
            status: "fechada",
          });
          fechou = true;
        } else {
          out.push(o);
        }
      }
      return out;
    });
    toast("Excedente devolvido ao local de origem.", "info");
  }

  function resolverOcorrenciaById(occId, labelDetalhe) {
    let alvo = null;
    setOcorrencias((oc) => {
      alvo = oc.find((o) => o.id === occId);
      return oc;
    });
    if (alvo?.tipo === "produto_divergente" && alvo?.bar) {
      ajustarDivergentePorBar(alvo.bar, "devolvido");
      return;
    }

    setOcorrencias((oc) => {
      const out = [];
      for (let i = 0; i < oc.length; i++) {
        const o = oc[i];
        if (
          o.id === occId &&
          (o.status || "aberta").toLowerCase() !== "fechada"
        ) {
          out.push({
            ...o,
            status: "fechada",
            detalhe: (o.detalhe || "") + ` • ${labelDetalhe}`,
          });
        } else {
          out.push(o);
        }
      }
      return out;
    });
  }

  function erroNaBipagem(occId) {
    let bar = null;
    setOcorrencias((oc) => {
      const f = oc.find((o) => o.id === occId);
      bar = f?.bar ? String(f.bar) : null;
      return oc;
    });
    if (bar) ajustarDivergentePorBar(bar, "erro");
  }

  function erroNaBipagemPorBar(barcode) {
    ajustarDivergentePorBar(barcode, "erro");
  }

  const [abrirDiv, setAbrirDiv] = useState(false);
  const [divTipo, setDivTipo] = useState("falta");
  const [divItemCod, setDivItemCod] = useState("");
  const [divDetalhe, setDivDetalhe] = useState("");

  function submitDivergencia() {
    const registro = {
      id: newOccId(),
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

  const podeIrParaScan =
    conferente.trim().length > 0 && (SKIP_BENCH_PHOTOS || benchShots.length > 0);

  const podeSalvar100 =
    conferente.trim().length > 0 && allOk && foraLista.length === 0;

  async function salvarConferencia() {
    if (!podeSalvar100 || savingSubmit || temOcorrenciaAberta) return;
    setSavingSubmit(true);
    try {
      const scans = {};
      const loteScansOut = {};

      for (let i = 0; i < linhas.length; i++) {
        const r = linhas[i];
        const k = String(r.bar || r.cod || "").trim();
        if (!k) continue;

        const prev = Number(scans[k] || 0);
        scans[k] = prev + Number(r.scanned || 0);

        const srcLotes = r.loteScans || {};
        const dstLotes = loteScansOut[k] || {};
        for (const lote in srcLotes) {
          const v = Number(srcLotes[lote] || 0);
          const cur = Number(dstLotes[lote] || 0);
          dstLotes[lote] = cur + v;
        }
        loteScansOut[k] = dstLotes;
      }

      const ocorrenciasOut = [];
      for (let i = 0; i < ocorrencias.length; i++) {
        const o = ocorrencias[i];
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

      // ===== NOVO: resumoPorItem no formato solicitado =====
      const resumoTmp = {};

      for (let i = 0; i < scanEvents.length; i++) {
        const ev = scanEvents[i];
        const cod = ev.itemCod ? String(ev.itemCod) : null;
        if (!cod) continue;

        if (!resumoTmp[cod]) {
          resumoTmp[cod] = {
            cod_prod: cod,
            leitura_unit: 0,
            _loteList: [], // temporário, depois vira objeto numerado
          };
        }

        const entry = resumoTmp[cod];

        if (ev.mode === "ean") {
          // só conta leituras unitárias que realmente abateram
          if (ev.result === "ok") {
            entry.leitura_unit += Number(ev.quantidade || 0);
          }
        } else if (ev.mode === "lote") {
          entry._loteList.push({
            qtde: Number(ev.quantidade || 0),
            lote: ev.lote || null,
            result: ev.result,
          });
        }
      }

      const resumoPorItem = {};
      for (const cod in resumoTmp) {
        const entry = resumoTmp[cod];
        if (!entry._loteList || entry._loteList.length === 0) {
          resumoPorItem[cod] = {
            cod_prod: entry.cod_prod,
            leitura_unit: entry.leitura_unit,
            leitura_lote: 0,
          };
        } else {
          const lotesObj = {
            total_leitura_lote: entry._loteList.length,
          };
          for (let i = 0; i < entry._loteList.length; i++) {
            lotesObj[i] = entry._loteList[i];
          }
          resumoPorItem[cod] = {
            cod_prod: entry.cod_prod,
            leitura_unit: entry.leitura_unit,
            leitura_lote: lotesObj,
          };
        }
      }

      await onConfirm({
        conferente: conferente.trim(),
        elapsedSeconds: elapsed,
        evidences: benchShots.slice(0, 7),
        scans,
        loteScans: loteScansOut,
        foraLista,
        ocorrencias: ocorrenciasOut,
        scanEvents, // log completo das bipagens
        resumoPorItem, // novo resumo no formato que você quer consultar
      });
    } finally {
      setSavingSubmit(false);
    }
  }

  return {
    phase,
    setPhase,
    conferente,
    setConferente,
    benchShots,
    handleBenchCapture,
    removeBenchShot,
    elapsed,
    fmtTime,
    linhas,
    foraLista,
    ocorrencias,
    toasts,
    podeIrParaScan,
    podeSalvar100,
    temOcorrenciaAberta,
    savingSubmit,
    expectedBars,
    totalSolic,
    totalLidos,
    concluidos,
    pendentes,
    allOk,
    sinkRef,
    onSinkKeyDown,
    keepFocus,
    benchAreaRef,
    goToScan,
    marcarDevolvidoForaLista,
    marcarDevolvidoExcedente,
    erroNaBipagem,
    erroNaBipagemPorBar,
    resolverOcorrenciaById,
    abrirDiv,
    setAbrirDiv,
    divTipo,
    setDivTipo,
    divItemCod,
    setDivItemCod,
    divDetalhe,
    setDivDetalhe,
    submitDivergencia,
    salvarConferencia,
    stopMediaStreamsIn,
    SKIP_BENCH_PHOTOS,

    // log bruto, se quiser usar em relatório ou debug
    scanEvents,

    // contadores agregados para exibir na tela
    totalScanUnitario,
    totalScanLote,

    // handlers de leitura
    handleScanEAN,
    handleScanLoteQuantidade,
  };
}
