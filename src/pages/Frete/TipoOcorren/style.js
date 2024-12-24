import styled from "styled-components";
import { Table, Button } from "reactstrap";

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
export const StyledTable = styled(Table)`
  margin-top: 20px;
  border-radius: 10px;
  overflow: hidden;
  width:50%;

  thead tr th {
    background-color: #007bff;
    color: #fff;
    text-align: center;
    padding: 10px;
  }

  tbody tr td {
    text-align: start;
    padding: 10px;
    background: transparent;
    color: #fff;
    
    /* Ícones */
    svg {
      cursor: pointer;
    }

    
  }
`;

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