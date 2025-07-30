import styled, { keyframes, css } from 'styled-components';

export const pulseOpacity = keyframes`
0% {
  opacity: 1;
}
50% {
  opacity: 0.6;
}
100% {
  opacity: 1;
}
`;

export const Box = styled.div`
background-color: ${(props) => props.bgColor || 'rgba(0, 0, 0, 0.7)'};
color: #fff;
border-radius: 10px;
padding: 20px;
margin: 10px;
text-align: center;
height: auto;
opacity: 0.9;
display: flex;
flex-direction: column;
justify-content: space-between;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
${(props) => props.isPulsing && css`
  animation: ${pulseOpacity} 2s infinite;
`}
`;
export const BtnOcultarGrafico = styled.button`
  margin: 10px;
  padding: 10px 15px;
  background-color: ${(props) => (props.showCharts ? 'rgba(0, 0, 0, 0.7)' : '#007bff')}; /* Azul se mostrar gráficos, cinza caso contrário */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.3s ease; /* Transições */

  &:hover {
    opacity: 0.7; /* Efeito de hover */
  }
`;
export const SelectComponent = styled.select`
   margin: '10px 0',
              padding: '8px',
              margin:'10px',
              borderRadius: '5px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro transparente
              color: '#fff', // Texto branco
              border: '1px solid rgba(255, 255, 255, 0.2)', // Borda levemente destacada
              outline: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              appearance: 'none', // Remove o estilo padrão do navegador
              WebkitAppearance: 'none',
              MozAppearance: 'none',
`;
export const OptionComponent = styled.option`
 
`;



export const ProgressBar = styled.div`
width: 100%;
background-color: rgba(255, 255, 255, 0.1);
border-radius: 5px;
overflow: hidden;
height: 8px;
position: relative;
margin-top: 10px;

&::after {
  content: '';
  display: block;
  height: 100%;
  background-color: #00C49F;
  width: ${(props) => props.progress}%;
}
`;

export const NoteList = styled.div`
margin-top: 10px;
text-align: left;
font-size: 0.9rem;
`;

export const NoteItem = styled.div`
background-color: rgba(255, 255, 255, 0.1);
padding: 5px;
border-radius: 5px;
margin-bottom: 5px;
color: ${(props) => (props.isOpen ? '#b6fff9' : '#fff')};
opacity: ${(props) => (props.isOpen ? 0.9 : 1)};
`;

// Definindo a animação de rotação
export const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Contêiner centralizado para o loader
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
export const CarouselWrapper = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;

  .scroll-container {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    gap: 20px;
    scroll-behavior: smooth;
    padding: 0 40px;
    cursor: grab;
  }

  .scroll-container:active {
    cursor: grabbing;
  }

  .card-wrapper {
    flex: 0 0 auto;
    width: 370px;
    min-width: 370px;
  }

  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;
