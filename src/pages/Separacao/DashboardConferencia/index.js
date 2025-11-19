import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../../Projetos/components/NavBar";
import { Page, H1 } from "../../Projetos/style";
import useLoading from "../../../hooks/useLoading";
import apiLocal from "../../../services/apiLocal";
import {
  Content,
  TitleBarWrap,
  RightRow,
  FiltersRow,
  TinyLabel,
  Field,
  Select,
  CardGrid,
  KPI,
  KPIValue,
  KPILabel,
  ChartCard,
  ChartTitle,
  TableCard,
  Table,
  THead,
  TRow,
  TCell,
  LeadTimeGrid,
  LeadTimeItem,
  RankingsRow,
} from "./style";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Bar,
  BarChart,
} from "recharts";

/* Cores para pizza (um pouco mais vivas, mas sem virar carnaval) */
const PIE_COLORS = [
  "#22d3ee", // cyan
  "#a3e635", // lime
  "#f97316", // orange
  "#fb7185", // rose
  "#38bdf8", // sky
  "#c4b5fd", // violet
  "#facc15", // amber
  "#f472b6", // pink
];

/* Cores das 3 barras (leve vibe neon/dark) */
const LINE_COLORS = {
  pedidos: "#22d3ee", // cyan
  conferencias: "#a3e635", // lime
  expedicoes: "#f97316", // orange
};

// pega primeiro e último dia do mês atual em YYYY-MM-DD

