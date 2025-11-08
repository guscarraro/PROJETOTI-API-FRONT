import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import NavBar from "../../Projetos/components/NavBar";
import {
  Page,
  TitleBar,
  H1,
} from "../../Projetos/style";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* Cores para pizza */
const PIE_COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6", "#22d3ee", "#fb7185"];

export default function DashboardConferencia() {
  const loading = useLoading();

  // filtros
  const [integrante, setIntegrante] = useState("");
  const [role, setRole] = useState("any"); // any|separador|conferente
  const todayISO = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(todayISO);
  const [end, setEnd] = useState(todayISO);

  // dados
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [sepRank, setSepRank] = useState([]);
  const [confRank, setConfRank] = useState([]);
  const [tops, setTops] = useState([]);
  const [leads, setLeads] = useState({});

  const timerRef = useRef(null);

  async function loadAll() {
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
      setDaily(Array.isArray(data.daily_conferencias) ? data.daily_conferencias : []);
      setSepRank(Array.isArray(data.ranking_separadores) ? data.ranking_separadores : []);
      setConfRank(Array.isArray(data.ranking_conferentes) ? data.ranking_conferentes : []);
      setTops(Array.isArray(data.top_transportadoras) ? data.top_transportadoras : []);
      setLeads(data.lead_times || {});
    } finally {
      loading.stop("dash");
    }
  }

  useEffect(() => {
    loadAll();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(loadAll, 20000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, integrante, role]);

  const lineData = useMemo(() => {
    const out = [];
    for (let i = 0; i < daily.length; i++) {
      const d = daily[i];
      out.push({ name: d.date, qty: d.count });
    }
    return out;
  }, [daily]);

  const pieData = useMemo(() => {
    const out = [];
    for (let i = 0; i < tops.length; i++) {
      const t = tops[i];
      out.push({ name: t.transportador || "-", value: Number(t.pedidos_expedidos || 0) });
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

  return (
    <Page>
      <NavBar />
      <Content>
        <TitleBarWrap>
          <H1 $accent="#0ea5e9">Dashboard • Conferência & Expedição</H1>

          <RightRow>
            <FiltersRow>
              <div>
                <TinyLabel>Integrante</TinyLabel>
                <Field
                  placeholder="Nome do separador/conferente..."
                  value={integrante}
                  onChange={(e) => setIntegrante(e.target.value)}
                />
              </div>

              <div>
                <TinyLabel>Função</TinyLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="any">Qualquer</option>
                  <option value="separador">Separador</option>
                  <option value="conferente">Conferente</option>
                </Select>
              </div>

              <div>
                <TinyLabel>Início</TinyLabel>
                <Field type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>

              <div>
                <TinyLabel>Fim</TinyLabel>
                <Field type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </FiltersRow>
          </RightRow>
        </TitleBarWrap>

        {/* KPIs */}
        <CardGrid>
          <KPI>
            <KPIValue>{summary?.total_pedidos ?? 0}</KPIValue>
            <KPILabel>Total de Pedidos</KPILabel>
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
            <KPILabel>Expedido</KPILabel>
          </KPI>
          <KPI>
            <KPIValue>{summary?.etiquetas_impressas ?? 0}</KPIValue>
            <KPILabel>Etiquetas Impressas</KPILabel>
          </KPI>
        </CardGrid>

        {/* Conferências por dia */}
        <ChartCard>
          <ChartTitle>Conferências por dia (janela filtrada)</ChartTitle>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={lineData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="stepAfter" dataKey="qty" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
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
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label isAnimationActive={false}>
                  {pieData.map((entry, index) => (
                    <Cell key={`c-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Tempos médios */}
        <LeadTimeGrid>
          <LeadTimeItem>
            <h4>⏱️ Criação → Pronto p/ Conferência</h4>
            <div className="value">{formatSecs(leads?.avg_criacao_ate_pronto_conf_seg)}</div>
            <div className="hint">Média no período</div>
          </LeadTimeItem>
          <LeadTimeItem>
            <h4>🚚 Pronto p/ Expedir → Expedido</h4>
            <div className="value">{formatSecs(leads?.avg_pronto_exp_ate_expedido_seg)}</div>
            <div className="hint">Média no período</div>
          </LeadTimeItem>
        </LeadTimeGrid>
      </Content>
    </Page>
  );
}
