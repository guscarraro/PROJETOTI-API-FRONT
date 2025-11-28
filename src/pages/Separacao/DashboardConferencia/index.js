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
  PercentPedidosCell,
  PercentConfsCell,
  PercentExpsCell,
  LeadTimeGrid,
  LeadTimeItem,
  RankingsRow,
  LangToggle,
  LangButton,
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

/* i18n simples PT/ES */
const I18N = {
  pt: {
    title: "Dashboard • Conferência & Expedição",
    filters: {
      quickRange: "Período rápido",
      start: "Início",
      end: "Fim",
      options: {
        current_month: "Mês atual",
        last_month: "Mês passado",
        current_week: "Semana atual",
        last_15: "Últimos 15 dias",
        custom: "Personalizado",
      },
    },
    buttons: {
      search: "Buscar",
      loading: "Carregando...",
    },
    loadingOverlay: "Atualizando dashboard...",
    kpis: {
      totalPedidos: "Total de Pedidos (janela)",
      withOccurrence: "com ocorrência",
      aguardandoConf: "Aguardando Conferência",
      prontoExpedir: "Pronto p/ Expedir",
      expedido: "Expedido (status)",
      confPeriodo: "Conferências no Período",
    },
    charts: {
      dailyTitle: "Pedidos / Conferências / Expedições por dia",
      distributionTitle:
        "Distribuição diária • contagem e % por etapa (dia a dia)",
      transportadorasTitle: "Transportadoras mais expedidas",
    },
    distribution: {
      headers: {
        day: "Dia",
        pedidos: "Pedidos criados",
        pedidosPerc: "% dos pedidos",
        confs: "Conferências",
        confsPerc: "% das conferências",
        exps: "Expedições",
        expsPerc: "% das expedições",
      },
    },
    rankings: {
      separadoresTitle: "🏆 Ranking — Separadores (Top 10)",
      conferentesTitle: "🏆 Ranking — Conferentes (Top 10)",
      noData: "Sem dados no período.",
    },
    messages: {
      noDataPeriod: "Sem dados para o período selecionado.",
    },
    leads: {
      cToConfTitle: "⏱️ Criação → Pronto p/ Conferência",
      expTitle: "🚚 Pronto p/ Expedir → Expedido",
      hint: "Média no período",
    },
  },
  es: {
    title: "Dashboard • Conferencia y Expedición",
    filters: {
      quickRange: "Período rápido",
      start: "Inicio",
      end: "Fin",
      options: {
        current_month: "Mes actual",
        last_month: "Mes pasado",
        current_week: "Semana actual",
        last_15: "Últimos 15 días",
        custom: "Personalizado",
      },
    },
    buttons: {
      search: "Buscar",
      loading: "Cargando...",
    },
    loadingOverlay: "Actualizando dashboard...",
    kpis: {
      totalPedidos: "Total de Pedidos (ventana)",
      withOccurrence: "con incidencia",
      aguardandoConf: "Esperando Conferencia",
      prontoExpedir: "Listo para Expedir",
      expedido: "Expedido (estado)",
      confPeriodo: "Conferencias en el Período",
    },
    charts: {
      dailyTitle: "Pedidos / Conferencias / Expediciones por día",
      distributionTitle:
        "Distribución diaria • conteo y % por etapa (día a día)",
      transportadorasTitle: "Transportistas más expedidas",
    },
    distribution: {
      headers: {
        day: "Día",
        pedidos: "Pedidos creados",
        pedidosPerc: "% de los pedidos",
        confs: "Conferencias",
        confsPerc: "% de las conferencias",
        exps: "Expediciones",
        expsPerc: "% de las expediciones",
      },
    },
    rankings: {
      separadoresTitle: "🏆 Ranking — Separadores (Top 10)",
      conferentesTitle: "🏆 Ranking — Conferentes (Top 10)",
      noData: "Sin datos en el período.",
    },
    messages: {
      noDataPeriod: "Sin datos para el período seleccionado.",
    },
    leads: {
      cToConfTitle: "⏱️ Creación → Listo para Conferencia",
      expTitle: "🚚 Listo para Expedir → Expedido",
      hint: "Promedio en el período",
    },
  },
};

