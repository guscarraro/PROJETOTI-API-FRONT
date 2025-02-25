import React from 'react';
import { CustomCard, EditButton } from './style';
import { FaLaptop, FaDesktop, FaNetworkWired, FaWifi, FaPencilAlt } from 'react-icons/fa';

function CardEquip({ equipamento, onClick, onEdit }) {
  // Definindo o ícone de acordo com o tipo de aparelho
  const renderIcon = (tipo) => {
    switch (tipo) {
      case 'Notebook':
        return <FaLaptop size={40} />;
      case 'Desktop':
        return <FaDesktop size={40} />;
      case 'Switch':
        return <FaNetworkWired size={40} />;
      case 'Roteador':
        return <FaWifi size={40} />;
      default:
        return <FaDesktop size={40} />;
    }
  };

  return (
    <CustomCard onClick={onClick}>
      {/* Botão de edição com ícone de lápis */}
      <EditButton
        onClick={(e) => {
          e.stopPropagation(); // Impede o clique de abrir o modal de detalhes ao clicar em editar
          onEdit();
        }}
      >
        <FaPencilAlt size={12} />
      </EditButton>

      <div
        style={{
          padding: '20px',
          textAlign: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <h5 style={{ textAlign: 'center' }}>
          {renderIcon(equipamento.tipo_aparelho)} {equipamento.tipo_aparelho}
        </h5>
        <p><strong>Responsável:</strong> {equipamento.pessoa_responsavel || 'Não informado'}</p>
        <p><strong>Email:</strong> {equipamento.email_utilizado || 'Não informado'}</p>
        <p><strong>Cloud:</strong> {equipamento.cloud_utilizado || 'Não informado'}</p>
      </div>
    </CustomCard>
  );
}

export default CardEquip;
