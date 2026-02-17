// src/pages/Projecao/index.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip as LeafTooltip,
  useMap,
} from "react-leaflet";

// ✅ Ajuste o import para o seu NavBar existente
import NavBar from "../Projetos/components/NavBar";
import { Page } from "../Projetos/style";
import {
  TitleBar,
  H1,
  TabsRow,
  TabBtn,
  Section,
  FiltersRow,
  FilterGroup,
  Label,
  Input,
  Select,
  InfoGrid,
  InfoItem,
  KpiTitle,
  KpiValue,
  CardGrid,
  TripCard,
  TripTop,
  TripLeft,
  TripTitle,
  TripSub,
  StatusPill,
  Muted,
  MapWrap,
  MapHeader,
  MapTitle,
  LegendRow,
  LegendPill,
  LegendDot,
  DetailHeader,
  BackBtn,
  DetailGrid,
  DetailBox,
  StepperWrap,
  StepperRow,
  StepItem,
  StepDot,
  StepLine,
  StepLabel,
  TableWrap,
  Table,
  Th,
  Td,
  Pill,
} from "./style";

import {
  FaChartPie,
  FaRoute,
  FaTruck,
  FaCalendarDays,
  FaFilter,
  FaLocationDot,
  FaFlagCheckered,
  FaArrowLeft,
  FaPlay,
  FaCircleCheck,
  FaCircleDot,
  FaRoad,
  FaClipboardList,
  FaBarcode,
  FaLayerGroup,
  FaTruckFast,
} from "react-icons/fa6";

/* =========================
   FIX MARKER DEFAULT ICON
   ========================= */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* =========================
   DADOS FICTÍCIOS
   ========================= */
