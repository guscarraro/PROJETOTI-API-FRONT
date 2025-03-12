import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

export const Table = styled.table`
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
`;

// Linha da Tabela, com cor dinâmica baseada na lucratividade
export const TableRow = styled.tr`
  color:#000;
  background-color: "rgba(0, 255, 127, 0.15)" 
  transition: background-color 0.3s;
`;

// Célula da Tabela
export const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
`;

// Cabeçalho da Tabela
export const TableHeader = styled.th`
  padding: 14px;
  background: #009879;
  color: white;
  font-weight: bold;
  border-bottom: 2px solid #ddd;
  text-align: center;
`;


export const ExportButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 15px;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;

  &:hover {
    background-color: #218838;
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const ImportLabel = styled.label`
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-right: 10px;
  display: inline-block;

  &:hover {
    background-color: #0056b3;
  }
`;
export const ImportButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  border: none;

  &:hover {
    background-color: #0056b3;
  }
`;


export const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

export const ActionButton = styled.button`
  background: ${(props) => props.color || "#007bff"};
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;

  &:hover {
    opacity: 0.8;
  }
`;

// Container do Modal (fundo escuro semi-transparente)
export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

// Conteúdo do Modal (caixa branca centralizada)
export const ModalContent = styled.div`
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

// Botão de Fechar
export const CloseButton = styled.button`
  background: #ccc;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;

  &:hover {
    background: #b3b3b3;
  }
`;

// Botão de Salvar (usado no ModalAdd e ModalEdit)
export const SaveButton = styled.button`
  background: #28a745;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  transition: background 0.3s ease;

  &:hover {
    background: #218838;
  }
`;

// Botão de Excluir (usado no ModalDel)
export const DeleteButton = styled.button`
  background: #dc3545;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  transition: background 0.3s ease;

  &:hover {
    background: #c82333;
  }
`;

// Campo de Input (estilizado)
export const Input = styled.input`
  width: 90%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;

  &:focus {
    border-color: #009879;
    outline: none;
  }
`;


