import React, { useCallback, useMemo, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Spinner } from "reactstrap";
import { SmallMuted } from "../style";
import { STATUS_PEDIDO } from "../constants";
import { FiUploadCloud, FiDownloadCloud, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import * as XLSX from "xlsx";

/**
 * Aceita CSV, TSV ou XLSX com cabeçalho (ordem livre):
 * Cliente, nr_pedido, destino, cod_prod, lote, ean, qtde, um_med, transportador, ov, endereco
 *
 * Observações:
 * - Pode subir .csv, .tsv ou .xlsx
 * - Valida campos obrigatórios por linha
 * - Mostra prévia e contagens antes de importar
 * - Exibe erros com número da linha (2 = primeira linha de dados)
 */
export default function UploadCsvModal({ isOpen, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [pedidosGrouped, setPedidosGrouped] = useState([]);
  const [hasParsed, setHasParsed] = useState(false);

  // ======== FUNÇÕES DE LEITURA E PARSE ========
  const readText = (f) =>
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
    if (s === "ov" || s === "ordem_venda" || s === "ordem de venda") return "ov";
    if (s === "endereco" || s === "endereço" || s === "rua" || s === "logradouro") return "endereco";
    return s;
  }

  function parseCsvOrTsv(raw) {
    const lines = String(raw || "").split(/\r?\n/).filter((l) => l.trim().length > 0);
       if (!lines.length) return { header: [], rows: [] };
    const sep = detectSep(lines[0]);
    const header = lines[0].split(sep).map(normKey);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(sep);
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        obj[header[j]] = (parts[j] ?? "").trim();
      }
      rows.push(obj);
    }
    return { header, rows };
  }

  async function parseXlsx(file) {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: "" });

    if (!json.length) return { header: [], rows: [] };
    const headersRaw = Object.keys(json[0]);
    const header = headersRaw.map(normKey);

    const rows = json.map((r) => {
      const obj = {};
      for (let j = 0; j < headersRaw.length; j++) {
        const nk = normKey(headersRaw[j]);
        obj[nk] = (r[headersRaw[j]] ?? "").toString().trim();
      }
      return obj;
    });

    return { header, rows };
  }

  async function readAndParseFile(file) {
    const name = (file.name || "").toLowerCase();
    const isXlsx = name.endsWith(".xlsx") || name.endsWith(".xls");
    if (isXlsx) return await parseXlsx(file);
    const raw = await readText(file);
    return parseCsvOrTsv(raw);
  }

  // ======== VALIDAÇÃO E AGRUPAMENTO ========
  function validateRows(rows) {
    const errs = [];
    const okRows = [];
    // ov e endereco são opcionais, então não entram aqui
    const required = ["cliente", "nr_pedido", "destino", "cod_prod", "lote", "ean", "qtde", "um_med"];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const missing = required.filter((k) => !String(r[k] || "").trim());
      const q = Number(r.qtde || 0);
      if (!q || isNaN(q) || q < 0) missing.push("qtde inválida");
      if (missing.length > 0) errs.push({ line: i + 2, reason: `Campos ausentes/invalidos: ${missing.join(", ")}` });
      else okRows.push(r);
    }
    return { okRows, errs };
  }

  function groupPedidos(rows) {
    const map = new Map();
    for (const r of rows) {
      const id = String(r.nr_pedido || "").trim();
      if (!id) continue;
      if (!map.has(id)) {
        map.set(id, {
          nr_pedido: id,
          cliente: r.cliente || "",
          destino: r.destino || "",
          transportador: r.transportador || "",
          ov: r.ov || "",
          endereco: r.endereco || "",
          itens: [],
          status: STATUS_PEDIDO.PENDENTE,
          logs: [],
          created_at: new Date().toISOString(),
        });
      }
      const ped = map.get(id);
      ped.itens.push({
        cod_prod: r.cod_prod || "",
        lote: r.lote || "",
        qtde: Number(r.qtde || 0),
        um_med: r.um_med || "",
        bar_code: r.ean || "",
      });
    }
    return Array.from(map.values());
  }

  const stats = useMemo(() => {
    const out = { pedidos: pedidosGrouped.length, itens: 0, ok: parsedRows.length - errors.length, err: errors.length };
    for (const p of pedidosGrouped) out.itens += p.itens?.length || 0;
    return out;
  }, [parsedRows, errors, pedidosGrouped]);

  // ======== HANDLERS ========
  const handleSelectFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setParsedRows([]); setErrors([]); setPedidosGrouped([]); setHasParsed(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setParsedRows([]); setErrors([]); setPedidosGrouped([]); setHasParsed(false);
    }
    setDragOver(false);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };

  const downloadModelo = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Cliente","nr_pedido","destino","cod_prod","lote","ean","qtde","um_med","transportador","ov","endereco"],
      ["FERSA","11321","CONDOR","321","L001","7891234567890",5,"cx","TRANSLOVATO","10001","RD-02"],
      ["FERSA","11321","CONDOR","322","L002","7899876543210",2,"cx","TRANSLOVATO","10001","RD-02"],
      ["ACME","55555","CURITIBA","ABC123","LX77","7890001112223",10,"un","CORREIOS","20002","RU-05"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo");
    XLSX.writeFile(wb, "modelo_importacao_pedidos.xlsx");
  };

  const handleParse = async () => {
    if (!file || busy) return;
    try {
      setBusy(true);
      const { header, rows } = await readAndParseFile(file);
      const needed = [
        "cliente","nr_pedido","destino","cod_prod","lote","ean","qtde","um_med","transportador","ov","endereco"
      ];
      const headerSet = new Set(header);
      const missingHeader = needed.filter((k) => !headerSet.has(k));
      if (missingHeader.length) {
        setErrors([{ line: 1, reason: `Cabeçalho ausente: ${missingHeader.join(", ")}` }]);
        setParsedRows(rows); setHasParsed(true); return;
      }
      const { okRows, errs } = validateRows(rows);
      const grouped = groupPedidos(okRows);
      setParsedRows(rows); setErrors(errs); setPedidosGrouped(grouped); setHasParsed(true);
    } catch {
      setErrors([{ line: 1, reason: "Falha ao ler o arquivo. Verifique o formato." }]);
    } finally {
      setBusy(false);
    }
  };

  const handleImport = () => {
    if (!hasParsed || busy || errors.length || !pedidosGrouped.length) return;
    onImported(pedidosGrouped);
  };

  const preview = useMemo(() => parsedRows.slice(0, 8), [parsedRows]);

  // ======== UI ========
  return (
    <Modal isOpen={isOpen} toggle={onClose} className="project-modal" size="xl">
      <ModalHeader toggle={onClose}>Importar pedidos (CSV, TSV ou Excel)</ModalHeader>

      <ModalBody>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Button color="secondary" onClick={downloadModelo}>
              <FiDownloadCloud style={{ marginRight: 6 }} /> Baixar modelo Excel
            </Button>
          </div>

          <div>
            <SmallMuted>Arquivo (.csv / .tsv / .xlsx)</SmallMuted>
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
              }}
            >
              <div style={{ display: "grid", gap: 6, placeItems: "center" }}>
                <FiUploadCloud size={28} />
                <div style={{ fontWeight: 700 }}>Clique ou arraste aqui</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Aceita .csv, .tsv ou .xlsx com cabeçalho padrão
                </div>
                {file && <div style={{ fontSize: 12, marginTop: 6 }}>Selecionado: <strong>{file.name}</strong></div>}
              </div>
            </div>
            <input
              id="csvUploadInput"
              type="file"
              accept="
                .csv,
                .tsv,
                text/csv,
                text/tab-separated-values,
                .xlsx,
                .xls,
                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                application/vnd.ms-excel
              "
              style={{ display: "none" }}
              onChange={handleSelectFile}
            />
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
            <SmallMuted>Modelo de cabeçalho aceito</SmallMuted>
            <div style={{ fontFamily: "monospace", fontSize: 12, marginTop: 6 }}>
              Cliente,nr_pedido,destino,cod_prod,lote,ean,qtde,um_med,transportador,ov,endereco
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 12, marginTop: 6, opacity: 0.85 }}>
              FERSA,11321,CONDOR,321,L001,7891234567890,5,cx,TRANSLOVATO,10001,RD-02
            </div>
            <div style={{ fontSize: 12, marginTop: 6, opacity: 0.75 }}>
              Também aceita planilha Excel com essas mesmas colunas.
            </div>
          </div>

          <div>
            <Button color="primary" disabled={!file || busy} onClick={handleParse}>
              {busy ? (<><Spinner size="sm" />&nbsp;Lendo arquivo…</>) : "Ler e validar arquivo"}
            </Button>
          </div>

          {hasParsed && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{
                display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
                padding: 10, border: "1px solid #e5e7eb", borderRadius: 10, background: "#f8fafc"
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
                        <th>OV</th>
                        <th>Endereço</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.length === 0 && (
                        <tr><td colSpan={11} style={{ opacity: .7 }}>Sem dados para prévia.</td></tr>
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
                          <td>{r.ov || "—"}</td>
                          <td>{r.endereco || "—"}</td>
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
        <Button color="secondary" onClick={onClose} disabled={busy}>Fechar</Button>
        <Button
          color="primary"
          onClick={handleImport}
          disabled={!hasParsed || busy || errors.length > 0 || pedidosGrouped.length === 0}
        >
          Importar ({stats.pedidos} pedidos / {stats.itens} itens)
        </Button>
      </ModalFooter>
    </Modal>
  );
}
