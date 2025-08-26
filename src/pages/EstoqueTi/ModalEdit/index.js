import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import Select from 'react-select';

function ModalEdit({ isOpen, toggle, equipamento, onSave }) {
  const [formData, setFormData] = useState({ ...equipamento });

  useEffect(() => {
    setFormData({ ...equipamento });
  }, [equipamento]);

  const perifericosOptions = [
    { value: 'Mouse novo', label: 'Mouse novo' },
    { value: 'Teclado novo', label: 'Teclado novo' },
    { value: 'Mouse velho', label: 'Mouse velho' },
    { value: 'Teclado velho', label: 'Teclado velho' },
    { value: 'Segundo Monitor', label: 'Segundo Monitor' },
    { value: 'Fone de ouvido', label: 'Fone de ouvido' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleMultiSelectChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setFormData((prevData) => ({ ...prevData, perifericos: values }));
  };

  const handleSubmit = () => {
    onSave(formData); // Salva as alterações
    toggle(); // Fecha o modal
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Editar Equipamento</ModalHeader>
      <ModalBody>
        <Form>
          {/* Setor */}
          <FormGroup>
            <Label for="setor">Setor</Label>
            <Input
              type="select"
              name="setor"
              value={formData.setor}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['Frota', 'Frete', 'SAC', 'Diretoria', 'Financeiro', 'RH', 'TI', 'Fiscal', 'Operacao', 'Compras', 'Qualidade', 'Backup'].map((setor) => (
                <option key={setor} value={setor}>{setor}</option>
              ))}
            </Input>
          </FormGroup>

          {/* Tipo de Aparelho (não editável) */}
          <FormGroup>
            <Label for="tipo_aparelho">Tipo de Aparelho</Label>
            <Input
              type="text"
              name="tipo_aparelho"
              value={formData.tipo_aparelho}
              disabled
            />
          </FormGroup>
          <FormGroup>
            <Label for="pessoa_responsavel">Pessoa Responsável</Label>
            <Input
              type="text"
              name="pessoa_responsavel"
              value={formData.pessoa_responsavel}
              onChange={handleInputChange}
            />
          </FormGroup>

          {/* Campos dinâmicos de acordo com o tipo de aparelho */}
          {(formData.tipo_aparelho === 'Notebook' || formData.tipo_aparelho === 'Desktop') && (
            <>
              <FormGroup>
                <Label for="email_utilizado">Email Utilizado</Label>
                <Input
                  type="email"
                  name="email_utilizado"
                  value={formData.email_utilizado}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label for="cloud_utilizado">Cloud Utilizado</Label>
                <Input
                  type="email"
                  name="cloud_utilizado"
                  value={formData.cloud_utilizado}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="perifericos">Periféricos</Label>
                <Select
                  isMulti
                  name="perifericos"
                  options={perifericosOptions}
                  value={perifericosOptions.filter((option) =>
                    formData.perifericos?.includes(option.value)
                  )}
                  onChange={handleMultiSelectChange}
                />
              </FormGroup>
            </>
          )}

          {/* Campos específicos para Switch */}
          {formData.tipo_aparelho === 'Switch' && (
            <FormGroup>
              <Label for="portas_switch">Quantidade de Portas</Label>
              <Input
                type="select"
                name="portas_switch"
                value={formData.descricao?.split(' ')[0]} // Assumindo que a descrição está no formato "8 portas"
                onChange={(e) => setFormData({ ...formData, descricao: `${e.target.value} portas` })}
              >
                <option value="">Selecione</option>
                {['4', '8', '24', '16', '32', '48', '64'].map((port) => (
                  <option key={port} value={port}>
                    {port} portas
                  </option>
                ))}
              </Input>
            </FormGroup>
          )}

          {/* Status */}
          <FormGroup>
            <Label for="status">Status</Label>
            <Input
              type="select"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="">Selecione</option>
              {['Pendente', 'Em Uso', 'Inativo', 'Manutenção'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="numero_serie">Número IMEI</Label>
            <Input
              type="text"
              name="numero_serie"
              value={formData.numero_serie || ""}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="observacoes">Hostname/Modelo (Obs)</Label>
            <Input
              type="text"
              name="observacoes"
              value={formData.observacoes || ""}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
          Salvar Alterações
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalEdit;
