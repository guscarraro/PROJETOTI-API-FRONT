import React, { useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom'; // Importa o hook useNavigate
import { FaBars, FaTimes, FaTruck, FaBoxOpen } from 'react-icons/fa';
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { GrMoney } from "react-icons/gr";
import { SlGraph } from "react-icons/sl";

const RadialMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Inicializa o hook useNavigate

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="radial-menu">
      <button className="menu-button" onClick={toggleMenu}>
        {isOpen ? <FaTimes color="white" size={24} /> : <FaBars color="white" size={24} />}
      </button>
      {isOpen && (
        <div className="menu-items">
          {/* Frete */}
          <button
            className="menu-item"
            style={{ '--angle': '0deg' }}
            onClick={() => navigate('/Frete')}
          >
            <FaTruck color="white" />
          </button>
          
          {/* Financeiro */}
          <button
            className="menu-item"
            style={{ '--angle': '45deg' }}
            onClick={() => navigate('/Financeiro')}
          >
            <GrMoney color="white" />
          </button>

          {/* SAC */}
          <button
            className="menu-item"
            style={{ '--angle': '90deg' }}
            onClick={() => navigate('/SAC')}
          >
            <HiChatBubbleLeftRight color="white" />
          </button>

          {/* Operacional */}
          <button
            className="menu-item"
            style={{ '--angle': '135deg' }}
            onClick={() => navigate('/Operacao')}
          >
            <FaBoxOpen color="white" />
          </button>

          {/* CicloPedido */}
          <button
            className="menu-item"
            style={{ '--angle': '180deg' }}
            onClick={() => navigate('/CicloPedido')}
          >
            <SlGraph color="white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RadialMenu;
