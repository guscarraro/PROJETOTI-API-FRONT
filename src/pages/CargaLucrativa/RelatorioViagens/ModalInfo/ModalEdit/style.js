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
  z-index:1050;
`;

export const ModalContent = styled.div`
  background: white;
  width: 90%;
  max-width: 800px; /* Aumenta largura */
  max-height: 90vh;  /* Altura máxima do modal */
  overflow-y: auto;  /* Scroll vertical */
  padding: 30px 40px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  color: #000;
`;


// Estilização do FormGroup para alinhar os inputs/selects
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 15px;

  label {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #555;
  }
`;

// Estilos para os Inputs
export const InputStyled = styled.input`
  width: 100%;
  min-width: 250px;
  max-width: 300px;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  transition: 0.3s;

  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0px 0px 5px rgba(0, 123, 255, 0.5);
  }
`;

// Estilos para o react-select


// Botão de ação (Salvar)
export const ActionButton = styled.button`
  background: green;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: darkgreen;
  }
`;

// Botão de fechar modal
export const CloseButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #5a6268;
  }
`;
