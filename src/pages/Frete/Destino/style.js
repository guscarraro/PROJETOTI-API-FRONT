import styled from "styled-components";
import { Table, Button } from "reactstrap";

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 30px;
  width: 50%;
`;

export const StyledTable = styled(Table)`
  margin-top: 20px;
  border-radius: 10px;
  overflow: hidden;
  width: 80%;

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
    svg {
      cursor: pointer;
    }
  }
`;

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
