import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import ModalAdd from './ModalAdd';
import CardEquip from './CardEquip';
import ModalEdit from './ModalEdit';
import apiLocal from '../../services/apiLocal';
import { EditButton, StyledContainer, SetorSection, AlmoxarifadoSection } from './style';
import { toast } from 'react-toastify';

function EstoqueTi() {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de adicionar
  const [equipamentos, setEquipamentos] = useState([]);
  const [selectedEquipamento, setSelectedEquipamento] = useState(null); // Modal de detalhes
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal de edição
  const [equipamentoToEdit, setEquipamentoToEdit] = useState(null);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleEditModal = () => setIsEditModalOpen(!isEditModalOpen);
  const toggleDetailsModal = () => setSelectedEquipamento(null); // Fechar modal de detalhes

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
      await apiLocal.createOrUpdateControleEstoque(updatedEquipamento); // Atualiza o equipamento
      fetchEquipamentos(); // Recarrega a lista de equipamentos atualizada
      setIsEditModalOpen(false); // Fecha o modal de edição
      toast.success('Equipamento editado com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar as alterações:', error);
    }
  };

  return (
    <StyledContainer>
      <Container fluid>
        <Row>
          <Col md={12} className="text-center mb-4">
            <h1>Estoque TI</h1>
          </Col>
          <Col md={12} className="text-center">
            <Button color="primary" onClick={toggleModal}>
              + Adicionar ao Estoque
            </Button>
          </Col>
        </Row>

        {/* Exibição por Setor */}
        {setores.map((setor) => (
          <SetorSection key={setor}>
            <h3>{setor}</h3>
            <hr />
            <Row>
              {equipamentos
                .filter((eq) => eq.setor === setor)
                .map((equipamento) => (
                  <Col md={3} key={equipamento.id}>
                    <CardEquip
                      equipamento={equipamento}
                      onClick={() => setSelectedEquipamento(equipamento)} // Abre o modal de detalhes
                      onEdit={() => handleEditClick(equipamento)} // Abre o modal de edição
                    />
                  </Col>
                ))}
            </Row>
          </SetorSection>
        ))}

        {/* Almoxarifado Fixo na Direita */}
        <AlmoxarifadoSection>
          <h4>Backup</h4>
          {equipamentos
            .filter((eq) => eq.setor === 'Almoxarifado')
            .map((equipamento) => (
              <CardEquip
                key={equipamento.id}
                equipamento={equipamento}
                onClick={() => setSelectedEquipamento(equipamento)} // Detalhes
                onEdit={() => handleEditClick(equipamento)} // Editar
              />
            ))}
        </AlmoxarifadoSection>

        {/* Modal de Adicionar */}
        {isModalOpen && <ModalAdd isOpen={isModalOpen} toggle={toggleModal} />}

        {/* Modal de Edição */}
        {isEditModalOpen && (
          <ModalEdit
            isOpen={isEditModalOpen}
            toggle={toggleEditModal}
            equipamento={equipamentoToEdit}
            onSave={handleSaveEdit} // Função de salvar alterações
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
              <p><strong>Periféricos:</strong> {selectedEquipamento.perifericos || 'Nenhum'}</p>
              <p><strong>Chamadas Duas Telas:</strong> {selectedEquipamento.chamadas_duas_telas === 'S' ? 'Sim' : 'Não'}</p>
              <p><strong>Descrição:</strong> {selectedEquipamento.descricao}</p>
              <p><strong>Observações:</strong> {selectedEquipamento.observacoes || 'Sem observações'}</p>
              <p><strong>Localização Física:</strong> {selectedEquipamento.localizacao_fisica}</p>
            </ModalBody>
          </Modal>
        )}
      </Container>
    </StyledContainer>
  );
}

export default EstoqueTi;