/* helpers de datas para o filtro rápido */

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function getCurrentMonthRange(base) {
  const year = base.getFullYear();
  const month = base.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

function getLastMonthRange(base) {
  const year = base.getFullYear();
  const month = base.getMonth();
  const prevMonth = month - 1;
  const refYear = prevMonth < 0 ? year - 1 : year;
  const refMonth = prevMonth < 0 ? 11 : prevMonth;
  const start = new Date(refYear, refMonth, 1);
  const end = new Date(refYear, refMonth + 1, 0);
  return { start, end };
}

function getCurrentWeekRange(base) {
  // semana atual: segunda -> domingo
  const day = base.getDay(); // 0(dom) - 6(sab)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(base);
  start.setDate(base.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function getLast15DaysRange(base) {
  const end = new Date(base);
  const start = new Date(base);
  start.setDate(base.getDate() - 14); // últimos 15 dias incluindo hoje
  return { start, end };
}

// cálculo da largura visual da barrinha (0 -> sem barra; >0 tem largura mínima)
function calcBarWidth(percent) {
  if (!percent || percent <= 0) return 0;
  if (percent < 6) return 6;
  if (percent > 100) return 100;
  return percent;
}

export default function DashboardConferencia() {
  const loading = useLoading();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [lang, setLang] = useState("pt");
  const t = I18N[lang];

  const setorIds = (Array.isArray(user?.setor_ids) ? user.setor_ids : []).map(
    Number
  );
  const isSetor23 = setorIds.includes(23);
  const [loadingDash, setLoadingDash] = useState(false);

  // filtros
  const today = new Date();
  const { start: weekStart, end: weekEnd } = getCurrentWeekRange(today);

  const [quickRange, setQuickRange] = useState("current_week");
  const [integrante, setIntegrante] = useState("");
  const [role, setRole] = useState("any"); // any|separador|conferente
  const [start, setStart] = useState(toISODate(weekStart)); // default semana atual
  const [end, setEnd] = useState(toISODate(weekEnd));

  // dados gerais
  const [summary, setSummary] = useState(null);
  const [sepRank, setSepRank] = useState([]);
  const [confRank, setConfRank] = useState([]);
  const [tops, setTops] = useState([]);
  const [leads, setLeads] = useState({});

  // série diária com 3 métricas (do back, já pronta)
  const [dailySeries, setDailySeries] = useState([]);

  function applyQuickRange(value) {
    const baseToday = new Date();
    let range = null;

    if (value === "current_month") {
      range = getCurrentMonthRange(baseToday);
    } else if (value === "last_month") {
      range = getLastMonthRange(baseToday);
    } else if (value === "current_week") {
      range = getCurrentWeekRange(baseToday);
    } else if (value === "last_15") {
      range = getLast15DaysRange(baseToday);
    }

    if (range) {
      setStart(toISODate(range.start));
      setEnd(toISODate(range.end));
    }
  }

  function handleQuickRangeChange(e) {
    const value = e.target.value;
    setQuickRange(value);
    if (value === "custom") return;
    applyQuickRange(value);
  }

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

  // totais para bater 100% em cada coluna de %
  const { totalPedidosJanela, totalConfsJanela, totalExpsJanela } = useMemo(() => {
    let totalPedidos = 0;
    let totalConfs = 0;
    let totalExps = 0;

    if (Array.isArray(dailySeries)) {
      for (let i = 0; i < dailySeries.length; i++) {
        const d = dailySeries[i] || {};
        totalPedidos += d.pedidos_criados || 0;
        totalConfs += d.conferencias || 0;
        totalExps += d.expedicoes || 0;
      }
    }

    return {
      totalPedidosJanela: totalPedidos,
      totalConfsJanela: totalConfs,
      totalExpsJanela: totalExps,
    };
  }, [dailySeries]);

  const pieData = useMemo(() => {
    const out = [];
    for (let i = 0; i < tops.length; i++) {
      const tRow = tops[i];
      out.push({
        name: tRow.transportador || "-",
        value: Number(tRow.pedidos_expedidos || 0),
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
          <H1 $accent="#22d3ee">{t.title}</H1>

          <RightRow>
            {/* Toggle de idioma */}
            <LangToggle aria-label="Selecionar idioma">
              <LangButton
                type="button"
                data-active={lang === "pt"}
                onClick={() => setLang("pt")}
              >
                <span role="img" aria-label="Bandeira do Brasil" className="flag">
                  🇧🇷
                </span>
                <span>PT-BR</span>
              </LangButton>
              <LangButton
                type="button"
                data-active={lang === "es"}
                onClick={() => setLang("es")}
              >
                <span
                  role="img"
                  aria-label="Bandera de España"
                  className="flag"
                >
                  🇪🇸
                </span>
                <span>ES</span>
              </LangButton>
            </LangToggle>

            <FiltersRow>
              {/* Filtro rápido */}
              <div>
                <TinyLabel>{t.filters.quickRange}</TinyLabel>
                <Select value={quickRange} onChange={handleQuickRangeChange}>
                  <option value="current_week">
                    {t.filters.options.current_week}
                  </option>
                  <option value="current_month">
                    {t.filters.options.current_month}
                  </option>
                  <option value="last_month">
                    {t.filters.options.last_month}
                  </option>
                  <option value="last_15">
                    {t.filters.options.last_15}
                  </option>
                  <option value="custom">
                    {t.filters.options.custom}
                  </option>
                </Select>
              </div>

              {/* campos de data */}
              <div>
                <TinyLabel>{t.filters.start}</TinyLabel>
                <Field
                  type="date"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    setQuickRange("custom");
                  }}
                />
              </div>

              <div>
                <TinyLabel>{t.filters.end}</TinyLabel>
                <Field
                  type="date"
                  value={end}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    setQuickRange("custom");
                  }}
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
                  {loadingDash ? t.buttons.loading : t.buttons.search}
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
              {t.loadingOverlay}
            </div>
          </div>
        )}

        {/* KPIs */}
        <CardGrid>
          <KPI>
            <KPIValue>{summary?.total_pedidos ?? 0}</KPIValue>
            <KPILabel>{t.kpis.totalPedidos}</KPILabel>

            {summary?.total_pedidos_com_ocorrencia > 0 && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  color: "#f97316",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {summary.total_pedidos_com_ocorrencia} {t.kpis.withOccurrence}
              </div>
            )}
          </KPI>

          <KPI>
            <KPIValue>{summary?.aguardando_conferencia ?? 0}</KPIValue>
            <KPILabel>{t.kpis.aguardandoConf}</KPILabel>
          </KPI>
          <KPI>
            <KPIValue>{summary?.pronto_para_expedir ?? 0}</KPIValue>
            <KPILabel>{t.kpis.prontoExpedir}</KPILabel>
          </KPI>
          <KPI>
            <KPIValue>{summary?.expedido ?? 0}</KPIValue>
            <KPILabel>{t.kpis.expedido}</KPILabel>
          </KPI>

          <KPI>
            <KPIValue>{summary?.conferencias_periodo ?? 0}</KPIValue>
            <KPILabel>{t.kpis.confPeriodo}</KPILabel>
          </KPI>
        </CardGrid>

        {/* Gráfico diário em colunas com 3 séries */}
        <ChartCard>
          <ChartTitle>{t.charts.dailyTitle}</ChartTitle>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart
                data={lineData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                barCategoryGap={8}
                barGap={2}
                barSize={16}
              >
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

        {/* Tabela de distribuição diária */}
        <ChartCard>
          <ChartTitle>{t.charts.distributionTitle}</ChartTitle>
          <Table>
            <THead>
              <tr>
                <th>{t.distribution.headers.day}</th>
                <th>{t.distribution.headers.pedidos}</th>
                <th>{t.distribution.headers.pedidosPerc}</th>
                <th>{t.distribution.headers.confs}</th>
                <th>{t.distribution.headers.confsPerc}</th>
                <th>{t.distribution.headers.exps}</th>
                <th>{t.distribution.headers.expsPerc}</th>
              </tr>
            </THead>
            <tbody>
              {dailySeries.map((d, idx) => {
                const pedidos = d.pedidos_criados || 0;
                const confs = d.conferencias || 0;
                const exps = d.expedicoes || 0;

                const pedidosPercNum =
                  totalPedidosJanela > 0
                    ? (pedidos / totalPedidosJanela) * 100
                    : 0;
                const confsPercNum =
                  totalConfsJanela > 0 ? (confs / totalConfsJanela) * 100 : 0;
                const expsPercNum =
                  totalExpsJanela > 0 ? (exps / totalExpsJanela) * 100 : 0;

                const pedidosText =
                  totalPedidosJanela > 0
                    ? `${pedidosPercNum.toFixed(1)}%`
                    : "-";
                const confsText =
                  totalConfsJanela > 0 ? `${confsPercNum.toFixed(1)}%` : "-";
                const expsText =
                  totalExpsJanela > 0 ? `${expsPercNum.toFixed(1)}%` : "-";

                const pedidosWidth = calcBarWidth(pedidosPercNum);
                const confsWidth = calcBarWidth(confsPercNum);
                const expsWidth = calcBarWidth(expsPercNum);

                return (
                  <TRow key={`${d.date}-${idx}`}>
                    <TCell>{formatXAxisDate(d.date)}</TCell>
                    <TCell>{pedidos}</TCell>
                    <PercentPedidosCell>
                      <div className="percent-bar pedidos">
                        <div
                          className="fill"
                          style={{ width: `${pedidosWidth}%` }}
                        />
                        <span className="label">{pedidosText}</span>
                      </div>
                    </PercentPedidosCell>
                    <TCell>{confs}</TCell>
                    <PercentConfsCell>
                      <div className="percent-bar confs">
                        <div
                          className="fill"
                          style={{ width: `${confsWidth}%` }}
                        />
                        <span className="label">{confsText}</span>
                      </div>
                    </PercentConfsCell>
                    <TCell>{exps}</TCell>
                    <PercentExpsCell>
                      <div className="percent-bar exps">
                        <div
                          className="fill"
                          style={{ width: `${expsWidth}%` }}
                        />
                        <span className="label">{expsText}</span>
                      </div>
                    </PercentExpsCell>
                  </TRow>
                );
              })}
              {dailySeries.length === 0 && (
                <tr>
                  <TCell colSpan={7} style={{ opacity: 0.7 }}>
                    {t.messages.noDataPeriod}
                  </TCell>
                </tr>
              )}
            </tbody>
          </Table>
        </ChartCard>

        {/* Rankings lado a lado - oculto para setor 23 */}
        {!isSetor23 && (
          <RankingsRow>
            <TableCard>
              <ChartTitle>{t.rankings.separadoresTitle}</ChartTitle>
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
                        {t.rankings.noData}
                      </TCell>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableCard>

            <TableCard>
              <ChartTitle>{t.rankings.conferentesTitle}</ChartTitle>
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
                        {t.rankings.noData}
                      </TCell>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableCard>
          </RankingsRow>
        )}

        {/* Transportadoras */}
        <ChartCard>
          <ChartTitle>{t.charts.transportadorasTitle}</ChartTitle>
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
        {/* <LeadTimeGrid>
          <LeadTimeItem>
            <h4>{t.leads.cToConfTitle}</h4>
            <div className="value">
              {formatSecs(leads?.avg_criacao_ate_pronto_conf_seg)}
            </div>
            <div className="hint">{t.leads.hint}</div>
          </LeadTimeItem>
          <LeadTimeItem>
            <h4>{t.leads.expTitle}</h4>
            <div className="value">
              {formatSecs(leads?.avg_pronto_exp_ate_expedido_seg)}
            </div>
            <div className="hint">{t.leads.hint}</div>
          </LeadTimeItem>
        </LeadTimeGrid> */}
      </Content>
    </Page>
  );
}
