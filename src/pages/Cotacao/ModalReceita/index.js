import React, { useState, useEffect } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Label, Row, Col
} from 'reactstrap';

const ModalReceita = ({ isOpen, setIsOpen, setReceitas, receitas, receitaEditando, setReceitaEditando }) => {
  const [nova, setNova] = useState({
    receitaFrete: 0,
    valorCargaMedia: 0,
    adValorem: 0,
    gris: 0,
    quantidadeSemanal: 1,
    estadoOrigem: '',
    estadoDestino: '',
    icms: false,
    rota: ''
  });

  useEffect(() => {
    if (receitaEditando) setNova(receitaEditando);
  }, [receitaEditando]);

  const calcularValores = () => {
    const viagensMensais = nova.quantidadeSemanal * 4;
    const receitaFrete = nova.receitaFrete * viagensMensais;
    const valorCargaTotal = nova.valorCargaMedia * viagensMensais;

    const valorAdValorem = (nova.adValorem / 100) * valorCargaTotal;
    const valorGris = (nova.gris / 100) * valorCargaTotal;

    let valorICMS = 0;
    if (nova.icms && nova.estadoOrigem && nova.estadoDestino) {
      const aliquota = nova.estadoOrigem === nova.estadoDestino ? 0.12 : 0.18;
      valorICMS = aliquota * receitaFrete;
    }

    const receitaTotal = receitaFrete + valorAdValorem + valorGris;

    return {
      receitaFrete,
      valorAdValorem,
      valorGris,
      valorICMS,
      receitaTotal,
      viagensMensais
    };
  };

  const salvar = () => {
    const calculado = calcularValores();

    if (receitaEditando?.index >= 0) {
      const novas = [...receitas];
      novas[receitaEditando.index] = { ...nova, ...calculado };
      setReceitas(novas);
      setReceitaEditando(null);
    } else {
      setReceitas([...receitas, { ...nova, ...calculado }]);
    }

    setNova({
      receitaFrete: 0,
      valorCargaMedia: 0,
      adValorem: 0,
      gris: 0,
      quantidadeSemanal: 1,
      estadoOrigem: '',
      estadoDestino: '',
      icms: false,
      rota: ''
    });
    setIsOpen(false);
  };

  const preview = calcularValores();

  return (
    <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} size="lg">
      <ModalHeader toggle={() => setIsOpen(!isOpen)} style={{ background: '#f0f0' }}>
        {receitaEditando ? 'Editar Receita' : 'Adicionar Receita'}
      </ModalHeader>
      <ModalBody style={{ background: '#f0f0' }}>
        <Row>
          <Col md="4">
            <Label>Frete por viagem (R$)</Label>
            <Input type="number" value={nova.receitaFrete} onChange={e => setNova({ ...nova, receitaFrete: parseFloat(e.target.value) || 0 })} />
          </Col>
          <Col md="4">
            <Label>Valor médio da carga (R$)</Label>
            <Input type="number" value={nova.valorCargaMedia} onChange={e => setNova({ ...nova, valorCargaMedia: parseFloat(e.target.value) || 0 })} />
          </Col>
          <Col md="4">
            <Label>Viagens/Semana</Label>
            <Input type="number" value={nova.quantidadeSemanal} onChange={e => setNova({ ...nova, quantidadeSemanal: parseInt(e.target.value) || 0 })} />
          </Col>
        </Row>

        <Row className="mt-2">
          <Col md="4">
            <Label>Ad Valorem (%)</Label>
            <Input type="number" value={nova.adValorem} onChange={e => setNova({ ...nova, adValorem: parseFloat(e.target.value) || 0 })} />
          </Col>
          <Col md="4">
            <Label>GRIS (%)</Label>
            <Input type="number" value={nova.gris} onChange={e => setNova({ ...nova, gris: parseFloat(e.target.value) || 0 })} />
          </Col>
          <Col md="4">
            <Label>ICMS?</Label><br />
            <Input type="checkbox" checked={nova.icms} onChange={e => setNova({ ...nova, icms: e.target.checked })} />
          </Col>
        </Row>

        <Row className="mt-2">
          <Col md="6">
            <Label>UF Origem</Label>
            <Input value={nova.estadoOrigem} onChange={e => setNova({ ...nova, estadoOrigem: e.target.value })} />
          </Col>
          <Col md="6">
            <Label>UF Destino</Label>
            <Input value={nova.estadoDestino} onChange={e => setNova({ ...nova, estadoDestino: e.target.value })} />
          </Col>
        </Row>

        <Row className="mt-2">
          <Col>
            <Label>Nome da Rota</Label>
            <Input value={nova.rota} onChange={e => setNova({ ...nova, rota: e.target.value })} />
          </Col>
        </Row>

        <hr />
        <h6>📊 Visualização da Receita Mensal Prevista</h6>
        <ul>
          <li><strong>Qtd Viagens/Mês:</strong> {preview.viagensMensais}</li>
          <li><strong>Frete Total:</strong> R$ {preview.receitaFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
          <li><strong>Ad Valorem:</strong> R$ {preview.valorAdValorem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
          <li><strong>GRIS:</strong> R$ {preview.valorGris.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
          {nova.icms && (
            <li><strong>ICMS Estimado:</strong> R$ {preview.valorICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
          )}
          <li><strong>Total Receita Bruta:</strong> R$ {preview.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
        </ul>
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={salvar}>Salvar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalReceita;