function buildFakeTrips() {
  return [
    {
      id: "V-10234",
      manifesto: "MAN-889122",
      motorista: "Carlos Henrique",
      placa: "FTR-9A22",
      rota: "CD SP → Jundiaí → Campinas → Sumaré → Hortolândia → CD SP",
      status: "EM_ANDAMENTO",
      inicioPrevisto: "2026-02-11T08:10:00",
      inicioReal: "2026-02-11T08:26:00",
      fimReal: null,
      entregasTotal: 4,
      entregasConcluidas: 2,
      ctes: [
        { cte: "35260100012345678901234567890123456789012345", nf: "900112", cliente: "ACME LTDA", volumes: 12 },
        { cte: "35260100099999999999999999999999999999999999", nf: "900113", cliente: "FAST SHOP", volumes: 4 },
        { cte: "35260100088888888888888888888888888888888888", nf: "900114", cliente: "B2B COMERCIO", volumes: 7 },
      ],
      points: [
        { name: "CD (Origem)", lat: -23.55052, lng: -46.633308, kind: "start" },
        { name: "Entrega 1", lat: -23.185707, lng: -46.897806, kind: "stop" }, // Jundiaí
        { name: "Entrega 2", lat: -22.90556, lng: -47.06083, kind: "stop" }, // Campinas
        { name: "Entrega 3", lat: -22.85833, lng: -47.2200, kind: "stop" }, // Sumaré
        { name: "Entrega 4", lat: -22.85294, lng: -47.21498, kind: "stop" }, // Hortolândia
        { name: "CD (Retorno)", lat: -23.55052, lng: -46.633308, kind: "end" },
      ],
    },
    {
      id: "V-10236",
      manifesto: "MAN-889130",
      motorista: "Marina Souza",
      placa: "BCD-7T10",
      rota: "CD SP → Osasco → Barueri → Santana de Parnaíba → CD SP",
      status: "EM_ANDAMENTO",
      inicioPrevisto: "2026-02-11T07:40:00",
      inicioReal: "2026-02-11T07:51:00",
      fimReal: null,
      entregasTotal: 3,
      entregasConcluidas: 1,
      ctes: [
        { cte: "35260100077777777777777777777777777777777777", nf: "910010", cliente: "LOJA ALPHA", volumes: 3 },
        { cte: "35260100066666666666666666666666666666666666", nf: "910011", cliente: "LOJA BETA", volumes: 8 },
      ],
      points: [
        { name: "CD (Origem)", lat: -23.55052, lng: -46.633308, kind: "start" },
        { name: "Entrega 1", lat: -23.5325, lng: -46.7917, kind: "stop" }, // Osasco
        { name: "Entrega 2", lat: -23.5107, lng: -46.8767, kind: "stop" }, // Barueri
        { name: "Entrega 3", lat: -23.4440, lng: -46.9170, kind: "stop" }, // Parnaíba
        { name: "CD (Retorno)", lat: -23.55052, lng: -46.633308, kind: "end" },
      ],
    },
    {
      id: "V-10235",
      manifesto: "MAN-889125",
      motorista: "Ana Paula",
      placa: "KLM-4B11",
      rota: "CD SP → Santo André → São Bernardo → Barueri → CD SP",
      status: "PROGRAMADA",
      inicioPrevisto: "2026-02-11T10:30:00",
      inicioReal: null,
      fimReal: null,
      entregasTotal: 3,
      entregasConcluidas: 0,
      ctes: [
        { cte: "35260100055555555555555555555555555555555555", nf: "900210", cliente: "CLIENTE XYZ", volumes: 6 },
      ],
      points: [
        { name: "CD (Origem)", lat: -23.55052, lng: -46.633308, kind: "start" },
        { name: "Entrega 1", lat: -23.66583, lng: -46.46139, kind: "stop" },
        { name: "Entrega 2", lat: -23.68984, lng: -46.56485, kind: "stop" },
        { name: "Entrega 3", lat: -23.5107, lng: -46.8767, kind: "stop" },
        { name: "CD (Retorno)", lat: -23.55052, lng: -46.633308, kind: "end" },
      ],
    },
    {
      id: "V-10212",
      manifesto: "MAN-888900",
      motorista: "Rafael Lima",
      placa: "QWE-1C77",
      rota: "CD SP → Osasco → Carapicuíba",
      status: "FINALIZADA",
      inicioPrevisto: "2026-02-10T08:00:00",
      inicioReal: "2026-02-10T08:07:00",
      fimReal: "2026-02-10T12:20:00",
      entregasTotal: 2,
      entregasConcluidas: 2,
      ctes: [
        { cte: "35260100044444444444444444444444444444444444", nf: "890010", cliente: "CLIENTE DELTA", volumes: 2 },
        { cte: "35260100033333333333333333333333333333333333", nf: "890011", cliente: "CLIENTE OMEGA", volumes: 11 },
      ],
      points: [
        { name: "CD (Origem)", lat: -23.55052, lng: -46.633308, kind: "start" },
        { name: "Entrega 1", lat: -23.5325, lng: -46.7917, kind: "stop" },
        { name: "Entrega 2", lat: -23.5227, lng: -46.8350, kind: "stop" },
      ],
    },
    {
      id: "V-10190",
      manifesto: "MAN-888700",
      motorista: "Diego Santos",
      placa: "HJK-2D09",
      rota: "CD SP → Guarulhos → CD SP (retorno)",
      status: "ENCERRADA",
      inicioPrevisto: "2026-02-09T07:30:00",
      inicioReal: "2026-02-09T07:33:00",
      fimReal: "2026-02-09T11:58:00",
      entregasTotal: 1,
      entregasConcluidas: 1,
      ctes: [{ cte: "35260100022222222222222222222222222222222222", nf: "870001", cliente: "CLIENTE GAMMA", volumes: 5 }],
      points: [
        { name: "CD (Origem)", lat: -23.55052, lng: -46.633308, kind: "start" },
        { name: "Entrega 1", lat: -23.454315, lng: -46.533652, kind: "stop" },
        { name: "CD (Retorno)", lat: -23.55052, lng: -46.633308, kind: "end" },
      ],
    },
    // CANCELADA NÃO APARECE
    {
      id: "V-99999",
      manifesto: "MAN-CANCEL",
      motorista: "Teste",
      placa: "XXX-0000",
      rota: "Cancelada",
      status: "CANCELADA",
      inicioPrevisto: "2026-02-11T09:00:00",
      inicioReal: null,
      fimReal: null,
      entregasTotal: 1,
      entregasConcluidas: 0,
      ctes: [],
      points: [
        { name: "CD", lat: -23.55052, lng: -46.633308, kind: "start" },
        { name: "Entrega", lat: -23.454315, lng: -46.533652, kind: "stop" },
      ],
    },
  ];
}

/* =========================
   OSRM ROUTE (bonitinha)
   ========================= */
async function fetchOsrmPolylineLatLng(points) {
  if (!Array.isArray(points) || points.length < 2) return null;

  let coords = "";
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const lng = Number(p?.lng);
    const lat = Number(p?.lat);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (coords.length) coords += ";";
    coords += `${lng},${lat}`;
  }

  if (coords.split(";").length < 2) return null;

  const url =
    "https://router.project-osrm.org/route/v1/driving/" +
    coords +
    "?overview=full&geometries=geojson&steps=false";

  const r = await fetch(url);
  const json = await r.json();

  if (!json || json.code !== "Ok") return null;

  const route = Array.isArray(json.routes) ? json.routes[0] : null;
  if (!route?.geometry?.coordinates) return null;

  const raw = route.geometry.coordinates;
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!Array.isArray(item) || item.length < 2) continue;
    const lng = Number(item[0]);
    const lat = Number(item[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    out.push([lat, lng]);
  }

  return out.length ? out : null;
}

