
import styled, { keyframes } from "styled-components";


export const ContainerGeral = styled.div`
  background-color: #202722; 
  background-image: radial-gradient(#333 1px, transparent 1px);
  background-size: 20px 20px;
  width: 100%;
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}
`;

export const Box = styled.div`
border-radius: 10px;
color: #fff;
background-color: rgba(0, 0, 0, 0.7);
padding: 20px;
text-align: center;
height: auto;
opacity: 0.9;
display: flex;
flex-direction: column;
justify-content: space-between;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
min-height: 150px;
 margin-bottom: 10px;
`;



export const Card = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  

  h5 {
    margin: 0;
    margin-top:5px;
    font-weight: bold;
  }

  p {
    margin: 0;
    color: #aaa;
  }
`;

export const Etapas = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
`;
export const Etapa = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 2;

  p {
    margin: 5px 0 0;
    color: #ccc;
  }

  small {
    color: #aaa;
  }
`;


// Animação de progressão da linha
const carregarLinha = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

export const LinhaCompleta = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  height: 4px;
  width: 100%;
  z-index: 0;

  &::after {
    content: "";
    position: absolute;
    top: -25px;
    border-radius:5px;
    left: 0;
    height: 100%;
    width: ${({ progresso }) => progresso}%;
    background-color: #28a745;
    z-index: 1;
    animation: ${carregarLinha} ${({ duracao }) => duracao}s linear;
  }
`;

export const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border: 2px solid ${(props) => (props.concluido ? "#28a745" : "white")};
  background-color: ${(props) => (props.concluido ? "#28a745" : "transparent")};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
  transition: background-color 0.3s, border-color 0.3s;
`;
