import React from "react";
import ChartCteCobrado from "../ChartCteCobrado"; // ajuste o caminho se necessário
import SubTable from "../SubTable";
import { blocoStyle } from "../styles";

const Bloco = ({ titulo, data, serie }) => {
  return (
    <div style={blocoStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <h5 style={{ margin: 0 }}>{titulo}</h5>
        <small style={{ opacity: 0.8 }}>Total: {data.length}</small>
      </div>

      <div style={{ marginBottom: 12 }}>
        <ChartCteCobrado data={serie.slice(0, 7)} />
      </div>

      <SubTable rows={data} />
    </div>
  );
};

export default Bloco;
