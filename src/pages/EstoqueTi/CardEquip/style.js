
import styled from 'styled-components';

export const BoxGeneral = styled.div`
  background-color: #2c3e50;
  padding: 20px;
  min-height: 100vh;
`;

export const SetorSection = styled.div`
  margin-top: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ccc;
`;

export const Almoxarifado = styled.div`
  position: fixed;
  right: 0;
  top: 100px;
  width: 250px;
  background-color: #f1f1f1;
  padding: 15px;
  border-left: 2px solid #ddd;
  overflow-y: auto;
  height: 80%;

  h4 {
    text-align: center;
    margin-bottom: 15px;
  }
`;

export const EditButton = styled.button`
  background-color: secundary;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;

  &:hover {
    background-color: #e67e22;
  }
`;

export const CardDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;
export const CustomCard = styled.div`
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 100%;
  position: relative; /* Para o botão de edição funcionar corretamente */
`;