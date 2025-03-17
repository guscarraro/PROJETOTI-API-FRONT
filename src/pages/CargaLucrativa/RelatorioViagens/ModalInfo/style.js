import styled from "styled-components";

export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Fundo escuro semi-transparente */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  width: 600px; /* Largura maior para acomodar os cards */
  max-width: 90%;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
`;

export const Title = styled.h3`
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
`;
export const Subtitle = styled.h3`
  color: #333;
  font-size: 1.0rem;
  margin-bottom: 20px;
  text-align: center;
`;

export const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* Quebra os cards para a próxima linha */
  gap: 16px; /* Espaçamento entre os cards */
  margin-bottom: 20px;
`;

export const Card = styled.div`
  background: #f8f9fa; /* Fundo cinza claro */
  border: 1px solid #e0e0e0; /* Borda suave */
  border-radius: 8px; /* Bordas arredondadas */
  padding: 16px;
  flex: 1 1 calc(50% - 8px); /* Cada card ocupa metade da largura, menos o gap */
  box-sizing: border-box;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px); /* Efeito de levantar ao passar o mouse */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const InfoLabel = styled.span`
  font-weight: bold;
  color: #555;
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
`;

export const InfoValue = styled.span`
  color: #333;
  display: block;
  font-size: 1rem;
`;

export const CTEList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const CTEItem = styled.li`
  background: #fff;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  color: #333;
  font-size: 0.9rem;
  border: 1px solid #e0e0e0;
`;

export const CloseButton = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  transition: background 0.3s ease;

  &:hover {
    background: #0056b3;
  }
`;