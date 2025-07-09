import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { FaPrint } from "react-icons/fa";
import { ActionButton } from "../../style";

const PDFViagem = ({ viagem }) => {
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
  });

  // 🔹 Função para formatar a data corretamente sem alterar o fuso horário
  const formatarData = (dataString) => {
    if (!dataString) return "-";

    // 🔥 Verifica se a data já contém horário ou não
    if (dataString.length === 10) {
      // Se a data vier apenas como "YYYY-MM-DD", adicionamos um horário padrão
      dataString += "T12:00:00"; // Define 12h para evitar erro de conversão
    }

    const data = new Date(dataString);

    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour12: false, // Garante formato 24h
    });
  };

  return (
    <>
      <ActionButton
        style={{ background: "green", color: "#fff", borderRadius: "5px" , width:'50px', marginBottom:5}}
        onClick={handlePrint}
      >
        <FaPrint size={16} />
      </ActionButton>

      {/* Elemento oculto para impressão */}
      <div style={{ display: "none" }}>
        {/* <style>{`@page { size: landscape; }`}</style> */}
        <div ref={contentRef} style={styles.page}>
          {/* Cabeçalho */}
          <div style={styles.header}>
            <h2 style={styles.title}>Relatório da Viagem {viagem.numero_viagem}</h2>
            <p style={styles.date}>
              <strong>Data de Inclusão:</strong> {formatarData(viagem.data_inclusao)}
            </p>
          </div>
{/* Notas Agendadas */}
<div style={styles.statusBox}>
  <h3 style={styles.subTitle}>Notas Agendadas</h3>
  <ul style={{ margin: 0, paddingLeft: "16px" }}>
    {viagem.documentos_transporte
      .flatMap(doc =>
        doc.agendamento && doc.notas_fiscais
          ? doc.notas_fiscais.filter(nf => nf.numero_nf && nf.numero_nf !== "0").map(nf => ({
              numero_nf: nf.numero_nf,
              agendamento: doc.agendamento,
              cte: doc.numero_cte
            }))
          : []
      )
      .map((nf, idx) => (
        <li key={idx}>
          NF {nf.numero_nf} (CTE {nf.cte}) - Agendada: {formatarData(nf.agendamento)}
        </li>
      ))}
  </ul>
</div>

{/* Notas Atrasadas */}
<div style={styles.statusBox}>
  <h3 style={styles.subTitle}>Notas Atrasadas</h3>
  <ul style={{ margin: 0, paddingLeft: "16px" }}>
    {viagem.documentos_transporte
      .flatMap(doc =>
        doc.prazo_entrega &&
        new Date(doc.prazo_entrega) < new Date() &&
        !doc.agendamento &&
        doc.notas_fiscais
          ? doc.notas_fiscais.filter(nf => nf.numero_nf && nf.numero_nf !== "0").map(nf => ({
              numero_nf: nf.numero_nf,
              prazo: doc.prazo_entrega,
              cte: doc.numero_cte
            }))
          : []
      )
      .map((nf, idx) => (
        <li key={idx}>
          NF {nf.numero_nf} (CTE {nf.cte}) - Prazo: {formatarData(nf.prazo)}
        </li>
      ))}
  </ul>
</div>

          {/* Informações Gerais */}
          <div style={styles.section}>
            <div style={styles.infoBox}>
              <p><strong>Placa:</strong> {viagem.placa}</p>
              <p><strong>Motorista:</strong> {viagem.motorista}</p>
            </div>
            <div style={styles.infoBox}>
              <p><strong>Receita Total:</strong> R$ {viagem.total_receita.toFixed(2)}</p>
              <p><strong>Custo Total:</strong> R$ {viagem.total_custo.toFixed(2)}</p>
            </div>
            <div style={styles.infoBox}>
              <p><strong>Margem de Custo:</strong> {viagem.margem_custo}%</p>
              <p><strong>Total de Entregas:</strong> {viagem.total_entregas}</p>
            </div>
          </div>


          {/* Entregas Agendadas e Atrasadas */}
       {/* Tabela detalhada de CTEs e Notas Fiscais */}
<div style={{ marginTop: "30px" }}>
  <h3 style={styles.subTitle}>Detalhamento das Entregas</h3>
  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
    <thead>
      <tr style={{ background: "#eee" }}>
        <th style={styles.th}>CTE</th>
        <th style={styles.th}>Tomador</th>
        <th style={styles.th}>Destino</th>
        <th style={styles.th}>Cidade</th>
        <th style={styles.th}>Notas Fiscais</th>
        <th style={styles.th}>Previsão de Entrega</th>
      </tr>
    </thead>
    <tbody>
      {viagem.documentos_transporte.map((cte, i) => {
        const isAgendada = !!cte.agendamento;
        const prazo = cte.prazo_entrega ? new Date(cte.prazo_entrega) : null;

        return (
          <tr key={i} style={{ borderBottom: "1px solid #ccc" }}>
            <td style={styles.td}>{cte.numero_cte}</td>
            <td style={styles.td}>{cte.tomador || "-"}</td>
            <td style={styles.td}>{cte.destino}</td>
            <td style={styles.td}>{cte.cidade}</td>
            <td style={styles.td}>
              {cte.notas_fiscais?.length ? (
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {cte.notas_fiscais
                    .filter(nf => nf.numero_nf && nf.numero_nf !== "0")
                    .map((nf, idx) => (
                      <li key={idx}>{nf.numero_nf}</li>
                    ))}
                </ul>
              ) : (
                "-"
              )}
            </td>
            <td style={styles.td}>
              {isAgendada
                ? new Date(cte.agendamento).toLocaleDateString("pt-BR")
                : prazo
                ? prazo.toLocaleDateString("pt-BR")
                : "-"}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

        </div>
      </div>
    </>
  );
};



// 🔹 Estilos da página de impressão
const styles = {
  page: {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    color: "#333",
  },
  header: {
    textAlign: "center",
    paddingBottom: "10px",
    borderBottom: "2px solid #ddd",
    marginBottom: "20px",
  },
  title: {
    fontSize: "22px",
    marginBottom: "5px",
  },
  date: {
    fontSize: "14px",
    color: "#666",
  },
  section: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "20px",
  },
  infoBox: {
    flex: 1,
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#f8f8f8",
    boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
  },
    th: {
    textAlign: "left",
    padding: "8px",
    borderBottom: "2px solid #ccc",
    backgroundColor: "#f0f0f0",
  },
  td: {
    padding: "6px 8px",
    verticalAlign: "top",
  },

  cteBox: {
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#e8f4ff",
    boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    marginBottom: "20px",
  },
  statusBox: {
    flex: 1,
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#f1f1f1",
    boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
  },
  subTitle: {
    fontSize: "18px",
    marginBottom: "10px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "5px",
  },
  routeContainer: {
    marginTop: "30px",
    padding: "20px",
    border: "2px dashed #ccc",
    borderRadius: "10px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
  },
};

export default PDFViagem;
