import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { GlobalModalStyles, Loader } from "../style";

import {
  Grid,
  Field,
  Label,
  TextArea,
  Hint,
  Row,
  Pill,
  Divider,
  InlineBtn,
  LogBox,
  LogItem,
  MiniNote,
  ChipsWrap,
  Chip,
  ChipX,
  SectionTitle,
  SearchSelectWrap,
  OptionsList,
  OptionItem,
  Inline2,
  CompactGrid4,
  CompactField,
  MiniInput,
  CompactTop3,
  MicroSelect,
  DropZoneTop,
  DropCounter,
  DocMetaBox,
  DocMetaRow,
  SourceBadge,
} from "./style";

import DocImportDropzone from "./DocImportDropzone";
import { parseXmlTextToDoc, readZipToXmlTexts } from "./xmlParsers";

// componentes
import TipoSection from "./components/TipoSection";
import RecebimentoImportSection from "./components/RecebimentoImportSection";
import CargaSection from "./components/CargaSection";
import ExpedicaoSection from "./components/ExpedicaoSection";
import RecebimentoSection from "./components/RecebimentoSection";
import ClienteSection from "./components/ClienteSection";
import TotalsSection from "./components/TotalsSection";
import ChaveEntrySection from "./components/ChaveEntrySection";
import DocsChipsSection from "./components/DocsChipsSection";
import ResponsaveisSection from "./components/ResponsaveisSection";
import ObservacaoSection from "./components/ObservacaoSection";
import LogsSection from "./components/LogsSection";

const MODAL_CLASS = "prodop-modal";

function nowIso() {
  return new Date().toISOString();
}
function onlyDigits(s) {
  return String(s || "").replace(/\D/g, "");
}
function normalizeText(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
function sanitizeChave44(raw) {
  const d = onlyDigits(raw);
  if (d.length !== 44) return "";
  return d;
}
function clientKey(c) {
  if (!c) return "";
  const nome = String(c.nome || "").trim();
  const cnpj = String(c.cnpj || "").trim();
  if (nome) return `NOME:${normalizeText(nome)}`;
  if (cnpj) return `CNPJ:${cnpj}`;
  return "";
}
function sameClient(a, b) {
  const ka = clientKey(a);
  const kb = clientKey(b);
  if (!ka || !kb) return true;
  return ka === kb;
}
function n2(v) {
  const x = Number(v || 0);
  return Math.round(x * 100) / 100;
}
function sumDocsTotals(docs) {
  let totalPeso = 0;
  let totalVol = 0;
  let totalPal = 0;

  const arr = Array.isArray(docs) ? docs : [];
  for (let i = 0; i < arr.length; i++) {
    const it = arr[i] || {};
    totalPeso += n2(it.pesoKg || 0);
    totalVol += Number(it.volumes || 0);
    totalPal += Number(it.pallets || 0);
  }

  return {
    totalPesoKg: n2(totalPeso),
    totalVolumes: Number(totalVol || 0),
    totalPalletsFromDocs: Number(totalPal || 0),
  };
}
function inferDocMetaFromDoc(doc) {
  const dk = String(doc?.docKind || doc?.doc_kind || "").toUpperCase().trim();
  const docKind = dk === "CTE" ? "CTE" : "NFE";
  const pal = Number(doc?.pallets ?? 0);
  const paletizada = pal > 0;
  return { docKind, paletizada };
}
function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function uniqueClientsFromDocs(docs) {
  const map = {};
  const out = [];
  const arr = Array.isArray(docs) ? docs : [];
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i]?.cliente || null;
    if (!c) continue;

    const nome = String(c.nome || "").trim();
    const cnpj = onlyDigits(c.cnpj || "");
    const k = `${normalizeText(nome)}::${cnpj}`;
    if (!k) continue;
    if (map[k]) continue;
    map[k] = true;
    out.push({ nome, cnpj });
  }
  return out;
}

