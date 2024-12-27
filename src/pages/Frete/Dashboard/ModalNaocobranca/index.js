import React from "react";
import { Button } from "reactstrap";
import ChartClientesAtrasos from "./ChartClientesAtrasos";
import ChartDestinatariosAtrasos from "./ChartDestinatariosAtrasos";

const ModalNaoCobranca = ({ data, onClose }) => {
  // Função para calcular o tempo de permanência
  const calcularTempoPermanencia = (chegada, saida) => {
    const chegadaDate = new Date(chegada);
    const saidaDate = new Date(saida);

    if (!chegadaDate || !saidaDate || chegadaDate > saidaDate) {
      return "Indisponível";
    }

    const diffMs = saidaDate - chegadaDate; // diferença em milissegundos
    const diffMin = Math.floor(diffMs / 60000); // converter para minutos
    const horas = Math.floor(diffMin / 60);
    const minutos = diffMin % 60;

    return `${horas}h ${minutos}min`;
  };

  // Prepara os dados para os gráficos
  const clientesAtrasos = [...data.reduce((acc, item) => {
    if (!acc.has(item.cliente)) {
      acc.set(item.cliente, 0);
    }
    acc.set(item.cliente, acc.get(item.cliente) + 1);
    return acc;
  }, new Map())].map(([name, quantidade]) => ({ name, quantidade }));

  const destinatariosAtrasos = [...data.reduce((acc, item) => {
    if (!acc.has(item.destinatario)) {
      acc.set(item.destinatario, 0);
    }
    acc.set(item.destinatario, acc.get(item.destinatario) + 1);
    return acc;
  }, new Map())].map(([name, quantidade]) => ({ name, quantidade }));

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          minWidth: 600,
          maxHeight: "80vh",
          overflowY: "auto",
          color: "black",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h4>Ocorrências Sem Cobrança Adicional</h4>
        
        {/* Gráfico de Clientes */}
        <div style={{ marginBottom: 20 }}>
          <h5>Top 7 Clientes com Mais Atrasos</h5>
          <ChartClientesAtrasos data={clientesAtrasos.slice(0, 7)} />
        </div>

        {/* Gráfico de Destinatários */}
        {/* <div style={{ marginBottom: 20 }}>
          <h5>Top 7 Destinatários com Mais Atrasos</h5>
          <ChartDestinatariosAtrasos data={destinatariosAtrasos.slice(0, 7)} />
        </div> */}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 20,
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={cellStyle}>Nota</th>
              <th style={cellStyle}>Cliente</th>
              <th style={cellStyle}>Hora de Chegada</th>
              <th style={cellStyle}>Hora de Saída</th>
              <th style={cellStyle}>Tempo de Permanência</th>
              <th style={cellStyle}>Motorista</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td style={cellStyle}>{item.nf}</td>
                <td style={cellStyle}>{item.cliente}</td>
                <td style={cellStyle}>
                  {new Date(item.horario_chegada).toLocaleTimeString()}
                </td>
                <td style={cellStyle}>
                  {new Date(item.horario_saida).toLocaleTimeString()}
                </td>
                <td style={cellStyle}>
                  {calcularTempoPermanencia(item.horario_chegada, item.horario_saida)}
                </td>
                <td style={cellStyle}>{item.motorista}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Button color="secondary" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

const cellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
};

export default ModalNaoCobranca;
