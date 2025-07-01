import React, { useState, useEffect } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Label, Row, Col
} from 'reactstrap';

const ModalDespesa = ({
  isOpen, setIsOpen,
  setVeiculos, setMotoristas,
  veiculos, motoristas,
  motoristaEditando, setMotoristaEditando,
  veiculoEditando, setVeiculoEditando
}) => {
  const [veiculo, setVeiculo] = useState({ tipo: '', custoMensal: 0, custoKm: 0, kmMensal: 0, quantidade: 1 });
  const [motorista, setMotorista] = useState({ custoMensal: 0, quantidade: 1 });

  useEffect(() => {
    if (veiculoEditando) setVeiculo(veiculoEditando);
    if (motoristaEditando) setMotorista(motoristaEditando);
  }, [veiculoEditando, motoristaEditando]);

  const salvarVeiculo = () => {
    if (veiculoEditando?.index >= 0) {
      const novos = [...veiculos];
      novos[veiculoEditando.index] = veiculo;
      setVeiculos(novos);
      setVeiculoEditando(null);
    } else {
      setVeiculos([...veiculos, veiculo]);
    }
    setVeiculo({ tipo: '', custoMensal: 0, custoKm: 0, kmMensal: 0, quantidade: 1 });
  };

  const salvarMotorista = () => {
    if (motoristaEditando?.index >= 0) {
      const novos = [...motoristas];
      novos[motoristaEditando.index] = motorista;
      setMotoristas(novos);
      setMotoristaEditando(null);
    } else {
      setMotoristas([...motoristas, motorista]);
    }
    setMotorista({ custoMensal: 0, quantidade: 1 });
  };

  return (
    <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} size="lg">
      <ModalHeader toggle={() => setIsOpen(!isOpen)}>Editar/Adicionar Despesa</ModalHeader>
      <ModalBody>
        <h6>Veículo</h6>
        <Row>
          <Col md="3">
            <Label>Tipo</Label>
            <Input value={veiculo.tipo} onChange={e => setVeiculo({ ...veiculo, tipo: e.target.value })} />
          </Col>
          <Col md="2">
            <Label>Qtd</Label>
            <Input type="number" value={veiculo.quantidade} onChange={e => setVeiculo({ ...veiculo, quantidade: parseInt(e.target.value) })} />
          </Col>
          <Col md="2">
            <Label>Mensal (R$)</Label>
            <Input type="number" value={veiculo.custoMensal} onChange={e => setVeiculo({ ...veiculo, custoMensal: parseFloat(e.target.value) })} />
          </Col>
          <Col md="2">
            <Label>KM/Mês</Label>
            <Input type="number" value={veiculo.kmMensal} onChange={e => setVeiculo({ ...veiculo, kmMensal: parseInt(e.target.value) })} />
          </Col>
          <Col md="3">
            <Label>Custo/KM (R$)</Label>
            <Input type="number" value={veiculo.custoKm} onChange={e => setVeiculo({ ...veiculo, custoKm: parseFloat(e.target.value) })} />
          </Col>
        </Row>
        <Button color="primary" className="mt-2" onClick={salvarVeiculo}>
          {veiculoEditando ? "Salvar Edição" : "+ Veículo"}
        </Button>

        <hr />
        <h6>Motorista</h6>
        <Row>
          <Col md="6">
            <Label>Mensal (R$)</Label>
            <Input type="number" value={motorista.custoMensal} onChange={e => setMotorista({ ...motorista, custoMensal: parseFloat(e.target.value) })} />
          </Col>
          <Col md="6">
            <Label>Quantidade</Label>
            <Input type="number" value={motorista.quantidade} onChange={e => setMotorista({ ...motorista, quantidade: parseInt(e.target.value) })} />
          </Col>
        </Row>
        <Button color="primary" className="mt-2" onClick={salvarMotorista}>
          {motoristaEditando ? "Salvar Edição" : "+ Motorista"}
        </Button>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => {
          setIsOpen(false);
          setVeiculoEditando(null);
          setMotoristaEditando(null);
        }}>Fechar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalDespesa;
