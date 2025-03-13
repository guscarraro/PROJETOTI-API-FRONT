import React from "react";
import { FaCheckCircle, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { Table, TableRow, TableCell, TableHeader, ActionButton } from "../style";

const TableCTE = ({ ctes, removerCTE, tabelaCustosFrete }) => {
    console.log(ctes)
  return (
    <>
      {ctes.length > 0 ? (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>CTE</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Receita</TableHeader>
              <TableHeader>Qtd NF</TableHeader>
              <TableHeader>Prazo de Entrega</TableHeader>
              <TableHeader>Peso Total</TableHeader>
              <TableHeader>Volume</TableHeader>
              <TableHeader>Cidade</TableHeader>
              <TableHeader>KM</TableHeader>
              <TableHeader>Filial Origem</TableHeader>
              <TableHeader>Filial Destino</TableHeader>
              <TableHeader>Ações</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {ctes.map((cte, index) => (
              <TableRow key={index}>
                <TableCell>
                  <FaCheckCircle style={{ color: "green" }} /> <strong>{cte.numero_cte}</strong>
                </TableCell>
                <TableCell>{cte.tomador}</TableCell>
                <TableCell>R$ {cte.valor_receita_total.toFixed(2)}</TableCell>
                <TableCell>{cte.nfs.length}</TableCell>
                <TableCell>
                  {cte.agendamento ? (
                    <span style={{ backgroundColor: "#007bff", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "15px", width: "100%" }}>
                      {cte.agendamento} Agendado
                    </span>
                  ) : (
                    cte.prazo_entrega
                  )}
                </TableCell>
                <TableCell>{cte.peso_total} kg</TableCell>
                <TableCell>{cte.volume}</TableCell>
                <TableCell>{cte.cidade}</TableCell>
                <TableCell>{tabelaCustosFrete.find(item => item.destino.trim().toUpperCase() === cte.cidade.trim().toUpperCase())?.distancia_km || '-'}</TableCell>
                <TableCell>{cte.filialOrigem}</TableCell>
                <TableCell>{cte.filialDestino}</TableCell>
                <TableCell>
                  <ActionButton
                    style={{ background: "red", color: "#fff", borderRadius: "5px" }}
                    onClick={() => removerCTE(index)}
                  >
                    <FaTrash size={16} />
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            padding: "20px",
            color: "#fff",
            borderRadius: "12px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
            textAlign: "center",
          }}
        >
          <FaExclamationTriangle size={40} color="#FF9800" style={{ marginBottom: "10px" }} />
          <h4 style={{ color: "#fff", fontWeight: "bold", marginBottom: "5px" }}>
            Nenhum registro encontrado
          </h4>
          <p style={{ color: "#fff", fontSize: "14px" }}>
            Adicione um CTE para visualizar os cálculos.
          </p>
        </div>
      )}
    </>
  );
};

export default TableCTE;
