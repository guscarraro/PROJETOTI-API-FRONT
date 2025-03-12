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
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  align-items: flex-end;
`;

export const Input = styled.input` 
    
  padding: 10px;
  width:100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

// Layout de 70% / 30%
export const CardContainer = styled.div`
  width: 100%;
  gap:10px;
  table {
    width: 100%;
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
    border-radius:10px 10px 0px 0px;
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
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

// Percentual de rentabilidade
export const CustoPercentual = styled.div`
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

// Container dos MiniCards para organizar em grid responsivo
export const MiniCardContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  margin-top: 10px;
`;

// Cada MiniCard individual
export const MiniCard = styled.div`
  color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom:15px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.7);
  text-align: center;
  width: 100%;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  span {
    font-size: 14px;
    color: #fff;
    margin-top: 5px;
  }

  strong {
    font-size: 18px;
    font-weight: bold;
    margin-top: 5px;
    color: #fff;
  }

  svg {
    color: #fff;
    margin-bottom: 5px;
  }
`;
// Adicione estas linhas no arquivo de estilos

export const CheckboxContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 10px;
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  color: #fff;
`;

export const TextArea = styled.textarea`
      width: 70%;
  max-height: 50px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  resize: vertical;
  margin-top: 10px;
`;
