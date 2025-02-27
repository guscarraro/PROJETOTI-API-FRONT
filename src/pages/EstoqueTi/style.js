import styled from 'styled-components';

// Estilo para o container principal da página
export const ContainerPagina2 = styled.div`
  min-height: 100vh;
  background-image: url('../../images/fundoAbsGreen.jpg');
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-size: cover;
`;

// Estilo para o container geral da aplicação
export const StyledContainer = styled.div`
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

// Estilo para cada card de equipamento
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

// Botão de filtro estilizado
export const BtnFilter = styled.button`
  margin: 5px;
  background-color: #00ffff88;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  transition: 0.7s;

  &:hover {
    background-color: #00FFFF;
    color: #000;
  }
`;

// Títulos principais e subtítulos
export const Title = styled.h2`
  color: white;
`;

export const Subtitle = styled.h5`
  color: white;
`;

// Seção de exibição por setor
export const SetorSection = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: rgba(32, 39, 34, 0.8);
  border-radius: 10px;
  color: white;
`;

// Área fixa na lateral para o Almoxarifado
export const AlmoxarifadoSection = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background-color: #202722;
  color: white;
  padding: 1rem;
  overflow-y: auto;
  border-left: 2px solid #333;
`;

// Botão de edição com ícone de caneta
export const EditButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #00FFFF;

  &:hover {
    color: white;
  }
`;
export const CardStyle = styled.div`
  background-color: ${(props) => props.bgColor || "rgba(255, 255, 255, 0.1)"};
  border: 1px solid ${(props) => props.bgColor || "rgba(255, 255, 255, 0.1)"};
  flex: 1;
  padding: 20px;
  margin-top:10px;
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