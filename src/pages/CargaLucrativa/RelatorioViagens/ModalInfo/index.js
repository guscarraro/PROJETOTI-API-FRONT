import React from "react";
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
  CTEList,
  CTEItem,
  CTEListContainer,
} from "./style";
import PDFViagem from "./PDFViagem";

const ModalInfo = ({ viagem, onClose }) => {
  console.log(viagem);
  
  return (
    <ModalContainer>
      <ModalContent>
        <Title>Detalhes da Viagem</Title>
        <Subtitle>
          {new Date(new Date(viagem.data_inclusao).getTime() - 3 * 60 * 60 * 1000).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
            <InfoLabel>Receita Total</InfoLabel>
            <InfoValue>R$ {viagem.total_receita.toFixed(2)}</InfoValue>
          </Card>
          <Card>
            <InfoLabel>Total de Entregas</InfoLabel>
            <InfoValue>{viagem.total_entregas}</InfoValue>
          </Card>
          <Card>
            <InfoLabel>Peso Total</InfoLabel>
            <InfoValue>{viagem.total_peso} kg</InfoValue>
          </Card>
          <Card>
            <InfoLabel>Observação</InfoLabel>
            <InfoValue>{viagem.obs || "Nenhuma observação."}</InfoValue>
          </Card>
          <Card>
            <InfoLabel>Custo</InfoLabel>
            <InfoValue>R${viagem.total_custo || "Nenhum custo."}</InfoValue>
          </Card>
          <Card>
            <InfoLabel>CTEs Vinculados</InfoLabel>
            <CTEListContainer>

              <CTEList>
                {viagem.documentos_transporte.map((cte, idx) => (
                  <CTEItem key={idx}>{cte.numero_cte}</CTEItem>
                ))}
              </CTEList>
            </CTEListContainer>
          </Card>
        </CardsContainer>
        
        <CloseButton onClick={onClose}>Fechar</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalInfo;