import React from 'react';
import { CustomCard, EditButton } from './style';
import { FaLaptop, FaDesktop, FaNetworkWired, FaWifi, FaPencilAlt, FaMobileAlt } from 'react-icons/fa';

// Função para definir a cor com base no status
const getStatusStyle = (status) => {
  switch (status) {
    case 'Em Uso':
      return { backgroundColor: "rgba(0, 255, 127, 0.35)" }; // Verde
    case 'Pendente':
      return { backgroundColor: "rgba(255, 215, 0, 0.35)" }; // Amarelo
    case 'Manutenção':
      return { backgroundColor: "rgba(255, 165, 0, 0.35)" }; // Laranja
    case 'Inativo':
      return { backgroundColor: "rgba(255, 69, 0, 0.35)" }; // Vermelho
    default:
      return { backgroundColor: "rgba(200, 200, 200, 0.35)" }; // Cinza padrão
  }
};

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
      case 'Celular':
        return <FaMobileAlt size={40} />
      case 'Roteador':
        return <FaWifi size={40} />;
      default:
        return <FaDesktop size={40} />;
    }
  };

  return (
    <CustomCard onClick={onClick} style={getStatusStyle(equipamento.status)}>
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
