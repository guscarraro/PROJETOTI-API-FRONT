import React from "react";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
  ActionButton,
} from "../style";

const TableCTE = ({ ctes, removerCTE, tabelaCustosFrete }) => {
  console.log(ctes);
  
  return (
    <>
      {Array.isArray(ctes) && ctes?.length ? (
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
                  <strong>{cte.numero_cte}</strong>
                </TableCell>
                <TableCell>{cte.tomador}</TableCell>
                <TableCell>R$ {cte.valor_receita_total.toFixed(2)}</TableCell>
                <TableCell>
                  {Array.isArray(cte.nfs) ? cte.nfs.length : 0}
                </TableCell>
                <TableCell>
  {(() => {
    // 🔥 Função para formatar a data corretamente para "DD/MM/YYYY HH:mm"
    const formatarData = (data) => {
      if (!data) return "";

      let dataObjeto;

      // ✅ Se o formato for "YYYY-MM-DD HH:MM:SS" ou "YYYY-MM-DDTHH:MM:SS"
      if (data.includes("-")) {
        dataObjeto = new Date(data.includes("T") ? data : data.replace(" ", "T"));
      }
      // ✅ Se o formato for "DD/MM/YYYY HH:MM:SS"
      else if (data.includes("/")) {
        const [dia, mes, anoHora] = data.split("/");
        const [ano, hora] = anoHora.split(" ");
        const dataFormatada = `${ano}-${mes}-${dia}T${hora}`;
        dataObjeto = new Date(dataFormatada);
      }

      // ❌ Se a conversão falhar, retorna vazio para evitar erro
      if (!dataObjeto || isNaN(dataObjeto.getTime())) return "";

      const dia = String(dataObjeto.getDate()).padStart(2, "0");
      const mes = String(dataObjeto.getMonth() + 1).padStart(2, "0");
      const ano = dataObjeto.getFullYear();
      const horas = String(dataObjeto.getHours()).padStart(2, "0");
      const minutos = String(dataObjeto.getMinutes()).padStart(2, "0");

      return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    };

    // 📅 Verifica se a data está atrasada ou agendada
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Remove horas para comparar apenas a data
    let prazoEntrega = null;

    if (cte.prazo_entrega) {
      prazoEntrega = new Date(cte.prazo_entrega.includes("T") ? cte.prazo_entrega : cte.prazo_entrega.replace(" ", "T"));

      prazoEntrega.setHours(0, 0, 0, 0);
    }

    const estaAtrasado = prazoEntrega && prazoEntrega.getTime() < hoje.getTime();
    const estaAgendado = Boolean(cte.agendamento);

    let estilo = {};
    let descricao = formatarData(cte.prazo_entrega);

    if (estaAtrasado && estaAgendado) {
      estilo = { backgroundColor: "#dc3545", color: "white" }; // Vermelho
      descricao += " - Atrasado / Agendado";
    } else if (estaAtrasado) {
      estilo = { backgroundColor: "#dc3545", color: "white" }; // Vermelho
      descricao += " - Atrasado";
    } else if (estaAgendado) {
      estilo = { backgroundColor: "#007bff", color: "white" }; // Azul
      descricao += " - Agendado";
    }

    return (
      <span
        style={{
          ...estilo,
          padding: "3px 8px",
          display: "flex",
          borderRadius: "4px",
          fontSize: "15px",
          width: "100%",
        }}
      >
        {descricao}
      </span>
    );
  })()}
</TableCell>


                <TableCell>{cte.peso_total} kg</TableCell>
                <TableCell>{cte.volume}</TableCell>
                <TableCell>{cte.cidade}</TableCell>
                <TableCell>
                  {tabelaCustosFrete.find(
                    (item) =>
                      item.destino.trim().toUpperCase() ===
                      cte.cidade.trim().toUpperCase()
                  )?.distancia_km || "-"}
                </TableCell>
                <TableCell>{cte.filial_origem || cte.filialOrigem}</TableCell>
                <TableCell>{cte.filial_destino || cte.filialDestino}</TableCell>

                <TableCell>
                  <ActionButton
                    style={{
                      background: "red",
                      color: "#fff",
                      borderRadius: "5px",
                    }}
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
          <FaExclamationTriangle
            size={40}
            color="#FF9800"
            style={{ marginBottom: "10px" }}
          />
          <h4
            style={{ color: "#fff", fontWeight: "bold", marginBottom: "5px" }}
          >
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