// ✅ NOVO: extrai cliente mesmo se vier em formatos alternativos
function extractCliente(doc) {
  if (!doc) return null;

  // 1) já veio no formato certo
  if (doc.cliente && typeof doc.cliente === "object") {
    const nome = String(doc.cliente.nome || doc.cliente.cliente_nome || "").trim();
    const cnpj = onlyDigits(
      doc.cliente.cnpj || doc.cliente.doc || doc.cliente.cliente_doc || "",
    );
    if (nome || cnpj) return { nome, cnpj };
  }

  // 2) veio “espalhado” no doc
  const nome2 = String(doc.cliente_nome || doc.nome_cliente || "").trim();
  const cnpj2 = onlyDigits(doc.cliente_cnpj || doc.cnpj_cliente || doc.cliente_doc || "");
  if (nome2 || cnpj2) return { nome: nome2, cnpj: cnpj2 };

  // 3) fallback: cliente como string
  if (typeof doc.cliente === "string") {
    const nome3 = String(doc.cliente || "").trim();
    if (nome3) return { nome: nome3, cnpj: "" };
  }

  return null;
}

function normalizeDocWithCliente(doc) {
  const c = extractCliente(doc);
  return {
    ...doc,
    cliente: c ? { nome: String(c.nome || ""), cnpj: String(c.cnpj || "") } : null,
  };
}

