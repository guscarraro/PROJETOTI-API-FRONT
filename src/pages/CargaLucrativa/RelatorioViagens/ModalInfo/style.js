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
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
`;

export const Title = styled.h3`
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 16px;
  text-align: center;
`;

export const Subtitle = styled.h3`
  color: #666;
  font-size: 1rem;
  margin-bottom: 20px;
  text-align: center;
`;

export const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
`;

export const Card = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  flex: 1 1 calc(33.33% - 16px); /* 3 cards por linha, com gap */
  min-width: 280px;
  box-sizing: border-box;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
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

export const CTEListContainer = styled.div`
  max-height: 220px;
  overflow-y: auto;
  margin-top: 8px;
  padding-right: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
`;

export const CTEList = styled.ul`
  list-style: none;
  padding: 8px;
  margin: 0;
`;

export const CTEItem = styled.li`
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 6px;
  color: #333;
  font-size: 0.9rem;
  border: 1px solid #ccc;
`;

export const CloseButton = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  margin-top: 20px;
  transition: background 0.3s ease;

  &:hover {
    background: #0056b3;
  }
`;
export const CTETable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    font-size: 0.9rem;
    text-align: left;
     color: #333;
  }

  th {
    background-color: #f1f1f1;
    color: #333;
  }

  ul {
    padding-left: 16px;
    margin: 0;
  }

  li {
    font-size: 0.85rem;
  }
`;

export const CTERow = styled.tr`
  background-color: ${({ agendado }) => (agendado ? "#007bff" : "#fff")};
  color: ${({ agendado }) => (agendado ? "#fff" : "#000")};

  td {
    border: 1px solid #ccc;
  }
`;
