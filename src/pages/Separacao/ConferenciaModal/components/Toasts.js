import React from "react";

export default function Toasts({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 2000,
        display: "grid",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background:
              t.tone === "error"
                ? "#fee2e2"
                : t.tone === "warn"
                ? "#fef9c3"
                : "#e0f2fe",
            color: "#111827",
            border: "1px solid rgba(0,0,0,.08)",
            borderLeft: `4px solid ${
              t.tone === "error"
                ? "#ef4444"
                : t.tone === "warn"
                ? "#f59e0b"
                : "#38bdf8"
            }`,
            padding: "8px 10px",
            borderRadius: 10,
            boxShadow: "0 6px 20px rgba(0,0,0,.12)",
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
