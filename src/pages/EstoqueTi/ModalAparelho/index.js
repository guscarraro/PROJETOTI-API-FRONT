import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { Button } from "reactstrap";
import {
  FaLaptop,
  FaDesktop,
  FaNetworkWired,
  FaWifi,
  FaMobileAlt,
  FaBox,
  FaEnvelope,
} from "react-icons/fa";
import { LiaMicrochipSolid } from "react-icons/lia";
import * as XLSX from "xlsx";

import {
  InfoGrid,
  InfoItem,
  TableWrap,
  Table,
  Th,
  Td,
  MODAL_CLASS,
} from "../style";

const ModalAparelho = ({ isOpen, toggle, equipamentos }) => {
  // Ícone por tipo
  const iconePorTipo = {
    Notebook: <FaLaptop size={18} />,
    Desktop: <FaDesktop size={18} />,
    Switch: <FaNetworkWired size={18} />,
    Roteador: <FaWifi size={18} />,
    Licença: <FaEnvelope size={18} />,
    Celular: <FaMobileAlt size={18} />,
    Chip: <LiaMicrochipSolid size={18} />,
  };

  // Agrupar por setor / tipo (mantendo regra Celular+Chip)
  const agrupados = {};

  equipamentos.forEach(({ setor, tipo_aparelho, descricao }) => {
    if (!setor) return;
    if (!agrupados[setor]) agrupados[setor] = {};

    if (tipo_aparelho === "Celular") {
      if (descricao?.includes("Celular+Chip")) {
        agrupados[setor]["Celular"] =
          (agrupados[setor]["Celular"] || 0) + 1;
        agrupados[setor]["Chip"] = (agrupados[setor]["Chip"] || 0) + 1;
        return;
      } else if (descricao?.includes("Chip") && !descricao.includes("Celular")) {
        agrupados[setor]["Chip"] = (agrupados[setor]["Chip"] || 0) + 1;
        return;
      }
      agrupados[setor]["Celular"] =
        (agrupados[setor]["Celular"] || 0) + 1;
      return;
    }

    agrupados[setor][tipo_aparelho] =
      (agrupados[setor][tipo_aparelho] || 0) + 1;
  });

  // Totais por tipo
  const totalPorTipo = {};
  Object.values(agrupados).forEach((setor) => {
    Object.entries(setor).forEach(([tipo, quantidade]) => {
      totalPorTipo[tipo] = (totalPorTipo[tipo] || 0) + quantidade;
    });
  });

  // Dados para tabela
  const dadosTabela = [];
  Object.entries(agrupados).forEach(([setor, aparelhos]) => {
    Object.entries(aparelhos).forEach(([tipo, quantidade]) => {
      dadosTabela.push({ setor, tipo, quantidade });
    });
  });

  const exportarParaExcel = () => {
    const dadosFormatados = dadosTabela.map((item) => ({
      Setor: item.setor,
      "Tipo de Aparelho": item.tipo,
      Quantidade: item.quantidade,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Aparelhos por Setor");
    XLSX.writeFile(wb, "Relatorio_Aparelhos.xlsx");
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      contentClassName={MODAL_CLASS}
    >
      <ModalHeader toggle={toggle}>Quantidade de Aparelhos por Setor</ModalHeader>

      <ModalBody>
        {/* Botão de export na header do conteúdo */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <Button color="success" onClick={exportarParaExcel}>
            Exportar para Excel
          </Button>
        </div>

        {/* Cards de tipos com ícones modernos */}
        <InfoGrid style={{ marginBottom: 16 }}>
          {Object.entries(totalPorTipo).map(([tipo, quantidade]) => (
            <InfoItem key={tipo}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(59,130,246,0.12)",
                    }}
                  >
                    {iconePorTipo[tipo] || <FaBox size={18} />}
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}
                    >
                      {tipo}
                    </div>
                    <small>Total no estoque</small>
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{quantidade}</div>
              </div>
            </InfoItem>
          ))}
        </InfoGrid>

        {/* Tabela estilizada no mesmo padrão da página */}
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Setor</Th>
                <Th>Tipo de Aparelho</Th>
                <Th>Quantidade</Th>
              </tr>
            </thead>
            <tbody>
              {dadosTabela.map((item, index) => (
                <tr key={`${item.setor}-${item.tipo}-${index}`}>
                  <Td>{item.setor}</Td>
                  <Td>{item.tipo}</Td>
                  <Td>{item.quantidade}</Td>
                </tr>
              ))}

              {!dadosTabela.length && (
                <tr>
                  <Td colSpan={3} style={{ opacity: 0.7 }}>
                    Nenhum dado encontrado.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>
      </ModalBody>
    </Modal>
  );
};

export default ModalAparelho;
