import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import ModalAdd from './ModalAdd';
import CardEquip from './CardEquip';
import ModalEdit from './ModalEdit';
import apiLocal from '../../services/apiLocal';
import { EditButton, StyledContainer, SetorSection, CardStyle } from './style';
import { toast } from 'react-toastify';
import { FaLaptop, FaDesktop, FaCloud, FaEnvelope, FaDatabase } from 'react-icons/fa';
import ModalCloud from './ModalCloud';
import ModalLicenca from './ModalLicenca';
import ModalAparelho from './ModalAparelho';



function EstoqueTi() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipamentos, setEquipamentos] = useState([]);
  const [selectedEquipamento, setSelectedEquipamento] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [equipamentoToEdit, setEquipamentoToEdit] = useState(null);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [microsoftModalOpen, setMicrosoftModalOpen] = useState(false);
  const [aparelhoModalOpen, setAparelhoModalOpen] = useState(false);
  
  const toggleAparelhoModal = () => setAparelhoModalOpen(!aparelhoModalOpen);
  const toggleCloudModal = () => setCloudModalOpen(!cloudModalOpen);
  const toggleMicrosoftModal = () => setMicrosoftModalOpen(!microsoftModalOpen);
  
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleEditModal = () => setIsEditModalOpen(!isEditModalOpen);
  const toggleDetailsModal = () => setSelectedEquipamento(null);

  const fetchEquipamentos = async () => {
    try {
      const response = await apiLocal.getControleEstoque();
      setEquipamentos(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
    }
  };

  useEffect(() => {
    fetchEquipamentos();
  }, []);

  const setores = [...new Set(equipamentos.map((eq) => eq.setor))];

  const handleEditClick = (equipamento) => {
    setEquipamentoToEdit(equipamento);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedEquipamento) => {
    try {
      await apiLocal.createOrUpdateControleEstoque(updatedEquipamento);
      fetchEquipamentos();
      setIsEditModalOpen(false);
      toast.success('Equipamento editado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar as alterações:', error);
    }
  };

  // **Correção do contador de Clouds Ativos**
  const cloudsFiltrados = equipamentos
    .filter(eq => eq.cloud_utilizado?.trim() && eq.cloud_utilizado.trim() !== "NA")
    .map(eq => eq.cloud_utilizado.trim());

  const totalCloudsAtivos = [...new Set(cloudsFiltrados)].length;

  return (
    <StyledContainer>
      <Container fluid>
        <ModalCloud isOpen={cloudModalOpen} toggle={toggleCloudModal} equipamentos={equipamentos} />
        <ModalLicenca isOpen={microsoftModalOpen} toggle={toggleMicrosoftModal} equipamentos={equipamentos} />
        <ModalAparelho isOpen={aparelhoModalOpen} toggle={toggleAparelhoModal} equipamentos={equipamentos} />


        <Row>
          <Col md={12} className="text-center mb-4">
            <h1>Estoque TI</h1>
          </Col>
          <Col md={12} className="text-center mb-4">
            <Button color="primary" onClick={toggleModal}>
              + Adicionar ao Estoque
            </Button>
          </Col>
        </Row>

        {/* Cards Personalizados */}
        <Row>
        <Col md={4}>
  <CardStyle 
    bgColor="rgba(70, 130, 180, 0.2)" 
    iconColor="#4682B4"
    onClick={toggleAparelhoModal} 
    style={{ cursor: "pointer" }}
  >
    <h3>
      <FaLaptop /> Quantidade de Aparelhos
    </h3>
    <p style={{ fontSize: 32, fontWeight: 700 }}>{equipamentos.length}</p>
    <p style={{ fontSize: 14, fontStyle: "italic" }}>
      Clique para mais informações
    </p>
  </CardStyle>
</Col>


          <Col md={4}>
            <CardStyle 
              bgColor="rgba(255, 140, 0, 0.2)" 
              iconColor="#FF8C00"
              onClick={toggleCloudModal} 
              style={{ cursor: "pointer" }}
            >
              <h3>
                <FaCloud /> Clouds Ativos
              </h3>
              <p style={{ fontSize: 32, fontWeight: 700 }}>{totalCloudsAtivos}</p>
              <p style={{ fontSize: 14, fontStyle: "italic" }}>
                Clique para mais informações
              </p>
            </CardStyle>
          </Col>

          <Col md={4}>
            <CardStyle 
              bgColor="rgba(34, 139, 34, 0.2)" 
              iconColor="#228B22"
              onClick={toggleMicrosoftModal} 
              style={{ cursor: "pointer" }}
            >
              <h3>
                <FaEnvelope /> Licenças Microsoft
              </h3>
              <p style={{ fontSize: 32, fontWeight: 700 }}>{equipamentos.filter(eq => eq.email_utilizado?.trim()).length}</p>
              <p style={{ fontSize: 14, fontStyle: "italic" }}>
                Clique para mais informações
              </p>
            </CardStyle>
          </Col>
        </Row>
        <Row className="mt-3">

</Row>

{/* Exibição por Setor */}
{setores.map((setor) => (
<SetorSection key={setor}>
  <h3>{setor}</h3>
  <hr />
  <Row style={{ maxWidth: '100%' }}>
    {equipamentos
      .filter((eq) => eq.setor === setor)
      .map((equipamento) => (
        <Col md={3} key={equipamento.id}>
          <CardEquip
            equipamento={equipamento}
            onClick={() => setSelectedEquipamento(equipamento)}
            onEdit={() => handleEditClick(equipamento)}
          />
        </Col>
      ))}
  </Row>
</SetorSection>
))}

{/* Almoxarifado (Backup) - Só aparece se showBackup for verdadeiro */}


{/* Modal de Adicionar */}
{isModalOpen && <ModalAdd isOpen={isModalOpen} toggle={toggleModal} />}

{/* Modal de Edição */}
{isEditModalOpen && (
<ModalEdit
  isOpen={isEditModalOpen}
  toggle={toggleEditModal}
  equipamento={equipamentoToEdit}
  onSave={handleSaveEdit}
/>
)}

{/* Modal de Detalhes */}
{selectedEquipamento && (
<Modal isOpen={true} toggle={toggleDetailsModal} size="md">
  <ModalHeader toggle={toggleDetailsModal}>Detalhes do Equipamento</ModalHeader>
  <ModalBody>
    <p><strong>Tipo:</strong> {selectedEquipamento.tipo_aparelho}</p>
    <p><strong>Responsável:</strong> {selectedEquipamento.pessoa_responsavel || 'Não informado'}</p>
    <p><strong>Email:</strong> {selectedEquipamento.email_utilizado || 'Não informado'}</p>
    <p><strong>Cloud:</strong> {selectedEquipamento.cloud_utilizado || 'Não informado'}</p>
    <p><strong>Descrição:</strong> {selectedEquipamento.descricao}</p>
    <p><strong>Localização Física:</strong> {selectedEquipamento.localizacao_fisica}</p>
  </ModalBody>
</Modal>
)}
      </Container>
    </StyledContainer>
  );
}

export default EstoqueTi;

