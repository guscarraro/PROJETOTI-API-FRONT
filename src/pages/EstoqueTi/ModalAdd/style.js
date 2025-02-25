import styled from 'styled-components';

// Padronização de largura total para os inputs e selects
export const StyledFormGroup = styled.div`
  width: 100%;
  margin-bottom: 15px;

  label {
    font-weight: 600;
    margin-bottom: 5px;
    display: block;
    color: #333;
  }

  input, select, textarea {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-top: 5px;
    background-color: #f9f9f9;
    color: #333;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
    }
  }

  .react-select__control {
    width: 100%;
    padding: 4px;
    font-size: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #ccc;
    margin-top: 5px;

    &:hover {
      border-color: #007bff;
    }
  }

  .react-select__menu {
    background-color: #f9f9f9;
  }

  .react-select__single-value {
    color: #333;
  }
`;
