import styled from "styled-components";
import { Button } from "reactstrap";

/**
 * Header principal que envolve o título e o botão de adicionar
 */
export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 30px;
  width: 50%;
`;

/**
 * Estilização para a tabela utilizando o componente Table do reactstrap
 */


/**
 * Botão de adicionar com ícone
 */
export const AddButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 5px;
`;
export const FilterInput = styled.input`
  flex: 1;
  margin-right: 10px;
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  max-width: 300px;
`;

export const Table = styled.table`
  width: auto;
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
  background-color: "rgba(0, 255, 127, 0.15)" ;
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
