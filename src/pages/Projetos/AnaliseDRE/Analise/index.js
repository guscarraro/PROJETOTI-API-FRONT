import React, { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  FaFileImport,
  FaPlay,
  FaTrash,
  FaCheck,
  FaChartBar,
} from "react-icons/fa";
import { FiSave, FiX, FiCheckSquare, FiSquare } from "react-icons/fi";

import apiLocal from "../../../../services/apiLocal";
import useLoading from "../../../../hooks/useLoading";
import NavBar from "../../../Projetos/components/NavBar";

import AiSiriOverlay from "./components/AiSiriOverlay";
import KpiGrid from "./components/KpiGrid";
import DreCharts from "./components/DreCharts";
import {
  CfinDivergenteModal,
  ValorDivergenteModal,
  SemSetorModal,
  DuplicadosModal,
} from "./components/Modals";

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
  FilterSelect,
  FilterButton,
  ClearButton,
  TableWrap,
  Table,
  Th,
  Td,
  TdCompact,
  CountPill,
  MutedText,
  DropArea,
  DropTitle,
  DropHint,
  ActionsRow,
  Divider,
  ModalOverlay,
  ModalCard,
  ModalHeader,
  ModalBody,
  ModalFooter,
  SmallButton,
} from "./style";

function toDateInputValue(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseMoneyBRL(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const s = String(value)
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function excelSerialToISO(serial) {
  const base = new Date(Date.UTC(1899, 11, 30));
  const ms = base.getTime() + Number(serial) * 24 * 60 * 60 * 1000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  return toDateInputValue(
    new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function normalizeDateCell(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return excelSerialToISO(v);

  const s = String(v).trim();

  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m2) return s;

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return toDateInputValue(d);

  return null;
}

function safeStr(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s ? s : null;
}

function onlyDigits(v) {
  if (v === null || v === undefined) return null;
  const s = String(v);
  const d = s.replace(/\D+/g, "");
  return d ? d : null;
}

function pickRow(row, keys) {
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (row && Object.prototype.hasOwnProperty.call(row, k)) return row[k];
  }
  return undefined;
}

function buildCodAgrupador(ano, mes2) {
  const rand = String(Math.floor(Math.random() * 900000) + 100000);
  return `DRE-${ano}-${mes2}-${rand}`;
}

const MESES = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export default function DREAnalisePage() {
  const loading = useLoading();
  const fileInputRef = useRef(null);

  const [relatorioId, setRelatorioId] = useState("");
  const [codAgrupador, setCodAgrupador] = useState("");
  const [fileHash, setFileHash] = useState("");

  const [itens, setItens] = useState([]);
  const [kpis, setKpis] = useState(null);
const [itensVersion, setItensVersion] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [modal, setModal] = useState({ open: false, modalType: "", rows: [] });

  const now = useMemo(() => new Date(), []);
  const [createForm, setCreateForm] = useState(() => ({
    ano: String(now.getFullYear()),
    mes: String(now.getMonth() + 1).padStart(2, "0"),
    nome_arquivo: "",
  }));

  const canImport = !!String(relatorioId || "").trim();
  const hasItens = itens.length > 0;
  const dropDisabled = !canImport || loading.any();

  const loadRelatorio = useCallback(
    async (id) => {
      const resp = await loading.wrap("dre-get-relatorio", () =>
        apiLocal.dreGetRelatorio(id),
      );
      const data = resp.data || null;
      const maybeCod = data?.cod_agrupador || "";
      const maybeHash = data?.file_hash || "";
      if (maybeCod) setCodAgrupador(maybeCod);
      if (maybeHash) setFileHash(maybeHash);
    },
    [loading],
  );

const loadItens = useCallback(
  async (id) => {
    const resp = await loading.wrap("dre-list-itens", () =>
      apiLocal.dreListItens(id, { limit: 5000 }),
    );
    setItens(Array.isArray(resp.data) ? resp.data : []);
    setItensVersion(v => v + 1); // Incrementa versão
  },
  [loading],
);

const loadKpis = useCallback(
  async (id) => {
    const resp = await loading.wrap("dre-kpis", () => apiLocal.dreKpis(id));
    // Mescla os KPIs com as sugestões existentes
    setKpis(prev => ({
      ...(prev || {}),
      ...(resp.data || {}),
      // Preserva as sugestões se já existirem
      suggestions: prev?.suggestions || []
    }));
  },
  [loading],
);

  const refreshAll = useCallback(
    async (id) => {
      await loadRelatorio(id);
      await loadItens(id);
      await loadKpis(id);
    },
    [loadRelatorio, loadItens, loadKpis],
  );

  const handleModalUpdate = useCallback(async () => {
    if (relatorioId) {
      await loadItens(relatorioId);
      await loadKpis(relatorioId);
    }
  }, [relatorioId, loadItens, loadKpis]);

  const handleCarregar = useCallback(async () => {
    const rid = String(relatorioId || "").trim();
    if (!rid) {
      toast.error("Informe o relatorio_id para carregar.");
      return;
    }
    await refreshAll(rid);
    toast.success("Relatório carregado!");
  }, [relatorioId, refreshAll]);

  const handleCreateRelatorio = useCallback(async () => {
    try {
      const anoNum = Number(createForm.ano);
      const mesNum = Number(createForm.mes);

      if (!anoNum || !mesNum) {
        toast.error("Ano e mês inválidos.");
        return;
      }

      const mes2 = String(createForm.mes).padStart(2, "0");
      const cod = buildCodAgrupador(anoNum, mes2);
      const fakeHash = `manual-${Date.now()}`;

      const payload = {
        cod_agrupador: cod,
        ano: anoNum,
        mes: mesNum,
        nome_arquivo: createForm.nome_arquivo?.trim() || "IMPORT_MANUAL.xlsx",
        file_hash: fakeHash,
      };

      const resp = await loading.wrap("dre-create-relatorio", () =>
        apiLocal.dreCreateRelatorio(payload),
      );

      const created =
        (resp?.data?.data &&
          (Array.isArray(resp.data.data)
            ? resp.data.data[0]
            : resp.data.data)) ||
        (Array.isArray(resp?.data) ? resp.data[0] : resp?.data);

      const id = created?.id;
      if (!id) {
        toast.error("Não consegui criar o relatório (sem id).");
        return;
      }

      setRelatorioId(id);
      setCodAgrupador(cod);
      setFileHash(fakeHash);

      setItens([]);
      setKpis(null);

      toast.info("Relatório criado. Agora importe o XLSX.");
      await refreshAll(id);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao criar relatório.");
    }
  }, [createForm, loading, refreshAll]);

  const handleDeleteRelatorio = useCallback(async () => {
    const rid = String(relatorioId || "").trim();
    if (!rid) return;

    try {
      await loading.wrap("dre-delete-relatorio", () =>
        apiLocal.dreDeleteRelatorio(rid),
      );
      toast.success("Relatório excluído");

      setRelatorioId("");
      setCodAgrupador("");
      setFileHash("");
      setItens([]);
      setKpis(null);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir relatório");
    }
  }, [loading, relatorioId]);

const handleAnalisar = useCallback(async () => {
  const rid = String(relatorioId || "").trim();
  if (!rid) return;

  try {
    // Chama a análise que retorna as sugestões e já aplica as atualizações automáticas
    const response = await loading.wrap("dre-analisar", () => apiLocal.dreAnalisar(rid));
    
    // Salva as sugestões no estado kpis
    if (response.data?.result) {
      setKpis(response.data.result);
    }
    
    // DEPOIS da análise, carrega os itens atualizados (com os setores já atribuídos)
    await loadItens(rid);
    
    // Carrega os KPIs atualizados
    const kpisResp = await apiLocal.dreKpis(rid);
    setKpis(prev => ({
      ...(prev || {}),
      ...(kpisResp.data || {}),
      suggestions: response.data?.result?.suggestions || []
    }));
    
    toast.success("Análise executada");
  } catch (e) {
    console.error(e);
    toast.error("Erro ao analisar");
  }
}, [loading, loadItens, relatorioId]);

  const handleConcluir = useCallback(async () => {
    const rid = String(relatorioId || "").trim();
    if (!rid) return;

    try {
      await loading.wrap("dre-concluir", () => apiLocal.dreConcluir(rid));
      toast.success("Relatório concluído");
      await loadRelatorio(rid);
      await loadKpis(rid);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao concluir");
    }
  }, [loading, loadKpis, loadRelatorio, relatorioId]);

  const parseAndUploadXlsx = useCallback(
    async (file) => {
      const rid = String(relatorioId || "").trim();
      if (!rid) {
        toast.error("Crie ou carregue um relatório antes de importar");
        return;
      }
      if (!codAgrupador) {
        toast.error("cod_agrupador não encontrado. Recarregue o relatório.");
        return;
      }

      try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const firstSheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[firstSheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
        if (!rows.length) {
          toast.error("Arquivo vazio");
          return;
        }

        const itemsPayload = [];
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];

          const numeroDoc = pickRow(r, [
            "Numero",
            "Número",
            "Num",
            "Numero doc",
            "Número doc",
          ]);
          const tipoDoc = pickRow(r, ["Tipo doc", "Tipo", "TipoDoc"]);
          const dataDoc = pickRow(r, ["Data doc", "Data", "DataDoc"]);
          const dataInclusao = pickRow(r, [
            "Inclusao",
            "Inclusão",
            "Inclusao doc",
            "Data inclusao",
            "Data inclusão",
          ]);

          const doc = pickRow(r, [
            "Cnpj / cpf",
            "Cnpj/cp",
            "CNPJ / CPF",
            "Cnpj / cp",
            "Doc",
          ]);

          const pessoa = pickRow(r, ["Pessoa"]);
          const item = pickRow(r, ["Item"]);

          const cfinCodigo = pickRow(r, [
            "Estrutura cfin",
            "Estrutura CFIn",
            "CFIn",
            "CFIN",
            "cfin_codigo",
          ]);
          const cfinNome = pickRow(r, [
            "Nome cfin",
            "Nome CFIn",
            "cfin_nome",
            "Nome",
          ]);

          const empresa = pickRow(r, ["Empresa"]);
          const valorItem = pickRow(r, ["Valor item", "ValorItem"]);
          const valorDoc = pickRow(r, ["Valor doc", "ValorDoc"]);

          const abrangencia = pickRow(r, ["Abrangencia", "Abr", "Abrangência"]);

          const hasSomething =
            safeStr(numeroDoc) ||
            safeStr(item) ||
            safeStr(doc) ||
            safeStr(pessoa);
          if (!hasSomething) continue;

          itemsPayload.push({
            numero_doc: safeStr(numeroDoc),
            abrangencia: safeStr(abrangencia),
            tipo_doc: safeStr(tipoDoc),
            data_doc: normalizeDateCell(dataDoc),
            data_inclusao: normalizeDateCell(dataInclusao),

            doc: onlyDigits(doc),
            pessoa: safeStr(pessoa),

            item: safeStr(item),
            cfin_codigo: safeStr(cfinCodigo),
            cfin_nome: safeStr(cfinNome),

            empresa: safeStr(empresa),
            valor_item: parseMoneyBRL(valorItem),
            valor_doc: parseMoneyBRL(valorDoc),

            sheet_name: safeStr(firstSheetName),
            row_index: i + 2,
          });
        }

        if (!itemsPayload.length) {
          toast.error("Não encontrei linhas válidas no XLSX");
          return;
        }

        await loading.wrap("dre-insert-items-bulk", () =>
          apiLocal.dreInsertItensBulk({
            relatorio_id: rid,
            cod_agrupador: codAgrupador,
            items: itemsPayload,
          }),
        );

        toast.success(`${itemsPayload.length} linhas importadas`);
        await loadItens(rid);
        await handleAnalisar();
      } catch (e) {
        console.error(e);
        toast.error("Erro ao importar XLSX");
      }
    },
    [codAgrupador, handleAnalisar, loadItens, loading, relatorioId],
  );

  const handleFilePicked = useCallback(
    (file) => {
      if (!file) return;
      const name = String(file?.name || "").toLowerCase();
      if (!name.endsWith(".xlsx")) {
        toast.error("Envie um arquivo .xlsx");
        return;
      }
      parseAndUploadXlsx(file);
    },
    [parseAndUploadXlsx],
  );

  const onDropEvent = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      if (dropDisabled) return;
      const file = e.dataTransfer?.files?.[0];
      handleFilePicked(file);
    },
    [dropDisabled, handleFilePicked],
  );

  const onDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropDisabled) return;
    },
    [dropDisabled],
  );

  const onDragEnter = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropDisabled) return;
      setIsDragActive(true);
    },
    [dropDisabled],
  );

  const onDragLeave = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropDisabled) return;

      const related = e.relatedTarget;
      const current = e.currentTarget;
      if (current && related && current.contains(related)) return;

      setIsDragActive(false);
    },
    [dropDisabled],
  );

  const onClickDropArea = useCallback(() => {
    if (dropDisabled) return;
    if (fileInputRef.current) fileInputRef.current.click();
  }, [dropDisabled]);

  const formatBRL = useCallback(
    (v) =>
      Number(v || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    [],
  );

  const showDate = useCallback((r) => r.data_doc || r.data_inclusao || "—", []);

  // charts (sem reduce)
  const chartByCfin = useMemo(() => {
    const map = {};
    for (let i = 0; i < itens.length; i++) {
      const it = itens[i] || {};
      const key = (it.cfin_codigo || "SEM_CFIN").trim() || "SEM_CFIN";
      const v = Number(it.valor_doc || 0);
      map[key] = (map[key] || 0) + (Number.isFinite(v) ? v : 0);
    }
    const arr = [];
    for (const k in map) arr.push({ name: k, value: map[k] });
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 16);
  }, [itens]);

  const chartBySetor = useMemo(() => {
    const map = {};
    for (let i = 0; i < itens.length; i++) {
      const it = itens[i] || {};
      const setor = (it.setor || "").trim() || "SEM_SETOR";
      const v = Number(it.valor_doc || 0);
      map[setor] = (map[setor] || 0) + (Number.isFinite(v) ? v : 0);
    }
    const arr = [];
    for (const k in map) arr.push({ name: k, value: map[k] });
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 10);
  }, [itens]);

  const totals = useMemo(() => {
    let totalValor = 0;
    for (let i = 0; i < itens.length; i++) {
      const v = Number(itens[i]?.valor_doc || 0);
      if (Number.isFinite(v)) totalValor += v;
    }
    return { count: itens.length, totalValor };
  }, [itens]);

  const openKpiModal = useCallback(
    (key) => {
      let rows = [];

      if (key === "cfin_divergente") {
        // Pega as sugestões do estado kpis
        const sugestoes = kpis?.suggestions || [];

        for (let i = 0; i < itens.length; i++) {
          if (itens[i]?.flag_cfin_divergente) {
            const item = { ...itens[i] };

            // Encontra a sugestão para este item
            const sugestao = sugestoes.find((s) => s.item_id === item.id);
            if (sugestao) {
              item.sugestao_cfin = sugestao.sugestao;
            }

            rows.push(item);
          }
        }
      } else if (key === "valor_divergente") {
        for (let i = 0; i < itens.length; i++)
          if (itens[i]?.flag_valor_divergente) rows.push(itens[i]);
      } else if (key === "duplicados") {
        for (let i = 0; i < itens.length; i++)
          if (itens[i]?.flag_duplicado) rows.push(itens[i]);
      } else if (key === "sem_setor") {
        for (let i = 0; i < itens.length; i++) {
          const s = (itens[i]?.setor || "").trim();
          if (!s) rows.push(itens[i]);
        }
      } else {
        rows = itens;
      }

      setModal({ open: true, modalType: key, rows });
    },
    [itens, kpis],
  );

  const overlayTitle = useMemo(() => {
    if (!loading.any()) return "";
    return hasItens ? "IA analisando seu DRE…" : "Preparando importação…";
  }, [loading, hasItens]);

  const overlaySub = useMemo(() => {
    if (!loading.any()) return "";
    if (!hasItens) return "Lendo planilha e montando o modelo de análise";
    return "Detectando divergências, duplicidades e itens sem setor";
  }, [loading, hasItens]);

  return (
    <Page>
      <AiSiriOverlay
        active={loading.any()}
        title={overlayTitle}
        subtitle={overlaySub}
      />
      <NavBar />

      <TitleBar>
        <H1>DRE — Análise</H1>

        <FiltersRight>
          <CountPill>
            {relatorioId
              ? `Relatório: ${codAgrupador || String(relatorioId).slice(0, 8) + "…"}`
              : "Sem relatório"}
          </CountPill>

          {!!relatorioId && (
            <>
              <FilterButton
                type="button"
                onClick={handleAnalisar}
                disabled={loading.any() || !hasItens}
                title="Executar análise"
                style={{ gap: 8 }}
              >
                <FaPlay /> Analisar
              </FilterButton>

              <FilterButton
                type="button"
                onClick={handleConcluir}
                disabled={loading.any() || !hasItens}
                title="Concluir relatório"
                style={{ gap: 8 }}
              >
                <FaCheck /> Concluir
              </FilterButton>

              <ClearButton
                type="button"
                onClick={handleDeleteRelatorio}
                disabled={loading.any()}
                title="Excluir relatório"
                style={{ gap: 8 }}
              >
                <FaTrash /> Excluir
              </ClearButton>
            </>
          )}
        </FiltersRight>
      </TitleBar>

      <Section>
        <MutedText style={{ marginBottom: 10 }}>
          Fluxo: criar/carregar → importar XLSX → analisar → corrigir →
          concluir.
        </MutedText>

        <FiltersRow>
          <FiltersLeft>
            <FilterGroup>
              <FilterLabel>Ano</FilterLabel>
              <FilterInput
                type="number"
                value={createForm.ano}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, ano: e.target.value }))
                }
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Mês</FilterLabel>
              <FilterSelect
                value={createForm.mes}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, mes: e.target.value }))
                }
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup style={{ minWidth: 280 }}>
              <FilterLabel>relatorio_id (se já existir)</FilterLabel>
              <FilterInput
                value={relatorioId}
                onChange={(e) => setRelatorioId(e.target.value)}
                placeholder="Cole o UUID aqui pra carregar"
              />
            </FilterGroup>

            <FilterGroup style={{ minWidth: 260 }}>
              <FilterLabel>Nome do arquivo (opcional)</FilterLabel>
              <FilterInput
                value={createForm.nome_arquivo}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, nome_arquivo: e.target.value }))
                }
                placeholder="IMPORT_MANUAL.xlsx"
              />
            </FilterGroup>
          </FiltersLeft>

          <FiltersRight>
            <FilterButton
              type="button"
              onClick={handleCreateRelatorio}
              disabled={loading.any()}
              style={{ gap: 8 }}
            >
              <FaFileImport /> Criar relatório
            </FilterButton>

            <SmallButton
              type="button"
              onClick={handleCarregar}
              disabled={loading.any() || !String(relatorioId || "").trim()}
              title="Carregar dados do relatório informado"
            >
              Carregar
            </SmallButton>
          </FiltersRight>
        </FiltersRow>

        {!!relatorioId && (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              opacity: 0.75,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>cod_agrupador: {codAgrupador || "—"}</div>
            <div>file_hash: {fileHash || "—"}</div>
          </div>
        )}
      </Section>

      {!!relatorioId && (
        <Section style={{ marginTop: 14 }}>
          <ActionsRow>
            <div>
              <div style={{ fontWeight: 1000, fontSize: 13 }}>
                Importar XLSX do sistema externo
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Arraste o arquivo ou clique na área. Após importar, a análise
                roda automaticamente.
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <SmallButton
                type="button"
                disabled={!canImport || loading.any()}
                onClick={() => openKpiModal("all")}
                style={{ gap: 8 }}
                title="Ver itens"
              >
                <FaChartBar /> Ver itens
              </SmallButton>

              <label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  style={{ display: "none" }}
                  disabled={!canImport || loading.any()}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) parseAndUploadXlsx(f);
                    e.target.value = "";
                  }}
                />
                <FilterButton
                  as="span"
                  role="button"
                  style={{ cursor: "pointer", gap: 8 }}
                >
                  <FaFileImport /> Selecionar arquivo
                </FilterButton>
              </label>
            </div>
          </ActionsRow>

          <DropArea
            $active={isDragActive}
            $disabled={dropDisabled}
            onClick={onClickDropArea}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDropEvent}
            role="button"
            tabIndex={dropDisabled ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onClickDropArea();
            }}
          >
            <DropTitle>
              {loading.any()
                ? "Processando…"
                : isDragActive
                  ? "Solta aqui 👇"
                  : "Arraste e solte seu .xlsx aqui (ou clique)"}
            </DropTitle>
            <DropHint>
              Dica: se o Excel vier com colunas levemente diferentes, o parser
              tenta se adaptar.
            </DropHint>
          </DropArea>
        </Section>
      )}

      {!!relatorioId && (
        <>
          <Section style={{ marginTop: 14 }}>
            <KpiGrid
              kpis={kpis}
              totals={totals}
              loading={loading.any()}
              onOpen={(key) => openKpiModal(key)}
            />
          </Section>

          <Section style={{ marginTop: 14 }}>
            <DreCharts
              chartByCfin={chartByCfin}
              chartBySetor={chartBySetor}
              formatBRL={formatBRL}
            />
          </Section>

          <Section style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 1000, fontSize: 13 }}>
                Preview (últimos 50)
              </div>
              <CountPill>{itens.length} itens</CountPill>
            </div>

            <Divider />

            <TableWrap
              style={{
                maxHeight: "52vh",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <Table>
                <thead>
                  <tr>
                    {[
                      "Número doc",
                      "Data",
                      "Doc",
                      "Pessoa",
                      "Item",
                      "CFIn cód",
                      "CFIn nome",
                      "Empresa",
                      "Valor doc",
                      "Setor",
                    ].map((h) => (
                      <Th
                        key={h}
                        style={{ whiteSpace: "nowrap", padding: "6px 8px" }}
                      >
                        {h}
                      </Th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {itens.slice(Math.max(0, itens.length - 50)).map((r) => (
                    <tr key={`${r.id}-${itensVersion}`}>
                      <TdCompact>{r.numero_doc || "—"}</TdCompact>
                      <TdCompact>{showDate(r)}</TdCompact>
                      <TdCompact>{r.doc || "—"}</TdCompact>
                      <TdCompact>{r.pessoa || "—"}</TdCompact>
                      <TdCompact
                        style={{
                          maxWidth: 320,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.item || "—"}
                      </TdCompact>
                      <TdCompact>{r.cfin_codigo || "—"}</TdCompact>
                      <TdCompact>{r.cfin_nome || "—"}</TdCompact>
                      <TdCompact>{r.empresa || "—"}</TdCompact>
                      <TdCompact style={{ textAlign: "right" }}>
                        {formatBRL(r.valor_doc)}
                      </TdCompact>
                      <TdCompact>
                        <FilterSelect
                          value={r.setor || ""}
                          onChange={async (e) => {
                            try {
                              await apiLocal.dreUpdateItem({
                                id: r.id,
                                setor: e.target.value,
                              });
                              await loadItens(relatorioId);
                              toast.success("Setor atualizado");
                            } catch (error) {
                              toast.error("Erro ao atualizar setor");
                            }
                          }}
                          style={{
                            padding: "2px 4px",
                            fontSize: 12,
                            width: 100,
                          }}
                        >
                          <option value="">Selecione</option>
                          <option value="Fiscal">Fiscal</option>
                          <option value="Contábil">Contábil</option>
                          <option value="Financeiro">Financeiro</option>
                          <option value="RH">RH</option>
                          <option value="Compras">Compras</option>
                          <option value="Impostos">Impostos</option>
                        </FilterSelect>
                      </TdCompact>
                    </tr>
                  ))}

                  {!itens.length && !loading.any() && (
                    <tr>
                      <Td
                        colSpan={10}
                        style={{
                          textAlign: "center",
                          opacity: 0.7,
                          padding: 10,
                        }}
                      >
                        Nenhum item importado ainda.
                      </Td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableWrap>
          </Section>
        </>
      )}

      {modal.open && (
        <ModalOverlay
          onClick={() => setModal({ open: false, modalType: "", rows: [] })}
        >
          {modal.modalType === "cfin_divergente" && (
            <CfinDivergenteModal
              rows={modal.rows}
              onClose={() => setModal({ open: false, modalType: "", rows: [] })}
              onUpdate={handleModalUpdate}
            />
          )}
          {modal.modalType === "valor_divergente" && (
            <ValorDivergenteModal
              rows={modal.rows}
              onClose={() => setModal({ open: false, modalType: "", rows: [] })}
              onUpdate={handleModalUpdate}
            />
          )}
          {modal.modalType === "sem_setor" && (
            <SemSetorModal
              rows={modal.rows}
              onClose={() => setModal({ open: false, modalType: "", rows: [] })}
              onUpdate={handleModalUpdate}
            />
          )}
          {modal.modalType === "duplicados" && (
            <DuplicadosModal
              rows={modal.rows}
              onClose={() => setModal({ open: false, modalType: "", rows: [] })}
              onUpdate={handleModalUpdate}
            />
          )}
          {modal.modalType === "all" && (
            <ModalCard onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <div style={{ fontWeight: 1000 }}>Todos os Itens</div>
                <CountPill>{modal.rows.length} itens</CountPill>
              </ModalHeader>

              <ModalBody>
                <TableWrap style={{ maxHeight: "60vh", overflow: "auto" }}>
                  <Table>
                    <thead>
                      <tr>
                        {[
                          "Número doc",
                          "Data",
                          "Doc",
                          "Pessoa",
                          "Item",
                          "CFIn",
                          "Empresa",
                          "Valor doc",
                          "Setor",
                        ].map((h) => (
                          <Th
                            key={h}
                            style={{ whiteSpace: "nowrap", padding: "6px 8px" }}
                          >
                            {h}
                          </Th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modal.rows.map((r) => (
                        <tr key={r.id}>
                          <TdCompact>{r.numero_doc || "—"}</TdCompact>
                          <TdCompact>{showDate(r)}</TdCompact>
                          <TdCompact>{r.doc || "—"}</TdCompact>
                          <TdCompact>{r.pessoa || "—"}</TdCompact>
                          <TdCompact
                            style={{
                              maxWidth: 360,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {r.item || "—"}
                          </TdCompact>
                          <TdCompact style={{ whiteSpace: "nowrap" }}>
                            {r.cfin_codigo || "—"} — {r.cfin_nome || "—"}
                          </TdCompact>
                          <TdCompact>{r.empresa || "—"}</TdCompact>
                          <TdCompact style={{ textAlign: "right" }}>
                            {formatBRL(r.valor_doc)}
                          </TdCompact>
                          <TdCompact>
                            <FilterSelect
                              value={r.setor || ""}
                              onChange={async (e) => {
                                try {
                                  await apiLocal.dreUpdateItem({
                                    id: r.id,
                                    setor: e.target.value,
                                  });
                                  await loadItens(relatorioId);
                                  toast.success("Setor atualizado");
                                  handleModalUpdate();
                                } catch (error) {
                                  toast.error("Erro ao atualizar setor");
                                }
                              }}
                              style={{
                                padding: "2px 4px",
                                fontSize: 12,
                                width: 100,
                              }}
                            >
                              <option value="">Selecione</option>
                              <option value="Fiscal">Fiscal</option>
                              <option value="Contábil">Contábil</option>
                              <option value="Financeiro">Financeiro</option>
                              <option value="RH">RH</option>
                              <option value="Compras">Compras</option>
                              <option value="Impostos">Impostos</option>
                            </FilterSelect>
                          </TdCompact>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrap>
              </ModalBody>

              <ModalFooter>
                <SmallButton
                  type="button"
                  onClick={() =>
                    setModal({ open: false, modalType: "", rows: [] })
                  }
                >
                  <FiX /> Fechar
                </SmallButton>
              </ModalFooter>
            </ModalCard>
          )}
        </ModalOverlay>
      )}
    </Page>
  );
}
