import styled from "styled-components";

export const RadialMenuContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 30px;
  z-index: 1000;
`;

export const MenuButton = styled.button`
  position: relative;
  top: -70px;
  left: -70px;
  width: 60px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border: solid 1px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  z-index: 1000;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

export const MenuItems = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
`;

export const MenuItem = styled.button`
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;
  transform: rotate(var(--angle)) translate(80px) rotate(calc(var(--angle) * -1));

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
    transform: rotate(var(--angle)) translate(90px) rotate(calc(var(--angle) * -1)) scale(1.2);
  }
`;
