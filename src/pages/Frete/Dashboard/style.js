import styled from "styled-components";


// CardStyle que recebe bgColor (cor de fundo) e iconColor (cor do ícone)
export const CardStyle = styled.div`
  background-color: ${(props) => props.bgColor || "rgba(255, 255, 255, 0.1)"};
  border: 1px solid ${(props) => props.bgColor || "rgba(255, 255, 255, 0.1)"};
  flex: 1;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  color: #fff; /* cor do texto */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  h3 {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    /* espaço entre o ícone e o texto */
    gap: 8px;
  }

  /* Ícone dentro do título */
  svg {
    font-size: 1.4rem;
    color: ${(props) => props.iconColor || "#fff"};
  }
`;
export const Box = styled.div`
    padding: 10px;
    border-radius: 15px !important; /* Borda arredondada para os cards */
    background: rgba(0, 0, 0, 0.7) !important; /* Fundo escuro translúcido */
    margin:0;
    border: 1px solid rgba(255, 255, 255, 0.2)!important; /* Borda sutil */
    min-width: 100% !important;
  
`;



