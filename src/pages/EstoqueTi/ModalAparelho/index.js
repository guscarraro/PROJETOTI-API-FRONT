import React from 'react';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';
import { FaLaptop, FaDesktop, FaNetworkWired, FaWifi, FaMobileAlt, FaBox } from 'react-icons/fa';
import { LiaMicrochipSolid } from "react-icons/lia"; // Ícone correto para Chip
import * as XLSX from 'xlsx';
import { Button } from 'reactstrap';

const ModalAparelho = ({ isOpen, toggle, equipamentos }) => {
  // Mapeamento dos ícones por tipo de aparelho
  const iconePorTipo = {
    Notebook: <FaLaptop size={30} />,
    Desktop: <FaDesktop size={30} />,
    Switch: <FaNetworkWired size={30} />,
    Roteador: <FaWifi size={30} />,
    Celular: <FaMobileAlt size={30} />,
    Chip: <LiaMicrochipSolid size={30} /> // Ícone correto para Chip
  };

  // Agrupar os tipos de aparelhos por setor
  const agrupados = {};
  
  equipamentos.forEach(({ setor, tipo_aparelho, descricao }) => {
    if (!agrupados[setor]) agrupados[setor] = {};

    if (tipo_aparelho === "Celular") {
      if (descricao.includes("Celular+Chip")) {
        agrupados[setor]["Celular"] = (agrupados[setor]["Celular"] || 0) + 1;
        agrupados[setor]["Chip"] = (agrupados[setor]["Chip"] || 0) + 1;
        return;
      } else if (descricao.includes("Chip") && !descricao.includes("Celular")) {
        agrupados[setor]["Chip"] = (agrupados[setor]["Chip"] || 0) + 1;
        return;
      }
      agrupados[setor]["Celular"] = (agrupados[setor]["Celular"] || 0) + 1;
      return;
    }

    agrupados[setor][tipo_aparelho] = (agrupados[setor][tipo_aparelho] || 0) + 1;
  });

  // Contagem total de cada tipo de aparelho
  const totalPorTipo = {};
  Object.values(agrupados).forEach((setor) => {
    Object.entries(setor).forEach(([tipo, quantidade]) => {
      totalPorTipo[tipo] = (totalPorTipo[tipo] || 0) + quantidade;
    });
  });

  // Converter para um array para exibição na tabela
  const dadosTabela = [];
  Object.entries(agrupados).forEach(([setor, aparelhos]) => {
    Object.entries(aparelhos).forEach(([tipo, quantidade]) => {
      dadosTabela.push({ setor, tipo, quantidade });
    });
  });

  const exportarParaExcel = () => {
    const dadosFormatados = dadosTabela.map((item) => ({
      "Setor": item.setor,
      "Tipo de Aparelho": item.tipo,
      "Quantidade": item.quantidade,
    }));
  
    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Aparelhos por Setor");
    XLSX.writeFile(wb, "Relatorio_Aparelhos.xlsx");
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Quantidade de Aparelhos por Setor</ModalHeader>
      <Button color="success" onClick={exportarParaExcel} style={{ width:'200px',marginTop:15, marginLeft:15, marginBottom: "20px" }}>
  Exportar para Excel
</Button>
      <ModalBody>

        {/* Linha de Ícones com Contadores */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {Object.entries(totalPorTipo).map(([tipo, quantidade]) => (
            <div key={tipo} style={{ textAlign: 'center' }}>
              {iconePorTipo[tipo] || <FaBox size={30} />} {/* Ícone padrão se não houver */}
              <h2>{quantidade}</h2>
              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{tipo}</p>
            </div>
          ))}
        </div>

        {/* Tabela de Quantidades por Setor */}
        <Table bordered>
          <thead>
            <tr>
              <th>Setor</th>
              <th>Tipo de Aparelho</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {dadosTabela.map((item, index) => (
              <tr key={index}>
                <td>{item.setor}</td>
                <td>{item.tipo}</td>
                <td>{item.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </Table>

      </ModalBody>
    </Modal>
  );
};

export default ModalAparelho;
