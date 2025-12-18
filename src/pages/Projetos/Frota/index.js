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
  KPIHint,
  ChartCard,
  ChartTitle,
  UserCardsGrid,
  UserCard,
  TwoCols,
} from "./style";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  Legend,
} from "recharts";

import ModalInconsistencias from "./ModalInconsistencias";
import ModalPossiveisFaltas from "./ModalPossiveisFaltas";

/* helpers de datas */
function toISODate(d) {
  return d.toISOString().slice(0, 10);
}
function getCurrentWeekRange(base) {
  const day = base.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(base);
  start.setDate(base.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}
function formatXAxisDate(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  const [, month, day] = parts;
  return `${day}/${month}`;
}
function minutesToHM(min) {
  if (min == null) return "-";
  const total = Math.max(0, Number(min) || 0);
  const h = Math.floor(total / 60);
  const m = Math.floor(total % 60);
  if (h <= 0) return `${m}min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

const COLOR_AVG = "#22d3ee";
const COLOR_INC = "#f97316";

/** Mapa fallback no front (mas o back já manda label) */
const USER_CITY_MAP = {
  user_1: "Ribeirão Preto",
  user_2: "Guarulhos",
  user_3: "Embu",
  user_4: "Contagem",
  user_5: "Ap. de Goiania",
  user_6: "Gravatai",
  user_7: "Cuiaba",
};

function displayCidade(usuario_key, usuario_label_from_back) {
  if (usuario_label_from_back) return usuario_label_from_back;
  if (!usuario_key) return "-";
  const key = String(usuario_key).trim();
  return USER_CITY_MAP[key] || usuario_key;
}

/** estilo por card (cores diferentes) */
const USER_CARD_STYLE = {
  user_1: { bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.55)" },
  user_2: { bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.55)" },
  user_3: { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.55)" },
  user_4: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.55)" },
  user_5: { bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.55)" },
  user_6: { bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.55)" },
  user_7: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.55)" },
};

export default function Frota() {
  const loading = useLoading();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const today = new Date();
  const { start: weekStart, end: weekEnd } = getCurrentWeekRange(today);

  const [loadingDash, setLoadingDash] = useState(false);

  // filtros base
  const [quickRange, setQuickRange] = useState("current_week");
  const [start, setStart] = useState(toISODate(weekStart));
  const [end, setEnd] = useState(toISODate(weekEnd));

  const [opcoes, setOpcoes] = useState({
    usuarios: [],
    motoristas: [],
    placas: [],
    rotas: [],
  });

  const [usuarioKey, setUsuarioKey] = useState("");
  const [motorista, setMotorista] = useState("");
  const [placa, setPlaca] = useState("");
  const [rota, setRota] = useState("");

  // regras
  const [minOk] = useState(60);
  const [maxOk] = useState(90);

  const [indicador, setIndicador] = useState(null);

  // modal inconsistencias (rosa)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState(null);

  // modal faltas (cinza)
  const [missOpen, setMissOpen] = useState(false);
  const [missPayload, setMissPayload] = useState(null);

  function applyQuickRange(value) {
    const baseToday = new Date();
    let range = null;
    if (value === "current_week") range = getCurrentWeekRange(baseToday);
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

  function buildBaseParams() {
    const params = { data_ini: start, data_fim: end };
    if (usuarioKey) params.usuario_key = usuarioKey;
    return params;
  }

  async function loadOpcoes() {
    const params = buildBaseParams();
    const resp = await apiLocal.getHorarioAlmocoOpcoes({
      ...params,
      max_rows: 100000,
      page_size: 5000,
    });
    const d = resp?.data || {};
    setOpcoes({
      usuarios: Array.isArray(d.usuarios) ? d.usuarios : [],
      motoristas: Array.isArray(d.motoristas) ? d.motoristas : [],
      placas: Array.isArray(d.placas) ? d.placas : [],
      rotas: Array.isArray(d.rotas) ? d.rotas : [],
    });
  }

  async function loadIndicador() {
    const resp = await apiLocal.indicadorHorarioAlmocoV3({
      data_ini: start,
      data_fim: end,
      ...(usuarioKey ? { usuario_key: usuarioKey } : {}),
      ...(motorista ? { motorista } : {}),
      ...(placa ? { placa } : {}),
      ...(rota ? { rota } : {}),
      min_ok: minOk,
      max_ok: maxOk,
      max_rows: 100000,
      page_size: 5000,
      pattern_weeks: 2,
      pattern_min_hits: 3,
    });
    setIndicador(resp?.data || null);
  }

  async function loadAll() {
    setLoadingDash(true);
    loading.start("frota");
    try {
      await loadOpcoes();
      await loadIndicador();
    } finally {
      loading.stop("frota");
      setLoadingDash(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBuscar() {
    setLoadingDash(true);
    loading.start("frota");
    try {
      await loadOpcoes();
      await loadIndicador();
    } finally {
      loading.stop("frota");
      setLoadingDash(false);
    }
  }

  // ===== KPIs gerais =====
  const overallKpis = useMemo(() => {
    const arr = Array.isArray(indicador?.overall_by_day) ? indicador.overall_by_day : [];
    const totalRows = Number(indicador?.counts?.total_rows_scanned_period || 0);

    let totalInc = 0;
    let sumAvg = 0;
    let daysWithAvg = 0;

    for (let i = 0; i < arr.length; i++) {
      const d = arr[i] || {};
      totalInc += Number(d.inconsistencias || 0);
      if (d.avg_tempo_min != null) {
        sumAvg += Number(d.avg_tempo_min || 0);
        daysWithAvg += 1;
      }
    }

    const avgGeral = daysWithAvg > 0 ? sumAvg / daysWithAvg : 0;

    return {
      totalRows,
      totalInc,
      avgGeral,
      missingCount: Array.isArray(indicador?.missing_expected) ? indicador.missing_expected.length : 0,
      truncated: !!indicador?.truncated,
    };
  }, [indicador]);

  // ===== cards por operação =====
  const users = useMemo(() => {
    const arr = Array.isArray(indicador?.users) ? indicador.users : [];
    const out = [];

    for (let i = 0; i < arr.length; i++) {
      const u = arr[i] || {};
      const byDay = Array.isArray(u.by_day) ? u.by_day : [];

      let incTotal = 0;
      for (let j = 0; j < byDay.length; j++) {
        incTotal += Number(byDay[j]?.inconsistencias || 0);
      }

      const miss = Array.isArray(indicador?.missing_expected)
        ? indicador.missing_expected.filter((m) => String(m.usuario_key) === String(u.usuario_key))
        : [];

      const missByDay = {};
      for (let k = 0; k < miss.length; k++) {
        const d = miss[k];
        const day = String(d?.data || "");
        if (!day) continue;
        if (!missByDay[day]) missByDay[day] = 0;
        missByDay[day] += 1;
      }

      const daySet = new Set();
      for (let j = 0; j < byDay.length; j++) daySet.add(String(byDay[j]?.data || ""));
      Object.keys(missByDay).forEach((d) => daySet.add(d));

      const series = [];
      Array.from(daySet).forEach((d) => {
        const dayObj = byDay.find((x) => String(x.data) === String(d));
        series.push({
          day: d,
          inc: Number(dayObj?.inconsistencias || 0),
          miss: Number(missByDay[d] || 0),
        });
      });

      series.sort((a, b) => String(a.day).localeCompare(String(b.day)));

      out.push({
        usuario_key: u.usuario_key,
        usuario_label: displayCidade(u.usuario_key, u.usuario_label),
        total_rows: Number(u.total_rows || 0),
        inc_total: incTotal,
        by_day: byDay,
        miss_items: miss,
        series,
      });
    }

    out.sort((a, b) => String(a.usuario_label).localeCompare(String(b.usuario_label)));
    return out;
  }, [indicador]);

  function openInconsistencias(usuario_key, dayISO) {
    const u = users.find((x) => x.usuario_key === usuario_key);
    if (!u) return;

    setModalPayload({
      usuario_key,
      usuario_label: u.usuario_label,
      day: dayISO,
      min_ok: indicador?.rules?.min_ok ?? minOk,
      max_ok: indicador?.rules?.max_ok ?? maxOk,
      filters: { motorista, placa, rota },
    });
    setModalOpen(true);
  }

  function openPossiveisFaltas(usuario_key, dayISO) {
    const u = users.find((x) => x.usuario_key === usuario_key);
    if (!u) return;

    const onlyDay = u.miss_items.filter((m) => String(m.data) === String(dayISO));
    setMissPayload({
      usuario_key,
      usuario_label: u.usuario_label,
      day: dayISO,
      items: onlyDay,
    });
    setMissOpen(true);
  }

  async function handleModalSaved() {
    setModalOpen(false);
    setModalPayload(null);
    await loadIndicador();
  }

  return (
    <Page>
      <NavBar />
      <Content>
          <H1 $accent="#22d3ee">Frota • Horário de Almoço</H1>

        <TitleBarWrap>


          <RightRow style={{ marginTop: 10 }}>
            <FiltersRow>
              <div>
                <TinyLabel>Período rápido</TinyLabel>
                <Select value={quickRange} onChange={handleQuickRangeChange}>
                  <option value="current_week">Semana atual</option>
                  <option value="custom">Personalizado</option>
                </Select>
              </div>

              <div>
                <TinyLabel>Início</TinyLabel>
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
                <TinyLabel>Fim</TinyLabel>
                <Field
                  type="date"
                  value={end}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    setQuickRange("custom");
                  }}
                />
              </div>

              <div>
                <TinyLabel>Operação</TinyLabel>
                <Select value={usuarioKey} onChange={(e) => setUsuarioKey(e.target.value)}>
                  <option value="">Todas</option>
                  {opcoes.usuarios.map((x) => (
                    <option key={x} value={x}>
                      {displayCidade(x)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <TinyLabel>Motorista</TinyLabel>
                <Select value={motorista} onChange={(e) => setMotorista(e.target.value)}>
                  <option value="">Todos</option>
                  {opcoes.motoristas.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <TinyLabel>Placa</TinyLabel>
                <Select value={placa} onChange={(e) => setPlaca(e.target.value)}>
                  <option value="">Todas</option>
                  {opcoes.placas.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>
              </div>

              {/* <div>
                <TinyLabel>Rota</TinyLabel>
                <Select value={rota} onChange={(e) => setRota(e.target.value)}>
                  <option value="">Todas</option>
                  {opcoes.rotas.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>
              </div> */}

              <div style={{ alignSelf: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleBuscar}
                  disabled={loadingDash}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "none",
                    background: "#22d3ee",
                    color: "#0b1120",
                    fontWeight: 800,
                    cursor: loadingDash ? "default" : "pointer",
                    opacity: loadingDash ? 0.65 : 1,
                    marginLeft: 8,
                  }}
                >
                  {loadingDash ? "Carregando..." : "Buscar"}
                </button>
              </div>
            </FiltersRow>
          </RightRow>
        </TitleBarWrap>
          <RightRow>
            <div style={{ fontSize: 12, opacity: 0.9, maxWidth: 860 }}>
              Regra: aceitável{" "}
              <strong>
                {minOk}..{maxOk} min
              </strong>
              . Inconsistência é <strong>&lt; {minOk}</strong> ou{" "}
              <strong>&gt; {maxOk}</strong>. Se status for{" "}
              <strong>Ajustado</strong>, some da divergência.
            </div>
          </RightRow>
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
                fontWeight: 800,
                boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
              }}
            >
              Atualizando Frota...
            </div>
          </div>
        )}

        {/* KPIs gerais */}
        <CardGrid>
          <KPI>
            <KPIValue>{overallKpis.totalRows}</KPIValue>
            <KPILabel>Registros lidos</KPILabel>
            <KPIHint>{overallKpis.truncated ? "truncado pelo limite" : "período filtrado"}</KPIHint>
          </KPI>

          <KPI>
            <KPIValue>{overallKpis.totalInc}</KPIValue>
            <KPILabel>Inconsistências</KPILabel>
            <KPIHint>
              aceitável: {minOk}..{maxOk} min
            </KPIHint>
          </KPI>

          <KPI>
            <KPIValue>{minutesToHM(overallKpis.avgGeral)}</KPIValue>
            <KPILabel>Média geral</KPILabel>
          </KPI>

          <KPI>
            <KPIValue>{overallKpis.missingCount}</KPIValue>
            <KPILabel>Possíveis faltas</KPILabel>
            <KPIHint>cinza = sugestão</KPIHint>
          </KPI>

          <KPI>
            <KPIValue>{users.length}</KPIValue>
            <KPILabel>Operações</KPILabel>
          </KPI>
        </CardGrid>
{/* Gráfico: Média geral por dia (geral) */}
<ChartCard>
  <ChartTitle>Média geral por dia</ChartTitle>

  <div style={{ width: "100%", height: 260 }}>
    <ResponsiveContainer>
      <BarChart
        data={(Array.isArray(indicador?.overall_by_day) ? indicador.overall_by_day : []).map((d) => ({
          day: d?.data,
          avg: Number(d?.avg_tempo_min || 0),
        }))}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <XAxis dataKey="day" tickFormatter={formatXAxisDate} tick={{ fontSize: 11, fill: "#9ca3af" }} />
        <YAxis tickFormatter={(v) => `${v}m`} tick={{ fontSize: 11, fill: "#9ca3af" }} />
        <Tooltip
          contentStyle={{
            background: "#020617",
            border: "1px solid #1f2937",
            borderRadius: 8,
            color: "#e5e7eb",
            fontSize: 12,
          }}
          labelFormatter={(label) => `Dia: ${formatXAxisDate(label)}`}
          formatter={(value) => [`${Number(value || 0).toFixed(0)} min`, "Média"]}
        />
        <Legend />
        <Bar
          dataKey="avg"
          name="Média (min)"
          fill={COLOR_AVG}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</ChartCard>

        {/* Cards por operação */}
        <ChartCard>
          <ChartTitle>Por operação • clique na barra ROSA ou CINZA</ChartTitle>

          <UserCardsGrid style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            {users.map((u) => {
              const st = USER_CARD_STYLE[String(u.usuario_key).trim()] || {
                bg: "rgba(148,163,184,0.08)",
                border: "rgba(148,163,184,0.55)",
              };

              return (
                <UserCard
                  key={u.usuario_key}
                  style={{
                    background: st.bg,
                    border: `2px dashed ${st.border}`,
                  }}
                >
                  <TwoCols>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>{u.usuario_label}</div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>{u.total_rows} registros</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, fontSize: 18, color: "#f97316" }}>{u.inc_total}</div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>inconsistências</div>
                    </div>
                  </TwoCols>

                  {/* ✅ 2 “escadas” com clique separado (cada Bar abre um modal) */}
                  <div style={{ width: "100%", height: 190, marginTop: 10 }}>
                    <ResponsiveContainer>
                      <BarChart data={u.series} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                        <XAxis dataKey="day" tickFormatter={formatXAxisDate} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                        <Tooltip
                          contentStyle={{
                            background: "#020617",
                            border: "1px solid #1f2937",
                            borderRadius: 8,
                            color: "#e5e7eb",
                            fontSize: 12,
                          }}
                          labelFormatter={(label) => `Dia: ${formatXAxisDate(label)}`}
                        />
                        <Legend />

                        {/* ✅ barra de inconsistências (rosa) -> ModalInconsistencias */}
                        <Bar
                          dataKey="inc"
                          name="Inconsistências"
                          fill="#fb7185"
                          radius={[4, 4, 0, 0]}
                          style={{ cursor: "pointer" }}
                          onClick={(bar) => {
                            const dayISO = bar?.payload?.day;
                            if (!dayISO) return;
                            openInconsistencias(u.usuario_key, dayISO);
                          }}
                        />

                        {/* ✅ barra de sugestão (cinza) -> ModalPossiveisFaltas */}
                        <Bar
                          dataKey="miss"
                          name="Possível falta"
                          fill="#94a3b8"
                          radius={[4, 4, 0, 0]}
                          style={{ cursor: "pointer" }}
                          onClick={(bar) => {
                            const dayISO = bar?.payload?.day;
                            if (!dayISO) return;
                            openPossiveisFaltas(u.usuario_key, dayISO);
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.92 }}>
                    <strong>Aceitável:</strong> {minOk}..{maxOk} min •{" "}
                    <span style={{ opacity: 0.9 }}>cinza = sugestão de falta (só conferência)</span>
                  </div>
                </UserCard>
              );
            })}

            {users.length === 0 && (
              <div style={{ opacity: 0.75, padding: 12 }}>
                Sem dados no período selecionado.
              </div>
            )}
          </UserCardsGrid>
        </ChartCard>

        {/* Modal inconsistências */}
        <ModalInconsistencias
          open={modalOpen}
          payload={modalPayload}
          actor={user?.nome || user?.email || "unknown"}
          onClose={() => {
            setModalOpen(false);
            setModalPayload(null);
          }}
          onSaved={handleModalSaved}
        />

        {/* Modal sugestões (somente leitura) */}
        <ModalPossiveisFaltas
          open={missOpen}
          payload={missPayload}
          onClose={() => {
            setMissOpen(false);
            setMissPayload(null);
          }}
        />
      </Content>
    </Page>
  );
}
