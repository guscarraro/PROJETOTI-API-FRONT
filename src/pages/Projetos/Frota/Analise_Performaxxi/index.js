// src/pages/.../Analise_Performaxxi/index.js
import React, { useEffect, useMemo, useState } from "react";
import useLoading from "../../../../hooks/useLoading";
import apiLocal from "../../../../services/apiLocal";

import {
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
  TwoCols,
  PrimaryButton,
  SecondaryButton,
  Pill,
  PillRow,
} from "./style";

import FullscreenRotator from "./FullscreenRotator";
import ModalDetalheErros from "./ModalDetalheErros";
import ModalAlmocoPendentes from "./ModalAlmocoPendentes";
import ModalAlmocoGravissimo from "./ModalAlmocoGravissimo";

import ChartRotasVsAlmoco from "./charts/ChartRotasVsAlmoco";
import ChartErrosEDivergenciasPorDia from "./charts/ChartErrosEDivergenciasPorDia";
import ChartRankingProblemas from "./charts/ChartRankingProblemas";
import ChartMotoristasViagensErros from "./charts/ChartMotoristasViagensErros";
import ModalMotoristaViagensProblemas from "./ModalMotoristaViagensProblemas";

/* helpers datas */
function toISODate(d) {
  return d.toISOString().slice(0, 10);
}
function getCurrentMonthRange(base) {
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  return { start, end };
}
function pct(v) {
  const n = Number(v || 0);
  return `${n.toFixed(0)}%`;
}

const USER_CITY_MAP = {
  user_1: "Ribeirão Preto",
  user_2: "Guarulhos",
  user_3: "Embu",
  user_4: "Contagem",
  user_5: "Ap. de Goiania",
  user_6: "Gravatai",
  user_7: "SJ Dos Pinhais",
  user_8: "Cuiaba",
};

function displayCidade(usuario_key, usuario_label_from_back) {
  if (usuario_label_from_back) return usuario_label_from_back;
  const k = String(usuario_key || "").trim().toLowerCase();
  if (!k) return "-";
  return USER_CITY_MAP[k] || k;
}

