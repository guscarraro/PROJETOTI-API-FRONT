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
  const cnpj = String(c.cnpj || "").trim();
  const nome = String(c.nome || "").trim();
  if (cnpj) return `CNPJ:${cnpj}`;
  if (nome) return `NOME:${nome.toLowerCase()}`;
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

// tenta inferir docKind/paletizada a partir do doc retornado do banco
function inferDocMetaFromDoc(doc) {
  const dk = String(doc?.docKind || doc?.doc_kind || "")
    .toUpperCase()
    .trim();
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
    const k = clientKey(c);
    if (!k) continue;
    if (map[k]) continue;
    map[k] = true;
    out.push({ nome: String(c.nome || ""), cnpj: String(c.cnpj || "") });
  }
  return out;
}

export default function CreateTaskModal({
  isOpen,
  toggle,
  actorName,
  tipos,
  operadores, // somente Operação
  placas,
  motoristas, // todos
  clientes, // lista de clientes cadastrados (para modo manual)
  onConfirm,
  fetchDocByChave,
  isSubmitting,
}) {
  // ✅ blindagem
  const safeTipos = useMemo(() => safeArray(tipos), [tipos]);
  const safeOperadores = useMemo(() => safeArray(operadores), [operadores]);
  const safePlacas = useMemo(() => safeArray(placas), [placas]);
  const safeMotoristas = useMemo(() => safeArray(motoristas), [motoristas]);
  const safeClientes = useMemo(() => safeArray(clientes), [clientes]);

  // ✅ processamento
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

  // RECEBIMENTO: usuário escolhe
  const [docKind, setDocKind] = useState("NFE");
  const [paletizada, setPaletizada] = useState(false);
  const [paletizadaTouched, setPaletizadaTouched] = useState(false);

  const [tipo, setTipo] = useState(safeTipos?.[0] || "Recebimento");
  const [docs, setDocs] = useState([]);
  const [chaveInput, setChaveInput] = useState("");

  const [isReading, setIsReading] = useState(false);
  const [readingCount, setReadingCount] = useState(0);

  const [mixedClientError, setMixedClientError] = useState(false);

  // ✅ Cliente manual (apenas cenário: recebimento + sem XML importado)
  const [clienteManual, setClienteManual] = useState(null);

  // RECEBIMENTO: override de pallets
  const [totalPalletsOverride, setTotalPalletsOverride] = useState(null);

  // Sempre: responsáveis + observação
  const [observacao, setObservacao] = useState("");
  const [responsaveis, setResponsaveis] = useState([]);
  const [respQuery, setRespQuery] = useState("");
  const [respOpen, setRespOpen] = useState(false);

  // Só RECEBIMENTO
  const [recebimento, setRecebimento] = useState({
    motorista: "",
    chegadaAt: "",
    placaCavalo: "",
    placaCarreta: "",
  });

  // ✅ NOVO: EXPEDIÇÃO (motorista + placa)
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
  const isExpedicao = tipoNorm === "expedicao"; // "Expedição" vira "expedicao"
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

  // reset quando abre
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

  // mudou tipo -> reseta docs
  useEffect(() => {
    if (!isOpen) return;

    setDocs([]);
    setChaveInput("");

    // ✅ regra do cliente: só trava para não-expedição
    setMixedClientError(false);

    setClienteManual(null);
    setTotalPalletsOverride(null);

    // reset campos de receb/exped conforme troca de tipo (pra não vazar)
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
    for (let i = 0; i < responsaveis.length; i++)
      selected[responsaveis[i]] = true;

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

    for (let i = 0; i < responsaveis.length; i++)
      if (responsaveis[i] === n) return;

    setResponsaveis((prev) => [...prev, n]);
    pushLog(`Responsável adicionado: ${n}`);
    setRespQuery("");
    setRespOpen(false);
  };

  const removeResponsavel = (name) => {
    if (busy) return;
    setResponsaveis((prev) => {
      const next = [];
      for (let i = 0; i < prev.length; i++)
        if (prev[i] !== name) next.push(prev[i]);
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

  // ✅ modo manual = recebimento + sem XML importado
  const manualMode = useMemo(
    () => isRecebimento && !hasXmlDoc,
    [isRecebimento, hasXmlDoc],
  );

  const clienteDefinido = useMemo(() => {
    // ✅ se não tem docs e está no modo manual, usa o cliente selecionado
    if ((!Array.isArray(docs) || docs.length === 0) && manualMode) {
      if (!clienteManual) return null;
      return {
        mixed: false,
        nome: clienteManual.nome || "",
        cnpj: clienteManual.cnpj || "",
      };
    }

    if (!Array.isArray(docs) || docs.length === 0) return null;
    const c0 = docs[0]?.cliente || null;
    if (!c0) return null;

    for (let i = 1; i < docs.length; i++) {
      if (!sameClient(c0, docs[i]?.cliente || null)) {
        // ✅ Expedição permite misturar
        if (isExpedicao) {
          return { mixed: true, nome: "", cnpj: "" };
        }
        return { mixed: true, nome: "", cnpj: "" };
      }
    }

    return { mixed: false, nome: c0.nome || "", cnpj: c0.cnpj || "" };
  }, [docs, manualMode, clienteManual, isExpedicao]);

  const totalsFromDocs = useMemo(() => sumDocsTotals(docs), [docs]);

  const totalPalletsFinal = useMemo(() => {
    if (!paletizada) return 0;

    if (totalPalletsOverride !== null && totalPalletsOverride !== undefined) {
      return Number(totalPalletsOverride || 0);
    }

    const fromDocs = Number(totalsFromDocs.totalPalletsFromDocs || 0);
    return fromDocs;
  }, [paletizada, totalPalletsOverride, totalsFromDocs]);

  // ✅ regra de cliente: só trava mistura quando NÃO for expedição
  const tryAddDocToDemand = (doc) => {
    if (!doc) return { ok: false, reason: "doc_nulo" };
    if (!doc.chave || String(doc.chave).length !== 44)
      return { ok: false, reason: "chave_invalida" };

    for (let i = 0; i < docs.length; i++) {
      if (docs[i].chave === doc.chave)
        return { ok: false, reason: "duplicado" };
    }

    // ✅ Expedição: pode ter múltiplos clientes
    if (!isExpedicao) {
      const targetClient = docs.length ? docs[0]?.cliente : null;
      if (targetClient && !sameClient(targetClient, doc.cliente)) {
        return { ok: false, reason: "cliente_diferente" };
      }
    }

    const statusIni = isRecebimento ? "RECEBIDA" : "EM_PROCESSO";

    const item = {
      ...doc,
      status: doc.status || statusIni,
      statusAt: doc.statusAt || nowIso(),
      importedAt: doc.importedAt || nowIso(),
    };

    setDocs((prev) => [...prev, item]);
    return { ok: true };
  };

  const removeDoc = (id) => {
    if (busy) return;
    setDocs((prev) => {
      const next = [];
      for (let i = 0; i < prev.length; i++)
        if (prev[i].id !== id) next.push(prev[i]);
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

        if (rejectedClient)
          pushLog(
            `⚠️ Rejeitado(s): ${rejectedClient} XML(s) (cliente diferente)`,
          );
        if (ignoredInvalid)
          pushLog(`Ignorado(s): ${ignoredInvalid} XML(s) inválido(s)`);
        pushLog(`Importação concluída: ${inserted} doc(s) inserido(s)`);

        // ✅ se importou XML, trava cliente manual (fluxo bonito)
        setClienteManual(null);
      } catch (err) {
        pushLog(`Erro importando: ${String(err?.message || err)}`);
      } finally {
        setIsReading(false);
        setReadingCount(0);
      }
    });
  };

  // ✅ Recebimento manual: libera se cliente definido (via dropdown manual OU via XML)
  const allowManualReceb = !!clienteDefinido && !clienteDefinido.mixed;

  const addByChave = async (raw) => {
    const chave = sanitizeChave44(raw);

    if (!chave) {
      pushLog("Chave inválida (precisa 44 dígitos)");
      return;
    }

    await runBusy("add-chave", async () => {
      // Fora recebimento: busca no banco e infere meta
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

          const meta = inferDocMetaFromDoc(found);
          setDocKind(meta.docKind);
          if (!paletizadaTouched) {
            setPaletizada(meta.paletizada);
          }

          const r = tryAddDocToDemand(found);
          if (!r.ok) {
            if (r.reason === "cliente_diferente")
              pushLog(
                "Essa chave é de outro cliente. Não pode misturar (exceto Expedição).",
              );
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

      // Recebimento manual
      if (!allowManualReceb) {
        pushLog(
          "Selecione o cliente (manual) OU importe XML/ZIP antes de bipar.",
        );
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
      else if (r.reason === "cliente_diferente")
        pushLog("Chave pertence a outro cliente.");
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

  const clientesListFromDocs = useMemo(
    () => uniqueClientsFromDocs(docs),
    [docs],
  );

  const canConfirm = useMemo(() => {
    if (!tipo) return false;
    if (!Array.isArray(responsaveis) || responsaveis.length === 0) return false;
    if (!Array.isArray(docs) || docs.length === 0) return false;

    // ✅ regra do cliente:
    // - Expedição: permite múltiplos clientes
    // - Outras: não permite misturar
    if (!isExpedicao) {
      if (!clienteDefinido || clienteDefinido.mixed) return false;
      if (mixedClientError) return false;
    }

    if (isRecebimento) {
      if (!String(recebimento.motorista || "").trim()) return false;
      if (!String(recebimento.chegadaAt || "").trim()) return false;
      if (!String(recebimento.placaCavalo || "").trim()) return false;
      if (!String(recebimento.placaCarreta || "").trim()) return false;
    }

    // ✅ Expedição: obrigatório motorista + placa (pra saber quem vai carregar)
    if (isExpedicao) {
      if (!String(expedicao.motorista || "").trim()) return false;
      if (!String(expedicao.chegadaAt || "").trim()) return false;
      if (!String(expedicao.placaCavalo || "").trim()) return false;
      if (!String(expedicao.placaCarreta || "").trim()) return false;
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
      if (String(observacao || "").trim())
        pushLog("Observação definida/atualizada");

      // ✅ cliente no payload:
      // - Expedição (misto): manda "MÚLTIPLOS" e também lista "clientes"
      // - Outros: manda o cliente único
      let clientePayload = null;

      if (isExpedicao) {
        if (clientesListFromDocs.length > 1) {
          clientePayload = { nome: "MÚLTIPLOS", cnpj: "" };
        } else if (clientesListFromDocs.length === 1) {
          clientePayload = {
            nome: clientesListFromDocs[0].nome || "",
            cnpj: clientesListFromDocs[0].cnpj || "",
          };
        } else {
          // sem cliente nos docs (raro), mas não quebra
          clientePayload = { nome: "", cnpj: "" };
        }
      } else {
        clientePayload = {
          nome: clienteDefinido?.nome || "",
          cnpj: clienteDefinido?.cnpj || "",
        };
      }

      const payload = {
        docKind,
        tipo,
        paletizada,

        cliente: clientePayload,

        // ✅ útil pro back entender que expedição pode ser multi
        clientes: isExpedicao ? clientesListFromDocs : null,

        totalPalletsOverride: paletizada
          ? Number(totalPalletsFinal || 0)
          : null,

        docs: (Array.isArray(docs) ? docs : []).map((d) => ({
          docKind: d.docKind || docKind,
          source: d.source,
          chave: d.chave,

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

        // ✅ NOVO: expedição
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
            {/* Topo: Tipo */}
            <CompactTop3>
              <Field style={{ gridColumn: "1 / -1" }}>
                <Label>Tipo</Label>
                <MicroSelect
                  value={tipo}
                  disabled={busy}
                  onChange={(e) => {
                    setTipo(e.target.value);
                    pushLog(`Tipo: ${e.target.value}`);
                  }}
                >
                  {safeTipos.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </MicroSelect>

                <Hint>
                  {isRecebimento
                    ? "Recebimento: permite escolher NF/CT-e e carga, além de importar XML."
                    : isExpedicao
                      ? "Expedição: permite múltiplos clientes em notas diferentes + informar motorista/placa."
                      : "Demais etapas: só bipa chave 44. Todo o resto vem automaticamente da nota."}
                </Hint>
              </Field>
            </CompactTop3>

            {/* Somente no Recebimento */}
            {isRecebimento ? (
              <>
                <CompactTop3>
                  <Field>
                    <Label>Documento</Label>
                    <Row style={{ gap: 6 }}>
                      <Pill
                        type="button"
                        disabled={busy}
                        $active={docKind === "NFE"}
                        onClick={() => {
                          if (busy) return;
                          setDocKind("NFE");
                          pushLog("Documento selecionado: NF-e");
                          setDocs([]);
                          setChaveInput("");
                          setMixedClientError(false);
                          setClienteManual(null);
                          setTotalPalletsOverride(null);
                        }}
                      >
                        NF-e
                      </Pill>
                      <Pill
                        type="button"
                        disabled={busy}
                        $active={docKind === "CTE"}
                        onClick={() => {
                          if (busy) return;
                          setDocKind("CTE");
                          pushLog("Documento selecionado: CT-e");
                          setDocs([]);
                          setChaveInput("");
                          setMixedClientError(false);
                          setClienteManual(null);
                          setTotalPalletsOverride(null);
                        }}
                      >
                        CT-e
                      </Pill>
                    </Row>
                    <Hint>
                      NF-e: cliente = remetente • CT-e: cliente = tomador
                    </Hint>
                  </Field>
                </CompactTop3>

                <Field style={{ gridColumn: "1 / -1" }}>
                  <DropZoneTop>
                    <Label>Importar XML/ZIP</Label>
                    <DropCounter>
                      {busyKey === "import" ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Loader /> Lendo {readingCount || 0} arquivo(s)...
                        </span>
                      ) : isReading ? (
                        `Lendo ${readingCount} arquivo(s)...`
                      ) : (
                        "Arraste aqui ou clique"
                      )}
                    </DropCounter>
                  </DropZoneTop>

                  <DocImportDropzone
                    disabled={busy}
                    onFiles={(files) => importFiles(files)}
                  />
                  <Hint>XML de cliente diferente é recusado e não entra.</Hint>
                </Field>
              </>
            ) : null}
            <Field>
              <Label>Carga</Label>
              <Row style={{ gap: 6 }}>
                <Pill
                  type="button"
                  disabled={busy}
                  $active={!paletizada}
                  onClick={() => {
                    if (busy) return;
                    setPaletizadaTouched(true);
                    setPaletizada(false);
                    pushLog("Carga: SOLTA");
                  }}
                >
                  Solta
                </Pill>

                <Pill
                  type="button"
                  disabled={busy}
                  $active={paletizada}
                  onClick={() => {
                    if (busy) return;
                    setPaletizadaTouched(true);
                    setPaletizada(true);
                    pushLog("Carga: PALETIZADA");
                  }}
                >
                  Paletizada
                </Pill>
              </Row>
              <Hint>
                {paletizada ? "Total por pallets." : "Total por volumes."}
              </Hint>
            </Field>
            {/* ✅ NOVO: Expedição */}
            {isExpedicao ? (
              <Field style={{ gridColumn: "1 / -1" }}>
                <SectionTitle>Expedição (quem vai carregar)</SectionTitle>

                <CompactGrid4>
                  <CompactField>
                    <Label>Motorista *</Label>
                    <MicroSelect
                      value={expedicao.motorista || ""}
                      disabled={busy}
                      onChange={(e) =>
                        setExpedicao((p) => ({
                          ...p,
                          motorista: e.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione...</option>
                      {safeMotoristas.map((m) => (
                        <option key={m} value={String(m)}>
                          {String(m)}
                        </option>
                      ))}
                    </MicroSelect>
                  </CompactField>

                  <CompactField>
                    <Label>Chegada *</Label>
                    <MiniInput
                      disabled={busy}
                      type="datetime-local"
                      value={expedicao.chegadaAt || ""}
                      onChange={(e) =>
                        setExpedicao((p) => ({
                          ...p,
                          chegadaAt: e.target.value,
                        }))
                      }
                    />
                  </CompactField>

                  <CompactField>
                    <Label>Placa cavalo *</Label>
                    <MicroSelect
                      value={expedicao.placaCavalo || ""}
                      disabled={busy}
                      onChange={(e) =>
                        setExpedicao((p) => ({
                          ...p,
                          placaCavalo: e.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione...</option>
                      {safePlacas.map((pl) => (
                        <option key={`exp-cav-${pl}`} value={String(pl)}>
                          {String(pl)}
                        </option>
                      ))}
                    </MicroSelect>
                  </CompactField>

                  <CompactField>
                    <Label>Placa carreta *</Label>
                    <MicroSelect
                      value={expedicao.placaCarreta || ""}
                      disabled={busy}
                      onChange={(e) =>
                        setExpedicao((p) => ({
                          ...p,
                          placaCarreta: e.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione...</option>
                      {safePlacas.map((pl) => (
                        <option key={`exp-car-${pl}`} value={String(pl)}>
                          {String(pl)}
                        </option>
                      ))}
                    </MicroSelect>
                  </CompactField>
                </CompactGrid4>
              </Field>
            ) : null}

            {/* Cliente */}
            <Field style={{ gridColumn: "1 / -1" }}>
              <SectionTitle>Cliente da demanda</SectionTitle>

              {/* ✅ Somente quando for bipar (sem XML): deixa escolher cliente */}
              {manualMode ? (
                <>
                  <Label>Cliente (manual)</Label>
                  <MicroSelect
                    value={clienteManual ? clientKey(clienteManual) : ""}
                    disabled={busy}
                    onChange={(e) => {
                      const key = e.target.value;
                      let found = null;

                      for (let i = 0; i < safeClientes.length; i++) {
                        const c = safeClientes[i];
                        if (clientKey(c) === key) {
                          found = c;
                          break;
                        }
                      }

                      setClienteManual(found);
                      if (found) pushLog(`Cliente manual: ${found.nome}`);
                    }}
                  >
                    <option value="">Selecione...</option>
                    {safeClientes.map((c) => (
                      <option key={clientKey(c) || c.nome} value={clientKey(c)}>
                        {String(c.nome || "—")}
                        {String(c.cnpj || "").trim()
                          ? ` • ${String(c.cnpj).trim()}`
                          : ""}
                      </option>
                    ))}
                  </MicroSelect>

                  <Hint>
                    Use isso apenas quando for bipar a chave (sem importar XML).
                    Se importar XML/ZIP, o cliente vem automático.
                  </Hint>
                </>
              ) : null}

              {!docs.length ? (
                <Hint>
                  Sem documentos ainda.{" "}
                  {isRecebimento
                    ? "Importe XML/ZIP ou selecione cliente manual e bipa a chave."
                    : "Bipe a chave 44."}
                </Hint>
              ) : clienteDefinido?.mixed || mixedClientError ? (
                isExpedicao ? (
                  <Hint style={{ color: "#1f2937" }}>
                    Múltiplos clientes detectados —{" "}
                    <b>permitido na Expedição</b>.
                  </Hint>
                ) : (
                  <Hint style={{ color: "#c0392b" }}>
                    Múltiplos clientes detectados. Não pode misturar.
                  </Hint>
                )
              ) : (
                <DocMetaBox>
                  <DocMetaRow>
                    <b>Cliente:</b> {clienteDefinido?.nome || "—"}{" "}
                    {clienteDefinido?.cnpj ? `• ${clienteDefinido.cnpj}` : ""}
                  </DocMetaRow>
                </DocMetaBox>
              )}
            </Field>

            {/* Totais */}

            <>
              <Field>
                <Label>Total Volumes</Label>
                <MiniInput
                  type="number"
                  value={totalsFromDocs.totalVolumes}
                  readOnly
                  disabled
                />
                <Hint>Imutável (vem das notas).</Hint>
              </Field>

              <Field>
                <Label>Total Pallets</Label>
                <MiniInput
                  type="number"
                  min="0"
                  value={paletizada ? totalPalletsFinal : 0}
                  disabled={busy || !paletizada}
                  readOnly={!paletizada}
                  onChange={(e) => {
                    const v = Number(e.target.value || 0);
                    setTotalPalletsOverride(v);
                  }}
                  onBlur={() => {
                    if (paletizada)
                      pushLog(`Total pallets ajustado: ${totalPalletsFinal}`);
                  }}
                  placeholder="0"
                />
                <Hint>
                  {paletizada ? "Ajustável." : "Desativado para carga solta."}
                </Hint>
              </Field>

              <Field>
                <Label>Total Kg</Label>
                <MiniInput
                  type="number"
                  value={Number(totalsFromDocs.totalPesoKg || 0).toFixed(2)}
                  readOnly
                  disabled
                />
                <Hint>Imutável (vem das notas).</Hint>
              </Field>
            </>

            {/* Recebimento */}
            {isRecebimento ? (
              <Field style={{ gridColumn: "1 / -1" }}>
                <SectionTitle>Recebimento</SectionTitle>

                <CompactGrid4>
                  <CompactField>
                    <Label>Motorista *</Label>
                    <MicroSelect
                      value={recebimento.motorista || ""}
                      disabled={busy}
                      onChange={(e) =>
                        setRecebimento((p) => ({
                          ...p,
                          motorista: e.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione...</option>
                      {safeMotoristas.map((m) => (
                        <option key={m} value={String(m)}>
                          {String(m)}
                        </option>
                      ))}
                    </MicroSelect>
                    <Hint>Vem do cadastro de motoristas.</Hint>
                  </CompactField>

                  <CompactField>
                    <Label>Chegada *</Label>
                    <MiniInput
                      disabled={busy}
                      type="datetime-local"
                      value={recebimento.chegadaAt}
                      onChange={(e) =>
                        setRecebimento((p) => ({
                          ...p,
                          chegadaAt: e.target.value,
                        }))
                      }
                    />
                  </CompactField>

                  <CompactField>
                    <Label>Placa cavalo *</Label>
                    <MicroSelect
                      value={recebimento.placaCavalo || ""}
                      disabled={busy}
                      onChange={(e) =>
                        setRecebimento((p) => ({
                          ...p,
                          placaCavalo: e.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione...</option>
                      {safePlacas.map((pl) => (
                        <option key={`cav-${pl}`} value={String(pl)}>
                          {String(pl)}
                        </option>
                      ))}
                    </MicroSelect>
                    <Hint>Vem do cadastro de placas.</Hint>
                  </CompactField>

                  <CompactField>
                    <Label>Placa carreta *</Label>
                    <MicroSelect
                      value={recebimento.placaCarreta || ""}
                      disabled={busy}
                      onChange={(e) =>
                        setRecebimento((p) => ({
                          ...p,
                          placaCarreta: e.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione...</option>
                      {safePlacas.map((pl) => (
                        <option key={`car-${pl}`} value={String(pl)}>
                          {String(pl)}
                        </option>
                      ))}
                    </MicroSelect>
                    <Hint>Vem do cadastro de placas.</Hint>
                  </CompactField>
                </CompactGrid4>

                <Hint>Chegada agora é dia + hora.</Hint>
              </Field>
            ) : null}

            {/* Chave */}
            <Field style={{ gridColumn: "1 / -1" }}>
              <Label>
                {isRecebimento
                  ? "Inserção manual (último caso)"
                  : "Bipar/Digitar chave 44"}
              </Label>

              <Inline2>
                <MiniInput
                  value={chaveInput}
                  onChange={(e) => setChaveInput(e.target.value)}
                  onKeyDown={onChaveKeyDown}
                  placeholder="Chave 44 dígitos + Enter"
                  disabled={busy || (isRecebimento ? !allowManualReceb : false)}
                />

                <InlineBtn
                  type="button"
                  disabled={
                    busy ||
                    (isRecebimento ? !allowManualReceb : false) ||
                    !String(chaveInput || "").trim()
                  }
                  onClick={() => {
                    const raw = chaveInput;
                    setChaveInput("");
                    addByChave(raw);
                  }}
                  title={
                    busyKey === "add-chave" ? "Processando..." : "Adicionar"
                  }
                >
                  {busyKey === "add-chave" ? <Loader /> : "Add"}
                </InlineBtn>
              </Inline2>

              {isRecebimento ? (
                !allowManualReceb ? (
                  <Hint>
                    Para bipar manual: selecione o cliente acima (manual) OU
                    importe XML/ZIP.
                  </Hint>
                ) : (
                  <Hint>
                    Manual aceita somente chave 44. (Métricas por nota manual.)
                  </Hint>
                )
              ) : isExpedicao ? (
                <Hint>
                  Expedição aceita múltiplos clientes. Bipe as chaves 44
                  normalmente (NF-e/CT-e vem automático do banco).
                </Hint>
              ) : (
                <Hint>
                  Ao bipar a chave, puxa tudo do banco (NF-e ou CT-e
                  automaticamente). Não pode misturar cliente.
                </Hint>
              )}
            </Field>

            {/* Docs */}
            <Field style={{ gridColumn: "1 / -1" }}>
              <Label>Documentos na demanda</Label>

              {!docs.length ? (
                <Hint>Nenhuma nota ainda (não salva sem nota).</Hint>
              ) : (clienteDefinido?.mixed || mixedClientError) &&
                !isExpedicao ? (
                <Hint style={{ color: "#c0392b" }}>
                  Lista oculta enquanto houver conflito de cliente.
                </Hint>
              ) : (
                <ChipsWrap>
                  {docs.map((d) => (
                    <Chip key={d.id} style={{ alignItems: "center", gap: 8 }}>
                      <SourceBadge $src={d.source}>
                        {String(d.source || "").toUpperCase()}
                      </SourceBadge>

                      <span title={d.chave}>
                        CHAVE {String(d.chave || "").slice(0, 6)}…
                        {String(d.chave || "").slice(-4)}
                      </span>

                      {isRecebimento ? (
                        <span style={{ opacity: 0.75 }}>
                          • Vol {Number(d.volumes || 0)} • Kg{" "}
                          {Number(d.pesoKg || 0)}
                        </span>
                      ) : null}

                      {isRecebimento && d.source === "manual" ? (
                        <span
                          style={{
                            display: "inline-flex",
                            gap: 6,
                            marginLeft: 8,
                          }}
                        >
                          <MiniInput
                            style={{ width: 86 }}
                            type="number"
                            min="0"
                            disabled={busy}
                            value={d.volumes}
                            onChange={(e) =>
                              updateDocMetric(
                                d.id,
                                "volumes",
                                Number(e.target.value || 0),
                              )
                            }
                            placeholder="vol"
                          />
                          <MiniInput
                            style={{ width: 86 }}
                            type="number"
                            min="0"
                            disabled={busy}
                            value={d.pesoKg}
                            onChange={(e) =>
                              updateDocMetric(
                                d.id,
                                "pesoKg",
                                Number(e.target.value || 0),
                              )
                            }
                            placeholder="kg"
                          />
                        </span>
                      ) : null}

                      <ChipX
                        type="button"
                        disabled={busy}
                        onClick={() => removeDoc(d.id)}
                        title="Remover"
                      >
                        ×
                      </ChipX>
                    </Chip>
                  ))}
                </ChipsWrap>
              )}

              <Hint>
                {isRecebimento
                  ? "Notas do recebimento (XML/manual)."
                  : isExpedicao
                    ? "Expedição: pode agrupar notas de clientes diferentes."
                    : "Notas puxadas automaticamente do banco."}
              </Hint>
            </Field>

            {/* Responsáveis */}
            <Field style={{ gridColumn: "1 / -1" }}>
              <Label>Responsáveis (multi) — Operação</Label>

              <SearchSelectWrap
                onFocus={() => !busy && setRespOpen(true)}
                onBlur={() => setTimeout(() => setRespOpen(false), 120)}
              >
                <MiniInput
                  value={respQuery}
                  disabled={busy}
                  onChange={(e) => {
                    setRespQuery(e.target.value);
                    setRespOpen(true);
                  }}
                  onKeyDown={onRespKeyDown}
                  placeholder="Buscar responsável..."
                />

                {respOpen && availableOps.length > 0 ? (
                  <OptionsList>
                    {availableOps.slice(0, 10).map((name) => (
                      <OptionItem
                        key={name}
                        type="button"
                        onMouseDown={() => addResponsavel(name)}
                        disabled={busy}
                      >
                        {name}
                      </OptionItem>
                    ))}
                  </OptionsList>
                ) : null}
              </SearchSelectWrap>

              {responsaveis.length ? (
                <ChipsWrap>
                  {responsaveis.map((n) => (
                    <Chip key={n}>
                      {n}
                      <ChipX
                        type="button"
                        disabled={busy}
                        onClick={() => removeResponsavel(n)}
                        title="Remover"
                      >
                        ×
                      </ChipX>
                    </Chip>
                  ))}
                </ChipsWrap>
              ) : null}

              <Hint>Obrigatório: pelo menos 1 responsável.</Hint>
            </Field>

            {/* Observação */}
            <Field style={{ gridColumn: "1 / -1" }}>
              <Label>Observação</Label>
              <TextArea
                rows={3}
                value={observacao}
                disabled={busy}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: prioridade, doca, restrições..."
              />
            </Field>
          </Grid>

          <Divider />

          <div>
            <Label>Log</Label>
            <LogBox>
              {(Array.isArray(logs) ? logs : []).map((l, idx) => (
                <LogItem key={`${l.at}-${idx}`}>
                  <div>
                    <b>{l.by}</b> •{" "}
                    <span style={{ opacity: 0.75 }}>
                      {new Date(l.at).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ marginTop: 2 }}>{l.action}</div>
                </LogItem>
              ))}
            </LogBox>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={blockClose}>
            {busy ? "Aguarde..." : "Cancelar"}
          </Button>

          <Button
            color="primary"
            onClick={confirm}
            disabled={!canConfirm || busy}
          >
            {busyKey === "confirm" ? (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
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
