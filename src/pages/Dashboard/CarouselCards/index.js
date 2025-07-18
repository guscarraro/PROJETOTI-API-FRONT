import React, { useRef, useState } from 'react';
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';

import Card from './Card';

const CarouselCards = ({
  groupedDataByStatus,
  calculateTotalNotesByStatus,
  calculateOverallNotes,
  dropdownOpen,
  toggleDropdown,
  filteredData,
  ocorrenciasPorNota,
  loadingOcorrencias
}) => {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Velocidade do arraste
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scrollLeftBtn = () => {
    scrollRef.current.scrollBy({ left: -370, behavior: 'smooth' });
  };

  const scrollRightBtn = () => {
    scrollRef.current.scrollBy({ left: 370, behavior: 'smooth' });
  };

  const boxColors = {
    today: 'rgba(255, 215, 0, 0.35)',
    tomorrow: 'rgba(0, 255, 127, 0.35)',
    inTwoDays: 'rgba(255, 165, 0, 0.35)',
    overdue: 'rgba(255, 69, 0, 0.35)',
    inThreeDays: 'rgba(32, 178, 170, 0.35)',
    aguardandoAgendamento: 'rgba(105, 105, 105, 0.5)', // cinza escuro
  semPrevisao: 'rgba(70, 70, 70, 0.5)',
  };
  const buttonStyle = {
  position: 'absolute',
  top: '0%',
  zIndex: 10,
  background: 'linear-gradient(135deg, #007bff, #00c6ff)',
  border: 'none',
  padding: '10px 12px',
  borderRadius: '10px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  cursor: 'pointer',
  color: '#fff',
  transition: 'transform 0.2s ease',
};

const hoverStyle = {
  transform: 'scale(1.1)',
};


  return (
    <div style={{ position: 'relative' }}>
        {/* Instrução para o usuário */}
    <p style={{
      textAlign: 'center',
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '12px',
      color: '#fff'
    }}>
      Clique na seta ao lado ou abaixo segure o botão esquerdo do mouse e arraste para o lado que deseja visualizar
    </p>
      {/* Botões */}
     <button
  onClick={scrollLeftBtn}
  style={{
    ...buttonStyle,
    left: 0,
  }}
  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
>
  <HiOutlineArrowNarrowLeft />
</button>

<button
  onClick={scrollRightBtn}
  style={{
    ...buttonStyle,
    right: 0,
  }}
  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
>
  <HiOutlineArrowNarrowRight />
</button>


      {/* Scroll Container com drag */}
      <div
        ref={scrollRef}
        style={{
          overflowX: 'auto',
          display: 'flex',
          scrollBehavior: 'smooth',
          gap: 20,
          padding: '0 40px',
          cursor: isDragging.current ? 'grabbing' : 'grab',
        }}
        className="hide-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {[ 'aguardandoAgendamento', 'semPrevisao','inThreeDays', 'inTwoDays', 'tomorrow', 'today', 'overdue'].map((status, index) => (

          <div
            key={index}
            style={{
              flex: '0 0 370px',
            }}
          >
            <Card
              status={status}
              data={groupedDataByStatus[status]}
               calculateTotalNotesByStatus={(group) =>
    calculateTotalNotesByStatus(group, status)
  }
              calculateOverallNotes={calculateOverallNotes}
              dropdownOpen={dropdownOpen}
              toggleDropdown={toggleDropdown}
              filteredData={filteredData}
              bgColor={boxColors[status]}
              filteredDataByStatus={groupedDataByStatus} 
              ocorrenciasPorNota={ocorrenciasPorNota}
              loadingOcorrencias={loadingOcorrencias} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselCards;
