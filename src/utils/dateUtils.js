// dateUtils.js
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const getPrazoEntregaStatus = (prevE) => {
  if (!prevE) return null;

  const hoje = dayjs().startOf("day");

  const formatosPossiveis = ["DD/MM/YYYY", "YYYY-MM-DD"];
  let dataEntrega = null;

  for (let formato of formatosPossiveis) {
    const tentativa = dayjs(prevE, formato, true);
    if (tentativa.isValid()) {
      dataEntrega = tentativa;
      break;
    }
  }

  if (!dataEntrega) return null;

  const diff = dataEntrega.diff(hoje, "day");

  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === 2) return "inTwoDays";
  if (diff === 3) return "inThreeDays";
  if (diff < 0) return "overdue";

  return null;
};




// Retorna intervalo de datas com base em filtro selecionado
// utils/dateUtils.js
const formatDateToDDMMYYYY = (date) => {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

export const getDateRangeFromFilter = (filterKey) => {
  const hoje = new Date();
  let dataInicial, dataFinal;

  switch (filterKey) {
    case "last7Days":
      dataFinal = new Date(hoje);
      dataInicial = new Date();
      dataInicial.setDate(hoje.getDate() - 6);
      break;
    case "last30Days":
      dataFinal = new Date(hoje);
      dataInicial = new Date();
      dataInicial.setDate(hoje.getDate() - 29);
      break;
    case "currentMonth":
    default:
      dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      dataFinal = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      break;
  }

  return {
    dataInicial: formatDateToDDMMYYYY(dataInicial),
    dataFinal: formatDateToDDMMYYYY(dataFinal),
  };
};
