import styled from "styled-components";

// Container Principal
export const Container = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: auto;
`;

// Tabela estilizada
export const Table = styled.table`
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

// Linha da Tabela, com cor dinâmica baseada na lucratividade
// Linha da Tabela, com cor dinâmica baseada na margem de custo
export const TableRow = styled.tr`
  background-color: ${(props) => (props.lucrativa ? "rgba(0, 255, 127, 0.15)" : "rgba(255, 69, 0, 0.25)")};

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

// Botão de Exportação para Excel
export const ExportButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 15px;
  transition: background 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

// Botão de Ação (Editar/Excluir)
export const ActionButton = styled.button`
  border-radius:5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 7px;
  transition: transform 0.2s;
  width:100%;
  &:hover {
    transform: scale(1.2);
  }
`;
