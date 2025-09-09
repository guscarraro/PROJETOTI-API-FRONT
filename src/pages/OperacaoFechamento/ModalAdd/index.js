import React, { useState, useCallback, useRef, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { IoWarningOutline } from "react-icons/io5";
import { MdErrorOutline, MdCheckCircle } from "react-icons/md";
import apiLocal from "../../../services/apiLocal";
import {
  LoadingContainer,
  Loader,
  LoadingText,
  BarWrap,
  BarFill,
  BarFillServer,
  ResultRow,
  Pill,
} from "./styles";

const POLL_INTERVAL_MS = 1500;

const ModalAdd = ({ isOpen, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);

  // fase 1: upload
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // fase 2: processamento no servidor
  const [jobId, setJobId] = useState(null);
  const [serverProgress, setServerProgress] = useState(0);
  const [serverStatus, setServerStatus] = useState(null); // queued|processing|done|error
  const [serverTotals, setServerTotals] = useState({
    total: 0,
    processed: 0,
    inserted: null,
    updated: null,
    errors_count: null,
  });

  const [error, setError] = useState("");
  const pollRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setIsParsing(false);
    setIsUploading(false);
    setUploadProgress(0);
    setJobId(null);
    setServerProgress(0);
    setServerStatus(null);
    setServerTotals({ total: 0, processed: 0, inserted: null, updated: null, errors_count: null });
    setError("");
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // garante limpar ao fechar modal por fora
      resetState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const validateExcel = (f) => {
    if (!f) return false;
    const nameOk = /\.xlsx?$/i.test(f.name);
    const typeOk =
      [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ].includes(f.type) || nameOk;
    return nameOk || typeOk;
  };

  const handleFile = useCallback(async (f) => {
    setError("");
    if (!validateExcel(f)) {
      setError("Arquivo inválido. Envie um .xlsx ou .xls");
      return;
    }
    try {
      setIsParsing(true);
      await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res();
        r.onerror = () => rej(new Error("Falha ao ler arquivo"));
        r.readAsArrayBuffer(f);
      });
      setFile(f);
    } catch (e) {
      setError(e.message || "Erro ao ler o arquivo.");
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  // inicia polling do status
  const startPolling = (id) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const { data } = await apiLocal.getFechamentoImportStatus(id);
        setServerStatus(data.status);
        setServerProgress(data.percent ?? 0);
        setServerTotals({
          total: data.total ?? 0,
          processed: data.processed ?? 0,
          inserted: data.inserted ?? null,       // se o back enviar
          updated: data.updated ?? null,         // se o back enviar (tratado como "duplicados")
          errors_count: data.errors_count ?? (Array.isArray(data.errors) ? data.errors.length : null),
        });

        if (data.status === "done" || data.status === "error") {
          clearInterval(pollRef.current);
          pollRef.current = null;
          // atualiza lista do pai quando terminar
          await onUploaded?.();
        }
      } catch (err) {
        // para polling em caso de erro de status
        clearInterval(pollRef.current);
        pollRef.current = null;
        setError(err?.response?.data?.detail || err?.message || "Falha ao consultar status de importação.");
      }
    }, POLL_INTERVAL_MS);
  };

  const onUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      // FASE 1 — UPLOAD do arquivo
      const resp = await apiLocal.startFechamentoImport(file, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent?.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
        timeout: 100 * 60 * 1000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // Upload concluído, temos job_id
      const id = resp?.data?.job_id;
      if (!id) throw new Error("Falha ao iniciar processamento (job_id ausente).");
      setJobId(id);
      setIsUploading(false); // encerra loading de upload
      setServerStatus("queued");
      setServerProgress(0);

      // FASE 2 — PROCESSAMENTO no servidor (polling)
      startPolling(id);
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "Erro ao enviar o arquivo.";
      setError(msg);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return; // evita fechar durante envio
    resetState();
    onClose?.();
  };

  // Totais finais (com fallback, caso o back não envie insert/updated/errors_count)
  const duplicatesCount =
    serverTotals.updated ?? (serverTotals.total && serverTotals.processed ? Math.max(serverTotals.processed - (serverTotals.inserted ?? 0), 0) : 0);
  const errorsCount = serverTotals.errors_count ?? 0;
  const successCount =
    serverTotals.inserted ?? (serverTotals.processed - duplicatesCount - errorsCount);

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>Importar Fechamento (Excel)</ModalHeader>
      <ModalBody>
        {/* Loading de leitura/validação do arquivo */}
        {isParsing && (
          <LoadingContainer style={{ marginBottom: 12 }}>
            <LoadingText>Lendo arquivo...</LoadingText>
            <Loader />
          </LoadingContainer>
        )}

        {/* Zona de drop + input */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={{
            border: "2px dashed #999",
            borderRadius: 8,
            padding: 24,
            textAlign: "center",
            cursor: "pointer",
            opacity: isUploading ? 0.6 : 1,
          }}
          onClick={() => document.getElementById("excel-input-hidden")?.click()}
        >
          {file ? (
            <>
              <strong>Arquivo selecionado:</strong>
              <div style={{ marginTop: 6 }}>{file.name}</div>
            </>
          ) : (
            <>
              Arraste e solte o arquivo aqui<br />
              <small>ou clique para selecionar (.xlsx/.xls)</small>
            </>
          )}
          <input
            id="excel-input-hidden"
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={onPick}
            style={{ display: "none" }}
          />
        </div>

        {error && (
          <div style={{ color: "#c00", marginTop: 10 }}>{error}</div>
        )}

        {/* FASE 1 — Upload com % e barra (verde) */}
        {isUploading && (
          <div style={{ marginTop: 12, width: "100%" }}>
            <LoadingContainer>
              <LoadingText>Enviando arquivo... {uploadProgress}%</LoadingText>
            </LoadingContainer>
            <BarWrap>
              <BarFill style={{ width: `${uploadProgress}%` }} />
            </BarWrap>
          </div>
        )}

        {/* Upload 100% concluído */}
        {!isUploading && uploadProgress === 100 && jobId && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#198754" }}>
            ✔ Arquivo enviado com sucesso. Iniciando processamento no servidor...
          </div>
        )}

        {/* FASE 2 — Processamento no servidor (barra azul) */}
        {jobId && (serverStatus === "queued" || serverStatus === "processing") && (
          <div style={{ marginTop: 16 }}>
            <LoadingContainer>
              <LoadingText>
                Processando no servidor... {serverProgress}%
                {serverTotals.total ? ` — ${serverTotals.processed}/${serverTotals.total}` : ""}
              </LoadingText>
            </LoadingContainer>
            <BarWrap>
              <BarFillServer style={{ width: `${serverProgress}%` }} />
            </BarWrap>
          </div>
        )}

        {/* Resultado final */}
        {jobId && (serverStatus === "done" || serverStatus === "error") && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>
              Resultado da importação
            </div>

            <ResultRow>
              <Pill color="#FFC107" icon>
                <IoWarningOutline size={18} style={{ marginRight: 6 }} />
                Duplicados (atualizados):
              </Pill>
              <span>{duplicatesCount ?? 0}</span>
            </ResultRow>

            <ResultRow>
              <Pill color="#DC3545" icon>
                <MdErrorOutline size={18} style={{ marginRight: 6 }} />
                Erros:
              </Pill>
              <span>{errorsCount ?? 0}</span>
            </ResultRow>

            <ResultRow>
              <Pill color="#28A745" icon>
                <MdCheckCircle size={18} style={{ marginRight: 6 }} />
                Concluídos:
              </Pill>
              <span>{successCount ?? 0}</span>
            </ResultRow>

            {serverStatus === "error" && (
              <div style={{ marginTop: 8, color: "#DC3545" }}>
                Houve erro na importação. Tente novamente ou verifique o arquivo.
              </div>
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={handleClose} disabled={isUploading}>
          Fechar
        </Button>
        <Button
          color="success"
          onClick={onUpload}
          disabled={!file || isParsing || isUploading || !!jobId}
        >
          Enviar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalAdd;
