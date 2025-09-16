// pages/ProjetoDetalhe/Timeline/hooks/useMonthsSegments.js
import { useMemo } from "react";
import { toLocalDate } from "../utils/date";
import { monthNames } from "../constants";

export default function useMonthsSegments(days) {
  return useMemo(() => {
    const segs = [];
    if (!days?.length) return segs;

    let currentKey = null, span = 0, label = "";
    const push = () => { if (span > 0) segs.push({ key: currentKey, span, label }); };

    for (let i = 0; i < days.length; i++) {
      const iso = days[i];
      const d = toLocalDate(iso);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (k !== currentKey) {
        push();
        currentKey = k;
        span = 1;
        label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      } else {
        span = span + 1;
      }
    }
    push();
    return segs;
  }, [days]);
}
