import styled from "styled-components";

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
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
`;

export const CloseButton = styled.button`
  margin-top: 10px;
  padding: 10px;
  border: none;
  background: gray;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
`;

export const ActionButton = styled.button`
  width:100%;
  margin-top: 10px;
  padding: 12px 0px;
  border: none;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
`;
