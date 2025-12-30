// src/pages/.../Analise_Performaxxi/charts/ChartMotoristasViagensErros.js
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = {
  viagens: "#22d3ee",
  gravissimo: "#ef4444",
  sla: "#fb7185",
  mercadorias: "#34d399",
  devolucoes: "#60a5fa",
};

function n(v) {
  return Number(v || 0);
}
function safe(v) {
  return v == null || String(v).trim() === "" ? "-" : String(v);
}

export default function ChartMotoristasViagensErros({
  rankings,
  displayCidade,
  metaSlaPct,
  dataIni,
  dataFim,
  usuarioKey,
  onOpenMotoristaModal,
}) {
  const data = useMemo(() => {
    const arr = Array.isArray(rankings?.motoristas_problemas)
      ? rankings.motoristas_problemas
      : [];

    const list = arr.slice();
    list.sort((a, b) => n(b.rotas_total) - n(a.rotas_total)); // viagens desc

    const out = [];
    for (let i = 0; i < list.length; i++) {
      const x = list[i] || {};
      const cd = displayCidade?.(x.usuario_key, x.usuario_label) || "-";

      const grav = n(x.almoco_gravissimo);
      const sla = n(x.erros_sla);
      const merc = n(x.erros_mercadorias);
      const dev = n(x.erros_devolucoes);

      out.push({
        name: safe(x.motorista),
        motorista_full: safe(x.motorista),
        usuario_key: x.usuario_key || "",
        cd,

        viagens: n(x.rotas_total),

        erros_gravissimo: grav,
        erros_sla: sla,
        erros_mercadorias: merc,
        erros_devolucoes: dev,
        erros_total: grav + sla + merc + dev,
      });
    }

    return out;
  }, [rankings, displayCidade]);

  // ✅ até 25 colunas: sem scroll; passou disso: scroll horizontal
  const MAX_SEM_SCROLL = 25;
  const many = data.length > MAX_SEM_SCROLL;

  // ✅ barras maiores (escadas maiores)
  const ITEM_PX = 58;
  const minChartWidth = many ? Math.max(1400, data.length * ITEM_PX) : "100%";

  const angle = many ? -35 : data.length > 18 ? -30 : -15;
  const height = many ? 520 : 480;

  function openModal(bar, eventType) {
    const p = bar?.payload;
    if (!p || !onOpenMotoristaModal) return;

    onOpenMotoristaModal({
      eventType, // "gravissimo" | "sla" | "mercadorias" | "devolucao" | "geral"
      motorista: p.motorista_full,
      cd: p.cd,
      usuario_key: usuarioKey || p.usuario_key || "",
      data_ini: dataIni,
      data_fim: dataFim,
      meta_sla_pct: metaSlaPct,
    });
  }

  const ChartBody = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 12, right: 12, left: 0, bottom: 110 }}
        barSize={34}
        barGap={8}
        barCategoryGap={14}
      >
        <XAxis
          dataKey="name"
          interval={0}
          angle={angle}
          textAnchor="end"
          height={110}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
        />

        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />

        <Tooltip
          contentStyle={{
            background: "#020617",
            border: "1px solid #1f2937",
            borderRadius: 8,
            color: "#e5e7eb",
            fontSize: 12,
          }}
          labelFormatter={(_, payload) => {
            const p = payload?.[0]?.payload;
            if (!p) return "";
            return `${p.motorista_full} • ${p.cd} • viagens: ${p.viagens} • erros: ${p.erros_total}`;
          }}
          formatter={(value, name) => {
            const v = n(value);
            if (name === "Viagens") return [v, "Viagens"];
            if (name === "Gravíssimo") return [v, "Gravíssimo"];
            if (name === "SLA") return [v, `SLA (< ${metaSlaPct}%)`];
            if (name === "Mercadorias") return [v, "Mercadorias (<100%)"];
            if (name === "Devoluções") return [v, "Devoluções"];
            return [v, name];
          }}
        />

        <Legend />

        {/* Barra 1 — Viagens */}
        <Bar
          dataKey="viagens"
          name="Viagens"
          fill={COLORS.viagens}
          radius={[8, 8, 0, 0]}
        />

        {/* ✅ Stack de erros
            Regra do Recharts: último Bar do stack fica no TOPO.
            Então "Gravíssimo" precisa ser o ÚLTIMO. */}

        <Bar
          dataKey="erros_sla"
          name="SLA"
          stackId="erros"
          fill={COLORS.sla}
          style={{ cursor: "pointer" }}
          onClick={(bar) => openModal(bar, "sla")}
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="erros_mercadorias"
          name="Mercadorias"
          stackId="erros"
          fill={COLORS.mercadorias}
          style={{ cursor: "pointer" }}
          onClick={(bar) => openModal(bar, "mercadorias")}
        />
        <Bar
          dataKey="erros_devolucoes"
          name="Devoluções"
          stackId="erros"
          fill={COLORS.devolucoes}
          style={{ cursor: "pointer" }}
          onClick={(bar) => openModal(bar, "devolucao")}
        />

        {/* ✅ Gravíssimo no TOPO (último no stack) */}
        <Bar
          dataKey="erros_gravissimo"
          name="Gravíssimo"
          stackId="erros"
          fill={COLORS.gravissimo}
          style={{ cursor: "pointer" }}
          onClick={(bar) => openModal(bar, "gravissimo")}
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div style={{ width: "100%", height, marginTop: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
        Clique em um pedaço do <b>stack de erros</b> para ver as viagens do motorista.
        {many && (
          <span style={{ marginLeft: 8, opacity: 0.85 }}>
            (scroll horizontal — {data.length} motoristas • até {MAX_SEM_SCROLL} sem scroll)
          </span>
        )}
      </div>

      {many ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: 8,
          }}
        >
          <div style={{ width: minChartWidth, height: "100%" }}>{ChartBody}</div>
        </div>
      ) : (
        <div style={{ width: "100%", height: "100%" }}>{ChartBody}</div>
      )}
    </div>
  );
}
