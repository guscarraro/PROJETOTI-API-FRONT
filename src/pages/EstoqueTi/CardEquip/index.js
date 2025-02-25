import React from 'react';
import { CustomCard, EditButton } from './style';
import { FaLaptop, FaDesktop, FaNetworkWired, FaWifi } from 'react-icons/fa';

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
    <CustomCard onClick={onClick}> {/* ✅ O evento de clique está ativado */}
      <div style={{ position: 'relative', padding: '20px', textAlign: 'flex-start' , display: 'flex',

    flexDirection:'column',
    justifyContent: 'center',
    alignItems: 'flex-start'}}>
        
        <h5 style={{ position: 'relative', padding: '20px', textAlign: 'center' }}>{renderIcon(equipamento.tipo_aparelho)} {equipamento.tipo_aparelho}</h5>
        <p><strong>Responsável:</strong> {equipamento.pessoa_responsavel || 'Não informado'}</p>
        <p><strong>Email:</strong> {equipamento.email_utilizado || 'Não informado'}</p>
        <p><strong>Cloud:</strong> {equipamento.cloud_utilizado || 'Não informado'}</p>
        {/* Botão de edição */}
        <EditButton onClick={(e) => {
          e.stopPropagation(); // Impede o clique de abrir o modal de detalhes ao clicar em editar
          onEdit();
        }}>
          ✏️
        </EditButton>
      </div>
    </CustomCard>
  );
}

export default CardEquip;
