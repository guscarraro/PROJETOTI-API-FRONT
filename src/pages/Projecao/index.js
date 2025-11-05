import React, { useMemo, useRef } from "react";
import {
  Page,
  ExportArea,
  TopBar,
  DownloadButton,
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
} from "./style";

import { toPng } from "html-to-image";

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

const data = [
  { ano: "2020", faturamento: 41351555.35, resultado: 1480120.2 },
  { ano: "2021", faturamento: 48782916.29, resultado: 8991995.43 },
  { ano: "2022", faturamento: 63583265.49, resultado: 7620132.68 },
  { ano: "2023", faturamento: 80923869.8, resultado: 13252701.09 },
  { ano: "2024", faturamento: 99730537.83, resultado: 18698048.07 },
  { ano: "2025", faturamento: 124004780.67, resultado: 23617574.56 },
];

const realizadoAteSet2025 = 88086454.14;
const resultadoAteSet2025 = 16776678.99;
const orcadoAteSet = 80540679.0;
const acimaOrcadoPct = 9.37;
const margemPct = 19.05;

export default function EvolucaoFinanceira() {
  // calcula evolução (sem reduce)
  const evolucao = useMemo(() => {
    const out = [];
    for (let i = 0; i < data.length; i++) {
      const curr = data[i];
      const prev = i > 0 ? data[i - 1] : null;
      let deltaFat = null;
      let deltaRes = null;

      if (prev) {
        if (prev.faturamento !== 0) {
          deltaFat =
            ((curr.faturamento - prev.faturamento) / prev.faturamento) * 100;
        }
        if (prev.resultado !== 0) {
          deltaRes =
            ((curr.resultado - prev.resultado) / prev.resultado) * 100;
        }
      }

      out.push({ ...curr, deltaFat, deltaRes });
    }
    return out;
  }, []);

  const exportRef = useRef(null);

  const handleDownload = async () => {
    const node = exportRef.current;
    if (!node) return;

    const dataUrl = await toPng(node, {
      backgroundColor: "transparent",
      pixelRatio: 2, // mais nítido
      skipFonts: false,
      cacheBust: true,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "evolucao-financeira.png";
    a.click();
  };

  return (
    <Page>
      <TopBar>
        <DownloadButton onClick={handleDownload}>Baixar PNG</DownloadButton>
      </TopBar>

      {/* SOMENTE o que está dentro de ExportArea vai para a imagem */}
      <ExportArea ref={exportRef}>
        <HeaderRow>
          <MetricGroup>
            <Metric>
              <MetricTitle>FATURAMENTO ORÇADO ATÉ SETEMBRO 2025</MetricTitle>
              <MetricValue>{formatCurrency(orcadoAteSet)}</MetricValue>
            </Metric>
          </MetricGroup>

          <MetricGroup>
            <Metric>
              <MetricTitle>FATURAMENTO REALIZADO ATÉ SETEMBRO 2025</MetricTitle>
              <MetricValue>{formatCurrency(realizadoAteSet2025)}</MetricValue>
              <MetricCaption>{acimaOrcadoPct}% acima do orçado</MetricCaption>
            </Metric>
            <Metric>
              <MetricTitle>RESULTADO REALIZADO 2025</MetricTitle>
              <MetricValue>{formatCurrency(resultadoAteSet2025)}</MetricValue>
              <MetricCaption>margem {margemPct}%</MetricCaption>
            </Metric>
          </MetricGroup>
        </HeaderRow>

        <YearGrid>
          {evolucao.map((y) => (
            <YearCard key={y.ano}>
              <YearTitle>{y.ano}</YearTitle>

              <YearRow>
                <span>Faturamento</span>
                <strong>{formatCurrency(y.faturamento)}</strong>
              </YearRow>
              {y.deltaFat !== null && (
                <DeltaBadge $pos={y.deltaFat >= 0}>
                  {y.deltaFat >= 0 ? "▲" : "▼"} {formatPct(y.deltaFat)}
                </DeltaBadge>
              )}

              <YearRow style={{ marginTop: 10 }}>
                <span>Resultado</span>
                <strong>{formatCurrency(y.resultado)}</strong>
              </YearRow>
              {y.deltaRes !== null && (
                <DeltaBadge $pos={y.deltaRes >= 0}>
                  {y.deltaRes >= 0 ? "▲" : "▼"} {formatPct(y.deltaRes)}
                </DeltaBadge>
              )}
            </YearCard>
          ))}
        </YearGrid>

        <ChartCard>
          <ChartTitle>Evolução Financeira (2020–2025)</ChartTitle>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 24, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
              <XAxis dataKey="ano" />
              <YAxis
                tickFormatter={(v) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(v)
                }
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), ""]}
                labelStyle={{ fontWeight: 700 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="faturamento"
                name="FATURAMENTO"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="resultado"
                name="RESULTADO"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <Footnote>
          *Os valores de 2025 foram baseados no planejamento orçamentário do
          exercício. Até setembro, o resultado está alinhado com o orçamento, e
          o faturamento está {acimaOrcadoPct}% acima do estimado.
        </Footnote>
      </ExportArea>
    </Page>
  );
}
