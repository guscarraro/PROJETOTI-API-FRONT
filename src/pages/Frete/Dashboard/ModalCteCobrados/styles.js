export const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

// 🔸 modal mais “comprido” (mais alto e mais largo)
export const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  minWidth: 1100,
  maxWidth: 1600,
  width: "96vw",
  maxHeight: "92vh",
  overflowY: "auto",
  color: "black",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

export const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

export const blocoStyle = {
  border: "1px solid #e8e8e8",
  borderRadius: 10,
  padding: 12,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

export const tableWrapperStyle = {
  maxHeight: 360,         // 🔸 limite de altura da tabela
  overflowY: "auto",      // 🔸 scroll vertical
  overflowX: "auto",
  border: "1px solid #eee",
  borderRadius: 8,
};

export const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
};

export const stickyThStyle = {
  position: "sticky",     // 🔸 header “grudado”
  top: 0,
  zIndex: 1,
  background: "#f5f5f5",
};

export const cellStyle = {
  border: "1px solid #eee",
  padding: "8px",
  textAlign: "center",
  wordBreak: "break-word",
};
