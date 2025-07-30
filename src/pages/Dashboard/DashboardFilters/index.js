import React from 'react';
import { Col } from 'reactstrap';
import Select from 'react-select';

const DashboardFilters = ({
  responsaveis,
  remetentesResponsavel,
  selectedResponsavel,
  setSelectedResponsavel,
  etapasSelecionadas,
  setEtapasSelecionadas,
  statusEtapasSelecionados,
  setStatusEtapasSelecionados,
  selectedRemetente,
  setSelectedRemetente,
  selectedDateFilter,
  handleDateFilterChange,
  todasEtapasUnicas,
  todasCoresStatus,
  selectedPracaDestino,
setSelectedPracaDestino,
  data
}) => {
  const responsavelOptions = [
    { value: 'Todos', label: 'Todos' },
    ...responsaveis.map(r => ({ value: r.id, label: r.nome }))
  ];

  const remetenteOptions = [
    { value: 'Todos', label: 'Todos' },
    ...Array.from(new Set(data.map(item => item.remetente)))
      .filter(Boolean)
      .sort()
      .map(rem => ({ value: rem, label: rem }))
  ];

  const etapaOptions = todasEtapasUnicas.map(e => ({ value: e, label: e }));
  const statusOptions = todasCoresStatus.map(s => ({ value: s, label: s.toUpperCase() }));

  const dateOptions = [
    { value: 'currentMonth', label: 'Mês Atual' },
    { value: 'lastMonth', label: 'Mês Passado' },
    { value: 'last30Days', label: 'Últimos 30 Dias' },
    { value: 'last15Days', label: 'Últimos 15 Dias' }
  ];
  const customSelectStyles = {
  option: (provided, state) => ({
    ...provided,
    color: '#000',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#000',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#000',
  }),
};


  return (
    <>
      <Col md="2">
        <label>Responsável:</label>
        <Select
          styles={customSelectStyles}
          options={responsavelOptions}
          value={responsavelOptions.find(o => o.value === selectedResponsavel)}
          onChange={(val) => setSelectedResponsavel(val.value)}
        />
      </Col>

      <Col md="3">
        <label>Etapas:</label>
        <Select
          isMulti
          styles={customSelectStyles}
          options={etapaOptions}
          value={etapasSelecionadas.map(e => ({ value: e, label: e }))}
          onChange={(val) => setEtapasSelecionadas(val.map(v => v.value))}
        />
      </Col>

      <Col md="2">
        <label>Status da Etapa:</label>
        <Select
          isMulti
          styles={customSelectStyles}
          options={statusOptions}
          value={statusEtapasSelecionados.map(s => ({
            value: s,
            label: s.toUpperCase()
          }))}
          onChange={(val) => setStatusEtapasSelecionados(val.map(v => v.value))}
        />
      </Col>

      <Col md="3">
        <label>Remetente:</label>
        <Select
          isMulti
          styles={customSelectStyles}
          options={remetenteOptions}
          value={Array.isArray(selectedRemetente)
            ? remetenteOptions.filter(opt => selectedRemetente.includes(opt.value))
            : remetenteOptions.filter(opt => opt.value === selectedRemetente)}
          onChange={(val) =>
            setSelectedRemetente(val.map((v) => v.value))
          }
        />
      </Col>
      <Col md="2">
  <label>Praça Destino:</label>
  <Select
    isClearable
    styles={customSelectStyles}
    options={Array.from(new Set(data.map(item => item.praca_destino)))
      .filter(Boolean)
      .sort()
      .map(praca => ({ value: praca, label: praca }))}
    value={selectedPracaDestino ? { value: selectedPracaDestino, label: selectedPracaDestino } : null}
    onChange={(val) => setSelectedPracaDestino(val ? val.value : null)}
  />
</Col>


      <Col md="2">
        <label>Filtrar por data:</label>
        <Select
          styles={customSelectStyles}
          options={dateOptions}
          value={dateOptions.find(o => o.value === selectedDateFilter)}
          onChange={(val) => handleDateFilterChange(val.value)}
        />
      </Col>
    </>
  );
};

export default DashboardFilters;
