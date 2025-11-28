import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Wrap, BodyScroll } from "./style";
import { useConferenciaCore } from "./hook//useConferenciaCore";
import Toasts from "./components/Toasts";
import SetupPhase from "./components/SetupPhase";
import ScanPhase from "./components/ScanPhase";
import DivergenciaModal from "./components/DivergenciaModal";

export default function ConferenciaModal({ isOpen, onClose, pedido, onConfirm }) {
  const {
    phase,
    setPhase,
    conferente,
    benchShots,
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
    handleBenchCapture,
    removeBenchShot,
    handleScanEAN,
    handleScanLoteQuantidade,
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
    setConferente,
      totalScanUnitario,
  totalScanLote,
  } = useConferenciaCore({ pedido, isOpen, onConfirm });

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

      <ModalBody onClick={() => keepFocus(false)}>
        <BodyScroll>
          <Wrap>
            <Toasts toasts={toasts} />

            {phase === "setup" && (
              <SetupPhase
                conferente={conferente}
                setConferente={setConferente}
                benchShots={benchShots}
                onBenchCapture={handleBenchCapture}
                onRemoveBenchShot={removeBenchShot}
                benchAreaRef={benchAreaRef}
                SKIP_BENCH_PHOTOS={SKIP_BENCH_PHOTOS}
              />
            )}

            {phase === "scan" && (
              <ScanPhase
                conferente={conferente}
                setConferente={setConferente}
                elapsed={elapsed}
                fmtTime={fmtTime}
                concluidos={concluidos}
                pendentes={pendentes}
                totalLidos={totalLidos}
                totalSolic={totalSolic}
                    totalScanUnitario={totalScanUnitario}
    totalScanLote={totalScanLote}
                sinkRef={sinkRef}
                onSinkKeyDown={onSinkKeyDown}
                keepFocus={keepFocus}
                expectedBars={expectedBars}
                linhas={linhas}
                foraLista={foraLista}
                ocorrencias={ocorrencias}
                onScanEan={handleScanEAN}
                onScanLoteQuantidade={handleScanLoteQuantidade}
                onDevolvidoExcedente={marcarDevolvidoExcedente}
                onDevolvidoForaLista={marcarDevolvidoForaLista}
                onErroBipagem={erroNaBipagem}
                onErroBipagemBar={erroNaBipagemPorBar}
                onResolverOcorrencia={(occId) =>
                  resolverOcorrenciaById(occId, "Resolvido manualmente")
                }
              />
            )}
          </Wrap>
        </BodyScroll>
      </ModalBody>

      <ModalFooter style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          color="secondary"
          onClick={() => {
            stopMediaStreamsIn(benchAreaRef.current);
            onClose();
          }}
        >
          Cancelar
        </Button>

        {phase === "setup" && (
          <Button
            color="primary"
            disabled={!podeIrParaScan}
            onClick={goToScan}
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
              disabled={!podeSalvar100 || savingSubmit || temOcorrenciaAberta}
              onClick={salvarConferencia}
              title={
                !podeSalvar100
                  ? "Pendências ainda abertas"
                  : temOcorrenciaAberta
                  ? "Feche as ocorrências para concluir 100%"
                  : "Salvar conferência (100%)"
              }
            >
              {savingSubmit ? "Lançando..." : "Salvar conferência (100%)"}
            </Button>
          </>
        )}
      </ModalFooter>

      <DivergenciaModal
        isOpen={abrirDiv}
        onClose={() => setAbrirDiv(false)}
        linhas={linhas}
        foraLista={foraLista}
        divTipo={divTipo}
        setDivTipo={setDivTipo}
        divItemCod={divItemCod}
        setDivItemCod={setDivItemCod}
        divDetalhe={divDetalhe}
        setDivDetalhe={setDivDetalhe}
        onSubmit={submitDivergencia}
      />
    </Modal>
  );
}
