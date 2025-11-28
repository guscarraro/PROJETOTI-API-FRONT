import React, { useMemo } from "react";
import {
  Page,
  ExportArea,
  HeaderRow,
  MetricGroup,
  Metric,
  MetricTitle,
  MetricValue,
  MetricCaption,
  ChartCard,
  ChartTitle,
  Footnote,
  YearGrid,
  YearCard,
  YearTitle,
  YearRow,
  DeltaBadge,
  PageTitle,
  SectionTitle,
  SectionSubtitle,
  TwoColumns,
  Block,
  BlockTitle,
  BlockTagRow,
  BlockTag,
  BlockList,
  BlockItem,
} from "./style";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const formatCurrency = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(v);

const formatPct = (v) =>
  `${v >= 0 ? "+" : ""}${v.toFixed(2).replace(".", ",")}%`;

// >>> Premissas bem explícitas (ajustáveis depois) <<<
// Sistema interno: Navex + módulos próprios
const CUSTO_INTERNO_MENSAL_INFRA = 1500; // servidor + suporte
const MELHORIAS_ANO_QTD = 3; // ~3 melhorias relevantes/ano
const CUSTO_POR_MELHORIA = 18000;

// Sistema terceiro (TMS/WMS/ERP novo) – permanece para CROSS/WMS
const CUSTO_TERCEIRO_MENSAL = 33000; // plano mensal
const CUSTO_PERS_TERCEIRO_ANO = 15000; // personalização / ano (3x no ano)
const REAJUSTE_LICENCA_ANUAL = 0.1; // 10% de reajuste em 2027

