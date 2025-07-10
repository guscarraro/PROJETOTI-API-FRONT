import React, { useEffect, useState } from "react";
import {
  ModalContainer,
  ModalContent,
  CloseButton,
  Title,
  Subtitle,
  CardsContainer,
  Card,
  InfoLabel,
  InfoValue,
  CTETable,
} from "./style";
import PDFViagem from "./PDFViagem";
import apiLocal from "../../../../services/apiLocal";

const ModalInfo = ({ numeroViagem, onClose, onLoaded }) => {

  const [viagem, setViagem] = useState(null);

useEffect(() => {
  if (numeroViagem) {
    apiLocal.getViagemByNumero(numeroViagem)
      .then((res) => {
        setViagem(res.data);
      })
      .finally(() => {
        if (onLoaded) onLoaded(); // ✅ desliga o loading externo
      });
  }
}, [numeroViagem]);



  if (!viagem) return null; // ou <Loading />

  

  return (
    <ModalContainer>
      <ModalContent>
        <Title>Detalhes da Viagem</Title>
        <Subtitle>
          {new Date(new Date(viagem.data_inclusao).getTime() - 3 * 60 * 60 * 1000).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Subtitle>

        <PDFViagem viagem={viagem} />

       <CardsContainer>
  <Card>
    <InfoLabel>Número da Viagem</InfoLabel>
    <InfoValue>{viagem.numero_viagem}</InfoValue>
  </Card>
  <Card>
    <InfoLabel>Placa</InfoLabel>
    <InfoValue>{viagem.placa}</InfoValue>
  </Card>
  <Card>
    <InfoLabel>Motorista</InfoLabel>
    <InfoValue>{viagem.motorista}</InfoValue>
  </Card>
 
  <Card>
    <InfoLabel>Peso Total</InfoLabel>
    <InfoValue>{viagem.total_peso} kg</InfoValue>
  </Card>
  <Card>
    <InfoLabel>Custo</InfoLabel>
    <InfoValue>R$ {viagem.total_custo || "Nenhum custo."}</InfoValue>
  </Card>
  <Card>
    <InfoLabel>Observação</InfoLabel>
    <InfoValue>{viagem.obs || "Nenhuma observação."}</InfoValue>
  </Card>

  {/* ✅ Cards de resumo corrigidos */}
  <Card>
    <InfoLabel>Total de Entregas</InfoLabel>
    <InfoValue>{viagem.total_entregas}</InfoValue>
  </Card>
  <Card style={{ background: "#007bff", color: "#fff" }}>
    <InfoLabel style={{  color: "#fff" }}>Entregas Agendadas</InfoLabel>
    <InfoValue style={{  color: "#fff" }}>
      {
        viagem.documentos_transporte.filter(cte => !!cte.agendamento).length
      }
    </InfoValue>
  </Card>
  <Card style={{ background: "#dc3545", color: "#fff" }}>
    <InfoLabel style={{  color: "#fff" }}>Entregas Atrasadas</InfoLabel>
    <InfoValue style={{  color: "#fff" }}>
      {
        viagem.documentos_transporte.filter(cte => {
          const prazo = cte.prazo_entrega ? new Date(cte.prazo_entrega) : null;
          const hoje = new Date();
          return prazo && prazo < hoje && !cte.agendamento;
        }).length
      }
    </InfoValue>
  </Card>

  {/* Tabela de CTEs */}
  <Card style={{ flex: "1 1 100%" }}>
    <InfoLabel>CTEs Vinculados</InfoLabel>
    <CTETable>
      <thead>
        <tr>
          <th>Número CTE</th>
          <th>Tomador</th>
          <th>Destino</th>
          <th>Cidade</th>
          <th>Notas Fiscais</th>
          <th>Previsão de Entrega</th>
        </tr>
      </thead>
      <tbody>
        {viagem.documentos_transporte.map((cte) => {
          const isAgendada = !!cte.agendamento;
          const prazo = cte.prazo_entrega ? new Date(cte.prazo_entrega) : null;
          const hoje = new Date();
          const isAtrasada = prazo && prazo < hoje && !isAgendada;

          return (
            <tr key={cte.numero_cte}>
              <td>{cte.numero_cte}</td>
              <td>{cte.tomador || "-"}</td>
              <td>{cte.destino}</td>
              <td>{cte.cidade}</td>
              <td>
                <ul style={{ paddingLeft: "16px" }}>
                  {cte.notas_fiscais
                    ?.filter(nf => nf.numero_nf !== "0" && nf.numero_nf !== 0)
                    .map(nf => (
                      <li
                        key={nf.numero_nf}
                        style={{
                          background: isAgendada ? "#007bff" : isAtrasada ? "#dc3545" : "transparent",
                          color: isAgendada || isAtrasada ? "#fff" : "#000",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          marginBottom: "4px",
                          display: "inline-block"
                        }}
                      >
                        {isAgendada ? "A " : ""}
                        {nf.numero_nf}
                      </li>
                    ))}
                </ul>
              </td>
              <td>
                {isAgendada
                  ? new Date(cte.agendamento).toLocaleDateString("pt-BR")
                  : prazo
                    ? new Date(cte.prazo_entrega).toLocaleDateString("pt-BR")
                    : "-"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </CTETable>
  </Card>
</CardsContainer>



        <CloseButton onClick={onClose}>Fechar</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalInfo;
