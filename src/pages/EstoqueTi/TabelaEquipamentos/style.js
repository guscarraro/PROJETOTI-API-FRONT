import styled from "styled-components";
import { Table, Button } from "reactstrap";

export const StyledTable = styled(Table)`
  width: 100%;
  font-size: 14px;
  table-layout: fixed;
  word-wrap: break-word;
  border-collapse: collapse;

  th,
  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0.75rem;
    text-align: left;
    border: none;
    border-bottom: 1px solid #555; /* border cinza */
    color: #fff;
    vertical-align: middle;
    font-size: 14px;
    height: 48px;
  }

  th {
    background-color: #444;
    font-weight: bold;
  }
`;

export const TableRowStyled = styled.tr`
  cursor: pointer;

  td {
    background-color: ${(props) => props.$bgColor || "transparent"};
  }

  &:hover td {
    filter: brightness(0.7);
  }
`;

export const IconCell = styled.td`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #fff;

  svg {
    font-size: 16px;
    vertical-align: middle;
  }
`;

export const ActionCell = styled.td`
  display: flex;
  justify-content: flex-start;
  gap: 8px;
`;

export const StyledIconButton = styled(Button)`
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
