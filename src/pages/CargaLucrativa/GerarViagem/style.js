import styled from "styled-components";

// Container principal
export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

// Inputs de busca
export const InputContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 20px;
`;

export const Input = styled.input`
  min-width: 300px;  
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

// Layout de 70% / 30%
export const CardContainer = styled.div`
  width: 100%;
  gap:10px;
  table {
    width: 70%;
    border-collapse: collapse;
  }

  th, td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
    color:#000;
  }

  .truncate {
    max-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;


// Container da rentabilidade
export const LucroContainer = styled.div`
  width: 30%;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

// Percentual de rentabilidade
export const LucroPercentual = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${(props) => props.cor};
`;
// Botão para remover CTE
export const RemoveButton = styled.button`
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  width: 50px;
 
  &:hover {
    background-color: #cc0000;
  }
`;

// Botão para salvar viagem
export const SaveButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  width: 100%;

  &:hover {
    background-color: #0056b3;
  }
`;
