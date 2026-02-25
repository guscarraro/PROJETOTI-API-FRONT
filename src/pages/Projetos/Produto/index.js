// src/pages/CadastroProduto/index.js
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Page,
  TitleBar,
  H1,
  Section,
  FiltersRow,
  FiltersLeft,
  FiltersRight,
  FilterGroup,
  FilterLabel,
  FilterInput,
  FilterButton,
  ClearButton,
  TableWrap,
  Table,
  Th,
  Td,
  TdCompact,
  CountPill,
  ActionsRow,
  ActionBtn,
  DangerBtn,
  ModalOverlay,
  ModalCard,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Grid2,
  HelperText,
  TabsRow,
  TabBtn,
  ImportHint,
  DropZone,
  DropTitle,
  DropSub,
  DropLink,
  DropBadge,
  FileNamePill,
  ToastWrap,
  ToastItem,
  ImportActionsRow,
  PreviewWrap,
  PreviewTitle,
  PreviewTable,
  PreviewTh,
  PreviewTd,
  SmallMuted,
} from "./style";

import useLoading from "../../../hooks/useLoading";
import NavBar from "../components/NavBar";
import { PageLoader } from "../components/Loader";
import apiLocal from "../../../services/apiLocal";

import * as XLSX from "xlsx";

// --------------------
// Utils
// --------------------
function _normText(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function _upper(v) {
  const s = _normText(v);
  return s ? s.toUpperCase() : "";
}

function _toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  if (Number.isNaN(n)) return null;
  return n;
}

function _toIntOrNull(v) {
  const n = _toNumberOrNull(v);
  if (n === null) return null;
  return parseInt(String(n), 10);
}

function getExt(filename = "") {
  const n = String(filename).toLowerCase();
  const idx = n.lastIndexOf(".");
  return idx >= 0 ? n.slice(idx + 1) : "";
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// XLSX -> AOA (primeira aba)
async function xlsxFileToAoa(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const firstSheetName = wb.SheetNames?.[0];
  if (!firstSheetName) throw new Error("Arquivo XLSX sem planilhas.");

  const ws = wb.Sheets[firstSheetName];
  const aoa = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    blankrows: false,
  });
  if (!aoa.length) throw new Error("Planilha vazia.");
  return aoa;
}

async function csvFileToAoa(file) {
  const text = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler CSV."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(file, "utf-8");
  });

  const lines = String(text || "")
    .split(/\r?\n/)
    .filter((l) => String(l).trim().length);

  if (!lines.length) return [];

  // simples e suficiente pro modelo (sem aspas malucas)
  const aoa = [];
  for (let i = 0; i < lines.length; i++) {
    const row = lines[i].split(",").map((c) => String(c ?? "").trim());
    aoa.push(row);
  }
  return aoa;
}

// --------------------
// Toast (sem libs)
// --------------------
function useToasts() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, title, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast = { id, type, title, message };
    setToasts((prev) => [toast, ...prev].slice(0, 5));

    window.setTimeout(() => {
      setToasts((prev) => {
        const out = [];
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id !== id) out.push(prev[i]);
        }
        return out;
      });
    }, 3500);

    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => {
      const out = [];
      for (let i = 0; i < prev.length; i++) {
        if (prev[i].id !== id) out.push(prev[i]);
      }
      return out;
    });
  }, []);

  return { toasts, push, remove };
}

// --------------------
// Modelo XLSX local
// --------------------
function buildModeloProdutosXlsxBlob() {
  const header = [
    "cliente",
    "sku",
    "ean",
    "un",
    "un_por_cx",
    "cx_por_pallet",
    "peso_kg",
    "m3",
  ];

  const example = [
    "FERSA",
    "SKU-EXEMPLO-001",
    "7890000000000",
    "UN",
    12,
    40,
    1.25,
    0.012,
  ];

  const aoa = [header, example];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!cols"] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 6 },
    { wch: 10 },
    { wch: 13 },
    { wch: 10 },
    { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "modelo");

  const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// --------------------
// Import parsing + dedupe
// --------------------
function normalizeHeaderKey(h) {
  const s = _upper(h);
  const clean = s.replace(/\s+/g, "_").replace(/[^\w/]/g, "");
  return clean;
}

function getValueByAliases(obj, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    const k = aliases[i];
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const v = obj[k];
      const s = _normText(v);
      if (s) return s;
    }
  }
  return "";
}

