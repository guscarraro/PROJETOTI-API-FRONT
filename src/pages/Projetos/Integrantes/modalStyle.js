import styled from "styled-components";

export const ModalBg = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalBox = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  h3 { margin: 0; }

  button {
    border: none;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-size: 13px;
    font-weight: 600;
  }
`;

export const Input = styled.input`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

export const BtnSave = styled.button`
  margin-top: 14px;
  background: #2563eb;
  color: #fff;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;
