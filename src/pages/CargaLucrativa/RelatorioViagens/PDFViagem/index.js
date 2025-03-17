import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { FaPrint } from "react-icons/fa";
import { ActionButton } from "../style";

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
        style={{ background: "green", color: "#fff", borderRadius: "5px" }}
        onClick={handlePrint}
      >
        <FaPrint size={16} />
      </ActionButton>

      {/* Elemento oculto para impressão */}
      <div style={{ display: "none" }}>
        <div ref={contentRef} style={styles.page}>
          {/* Cabeçalho */}
          <div style={styles.header}>
            <h2 style={styles.title}>Relatório da Viagem {viagem.numero_viagem}</h2>
            <p style={styles.date}>
              <strong>Data de Inclusão:</strong> {formatarData(viagem.data_inclusao)}
            </p>
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

          {/* Box Separado para os CTEs */}
          <div style={styles.cteBox}>
            <h3 style={styles.subTitle}>CTEs Vinculados</h3>
            <div style={styles.cteList}>
            {viagem.documentos_transporte.map((cte, idx) => (
  <span key={idx} style={styles.cteItem}>
    {cte.numero_cte}{idx < viagem.documentos_transporte.length - 1 ? ", " : ""}
  </span>
))}

            </div>
          </div>

          {/* Entregas Agendadas e Atrasadas */}
          <div style={styles.section}>
            <div style={styles.statusBox}>
              <h3 style={styles.subTitle}>Entregas Agendadas</h3>
              <ul>
                {viagem.documentos_transporte
                  .filter(doc => doc.prazo_entrega)
                  .map((cte, idx) => (
                    <li key={idx}>
                      CTE: {cte.numero_cte} - {formatarData(cte.prazo_entrega)}
                    </li>
                  ))}
              </ul>
            </div>
            <div style={styles.statusBox}>
              <h3 style={styles.subTitle}>Entregas Atrasadas</h3>
              <ul>
                {viagem.documentos_transporte
                  .filter(doc => doc.prazo_entrega && new Date(doc.prazo_entrega) < new Date())
                  .map((cte, idx) => (
                    <li key={idx}>
                      CTE: {cte.numero_cte} - {formatarData(cte.prazo_entrega)}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Roteirização (Parte inferior 50%) */}
          <div style={styles.routeContainer}>
            <h3 style={styles.subTitle}>Roteirização</h3>
            <p style={{ textAlign: "center", color: "#777" }}>Aguardando informações da rota...</p>
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