/* =========================
   HELPERS
   ========================= */
function fmtDt(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("pt-BR");
  } catch {
    return "—";
  }
}

function statusLabel(s) {
  const x = String(s || "").toUpperCase();
  if (x === "PROGRAMADA") return "Programada";
  if (x === "EM_ANDAMENTO") return "Em andamento";
  if (x === "FINALIZADA") return "Finalizada";
  if (x === "ENCERRADA") return "Encerrada";
  return "—";
}

function statusVariant(s) {
  const x = String(s || "").toUpperCase();
  if (x === "PROGRAMADA") return "prog";
  if (x === "EM_ANDAMENTO") return "run";
  if (x === "FINALIZADA" || x === "ENCERRADA") return "done";
  return "prog";
}

function pickBlue(i) {
  const palette = [
    "#2563eb",
    "#1d4ed8",
    "#1e40af",
    "#0ea5e9",
    "#0284c7",
    "#3b82f6",
    "#60a5fa",
    "#38bdf8",
  ];
  const idx = Number(i) % palette.length;
  return palette[idx];
}

function FitToPolyline({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (!Array.isArray(positions) || positions.length < 2) return;

    try {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [24, 24] });
    } catch {
      // silencioso
    }
  }, [map, positions]);

  return null;
}

/* =========================
   TIMELINE
   ========================= */
function buildTimeline(trip) {
  const entregasTotal = Number(trip?.entregasTotal || 0);
  const entregasConcluidas = Number(trip?.entregasConcluidas || 0);
  const status = String(trip?.status || "").toUpperCase();

  const steps = [];
  steps.push({ key: "start", label: "Início da viagem", icon: <FaPlay /> });

  for (let i = 1; i <= entregasTotal; i++) {
    steps.push({ key: `e-${i}`, label: `Entrega ${i}`, icon: <FaLocationDot /> });
  }

  if (entregasTotal > 0) {
    steps.push({ key: "last", label: "Última entrega", icon: <FaFlagCheckered /> });
  }

  if (status === "ENCERRADA") {
    steps.push({ key: "return", label: "Retorno CD", icon: <FaRoad /> });
  }

  let completedCount = 0;

  // start
  if (trip?.inicioReal) completedCount = 1;

  // entregas
  if (entregasConcluidas > 0) completedCount += entregasConcluidas;

  // última entrega
  if (entregasTotal > 0) {
    if (status === "FINALIZADA" || status === "ENCERRADA") completedCount += 1;
  }

  // retorno
  if (status === "ENCERRADA") completedCount += 1;

  if (completedCount < 0) completedCount = 0;
  if (completedCount > steps.length) completedCount = steps.length;

  return { steps, completedCount };
}

/* =========================
   MARKERS - pontos numerados
   ========================= */
