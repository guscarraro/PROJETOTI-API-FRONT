import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaTruck, FaBoxOpen } from "react-icons/fa";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { GrMoney } from "react-icons/gr";
import { SlGraph } from "react-icons/sl";
import {
  RadialMenuContainer,
  MenuButton,
  MenuItems,
  MenuItem,
} from "./styles";

const RadialMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <RadialMenuContainer>
      <MenuButton onClick={toggleMenu}>
        {isOpen ? <FaTimes color="white" size={24} /> : <FaBars color="white" size={24} />}
      </MenuButton>
      {isOpen && (
        <MenuItems>
          {/* Frete */}
          <MenuItem
            style={{ "--angle": "0deg" }}
            onClick={() => navigate("/Frete")}
          >
            <FaTruck color="white" />
          </MenuItem>

          {/* Financeiro */}
          <MenuItem
            style={{ "--angle": "45deg" }}
            onClick={() => navigate("/Financeiro")}
          >
            <GrMoney color="white" />
          </MenuItem>

          {/* SAC */}
          <MenuItem
            style={{ "--angle": "90deg" }}
            onClick={() => navigate("/SAC")}
          >
            <HiChatBubbleLeftRight color="white" />
          </MenuItem>

          {/* Operacional */}
          <MenuItem
            style={{ "--angle": "135deg" }}
            onClick={() => navigate("/Operacao")}
          >
            <FaBoxOpen color="white" />
          </MenuItem>

          {/* CicloPedido */}
          <MenuItem
            style={{ "--angle": "180deg" }}
            onClick={() => navigate("/CicloPedido")}
          >
            <SlGraph color="white" />
          </MenuItem>
        </MenuItems>
      )}
    </RadialMenuContainer>
  );
};

export default RadialMenu;
