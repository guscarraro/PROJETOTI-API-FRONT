import React from "react";
import { HeadRow, ScannerWrap } from "../style";
import { Field, SmallMuted } from "../../style";
import ItemScanner from "../ItemScanner";
import ItemsTable from "../tables/ItemsTable";
import ForaListaTable from "../tables/ForaListaTable";
import OcorrenciasTable from "../tables/OcorrenciasTable";
import {
  modernTableStyles,
  occTableStyles,
  loteChipStyles,
} from "../tableStyles";
import BadgeSoft from "./BadgeSoft";

export default function ScanPhase({
  conferente,
  setConferente,
  elapsed,
  fmtTime,
  concluidos,
  pendentes,
  totalLidos,
  totalSolic,
  sinkRef,
  onSinkKeyDown,
  keepFocus,
  expectedBars,
  linhas,
  foraLista,
  ocorrencias,
  onScanEan,
  onScanLoteQuantidade,
  onDevolvidoExcedente,
  onDevolvidoForaLista,
  onErroBipagem,
  onErroBipagemBar,
  onResolverOcorrencia,
  totalScanUnitario,
  totalScanLote,
  loteSemEan
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <HeadRow>
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
              disabled
            />
          </div>
          <span style={{ fontSize: 12, opacity: 0.8 }}>
            ⏱ {fmtTime(elapsed)}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <BadgeSoft title="Itens concluídos">{concluidos}</BadgeSoft>
          <BadgeSoft title="Itens pendentes">{pendentes}</BadgeSoft>
          <BadgeSoft title="Peças lidas / solicitadas">
            {totalLidos} / {totalSolic}
          </BadgeSoft>
        </div>
      </HeadRow>

      <input
        ref={sinkRef}
        onKeyDown={onSinkKeyDown}
        inputMode="none"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        tabIndex={-1}
        onBlur={() => setTimeout(() => keepFocus(false), 0)}
        aria-hidden="true"
        style={{
          position: "fixed",
          opacity: 0,
          width: 1,
          height: 1,
          left: -9999,
          top: -9999,
        }}
      />

      <ScannerWrap>
        <ItemScanner
          expectedBars={expectedBars}
          onScanEan={onScanEan}
          onScanLoteQuantidade={onScanLoteQuantidade}
          loteSemEan={loteSemEan}
        />
      </ScannerWrap>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

        <BadgeSoft title="Leituras unitárias (EAN)">
          Leitura unitaria: {totalScanUnitario}
        </BadgeSoft>
        <BadgeSoft title="Leituras por lote">Leitura em lote: {totalScanLote}</BadgeSoft>
      </div>

      <ItemsTable
        linhas={linhas}
        selectedCod={null}
        onSelectCod={() => {}}
        styles={modernTableStyles}
        loteChipStyles={loteChipStyles}
        onDevolvidoExcedente={onDevolvidoExcedente}
      />

      {foraLista.length > 0 && (
        <ForaListaTable
          foraLista={foraLista}
          onDevolvido={onDevolvidoForaLista}
          onErroBipagemBar={onErroBipagemBar}
          styles={modernTableStyles}
        />
      )}

      <OcorrenciasTable
        ocorrencias={ocorrencias}
        styles={occTableStyles}
        onResolverOcorrencia={onResolverOcorrencia}
        onErroBipagem={onErroBipagem}
        onDevolvidoExcedente={onDevolvidoExcedente}
        onDevolvidoProduto={onDevolvidoForaLista}
      />
    </div>
  );
}
