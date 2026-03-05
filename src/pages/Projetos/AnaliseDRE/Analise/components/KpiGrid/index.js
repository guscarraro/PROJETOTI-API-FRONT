import React, { useMemo } from "react";
import {
  FiAlertTriangle,
  FiDollarSign,
  FiCopy,
  FiLayers,
  FiList,
  FiTag,
  FiSearch,
  FiCheckCircle,
} from "react-icons/fi";
import { Grid, KpiCard, KpiTop, KpiTitle, KpiValue, KpiHint, KpiBtnRow, KpiBtn, StatusPill } from "./style";

function formatBRL(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function KpiGrid({ kpis, totals, onOpen, loading }) {
  const base = useMemo(() => {
    const safe = kpis || {};
    return {
      total_linhas: Number(totals?.count || 0),
      total_valor: Number(totals?.totalValor || 0),
      cfin_divergente: Number(safe.cfin_divergente || 0),
      valor_divergente: Number(safe.valor_divergente || 0),
      duplicados: Number(safe.duplicados || 0),
      sem_setor: Number(safe.sem_setor || 0),
    };
  }, [kpis, totals]);

  const okAll = base.cfin_divergente === 0 && base.valor_divergente === 0 && base.duplicados === 0 && base.sem_setor === 0;

  return (
    <Grid>
      <KpiCard>
        <KpiTop>
          <KpiTitle><FiList /> Total de linhas</KpiTitle>
          <StatusPill $tone="info"><FiSearch /> Importado</StatusPill>
        </KpiTop>
        <KpiValue>{base.total_linhas}</KpiValue>
        <KpiHint>Itens reconhecidos na planilha</KpiHint>
      </KpiCard>

      <KpiCard>
        <KpiTop>
          <KpiTitle><FiLayers /> Total (valor doc)</KpiTitle>
          <StatusPill $tone="info"><FiDollarSign /> Consolidado</StatusPill>
        </KpiTop>
        <KpiValue>{formatBRL(base.total_valor)}</KpiValue>
        <KpiHint>Soma em cima de valor_doc</KpiHint>
      </KpiCard>

      <KpiCard $warn={base.cfin_divergente > 0}>
        <KpiTop>
          <KpiTitle><FiAlertTriangle /> CFIn divergente</KpiTitle>
          <StatusPill $tone={base.cfin_divergente > 0 ? "warn" : "ok"}>
            {base.cfin_divergente > 0 ? <FiTag /> : <FiCheckCircle />}
            {base.cfin_divergente > 0 ? "Ação" : "OK"}
          </StatusPill>
        </KpiTop>
        <KpiValue>{base.cfin_divergente}</KpiValue>
        <KpiHint>Nome/código não bate com o cadastro</KpiHint>
        <KpiBtnRow>
          <KpiBtn disabled={loading || !base.cfin_divergente} onClick={() => onOpen("cfin_divergente")}>
            Ver itens
          </KpiBtn>
        </KpiBtnRow>
      </KpiCard>

      <KpiCard $warn={base.valor_divergente > 0}>
        <KpiTop>
          <KpiTitle><FiDollarSign /> Valor divergente</KpiTitle>
          <StatusPill $tone={base.valor_divergente > 0 ? "warn" : "ok"}>
            {base.valor_divergente > 0 ? <FiAlertTriangle /> : <FiCheckCircle />}
            {base.valor_divergente > 0 ? "Justificar" : "OK"}
          </StatusPill>
        </KpiTop>
        <KpiValue>{base.valor_divergente}</KpiValue>
        <KpiHint>Fora do programado (tolerância)</KpiHint>
        <KpiBtnRow>
          <KpiBtn disabled={loading || !base.valor_divergente} onClick={() => onOpen("valor_divergente")}>
            Justificar
          </KpiBtn>
        </KpiBtnRow>
      </KpiCard>

      <KpiCard $warn={base.duplicados > 0}>
        <KpiTop>
          <KpiTitle><FiCopy /> Duplicados</KpiTitle>
          <StatusPill $tone={base.duplicados > 0 ? "warn" : "ok"}>
            {base.duplicados > 0 ? <FiAlertTriangle /> : <FiCheckCircle />}
            {base.duplicados > 0 ? "Revisar" : "OK"}
          </StatusPill>
        </KpiTop>
        <KpiValue>{base.duplicados}</KpiValue>
        <KpiHint>Número + valor repetidos</KpiHint>
        <KpiBtnRow>
          <KpiBtn disabled={loading || !base.duplicados} onClick={() => onOpen("duplicados")}>
            Ver
          </KpiBtn>
        </KpiBtnRow>
      </KpiCard>

      <KpiCard $warn={base.sem_setor > 0}>
        <KpiTop>
          <KpiTitle><FiAlertTriangle /> Sem setor</KpiTitle>
          <StatusPill $tone={base.sem_setor > 0 ? "warn" : "ok"}>
            {base.sem_setor > 0 ? <FiAlertTriangle /> : <FiCheckCircle />}
            {base.sem_setor > 0 ? "Classificar" : "OK"}
          </StatusPill>
        </KpiTop>
        <KpiValue>{base.sem_setor}</KpiValue>
        <KpiHint>Precisa atribuir setor</KpiHint>
        <KpiBtnRow>
          <KpiBtn disabled={loading || !base.sem_setor} onClick={() => onOpen("sem_setor")}>
            Corrigir
          </KpiBtn>
        </KpiBtnRow>
      </KpiCard>

      <KpiCard $ok={okAll}>
        <KpiTop>
          <KpiTitle><FiCheckCircle /> Saúde do relatório</KpiTitle>
          <StatusPill $tone={okAll ? "ok" : "warn"}>
            {okAll ? <FiCheckCircle /> : <FiAlertTriangle />}
            {okAll ? "Pronto" : "Pendências"}
          </StatusPill>
        </KpiTop>
        <KpiValue>{okAll ? "OK" : "Revisar"}</KpiValue>
        <KpiHint>{okAll ? "Sem divergências detectadas" : "Corrija os cards com ação"}</KpiHint>
      </KpiCard>
    </Grid>
  );
}