function useTripMarkerIcons() {
  return useMemo(() => {
    const startIcon = L.divIcon({
      className: "trip-marker",
      html: `<div style="width:30px;height:30px;border-radius:14px;background:rgba(37,99,235,.16);border:1px solid rgba(37,99,235,.32);display:flex;align-items:center;justify-content:center;font-weight:1000;color:#1d4ed8;">CD</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const endIcon = L.divIcon({
      className: "trip-marker",
      html: `<div style="width:30px;height:30px;border-radius:14px;background:rgba(16,185,129,.14);border:1px solid rgba(16,185,129,.28);display:flex;align-items:center;justify-content:center;font-weight:1000;color:#047857;">🏁</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const stopIcon = (n, isDone) =>
      L.divIcon({
        className: "trip-marker",
        html: `<div style="width:30px;height:30px;border-radius:14px;background:${isDone ? "rgba(16,185,129,.16)" : "rgba(37,99,235,.12)"};border:1px solid ${isDone ? "rgba(16,185,129,.28)" : "rgba(37,99,235,.24)"};display:flex;align-items:center;justify-content:center;font-weight:1000;color:${isDone ? "#047857" : "#1d4ed8"};">${n}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

    return { startIcon, endIcon, stopIcon };
  }, []);
}

function TripMarkers({ trip }) {
  const icons = useTripMarkerIcons();

  const pts = Array.isArray(trip?.points) ? trip.points : [];
  const status = String(trip?.status || "").toUpperCase();
  const total = Number(trip?.entregasTotal || 0);
  const done = Number(trip?.entregasConcluidas || 0);

  const markers = [];
  let deliveryIndex = 0;

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const lat = Number(p?.lat);
    const lng = Number(p?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const kind = String(p?.kind || "").toLowerCase();

    if (kind === "start") {
      markers.push({ key: `m-${i}`, pos: [lat, lng], icon: icons.startIcon, label: p?.name || "Origem" });
      continue;
    }

    if (kind === "end") {
      markers.push({ key: `m-${i}`, pos: [lat, lng], icon: icons.endIcon, label: p?.name || "Retorno" });
      continue;
    }

    deliveryIndex += 1;
    const isDone = deliveryIndex <= done || status === "FINALIZADA" || status === "ENCERRADA";

    markers.push({
      key: `m-${i}`,
      pos: [lat, lng],
      icon: icons.stopIcon(deliveryIndex, isDone),
      label: `${p?.name || "Entrega"} (${deliveryIndex}/${total || "—"})`,
    });
  }

  return (
    <>
      {markers.map((m) => (
        <Marker key={m.key} position={m.pos} icon={m.icon}>
          <LeafTooltip direction="top" sticky>
            <div style={{ fontWeight: 900 }}>{m.label}</div>
            <div style={{ opacity: 0.9 }}>{trip?.id}</div>
          </LeafTooltip>
        </Marker>
      ))}
    </>
  );
}

/* =========================
   MAIN PAGE
   ========================= */
export default function ProjecaoPage() {
  const [tab, setTab] = useState("home"); // home | viagens
  const [selectedTrip, setSelectedTrip] = useState(null);

  // filtros
  const [dtIni, setDtIni] = useState("");
  const [dtFim, setDtFim] = useState("");
  const [status, setStatus] = useState("TODOS");
  const [rota, setRota] = useState("");
  const [veiculo, setVeiculo] = useState("");

  // hover em rota (mapa macro)
  const [hoverTripId, setHoverTripId] = useState(null);

  const [trips] = useState(() => buildFakeTrips());

  // cache das polylines OSRM
  const [routeCache, setRouteCache] = useState({}); // { [tripId]: latlng[] }

  // trips visíveis (sem cancelada)
  const visibleTrips = useMemo(() => {
    const out = [];
    for (let i = 0; i < trips.length; i++) {
      const t = trips[i];
      const st = String(t?.status || "").toUpperCase();
      if (st === "CANCELADA") continue;
      out.push(t);
    }
    return out;
  }, [trips]);

  // aplica filtros (lista e KPIs)
  const filteredTrips = useMemo(() => {
    const out = [];

    const iniMs = dtIni ? new Date(dtIni + "T00:00:00").getTime() : null;
    const fimMs = dtFim ? new Date(dtFim + "T23:59:59").getTime() : null;

    for (let i = 0; i < visibleTrips.length; i++) {
      const t = visibleTrips[i];

      // status
      const st = String(t?.status || "").toUpperCase();
      if (status !== "TODOS" && st !== status) continue;

      // rota
      if (rota.trim()) {
        const q = rota.trim().toLowerCase();
        const txt = String(t?.rota || "").toLowerCase();
        if (!txt.includes(q)) continue;
      }

      // veiculo
      if (veiculo.trim()) {
        const q = veiculo.trim().toLowerCase();
        const txt = String(t?.placa || "").toLowerCase();
        if (!txt.includes(q)) continue;
      }

      // data (inicioPrevisto)
      if (iniMs || fimMs) {
        const dt = t?.inicioPrevisto ? new Date(t.inicioPrevisto).getTime() : 0;
        if (iniMs && dt < iniMs) continue;
        if (fimMs && dt > fimMs) continue;
      }

      out.push(t);
    }

    return out;
  }, [visibleTrips, dtIni, dtFim, status, rota, veiculo]);

  // ✅ Home precisa mostrar TODAS EM_ANDAMENTO (mas ainda respeita data/rota/veiculo)
  // Então: usamos os filtros de data/rota/veiculo, ignorando status filter
  const runningTripsForHome = useMemo(() => {
    const out = [];

    const iniMs = dtIni ? new Date(dtIni + "T00:00:00").getTime() : null;
    const fimMs = dtFim ? new Date(dtFim + "T23:59:59").getTime() : null;

    for (let i = 0; i < visibleTrips.length; i++) {
      const t = visibleTrips[i];
      const st = String(t?.status || "").toUpperCase();
      if (st !== "EM_ANDAMENTO") continue;

      // rota
      if (rota.trim()) {
        const q = rota.trim().toLowerCase();
        const txt = String(t?.rota || "").toLowerCase();
        if (!txt.includes(q)) continue;
      }

      // veiculo
      if (veiculo.trim()) {
        const q = veiculo.trim().toLowerCase();
        const txt = String(t?.placa || "").toLowerCase();
        if (!txt.includes(q)) continue;
      }

      // data
      if (iniMs || fimMs) {
        const dt = t?.inicioPrevisto ? new Date(t.inicioPrevisto).getTime() : 0;
        if (iniMs && dt < iniMs) continue;
        if (fimMs && dt > fimMs) continue;
      }

      out.push(t);
    }

    return out;
  }, [visibleTrips, dtIni, dtFim, rota, veiculo]);

  // KPIs (cards com cores + ícones)
  const kpis = useMemo(() => {
    let total = 0;
    let emAndamento = 0;
    let programadas = 0;
    let finalizadas = 0;

    for (let i = 0; i < filteredTrips.length; i++) {
      const st = String(filteredTrips[i]?.status || "").toUpperCase();
      total += 1;
      if (st === "EM_ANDAMENTO") emAndamento += 1;
      if (st === "PROGRAMADA") programadas += 1;
      if (st === "FINALIZADA" || st === "ENCERRADA") finalizadas += 1;
    }

    return { total, emAndamento, programadas, finalizadas };
  }, [filteredTrips]);

  const ensureRoute = useCallback(
    async (trip) => {
      if (!trip?.id) return;
      if (routeCache[trip.id]) return;

      const pts = Array.isArray(trip.points) ? trip.points : [];
      if (pts.length < 2) return;

      try {
        const poly = await fetchOsrmPolylineLatLng(pts);
        if (poly && poly.length) {
          setRouteCache((prev) => ({ ...prev, [trip.id]: poly }));
          return;
        }
      } catch {
        // fallback abaixo
      }

      // fallback linha reta
      const fallback = [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const lat = Number(p?.lat);
        const lng = Number(p?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        fallback.push([lat, lng]);
      }
      if (fallback.length >= 2) {
        setRouteCache((prev) => ({ ...prev, [trip.id]: fallback }));
      }
    },
    [routeCache],
  );

  // pré-carrega rotas pro mapa macro (Home)
  useEffect(() => {
    (async () => {
      for (let i = 0; i < runningTripsForHome.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await ensureRoute(runningTripsForHome[i]);
      }
    })();
  }, [runningTripsForHome, ensureRoute]);

  // garante rota no detalhe
  useEffect(() => {
    (async () => {
      if (!selectedTrip) return;
      await ensureRoute(selectedTrip);
    })();
  }, [selectedTrip, ensureRoute]);

  const homePolylines = useMemo(() => {
    const out = [];
    for (let i = 0; i < runningTripsForHome.length; i++) {
      const t = runningTripsForHome[i];
      const poly = routeCache[t.id] || null;
      if (!poly || poly.length < 2) continue;
      out.push({ trip: t, poly, color: pickBlue(i) });
    }
    return out;
  }, [runningTripsForHome, routeCache]);

  const detailPolyline = useMemo(() => {
    if (!selectedTrip) return null;
    const poly = routeCache[selectedTrip.id] || null;
    if (!poly || poly.length < 2) return null;
    return poly;
  }, [selectedTrip, routeCache]);

  const openTripDetail = useCallback((t) => {
    setSelectedTrip(t);
    setTab("viagens");
  }, []);

  const isDetail = !!selectedTrip;

  return (
    <Page>
      <NavBar />

      <TitleBar>
        <H1>Portal do Cliente</H1>

        <TabsRow>
          <TabBtn
            $active={tab === "home"}
            onClick={() => {
              setSelectedTrip(null);
              setTab("home");
            }}
          >
            <FaChartPie /> Home
          </TabBtn>

          <TabBtn
            $active={tab === "viagens"}
            onClick={() => {
              setSelectedTrip(null);
              setTab("viagens");
            }}
          >
            <FaRoute /> Viagens
          </TabBtn>
        </TabsRow>
      </TitleBar>

      {/* =========================
          HOME
         ========================= */}
      {tab === "home" ? (
        <>
          <Section>
            <FiltersRow>
              <FilterGroup>
                <Label>
                  <FaCalendarDays /> Data início
                </Label>
                <Input type="date" value={dtIni} onChange={(e) => setDtIni(e.target.value)} />
              </FilterGroup>

              <FilterGroup>
                <Label>
                  <FaCalendarDays /> Data fim
                </Label>
                <Input type="date" value={dtFim} onChange={(e) => setDtFim(e.target.value)} />
              </FilterGroup>

              <FilterGroup>
                <Label>
                  <FaFilter /> Status
                </Label>
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="TODOS">Todos</option>
                  <option value="PROGRAMADA">Programada</option>
                  <option value="EM_ANDAMENTO">Em andamento</option>
                  <option value="FINALIZADA">Finalizada</option>
                  <option value="ENCERRADA">Encerrada</option>
                </Select>
              </FilterGroup>

              <FilterGroup>
                <Label>
                  <FaRoute /> Rota
                </Label>
                <Input placeholder="Ex: Campinas" value={rota} onChange={(e) => setRota(e.target.value)} />
              </FilterGroup>

              <FilterGroup>
                <Label>
                  <FaTruck /> Veículo (placa)
                </Label>
                <Input placeholder="Ex: FTR" value={veiculo} onChange={(e) => setVeiculo(e.target.value)} />
              </FilterGroup>
            </FiltersRow>

            <InfoGrid>
              <InfoItem $variant="neutral">
                <KpiTitle>
                  <FaLayerGroup /> Total de viagens
                </KpiTitle>
                <KpiValue>{kpis.total}</KpiValue>
              </InfoItem>

              <InfoItem $variant="run">
                <KpiTitle>
                  <FaTruckFast /> Em andamento
                </KpiTitle>
                <KpiValue>{kpis.emAndamento}</KpiValue>
              </InfoItem>

              <InfoItem $variant="prog">
                <KpiTitle>
                  <FaClipboardList /> Programadas
                </KpiTitle>
                <KpiValue>{kpis.programadas}</KpiValue>
              </InfoItem>

              <InfoItem $variant="done">
                <KpiTitle>
                  <FaCircleCheck /> Finalizadas
                </KpiTitle>
                <KpiValue>{kpis.finalizadas}</KpiValue>
              </InfoItem>
            </InfoGrid>
          </Section>

          <Section style={{ marginTop: 14 }}>
            <MapHeader>
              <MapTitle>
                <FaRoute /> Mapa macro (todas em andamento)
              </MapTitle>
              <Muted>Hover na rota: motorista/placa/início/viagem • Clique: abre detalhe</Muted>
            </MapHeader>

            <LegendRow>
              {homePolylines.map((x) => (
                <LegendPill key={x.trip.id}>
                  <LegendDot style={{ background: x.color }} />
                  <span>{x.trip.id}</span>
                </LegendPill>
              ))}
              {!homePolylines.length ? (
                <Muted style={{ marginLeft: 6 }}>Nenhuma viagem em andamento para esse filtro.</Muted>
              ) : null}
            </LegendRow>

            <MapWrap>
              <MapContainer center={[-23.55052, -46.633308]} zoom={10} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {homePolylines.map((x, idx) => {
                  const isHover = hoverTripId === x.trip.id;
                  const anyHover = !!hoverTripId;
                  const opacity = anyHover && !isHover ? 0.12 : isHover ? 0.95 : 0.75;
                  const weight = anyHover && isHover ? 6 : anyHover ? 4 : 5;

                  return (
                    <Polyline
                      key={x.trip.id}
                      positions={x.poly}
                      pathOptions={{
                        color: x.color,
                        opacity,
                        weight,
                        lineCap: "round",
                        lineJoin: "round",
                      }}
                      eventHandlers={{
                        mouseover: () => setHoverTripId(x.trip.id),
                        mouseout: () => setHoverTripId(null),
                        click: () => openTripDetail(x.trip),
                      }}
                    >
                      <LeafTooltip sticky direction="top">
                        <div style={{ fontWeight: 1000 }}>
                          {x.trip.motorista} • {x.trip.placa}
                        </div>
                        <div>
                          Viagem: <b>{x.trip.id}</b>
                        </div>
                        <div>
                          Início: <b>{fmtDt(x.trip.inicioReal || x.trip.inicioPrevisto)}</b>
                        </div>
                        <div style={{ opacity: 0.9 }}>{x.trip.rota}</div>
                      </LeafTooltip>
                    </Polyline>
                  );
                })}

                {/* pontos de entrega (markers) */}
                {runningTripsForHome.map((t) => (
                  <TripMarkers key={`mk-${t.id}`} trip={t} />
                ))}

                {homePolylines.length ? (
                  <FitToPolyline
                    positions={(() => {
                      const all = [];
                      for (let i = 0; i < homePolylines.length; i++) {
                        const poly = homePolylines[i].poly;
                        for (let j = 0; j < poly.length; j++) all.push(poly[j]);
                      }
                      return all;
                    })()}
                  />
                ) : null}
              </MapContainer>
            </MapWrap>
          </Section>
        </>
      ) : null}

      {/* =========================
          VIAGENS
         ========================= */}
      {tab === "viagens" ? (
        <>
          {!isDetail ? (
            <Section>
              <MapHeader>
                <MapTitle>
                  <FaTruck /> Viagens
                </MapTitle>
                <Muted>Cards por status • Clique para abrir</Muted>
              </MapHeader>

              <FiltersRow style={{ marginTop: 10 }}>
                <FilterGroup>
                  <Label>
                    <FaCalendarDays /> Data início
                  </Label>
                  <Input type="date" value={dtIni} onChange={(e) => setDtIni(e.target.value)} />
                </FilterGroup>

                <FilterGroup>
                  <Label>
                    <FaCalendarDays /> Data fim
                  </Label>
                  <Input type="date" value={dtFim} onChange={(e) => setDtFim(e.target.value)} />
                </FilterGroup>

                <FilterGroup>
                  <Label>
                    <FaFilter /> Status
                  </Label>
                  <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="TODOS">Todos</option>
                    <option value="PROGRAMADA">Programada</option>
                    <option value="EM_ANDAMENTO">Em andamento</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="ENCERRADA">Encerrada</option>
                  </Select>
                </FilterGroup>

                <FilterGroup>
                  <Label>
                    <FaRoute /> Rota
                  </Label>
                  <Input placeholder="Ex: Osasco" value={rota} onChange={(e) => setRota(e.target.value)} />
                </FilterGroup>

                <FilterGroup>
                  <Label>
                    <FaTruck /> Veículo (placa)
                  </Label>
                  <Input placeholder="Ex: KLM" value={veiculo} onChange={(e) => setVeiculo(e.target.value)} />
                </FilterGroup>
              </FiltersRow>

              <CardGrid>
                {filteredTrips.map((t) => {
                  const st = String(t.status || "").toUpperCase();
                  return (
                    <TripCard
                      key={t.id}
                      $variant={statusVariant(st)}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTrip(t)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setSelectedTrip(t);
                      }}
                      title="Clique para ver detalhes"
                    >
                      <TripTop>
                        <TripLeft>
                          <TripTitle>
                            <FaTruck /> Viagem {t.id}
                          </TripTitle>

                          <TripSub>
                            <span>
                              Motorista: <b>{t.motorista}</b>
                            </span>
                            <span>
                              Placa: <b>{t.placa}</b>
                            </span>
                          </TripSub>

                          <TripSub style={{ opacity: 0.9 }}>
                            Rota: <b>{t.rota}</b>
                          </TripSub>
                        </TripLeft>

                        <StatusPill $variant={statusVariant(st)}>{statusLabel(st)}</StatusPill>
                      </TripTop>

                      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <Muted>
                          <FaCalendarDays /> Prev.: <b>{fmtDt(t.inicioPrevisto)}</b>
                        </Muted>
                        <Muted>
                          Entregas: <b>{t.entregasConcluidas}/{t.entregasTotal}</b>
                        </Muted>
                        <Muted>
                          <FaBarcode /> CTEs: <b>{Array.isArray(t.ctes) ? t.ctes.length : 0}</b>
                        </Muted>
                      </div>
                    </TripCard>
                  );
                })}
              </CardGrid>

              {!filteredTrips.length ? <div style={{ marginTop: 10, opacity: 0.75 }}>Nenhuma viagem para esse filtro.</div> : null}
            </Section>
          ) : (
            <>
              <Section>
                <DetailHeader>
                  <BackBtn onClick={() => setSelectedTrip(null)} title="Voltar">
                    <FaArrowLeft /> Voltar
                  </BackBtn>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <MapTitle style={{ margin: 0 }}>
                      <FaTruck /> Viagem {selectedTrip.id}
                    </MapTitle>
                    <StatusPill $variant={statusVariant(selectedTrip.status)}>{statusLabel(selectedTrip.status)}</StatusPill>
                  </div>
                </DetailHeader>

                <DetailGrid>
                  <DetailBox>
                    <small>Manifesto</small>
                    <div>{selectedTrip.manifesto}</div>
                  </DetailBox>
                  <DetailBox>
                    <small>Motorista</small>
                    <div>{selectedTrip.motorista}</div>
                  </DetailBox>
                  <DetailBox>
                    <small>Placa</small>
                    <div>{selectedTrip.placa}</div>
                  </DetailBox>
                  <DetailBox>
                    <small>Rota</small>
                    <div>{selectedTrip.rota}</div>
                  </DetailBox>
                  <DetailBox>
                    <small>Início</small>
                    <div>{fmtDt(selectedTrip.inicioReal || selectedTrip.inicioPrevisto)}</div>
                  </DetailBox>
                  <DetailBox>
                    <small>Fim</small>
                    <div>{fmtDt(selectedTrip.fimReal)}</div>
                  </DetailBox>
                  <DetailBox>
                    <small>Entregas</small>
                    <div>{selectedTrip.entregasConcluidas}/{selectedTrip.entregasTotal}</div>
                  </DetailBox>
                  <DetailBox>
                    <small>CTEs</small>
                    <div>{Array.isArray(selectedTrip.ctes) ? selectedTrip.ctes.length : 0}</div>
                  </DetailBox>
                </DetailGrid>
              </Section>

              {/* TIMELINE */}
              <Section style={{ marginTop: 14 }}>
                <MapHeader>
                  <MapTitle>
                    <FaRoad /> Linha do tempo
                  </MapTitle>
                  <Muted>Início → Entregas → Última entrega → Retorno (se encerrada)</Muted>
                </MapHeader>
                <Timeline trip={selectedTrip} />
              </Section>

              {/* CTEs */}
              <Section style={{ marginTop: 14 }}>
                <MapHeader>
                  <MapTitle>
                    <FaBarcode /> CTEs da viagem
                  </MapTitle>
                  <Muted>Dados fictícios (chumbado)</Muted>
                </MapHeader>

                <TableWrap>
                  <Table>
                    <thead>
                      <tr>
                        <Th>CTE</Th>
                        <Th>NF</Th>
                        <Th>Cliente</Th>
                        <Th>Volumes</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(selectedTrip.ctes) && selectedTrip.ctes.length ? (
                        selectedTrip.ctes.map((c, idx) => (
                          <tr key={`${c.cte}-${idx}`}>
                            <Td title={c.cte}>{String(c.cte).slice(0, 18)}...</Td>
                            <Td>{c.nf}</Td>
                            <Td>{c.cliente}</Td>
                            <Td>
                              <Pill>{c.volumes}</Pill>
                            </Td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <Td colSpan={4} style={{ opacity: 0.75 }}>
                            Sem CTEs cadastrados nessa viagem.
                          </Td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </TableWrap>
              </Section>

              {/* MAPA DETALHE */}
              <Section style={{ marginTop: 14 }}>
                <MapHeader>
                  <MapTitle>
                    <FaRoute /> Mapa da rota
                  </MapTitle>
                  <Muted>Rota via OSRM (seguindo ruas) + pontos numerados</Muted>
                </MapHeader>

                <MapWrap style={{ height: 420 }}>
                  <MapContainer center={[-23.55052, -46.633308]} zoom={10} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
                    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {detailPolyline ? (
                      <>
                        <Polyline
                          positions={detailPolyline}
                          pathOptions={{
                            color: "#2563eb",
                            opacity: 0.9,
                            weight: 6,
                            lineCap: "round",
                            lineJoin: "round",
                          }}
                        >
                          <LeafTooltip sticky direction="top">
                            <div style={{ fontWeight: 1000 }}>
                              {selectedTrip.motorista} • {selectedTrip.placa}
                            </div>
                            <div>
                              Viagem: <b>{selectedTrip.id}</b>
                            </div>
                            <div>
                              Início: <b>{fmtDt(selectedTrip.inicioReal || selectedTrip.inicioPrevisto)}</b>
                            </div>
                          </LeafTooltip>
                        </Polyline>

                        <FitToPolyline positions={detailPolyline} />
                      </>
                    ) : null}

                    <TripMarkers trip={selectedTrip} />
                  </MapContainer>
                </MapWrap>
              </Section>
            </>
          )}
        </>
      ) : null}
    </Page>
  );
}

/* =========================
   TIMELINE COMPONENT
   ========================= */
function Timeline({ trip }) {
  const { steps, completedCount } = useMemo(() => buildTimeline(trip), [trip]);

  return (
    <StepperWrap>
      <StepperRow>
        {steps.map((s, idx) => {
          const isDone = idx < completedCount;
          const isActive = idx === completedCount && completedCount < steps.length;

          return (
            <React.Fragment key={s.key}>
              <StepItem>
                <StepDot $done={isDone} $active={isActive}>
                  {isDone ? <FaCircleCheck /> : isActive ? <FaCircleDot /> : s.icon}
                </StepDot>
                <StepLabel $done={isDone} $active={isActive}>
                  {s.label}
                </StepLabel>
              </StepItem>

              {idx < steps.length - 1 ? <StepLine $done={idx < completedCount - 1} /> : null}
            </React.Fragment>
          );
        })}
      </StepperRow>
    </StepperWrap>
  );
}
