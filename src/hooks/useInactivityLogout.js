import { useEffect, useRef } from "react";

export function useInactivityLogout({
  timeoutMs = 20 * 60 * 1000, // ✅ 20 minutos (antes estava gigantesco)
  warningMs = 0,
  onTimeout,
  onWarning,
}) {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  // ✅ evita re-criar listeners/timers por causa de função inline mudando
  const onTimeoutRef = useRef(onTimeout);
  const onWarningRef = useRef(onWarning);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    onWarningRef.current = onWarning;
  }, [onTimeout, onWarning]);

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

    if (onWarningRef.current && warningMs > 0 && warningMs < timeoutMs) {
      warningRef.current = window.setTimeout(() => {
        if (typeof document !== "undefined" && !document.hidden) {
          try {
            onWarningRef.current?.();
          } catch {}
        }
      }, timeoutMs - warningMs);
    }

    timeoutRef.current = window.setTimeout(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        try {
          onTimeoutRef.current?.();
        } catch {}
      }
    }, timeoutMs);
  }

  function resetTimers() {
    if (typeof document !== "undefined" && document.hidden) return;
    startTimers();
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

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
    // ✅ aqui só depende dos números; callbacks ficam em ref
  }, [timeoutMs, warningMs]);
}
