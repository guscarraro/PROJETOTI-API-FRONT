import React from 'react';
import PieChart from './PieChart';
import {
  ChartContainer,
  StyledTable,
  StyledTh,
  StyledTd,
  Td3Dias,
  Td2Dias,
  Td1Dia,
  TdHoje,
  TdAtrasadas
} from './style';

const PendenciaChart = ({ filteredData, ocorrenciasPorNota, calculateTotalNotesByStatus, groupedDataByStatus }) => {
  // Categorias de pendência
  const categorias = [
    { label: 'Pendência Geral', tipo: 'geral' },
    { label: 'Pendência Agendamento', tipo: 'agendamento' },
    { label: 'Pendência Viagem', tipo: 'viagem' },
    { label: 'Pendência Viagem + Agendamento', tipo: 'viagem_agendamento' },
  ];

  // Função para gerar dados do gráfico por cliente
  const gerarGraficoPorCliente = (notasPorStatus) => {
    const counts = {};
    
    notasPorStatus.forEach(({ remetente, notas }) => {
      counts[remetente] = (counts[remetente] || 0) + notas.length;
    });
    
    return Object.entries(counts).map(([cliente, valor]) => ({
      name: cliente,
      value: valor
    }));
  };

  return (
    <ChartContainer>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>Categoria</StyledTh>
            <StyledTh>3 Dias</StyledTh>
            <StyledTh>2 Dias</StyledTh>
            <StyledTh>1 Dia</StyledTh>
            <StyledTh>Hoje</StyledTh>
            <StyledTh>Atrasadas</StyledTh>
            <StyledTh>Distribuição por Cliente</StyledTh>
          </tr>
        </thead>
        <tbody>
          {categorias.map(({ label, tipo }) => {
            // Para cada categoria, calculamos os totais usando a mesma função dos cards
            const total3Dias = calculateTotalNotesByStatus(groupedDataByStatus.inThreeDays, 'inThreeDays', ocorrenciasPorNota, tipo);
            const total2Dias = calculateTotalNotesByStatus(groupedDataByStatus.inTwoDays, 'inTwoDays', ocorrenciasPorNota, tipo);
            const total1Dia = calculateTotalNotesByStatus(groupedDataByStatus.tomorrow, 'tomorrow', ocorrenciasPorNota, tipo);
            const totalHoje = calculateTotalNotesByStatus(groupedDataByStatus.today, 'today', ocorrenciasPorNota, tipo);
            const totalAtrasadas = calculateTotalNotesByStatus(groupedDataByStatus.overdue, 'overdue', ocorrenciasPorNota, tipo);

            // Gerar dados para o gráfico de pizza
            const dadosPizza = gerarGraficoPorCliente([
              ...groupedDataByStatus.inThreeDays,
              ...groupedDataByStatus.inTwoDays,
              ...groupedDataByStatus.tomorrow,
              ...groupedDataByStatus.today,
              ...groupedDataByStatus.overdue
            ]);

            return (
              <tr key={tipo}>
                <StyledTd>{label}</StyledTd>
                <Td3Dias>{total3Dias}</Td3Dias>
                <Td2Dias>{total2Dias}</Td2Dias>
                <Td1Dia>{total1Dia}</Td1Dia>
                <TdHoje>{totalHoje}</TdHoje>
                <TdAtrasadas>{totalAtrasadas}</TdAtrasadas>
                <StyledTd>
                  <PieChart data={dadosPizza} width={150} height={150} />
                </StyledTd>
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
    </ChartContainer>
  );
};

export default PendenciaChart;