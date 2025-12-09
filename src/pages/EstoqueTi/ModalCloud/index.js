import React from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import * as XLSX from "xlsx";
import { FaCloud, FaUserFriends, FaListUl } from "react-icons/fa";

import {
  InfoGrid,
  InfoItem,
  TableWrap,
  Table,
  Th,
  Td,
  MODAL_CLASS,
} from "../style";

const ModalCloud = ({ isOpen, toggle, equipamentos }) => {
  const cloudsFiltrados = equipamentos
    .filter(
      (eq) =>
        eq.cloud_utilizado?.trim() && eq.cloud_utilizado.trim() !== "NA"
    )
    .map((eq) => ({
      setor: eq.setor,
      pessoa_responsavel: eq.pessoa_responsavel || "Não informado",
      cloud_utilizado: eq.cloud_utilizado.trim(),
    }));

  // Contagem de repetições (sem reduce)
  const countMap = {};
  for (let i = 0; i < cloudsFiltrados.length; i++) {
    const cloud = cloudsFiltrados[i].cloud_utilizado;
    if (!countMap[cloud]) {
      countMap[cloud] = 1;
    } else {
      countMap[cloud] = countMap[cloud] + 1;
    }
  }

  const cloudsUnicos = [];
  const cloudsDuplicados = [];

  for (let i = 0; i < cloudsFiltrados.length; i++) {
    const item = cloudsFiltrados[i];
    const qtd = countMap[item.cloud_utilizado];
    if (qtd > 1) {
      cloudsDuplicados.push(item);
    } else {
      cloudsUnicos.push(item);
    }
  }

  const totalClouds = cloudsFiltrados.length;
  const totalCloudsRepetidos = cloudsDuplicados.length;
  const setCloudsDistintos = new Set(
    cloudsFiltrados.map((c) => c.cloud_utilizado)
  );
  const totalTiposCloud = setCloudsDistintos.size;

  const exportCloudsToExcel = () => {
    const worksheetData = [["Setor", "Responsável", "Cloud"]];

    const todos = [...cloudsDuplicados, ...cloudsUnicos];
    for (let i = 0; i < todos.length; i++) {
      const { setor, pessoa_responsavel, cloud_utilizado } = todos[i];
      worksheetData.push([setor, pessoa_responsavel, cloud_utilizado]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clouds Ativos");

    XLSX.writeFile(workbook, "Clouds_Ativos.xlsx");
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      contentClassName={MODAL_CLASS}
    >
      <ModalHeader toggle={toggle}>Detalhes dos Clouds Ativos</ModalHeader>
      <ModalBody>
        {/* Botão Exportar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <Button color="success" onClick={exportCloudsToExcel}>
            Exportar para Excel
          </Button>
        </div>

        {/* Cards de resumo */}
        <InfoGrid style={{ marginBottom: 16 }}>
          <InfoItem>
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
                    background: "rgba(56,189,248,0.15)", // azul claro
                  }}
                >
                  <FaCloud size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Clouds ativos
                  </div>
                  <small>Total de registros com cloud</small>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {totalClouds}
              </div>
            </div>
          </InfoItem>

          <InfoItem>
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
                    background: "rgba(52,211,153,0.15)", // verde claro
                  }}
                >
                  <FaListUl size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Tipos de cloud
                  </div>
                  <small>Serviços diferentes cadastrados</small>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {totalTiposCloud}
              </div>
            </div>
          </InfoItem>

          <InfoItem>
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
                    background: "rgba(248,113,113,0.16)", // vermelho claro
                  }}
                >
                  <FaUserFriends size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Clouds repetidos
                  </div>
                  <small>Registros com cloud em uso por mais de 1 usuário</small>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {totalCloudsRepetidos}
              </div>
            </div>
          </InfoItem>
        </InfoGrid>

        {/* Tabela de repetidos */}
        <h5 style={{ marginTop: 8, marginBottom: 8 }}>Clouds repetidos</h5>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Setor</Th>
                <Th>Responsável</Th>
                <Th>Cloud</Th>
              </tr>
            </thead>
            <tbody>
              {cloudsDuplicados.map((item, index) => (
                <tr
                  key={`dup-${index}-${item.setor}-${item.cloud_utilizado}`}
                >
                  <Td>{item.setor}</Td>
                  <Td>{item.pessoa_responsavel}</Td>
                  <Td>{item.cloud_utilizado}</Td>
                </tr>
              ))}

              {!cloudsDuplicados.length && (
                <tr>
                  <Td colSpan={3} style={{ opacity: 0.7 }}>
                    Nenhum cloud repetido encontrado.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrap>

        {/* Tabela de todos */}
        <h5 style={{ marginTop: 16, marginBottom: 8 }}>
          Todos os clouds cadastrados
        </h5>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Setor</Th>
                <Th>Responsável</Th>
                <Th>Cloud</Th>
              </tr>
            </thead>
            <tbody>
              {[...cloudsDuplicados, ...cloudsUnicos].map((item, index) => (
                <tr
                  key={`all-${index}-${item.setor}-${item.cloud_utilizado}`}
                >
                  <Td>{item.setor}</Td>
                  <Td>{item.pessoa_responsavel}</Td>
                  <Td>{item.cloud_utilizado}</Td>
                </tr>
              ))}

              {!([...cloudsDuplicados, ...cloudsUnicos].length) && (
                <tr>
                  <Td colSpan={3} style={{ opacity: 0.7 }}>
                    Nenhum cloud cadastrado.
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

export default ModalCloud;
