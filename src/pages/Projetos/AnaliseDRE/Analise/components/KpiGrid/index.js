import React from "react";
import { FiAlertTriangle, FiDollarSign, FiCopy, FiLayers, FiList } from "react-icons/fi";
import { Grid, KpiCard, KpiTitle, KpiValue, KpiHint, KpiBtnRow, KpiBtn } from "./style";

export default function KpiGrid({ kpis, onOpen, loading }) {
  const base = kpis || {
    total_linhas: 0,
    total_valor: 0,
    cfin_divergente: 0,
    valor_divergente: 0,
    duplicados: 0,
    sem_setor: 0,
  };

  return (
    <Grid>
      <KpiCard>
        <KpiTitle><FiList /> Total de linhas</KpiTitle>
        <KpiValue>{base.total_linhas}</KpiValue>
        <KpiHint>Total importado</KpiHint>
      </KpiCard>

      <KpiCard>
        <KpiTitle><FiLayers /> Total valor (doc)</KpiTitle>
        <KpiValue>
          R$ {Number(base.total_valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </KpiValue>
        <KpiHint>Soma por valor_doc</KpiHint>
      </KpiCard>

      <KpiCard $warn={Number(base.cfin_divergente) > 0}>
        <KpiTitle><FiAlertTriangle /> CFIn divergente</KpiTitle>
        <KpiValue>{base.cfin_divergente}</KpiValue>
        <KpiBtnRow>
          <KpiBtn disabled={loading || !base.cfin_divergente} onClick={() => onOpen("cfin")}>
            Ver itens
          </KpiBtn>
        </KpiBtnRow>
      </KpiCard>

      <KpiCard $warn={Number(base.valor_divergente) > 0}>
        <KpiTitle><FiDollarSign /> Valor divergente</KpiTitle>
        <KpiValue>{base.valor_divergente}</KpiValue>
        <KpiBtnRow>
          <KpiBtn disabled={loading || !base.valor_divergente} onClick={() => onOpen("valor")}>
            Justificar
          </KpiBtn>
        </KpiBtnRow>
      </KpiCard>

      <KpiCard $warn={Number(base.duplicados) > 0}>
        <KpiTitle><FiCopy /> Duplicados</KpiTitle>
        <KpiValue>{base.duplicados}</KpiValue>
        <KpiBtnRow>
          <KpiBtn disabled={loading || !base.duplicados} onClick={() => onOpen("duplicado")}>
            Ver
          </KpiBtn>
        </KpiBtnRow>
      </KpiCard>

      <KpiCard $warn={Number(base.sem_setor) > 0}>
        <KpiTitle><FiAlertTriangle /> Sem setor</KpiTitle>
        <KpiValue>{base.sem_setor}</KpiValue>
        <KpiBtnRow>
          <KpiBtn disabled={loading || !base.sem_setor} onClick={() => onOpen("sem_setor")}>
            Corrigir
          </KpiBtn>
        </KpiBtnRow>
      </KpiCard>
    </Grid>
  );
}