import React from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import * as XLSX from "xlsx";
import { FaEnvelope, FaBuilding, FaUser } from "react-icons/fa";

import {
  InfoGrid,
  InfoItem,
  TableWrap,
  Table,
  Th,
  Td,
  MODAL_CLASS,
} from "../style";

const ModalLicenca = ({ isOpen, toggle, equipamentos }) => {
  const licencasFiltradas = equipamentos
    .filter((eq) => eq.email_utilizado?.trim())
    .map((eq) => ({
      setor: eq.setor,
      pessoa_responsavel: eq.pessoa_responsavel || "Não informado",
      email_utilizado: eq.email_utilizado.trim(),
    }));

  // Ordena por setor e depois por responsável (in-place, ok aqui)
  licencasFiltradas.sort((a, b) => {
    const s = a.setor.localeCompare(b.setor || "");
    if (s !== 0) return s;
    return a.pessoa_responsavel.localeCompare(b.pessoa_responsavel || "");
  });

  const totalLicencas = licencasFiltradas.length;

  // set de setores
  const setoresSet = new Set();
  const responsaveisSet = new Set();

  for (let i = 0; i < licencasFiltradas.length; i++) {
    const item = licencasFiltradas[i];
    if (item.setor) setoresSet.add(item.setor);
    if (item.pessoa_responsavel)
      responsaveisSet.add(item.pessoa_responsavel);
  }

  const totalSetores = setoresSet.size;
  const totalResponsaveis = responsaveisSet.size;

  const exportLicencasToExcel = () => {
    const worksheetData = [["Setor", "Responsável", "Email"]];

    for (let i = 0; i < licencasFiltradas.length; i++) {
      const { setor, pessoa_responsavel, email_utilizado } =
        licencasFiltradas[i];
      worksheetData.push([setor, pessoa_responsavel, email_utilizado]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Licenças Microsoft");

    XLSX.writeFile(workbook, "Licencas_Microsoft.xlsx");
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      contentClassName={MODAL_CLASS}
    >
      <ModalHeader toggle={toggle}>
        Detalhes das Licenças Microsoft
      </ModalHeader>
      <ModalBody>
        {/* Botão Exportar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <Button color="success" onClick={exportLicencasToExcel}>
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
                    background: "rgba(59,130,246,0.15)", // azul
                  }}
                >
                  <FaEnvelope size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Licenças
                  </div>
                  <small>Total de e-mails licenciados</small>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {totalLicencas}
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
                    background: "rgba(52,211,153,0.15)", // verde
                  }}
                >
                  <FaBuilding size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Setores
                  </div>
                  <small>Qtd. de setores com licença</small>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {totalSetores}
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
                    background: "rgba(251,191,36,0.18)", // amarelo
                  }}
                >
                  <FaUser size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Responsáveis
                  </div>
                  <small>Colaboradores com licença</small>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {totalResponsaveis}
              </div>
            </div>
          </InfoItem>
        </InfoGrid>

        {/* Tabela principal */}
        <h5 style={{ marginTop: 8, marginBottom: 8 }}>
          Setor, Responsável e Licença
        </h5>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Setor</Th>
                <Th>Responsável</Th>
                <Th>Email</Th>
              </tr>
            </thead>
            <tbody>
              {licencasFiltradas.map((item, index) => (
                <tr
                  key={`${item.setor}-${item.email_utilizado}-${index}`}
                >
                  <Td>{item.setor}</Td>
                  <Td>{item.pessoa_responsavel}</Td>
                  <Td>{item.email_utilizado}</Td>
                </tr>
              ))}

              {!licencasFiltradas.length && (
                <tr>
                  <Td colSpan={3} style={{ opacity: 0.7 }}>
                    Nenhuma licença encontrada.
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

export default ModalLicenca;
