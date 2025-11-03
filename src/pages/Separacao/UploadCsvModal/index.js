import React, { useCallback, useMemo, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Spinner } from "reactstrap";
import { SmallMuted } from "../style";
import { STATUS_PEDIDO } from "../constants";
import { FiUploadCloud, FiDownloadCloud, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

/**
 * Aceita CSV/TSV com cabeçalho (ordem livre):
 * Cliente, nr_pedido, destino, cod_prod, lote, ean, qtde, um_med, transportador
 *
 * Observações:
 * - Somente upload de arquivo (sem colar texto).
 * - Valida campos obrigatórios por linha.
 * - Mostra prévia e contagens antes de importar.
 * - Exibe erros com número da linha (2 = primeira linha de dados).
 */
export default function UploadCsvModal({ isOpen, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const [parsedRows, setParsedRows] = useState([]);        // linhas cruas do CSV (objetos por cabeçalho)
  const [errors, setErrors] = useState([]);                // [{ line, reason }]
  const [pedidosGrouped, setPedidosGrouped] = useState([]);// resultado agrupado
  const [hasParsed, setHasParsed] = useState(false);       // controla etapa "lido com sucesso"

  // ---------- helpers ----------
  const readFile = (f) =>
    new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result || ""));
      fr.onerror = (e) => rej(e);
      fr.readAsText(f, "utf-8");
    });

  function detectSep(headerLine) {
    if (headerLine.includes("\t")) return "\t";
    if (headerLine.includes(";")) return ";";
    return ",";
  }

  // normaliza chave (case-insensitive + variações comuns)
  function normKey(k) {
    const s = String(k || "").trim().toLowerCase();
    if (s === "cliente") return "cliente";
    if (s === "nr_pedido" || s === "pedido" || s === "n_pedido") return "nr_pedido";
    if (s === "destino" || s === "destinatario" || s === "destinatário") return "destino";
    if (s === "cod_prod" || s === "codigo" || s === "código" || s === "produto") return "cod_prod";
    if (s === "lote") return "lote";
    if (s === "ean" || s === "bar_code" || s === "barcode") return "ean";
    if (s === "qtde" || s === "quantidade" || s === "qtd") return "qtde";
    if (s === "um_med" || s === "um") return "um_med";
    if (s === "transportador" || s === "transportadora") return "transportador";
    return s;
  }

  // parse do arquivo → array de objetos (por cabeçalho)
  const parseRaw = (raw) => {
    const lines = String(raw || "").split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (!lines.length) return { header: [], rows: [] };

    const sep = detectSep(lines[0]);
    const headerRaw = lines[0].split(sep);
    const header = [];
    for (let i = 0; i < headerRaw.length; i++) header.push(normKey(headerRaw[i]));

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(sep);
      if (!parts.length) continue;
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        const key = header[j];
        obj[key] = (parts[j] || "").trim();
      }
      rows.push(obj);
    }
    return { header, rows };
  };

  // valida por linha (campos obrigatórios)
  function validateRows(rows) {
    const errs = [];
    const okRows = [];
    const required = ["cliente", "nr_pedido", "destino", "cod_prod", "lote", "ean", "qtde", "um_med", "transportador"];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      let missing = [];
      for (let k = 0; k < required.length; k++) {
        const key = required[k];
        if (!String(r[key] || "").trim()) missing.push(key);
      }
      // valida numérico
      const q = Number(r.qtde || 0);
      if (!q || isNaN(q) || q < 0) missing.push("qtde inválida");

      if (missing.length > 0) {
        errs.push({ line: i + 2, reason: `Campos ausentes/invalidos: ${missing.join(", ")}` });
      } else {
        okRows.push(r);
      }
    }
    return { okRows, errs };
  }

  // agrupa em pedidos
  function groupPedidos(rows) {
    const map = new Map();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const id = String(r.nr_pedido || "").trim();
      if (!id) continue;

      if (!map.has(id)) {
        map.set(id, {
          nr_pedido: id,
          cliente: r.cliente || "",
          destino: r.destino || "",
          transportador: r.transportador || "",
          itens: [],
          status: STATUS_PEDIDO.PENDENTE,
          logs: [],
          created_at: new Date().toISOString(),
        });
      }
      const ped = map.get(id);

      // mantém primeiros preenchimentos
      ped.cliente = ped.cliente || r.cliente || "";
      ped.destino = ped.destino || r.destino || "";
      ped.transportador = ped.transportador || r.transportador || "";

      // item (respeitando ordem: cod_prod, lote, ean, qtde, um_med)
      const item = {
        cod_prod: r.cod_prod || "",
        lote: r.lote || "",
        qtde: Number(r.qtde || 0),
        um_med: r.um_med || "",
        bar_code: r.ean || "", // guardado como bar_code no sistema
      };
      ped.itens.push(item);
    }
    return Array.from(map.values());
  }

  // contagens
  const stats = useMemo(() => {
    const out = { pedidos: 0, itens: 0, ok: parsedRows.length - errors.length, err: errors.length };
    out.pedidos = pedidosGrouped.length;
    let itensCount = 0;
    for (let i = 0; i < pedidosGrouped.length; i++) {
      const p = pedidosGrouped[i];
      itensCount += Array.isArray(p.itens) ? p.itens.length : 0;
    }
    out.itens = itensCount;
    return out;
  }, [parsedRows, errors, pedidosGrouped]);

  // ---------- UI handlers ----------
  const handleSelectFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      // reset estado de leitura
      setParsedRows([]);
      setErrors([]);
      setPedidosGrouped([]);
      setHasParsed(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setParsedRows([]);
      setErrors([]);
      setPedidosGrouped([]);
      setHasParsed(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  // baixar modelo
  const downloadModelo = () => {
    const header = "Cliente,nr_pedido,destino,cod_prod,lote,ean,qtde,um_med,transportador";
    const rows = [
      "FERSA,11321,CONDOR,321,L001,7891234567890,5,cx,TRANSLOVATO",
      "FERSA,11321,CONDOR,322,L002,7899876543210,2,cx,TRANSLOVATO",
      "ACME,55555,CURITIBA,ABC123,LX77,7890001112223,10,un,CORREIOS",
    ];
    const csv = [header].concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_importacao_pedidos.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  };

  // ler/validar (etapa 1)
  const handleParse = async () => {
    if (!file || busy) return;
    try {
      setBusy(true);
      setParsedRows([]);
      setErrors([]);
      setPedidosGrouped([]);
      setHasParsed(false);

      const raw = await readFile(file);
      const { header, rows } = parseRaw(raw);

      // checa se cabeçalhos essenciais existem
      const needed = ["cliente", "nr_pedido", "destino", "cod_prod", "lote", "ean", "qtde", "um_med", "transportador"];
      const headerSet = new Set(header);
      let missingHeader = [];
      for (let i = 0; i < needed.length; i++) {
        if (!headerSet.has(needed[i])) missingHeader.push(needed[i]);
      }
      if (missingHeader.length > 0) {
        setErrors([{ line: 1, reason: `Cabeçalho ausente: ${missingHeader.join(", ")}` }]);
        setParsedRows(rows);
        setHasParsed(true);
        return;
      }

      const { okRows, errs } = validateRows(rows);
      const grouped = groupPedidos(okRows);

      setParsedRows(rows);
      setErrors(errs);
      setPedidosGrouped(grouped);
      setHasParsed(true);
    } catch (err) {
      setErrors([{ line: 1, reason: "Falha ao ler o arquivo. Verifique o formato." }]);
      setParsedRows([]);
      setPedidosGrouped([]);
      setHasParsed(true);
    } finally {
      setBusy(false);
    }
  };

  // importar (etapa 2)
  const handleImport = () => {
    if (!hasParsed || busy) return;
    if (errors.length > 0) return; // evita importar com erros
    if (pedidosGrouped.length === 0) return;
    onImported(pedidosGrouped); // o caller decide fechar; aqui já mostramos as contagens antes
  };

  // preview limitada
  const preview = useMemo(() => {
    const max = 8;
    const out = [];
    const rows = parsedRows || [];
    for (let i = 0; i < rows.length && out.length < max; i++) out.push(rows[i]);
    return out;
  }, [parsedRows]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="project-modal" size="lg">
      <ModalHeader toggle={onClose}>Importar pedidos via CSV/TSV</ModalHeader>

      <ModalBody>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Ações topo: modelo para baixar */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Button color="secondary" onClick={downloadModelo} title="Baixar modelo de CSV">
              <FiDownloadCloud style={{ marginRight: 6 }} /> Baixar modelo CSV
            </Button>
          </div>

          {/* Dropzone */}
          <div>
            <SmallMuted>Arquivo (.csv / .tsv)</SmallMuted>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("csvUploadInput")?.click()}
              style={{
                marginTop: 8,
                border: `2px dashed ${dragOver ? "#2563eb" : "#e5e7eb"}`,
                background: dragOver ? "rgba(37,99,235,.06)" : "#f9fafb",
                borderRadius: 14,
                padding: 24,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                textAlign: "center",
                transition: "all .15s ease",
              }}
              title="Clique para selecionar ou arraste seu arquivo aqui"
            >
              <div style={{ display: "grid", gap: 6, placeItems: "center" }}>
                <FiUploadCloud size={28} />
                <div style={{ fontWeight: 700 }}>
                  Clique para escolher o arquivo ou arraste aqui
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Aceita .csv ou .tsv com cabeçalho (Cliente,nr_pedido,destino,cod_prod,lote,ean,qtde,um_med,transportador)
                </div>
                {file && (
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Selecionado: <strong>{file.name}</strong>
                  </div>
                )}
              </div>
            </div>
            <input
              id="csvUploadInput"
              type="file"
              accept=".csv,.tsv,text/csv,text/tab-separated-values"
              style={{ display: "none" }}
              onChange={handleSelectFile}
            />
          </div>

          {/* Dica de formato espelhado */}
          <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
            <SmallMuted>Formato esperado do cabeçalho</SmallMuted>
            <div style={{ fontFamily: "monospace", fontSize: 12, marginTop: 6 }}>
              Cliente,nr_pedido,destino,cod_prod,lote,ean,qtde,um_med,transportador
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 12, marginTop: 6, opacity: .85 }}>
              FERSA,11321,CONDOR,321,L001,7891234567890,5,cx,TRANSLOVATO
            </div>
          </div>

          {/* Botão Ler/Validar */}
          <div>
            <Button color="primary" disabled={!file || busy} onClick={handleParse}>
              {busy ? (<><Spinner size="sm" />&nbsp;Lendo arquivo…</>) : "Ler e validar arquivo"}
            </Button>
          </div>

          {/* Resultado da leitura */}
          {hasParsed && (
            <div style={{ display: "grid", gap: 10 }}>
              {/* Contagens */}
              <div style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
                padding: 10,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                background: "#f8fafc"
              }}>
                <div><SmallMuted>Linhas ok:</SmallMuted> <strong>{stats.ok}</strong></div>
                <div><SmallMuted>Linhas com erro:</SmallMuted> <strong>{stats.err}</strong></div>
                <div><SmallMuted>Pedidos:</SmallMuted> <strong>{stats.pedidos}</strong></div>
                <div><SmallMuted>Itens:</SmallMuted> <strong>{stats.itens}</strong></div>
                {errors.length === 0 ? (
                  <div style={{ color: "#065f46", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <FiCheckCircle /> Pronto para importar
                  </div>
                ) : (
                  <div style={{ color: "#9a3412", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <FiAlertCircle /> Corrija os erros antes de importar
                  </div>
                )}
              </div>

              {/* Erros */}
              {errors.length > 0 && (
                <div style={{ border: "1px solid #fed7aa", background: "rgba(254,215,170,.25)", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 800, color: "#9a3412", marginBottom: 6 }}>Erros encontrados</div>
                  <div style={{ display: "grid", gap: 4, maxHeight: 200, overflow: "auto" }}>
                    {errors.map((e, i) => (
                      <div key={i} style={{ fontSize: 12 }}>
                        Linha <strong>{e.line}</strong>: {e.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prévia */}
              <div>
                <SmallMuted>Prévia (até 8 linhas)</SmallMuted>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginTop: 6 }}>
                  <Table responsive hover borderless className="mb-0">
                    <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                      <tr>
                        <th>Cliente</th>
                        <th>nr_pedido</th>
                        <th>destino</th>
                        <th>cod_prod</th>
                        <th>lote</th>
                        <th>ean</th>
                        <th>qtde</th>
                        <th>um_med</th>
                        <th>transportador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.length === 0 && (
                        <tr><td colSpan={9} style={{ opacity: .7 }}>Sem dados para prévia.</td></tr>
                      )}
                      {preview.map((r, idx) => (
                        <tr key={idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td>{r.cliente || "—"}</td>
                          <td>{r.nr_pedido || "—"}</td>
                          <td>{r.destino || "—"}</td>
                          <td>{r.cod_prod || "—"}</td>
                          <td>{r.lote || "—"}</td>
                          <td style={{ fontFamily: "monospace" }}>{r.ean || "—"}</td>
                          <td style={{ fontWeight: 700 }}>{r.qtde || "0"}</td>
                          <td>{r.um_med || "—"}</td>
                          <td>{r.transportador || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={onClose} disabled={busy}>
          Fechar
        </Button>

        <Button
          color="primary"
          onClick={handleImport}
          disabled={!hasParsed || busy || errors.length > 0 || pedidosGrouped.length === 0}
          title={errors.length > 0 ? "Corrija os erros para habilitar a importação" : "Importar pedidos"}
        >
          Importar ({stats.pedidos} pedidos / {stats.itens} itens)
        </Button>
      </ModalFooter>
    </Modal>
  );
}
