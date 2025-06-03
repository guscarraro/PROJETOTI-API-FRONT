import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Label,
  Input,
} from 'reactstrap';
import Select from 'react-select';
import apiLocal from '../../../services/apiLocal';
import { StyledFormGroup } from './style';
import { toast } from 'react-toastify';

function ModalAdd({ isOpen, toggle }) {
  const [formData, setFormData] = useState({
    status: 'Pendente',
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
    portas_switch: '', // Adicionado campo para portas
    observacoes: '',
    localizacao_fisica: '',
    numero_telefone: '', // Novo campo para número de telefone
    operadora: '', // Novo campo para operadora
    produto: '', // Novo campo para operadora
  });

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
    if (formData.tipo_aparelho === 'Switch') {
      return `${formData.portas_switch} portas`;
    } 
    if (formData.tipo_aparelho === 'Celular') {
      return `Número: ${formData.numero_telefone}, Produto: ${formData.produto},Operadora: ${formData.operadora}`;
    } 
    return `${formData.ram}GB RAM, ${formData.ssd}GB SSD, ${formData.processador}`;
  };
  

  const handleSubmit = async () => {
    try {
      if (!formData.localizacao_fisica || !formData.status || !formData.tipo_aparelho || !formData.setor) {
        alert('Os campos Localização Física, Status, Tipo de Aparelho e Setor são obrigatórios.');
        return;
      }

      const dataToSend = {
        ...formData,
        perifericos: formData.perifericos.join(', '),
        descricao: generateDescricao(),
      };

    
      await apiLocal.createOrUpdateControleEstoque(dataToSend);

      toast.success('Equipamento cadastrado com sucesso!');

      toggle();
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
          {/* Setor */}
          <StyledFormGroup>
            <Label for="setor">Setor</Label>
            <Input
              type="select"
              name="setor"
              value={formData.setor}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['Frota', 'Frete', 'SAC', 'Diretoria', 'Financeiro', 'RH', 'TI','Fiscal','Operacao','Compras','Qualidade','Backup'].map((setor) => (
                <option key={setor} value={setor}>{setor}</option>
              ))}
            </Input>
          </StyledFormGroup>

          {/* Tipo de Aparelho */}
          <StyledFormGroup>
            <Label for="tipo_aparelho">Tipo de Aparelho</Label>
            <Input
              type="select"
              name="tipo_aparelho"
              value={formData.tipo_aparelho}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['Notebook', 'Desktop', 'Switch', 'Celular','Coletor','Roteador','Licença'].map(
                (aparelho) => (
                  <option key={aparelho} value={aparelho}>{aparelho}</option>
                )
              )}
            </Input>
          </StyledFormGroup>

          {/* Campos específicos por tipo de aparelho */}
          {formData.tipo_aparelho === 'Celular' && (
  <>
    <StyledFormGroup>
      <Label for="numero_telefone">Número de Telefone</Label>
      <Input
        type="text"
        name="numero_telefone"
        value={formData.numero_telefone}
        onChange={handleInputChange}
        placeholder="Digite o número do telefone"
      />
    </StyledFormGroup>

    <StyledFormGroup>
      <Label for="produto">Produto</Label>
      <Input
        type="select"
        name="produto"
        value={formData.produto}
        onChange={handleInputChange}
      >
        <option value="">Selecione</option>
        <option value="Celular+Chip">Celular+Chip</option>
        <option value="Chip">Chip</option>
        <option value="Celular">Celular</option>
      </Input>
    </StyledFormGroup>
    <StyledFormGroup>
      <Label for="operadora">Operadora</Label>
      <Input
        type="select"
        name="operadora"
        value={formData.operadora}
        onChange={handleInputChange}
      >
        <option value="">Selecione</option>
        <option value="TIM">TIM</option>
        <option value="VIVO">VIVO</option>
        <option value="OI">OI</option>
        <option value="EMBRATEL">EMBRATEL</option>
        <option value="BALDUSSI">BALDUSSI</option>
        <option value="Sem operadora">Sem operadora</option>
      </Input>
    </StyledFormGroup>
  </>
)}
      
          {(formData.tipo_aparelho === 'Notebook' || formData.tipo_aparelho === 'Desktop') && (
            <>
              <StyledFormGroup>
                <Label for="email_utilizado">Email Utilizado</Label>
                <Input type="email" name="email_utilizado" value={formData.email_utilizado} onChange={handleInputChange} />
              </StyledFormGroup>
              <StyledFormGroup>
                <Label for="pessoa_responsavel">Pessoa Responsável</Label>
                <Input type="text" name="pessoa_responsavel" value={formData.pessoa_responsavel} onChange={handleInputChange} />
              </StyledFormGroup>
              <StyledFormGroup>
                <Label for="cloud_utilizado">Cloud Utilizado</Label>
                <Input type="email" name="cloud_utilizado" value={formData.cloud_utilizado} onChange={handleInputChange} />
              </StyledFormGroup>
              <StyledFormGroup>
                <Label for="perifericos">Periféricos</Label>
                <Select
                  isMulti
                  name="perifericos"
                  options={perifericosOptions}
                  value={perifericosOptions.filter((option) => formData.perifericos.includes(option.value))}
                  onChange={handleMultiSelectChange}
                />
              </StyledFormGroup>
              <StyledFormGroup>
                <Label for="chamadas_duas_telas">Chamadas Duas Telas</Label>
                <Input type="select" name="chamadas_duas_telas" value={formData.chamadas_duas_telas} onChange={handleInputChange}>
                  <option value="">Selecione</option>
                  <option value="S">Sim</option>
                  <option value="N">Não</option>
                </Input>
              </StyledFormGroup>
              <StyledFormGroup>
                <Label for="numero_serie">Número de Série</Label>
                <Input type="text" name="numero_serie" value={formData.numero_serie} onChange={handleInputChange} />
              </StyledFormGroup>
              <StyledFormGroup>
                <Label for="ram">Quantidade de RAM</Label>
                <Input type="select" name="ram" value={formData.ram} onChange={handleInputChange}>
                  <option value="">Selecione</option>
                  {['4', '8', '16', '32'].map((ram) => (
                    <option key={ram} value={ram}>{ram}GB</option>
                  ))}
                </Input>
              </StyledFormGroup>
              <StyledFormGroup>
                <Label for="ssd">Quantidade de SSD</Label>
                <Input type="select" name="ssd" value={formData.ssd} onChange={handleInputChange}>
                  <option value="">Selecione</option>
                  {['128', '256', '512', '1024'].map((ssd) => (
                    <option key={ssd} value={ssd}>{ssd}GB</option>
                  ))}
                </Input>
              </StyledFormGroup>
              <StyledFormGroup>
                <Label for="processador">Processador</Label>
                <Input type="select" name="processador" value={formData.processador} onChange={handleInputChange}>
                  <option value="">Selecione</option>
                  {['i3 5ª ou mais antiga Geração', 'i5 5ª ou mais antiga Geração', 'i7 5ª ou mais antiga Geração','i3 6ª Geração', 'i5 6ª Geração', 'i7 6ª Geração','i3 7ª Geração', 'i5 7ª Geração', 'i7 7ª Geração','i3 8ª Geração', 'i5 8ª Geração', 'i7 8ª Geração','i3 9ª Geração', 'i5 9ª Geração', 'i7 9ª Geração','i3 10ª ou recente Geração', 'i5 10ª ou mais recente Geração', 'i7 10ª ou mais recente Geração'].map((proc) => (
                    <option key={proc} value={proc}>{proc}</option>
                  ))}
                </Input>
              </StyledFormGroup>
            </>
          )}
         {formData.tipo_aparelho === 'Coletor' && (
  <>
    <StyledFormGroup>
      <Label for="pessoa_responsavel">Pessoa Responsável</Label>
      <Input type="text" name="pessoa_responsavel" value={formData.pessoa_responsavel} onChange={handleInputChange} />
    </StyledFormGroup>
    <StyledFormGroup>
      <Label for="cloud_utilizado">Cloud Utilizado</Label>
      <Input type="email" name="cloud_utilizado" value={formData.cloud_utilizado} onChange={handleInputChange} />
    </StyledFormGroup>
    <StyledFormGroup>
      <Label for="numero_serie">Número de Série</Label>
      <Input type="text" name="numero_serie" value={formData.numero_serie} onChange={handleInputChange} />
    </StyledFormGroup>
  </>
)}
         {formData.tipo_aparelho === 'Licença' && (
  <>
   <StyledFormGroup>
                <Label for="email_utilizado">Email Utilizado</Label>
                <Input type="email" name="email_utilizado" value={formData.email_utilizado} onChange={handleInputChange} />
              </StyledFormGroup>
              <StyledFormGroup>
                <Label for="pessoa_responsavel">Pessoa Responsável</Label>
                <Input type="text" name="pessoa_responsavel" value={formData.pessoa_responsavel} onChange={handleInputChange} />
              </StyledFormGroup>
  </>
)}


          {/* Campo para quantidade de portas em switch */}
          {formData.tipo_aparelho === 'Switch' && (
            <StyledFormGroup>
              <Label for="portas_switch">Quantidade de Portas</Label>
              <Input
                type="select"
                name="portas_switch"
                value={formData.portas_switch}
                onChange={handleInputChange}
              >
                <option value="">Selecione</option>
                {['4', '8','24', '16', '32','48','52', '64'].map((port) => (
                  <option key={port} value={port}>
                    {port} portas
                  </option>
                ))}
              </Input>
            </StyledFormGroup>
          )}

          {/* Campo para localização física */}
          <StyledFormGroup>
            <Label for="localizacao_fisica">Localização Física</Label>
            <Input
              type="select"
              name="localizacao_fisica"
              value={formData.localizacao_fisica}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['SJP','COLOMBO','PINHAIS', 'PTO', 'MGA', 'MINAS', 'GOIAS','CUIABA', 'SP','RS', 'SC'].map((local) => (
                <option key={local} value={local}>
                  {local}
                </option>
              ))}
            </Input>
          </StyledFormGroup>

          {/* Campo de Observações */}
          <StyledFormGroup>
            <Label for="observacoes">HostName</Label>
            <Input
              type="textarea"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              placeholder="Adicione observações, se necessário"
            />
          </StyledFormGroup>
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