function scoreCompleteness(p) {
  let score = 0;
  const fields = [p.ean, p.un, p.un_por_cx, p.cx_por_pallet, p.peso_kg, p.m3];

  for (let i = 0; i < fields.length; i++) {
    const v = fields[i];
    if (v === null || v === undefined) continue;
    if (typeof v === "string") {
      if (_normText(v)) score += 1;
    } else {
      score += 1;
    }
  }
  return score;
}

function parseAoaToPayloads(aoa) {
  if (!aoa || !aoa.length) return { raw: [], warnings: ["Arquivo vazio."] };
  if (!aoa[0] || !aoa[0].length)
    return { raw: [], warnings: ["Arquivo sem cabeçalho."] };

  const headerRow = aoa[0];
  const headers = [];
  for (let i = 0; i < headerRow.length; i++) {
    headers.push(normalizeHeaderKey(headerRow[i]));
  }

  const raw = [];
  const warnings = [];

  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r] || [];
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      obj[key] = row[c] ?? "";
    }

    const cliente = getValueByAliases(obj, ["CLIENTE"]);
    const sku = getValueByAliases(obj, ["SKU", "COD", "CODIGO"]);
    const ean = getValueByAliases(obj, ["EAN", "BAR", "BARCODE"]);
    const un = getValueByAliases(obj, ["UN"]) || "UN";

    const un_por_cx = _toIntOrNull(
      getValueByAliases(obj, ["UN_POR_CX", "UN/CX", "UN_CX", "UNPORCX"]),
    );
    const cx_por_pallet = _toIntOrNull(
      getValueByAliases(obj, ["CX_POR_PALLET", "CX/PALLET", "CXPORPALLET"]),
    );
    const peso_kg = _toNumberOrNull(
      getValueByAliases(obj, ["PESO_KG", "PESO", "PESO(KG)"]),
    );
    const m3 = _toNumberOrNull(getValueByAliases(obj, ["M3", "M³"]));

    if (!_normText(cliente) || !_normText(sku)) {
      continue;
    }

    raw.push({
      cliente: _normText(cliente),
      sku: _normText(sku),
      ean: _normText(ean) || null, // EAN pode repetir, ok
      un: _normText(un) || "UN",
      un_por_cx: un_por_cx,
      cx_por_pallet: cx_por_pallet,
      peso_kg: peso_kg,
      m3: m3,
      __rowIndex: r + 1,
    });
  }

  if (!raw.length)
    warnings.push("Nenhuma linha válida encontrada (precisa cliente + sku).");
  return { raw, warnings };
}

// ✅ AGORA: dedupe GLOBAL por SKU (EAN pode repetir)
function dedupeBySkuKeepBest(rawPayloads) {
  const map = {}; // sku -> {score, payload}
  let duplicates = 0;

  for (let i = 0; i < rawPayloads.length; i++) {
    const p = rawPayloads[i];
    const key = _upper(p.sku); // SKU global
    const sc = scoreCompleteness(p);

    if (!map[key]) {
      map[key] = { score: sc, payload: p };
    } else {
      duplicates += 1;
      if (sc > map[key].score) {
        map[key] = { score: sc, payload: p };
      }
    }
  }

  const unique = [];
  for (const k in map) unique.push(map[k].payload);
  return { unique, duplicates };
}

function validateImportPayload(p) {
  if (!_normText(p.cliente)) return "cliente obrigatório";
  if (!_normText(p.sku)) return "sku obrigatório";

  if (
    p.un_por_cx === null ||
    p.un_por_cx === undefined ||
    Number(p.un_por_cx) <= 0
  )
    return "un_por_cx deve ser > 0";
  if (
    p.cx_por_pallet === null ||
    p.cx_por_pallet === undefined ||
    Number(p.cx_por_pallet) <= 0
  )
    return "cx_por_pallet deve ser > 0";

  return "";
}

