
import styled from "styled-components";


export const ContainerGeralCargaLucrativa = styled.div`
  background-color: #202722; 
  background-image: radial-gradient(#333 1px, transparent 1px);
  background-size: 20px 20px;
  min-width: 100%;
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
    justify-content: flex-start;
  color: #fff;
  z-index: 100;

`;
export const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  background-color: #333; /* Visibilidade melhorada */
  padding: 10px 0;
  height: 60px;
  position: sticky; /* Fixa no topo */
  top: 0;
  z-index: 999; /* Garante que ficará visível */
`;


export const NavButton = styled.button`
  position: relative;
  color: #fff;
  background-color: ${(props) => (props.$active ? "#007bff" : "transparent")};
  border: 0;
  border-left: 3px solid #444;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 0px 0px 5px 5px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
  width: auto;
  min-width: 150px;
  text-align: center;

  &:hover {
    background-color: ${(props) => (props.$active ? "#0056b3" : "#555")};
  }

  &.active {
    background-color: #2c3e50;
    color: #ecf0f1;
  }
`;


export const NavIcon = styled.span`
  margin-right: 8px;
`;



export const Dropdown = styled.div`
  position: absolute;
  background: #202722;
  text-align: start;
  border-left: 3px solid #444;
  border-right: 3px solid #444;
  border-bottom: 3px solid #444;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border-radius: 0px 0px 10px 10px;
  z-index: 1000;
  top: calc(100% ); /* Ajuste dinâmico para aparecer abaixo do botão */
  left: 0;
  width: 100%;
`;

export const DropdownItem = styled.div`
  padding: 10px 15px;
  color: #fff;
  cursor: pointer;
  background: transparent;
  &:hover {
    background: #333;
  }
`;
