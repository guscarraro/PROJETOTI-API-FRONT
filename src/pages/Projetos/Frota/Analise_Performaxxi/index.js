import React, { useEffect, useMemo, useState, useRef } from "react";
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

/**
 * ===== REGRAS DE ACESSO POR E-MAIL (apenas user id 26) =====
 * - Se email existir aqui e tiver usuarioKey definido => força o filtro e trava
 * - Se email estiver aqui com allowMacro=true => NÃO força e NÃO trava (macro)
 * - Se não estiver no mapa => comportamento normal (não força)
 */
const USER26_EMAIL_RULES = {
  "raia.sjp@carraro.com": { usuarioKey: "user_7", lock: true }, // SJ Dos Pinhais
  // "fulano.guarulhos@carraro.com": { usuarioKey: "user_2", lock: true },
  // "ciclano.cuiaba@carraro.com": { usuarioKey: "user_8", lock: true },

  // exemplo de "geral/macro" (não trava e não força)
  "performaxxi.geral@carraro.com": { allowMacro: true },
};

export default function Analise_Performaxxi() {
  const loading = useLoading();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

const isUser26 = Array.isArray(user?.setor_ids) && user.setor_ids.map(Number).includes(26);
const userEmail = String(user?.email || "").trim().toLowerCase();

const user26Rule = isUser26 ? USER26_EMAIL_RULES[userEmail] : null;
const shouldLockUsuarioKey = !!(isUser26 && user26Rule?.lock && user26Rule?.usuarioKey);
const forcedUsuarioKey = isUser26 && user26Rule?.usuarioKey ? String(user26Rule.usuarioKey) : "";




  const today = new Date();
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange(today);

  const [loadingDash, setLoadingDash] = useState(false);

  // ✅ token para forçar o anúncio a cada atualização (Buscar / loadAll)
  const [alertaSpeakToken, setAlertaSpeakToken] = useState(0);

  // filtros
  const [start, setStart] = useState(toISODate(monthStart));
  const [end, setEnd] = useState(toISODate(monthEnd));
  const [usuarioKey, setUsuarioKey] = useState("");
  const [motorista, setMotorista] = useState("");
  const [rota, setRota] = useState("");
  const [statusRota, setStatusRota] = useState("");
  const [metaSlaPct, setMetaSlaPct] = useState(100);

  const [alertaFinalizando, setAlertaFinalizando] = useState({ total: 0, items: [] });
  const prevAlertaTotalRef = useRef(0);

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

  // ===== aplica o "FORCE" do CD por e-mail (somente user 26) =====
  useEffect(() => {
    if (!isUser26) return;

    // se for "macro", não força nada
    if (user26Rule?.allowMacro) return;

    // se tiver usuarioKey definido, força
    if (forcedUsuarioKey) {
      setUsuarioKey(forcedUsuarioKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUser26, forcedUsuarioKey, userEmail]);

  function buildBaseParams() {
    const params = { data_ini: start, data_fim: end };

    // se for user 26 com trava, usa SEMPRE o forced
    const effectiveUsuarioKey = shouldLockUsuarioKey ? forcedUsuarioKey : usuarioKey;

    if (effectiveUsuarioKey) params.usuario_key = effectiveUsuarioKey;
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

    const effectiveUsuarioKey = shouldLockUsuarioKey ? forcedUsuarioKey : usuarioKey;
    if (effectiveUsuarioKey) params.usuario_key = effectiveUsuarioKey;

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

  async function loadAlertaFinalizando() {
    const params = buildBaseParams();

    // padrão do endpoint: status_rota em_andamento
    params.status_rota = "em_andamento";
    params.threshold_faltando = 2;

    const resp = await apiLocal.getAnaliseRotasAlertaAlmocoFinalizando(params);
    const d = resp?.data || {};

    const total = Number(d.total || 0);
    const items = Array.isArray(d.items) ? d.items : [];

    setAlertaFinalizando({ total, items });
    prevAlertaTotalRef.current = total;
  }

  async function loadAll() {
    setLoadingDash(true);
    loading.start("analise_performaxxi");
    try {
      await loadOpcoes();
      await loadIndicador();
      await loadAlertaFinalizando();

      setAlertaSpeakToken((t) => t + 1);
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
    const effectiveUsuarioKey = shouldLockUsuarioKey ? forcedUsuarioKey : usuarioKey;

    if (effectiveUsuarioKey) {
      let lbl = "";
      const arr = Array.isArray(opcoes.usuarios_v2) ? opcoes.usuarios_v2 : [];
      for (let i = 0; i < arr.length; i++) {
        const it = arr[i];
        if (String(it?.usuario_key || "") === String(effectiveUsuarioKey)) {
          lbl = it?.usuario_label || "";
          break;
        }
      }
      return [
        {
          usuario_key: effectiveUsuarioKey,
          usuario_label: displayCidade(effectiveUsuarioKey, lbl),
        },
      ];
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
  }, [usuarioKey, forcedUsuarioKey, shouldLockUsuarioKey, opcoes]);

  // ===== KPIs gerais
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
      totalDev += Number(d.erros_devolucoes || 0);
      totalErrAny += Number(d.erros_total || 0);
    }

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
    };
  }, [indicador]);

  // ===== dataset por dia
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
        erros_devolucoes: Number(d.erros_devolucoes || 0),
        erros_total: Number(d.erros_total || 0),
      });
    }

    return out;
  }, [indicador]);

  function openAlmocoPendentesModal(dayISO, onlyOverdue) {
    const effectiveUsuarioKey = shouldLockUsuarioKey ? forcedUsuarioKey : usuarioKey;

    setAlmocoModalPayload({
      dayISO,
      only_overdue: !!onlyOverdue,
      filters: {
        data_ini: start,
        data_fim: end,
        day_iso: dayISO || undefined,
        usuario_key: effectiveUsuarioKey || "",
        motorista,
        rota,
        status_rota: statusRota,
      },
    });
    setAlmocoModalOpen(true);
  }

  function openAlmocoGravissimoModal(dayISO) {
    const effectiveUsuarioKey = shouldLockUsuarioKey ? forcedUsuarioKey : usuarioKey;

    setGravModalPayload({
      dayISO,
      filters: {
        data_ini: start,
        data_fim: end,
        day_iso: dayISO || undefined,
        usuario_key: effectiveUsuarioKey || "",
        motorista,
        rota,
        status_rota: statusRota,
      },
    });
    setGravModalOpen(true);
  }

  function openDetalheEventosModal(dayISO, eventType) {
    if (!dayISO) return;

    const effectiveUsuarioKey = shouldLockUsuarioKey ? forcedUsuarioKey : usuarioKey;

    setErrModalPayload({
      event_type: eventType,
      meta_sla_pct: metaSlaPct,
      filters: {
        data_ini: start,
        data_fim: end,
        day_iso: dayISO,
        usuario_key: effectiveUsuarioKey || "",
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
              <Select
                value={shouldLockUsuarioKey ? forcedUsuarioKey : usuarioKey}
                onChange={(e) => {
                  if (shouldLockUsuarioKey) return;
                  setUsuarioKey(e.target.value);
                }}
                disabled={shouldLockUsuarioKey}
                title={
                  shouldLockUsuarioKey
                    ? "Seu acesso está restrito ao seu CD."
                    : "Selecione um CD"
                }
              >
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

        {/* <KPI>
          <KPIValue style={{ color: "#f97316" }}>{overallKpis.totalErrEnt}</KPIValue>
          <KPILabel>Erro Entregas</KPILabel>
          <KPIHint>realizadas &lt; total</KPIHint>
        </KPI> */}
      </CardGrid>

      <CardGrid >
        <KPI>
          <KPIValue style={{ color: "#f97316" }}>{pendentesSemGravissimo}</KPIValue>
          <KPILabel>Almoço pendente</KPILabel>
          <KPIHint>pendente(s) não finalizado(s)</KPIHint>
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
          alertaFinalizando={alertaFinalizando}
          alertaSpeakToken={alertaSpeakToken}
          onClickPendencias={(dayISO) => openAlmocoPendentesModal(dayISO, false)}
          onClickGravissimo={(dayISO) => openAlmocoGravissimoModal(dayISO)}
          onOpenPendentesPeriod={() => openAlmocoPendentesModal(null, false)}
          onOpenGravissimoPeriod={() => openAlmocoGravissimoModal(null)}
        />
      </ChartCard>

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

      <ChartCard>
        <ChartTitle>Ranking — rotas com mais problemas (período)</ChartTitle>
        <ChartRankingProblemas rankings={indicador?.rankings} displayCidade={displayCidade} metaSlaPct={metaSlaPct} />
      </ChartCard>

      <ChartCard>
        <ChartTitle>Motoristas — viagens x erros (período)</ChartTitle>
        <ChartMotoristasViagensErros
          rankings={indicador?.rankings}
          displayCidade={displayCidade}
          metaSlaPct={metaSlaPct}
          dataIni={start}
          dataFim={end}
          usuarioKey={shouldLockUsuarioKey ? forcedUsuarioKey : usuarioKey}
          onOpenMotoristaModal={openMotoristaModal}
        />
      </ChartCard>

      <FullscreenRotator
        open={fsOpen}
        onClose={() => setFsOpen(false)}
        users={usuariosParaRotacao}
        intervalMs={10000}
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
          const effectiveUsuarioKey = shouldLockUsuarioKey ? forcedUsuarioKey : (usuario_key || "");
          if (shouldLockUsuarioKey) {
            setUsuarioKey(forcedUsuarioKey);
          } else {
            setUsuarioKey(effectiveUsuarioKey);
          }

          setErrModalPayload({
            event_type: errorType,
            meta_sla_pct: metaSlaPct,
            filters: {
              data_ini: start,
              data_fim: end,
              day_iso: dayISO,
              usuario_key: effectiveUsuarioKey,
              motorista,
              rota,
              status_rota: statusRota,
            },
          });
          setErrModalOpen(true);
        }}
        onOpenPendentes={(dayISO, onlyOverdue, usuario_key) => {
          const effectiveUsuarioKey = shouldLockUsuarioKey ? forcedUsuarioKey : (usuario_key || "");
          if (shouldLockUsuarioKey) {
            setUsuarioKey(forcedUsuarioKey);
          } else {
            setUsuarioKey(effectiveUsuarioKey);
          }

          setAlmocoModalPayload({
            dayISO,
            only_overdue: !!onlyOverdue,
            filters: {
              data_ini: start,
              data_fim: end,
              day_iso: dayISO || undefined,
              usuario_key: effectiveUsuarioKey,
              motorista,
              rota,
              status_rota: statusRota,
            },
          });
          setAlmocoModalOpen(true);
        }}
        onOpenGravissimo={(dayISO, usuario_key) => {
          const effectiveUsuarioKey = shouldLockUsuarioKey ? forcedUsuarioKey : usuarioKey;
          if (shouldLockUsuarioKey) {
            setUsuarioKey(forcedUsuarioKey);
          } else {
            setUsuarioKey(effectiveUsuarioKey);
          }

          setGravModalPayload({
            dayISO,
            filters: {
              data_ini: start,
              data_fim: end,
              day_iso: dayISO || undefined,
              usuario_key: effectiveUsuarioKey,
              motorista,
              rota,
              status_rota: statusRota,
            },
          });
          setGravModalOpen(true);
        }}
      />

      <div
        style={
          fsOpen
            ? {
                position: "fixed",
                inset: 0,
                zIndex: 10000000,
                pointerEvents: "none",
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