export default function CadastroProdutoPage() {
  const loading = useLoading();
  const toast = useToasts();

  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ cliente: "", sku: "", ean: "" });

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [active, setActive] = useState(null);

  const [createTab, setCreateTab] = useState("manual"); // "manual" | "import"
  const [form, setForm] = useState({
    cliente: "",
    sku: "",
    ean: "",
    un_por_cx: "",
    cx_por_pallet: "",
    peso_kg: "",
    m3: "",
  });

  const fileInputRef = useRef(null);
  const [dropActive, setDropActive] = useState(false);
  const [pickedFileName, setPickedFileName] = useState("");

  const [importRawCount, setImportRawCount] = useState(0);
  const [importDuplicates, setImportDuplicates] = useState(0); // duplicadas por SKU
  const [importInvalid, setImportInvalid] = useState(0);
  const [importReady, setImportReady] = useState([]);
  const [importPreview, setImportPreview] = useState([]);

  const handleChangeFilter = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(
    () => setFilters({ cliente: "", sku: "", ean: "" }),
    [],
  );

  const fetchList = useCallback(async () => {
    const params = {};
    if (filters.cliente) params.cliente = filters.cliente;
    if (filters.sku) params.sku = filters.sku;
    if (filters.ean) params.ean = filters.ean;

    try {
      const res = await loading.wrap("produtos-list", async () =>
        apiLocal.getProdutos(params),
      );
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Falha ao listar produtos.";
      toast.push("error", "Erro", msg);
    }
  }, [filters, loading, toast]);

  useEffect(() => {
    (async () => {
      await fetchList();
    })();
    // eslint-disable-next-line
  }, []);

  const openCreateModal = () => {
    setActive(null);
    setCreateTab("manual");
    setPickedFileName("");

    setImportRawCount(0);
    setImportDuplicates(0);
    setImportInvalid(0);
    setImportReady([]);
    setImportPreview([]);

    setForm({
      cliente: "",
      sku: "",
      ean: "",
      un_por_cx: "",
      cx_por_pallet: "",
      peso_kg: "",
      m3: "",
    });

    setOpenCreate(true);
  };

  const openEditModal = (row) => {
    setActive(row);
    setForm({
      cliente: _normText(row?.cliente),
      sku: _normText(row?.sku),
      ean: _normText(row?.ean),
      un_por_cx: row?.un_por_cx ?? "",
      cx_por_pallet: row?.cx_por_pallet ?? "",
      peso_kg: row?.peso_kg ?? "",
      m3: row?.m3 ?? "",
    });
    setOpenEdit(true);
  };

  const openDeleteModal = (row) => {
    setActive(row);
    setOpenDelete(true);
  };

  const closeAllModals = () => {
    setOpenCreate(false);
    setOpenEdit(false);
    setOpenDelete(false);
    setActive(null);
    setDropActive(false);
  };

  const setFormField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validateForm = () => {
    const cliente = _normText(form.cliente);
    const sku = _normText(form.sku);

    if (!cliente) return "Cliente é obrigatório";
    if (!sku) return "SKU é obrigatório";

    const unPorCx = _toNumberOrNull(form.un_por_cx);
    const cxPorPallet = _toNumberOrNull(form.cx_por_pallet);

    if (unPorCx === null || unPorCx <= 0) return "UN/CX deve ser > 0";
    if (cxPorPallet === null || cxPorPallet <= 0)
      return "CX/Pallet deve ser > 0";

    return "";
  };

  const buildPayload = () => {
    return {
      cliente: _normText(form.cliente) || null,
      sku: _normText(form.sku) || null,
      ean: _normText(form.ean) || null, // pode repetir
      un: "UN",
      un_por_cx: _toIntOrNull(form.un_por_cx),
      cx_por_pallet: _toIntOrNull(form.cx_por_pallet),
      peso_kg: _toNumberOrNull(form.peso_kg),
      m3: _toNumberOrNull(form.m3),
    };
  };

  const handleCreate = async () => {
    const err = validateForm();
    if (err) {
      toast.push("warn", "Validação", err);
      return;
    }

    try {
      const payload = buildPayload();
      await loading.wrap("produto-create", async () =>
        apiLocal.createProduto(payload),
      );
      toast.push("ok", "Sucesso", "Produto cadastrado ✅");
      setOpenCreate(false);
      await fetchList();
    } catch (err2) {
      console.error(err2);
      const msg =
        err2?.response?.data?.detail ||
        err2?.response?.data?.message ||
        err2?.message ||
        "Falha ao criar produto.";
      toast.push("error", "Erro", msg);
    }
  };

  const handleUpdate = async () => {
    if (!active?.id) {
      toast.push("error", "Erro", "Registro inválido para edição.");
      return;
    }

    const err = validateForm();
    if (err) {
      toast.push("warn", "Validação", err);
      return;
    }

    try {
      const payload = buildPayload();
      await loading.wrap("produto-update", async () =>
        apiLocal.updateProduto(active.id, payload),
      );
      toast.push("ok", "Sucesso", "Produto atualizado ✅");
      setOpenEdit(false);
      setActive(null);
      await fetchList();
    } catch (err2) {
      console.error(err2);
      const msg =
        err2?.response?.data?.detail ||
        err2?.response?.data?.message ||
        err2?.message ||
        "Falha ao atualizar produto.";
      toast.push("error", "Erro", msg);
    }
  };

  const handleDelete = async () => {
    if (!active?.id) {
      toast.push("error", "Erro", "Registro inválido para exclusão.");
      return;
    }

    try {
      await loading.wrap("produto-delete", async () =>
        apiLocal.deleteProduto(active.id),
      );
      toast.push("ok", "Sucesso", "Produto excluído ✅");
      setOpenDelete(false);
      setActive(null);
      await fetchList();
    } catch (err2) {
      console.error(err2);
      const msg =
        err2?.response?.data?.detail ||
        err2?.response?.data?.message ||
        err2?.message ||
        "Falha ao excluir produto.";
      toast.push("error", "Erro", msg);
    }
  };

  // =========================
  // IMPORT LOCAL (não chama API)
  // =========================
  const pickFile = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };
  const handleExportProdutosExcel = () => {
    if (!filteredRows.length) {
      toast.push("warn", "Exportação", "Nenhum produto para exportar.");
      return;
    }

    const data = [];
    for (let i = 0; i < filteredRows.length; i++) {
      const r = filteredRows[i] || {};

      data.push({
        Cliente: r.cliente ?? "",
        SKU: r.sku ?? "",
        EAN: r.ean ?? "",
        UN: r.un ?? "UN",
        "UN/CX": r.un_por_cx ?? "",
        "CX/Pallet": r.cx_por_pallet ?? "",
        "UN/Pallet": r.un_por_pallet ?? "",
        "Peso (kg)": r.peso_kg ?? "",
        "m³": r.m3 ?? "",
        "Criado em": r.created_at
          ? new Date(r.created_at).toLocaleString("pt-BR")
          : "",
        "Atualizado em": r.updated_at
          ? new Date(r.updated_at).toLocaleString("pt-BR")
          : "",
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 14 },
      { wch: 22 },
      { wch: 22 },
      { wch: 6 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "produtos");

    XLSX.writeFile(
      wb,
      `produtos-cadastrados-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    toast.push("ok", "Exportação", "Excel gerado ✅");
  };
  const handleDownloadModeloXlsx = (e) => {
    e.preventDefault();
    try {
      const blob = buildModeloProdutosXlsxBlob();
      downloadBlob(blob, "modelo-produtos.xlsx");
      toast.push("ok", "Modelo", "Modelo XLSX baixado ✅");
    } catch (err) {
      console.error(err);
      toast.push("error", "Erro", "Falha ao gerar modelo XLSX.");
    }
  };

  const resetImportState = () => {
    setImportRawCount(0);
    setImportDuplicates(0);
    setImportInvalid(0);
    setImportReady([]);
    setImportPreview([]);
    setPickedFileName("");
  };

  const parseAndStageImport = async (file) => {
    if (!file) return;

    const ext = getExt(file.name);
    if (ext !== "csv" && ext !== "xlsx") {
      toast.push("warn", "Formato inválido", "Envie CSV ou XLSX.");
      return;
    }

    setPickedFileName(file.name);

    try {
      let aoa = [];
      if (ext === "xlsx") aoa = await xlsxFileToAoa(file);
      else aoa = await csvFileToAoa(file);

      const { raw, warnings } = parseAoaToPayloads(aoa);
      for (let i = 0; i < warnings.length; i++) {
        toast.push("warn", "Importação", warnings[i]);
      }

      setImportRawCount(raw.length);

      // ✅ dedupe por SKU (global)
      const { unique, duplicates } = dedupeBySkuKeepBest(raw);
      setImportDuplicates(duplicates);

      const valid = [];
      let invalidCount = 0;

      for (let i = 0; i < unique.length; i++) {
        const p = unique[i];
        const err = validateImportPayload(p);
        if (err) {
          invalidCount += 1;
          continue;
        }

        valid.push({
          cliente: p.cliente,
          sku: p.sku,
          ean: p.ean || null,
          un: p.un || "UN",
          un_por_cx: p.un_por_cx,
          cx_por_pallet: p.cx_por_pallet,
          peso_kg: p.peso_kg,
          m3: p.m3,
        });
      }

      setImportInvalid(invalidCount);
      setImportReady(valid);

      const prev = [];
      for (let i = 0; i < valid.length && i < 20; i++) prev.push(valid[i]);
      setImportPreview(prev);

      if (!valid.length) {
        toast.push(
          "warn",
          "Importação",
          "Nada válido para salvar (verifique un_por_cx e cx_por_pallet).",
        );
      } else {
        toast.push(
          "ok",
          "Importação",
          "Arquivo carregado. Agora clique em “Salvar importação”.",
        );
      }
    } catch (err) {
      console.error(err);
      toast.push("error", "Erro", err?.message || "Falha ao ler arquivo.");
      resetImportState();
    }
  };

  const onFilePicked = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    await parseAndStageImport(file);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(false);

    const file = e?.dataTransfer?.files?.[0];
    if (!file) return;

    await parseAndStageImport(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(false);
  };

  const salvarImportacao = async () => {
    if (!importReady.length) {
      toast.push("warn", "Importação", "Nenhum item válido carregado.");
      return;
    }

    let ok = 0;
    let fail = 0;

    for (let i = 0; i < importReady.length; i++) {
      const p = importReady[i];

      try {
        await loading.wrap(`produto-import-${i}`, async () =>
          apiLocal.createProduto(p),
        );
        ok += 1;
      } catch (err) {
        fail += 1;
        console.error(err);
      }
    }

    if (ok) toast.push("ok", "Importação", `Salvos: ${ok}`);
    if (fail)
      toast.push(
        "warn",
        "Importação",
        `Falharam: ${fail} (provável SKU duplicado ou validação)`,
      );

    await fetchList();
  };

  // =========================
  // filtro no front
  // =========================
  const filteredRows = useMemo(() => {
    const c = _normText(filters.cliente).toLowerCase();
    const s = _normText(filters.sku).toLowerCase();
    const e = _normText(filters.ean).toLowerCase();

    if (!c && !s && !e) return rows;

    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const rc = _normText(r.cliente).toLowerCase();
      const rs = _normText(r.sku).toLowerCase();
      const re = _normText(r.ean).toLowerCase();

      if (c && !rc.includes(c)) continue;
      if (s && !rs.includes(s)) continue;
      if (e && !re.includes(e)) continue;

      out.push(r);
    }
    return out;
  }, [rows, filters]);

  return (
    <Page>
      <PageLoader active={loading.any()} text="Carregando produtos..." />
      <NavBar />

      <ToastWrap>
        {toast.toasts.map((t) => (
          <ToastItem
            key={t.id}
            $type={t.type}
            onClick={() => toast.remove(t.id)}
            title="Clique para fechar"
          >
            <div style={{ fontWeight: 900, fontSize: 12 }}>{t.title}</div>
            {t.message ? (
              <div style={{ marginTop: 4, fontSize: 12, opacity: 0.9 }}>
                {t.message}
              </div>
            ) : null}
          </ToastItem>
        ))}
      </ToastWrap>

      <TitleBar>
        <H1>Cadastro de Produto</H1>
        <FiltersRight>
          <FilterButton
            type="button"
            onClick={handleExportProdutosExcel}
            disabled={loading.any() || !filteredRows.length}
            style={{ marginRight: 8, background: "#16a34a" }}
            title={!filteredRows.length ? "Nenhum produto para exportar" : ""}
          >
            Exportar Excel
          </FilterButton>
          <FilterButton
            type="button"
            onClick={openCreateModal}
            disabled={loading.any()}
            style={{ marginRight: 8 }}
          >
            + Novo
          </FilterButton>
          <CountPill>{filteredRows.length} itens</CountPill>
        </FiltersRight>
      </TitleBar>

      <Section>
        <FiltersRow
          as="form"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetchList();
          }}
        >
          <FiltersLeft>
            <FilterGroup>
              <FilterLabel>Cliente</FilterLabel>
              <FilterInput
                value={filters.cliente}
                onChange={(e) => handleChangeFilter("cliente", e.target.value)}
                placeholder="Ex: FERSA"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>SKU</FilterLabel>
              <FilterInput
                value={filters.sku}
                onChange={(e) => handleChangeFilter("sku", e.target.value)}
                placeholder="Ex: SKU-001"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>EAN</FilterLabel>
              <FilterInput
                value={filters.ean}
                onChange={(e) => handleChangeFilter("ean", e.target.value)}
                placeholder="Ex: 789..."
              />
            </FilterGroup>
          </FiltersLeft>

          <FiltersRight>
            <FilterButton type="submit" disabled={loading.any()}>
              Buscar
            </FilterButton>

            <ClearButton
              type="button"
              disabled={loading.any()}
              onClick={() => clearFilters()}
            >
              Limpar
            </ClearButton>
          </FiltersRight>
        </FiltersRow>


      </Section>

      <Section style={{ marginTop: 16 }}>
        <TableWrap style={{ maxHeight: "70vh" }}>
          <Table>
            <thead>
              <tr>
                {[
                  "Cliente",
                  "SKU",
                  "EAN",
                  "UN/CX",
                  "CX/Pallet",
                  "UN/Pallet",
                  "Peso (kg)",
                  "m³",
                  "Ações",
                ].map((h, i) => (
                  <Th
                    key={i}
                    style={{ padding: "6px 8px", whiteSpace: "nowrap" }}
                  >
                    {h}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.id}>
                  <TdCompact>{r.cliente ?? "—"}</TdCompact>
                  <TdCompact>
                    <strong>{r.sku ?? "—"}</strong>
                  </TdCompact>
                  <TdCompact>{r.ean ?? "—"}</TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {r.un_por_cx ?? "—"}
                  </TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {r.cx_por_pallet ?? "—"}
                  </TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {r.un_por_pallet ?? "—"}
                  </TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {r.peso_kg ?? "—"}
                  </TdCompact>
                  <TdCompact style={{ textAlign: "right" }}>
                    {r.m3 ?? "—"}
                  </TdCompact>

                  <TdCompact>
                    <ActionsRow>
                      <ActionBtn
                        type="button"
                        onClick={() => openEditModal(r)}
                        disabled={loading.any()}
                      >
                        Editar
                      </ActionBtn>
                      <DangerBtn
                        type="button"
                        onClick={() => openDeleteModal(r)}
                        disabled={loading.any()}
                      >
                        Excluir
                      </DangerBtn>
                    </ActionsRow>
                  </TdCompact>
                </tr>
              ))}

              {!filteredRows.length && !loading.any() && (
                <tr>
                  <Td colSpan={9} style={{ textAlign: "center", opacity: 0.7 }}>
                    Nenhum produto encontrado.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>
      </Section>

      {/* MODAL CREATE */}
      {openCreate && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Novo Produto</ModalTitle>

            <TabsRow>
              <TabBtn
                type="button"
                $active={createTab === "manual"}
                onClick={() => setCreateTab("manual")}
                disabled={loading.any()}
              >
                Manual
              </TabBtn>
              <TabBtn
                type="button"
                $active={createTab === "import"}
                onClick={() => setCreateTab("import")}
                disabled={loading.any()}
              >
                Importar (CSV / XLSX)
              </TabBtn>
            </TabsRow>

            <ModalBody>
              {createTab === "manual" && (
                <Grid2>
                  <div>
                    <FilterLabel>Cliente *</FilterLabel>
                    <FilterInput
                      value={form.cliente}
                      onChange={(e) => setFormField("cliente", e.target.value)}
                      placeholder="Ex: FERSA"
                    />
                  </div>

                  <div>
                    <FilterLabel>SKU *</FilterLabel>
                    <FilterInput
                      value={form.sku}
                      onChange={(e) => setFormField("sku", e.target.value)}
                      placeholder="Ex: SKU-001"
                    />
                  </div>

                  <div>
                    <FilterLabel>EAN</FilterLabel>
                    <FilterInput
                      value={form.ean}
                      onChange={(e) => setFormField("ean", e.target.value)}
                      placeholder="Ex: 789..."
                    />
                  </div>

                  <div>
                    <FilterLabel>UN/CX *</FilterLabel>
                    <FilterInput
                      value={form.un_por_cx}
                      onChange={(e) =>
                        setFormField("un_por_cx", e.target.value)
                      }
                      placeholder="Ex: 12"
                    />
                  </div>

                  <div>
                    <FilterLabel>CX/Pallet *</FilterLabel>
                    <FilterInput
                      value={form.cx_por_pallet}
                      onChange={(e) =>
                        setFormField("cx_por_pallet", e.target.value)
                      }
                      placeholder="Ex: 40"
                    />
                  </div>

                  <div>
                    <FilterLabel>Peso (kg)</FilterLabel>
                    <FilterInput
                      value={form.peso_kg}
                      onChange={(e) => setFormField("peso_kg", e.target.value)}
                      placeholder="Ex: 1.25"
                    />
                  </div>

                  <div>
                    <FilterLabel>m³</FilterLabel>
                    <FilterInput
                      value={form.m3}
                      onChange={(e) => setFormField("m3", e.target.value)}
                      placeholder="Ex: 0.012"
                    />
                  </div>
                </Grid2>
              )}

              {createTab === "import" && (
                <>
                  <ImportHint>
                    <div>
                      Baixar modelo:{" "}
                      <DropLink href="#" onClick={handleDownloadModeloXlsx}>
                        modelo-produtos.xlsx
                      </DropLink>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                      Aceita <strong>.xlsx</strong> ou <strong>.csv</strong>.
                      Não salva automaticamente: você carrega e depois clica em{" "}
                      <strong>Salvar importação</strong>.
                    </div>
                  </ImportHint>

                  <DropZone
                    $active={dropActive}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={pickFile}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") pickFile();
                    }}
                  >
                    <DropTitle>Arraste e solte aqui</DropTitle>
                    <DropSub>ou clique para selecionar um arquivo</DropSub>

                    {pickedFileName ? (
                      <FileNamePill title={pickedFileName}>
                        {pickedFileName}
                      </FileNamePill>
                    ) : null}

                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <DropBadge $kind="ok">
                        Linhas lidas: {importRawCount}
                      </DropBadge>
                      <DropBadge $kind="warn">
                        Duplicadas (SKU): {importDuplicates}
                      </DropBadge>
                      <DropBadge $kind="warn">
                        Inválidas (ignoradas): {importInvalid}
                      </DropBadge>
                      <DropBadge $kind="ok">
                        Prontas p/ salvar: {importReady.length}
                      </DropBadge>
                    </div>
                  </DropZone>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    style={{ display: "none" }}
                    onChange={onFilePicked}
                  />

                  {!!importPreview.length && (
                    <PreviewWrap>
                      <PreviewTitle>
                        Prévia (primeiros {importPreview.length})
                      </PreviewTitle>
                      <SmallMuted>
                        Dedup por SKU (global), mantém linha mais completa. EAN
                        pode repetir.
                      </SmallMuted>

                      <PreviewTable>
                        <thead>
                          <tr>
                            {[
                              "cliente",
                              "sku",
                              "ean",
                              "un_por_cx",
                              "cx_por_pallet",
                              "peso_kg",
                              "m3",
                            ].map((h) => (
                              <PreviewTh key={h}>{h}</PreviewTh>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((p, idx) => (
                            <tr key={`${p.sku}-${idx}`}>
                              <PreviewTd>{p.cliente}</PreviewTd>
                              <PreviewTd>
                                <strong>{p.sku}</strong>
                              </PreviewTd>
                              <PreviewTd>{p.ean || "—"}</PreviewTd>
                              <PreviewTd style={{ textAlign: "right" }}>
                                {p.un_por_cx}
                              </PreviewTd>
                              <PreviewTd style={{ textAlign: "right" }}>
                                {p.cx_por_pallet}
                              </PreviewTd>
                              <PreviewTd style={{ textAlign: "right" }}>
                                {p.peso_kg ?? "—"}
                              </PreviewTd>
                              <PreviewTd style={{ textAlign: "right" }}>
                                {p.m3 ?? "—"}
                              </PreviewTd>
                            </tr>
                          ))}
                        </tbody>
                      </PreviewTable>
                    </PreviewWrap>
                  )}

                  <ImportActionsRow>
                    <ClearButton
                      type="button"
                      onClick={resetImportState}
                      disabled={loading.any()}
                    >
                      Limpar importação
                    </ClearButton>

                    <FilterButton
                      type="button"
                      onClick={salvarImportacao}
                      disabled={loading.any() || !importReady.length}
                      title={
                        !importReady.length
                          ? "Carregue um arquivo primeiro"
                          : ""
                      }
                    >
                      Salvar importação
                    </FilterButton>
                  </ImportActionsRow>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <ClearButton
                type="button"
                onClick={closeAllModals}
                disabled={loading.any()}
              >
                Cancelar
              </ClearButton>

              {createTab === "manual" ? (
                <FilterButton
                  type="button"
                  onClick={handleCreate}
                  disabled={loading.any()}
                >
                  Salvar
                </FilterButton>
              ) : (
                <FilterButton
                  type="button"
                  onClick={pickFile}
                  disabled={loading.any()}
                >
                  Selecionar arquivo
                </FilterButton>
              )}
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* MODAL EDIT */}
      {openEdit && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Editar Produto</ModalTitle>

            <ModalBody>
              <Grid2>
                <div>
                  <FilterLabel>Cliente *</FilterLabel>
                  <FilterInput
                    value={form.cliente}
                    onChange={(e) => setFormField("cliente", e.target.value)}
                  />
                </div>

                <div>
                  <FilterLabel>SKU *</FilterLabel>
                  <FilterInput
                    value={form.sku}
                    onChange={(e) => setFormField("sku", e.target.value)}
                  />
                </div>

                <div>
                  <FilterLabel>EAN</FilterLabel>
                  <FilterInput
                    value={form.ean}
                    onChange={(e) => setFormField("ean", e.target.value)}
                  />
                </div>

                <div>
                  <FilterLabel>UN/CX *</FilterLabel>
                  <FilterInput
                    value={form.un_por_cx}
                    onChange={(e) => setFormField("un_por_cx", e.target.value)}
                  />
                </div>

                <div>
                  <FilterLabel>CX/Pallet *</FilterLabel>
                  <FilterInput
                    value={form.cx_por_pallet}
                    onChange={(e) =>
                      setFormField("cx_por_pallet", e.target.value)
                    }
                  />
                </div>

                <div>
                  <FilterLabel>Peso (kg)</FilterLabel>
                  <FilterInput
                    value={form.peso_kg}
                    onChange={(e) => setFormField("peso_kg", e.target.value)}
                  />
                </div>

                <div>
                  <FilterLabel>m³</FilterLabel>
                  <FilterInput
                    value={form.m3}
                    onChange={(e) => setFormField("m3", e.target.value)}
                  />
                </div>
              </Grid2>
            </ModalBody>

            <ModalFooter>
              <ClearButton
                type="button"
                onClick={closeAllModals}
                disabled={loading.any()}
              >
                Cancelar
              </ClearButton>
              <FilterButton
                type="button"
                onClick={handleUpdate}
                disabled={loading.any()}
              >
                Salvar alterações
              </FilterButton>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* MODAL DELETE */}
      {openDelete && (
        <ModalOverlay onClick={closeAllModals}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Excluir Produto</ModalTitle>

            <ModalBody>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Confirma excluir:
                <div style={{ marginTop: 10, fontWeight: 800 }}>
                  {active?.cliente} — {active?.sku}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                  Essa ação não tem “Ctrl+Z”, tá? 😅
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <ClearButton
                type="button"
                onClick={closeAllModals}
                disabled={loading.any()}
              >
                Cancelar
              </ClearButton>
              <DangerBtn
                type="button"
                onClick={handleDelete}
                disabled={loading.any()}
              >
                Excluir
              </DangerBtn>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}
    </Page>
  );
}
