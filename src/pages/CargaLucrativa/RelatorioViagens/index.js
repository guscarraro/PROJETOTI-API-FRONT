import React, { useState, useEffect } from "react";
import apiLocal from "../../../services/apiLocal";
import * as XLSX from "xlsx";
import { Container, Table, TableRow, TableCell, TableHeader, ExportButton } from "./style";

const RelatorioViagens = () => {
  const [viagens, setViagens] = useState([]);

  useEffect(() => {
    const carregarViagens = async () => {
      try {
        const response = await apiLocal.getViagens();
        if (response.data) {
          setViagens(response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar viagens:", error);
      }
    };

    carregarViagens();
  }, []);

  const exportarParaExcel = () => {
    const dadosFormatados = viagens.map((viagem) => ({
      "Número da Viagem": viagem.numero_viagem,
      "Data Inclusão": new Date(viagem.data_inclusao).toLocaleString(),
      "Receita Total": `R$ ${viagem.total_receita.toFixed(2)}`,
      "Total Entregas": viagem.total_entregas,
      "Peso Total (kg)": viagem.total_peso,
      "Custo Total": `R$ ${viagem.total_custo.toFixed(2)}`,
      "Margem (%)": `${viagem.margem_custo > 0 ? "+" : ""}${viagem.margem_custo}%`,
      "Placa": viagem.placa,
      "Motorista": viagem.motorista,
      "Filial Origem": viagem.filial_origem,
      "Filial Destino": viagem.filial_destino,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Viagens");
    XLSX.writeFile(wb, "Relatorio_Viagens.xlsx");
  };

  return (
    <Container>
      <h2>Relatório de Viagens</h2>
      <ExportButton onClick={exportarParaExcel}>Exportar para Excel</ExportButton>

      {viagens.length > 0 ? (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Número</TableHeader>
              <TableHeader>Data</TableHeader>
              <TableHeader>Receita Total</TableHeader>
              <TableHeader>Total Entregas</TableHeader>
              <TableHeader>Peso Total</TableHeader>
              <TableHeader>Custo Total</TableHeader>
              <TableHeader>Margem (%)</TableHeader>
              <TableHeader>Placa</TableHeader>
              <TableHeader>Motorista</TableHeader>
              <TableHeader>Filial Origem</TableHeader>
              <TableHeader>Filial Destino</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {viagens.map((viagem, index) => {
              const margemPositiva = parseFloat(viagem.margem_custo) > 0;
              return (
                <TableRow key={index} lucrativa={margemPositiva}>
                  <TableCell>{viagem.numero_viagem}</TableCell>
                  <TableCell>{new Date(viagem.data_inclusao).toLocaleString()}</TableCell>
                  <TableCell>R$ {viagem.total_receita.toFixed(2)}</TableCell>
                  <TableCell>{viagem.total_entregas}</TableCell>
                  <TableCell>{viagem.total_peso} kg</TableCell>
                  <TableCell>R$ {viagem.total_custo.toFixed(2)}</TableCell>
                  <TableCell>{margemPositiva ? "+" : ""}{viagem.margem_custo}%</TableCell>
                  <TableCell>{viagem.placa}</TableCell>
                  <TableCell>{viagem.motorista}</TableCell>
                  <TableCell>{viagem.filial_origem}</TableCell>
                  <TableCell>{viagem.filial_destino}</TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <p>Nenhuma viagem encontrada.</p>
      )}
    </Container>
  );
};

export default RelatorioViagens;
