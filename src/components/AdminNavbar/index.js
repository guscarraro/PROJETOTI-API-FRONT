import React, { useState } from 'react';
import './style.css';
import { FaBars, FaTimes,FaTruck, FaBoxOpen } from 'react-icons/fa';
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { GrMoney } from "react-icons/gr";
import { SlGraph } from "react-icons/sl";
const RadialMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          <button className="menu-item"  style={{ '--angle': '0deg' }} onClick={() => alert('Frete')}>
            <FaTruck color="white" />
          </button>
          <button className="menu-item" style={{ '--angle': '45deg' }} onClick={() => alert('Financeiro')}>
            <GrMoney  color="white" />
          </button>
          <button className="menu-item" style={{ '--angle': '90deg' }} onClick={() => alert('SAC')}>
            <HiChatBubbleLeftRight  color="white" />
          </button>
          <button className="menu-item" style={{ '--angle': '135deg' }} onClick={() => alert('Operacional')}>
          <FaBoxOpen color="white"/>
          </button>
          <button className="menu-item" style={{ '--angle': '180deg' }} onClick={() => alert('Dashboard')}>
            <SlGraph color="white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RadialMenu;
