import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import { FiBarChart2, FiPieChart } from "react-icons/fi";
import {
  Grid,
  WavyCard,
  CardHead,
  CardTitle,
  CardSub,
  Hint,
  CustomTooltipContainer,
  TooltipTitle,
  TooltipRow,
  TooltipLabel,
  TooltipValue,
  TooltipHighlight,
  TableContainer,
  StyledTable,
  TableHeader,
  TableRow,
  TableCell,
  TableCellRight,
  TotalRow,
  ColorDot,
} from "./style";

// Cores modernas para o gráfico de barras - gradiente suave
const barColors = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
];

// Cores para o gráfico de pizza - paleta profissional
const pieColors = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
  "#ec4899",
  "#f97316",
  "#6b7280",
];

function CustomBarTooltip({ active, payload, label, formatBRL }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <CustomTooltipContainer>
      <TooltipTitle>{data.nome || label}</TooltipTitle>
      <TooltipRow>
        <TooltipLabel>Código CFIN:</TooltipLabel>
        <TooltipValue>{data.codigo || label}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Valor total:</TooltipLabel>
        <TooltipValue>{formatBRL(data.value)}</TooltipValue>
      </TooltipRow>
    </CustomTooltipContainer>
  );
}

function CustomPieTooltip({ active, payload, formatBRL }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const total = payload[0]?.payload?.total || 0;
  const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

  return (
    <CustomTooltipContainer>
      <TooltipTitle>{data.name}</TooltipTitle>
      <TooltipRow>
        <TooltipLabel>Valor:</TooltipLabel>
        <TooltipValue>{formatBRL(data.value)}</TooltipValue>
      </TooltipRow>
      <TooltipRow>
        <TooltipLabel>Participação:</TooltipLabel>
        <TooltipValue>{percent}%</TooltipValue>
      </TooltipRow>
    </CustomTooltipContainer>
  );
}

