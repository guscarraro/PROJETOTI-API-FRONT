import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import Select from 'react-select'; // Importa o react-select
import apiLocal from '../../../services/apiLocal'; // Importa a API

function ModalAdd({ isOpen, toggle }) {
  const [formData, setFormData] = useState({
    status: 'P',
    setor: '',
    tipo_aparelho: '',
    email_utilizado: '',
    pessoa_responsavel: '',
    cloud_utilizado: '',
    perifericos: [],
    chamadas_duas_telas: '',
    ram: '',
    ssd: '',
    processador: '',
    numero_serie: '',
    observacoes: '',
    localizacao_fisica: '',
  });

  // Opções de periféricos para o react-select
  const perifericosOptions = [
    { value: 'Mouse novo', label: 'Mouse novo' },
    { value: 'Teclado novo', label: 'Teclado novo' },
    { value: 'Mouse velho', label: 'Mouse velho' },
    { value: 'Teclado velho', label: 'Teclado velho' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleMultiSelectChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setFormData((prevData) => ({ ...prevData, perifericos: values }));
  };

  const generateDescricao = () => {
    const { ram, ssd, processador } = formData;
    return `${ram}GB RAM, ${ssd}GB SSD, ${processador}`;
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = { ...formData, descricao: generateDescricao() }; // Concatena RAM, SSD e Processador
      await apiLocal.createEstoqueTI(dataToSend); // Envia os dados para o backend
      alert('Estoque adicionado com sucesso!');
      toggle(); // Fecha o modal
    } catch (error) {
      console.error('Erro ao adicionar ao estoque:', error);
      alert('Erro ao adicionar ao estoque.');
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Adicionar ao Estoque</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="setor">Setor</Label>
            <Input
              type="select"
              name="setor"
              value={formData.setor}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['Frota', 'Frete', 'SAC', 'Diretoria', 'Financeiro', 'RH', 'TI'].map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="tipo_aparelho">Tipo de Aparelho</Label>
            <Input
              type="select"
              name="tipo_aparelho"
              value={formData.tipo_aparelho}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['Notebook', 'Desktop', 'Switch', 'Roteador', 'Servidor', 'Monitor'].map(
                (aparelho) => (
                  <option key={aparelho} value={aparelho}>
                    {aparelho}
                  </option>
                )
              )}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="email_utilizado">Email Utilizado</Label>
            <Input
              type="email"
              name="email_utilizado"
              value={formData.email_utilizado}
              onChange={handleInputChange}
              placeholder="Digite o email"
            />
          </FormGroup>
          <FormGroup>
            <Label for="pessoa_responsavel">Pessoa Responsável</Label>
            <Input
              type="text"
              name="pessoa_responsavel"
              value={formData.pessoa_responsavel}
              onChange={handleInputChange}
              placeholder="Nome do responsável"
            />
          </FormGroup>
          <FormGroup>
            <Label for="cloud_utilizado">Cloud Utilizado</Label>
            <Input
              type="email"
              name="cloud_utilizado"
              value={formData.cloud_utilizado}
              onChange={handleInputChange}
              placeholder="Email do cloud"
            />
          </FormGroup>
          <FormGroup>
            <Label for="perifericos">Periféricos</Label>
            <Select
              isMulti
              name="perifericos"
              options={perifericosOptions}
              value={perifericosOptions.filter((option) =>
                formData.perifericos.includes(option.value)
              )}
              onChange={handleMultiSelectChange}
              placeholder="Selecione os periféricos"
            />
          </FormGroup>
          <FormGroup>
            <Label for="chamadas_duas_telas">Chamadas Duas Telas</Label>
            <Input
              type="select"
              name="chamadas_duas_telas"
              value={formData.chamadas_duas_telas}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              <option value="S">Sim</option>
              <option value="N">Não</option>
            </Input>
          </FormGroup>
          {/* Descrição dividida em 3 campos */}
          <FormGroup>
            <Label for="ram">Quantidade de RAM</Label>
            <Input
              type="select"
              name="ram"
              value={formData.ram}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['4', '8', '16', '32'].map((ram) => (
                <option key={ram} value={ram}>
                  {ram}GB
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="ssd">Quantidade de SSD</Label>
            <Input
              type="select"
              name="ssd"
              value={formData.ssd}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['128', '256', '512', '1024'].map((ssd) => (
                <option key={ssd} value={ssd}>
                  {ssd}GB
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="processador">Processador</Label>
            <Input
              type="select"
              name="processador"
              value={formData.processador}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {[
                'i3 5ª Geração',
                'i5 5ª Geração',
                'i7 5ª Geração',
                'i3 6ª Geração',
                'i5 6ª Geração',
                'i7 6ª Geração',
                'i3 7ª Geração',
                'i5 7ª Geração',
                'i7 7ª Geração',
                'i3 8ª Geração',
                'i5 8ª Geração',
                'i7 8ª Geração',
                'i3 9ª Geração',
                'i5 9ª Geração',
                'i7 9ª Geração',
                'i3 10ª Geração',
                'i5 10ª Geração',
                'i7 10ª Geração',
                'i3 11ª Geração',
                'i5 11ª Geração',
                'i7 11ª Geração',
                'i3 12ª Geração',
                'i5 12ª Geração',
                'i7 12ª Geração',
              ].map((processador) => (
                <option key={processador} value={processador}>
                  {processador}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="localizacao_fisica">Localização Física</Label>
            <Input
              type="select"
              name="localizacao_fisica"
              value={formData.localizacao_fisica}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['SJP', 'PTO', 'MGA', 'Minas', 'Goiás', 'SP', 'SC'].map((local) => (
                <option key={local} value={local}>
                  {local}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="observacoes">Observações</Label>
            <Input
              type="textarea"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              placeholder="Adicione observações, se necessário"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
          Salvar
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalAdd;
