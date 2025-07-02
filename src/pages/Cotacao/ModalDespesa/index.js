import React, { useState } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Label, Row, Col
} from 'reactstrap';

const frequencias = {
  mensal: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12
};

const ModalDespesa = ({ isOpen, setIsOpen, onSalvar }) => {
  const [veiculos, setVeiculos] = useState([]);
  const [custosVariaveis, setCustosVariaveis] = useState({});
  const [depreciacao, setDepreciacao] = useState({ valorVenda: 0, anosUso: 5 });
  const [motoristas, setMotoristas] = useState([]);
  const [remuneracao, setRemuneracao] = useState({ taxa: 1 });
  const [licenciamento, setLicenciamento] = useState(0);
  const [ipva, setIpva] = useState(1.5);
  const [seguro, setSeguro] = useState(0);
  const [outrosCustos, setOutrosCustos] = useState([]);

  const adicionarVeiculo = () => {
    setVeiculos([...veiculos, { tipo: '', valor: 0, kmMes: 0, quantidade: 1 }]);
  };

  const adicionarMotorista = () => {
    setMotoristas([...motoristas, { salario: 0, quantidade: 1 }]);
  };

  const adicionarOutroCusto = () => {
    setOutrosCustos([...outrosCustos, { nome: '', valor: 0, porcentagem: false, frequencia: 'mensal' }]);
  };

  const salvar = () => {
    onSalvar({ veiculos, custosVariaveis, depreciacao, motoristas, remuneracao, licenciamento, ipva, seguro, outrosCustos });
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} size="xl">
      <ModalHeader toggle={() => setIsOpen(!isOpen)}>Cadastrar Despesas Operacionais</ModalHeader>
      <ModalBody>
        <h6>1. Veículo</h6>
        {veiculos.map((v, idx) => (
          <Row key={idx} className="mb-2 border-bottom pb-2">
            <Col md="3">
              <Label>Tipo</Label>
              <Input type="select" value={v.tipo} onChange={e => {
                const novos = [...veiculos];
                novos[idx].tipo = e.target.value;
                setVeiculos(novos);
              }}>
                <option value="">Selecione</option>
                <option value="Fiorino">Fiorino</option>
                <option value="3/4">3/4</option>
                <option value="Toco">Toco</option>
                <option value="Truck">Truck</option>
                <option value="Carreta">Carreta</option>
              </Input>
            </Col>
            <Col md="2">
              <Label>Valor do Veículo (R$)</Label>
              <Input type="number" value={v.valor} onChange={e => {
                const novos = [...veiculos];
                novos[idx].valor = parseFloat(e.target.value);
                setVeiculos(novos);
              }} />
            </Col>
            <Col md="2">
              <Label>KM/mês</Label>
              <Input type="number" value={v.kmMes} onChange={e => {
                const novos = [...veiculos];
                novos[idx].kmMes = parseFloat(e.target.value);
                setVeiculos(novos);
              }} />
            </Col>
            <Col md="2">
              <Label>Qtd</Label>
              <Input type="number" value={v.quantidade} onChange={e => {
                const novos = [...veiculos];
                novos[idx].quantidade = parseInt(e.target.value);
                setVeiculos(novos);
              }} />
            </Col>
          </Row>
        ))}
        <Button color="primary" onClick={adicionarVeiculo}>+ Veículo</Button>

        <hr />
        <h6>2. Combustível</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>Valor do litro (R$)</Label>
            <Input type="number" onChange={e => setCustosVariaveis({ ...custosVariaveis, combustivelValor: parseFloat(e.target.value) })} />
          </Col>
          <Col md="3">
            <Label>Consumo (km/l)</Label>
            <Input type="number" onChange={e => setCustosVariaveis({ ...custosVariaveis, combustivelConsumo: parseFloat(e.target.value) })} />
          </Col>
        </Row>

        <h6>3. Óleo do Motor</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>Troca a cada (km)</Label>
            <Input type="number" onChange={e => setCustosVariaveis({ ...custosVariaveis, oleoKm: parseFloat(e.target.value) })} />
          </Col>
          <Col md="3">
            <Label>Valor da troca (R$)</Label>
            <Input type="number" onChange={e => setCustosVariaveis({ ...custosVariaveis, oleoValor: parseFloat(e.target.value) })} />
          </Col>
        </Row>

        <h6>4. Limpeza</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>Feita a cada (km)</Label>
            <Input type="number" onChange={e => setCustosVariaveis({ ...custosVariaveis, limpezaKm: parseFloat(e.target.value) })} />
          </Col>
          <Col md="3">
            <Label>Valor (R$)</Label>
            <Input type="number" onChange={e => setCustosVariaveis({ ...custosVariaveis, limpezaValor: parseFloat(e.target.value) })} />
          </Col>
        </Row>

        <h6>5. Pneus</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>Troca a cada (km)</Label>
            <Input type="number" onChange={e => setCustosVariaveis({ ...custosVariaveis, pneusKm: parseFloat(e.target.value) })} />
          </Col>
          <Col md="3">
            <Label>Valor (R$)</Label>
            <Input type="number" onChange={e => setCustosVariaveis({ ...custosVariaveis, pneusValor: parseFloat(e.target.value) })} />
          </Col>
        </Row>

        <h6>6. Manutenção</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>Coeficiente do veículo (%)</Label>
            <Input type="number" defaultValue={5} onChange={e => setCustosVariaveis({ ...custosVariaveis, manutencaoPct: parseFloat(e.target.value) })} />
          </Col>
        </Row>

        <h6>7. Depreciação</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>Valor estimado de venda (R$)</Label>
            <Input type="number" value={depreciacao.valorVenda} onChange={e => setDepreciacao({ ...depreciacao, valorVenda: parseFloat(e.target.value) })} />
          </Col>
          <Col md="3">
            <Label>Anos de uso</Label>
            <Input type="number" value={depreciacao.anosUso} onChange={e => setDepreciacao({ ...depreciacao, anosUso: parseInt(e.target.value) })} />
          </Col>
        </Row>

        <h6>8. Motorista</h6>
        {motoristas.map((m, idx) => (
          <Row key={idx} className="mb-2">
            <Col md="3">
              <Label>Salário (R$)</Label>
              <Input type="number" value={m.salario} onChange={e => {
                const novos = [...motoristas];
                novos[idx].salario = parseFloat(e.target.value);
                setMotoristas(novos);
              }} />
            </Col>
            <Col md="2">
              <Label>Qtd</Label>
              <Input type="number" value={m.quantidade} onChange={e => {
                const novos = [...motoristas];
                novos[idx].quantidade = parseInt(e.target.value);
                setMotoristas(novos);
              }} />
            </Col>
          </Row>
        ))}
        <Button color="primary" onClick={adicionarMotorista}>+ Motorista</Button>

        <h6>9. Remuneração do Capital</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>% ao mês</Label>
            <Input type="number" value={remuneracao.taxa} onChange={e => setRemuneracao({ taxa: parseFloat(e.target.value) })} />
          </Col>
        </Row>

        <h6>10. Licenciamento + Seg. Obrigatório</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>Valor (R$)</Label>
            <Input type="number" value={licenciamento} onChange={e => setLicenciamento(parseFloat(e.target.value))} />
          </Col>
        </Row>

        <h6>11. IPVA</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>% sobre valor do veículo</Label>
            <Input type="number" value={ipva} onChange={e => setIpva(parseFloat(e.target.value))} />
          </Col>
        </Row>

        <h6>12. Seguro</h6>
        <Row className="mb-2">
          <Col md="3">
            <Label>Valor total (R$)</Label>
            <Input type="number" value={seguro} onChange={e => setSeguro(parseFloat(e.target.value))} />
          </Col>
        </Row>

        <h6>13. Outros Custos</h6>
        {outrosCustos.map((c, idx) => (
          <Row key={idx} className="mb-2">
            <Col md="4">
              <Label>Nome</Label>
              <Input value={c.nome} onChange={e => {
                const novos = [...outrosCustos];
                novos[idx].nome = e.target.value;
                setOutrosCustos(novos);
              }} />
            </Col>
            <Col md="3">
              <Label>Valor</Label>
              <Input type="number" value={c.valor} onChange={e => {
                const novos = [...outrosCustos];
                novos[idx].valor = parseFloat(e.target.value);
                setOutrosCustos(novos);
              }} />
            </Col>
            <Col md="3">
              <Label>Frequência</Label>
              <Input type="select" value={c.frequencia} onChange={e => {
                const novos = [...outrosCustos];
                novos[idx].frequencia = e.target.value;
                setOutrosCustos(novos);
              }}>
                {Object.keys(frequencias).map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </Input>
            </Col>
          </Row>
        ))}
        <Button color="primary" onClick={adicionarOutroCusto}>+ Custo</Button>
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={salvar}>Salvar</Button>
        <Button color="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalDespesa;
