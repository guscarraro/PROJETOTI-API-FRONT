import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
    
`;



export const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  font-size: 14px;
`;

export const TableHeader = styled.th`
  background-color: #007bff;
  color: white;
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
`;

export const ExportButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  &:hover {
    background-color: #218838;
  }
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
`;

export const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
`;

export const FileInput = styled.input``;

export const CloseButton = styled.button`
  background-color: red;
  color: white;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
`;
