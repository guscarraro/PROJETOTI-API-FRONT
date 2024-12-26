import styled from "styled-components";

export const Container = styled.div`
  width: 50%;
  margin: 40px auto;
  background: rgba(0, 0, 0, 0.5);/* Fundo transparente e fosco */
  backdrop-filter: blur(10px); /* Adiciona efeito de desfoque */
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra suave */
 display: flex;
    flex-direction: column;
    justify-content: flex-start;
`;

export const Title = styled.h2`
  text-align: center;
  color: #FFF;
  font-size: 24px;
  margin-bottom: 20px;
`;

export const StyledForm = styled.form`
    
    display: flex;
    gap: 15px;
    background: none;
    padding: 0;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    font-size: 25px;
    color: #fff;
    border-radius: 10px;
    flex-wrap: wrap;

`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Input = styled.input`
  padding: 10px;
  font-size: 14px;
  border: 1px solid #fff;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s ease;
  width:250px;
  &:focus {
    border-color: #007bff;
  }
`;

export const Select = styled.select`
  padding: 10px;
  font-size: 14px;
  border: 1px solid #fff;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s ease;
  width:250px;
  &:focus {
    border-color: #007bff;
  }
`;

export const TextArea = styled.textarea`
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s ease;
  resize: none;
width:250px;
  &:focus {
    border-color: #007bff;
  }
`;

export const SubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px;
  margin-top:10px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;
