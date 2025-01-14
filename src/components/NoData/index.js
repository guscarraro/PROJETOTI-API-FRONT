import React from "react";

const NoData = ({ message = "Sem Dados para essa informação" }) => (
  <div style={{ textAlign: "center", fontSize: "16px", color: "#666" }}>
    {message}
  </div>
);

export default NoData;