// Componente para a legenda personalizada do gráfico de pizza
const CustomLegend = ({ payload }) => {
  if (!payload || !payload.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "12px 20px",
        marginTop: 16,
        padding: "8px 12px",
        background: "rgba(148, 163, 184, 0.08)",
        borderRadius: 12,
      }}
    >
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--dre-text)",
          }}
          title={`${entry.payload.name} - ${entry.payload.percent}%`}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 4,
              background: entry.color,
            }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DreCharts({ chartByCfin, chartBySetor, formatBRL }) {
  // Processa dados para o gráfico de barras incluindo nome e código
  const barData = useMemo(() => {
    return chartByCfin.map((item, index) => ({
      ...item,
      codigo: item.name,
      nome: item.nome || item.name,
      fill: barColors[index % barColors.length],
    }));
  }, [chartByCfin]);

  // Processa dados para o gráfico de pizza incluindo percentuais
  const pieData = useMemo(() => {
    const total = chartBySetor.reduce((acc, item) => acc + item.value, 0);
    return chartBySetor.map((item, index) => ({
      ...item,
      total,
      percent: ((item.value / total) * 100).toFixed(1),
      fill: pieColors[index % pieColors.length],
    }));
  }, [chartBySetor]);

  // Calcula totais gerais
  const totalGeralCFIN = useMemo(
    () => barData.reduce((acc, item) => acc + item.value, 0),
    [barData],
  );

  const totalGeralSetor = useMemo(
    () => pieData.reduce((acc, item) => acc + item.value, 0),
    [pieData],
  );

  return (
    <Grid>
      {/* Card CFIN com gráfico e tabela */}
      <WavyCard>
        <CardHead>
          <div>
            <CardTitle>
              <FiBarChart2 /> CFIN por valor
            </CardTitle>
            <CardSub>Detalhamento completo por código CFIN</CardSub>
          </div>
          <Hint>Passe o mouse nos blocos</Hint>
        </CardHead>

        <div style={{ width: "100%", height: 280, padding: "4px 8px" }}>
          <ResponsiveContainer>
            <BarChart
              data={barData}
              margin={{ top: 16, right: 12, left: 0, bottom: 16 }}
            >
              <defs>
                {barColors.map((color, index) => (
                  <linearGradient
                    key={`grad-${index}`}
                    id={`barGradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="70%" stopColor={color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                stroke="var(--dre-grid)"
                strokeDasharray="4 8"
                vertical={false}
              />

              <XAxis
                dataKey="nome"
                tick={{
                  fill: "var(--dre-tick)",
                  fontSize: 10,
                  fontWeight: 500,
                }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100} // Aumentei ainda mais para garantir espaço
                tickMargin={10} // Adiciona margem entre o texto e o eixo
                tickFormatter={(value) => {
                  if (value && value.length > 25) {
                    return value.substring(0, 22) + "...";
                  }
                  return value;
                }}
              />

              <YAxis
                tick={{ fill: "var(--dre-tick)", fontSize: 11 }}
                width={64}
                tickFormatter={(value) => formatBRL(value).replace("R$", "")}
              />

              <Tooltip
                content={<CustomBarTooltip formatBRL={formatBRL} />}
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
              />

              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={24}>
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#barGradient-${index % barColors.length})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de CFINs */}
        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <TableHeader>CFIN</TableHeader>
                <TableHeader>Nome</TableHeader>
                <TableHeader style={{ textAlign: "right" }}>Valor</TableHeader>
                <TableHeader style={{ textAlign: "right" }}>%</TableHeader>
              </tr>
            </thead>
            <tbody>
              {barData.map((item, idx) => (
                <TableRow key={`row-${idx}`}>
                  <TableCell>
                    <ColorDot color={barColors[idx % barColors.length]} />
                    {item.codigo}
                  </TableCell>
                  <TableCell>{item.nome}</TableCell>
                  <TableCellRight>{formatBRL(item.value)}</TableCellRight>
                  <TableCellRight>
                    {((item.value / totalGeralCFIN) * 100).toFixed(1)}%
                  </TableCellRight>
                </TableRow>
              ))}
              <TotalRow>
                <TableCell colSpan={2} style={{ fontWeight: 1000 }}>
                  TOTAL GERAL
                </TableCell>
                <TableCellRight style={{ fontWeight: 1000 }}>
                  {formatBRL(totalGeralCFIN)}
                </TableCellRight>
                <TableCellRight style={{ fontWeight: 1000 }}>
                  100%
                </TableCellRight>
              </TotalRow>
            </tbody>
          </StyledTable>
        </TableContainer>
      </WavyCard>

      {/* Card Setor com gráfico e tabela */}
      <WavyCard>
        <CardHead>
          <div>
            <CardTitle>
              <FiPieChart /> Distribuição por setor
            </CardTitle>
            <CardSub>Detalhamento completo por setor</CardSub>
          </div>
          <Hint>Passe o mouse nas fatias</Hint>
        </CardHead>

        <div style={{ width: "100%", height: 280, padding: "8px" }}>
          <ResponsiveContainer>
            <PieChart>
              <Tooltip content={<CustomPieTooltip formatBRL={formatBRL} />} />

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
                labelLine={false}
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={entry.fill}
                    style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de Setores */}
        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <TableHeader>Setor</TableHeader>
                <TableHeader style={{ textAlign: "right" }}>Valor</TableHeader>
                <TableHeader style={{ textAlign: "right" }}>%</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pieData.map((item, idx) => (
                <TableRow key={`row-${idx}`}>
                  <TableCell>
                    <ColorDot color={pieColors[idx % pieColors.length]} />
                    {item.name}
                  </TableCell>
                  <TableCellRight>{formatBRL(item.value)}</TableCellRight>
                  <TableCellRight>
                    {((item.value / totalGeralSetor) * 100).toFixed(1)}%
                  </TableCellRight>
                </TableRow>
              ))}
              <TotalRow>
                <TableCell style={{ fontWeight: 1000 }}>TOTAL GERAL</TableCell>
                <TableCellRight style={{ fontWeight: 1000 }}>
                  {formatBRL(totalGeralSetor)}
                </TableCellRight>
                <TableCellRight style={{ fontWeight: 1000 }}>
                  100%
                </TableCellRight>
              </TotalRow>
            </tbody>
          </StyledTable>
        </TableContainer>
      </WavyCard>
    </Grid>
  );
}
