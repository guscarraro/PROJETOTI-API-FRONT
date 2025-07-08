import React from 'react';
import { CustomCard, EditButton } from './style';
import { FaLaptop, FaDesktop, FaNetworkWired, FaWifi, FaPencilAlt, FaMobileAlt, FaEnvelope ,FaBarcode } from 'react-icons/fa';
import { LiaMicrochipSolid } from "react-icons/lia";
import { Button, Row } from 'reactstrap';

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

function CardEquip({ equipamento, onClick, onEdit, onDelete }) {

  const renderIcon = (tipo, descricao) => {
    switch (tipo) {
      case 'Notebook':
        return <FaLaptop size={40} />;
      case 'Desktop':
        return <FaDesktop size={40} />;
      case 'Switch':
        return <FaNetworkWired size={40} />;
      case 'Celular':
        if (descricao.includes("Celular+Chip")) {
          return (
            <>
              <FaMobileAlt size={30} /> <LiaMicrochipSolid size={30} />
            </>
          );
        } else if (descricao.includes("Celular")) {
          return <FaMobileAlt size={40} />;
        } else if (descricao.includes("Chip")) {
          return <LiaMicrochipSolid size={40} />;
        }
        return <FaMobileAlt size={40} />;
      case 'Roteador':
        return <FaWifi size={40} />;
      case 'Coletor':
        return <FaBarcode size={40} />;
      case 'Licença':
        return <FaEnvelope size={40} />;
      default:
        return <FaDesktop size={40} />;
    }
  };
  
console.log(equipamento);

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
       <Button
  color="danger"
  size="sm"
  onClick={(e) => {
    e.stopPropagation();
    onDelete(equipamento); // <-- envia o objeto para o modal
  }}
  style={{
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    padding: 5,
    borderRadius: 10,
    cursor: 'pointer',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  🗑️
</Button>

         
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
  {renderIcon(equipamento.tipo_aparelho, equipamento.descricao)} 
  {equipamento.tipo_aparelho === "Celular"
    ? equipamento.descricao.includes("Celular+Chip") 
      ? " Celular+Chip" 
      : equipamento.descricao.includes("Chip") && !equipamento.descricao.includes("Celular") 
        ? " Apenas Chip" 
        : " Celular"
    : ` ${equipamento.tipo_aparelho}`}
</h5>


 {equipamento.tipo_aparelho === "Celular" ?
 <>
        <p><strong>Responsável:</strong> {equipamento.pessoa_responsavel || 'Não informado'}</p>
        <p><strong>Descrição:</strong> {equipamento.descricao || 'Não informado'}</p>
 </>
        :
        <>
        <p><strong>Responsável:</strong> {equipamento.pessoa_responsavel || 'Não informado'}</p>
        <p><strong>Email:</strong> {equipamento.email_utilizado || 'Não informado'}</p>
        <p><strong>Cloud:</strong> {equipamento.cloud_utilizado || 'Não informado'}</p>
        <p><strong>HostName:</strong> {equipamento.observacoes || 'Não informado'}</p>
        </>}
      </div>
    </CustomCard>
  );
}

export default CardEquip;
