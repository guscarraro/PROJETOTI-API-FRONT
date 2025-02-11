import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import ModalAdd from './ModalAdd'; // Importa o modal de adicionar
import './style.css';

function EstoqueTi() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="boxGeneral">
      <Container fluid className="d-flex align-items-center justify-content-center">
        <Row>
          <Col md={12} className="text-center mb-4">
            <h1 style={{ color: 'white' }}>Estoque TI</h1>
          </Col>
          <Col md={12} className="text-center">
            <Button color="primary" onClick={toggleModal}>
              + Adicionar ao Estoque
            </Button>
          </Col>
        </Row>
      </Container>
      {/* Modal */}
      {isModalOpen && <ModalAdd isOpen={isModalOpen} toggle={toggleModal} />}
    </div>
  );
}

export default EstoqueTi;
