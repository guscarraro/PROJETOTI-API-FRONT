import styled from "styled-components";

// Modal maior para evitar quebra de linhas
export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.div`
  background: white;
  width: 80%; /* Aumentado para evitar quebras de linha */
  max-width: 900px; /* Limite de largura */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Estilos para a Tabela
export const Table = styled.table`
  width: 100%;
  margin-bottom: 20px;
`;

export const TableRow = styled.tr`
  background-color: #f8f9fa;
  border-radius: 8px 8px 0px 0px;
  transition: 0.3s;

  &:hover {
    background-color: #e9ecef;
  }
`;

export const TableHeader = styled.th`
  background: #007bff;
  color: white;
  padding: 12px;
    border-radius: 8px 8px 0px 0px;
  text-align: left;
  font-size: 14px;
`;

export const TableCell = styled.td`
  padding: 12px;
  text-align: left;
  font-size: 14px;
  color: black;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;
`;

// Botão de ação (Excluir CTE)
export const ActionButton = styled.button`
  width:100%;
  background: red;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: darkred;
  }
`;

// Botão de fechar modal
export const CloseButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #5a6268;
  }
`;