export default function CreateTaskModal({
  isOpen,
  toggle,
  actorName,
  tipos,
  operadores,
  placas,
  motoristas,
  clientes,
  onConfirm,
  fetchDocByChave,
  isSubmitting,
}) {
  // blindagem
  const safeTipos = useMemo(() => safeArray(tipos), [tipos]);
  const safeOperadores = useMemo(() => safeArray(operadores), [operadores]);
  const safePlacas = useMemo(() => safeArray(placas), [placas]);
  const safeMotoristas = useMemo(() => safeArray(motoristas), [motoristas]);
  const safeClientes = useMemo(() => safeArray(clientes), [clientes]);

  const [busyKey, setBusyKey] = useState("");
  const busy = !!busyKey || !!isSubmitting;

  const runBusy = useCallback(
    async (key, fn) => {
      if (busy) return;
      setBusyKey(key);
      try {
        return await fn();
      } finally {
        setBusyKey("");
      }
    },
    [busy],
  );

  const [docKind, setDocKind] = useState("NFE");
  const [paletizada, setPaletizada] = useState(false);
  const [paletizadaTouched, setPaletizadaTouched] = useState(false);

  const [tipo, setTipo] = useState(safeTipos?.[0] || "Recebimento");
  const [docs, setDocs] = useState([]);
  const [chaveInput, setChaveInput] = useState("");

  const [isReading, setIsReading] = useState(false);
  const [readingCount, setReadingCount] = useState(0);

  const [mixedClientError, setMixedClientError] = useState(false);

  const [clienteManual, setClienteManual] = useState(null);

  const [totalPalletsOverride, setTotalPalletsOverride] = useState(null);

  const [observacao, setObservacao] = useState("");
  const [responsaveis, setResponsaveis] = useState([]);
  const [respQuery, setRespQuery] = useState("");
  const [respOpen, setRespOpen] = useState(false);

  const [recebimento, setRecebimento] = useState({
    motorista: "",
    chegadaAt: "",
    placaCavalo: "",
    placaCarreta: "",
  });

  const [expedicao, setExpedicao] = useState({
    motorista: "",
    chegadaAt: "",
    placaCavalo: "",
    placaCarreta: "",
  });

  const [logs, setLogs] = useState(() => [
    { at: nowIso(), by: "Sistema", action: "Modal aberto" },
  ]);

  const tipoNorm = normalizeText(tipo);
  const isRecebimento = tipoNorm === "recebimento";
  const isExpedicao = tipoNorm === "expedicao";
  const allowImport = isRecebimento;

  const pushLog = useCallback(
    (action, by) => {
      setLogs((prev) => [
        { at: nowIso(), by: by || actorName || "Usuário", action },
        ...prev,
      ]);
    },
    [actorName],
  );

  // reset ao abrir
  useEffect(() => {
    if (!isOpen) return;

    setBusyKey("");
    setDocKind("NFE");
    setTipo(safeTipos?.[0] || "Recebimento");
    setPaletizada(false);
    setPaletizadaTouched(false);

    setDocs([]);
    setChaveInput("");

    setIsReading(false);
    setReadingCount(0);

    setMixedClientError(false);
    setClienteManual(null);
    setTotalPalletsOverride(null);

    setObservacao("");
    setResponsaveis([]);
    setRespQuery("");
    setRespOpen(false);

    setRecebimento({
      motorista: "",
      chegadaAt: "",
      placaCavalo: "",
      placaCarreta: "",
    });

    setExpedicao({
      motorista: "",
      chegadaAt: "",
      placaCavalo: "",
      placaCarreta: "",
    });

    setLogs([{ at: nowIso(), by: "Sistema", action: "Modal aberto" }]);
  }, [isOpen, safeTipos]);

  // mudou tipo
  useEffect(() => {
    if (!isOpen) return;

    setDocs([]);
    setChaveInput("");
    setMixedClientError(false);
    setClienteManual(null);
    setTotalPalletsOverride(null);

    if (!isRecebimento) {
      setRecebimento({
        motorista: "",
        chegadaAt: "",
        placaCavalo: "",
        placaCarreta: "",
      });
      setDocKind("NFE");
    }
    if (!isExpedicao) {
      setExpedicao({
        motorista: "",
        chegadaAt: "",
        placaCavalo: "",
        placaCarreta: "",
      });
    }
  }, [tipo, isOpen, isRecebimento, isExpedicao]);

  useEffect(() => {
    if (!paletizada) setTotalPalletsOverride(null);
  }, [paletizada]);

  const availableOps = useMemo(() => {
    const selected = {};
    for (let i = 0; i < responsaveis.length; i++) selected[responsaveis[i]] = true;

    const q = normalizeText(respQuery);
    const out = [];
    for (let i = 0; i < safeOperadores.length; i++) {
      const name = String(safeOperadores[i] || "").trim();
      if (!name) continue;
      if (selected[name]) continue;
      if (!q || normalizeText(name).includes(q)) out.push(name);
    }
    return out;
  }, [safeOperadores, responsaveis, respQuery]);

  const addResponsavel = (name) => {
    if (busy) return;
    const n = String(name || "").trim();
    if (!n) return;

    for (let i = 0; i < responsaveis.length; i++) if (responsaveis[i] === n) return;

    setResponsaveis((prev) => [...prev, n]);
    pushLog(`Responsável adicionado: ${n}`);
    setRespQuery("");
    setRespOpen(false);
  };

  const removeResponsavel = (name) => {
    if (busy) return;
    setResponsaveis((prev) => {
      const next = [];
      for (let i = 0; i < prev.length; i++) if (prev[i] !== name) next.push(prev[i]);
      return next;
    });
    pushLog(`Responsável removido: ${name}`);
  };

  const onRespKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (availableOps.length === 1) addResponsavel(availableOps[0]);
    }
    if (e.key === "Escape") setRespOpen(false);
  };

  const hasXmlDoc = useMemo(() => {
    for (let i = 0; i < docs.length; i++) {
      if (String(docs[i]?.source || "").toLowerCase() === "xml") return true;
    }
    return false;
  }, [docs]);

  const manualMode = useMemo(() => isRecebimento && !hasXmlDoc, [isRecebimento, hasXmlDoc]);

  const clienteDefinido = useMemo(() => {
    if ((!Array.isArray(docs) || docs.length === 0) && manualMode) {
      if (!clienteManual) return null;
      return { mixed: false, nome: clienteManual.nome || "", cnpj: clienteManual.cnpj || "" };
    }

    if (!Array.isArray(docs) || docs.length === 0) return null;

    const c0 = docs[0]?.cliente || null;
    if (!c0) return null;

    for (let i = 1; i < docs.length; i++) {
      if (!sameClient(c0, docs[i]?.cliente || null)) {
        return { mixed: true, nome: "", cnpj: "" };
      }
    }

    return { mixed: false, nome: c0.nome || "", cnpj: c0.cnpj || "" };
  }, [docs, manualMode, clienteManual]);

  const totalsFromDocs = useMemo(() => sumDocsTotals(docs), [docs]);

  const totalPalletsFinal = useMemo(() => {
    if (!paletizada) return 0;

    if (totalPalletsOverride !== null && totalPalletsOverride !== undefined) {
      return Number(totalPalletsOverride || 0);
    }

    return Number(totalsFromDocs.totalPalletsFromDocs || 0);
  }, [paletizada, totalPalletsOverride, totalsFromDocs]);

  const tryAddDocToDemand = (doc) => {
    if (!doc) return { ok: false, reason: "doc_nulo" };
    if (!doc.chave || String(doc.chave).length !== 44) return { ok: false, reason: "chave_invalida" };

    for (let i = 0; i < docs.length; i++) {
      if (docs[i].chave === doc.chave) return { ok: false, reason: "duplicado" };
    }

    const normalized = normalizeDocWithCliente(doc);

    if (!isExpedicao) {
      const targetClient = docs.length ? docs[0]?.cliente : null;
      if (targetClient && !sameClient(targetClient, normalized.cliente)) {
        return { ok: false, reason: "cliente_diferente" };
      }
    }

    const statusIni = isRecebimento ? "RECEBIDA" : "EM_PROCESSO";

    const item = {
      ...normalized,
      status: normalized.status || statusIni,
      statusAt: normalized.statusAt || nowIso(),
      importedAt: normalized.importedAt || nowIso(),
    };

    setDocs((prev) => [...prev, item]);
    return { ok: true };
  };

  const removeDoc = (id) => {
    if (busy) return;
    setDocs((prev) => {
      const next = [];
      for (let i = 0; i < prev.length; i++) if (prev[i].id !== id) next.push(prev[i]);
      return next;
    });
    pushLog(`Documento removido: ${id}`);
  };

  const importFiles = async (files) => {
    if (!allowImport) {
      pushLog("Importação XML permitida somente no Recebimento");
      return;
    }
    if (!files || !files.length) return;

    await runBusy("import", async () => {
      setIsReading(true);
      setReadingCount(files.length);
      pushLog(`Importação iniciada: ${files.length} arquivo(s)`);

      try {
        setMixedClientError(false);

        let inserted = 0;
        let rejectedClient = 0;
        let ignoredInvalid = 0;

        for (let f = 0; f < files.length; f++) {
          const file = files[f];
          const name = String(file.name || "").toLowerCase();

          if (name.endsWith(".zip")) {
            const xmlTexts = await readZipToXmlTexts(file);
            pushLog(`ZIP aberto: ${xmlTexts.length} XML(s)`);

            for (let i = 0; i < xmlTexts.length; i++) {
              const parsed = parseXmlTextToDoc(xmlTexts[i], docKind);
              if (!parsed) {
                ignoredInvalid++;
                continue;
              }

              const r = tryAddDocToDemand(parsed);
              if (r.ok) inserted++;
              else if (r.reason === "cliente_diferente") rejectedClient++;
              else if (r.reason !== "duplicado") ignoredInvalid++;
            }
          } else {
            const text = await file.text();
            const parsed = parseXmlTextToDoc(text, docKind);
            if (!parsed) {
              ignoredInvalid++;
              continue;
            }

            const r = tryAddDocToDemand(parsed);
            if (r.ok) inserted++;
            else if (r.reason === "cliente_diferente") rejectedClient++;
            else if (r.reason !== "duplicado") ignoredInvalid++;
          }
        }

        if (rejectedClient) pushLog(`⚠️ Rejeitado(s): ${rejectedClient} XML(s) (cliente diferente)`);
        if (ignoredInvalid) pushLog(`Ignorado(s): ${ignoredInvalid} XML(s) inválido(s)`);
        pushLog(`Importação concluída: ${inserted} doc(s) inserido(s)`);

        setClienteManual(null);
      } catch (err) {
        pushLog(`Erro importando: ${String(err?.message || err)}`);
      } finally {
        setIsReading(false);
        setReadingCount(0);
      }
    });
  };

  const allowManualReceb = !!clienteDefinido && !clienteDefinido.mixed;

  const addByChave = async (raw) => {
    const chave = sanitizeChave44(raw);

    if (!chave) {
      pushLog("Chave inválida (precisa 44 dígitos)");
      return;
    }

    await runBusy("add-chave", async () => {
      if (!isRecebimento) {
        if (typeof fetchDocByChave !== "function") {
          pushLog("Busca no banco não configurada (falta fetchDocByChave)");
          return;
        }

        try {
          let found = await fetchDocByChave(chave, "NFE");
          if (!found) found = await fetchDocByChave(chave, "CTE");

          if (!found) {
            pushLog(`Não encontrado no banco: ${chave}`);
            return;
          }

          const foundNorm = normalizeDocWithCliente(found);

          const meta = inferDocMetaFromDoc(foundNorm);
          setDocKind(meta.docKind);
          if (!paletizadaTouched) setPaletizada(meta.paletizada);

          const r = tryAddDocToDemand(foundNorm);
          if (!r.ok) {
            if (r.reason === "cliente_diferente")
              pushLog("Essa chave é de outro cliente. Não pode misturar (exceto Expedição).");
            else if (r.reason === "duplicado") pushLog("Chave já adicionada.");
            else pushLog("Falha ao inserir chave.");
            return;
          }

          pushLog(`Chave adicionada: ${chave}`);
          return;
        } catch (e) {
          pushLog(`Erro buscando chave: ${String(e?.message || e)}`);
          return;
        }
      }

      if (!allowManualReceb) {
        pushLog("Selecione o cliente (manual) OU importe XML/ZIP antes de bipar.");
        return;
      }

      const uuid =
        typeof window !== "undefined" &&
        window.crypto &&
        window.crypto.randomUUID
          ? window.crypto.randomUUID()
          : `m-${Date.now()}-${Math.random()}`;

      const item = {
        id: uuid,
        docKind,
        source: "manual",
        chave,
        cliente: docs[0]?.cliente || clienteManual || null,
        volumes: 0,
        pallets: 0,
        pesoKg: 0,
        status: "RECEBIDA",
        statusAt: nowIso(),
        importedAt: nowIso(),
      };

      const r = tryAddDocToDemand(item);
      if (r.ok) pushLog(`Chave manual adicionada: ${chave}`);
      else if (r.reason === "duplicado") pushLog("Chave já adicionada.");
      else if (r.reason === "cliente_diferente") pushLog("Chave pertence a outro cliente.");
      else pushLog("Não foi possível adicionar a chave.");
    });
  };

  const onChaveKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const raw = chaveInput;
      setChaveInput("");
      addByChave(raw);
    }
  };

  const updateDocMetric = (id, field, value) => {
    if (!isRecebimento) return;
    if (busy) return;

    setDocs((prev) => {
      const next = [];
      for (let i = 0; i < prev.length; i++) {
        const it = prev[i];
        if (it.id === id) next.push({ ...it, [field]: value });
        else next.push(it);
      }
      return next;
    });
  };

  const clientesListFromDocs = useMemo(() => uniqueClientsFromDocs(docs), [docs]);

  const canConfirm = useMemo(() => {
    if (!tipo) return false;
    if (!Array.isArray(responsaveis) || responsaveis.length === 0) return false;
    if (!Array.isArray(docs) || docs.length === 0) return false;

    if (!isExpedicao) {
      if (!clienteDefinido || clienteDefinido.mixed) return false;
      if (mixedClientError) return false;
    }

    if (isRecebimento) {
      if (!String(recebimento.motorista || "").trim()) return false;
      if (!String(recebimento.chegadaAt || "").trim()) return false;
      if (!String(recebimento.placaCavalo || "").trim()) return false;
    }

    if (isExpedicao) {
      if (!String(expedicao.motorista || "").trim()) return false;
      if (!String(expedicao.chegadaAt || "").trim()) return false;
      if (!String(expedicao.placaCavalo || "").trim()) return false;
    }

    for (let i = 0; i < docs.length; i++) {
      if (!docs[i].chave || String(docs[i].chave).length !== 44) return false;
    }

    if (Number(totalsFromDocs.totalPesoKg) <= 0) return false;

    if (paletizada) {
      if (Number(totalPalletsFinal) <= 0) return false;
    } else {
      if (Number(totalsFromDocs.totalVolumes) <= 0) return false;
    }

    return true;
  }, [
    tipo,
    responsaveis,
    docs,
    clienteDefinido,
    mixedClientError,
    isRecebimento,
    recebimento,
    totalsFromDocs,
    paletizada,
    totalPalletsFinal,
    isExpedicao,
    expedicao,
  ]);

  const confirm = async () => {
    if (busy) return;

    await runBusy("confirm", async () => {
      if (String(observacao || "").trim()) pushLog("Observação definida/atualizada");

      // ✅ normaliza docs (garante cliente por doc)
      const docsNormalized = (Array.isArray(docs) ? docs : []).map((d) =>
        normalizeDocWithCliente(d),
      );

      // ✅ clientes únicos a partir dos docs normalizados
      const clientesUnicos = uniqueClientsFromDocs(docsNormalized);

      // ✅ cliente REAL do topo: só se for único
      let clienteTop = null;

      // ✅ resumo pra UI (pode virar "MÚLTIPLOS")
      let clienteResumo = null;

      if (isExpedicao) {
        if (clientesUnicos.length === 1) {
          clienteTop = {
            nome: clientesUnicos[0].nome || "",
            cnpj: clientesUnicos[0].cnpj || "",
          };
          clienteResumo = clienteTop;
        } else if (clientesUnicos.length > 1) {
          // ⚠️ NÃO mande "MÚLTIPLOS" como cliente REAL
          clienteTop = null;
          clienteResumo = { nome: "MÚLTIPLOS", cnpj: "" };
        } else {
          clienteTop = null;
          clienteResumo = null;
        }
      } else {
        clienteTop = { nome: clienteDefinido?.nome || "", cnpj: clienteDefinido?.cnpj || "" };
        clienteResumo = clienteTop;
      }

      const payload = {
        docKind,
        tipo,
        paletizada,

        // ✅ cliente REAL (apenas se único)
        cliente: clienteTop,

        // ✅ resumo (para exibição / logs no front)
        clienteResumo,

        // ✅ lista de clientes (para exibição quando expedição)
        clientes: isExpedicao ? clientesUnicos : null,

        totalPalletsOverride: paletizada ? Number(totalPalletsFinal || 0) : null,

        // ✅ cada doc com seu cliente correto (nome/cnpj)
        docs: docsNormalized.map((d) => ({
          docKind: d.docKind || docKind,
          source: d.source,
          chave: d.chave,

          cliente: d.cliente
            ? { nome: String(d.cliente.nome || ""), cnpj: String(d.cliente.cnpj || "") }
            : null,

          volumes: Number(d.volumes || 0),
          pallets: Number(d.pallets || 0),
          pesoKg: Number(d.pesoKg || 0),

          status: d.status || (isRecebimento ? "RECEBIDA" : "EM_PROCESSO"),
          statusAt: d.statusAt || nowIso(),
        })),

        observacao,
        responsaveis,

        recebimento: isRecebimento
          ? {
              motorista: recebimento.motorista,
              chegadaAt: recebimento.chegadaAt,
              placaCavalo: recebimento.placaCavalo,
              placaCarreta: recebimento.placaCarreta,
            }
          : null,

        expedicao: isExpedicao
          ? {
              motorista: expedicao.motorista,
              chegadaAt: expedicao.chegadaAt,
              placaCavalo: expedicao.placaCavalo,
              placaCarreta: expedicao.placaCarreta,
            }
          : null,

        logs,
        createdBy: actorName,
      };

      await onConfirm(payload);
    });
  };

  const blockClose = busy || isReading;

  return (
    <>
      <GlobalModalStyles />

      <Modal
        isOpen={isOpen}
        toggle={blockClose ? undefined : toggle}
        centered
        size="lg"
        contentClassName={MODAL_CLASS}
        backdrop={blockClose ? "static" : true}
        keyboard={!blockClose}
      >
        <ModalHeader toggle={blockClose ? undefined : toggle}>
          Criar tarefa • Operação
          <MiniNote>
            Status inicial: <b>PROGRAMADA</b>
          </MiniNote>
        </ModalHeader>

        <ModalBody>
          <Grid>
            <TipoSection
              tipo={tipo}
              setTipo={setTipo}
              busy={busy}
              safeTipos={safeTipos}
              pushLog={pushLog}
              isRecebimento={isRecebimento}
              isExpedicao={isExpedicao}
            />

            <RecebimentoImportSection
              show={isRecebimento}
              busy={busy}
              docKind={docKind}
              setDocKind={setDocKind}
              pushLog={pushLog}
              setDocs={setDocs}
              setChaveInput={setChaveInput}
              setMixedClientError={setMixedClientError}
              setClienteManual={setClienteManual}
              setTotalPalletsOverride={setTotalPalletsOverride}
              busyKey={busyKey}
              isReading={isReading}
              readingCount={readingCount}
              importFiles={importFiles}
            />

            <CargaSection
              busy={busy}
              paletizada={paletizada}
              setPaletizada={setPaletizada}
              setPaletizadaTouched={setPaletizadaTouched}
              pushLog={pushLog}
            />

            <ExpedicaoSection
              show={isExpedicao}
              busy={busy}
              expedicao={expedicao}
              setExpedicao={setExpedicao}
              safeMotoristas={safeMotoristas}
              safePlacas={safePlacas}
            />

            <ClienteSection
              docs={docs}
              busy={busy}
              manualMode={manualMode}
              safeClientes={safeClientes}
              clienteManual={clienteManual}
              setClienteManual={setClienteManual}
              pushLog={pushLog}
              clienteDefinido={clienteDefinido}
              mixedClientError={mixedClientError}
              isRecebimento={isRecebimento}
              isExpedicao={isExpedicao}
              clientesListFromDocs={clientesListFromDocs}
              clientKey={clientKey}
            />

            <TotalsSection
              busy={busy}
              paletizada={paletizada}
              totalsFromDocs={totalsFromDocs}
              totalPalletsFinal={totalPalletsFinal}
              setTotalPalletsOverride={setTotalPalletsOverride}
              pushLog={pushLog}
            />

            <RecebimentoSection
              show={isRecebimento}
              busy={busy}
              recebimento={recebimento}
              setRecebimento={setRecebimento}
              safeMotoristas={safeMotoristas}
              safePlacas={safePlacas}
            />

            <ChaveEntrySection
              busy={busy}
              busyKey={busyKey}
              isRecebimento={isRecebimento}
              isExpedicao={isExpedicao}
              allowManualReceb={allowManualReceb}
              docsCount={Array.isArray(docs) ? docs.length : 0}
              chaveInput={chaveInput}
              setChaveInput={setChaveInput}
              onChaveKeyDown={onChaveKeyDown}
              addByChave={addByChave}
              pushLog={pushLog}
            />

            <DocsChipsSection
              docs={docs}
              isRecebimento={isRecebimento}
              isExpedicao={isExpedicao}
              clienteDefinido={clienteDefinido}
              mixedClientError={mixedClientError}
              busy={busy}
              removeDoc={removeDoc}
              updateDocMetric={updateDocMetric}
            />

            <ResponsaveisSection
              busy={busy}
              responsaveis={responsaveis}
              respQuery={respQuery}
              setRespQuery={setRespQuery}
              respOpen={respOpen}
              setRespOpen={setRespOpen}
              availableOps={availableOps}
              addResponsavel={addResponsavel}
              removeResponsavel={removeResponsavel}
              onRespKeyDown={onRespKeyDown}
            />

            <ObservacaoSection busy={busy} observacao={observacao} setObservacao={setObservacao} />
          </Grid>

          <Divider />

          <LogsSection logs={logs} />
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={blockClose}>
            {busy ? "Aguarde..." : "Cancelar"}
          </Button>

          <Button color="primary" onClick={confirm} disabled={!canConfirm || busy}>
            {busyKey === "confirm" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Loader /> Criando...
              </span>
            ) : (
              "Criar tarefa"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
