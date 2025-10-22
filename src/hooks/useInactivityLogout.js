// src/hooks/useInactivityLogout.js
import { useEffect, useRef } from "react";

/**
 * useInactivityLogout
 * Dispara onTimeout() após timeoutMs sem nenhuma interação do usuário.
 * Opcionalmente dispara onWarning() warningMs antes do timeout.
 *
 * @param {Object} opts
 * @param {number} opts.timeoutMs   - tempo total de inatividade (ex.: 25*60*1000)
 * @param {number} [opts.warningMs] - aviso antes do timeout (ex.: 60*1000). Opcional.
 * @param {Function} opts.onTimeout - callback obrigatório (ex.: logout + redirect)
 * @param {Function} [opts.onWarning] - callback opcional (ex.: abrir modal)
 */
export function useInactivityLogout({
  timeoutMs = 600 * 60 * 1000,
  warningMs = 0,
  onTimeout,
  onWarning,
}) {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  function clearTimers() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      window.clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }

  function startTimers() {
    clearTimers();

    // Aviso opcional antes do timeout
    if (onWarning && warningMs > 0 && warningMs < timeoutMs) {
      warningRef.current = window.setTimeout(() => {
        // só avisa se a aba estiver visível
        if (typeof document !== "undefined" && !document.hidden) {
          try { onWarning(); } catch {}
        }
      }, timeoutMs - warningMs);
    }

    // Timeout final
    timeoutRef.current = window.setTimeout(() => {
      // só executa se a aba estiver visível
      if (typeof document !== "undefined" && !document.hidden) {
        try { onTimeout(); } catch {}
      }
    }, timeoutMs);
  }

  function resetTimers() {
    // evita resetar quando a aba está oculta e eventos de SO disparam "scroll"/"visibilitychange"
    if (typeof document !== "undefined" && document.hidden) return;
    startTimers();
  }

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safety

    startTimers();

    const events = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
      "visibilitychange",
    ];

    for (let i = 0; i < events.length; i++) {
      window.addEventListener(events[i], resetTimers, { passive: true });
    }

    return () => {
      clearTimers();
      for (let i = 0; i < events.length; i++) {
        window.removeEventListener(events[i], resetTimers);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutMs, warningMs, onTimeout, onWarning]);
}
