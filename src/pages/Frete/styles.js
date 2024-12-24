
import styled from "styled-components";


export const ContainerGeralFrete = styled.div`
  background-color: #202722; 
  background-image: radial-gradient(#333 1px, transparent 1px);
  background-size: 20px 20px;
  min-width: 100%;
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
    justify-content: space-between;
  color: #fff;
  z-index: 100;
}
`;
export const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-around;
 
  width: 100%;
`;

export const NavButton = styled.button`
  color: #fff;
  background-color: ${(props) => (props.active ? "#007bff" : "transparent")};
  border: 0;
  border-left: 3px solid #444;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 0px 0px 5px 5px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
  width:100%;
  &:hover {
    background-color: ${(props) => (props.active ? "#0056b3" : "#555")};
  }
`;

export const NavIcon = styled.span`
  margin-right: 8px;
`;
