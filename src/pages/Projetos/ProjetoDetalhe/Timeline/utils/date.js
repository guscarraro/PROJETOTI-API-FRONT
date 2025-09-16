// pages/ProjetoDetalhe/Timeline/utils/date.js
export const toLocalDate = (iso) => new Date(`${iso}T00:00:00`);
export const isWeekendLocal = (iso) => {
  const d = toLocalDate(iso);
  const dow = d.getDay();
  return dow === 0 || dow === 6;
};