export default function Analise_Performaxxi() {
  const loading = useLoading();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const today = new Date();
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange(today);

  const [loadingDash, setLoadingDash] = useState(false);

  // filtros
  const [start, setStart] = useState(toISODate(monthStart));
  const [end, setEnd] = useState(toISODate(monthEnd));
  const [usuarioKey, setUsuarioKey] = useState("");
  const [motorista, setMotorista] = useState("");
  const [rota, setRota] = useState("");
  const [statusRota, setStatusRota] = useState("");
  const [metaSlaPct, setMetaSlaPct] = useState(100);
  
  const [opcoes, setOpcoes] = useState({
      usuarios: [],
      usuarios_v2: [],
      motoristas: [],
      rotas: [],
      status_rota: [],
  });
  
  const [indicador, setIndicador] = useState(null);
  
  // fullscreen
  const [fsOpen, setFsOpen] = useState(false);
  
  // modais
  const [motModalOpen, setMotModalOpen] = useState(false);
const [motModalPayload, setMotModalPayload] = useState(null);

  const [errModalOpen, setErrModalOpen] = useState(false);
  const [errModalPayload, setErrModalPayload] = useState(null);

  const [almocoModalOpen, setAlmocoModalOpen] = useState(false);
  const [almocoModalPayload, setAlmocoModalPayload] = useState(null);

  const [gravModalOpen, setGravModalOpen] = useState(false);
  const [gravModalPayload, setGravModalPayload] = useState(null);

  function buildBaseParams() {
    const params = { data_ini: start, data_fim: end };
    if (usuarioKey) params.usuario_key = usuarioKey;
    if (motorista) params.motorista = motorista;
    if (rota) params.rota = rota;
    if (statusRota) params.status_rota = statusRota;

    params.meta_sla_pct = metaSlaPct;

    // fetch grande
    params.max_rows = 120000;
    params.page_size = 5000;

    return params;
  }

  async function loadOpcoes() {
    const params = { data_ini: start, data_fim: end, max_rows: 120000, page_size: 5000 };
    if (usuarioKey) params.usuario_key = usuarioKey;

    const resp = await apiLocal.getAnaliseRotasOpcoes(params);
    const d = resp?.data || {};

    setOpcoes({
      usuarios: Array.isArray(d.usuarios) ? d.usuarios : [],
      usuarios_v2: Array.isArray(d.usuarios_v2) ? d.usuarios_v2 : [],
      motoristas: Array.isArray(d.motoristas) ? d.motoristas : [],
      rotas: Array.isArray(d.rotas) ? d.rotas : [],
      status_rota: Array.isArray(d.status_rota) ? d.status_rota : [],
    });
  }

  async function loadIndicador() {
    const params = buildBaseParams();

    if (!params?.data_ini || !params?.data_fim) {
      console.error("Params inválidos:", params);
      return;
    }

    const resp = await apiLocal.getAnaliseRotasIndicadores(params);
    setIndicador(resp?.data || null);
  }

  async function loadAll() {
    setLoadingDash(true);
    loading.start("analise_performaxxi");
    try {
      await loadOpcoes();
      await loadIndicador();
    } finally {
      loading.stop("analise_performaxxi");
      setLoadingDash(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBuscar() {
    await loadAll();
  }

  // ===== usuários para rotação
  const usuariosParaRotacao = useMemo(() => {
    if (usuarioKey) {
      let lbl = "";
      const arr = Array.isArray(opcoes.usuarios_v2) ? opcoes.usuarios_v2 : [];
      for (let i = 0; i < arr.length; i++) {
        const it = arr[i];
        if (String(it?.usuario_key || "") === String(usuarioKey)) {
          lbl = it?.usuario_label || "";
          break;
        }
      }
      return [{ usuario_key: usuarioKey, usuario_label: displayCidade(usuarioKey, lbl) }];
    }

    const out = [];
    const arr = Array.isArray(opcoes.usuarios_v2) ? opcoes.usuarios_v2 : [];
    for (let i = 0; i < arr.length; i++) {
      const uk = String(arr[i]?.usuario_key || "").trim().toLowerCase();
      if (!uk) continue;
      out.push({
        usuario_key: uk,
        usuario_label: displayCidade(uk, arr[i]?.usuario_label),
      });
    }

    if (out.length === 0) {
      const a2 = Array.isArray(opcoes.usuarios) ? opcoes.usuarios : [];
      for (let i = 0; i < a2.length; i++) {
        const uk = String(a2[i] || "").trim().toLowerCase();
        if (!uk) continue;
        out.push({ usuario_key: uk, usuario_label: displayCidade(uk, "") });
      }
    }

    out.sort((a, b) => String(a.usuario_label).localeCompare(String(b.usuario_label)));
    return out;
  }, [usuarioKey, opcoes]);

  // ===== KPIs gerais (v2 certo)
  const overallKpis = useMemo(() => {
    const byDay = Array.isArray(indicador?.by_day) ? indicador.by_day : [];
    const counts = indicador?.counts || {};

    let totalRotas = 0;
    let totalPend = 0;
    let totalGrav = 0;

    let totalErrSla = 0;
    let totalErrEnt = 0;
    let totalErrMerc = 0;
    let totalDev = 0;
    let totalErrAny = 0;

    for (let i = 0; i < byDay.length; i++) {
      const d = byDay[i] || {};
      totalRotas += Number(d.rotas_total || 0);
      totalPend += Number(d.almoco_pendente || 0);
      totalGrav += Number(d.almoco_gravissimo || 0);

      totalErrSla += Number(d.erros_sla || 0);
      totalErrEnt += Number(d.erros_entregas || 0);
      totalErrMerc += Number(d.erros_mercadorias || 0);
      totalDev += Number(d.erros_devolucoes || 0); // ✅ CERTO
      totalErrAny += Number(d.erros_total || 0);
    }

    const topRotas = Array.isArray(indicador?.rankings?.rotas_problemas)
      ? indicador.rankings.rotas_problemas
      : [];
    const topMot = Array.isArray(indicador?.rankings?.motoristas_problemas)
      ? indicador.rankings.motoristas_problemas
      : [];

    return {
      totalRotas,
      totalPend,
      totalGrav,

      totalErrSla,
      totalErrEnt,
      totalErrMerc,
      totalDev,
      totalErrAny,

      scanned: Number(counts.total_rows_scanned || 0),
      truncated: !!indicador?.truncated,

      topRotas,
      topMot,

      countsFromBack: {
        total_rotas: Number(counts.total_rotas || 0),
        total_erros_any: Number(counts.total_erros_any || 0),
        total_almoco_pendente: Number(counts.total_almoco_pendente || 0),
        total_almoco_gravissimo: Number(counts.total_almoco_gravissimo || 0),
        total_erros_sla: Number(counts.total_erros_sla || 0),
        total_erros_entregas: Number(counts.total_erros_entregas || 0),
        total_erros_mercadorias: Number(counts.total_erros_mercadorias || 0),
        total_erros_devolucoes: Number(counts.total_erros_devolucoes || 0),
      },
    };
  }, [indicador]);

  // ===== dataset por dia (v2 shape certo)
  const chartByDay = useMemo(() => {
    const byDay = Array.isArray(indicador?.by_day) ? indicador.by_day : [];
    const out = [];

    for (let i = 0; i < byDay.length; i++) {
      const d = byDay[i] || {};
      out.push({
        data: d.data,

        rotas_total: Number(d.rotas_total || 0),
        almoco_pendente: Number(d.almoco_pendente || 0),
        almoco_gravissimo: Number(d.almoco_gravissimo || 0),

        erros_sla: Number(d.erros_sla || 0),
        erros_entregas: Number(d.erros_entregas || 0),
        erros_mercadorias: Number(d.erros_mercadorias || 0),
        erros_devolucoes: Number(d.erros_devolucoes || 0), // ✅ CERTO
        erros_total: Number(d.erros_total || 0),
      });
    }

    return out;
  }, [indicador]);

  function openAlmocoPendentesModal(dayISO, onlyOverdue) {
    setAlmocoModalPayload({
      dayISO,
      only_overdue: !!onlyOverdue,
      filters: {
        data_ini: start,
        data_fim: end,
        day_iso: dayISO || undefined,
        usuario_key: usuarioKey || "",
        motorista,
        rota,
        status_rota: statusRota,
      },
    });
    setAlmocoModalOpen(true);
  }

  function openAlmocoGravissimoModal(dayISO) {
    setGravModalPayload({
      dayISO,
      filters: {
        data_ini: start,
        data_fim: end,
        day_iso: dayISO || undefined,
        usuario_key: usuarioKey || "",
        motorista,
        rota,
        status_rota: statusRota,
      },
    });
    setGravModalOpen(true);
  }

  // ✅ modal “universal” v2 (detalhe-eventos)
  function openDetalheEventosModal(dayISO, eventType) {
    if (!dayISO) return;

    setErrModalPayload({
      event_type: eventType, // sla | mercadorias | devolucao | ...
      meta_sla_pct: metaSlaPct,
      filters: {
        data_ini: start,
        data_fim: end,
        day_iso: dayISO,
        usuario_key: usuarioKey || "",
        motorista,
        rota,
        status_rota: statusRota,
      },
    });
    setErrModalOpen(true);
  }
  function openMotoristaModal(p) {
  setMotModalPayload(p);
  setMotModalOpen(true);
}

  const pendentesSemGravissimo = Math.max(0, overallKpis.totalPend - overallKpis.totalGrav);
  const pendentesGravissimo = overallKpis.totalGrav;

  return (
    <>
      <TitleBarWrap>
        <RightRow style={{ marginTop: 10 }}>
          <FiltersRow>
            <div>
              <TinyLabel>Início</TinyLabel>
              <Field type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>

            <div>
              <TinyLabel>Fim</TinyLabel>
              <Field type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>

            <div>
              <TinyLabel>CD (usuário importação)</TinyLabel>
              <Select value={usuarioKey} onChange={(e) => setUsuarioKey(e.target.value)}>
                <option value="">Todos</option>
                {usuariosParaRotacao.map((u) => (
                  <option key={u.usuario_key} value={u.usuario_key}>
                    {u.usuario_label}
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
              <TinyLabel>Rota</TinyLabel>
              <Select value={rota} onChange={(e) => setRota(e.target.value)}>
                <option value="">Todas</option>
                {opcoes.rotas.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </Select>
            </div>

            {/* <div>
              <TinyLabel>Status rota</TinyLabel>
              <Select value={statusRota} onChange={(e) => setStatusRota(e.target.value)}>
                <option value="">Todos</option>
                {opcoes.status_rota.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </Select>
            </div> */}

            {/* <div>
              <TinyLabel>Meta SLA (%)</TinyLabel>
              <Field
                type="number"
                value={metaSlaPct}
                min={0}
                max={100}
                onChange={(e) => setMetaSlaPct(Number(e.target.value || 0))}
              />
            </div> */}

            <div style={{ alignSelf: "flex-end", display: "flex", gap: 8 }}>
              <PrimaryButton type="button" onClick={handleBuscar} disabled={loadingDash}>
                {loadingDash ? "Carregando..." : "Buscar"}
              </PrimaryButton>

              <SecondaryButton
                type="button"
                onClick={() => setFsOpen(true)}
                disabled={loadingDash || usuariosParaRotacao.length === 0}
                title="Fullscreen TV (ESC ou X para sair)"
              >
                Fullscreen (TV)
              </SecondaryButton>
            </div>
          </FiltersRow>
        </RightRow>

        {/* <PillRow>
          <Pill>Regra Erro SLA: SLA &lt; {metaSlaPct}%</Pill>
          <Pill>Regra Erro Entregas: realizadas &lt; total</Pill>
          <Pill $variant="warn">Almoço pendente = laranja</Pill>
          <Pill $variant="danger">Finalizado sem lançar = vermelho</Pill>
        </PillRow> */}
      </TitleBarWrap>

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
              fontWeight: 900,
              boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
            }}
          >
            Atualizando indicadores...
          </div>
        </div>
      )}

      {/* KPIs */}
      <CardGrid>
        <KPI>
          <KPIValue>{overallKpis.scanned}</KPIValue>
          <KPILabel>Registros lidos</KPILabel>
          <KPIHint>{overallKpis.truncated ? "truncado por limite" : "ok"}</KPIHint>
        </KPI>

        <KPI>
          <KPIValue>{overallKpis.totalRotas}</KPIValue>
          <KPILabel>Rotas no período</KPILabel>
          <KPIHint>somatório por dia</KPIHint>
        </KPI>

        <KPI>
          <KPIValue style={{ color: "#ef4444" }}>{pendentesGravissimo}</KPIValue>
          <KPILabel>Finalizado sem lançar</KPILabel>
          <KPIHint>subset de pendentes</KPIHint>
        </KPI>

        <KPI>
          <KPIValue style={{ color: "#fb7185" }}>{overallKpis.totalErrSla}</KPIValue>
          <KPILabel>Erro SLA</KPILabel>
          <KPIHint>SLA &lt; {metaSlaPct}%</KPIHint>
        </KPI>

        <KPI>
          <KPIValue style={{ color: "#f97316" }}>{overallKpis.totalErrEnt}</KPIValue>
          <KPILabel>Erro Entregas</KPILabel>
          <KPIHint>realizadas &lt; total</KPIHint>
        </KPI>
      </CardGrid>

      <CardGrid style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        <KPI>
          <KPIValue style={{ color: "#f97316" }}>{pendentesSemGravissimo}</KPIValue>
          <KPILabel>Almoço pendente</KPILabel>
          <KPIHint>pendente sem gravíssimo</KPIHint>
        </KPI>



        <KPI>
          <KPIValue>{overallKpis.totalErrMerc}</KPIValue>
          <KPILabel>Mercadorias &lt; 100%</KPILabel>
        </KPI>

        <KPI>
          <KPIValue>{overallKpis.totalDev}</KPIValue>
          <KPILabel>Devoluções</KPILabel>
        </KPI>

        <KPI>
          <KPIValue>{usuariosParaRotacao.length}</KPIValue>
          <KPILabel>CDs no filtro</KPILabel>
        </KPI>
      </CardGrid>

      {/* GRAFICO 1 */}
      <ChartCard>
        <TwoCols>
          <div>
            <ChartTitle>Rotas x Pendência de Almoço</ChartTitle>
            <div style={{ fontSize: 12, opacity: 0.88 }}>
              Total de rotas vs pendências (almoco_lancado=false). Clique no ponto para abrir o dia.
            </div>
          </div>
        </TwoCols>

<ChartRotasVsAlmoco
  data={chartByDay}
  onClickPendencias={(dayISO) => openAlmocoPendentesModal(dayISO, false)}
  onClickGravissimo={(dayISO) => openAlmocoGravissimoModal(dayISO)}   // ✅ NOVO
  onOpenPendentesPeriod={() => openAlmocoPendentesModal(null, false)}
  onOpenGravissimoPeriod={() => openAlmocoGravissimoModal(null)}
/>

      </ChartCard>

      {/* GRAFICO 2 */}
      <ChartCard>
        <ChartTitle>Erros e divergências por dia</ChartTitle>
        <div style={{ fontSize: 12, opacity: 0.88, marginTop: 6 }}>
          Clique na barra para abrir o detalhe do dia (rota + motorista).
        </div>

        <ChartErrosEDivergenciasPorDia
          data={chartByDay}
          onClickErroSla={(dayISO) => openDetalheEventosModal(dayISO, "sla")}
          onClickDevolucao={(dayISO) => openDetalheEventosModal(dayISO, "devolucao")}
          onClickMercadorias={(dayISO) => openDetalheEventosModal(dayISO, "mercadorias")}
        />
      </ChartCard>

      {/* GRAFICO 3 */}
      <ChartCard>
        <ChartTitle>Ranking — rotas com mais problemas (período)</ChartTitle>
        <ChartRankingProblemas rankings={indicador?.rankings} displayCidade={displayCidade} metaSlaPct={metaSlaPct} />
      </ChartCard>

      {/* GRAFICO 4 */}
      <ChartCard>
        <ChartTitle>Motoristas — viagens x erros (período)</ChartTitle>
<ChartMotoristasViagensErros
  rankings={indicador?.rankings}
  displayCidade={displayCidade}
  metaSlaPct={metaSlaPct}
  dataIni={start}
  dataFim={end}
  usuarioKey={usuarioKey}
  onOpenMotoristaModal={openMotoristaModal}
/>
      </ChartCard>

      {/* FULLSCREEN TV */}
      <FullscreenRotator
        open={fsOpen}
        onClose={() => setFsOpen(false)}
        users={usuariosParaRotacao}
        intervalMs={15000}
        baseFilters={{
          data_ini: start,
          data_fim: end,
          meta_sla_pct: metaSlaPct,
          motorista,
          rota,
          status_rota: statusRota,
        }}
        displayCidade={displayCidade}
        onOpenErro={(dayISO, errorType, usuario_key) => {
          setUsuarioKey(usuario_key || "");
          setErrModalPayload({
            event_type: errorType, // aqui também deve ser v2
            meta_sla_pct: metaSlaPct,
            filters: { data_ini: start, data_fim: end, day_iso: dayISO, usuario_key, motorista, rota, status_rota: statusRota },
          });
          setErrModalOpen(true);
        }}
        onOpenPendentes={(dayISO, onlyOverdue, usuario_key) => {
          setUsuarioKey(usuario_key || "");
          setAlmocoModalPayload({
            dayISO,
            only_overdue: !!onlyOverdue,
            filters: { data_ini: start, data_fim: end, day_iso: dayISO || undefined, usuario_key, motorista, rota, status_rota: statusRota },
          });
          setAlmocoModalOpen(true);
        }}
        onOpenGravissimo={(dayISO, usuario_key) => {
          setUsuarioKey(usuario_key || "");
          setGravModalPayload({
            dayISO,
            filters: { data_ini: start, data_fim: end, day_iso: dayISO || undefined, usuario_key, motorista, rota, status_rota: statusRota },
          });
          setGravModalOpen(true);
        }}
      />

{/* MODAIS */}
<div
  style={
    fsOpen
      ? {
          position: "fixed",
          inset: 0,
          zIndex: 10000000, // maior que o fullscreen
          pointerEvents: "none", // deixa clique passar onde não tem modal
        }
      : undefined
  }
>
  <div style={fsOpen ? { pointerEvents: "auto" } : undefined}>
    <ModalDetalheErros
      open={errModalOpen}
      payload={errModalPayload}
      onClose={() => {
        setErrModalOpen(false);
        setErrModalPayload(null);
      }}
    />

    <ModalMotoristaViagensProblemas
      open={motModalOpen}
      payload={motModalPayload}
      onClose={() => {
        setMotModalOpen(false);
        setMotModalPayload(null);
      }}
    />

    <ModalAlmocoPendentes
      open={almocoModalOpen}
      payload={almocoModalPayload}
      onClose={() => {
        setAlmocoModalOpen(false);
        setAlmocoModalPayload(null);
      }}
    />

    <ModalAlmocoGravissimo
      open={gravModalOpen}
      payload={gravModalPayload}
      onClose={() => {
        setGravModalOpen(false);
        setGravModalPayload(null);
      }}
    />
  </div>
</div>

    </>
  );
}
