export const formatarDataHora = (dataHora) => {
  if (!dataHora) return "Indisponível";
  const d = new Date(dataHora);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ehNumeroCobranca = (v) => /^\d+$/.test((v ?? "").trim());

// 🔸 tenta vários campos para “destinatário”
export const getDestinatarioFromRow = (row) =>
  row?.destinatario ?? row?.destino ?? row?.tomador ?? row?.praça_destino ?? row?.praca_destino ?? "";


export const calcPermanenciaMin = (inclusao, saida) => {
  if (!inclusao || !saida) return null;
  const dInicio = new Date(inclusao);
  const dFim = new Date(saida);
  if (isNaN(dInicio) || isNaN(dFim)) return null;
  const ms = dFim - dInicio; // saida - inclusao
  if (ms < 0) return null;
  return Math.floor(ms / 60000);
};

// Formata minutos para "HH:MM"
export const formatHHMM = (min) => {
  if (min == null) return "Indisponivel";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};