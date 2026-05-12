import React, { useMemo, useState } from "react";
import NavBar from "../Projetos/components/NavBar";
import { Page } from "../Projetos/style";

import {
  Content,
  TitleBarWrap,
  RightRow,
  FiltersRow,
  TinyLabel,
  Field,
  Select,
  DividerRow,
  Chip,
  Muted,
  H1,
  CardGrid,
  KPI,
  KPIValue,
  KPILabel,
  KPIIcon,
  KPIHint,
  KPITrendRow,
  TrendPill,
  ChartCard,
  ChartTitle,
  TableCard,
  Table,
  THead,
  TRow,
  TCell,
  RankingsRow,
  AlertGrid,
  AlertCard,
  AlertTitle,
  AlertValue,
  AlertList,
  AlertItem,
  ProgressWrap,
  ProgressBar,
  ProgressLegend,
  LegendDot,
  SplitRow,
  SplitLeft,
  SplitRight,
} from "./style";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

import {
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

/**
 * ============================================================
 * SIMULADOR — ALTERE AQUI
 * ============================================================
 */
const SIMULACAO_BASE = {
  parcelasDesenvolvimento: 12,
  valorParcelaDesenvolvimento: 21728,

  custoMensalSoftwareAtual: 2000,

  horizonteMeses: 24,

  horasPoupadasPorPessoaPorSemana: 4,
  semanasPorMes: 4.33,

  operacao: {
    pessoas: 30,
    custoHoraPessoa: 18,
  },

  financeiro: {
    pessoas: 4,
    custoHoraPessoa: 28,
  },

  contabil: {
    pessoas: 6,
    custoHoraPessoa: 32,
    pessoasEliminadasOuRealocadas: 1,
    custoMensalPessoaRealocada: 5200,
  },

  perdasFaltasMes: 100000,

  /**
   * Nem sempre dá para assumir que 100% das perdas serão recuperadas.
   * Comecei conservador em 35%.
   */
  percentualRecuperacaoPerdas: 35,

  ganhoMensalDreTempoReal: 3000,

  ganhoMensalConciliacaoBancaria: 2500,

  ganhoMensalComprasFretesManutencao: 4500,
};

const MODULOS = [
  {
    nome: "Financeiro",
    impacto: "Controle de contas, baixa, faturas e visão de recebíveis",
    ganho: "Menos retrabalho e menor risco de baixa errada",
    status: "Crítico",
  },
  {
    nome: "Conciliação bancária",
    impacto: "Layouts bancários, retorno e conferência automática",
    ganho: "Redução de conferência manual",
    status: "Alto",
  },
  {
    nome: "Crossdocking no coletor",
    impacto: "Apontamento direto na operação",
    ganho: "Menos erro operacional e mais rastreabilidade",
    status: "Alto",
  },
  {
    nome: "App motorista",
    impacto: "Eventos, comprovantes e comunicação em tempo real",
    ganho: "Menos ligação, menos perda de informação",
    status: "Alto",
  },
  {
    nome: "App coletor",
    impacto: "Recebimento, separação, conferência e expedição",
    ganho: "Produtividade e trilha operacional",
    status: "Crítico",
  },
  {
    nome: "Indicadores de manutenção",
    impacto: "Controle preventivo e corretivo",
    ganho: "Menos parada e melhor previsibilidade",
    status: "Médio",
  },
  {
    nome: "Compras",
    impacto: "Fluxo de solicitação, aprovação e histórico",
    ganho: "Menos compra emergencial e mais controle",
    status: "Médio",
  },
  {
    nome: "Contábil simples",
    impacto: "DRE, classificação e visão gerencial",
    ganho: "Menos dependência manual",
    status: "Alto",
  },
  {
    nome: "Tabelas de frete dinâmicas",
    impacto: "Regras de cobrança mais consistentes",
    ganho: "Menos perda por cálculo errado",
    status: "Crítico",
  },
];

const COLORS = {
  green: "#22c87a",
  red: "#f5524a",
  blue: "#4d8ef5",
  amber: "#f0a830",
  purple: "#9b74f5",
  cyan: "#22d3ee",
  bg2: "#14171f",
  bg3: "#1c2030",
  border: "rgba(255,255,255,0.07)",
  text: "#f0f2f8",
  text2: "#8b92a8",
  text3: "#555d72",
};

const PIE_COLORS = [
  COLORS.green,
  COLORS.blue,
  COLORS.amber,
  COLORS.purple,
  COLORS.cyan,
  COLORS.red,
];

function formatCurrency(value) {
  const amount = Number(value || 0);

  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })}%`;
}

function getStatusTone(status) {
  if (status === "Crítico") return "danger";
  if (status === "Alto") return "ok";
  if (status === "Médio") return "warn";
  return "info";
}

function buildMonthlyProjection(base) {
  const investimentoTotal =
    Number(base.parcelasDesenvolvimento || 0) *
    Number(base.valorParcelaDesenvolvimento || 0);

  const pessoasOperacao = Number(base.operacao.pessoas || 0);
  const pessoasFinanceiro = Number(base.financeiro.pessoas || 0);
  const pessoasContabil = Number(base.contabil.pessoas || 0);

  const totalPessoasImpactadas =
    pessoasOperacao + pessoasFinanceiro + pessoasContabil;

  const horasPoupadasMes =
    totalPessoasImpactadas *
    Number(base.horasPoupadasPorPessoaPorSemana || 0) *
    Number(base.semanasPorMes || 0);

  const economiaOperacao =
    pessoasOperacao *
    Number(base.horasPoupadasPorPessoaPorSemana || 0) *
    Number(base.semanasPorMes || 0) *
    Number(base.operacao.custoHoraPessoa || 0);

  const economiaFinanceiro =
    pessoasFinanceiro *
    Number(base.horasPoupadasPorPessoaPorSemana || 0) *
    Number(base.semanasPorMes || 0) *
    Number(base.financeiro.custoHoraPessoa || 0);

  const economiaContabilHoras =
    pessoasContabil *
    Number(base.horasPoupadasPorPessoaPorSemana || 0) *
    Number(base.semanasPorMes || 0) *
    Number(base.contabil.custoHoraPessoa || 0);

  const economiaPessoaContabil =
    Number(base.contabil.pessoasEliminadasOuRealocadas || 0) *
    Number(base.contabil.custoMensalPessoaRealocada || 0);

  const recuperacaoPerdas =
    Number(base.perdasFaltasMes || 0) *
    (Number(base.percentualRecuperacaoPerdas || 0) / 100);

  const ganhosExtras =
    Number(base.ganhoMensalDreTempoReal || 0) +
    Number(base.ganhoMensalConciliacaoBancaria || 0) +
    Number(base.ganhoMensalComprasFretesManutencao || 0);

  const ganhoMensalBruto =
    economiaOperacao +
    economiaFinanceiro +
    economiaContabilHoras +
    economiaPessoaContabil +
    recuperacaoPerdas +
    ganhosExtras;

  const custoMensalSoftware = Number(base.custoMensalSoftwareAtual || 0);
  const ganhoMensalLiquido = ganhoMensalBruto - custoMensalSoftware;

  const paybackMeses =
    ganhoMensalLiquido > 0 ? investimentoTotal / ganhoMensalLiquido : 0;

  const projection = [];
  let acumulado = investimentoTotal * -1;

  for (let mes = 1; mes <= Number(base.horizonteMeses || 24); mes += 1) {
    let custoDesenvolvimentoMes = 0;

    if (mes <= Number(base.parcelasDesenvolvimento || 0)) {
      custoDesenvolvimentoMes = Number(base.valorParcelaDesenvolvimento || 0);
    }

    const ganhoLiquidoMes = ganhoMensalBruto - custoMensalSoftware;
    acumulado += ganhoLiquidoMes;

    projection.push({
      mes: `M${mes}`,
      ganhoBruto: Math.round(ganhoMensalBruto),
      custoSoftware: Math.round(custoMensalSoftware),
      parcelaDev: Math.round(custoDesenvolvimentoMes),
      ganhoLiquido: Math.round(ganhoLiquidoMes),
      acumulado: Math.round(acumulado),
    });
  }

  const lucro24Meses =
    ganhoMensalLiquido * Number(base.horizonteMeses || 24) - investimentoTotal;

  const roi =
    investimentoTotal > 0 ? (lucro24Meses / investimentoTotal) * 100 : 0;

  const economiaPorFonte = [
    {
      name: "Operação",
      value: Math.round(economiaOperacao),
    },
    {
      name: "Financeiro",
      value: Math.round(economiaFinanceiro),
    },
    {
      name: "Contábil horas",
      value: Math.round(economiaContabilHoras),
    },
    {
      name: "1 pessoa contábil",
      value: Math.round(economiaPessoaContabil),
    },
    {
      name: "Perdas evitadas",
      value: Math.round(recuperacaoPerdas),
    },
    {
      name: "Ganhos extras",
      value: Math.round(ganhosExtras),
    },
  ];

  return {
    investimentoTotal,
    totalPessoasImpactadas,
    horasPoupadasMes,
    economiaOperacao,
    economiaFinanceiro,
    economiaContabilHoras,
    economiaPessoaContabil,
    recuperacaoPerdas,
    ganhosExtras,
    ganhoMensalBruto,
    custoMensalSoftware,
    ganhoMensalLiquido,
    paybackMeses,
    lucro24Meses,
    roi,
    projection,
    economiaPorFonte,
  };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "#14171f",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "10px 12px",
        color: "#f0f2f8",
        fontSize: 12,
      }}
    >
      <div style={{ color: "#8b92a8", marginBottom: 6 }}>{label}</div>

      {payload.map((item, index) => (
        <div
          key={`${item.name}-${index}`}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{item.name}</span>
          <strong>{formatCurrency(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export default function DashboardInvestimentoSoftware() {
  const [cenario, setCenario] = useState("base");

  const simulacao = useMemo(() => {
    const next = {
      ...SIMULACAO_BASE,
      operacao: { ...SIMULACAO_BASE.operacao },
      financeiro: { ...SIMULACAO_BASE.financeiro },
      contabil: { ...SIMULACAO_BASE.contabil },
    };

    if (cenario === "conservador") {
      next.percentualRecuperacaoPerdas = 20;
      next.horasPoupadasPorPessoaPorSemana = 3;
      next.ganhoMensalDreTempoReal = 1500;
      next.ganhoMensalConciliacaoBancaria = 1500;
      next.ganhoMensalComprasFretesManutencao = 2500;
    }

    if (cenario === "agressivo") {
      next.percentualRecuperacaoPerdas = 50;
      next.horasPoupadasPorPessoaPorSemana = 5;
      next.ganhoMensalDreTempoReal = 5000;
      next.ganhoMensalConciliacaoBancaria = 4000;
      next.ganhoMensalComprasFretesManutencao = 7000;
    }

    return next;
  }, [cenario]);

  const result = useMemo(() => buildMonthlyProjection(simulacao), [simulacao]);

  const paybackPercent = useMemo(() => {
    const raw = result.paybackMeses > 0 ? (12 / result.paybackMeses) * 100 : 0;
    return Math.min(100, Math.max(0, raw));
  }, [result]);

  return (
    <Page>
      <NavBar />

      <Content>
        <TitleBarWrap>
          <div>
            <H1 $accent={COLORS.green}>ROI • Investimento em Software</H1>
            <Muted>
              Projeção de payback, produtividade, perdas evitadas e lucro em{" "}
              <strong>{simulacao.horizonteMeses} meses</strong>.
            </Muted>
          </div>

          <RightRow>
            <FiltersRow>
              <div>
                <TinyLabel>Cenário</TinyLabel>
                <Select
                  value={cenario}
                  onChange={(event) => setCenario(event.target.value)}
                >
                  <option value="conservador">Conservador</option>
                  <option value="base">Base</option>
                  <option value="agressivo">Agressivo</option>
                </Select>
              </div>
            </FiltersRow>
          </RightRow>
        </TitleBarWrap>

        <DividerRow>
          <Chip title="Investimento contratado">
            <FiDollarSign />
            Desenvolvimento:{" "}
            {simulacao.parcelasDesenvolvimento}x{" "}
            {formatCurrency(simulacao.valorParcelaDesenvolvimento)}
          </Chip>

          <Chip title="Custo recorrente atual">
            <FiRefreshCw />
            Mensalidade atual: {formatCurrency(simulacao.custoMensalSoftwareAtual)}
          </Chip>

          <Chip title="Pessoas impactadas diretamente">
            <FiUsers />
            Pessoas impactadas: {result.totalPessoasImpactadas}
          </Chip>

          <Muted>
            Variáveis editáveis no topo do arquivo em{" "}
            <strong>SIMULACAO_BASE</strong>.
          </Muted>
        </DividerRow>

        <CardGrid>
          <KPI>
            <KPIIcon $tone="info">
              <FiCpu />
            </KPIIcon>
            <KPIValue>{formatCurrency(result.investimentoTotal)}</KPIValue>
            <KPILabel>Investimento total</KPILabel>
            <KPIHint>
              {simulacao.parcelasDesenvolvimento} parcelas de{" "}
              {formatCurrency(simulacao.valorParcelaDesenvolvimento)}
            </KPIHint>
          </KPI>

          <KPI>
            <KPIIcon $tone="ok">
              <FiTrendingUp />
            </KPIIcon>
            <KPIValue>{formatCurrency(result.ganhoMensalLiquido)}</KPIValue>
            <KPILabel>Ganho líquido mensal estimado</KPILabel>
            <KPIHint>já descontando mensalidade atual</KPIHint>
          </KPI>

          <KPI>
            <KPIIcon $tone="warn">
              <FiClock />
            </KPIIcon>
            <KPIValue>{result.paybackMeses.toFixed(1)} meses</KPIValue>
            <KPILabel>Payback estimado</KPILabel>
            <KPIHint>tempo para recuperar o investimento</KPIHint>

            <KPITrendRow>
              <TrendPill $tone={result.paybackMeses <= 12 ? "ok" : "warn"}>
                <FiCheckCircle />
                {result.paybackMeses <= 12 ? "recupera em até 1 ano" : "acima de 1 ano"}
              </TrendPill>
            </KPITrendRow>
          </KPI>

          <KPI>
            <KPIIcon $tone="ok">
              <FiBarChart2 />
            </KPIIcon>
            <KPIValue>{formatCurrency(result.lucro24Meses)}</KPIValue>
            <KPILabel>Lucro líquido em 24 meses</KPILabel>
            <KPIHint>ganhos líquidos - investimento</KPIHint>
          </KPI>

          <KPI>
            <KPIIcon $tone="info">
              <FiUsers />
            </KPIIcon>
            <KPIValue>{formatNumber(result.horasPoupadasMes)}h</KPIValue>
            <KPILabel>Horas poupadas por mês</KPILabel>
            <KPIHint>
              {simulacao.horasPoupadasPorPessoaPorSemana}h por pessoa/semana
            </KPIHint>
          </KPI>

          <KPI>
            <KPIIcon $tone="danger">
              <FiShield />
            </KPIIcon>
            <KPIValue>{formatCurrency(result.recuperacaoPerdas)}</KPIValue>
            <KPILabel>Perdas recuperadas/mês</KPILabel>
            <KPIHint>
              {formatPercent(simulacao.percentualRecuperacaoPerdas)} de{" "}
              {formatCurrency(simulacao.perdasFaltasMes)}
            </KPIHint>
          </KPI>

          <KPI>
            <KPIIcon $tone="ok">
              <FiZap />
            </KPIIcon>
            <KPIValue>{formatCurrency(result.economiaPessoaContabil)}</KPIValue>
            <KPILabel>Realocação contábil</KPILabel>
            <KPIHint>
              {simulacao.contabil.pessoasEliminadasOuRealocadas} pessoa(s)
            </KPIHint>
          </KPI>

          <KPI>
            <KPIIcon $tone="info">
              <FiActivity />
            </KPIIcon>
            <KPIValue>{formatPercent(result.roi)}</KPIValue>
            <KPILabel>ROI em 24 meses</KPILabel>
            <KPIHint>retorno sobre investimento</KPIHint>
          </KPI>
        </CardGrid>

        <SplitRow>
          <SplitLeft>
            <ChartCard>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div>
                  <ChartTitle>Evolução acumulada do investimento</ChartTitle>
                  <Muted>
                    Mostra quando o projeto sai do negativo e começa a gerar caixa.
                  </Muted>
                </div>

                <TrendPill $tone={result.lucro24Meses > 0 ? "ok" : "danger"}>
                  <FiTrendingUp />
                  {formatCurrency(result.lucro24Meses)} em 24 meses
                </TrendPill>
              </div>

              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={result.projection}
                    margin={{ top: 12, right: 18, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 11, fill: COLORS.text3 }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: COLORS.text3 }}
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="acumulado"
                      name="Acumulado"
                      stroke={COLORS.blue}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ganhoLiquido"
                      name="Ganho líquido mensal"
                      stroke={COLORS.green}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </SplitLeft>

          <SplitRight>
            <ChartCard>
              <ChartTitle>Payback</ChartTitle>
              <Muted>Quanto mais próximo de 100%, mais rápido recupera.</Muted>

              <div style={{ padding: "20px 0 8px" }}>
                <ProgressWrap>
                  <ProgressBar
                    style={{
                      width: `${paybackPercent}%`,
                      background:
                        result.paybackMeses <= 12
                          ? COLORS.green
                          : result.paybackMeses <= 18
                            ? COLORS.amber
                            : COLORS.red,
                    }}
                  />
                </ProgressWrap>

                <ProgressLegend>
                  <div>
                    <LegendDot style={{ background: COLORS.green }} />
                    <span>Meta: até 12 meses</span>
                  </div>

                  <strong>{result.paybackMeses.toFixed(1)} meses</strong>
                </ProgressLegend>
              </div>

              <AlertGrid style={{ marginTop: 16 }}>
                <AlertCard>
                  <AlertTitle>Ganho bruto mensal</AlertTitle>
                  <AlertValue>{formatCurrency(result.ganhoMensalBruto)}</AlertValue>
                </AlertCard>

                <AlertCard>
                  <AlertTitle>Custo mensal software</AlertTitle>
                  <AlertValue>{formatCurrency(result.custoMensalSoftware)}</AlertValue>
                </AlertCard>
              </AlertGrid>
            </ChartCard>

            <ChartCard style={{ marginTop: 12 }}>
              <ChartTitle>Composição do ganho mensal</ChartTitle>

              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={result.economiaPorFonte}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {result.economiaPorFonte.map((item, index) => (
                        <Cell
                          key={`${item.name}-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </SplitRight>
        </SplitRow>

        <RankingsRow>
          <ChartCard>
            <ChartTitle>Ganhos mensais por fonte</ChartTitle>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={result.economiaPorFonte}
                  margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                  barSize={28}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: COLORS.text3 }}
                    tickMargin={10}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: COLORS.text3 }}
                    tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Ganho mensal"
                    fill={COLORS.green}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <TableCard>
            <ChartTitle>Premissas por setor</ChartTitle>

            <Table>
              <THead>
                <tr>
                  <th>Setor</th>
                  <th>Pessoas</th>
                  <th>Custo/h</th>
                  <th>Economia mensal</th>
                </tr>
              </THead>

              <tbody>
                <TRow>
                  <TCell>Operação</TCell>
                  <TCell>{simulacao.operacao.pessoas}</TCell>
                  <TCell>{formatCurrency(simulacao.operacao.custoHoraPessoa)}</TCell>
                  <TCell>{formatCurrency(result.economiaOperacao)}</TCell>
                </TRow>

                <TRow>
                  <TCell>Financeiro</TCell>
                  <TCell>{simulacao.financeiro.pessoas}</TCell>
                  <TCell>{formatCurrency(simulacao.financeiro.custoHoraPessoa)}</TCell>
                  <TCell>{formatCurrency(result.economiaFinanceiro)}</TCell>
                </TRow>

                <TRow>
                  <TCell>Contábil</TCell>
                  <TCell>{simulacao.contabil.pessoas}</TCell>
                  <TCell>{formatCurrency(simulacao.contabil.custoHoraPessoa)}</TCell>
                  <TCell>{formatCurrency(result.economiaContabilHoras)}</TCell>
                </TRow>

                <TRow>
                  <TCell>Realocação contábil</TCell>
                  <TCell>{simulacao.contabil.pessoasEliminadasOuRealocadas}</TCell>
                  <TCell>-</TCell>
                  <TCell>{formatCurrency(result.economiaPessoaContabil)}</TCell>
                </TRow>
              </tbody>
            </Table>
          </TableCard>
        </RankingsRow>

        <TableCard>
          <ChartTitle>Escopo do desenvolvimento</ChartTitle>

          <Table>
            <THead>
              <tr>
                <th>Módulo</th>
                <th>Impacto</th>
                <th>Ganho esperado</th>
                <th>Prioridade</th>
              </tr>
            </THead>

            <tbody>
              {MODULOS.map((modulo, index) => (
                <TRow key={`${modulo.nome}-${index}`}>
                  <TCell>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <FiFileText />
                      <strong>{modulo.nome}</strong>
                    </div>
                  </TCell>
                  <TCell>{modulo.impacto}</TCell>
                  <TCell>{modulo.ganho}</TCell>
                  <TCell>
                    <TrendPill $tone={getStatusTone(modulo.status)}>
                      {modulo.status === "Crítico" ? <FiAlertTriangle /> : <FiCheckCircle />}
                      {modulo.status}
                    </TrendPill>
                  </TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        </TableCard>

        <AlertGrid>
          <AlertCard>
            <AlertTitle>Leitura sincera</AlertTitle>
            <AlertValue>
              O projeto se paga se o sistema realmente reduzir retrabalho e blindar
              perdas operacionais.
            </AlertValue>

            <AlertList>
              <AlertItem>
                <FiCheckCircle />
                A maior alavanca não é só produtividade: é reduzir perda, erro e falta
                de informação.
              </AlertItem>
              <AlertItem>
                <FiCheckCircle />
                DRE em tempo real reduz dependência manual do contábil e acelera decisão.
              </AlertItem>
              <AlertItem>
                <FiAlertTriangle />
                Se os processos não forem obrigatórios no sistema, o ROI vira chute bonito.
              </AlertItem>
            </AlertList>
          </AlertCard>

          <AlertCard>
            <AlertTitle>Resumo financeiro</AlertTitle>
            <AlertValue>
              {formatCurrency(result.ganhoMensalLiquido)} líquidos/mês
            </AlertValue>

            <AlertList>
              <AlertItem>
                <FiDollarSign />
                Investimento: {formatCurrency(result.investimentoTotal)}
              </AlertItem>
              <AlertItem>
                <FiClock />
                Payback: {result.paybackMeses.toFixed(1)} meses
              </AlertItem>
              <AlertItem>
                <FiTrendingUp />
                Lucro 24 meses: {formatCurrency(result.lucro24Meses)}
              </AlertItem>
            </AlertList>
          </AlertCard>
        </AlertGrid>
      </Content>
    </Page>
  );
}