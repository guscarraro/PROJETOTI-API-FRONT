export const modernTableStyles = {
  thead: {
    position: "sticky",
    top: 0,
    background: "#f8fafc",
    zIndex: 1,
    boxShadow: "inset 0 -1px 0 #e5e7eb",
  },
  th: { whiteSpace: "nowrap", fontWeight: 700, fontSize: 12, color: "#334155" },
  tdMono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
};

export const loteChipStyles = {
  display: "inline-flex",
  padding: "2px 8px",
  borderRadius: 999,
  background: "#eef2ff",
  color: "#3730a3",
  fontSize: 12,
  fontWeight: 600,
  border: "1px solid #c7d2fe",
};

export const occTableStyles = {
  ...modernTableStyles,
  thead: {
    position: "sticky",
    top: 0,
    background: "#fff7ed",
    zIndex: 1,
    boxShadow: "inset 0 -1px 0 #fdba74",
  },
  th: { whiteSpace: "nowrap", fontWeight: 800, fontSize: 12, color: "#9a3412" },
  rowBg: "rgba(251, 146, 60, .08)",
};