export default function DashboardConferencia() {
  const loading = useLoading();
  const [loadingDash, setLoadingDash] = useState(false);

  // filtros
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11

  const monthStartISO = new Date(year, month, 1).toISOString().slice(0, 10);
  const monthEndISO = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  const [integrante, setIntegrante] = useState("");
  const [role, setRole] = useState("any"); // any|separador|conferente
  const [start, setStart] = useState(monthStartISO);
  const [end, setEnd] = useState(monthEndISO);

  // dados gerais
  const [summary, setSummary] = useState(null);
  const [sepRank, setSepRank] = useState([]);
  const [confRank, setConfRank] = useState([]);
  const [tops, setTops] = useState([]);
  const [leads, setLeads] = useState({});

  // série diária com 3 métricas (do back, já pronta)
  const [dailySeries, setDailySeries] = useState([]);

  // carga principal
  async function loadAll() {
    setLoadingDash(true);
    loading.start("dash");
    try {
      const params = {
        ...(start ? { start } : {}),
        ...(end ? { end } : {}),
        ...(integrante ? { integrante } : {}),
        role,
      };

      const resp = await apiLocal.dashboardOverview(params);
      const data = resp?.data || {};

      setSummary(data.summary || null);
      setSepRank(
        Array.isArray(data.ranking_separadores) ? data.ranking_separadores : []
      );
      setConfRank(
        Array.isArray(data.ranking_conferentes) ? data.ranking_conferentes : []
      );
      setTops(
        Array.isArray(data.top_transportadoras) ? data.top_transportadoras : []
      );
      setLeads(data.lead_times || {});
      setDailySeries(Array.isArray(data.daily_series) ? data.daily_series : []);
    } finally {
      loading.stop("dash");
      setLoadingDash(false);
    }
  }

  // carrega inicial só 1 vez
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // adapta o formato da série diária para o BarChart
  const lineData = useMemo(() => {
    if (!dailySeries) return [];
    const out = [];
    for (let i = 0; i < dailySeries.length; i++) {
      const d = dailySeries[i] || {};
      out.push({
        name: d.date, // YYYY-MM-DD
        pedidosCriados: d.pedidos_criados ?? 0,
        conferencias: d.conferencias ?? 0,
        expedicoes: d.expedicoes ?? 0,
      });
    }
    return out;
  }, [dailySeries]);

  const pieData = useMemo(() => {
    const out = [];
    for (let i = 0; i < tops.length; i++) {
      const t = tops[i];
      out.push({
        name: t.transportador || "-",
        value: Number(t.pedidos_expedidos || 0),
      });
    }
    return out;
  }, [tops]);

  function formatSecs(s) {
    if (s == null) return "-";
    const total = Math.floor(Number(s));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  }

  // formata eixo X: de "YYYY-MM-DD" -> "DD/MM"
  function formatXAxisDate(value) {
    if (!value) return "";
    const parts = String(value).split("-");
    if (parts.length !== 3) return value;
    const [, month, day] = parts;
    return `${day}/${month}`;
  }

  return (
    <Page>
      <NavBar />
      <Content>
        <TitleBarWrap>
          <H1 $accent="#22d3ee">Dashboard • Conferência &amp; Expedição</H1>

          <RightRow>
            <FiltersRow>
              {/* <div>
                <TinyLabel>Integrante</TinyLabel>
                <Field
                  placeholder="Nome do separador/conferente..."
                  value={integrante}
                  onChange={(e) => setIntegrante(e.target.value)}
                />
              </div>

              <div>
                <TinyLabel>Função</TinyLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="any">Qualquer</option>
                  <option value="separador">Separador</option>
                  <option value="conferente">Conferente</option>
                </Select>
              </div> */}

              <div>
                <TinyLabel>Início</TinyLabel>
                <Field
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>

              <div>
                <TinyLabel>Fim</TinyLabel>
                <Field
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>

              {/* Botão de buscar para evitar loop de requisições */}
              <div style={{ alignSelf: "flex-end" }}>
                <button
                  type="button"
                  onClick={loadAll}
                  disabled={loadingDash}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "none",
                    background: "#22d3ee",
                    color: "#0b1120",
                    fontWeight: 600,
                    cursor: loadingDash ? "default" : "pointer",
                    opacity: loadingDash ? 0.6 : 1,
                    marginLeft: 8,
                  }}
                >
                  {loadingDash ? "Carregando..." : "Buscar"}
                </button>
              </div>
            </FiltersRow>
          </RightRow>
        </TitleBarWrap>

        {/* overlay simples de carregamento */}
        {loadingDash && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderRadius: 999,
                background: "#020617",
                color: "#e5e7eb",
                fontWeight: 600,
                boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
              }}
            >
              Atualizando dashboard...
            </div>
          </div>
        )}

        {/* KPIs */}
        <CardGrid>
          <KPI>
            <KPIValue>{summary?.total_pedidos ?? 0}</KPIValue>
            <KPILabel>Total de Pedidos (janela)</KPILabel>
          </KPI>
          <KPI>
            <KPIValue>{summary?.aguardando_conferencia ?? 0}</KPIValue>
            <KPILabel>Aguardando Conferência</KPILabel>
          </KPI>
          <KPI>
            <KPIValue>{summary?.pronto_para_expedir ?? 0}</KPIValue>
            <KPILabel>Pronto p/ Expedir</KPILabel>
          </KPI>
          <KPI>
            <KPIValue>{summary?.expedido ?? 0}</KPIValue>
            <KPILabel>Expedido (status)</KPILabel>
          </KPI>

          {/* novos contadores do período */}

          <KPI>
            <KPIValue>{summary?.conferencias_periodo ?? 0}</KPIValue>
            <KPILabel>Conferências no Período</KPILabel>
          </KPI>
        </CardGrid>

        {/* Gráfico diário em colunas com 3 séries */}
        <ChartCard>
          <ChartTitle>Pedidos / Conferências / Expedições por dia</ChartTitle>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart
                data={lineData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                barCategoryGap={8} // menos espaço entre dias
                barGap={2} // menos espaço entre as 3 barras
                barSize={16} // <<< AQUI deixa cada barra mais larga
              >
                {/* Sem grid pra ficar mais clean no dark mode */}
                <XAxis
                  dataKey="name"
                  tickFormatter={formatXAxisDate}
                  tick={{
                    fontSize: 10,
                    fill: "grey",
                  }}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 10,
                    fill: "#9ca3af",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #1f2937",
                    borderRadius: 8,
                    color: "#e5e7eb",
                    fontSize: 12,
                  }}
                />

                <Bar
                  dataKey="pedidosCriados"
                  name="Pedidos criados"
                  fill={LINE_COLORS.pedidos}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="conferencias"
                  name="Conferências"
                  fill={LINE_COLORS.conferencias}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expedicoes"
                  name="Expedições"
                  fill={LINE_COLORS.expedicoes}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Rankings lado a lado */}
        <RankingsRow>
          <TableCard>
            <ChartTitle>🏆 Ranking — Separadores (Top 10)</ChartTitle>
            <Table>
              <THead>
                <tr>
                  <th>Separador</th>
                  <th>Pedidos</th>
                  <th>Peso total (kg)</th>
                  <th>Volume total</th>
                </tr>
              </THead>
              <tbody>
                {sepRank.map((r, idx) => (
                  <TRow key={`${r.separador}-${idx}`}>
                    <TCell>{r.separador || "-"}</TCell>
                    <TCell>{r.pedidos || 0}</TCell>
                    <TCell>{(r.peso_total ?? 0).toFixed(2)}</TCell>
                    <TCell>{(r.volume_total ?? 0).toFixed(2)}</TCell>
                  </TRow>
                ))}
                {sepRank.length === 0 && (
                  <tr>
                    <TCell colSpan={4} style={{ opacity: 0.7 }}>
                      Sem dados no período.
                    </TCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableCard>

          <TableCard>
            <ChartTitle>🏆 Ranking — Conferentes (Top 10)</ChartTitle>
            <Table>
              <THead>
                <tr>
                  <th>Conferente</th>
                  <th>Conferências</th>
                  <th>Pedidos</th>
                  <th>Tempo médio</th>
                  <th>Peso total (kg)</th>
                  <th>Volume total</th>
                </tr>
              </THead>
              <tbody>
                {confRank.map((r, idx) => (
                  <TRow key={`${r.conferente}-${idx}`}>
                    <TCell>{r.conferente || "-"}</TCell>
                    <TCell>{r.conferencias || 0}</TCell>
                    <TCell>{r.pedidos || 0}</TCell>
                    <TCell>{formatSecs(r.avg_tempo_segundos)}</TCell>
                    <TCell>{(r.peso_total ?? 0).toFixed(2)}</TCell>
                    <TCell>{(r.volume_total ?? 0).toFixed(2)}</TCell>
                  </TRow>
                ))}
                {confRank.length === 0 && (
                  <tr>
                    <TCell colSpan={6} style={{ opacity: 0.7 }}>
                      Sem dados no período.
                    </TCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableCard>
        </RankingsRow>

        {/* Transportadoras */}
        <ChartCard>
          <ChartTitle>Transportadoras mais expedidas</ChartTitle>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                  isAnimationActive={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`c-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "grey",
                    border: "1px solid #1f2937",
                    borderRadius: 8,
                    color: "#e5e7eb",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Tempos médios */}
        <LeadTimeGrid>
          <LeadTimeItem>
            <h4>⏱️ Criação → Pronto p/ Conferência</h4>
            <div className="value">
              {formatSecs(leads?.avg_criacao_ate_pronto_conf_seg)}
            </div>
            <div className="hint">Média no período</div>
          </LeadTimeItem>
          <LeadTimeItem>
            <h4>🚚 Pronto p/ Expedir → Expedido</h4>
            <div className="value">
              {formatSecs(leads?.avg_pronto_exp_ate_expedido_seg)}
            </div>
            <div className="hint">Média no período</div>
          </LeadTimeItem>
        </LeadTimeGrid>
      </Content>
    </Page>
  );
}