export default function PlanejamentoEstrategicoSistemico() {
  const {
    custoInternoAno1,
    custoInternoAno2,
    custoTerceiroAno1,
    custoTerceiroAcum2Anos,
    projecoes,
    custoTotalAno1,
    custoTotal2Anos,
    shareTerceiroAno1,
    shareTerceiro2Anos,
    diffEmReaisAno1,
  } = useMemo(() => {
    // Interno: Navex + melhorias
    const custoInternoAnoBase =
      CUSTO_INTERNO_MENSAL_INFRA * 12 +
      MELHORIAS_ANO_QTD * CUSTO_POR_MELHORIA;

    const custoInternoAno1 = custoInternoAnoBase;
    const custoInternoAno2 = custoInternoAnoBase * 2;

    // Terceiro: sempre ativo para CROSS/WMS
    const custoTerceiroAno1 =
      CUSTO_TERCEIRO_MENSAL * 12 + CUSTO_PERS_TERCEIRO_ANO;

    const custoTerceiroAno2 =
      CUSTO_TERCEIRO_MENSAL * (1 + REAJUSTE_LICENCA_ANUAL) * 12 +
      CUSTO_PERS_TERCEIRO_ANO;

    const custoTerceiroAcum2Anos = custoTerceiroAno1 + custoTerceiroAno2;

    // Custo total combinado (interno + terceiro)
    const custoTotalAno1 = custoInternoAno1 + custoTerceiroAno1;
    const custoTotal2Anos = custoInternoAno2 + custoTerceiroAcum2Anos;

    // Exposição ao sistema terceiro
    const shareTerceiroAno1 = (custoTerceiroAno1 / custoTotalAno1) * 100;
    const shareTerceiro2Anos =
      (custoTerceiroAcum2Anos / custoTotal2Anos) * 100;

    // Diferença em 2026 (1 ano): quanto o terceiro representa a mais que o Navex
    const diffEmReaisAno1 = Math.abs(custoTerceiroAno1 - custoInternoAno1);

    const projecoes = [
      {
        horizonte: "1 ano (2026)",
        interno: custoInternoAno1,
        terceiro: custoTerceiroAno1,
      },
      {
        horizonte: "2 anos (2026–2027)",
        interno: custoInternoAno2,
        terceiro: custoTerceiroAcum2Anos,
      },
    ];

    return {
      custoInternoAno1,
      custoInternoAno2,
      custoTerceiroAno1,
      custoTerceiroAcum2Anos,
      projecoes,
      custoTotalAno1,
      custoTotal2Anos,
      shareTerceiroAno1,
      shareTerceiro2Anos,
      diffEmReaisAno1,
    };
  }, []);

  // Gráfico com custo ACUMULADO mês a mês em 24 meses (coexistência dos dois)
  const chartData = useMemo(() => {
    const meses26 = [
      "Jan/26",
      "Fev/26",
      "Mar/26",
      "Abr/26",
      "Mai/26",
      "Jun/26",
      "Jul/26",
      "Ago/26",
      "Set/26",
      "Out/26",
      "Nov/26",
      "Dez/26",
    ];
    const meses27 = [
      "Jan/27",
      "Fev/27",
      "Mar/27",
      "Abr/27",
      "Mai/27",
      "Jun/27",
      "Jul/27",
      "Ago/27",
      "Set/27",
      "Out/27",
      "Nov/27",
      "Dez/27",
    ];
    const labels = [...meses26, ...meses27];

    // rateio para bater com o total anual do interno
    const extraInternoMensal =
      (MELHORIAS_ANO_QTD * CUSTO_POR_MELHORIA) / 12; // 3 melhorias/ano rateadas
    const extraTerceiroMensal = CUSTO_PERS_TERCEIRO_ANO / 12; // 15k/ano rateado

    const mensalInterno = CUSTO_INTERNO_MENSAL_INFRA + extraInternoMensal;

    const out = [];
    let acumInterno = 0;
    let acumTerceiro = 0;

    for (let i = 0; i < labels.length; i++) {
      const anoIndex = i < 12 ? 0 : 1; // 0 = 2026, 1 = 2027

      const licencaBase =
        anoIndex === 0
          ? CUSTO_TERCEIRO_MENSAL
          : CUSTO_TERCEIRO_MENSAL * (1 + REAJUSTE_LICENCA_ANUAL);

      const mensalTerceiro = licencaBase + extraTerceiroMensal;

      acumInterno += mensalInterno;
      acumTerceiro += mensalTerceiro;

      out.push({
        mes: labels[i],
        custoInternoAcum: acumInterno,
        custoTerceiroAcum: acumTerceiro,
      });
    }

    return out;
  }, []);

  const deltaCustoTerceiroPct =
    ((custoTerceiroAcum2Anos - custoTerceiroAno1) / custoTerceiroAno1) * 100;

  return (
    <Page>
      <ExportArea>
        <PageTitle>Planejamento Estratégico Sistêmico</PageTitle>
        <SectionSubtitle>
          Comparativo de custos e riscos considerando a coexistência do{" "}
          <strong>sistema interno (Navex + frota + módulos próprios)</strong> e
          do <strong>TMS/WMS/ERP de terceiro</strong> (mantido para CROSS e
          armazenagem), mostrando o peso do sistema terceiro e o potencial de
          investimento de longo prazo no interno.
        </SectionSubtitle>

        {/* MÉTRICAS RESUMO */}
        <HeaderRow>
          <MetricGroup>
            <Metric>
              <MetricTitle>
                CUSTO ANUAL SISTEMA INTERNO – CENÁRIO BASE 2026
              </MetricTitle>
              <MetricValue>{formatCurrency(custoInternoAno1)}</MetricValue>
              <MetricCaption>
                Infra + suporte ({formatCurrency(CUSTO_INTERNO_MENSAL_INFRA)}
                /mês) + {MELHORIAS_ANO_QTD} melhorias/ano de{" "}
                {formatCurrency(CUSTO_POR_MELHORIA)} cada (Navex e módulos
                próprios).
              </MetricCaption>
            </Metric>
          </MetricGroup>

          <MetricGroup>
            <Metric>
              <MetricTitle>
                CUSTO ANUAL SISTEMA TERCEIRO – 2026 (CROSS/WMS)
              </MetricTitle>
              <MetricValue>{formatCurrency(custoTerceiroAno1)}</MetricValue>
              <MetricCaption>
                {formatCurrency(CUSTO_TERCEIRO_MENSAL)}/mês + personalização
                anual estimada de {formatCurrency(CUSTO_PERS_TERCEIRO_ANO)}.
              </MetricCaption>
            </Metric>

            <Metric>
              <MetricTitle>
                EXPOSIÇÃO AO SISTEMA TERCEIRO – 2026 (TOTAL SISTEMAS)
              </MetricTitle>
              <MetricValue>
                {formatPct(shareTerceiroAno1).replace("+", "")}
              </MetricValue>
              <MetricCaption>
                Em 2026, o sistema terceiro recebe{" "}
                {formatCurrency(diffEmReaisAno1)} a mais do que o Navex no
                orçamento de sistemas.
              </MetricCaption>
            </Metric>
          </MetricGroup>
        </HeaderRow>

        {/* PROJEÇÃO POR HORIZONTE */}
        <SectionTitle>
          Projeção de custos combinados – 1 e 2 anos (interno + terceiro)
        </SectionTitle>

        <YearGrid>
          {projecoes.map((p, idx) => {
            const isSecond = idx === 1;
            const total = isSecond ? custoTotal2Anos : custoTotalAno1;
            const shareTerceiro = isSecond
              ? shareTerceiro2Anos
              : shareTerceiroAno1;

            return (
              <YearCard key={p.horizonte}>
                <YearTitle>{p.horizonte}</YearTitle>

                <YearRow>
                  <span>Sistema interno (Navex + melhorias)</span>
                  <strong>{formatCurrency(p.interno)}</strong>
                </YearRow>

                <YearRow>
                  <span>Sistema terceiro (TMS/WMS/ERP – CROSS/WMS)</span>
                  <strong>{formatCurrency(p.terceiro)}</strong>
                </YearRow>

                <YearRow>
                  <span>Custo total combinado</span>
                  <strong>{formatCurrency(total)}</strong>
                </YearRow>

                <DeltaBadge $pos={shareTerceiro < 70}>
                  Sistema terceiro:{" "}
                  {formatPct(shareTerceiro).replace("+", "")} do custo total
                  neste horizonte
                </DeltaBadge>

                {isSecond && (
                  <DeltaBadge $pos={deltaCustoTerceiroPct <= 0}>
                    {deltaCustoTerceiroPct >= 0 ? "▲" : "▼"}{" "}
                    {formatPct(deltaCustoTerceiroPct)} de aumento no custo
                    acumulado do terceiro entre 1 e 2 anos (reajuste +{" "}
                    personalização)
                  </DeltaBadge>
                )}
              </YearCard>
            );
          })}
        </YearGrid>

        {/* GRÁFICO – CUSTO ACUMULADO MÊS A MÊS EM 24 MESES */}
        <ChartCard>
          <ChartTitle>
            Trajetória acumulada de custos – 24 meses (Navex x terceiro, 2026–
            2027, com reajuste de 10% em 2027)
          </ChartTitle>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 24, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
              <XAxis dataKey="mes" />
              <YAxis
                tickFormatter={(v) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(v)
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value),
                  name === "custoInternoAcum"
                    ? "Acumulado – Navex (interno)"
                    : "Acumulado – sistema terceiro (CROSS/WMS)",
                ]}
                labelStyle={{ fontWeight: 700 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="custoInternoAcum"
                name="Acumulado – Navex (interno)"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="custoTerceiroAcum"
                name="Acumulado – sistema terceiro"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PRÓS, RISCOS E ESTRATÉGIA */}
        <SectionTitle>
          Prós, riscos e lógica da estratégia híbrida (interno + terceiro)
        </SectionTitle>
        <TwoColumns>
          <Block>
            <BlockTagRow>
              <BlockTag $variant="terceiro">Sistema terceiro</BlockTag>
              <BlockTag $variant="alerta">Atenção: lock-in</BlockTag>
            </BlockTagRow>
            <BlockTitle>
              TMS/WMS/ERP externo como pilar de CROSS e armazenagem
            </BlockTitle>

            <BlockList>
              <BlockItem>
                <strong>Prós:</strong> módulos maduros de WMS, TMS e rotinas de
                armazenagem, menos esforço de desenvolvimento em funcionalidades
                “commodity”.
              </BlockItem>
              <BlockItem>
                <strong>Governança tributária:</strong> tende a acompanhar
                reforma, mas o ritmo de adequação (CT-e, MDF-e, regras novas)
                fica na mão do fornecedor.
              </BlockItem>
              <BlockItem>
                <strong>Risco de dependência:</strong> a parcela do custo total
                que vai para o sistema terceiro tende a crescer com reajustes
                anuais. O gráfico mostra isso com clareza ao longo de 24 meses.
              </BlockItem>
              <BlockItem>
                <strong>Lock-in tecnológico:</strong> quanto mais processos
                críticos estiverem só lá dentro, mais difícil e caro fica
                reduzir o uso ou migrar algo no futuro.
              </BlockItem>
              <BlockItem>
                <strong>Customizações pontuais:</strong> ajustes específicos
                para CROSS/WMS fazem sentido, mas tudo que é gestão de frota,
                DRE por veículo, torre de controle no seu formato tende a ser
                caro e lento aqui.
              </BlockItem>
            </BlockList>
          </Block>

          <Block>
            <BlockTagRow>
              <BlockTag $variant="interno">Sistema interno</BlockTag>
              <BlockTag $variant="investimento">Investimento de longo prazo</BlockTag>
            </BlockTagRow>
            <BlockTitle>
              Navex como centro de talvez frota, financeiro e automação própria
            </BlockTitle>

            <BlockList>
              <BlockItem>
                <strong>Visão correta:</strong> não é “economizar trocando” o
                terceiro, e sim <strong>diluir o risco</strong> e{" "}
                <strong>ganhar autonomia</strong> mantendo o CROSS/WMS no
                terceiro e puxando para o interno o que é mais crítico para
                resultado (frota, DRE, automações).
              </BlockItem>
              <BlockItem>
                <strong>DRE por veículo/rota:</strong> ter o financeiro da
                frota e um motor de custos dentro do Navex permite enxergar
                margem por veículo, rota, operação, de um jeito que dificilmente
                um sistema genérico vai entregar sob medida.
              </BlockItem>
              <BlockItem>
                <strong>Reforma tributária 2026:</strong> você vai precisar de
                consultoria de qualquer forma. Ajustar o interno com essa
                consultoria + bater emissões com testes automatizados dá muito
                mais controle para futuras mudanças.
              </BlockItem>
              <BlockItem>
                <strong>Automação e auditoria:</strong> dá para colocar
                auditorias automáticas de rotas, permanência, custos,
                manutenção, e uma torre de controle no formato que a operação
                precisa – sem depender de fila de projeto do fornecedor.
              </BlockItem>
              <BlockItem>
                <strong>Riscos:</strong> disciplina de backlog, qualidade de
                código, testes e governança de deploy. Se isso não for bem
                cuidado, o potencial vira dívida técnica.
              </BlockItem>
              <BlockItem>
                <strong>Defesa contra lock-in:</strong> com o Navex forte, se o
                terceiro ficar caro demais ou mudar as regras, você tem opção de
                reduzir módulos e renegociar com muito mais força.
              </BlockItem>
            </BlockList>
          </Block>
        </TwoColumns>

        {/* ESTRATÉGIA HÍBRIDA (OPINIÃO BEM FRANCA) */}
        {/* <SectionTitle>Resumo executivo</SectionTitle>
        <Block>
          <BlockList>
            <BlockItem>
              <strong>1. Não vender como “economia imediata”.</strong> Os dois
              sistemas vão coexistir; o objetivo é mudar a composição do custo:
              menos dependência do sistema terceiro, mais investimento em um
              ativo próprio (Navex).
            </BlockItem>
            <BlockItem>
              <strong>
                2. Posicionar o Navex como investimento estratégico de longo
                prazo.
              </strong>{" "}
              Cada módulo novo (financeiro, DRE por veículo, auditorias, torre
              de controle) aumenta eficiência e reduz risco de ficar refém do
              terceiro.
            </BlockItem>
            <BlockItem>
              <strong>
                3. Deixar claro que o terceiro continua sendo importante.
              </strong>{" "}
              Ele segue como pilar de CROSS/WMS; a proposta é não empurrar tudo
              pra lá de forma acrítica, e sim equilibrar onde faz mais sentido
              cada coisa.
            </BlockItem>
            <BlockItem>
              <strong>4. Mostrar o gráfico de 24 meses.</strong> Ele deixa
              visual que a curva do terceiro sempre cresce, enquanto o
              investimento interno é relativamente pequeno perto do benefício
              estratégico (autonomia, customização, visibilidade de margem).
            </BlockItem>
            <BlockItem>
              <strong>
                5. Reforçar que 2026 é o ano de montar base: tributário + testes
                + automação.
              </strong>{" "}
              Com isso bem feito, os anos seguintes colhem o resultado em
              eficiência e poder de negociação com qualquer fornecedor.
            </BlockItem>
            <BlockItem>
              <strong>Em resumo:</strong> o discurso mais honesto não é “vamos
              economizar trocando sistema”, e sim{" "}
              <strong>
                “vamos continuar usando o terceiro onde ele é forte, mas
                investir no nosso sistema para não depender dele em tudo”
              </strong>
              . A planilha e o gráfico aqui servem para mostrar o tamanho desse
              risco e justificar por que faz sentido colocar dinheiro no Navex.
            </BlockItem>
          </BlockList>
        </Block>

        <Footnote>
          *Os valores são cenários aproximados para discussão estratégica
          (premissas detalhadas no código). O ponto central não é cortar o
          sistema terceiro, e sim equilibrar custo x autonomia, mantendo CROSS e
          WMS nele e fortalecendo o Navex como ativo interno de longo prazo.
        </Footnote> */}
      </ExportArea>
    </Page>
  );
}
