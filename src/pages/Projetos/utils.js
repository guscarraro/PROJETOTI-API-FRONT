export const formatDate = (d) => new Date(d).toISOString().slice(0,10);


export const rangeDays = (startISO, endISO) => {
const start = new Date(startISO);
const end = new Date(endISO);
const days = [];
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
days.push(formatDate(d));
}
return days;
};


export const isWeekend = (iso) => {
const d = new Date(iso).getDay();
return d === 0 || d === 6; // domingo(0) ou sábado(6)
};


export const currencyBRL = (v) =>
(v === undefined || v === null || v === "") ? "" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });


export const STATUS = {
  ANDAMENTO: "Em Andamento",
  STANDBY: "Stand by",
  CANCELADO: "Cancelado",
  CONCLUIDO: "Concluído",
};
export const statusLabel = (k) => STATUS[k] || k;
