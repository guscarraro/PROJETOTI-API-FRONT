import styled, { keyframes, css } from 'styled-components';



export const ContainerGeral = styled.div`
background-color: #202722; 
    background-image: radial-gradient(#333 1px, transparent 1px);
    background-size: 20px 20px;
    width: 100%;
    min-height: 100vh;
    height: auto;

}
`;
export const Box = styled.div`
background-color: 'rgba(0, 0, 0, 0.7)';
border-radius: 10px;
padding: 20px;
margin: 10px;
text-align: center;
height: auto;
opacity: 0.9;
display: flex;
flex-direction: column;
justify-content: space-between;
gap:10px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);


}
`;
export const ContainerMenu = styled.div`
display: flex;
flex-diretion: row;
margin:0;
gap:10px;
p{
color:#000;
border: solid #000 1px;
border-radius: 5px;
padding: 5px 10px;
margin:0;
}
}
`;
export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  background-color: rgba(0, 0, 0, 0.7); /* Cor de fundo para tabela */

  thead {
    background-color: #222;
    color: #fff;
  }

  tbody tr:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.2); /* Branco transparente */
  }

  tbody tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.5); /* Branco mais opaco */
  }

  tr:hover {
    background-color: rgba(255, 255, 255, 0.8); /* Destaque ao passar o mouse */
  }

  th, td {
    padding: 12px 15px;
    border: 1px solid #ddd;
    color: #fff;
  }
`;

export const LoadingContainer = styled.div`
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
`;
export const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;
// Loader animado
export const Loader = styled.div`
  width: 60px;
  height: 60px;
  border: 6px solid transparent; /* Anel transparente */
  border-top: 6px solid #309733; /* Cor do anel superior */
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite; /* Animação de rotação */
`;

// Texto abaixo do loader
export const LoadingText = styled.h5`
  margin-top: 20px;
  margin-bottom: 20px;
  color: #fff;
  font-weight: 500;
  font-size: 1.2rem;
  
`;
