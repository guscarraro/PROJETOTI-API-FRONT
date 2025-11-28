import React from "react";

export default function BadgeSoft({ children, title }) {
  return (
    <div
      title={title}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: "rgba(148,163,184,.18)",
        color: "var(--badge-fg,#0f172a)",
        border: "1px solid rgba(148,163,184,.35)",
      }}
    >
      {children}
    </div>
  );
}
