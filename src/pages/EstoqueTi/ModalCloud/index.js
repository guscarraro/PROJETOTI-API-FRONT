import React from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import * as XLSX from 'xlsx';

const ModalCloud = ({ isOpen, toggle, equipamentos }) => {
  const cloudsFiltrados = equipamentos
    .filter(eq => eq.cloud_utilizado?.trim() && eq.cloud_utilizado.trim() !== "NA")
    .map(eq => ({
      setor: eq.setor,
      pessoa_responsavel: eq.pessoa_responsavel || "Não informado",
      cloud_utilizado: eq.cloud_utilizado.trim()
    }));

  // Contagem de repetições sem reduce
  const countMap = {};
  cloudsFiltrados.forEach(eq => {
    if (!countMap[eq.cloud_utilizado]) {
      countMap[eq.cloud_utilizado] = 1;
    } else {
      countMap[eq.cloud_utilizado] += 1;
    }
  });

  // Lista de clouds únicos
  const cloudsUnicos = [];
  const cloudsDuplicados = [];

  cloudsFiltrados.forEach(eq => {
    if (countMap[eq.cloud_utilizado] > 1) {
      cloudsDuplicados.push(eq);
    } else {
      cloudsUnicos.push(eq);
    }
  });

  const exportCloudsToExcel = () => {
    const worksheetData = [["Setor", "Responsável", "Cloud"]];

    [...cloudsDuplicados, ...cloudsUnicos].forEach(({ setor, pessoa_responsavel, cloud_utilizado }) => {
      worksheetData.push([setor, pessoa_responsavel, cloud_utilizado]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clouds Ativos");

    XLSX.writeFile(workbook, "Clouds_Ativos.xlsx");
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Detalhes dos Clouds Ativos</ModalHeader>
      <ModalBody>
        <Button color="success" onClick={exportCloudsToExcel}>Exportar para Excel</Button>

        <h5 className="mt-4">Clouds Repetidos</h5>
        <table className="table">
          <thead>
            <tr>
              <th>Setor</th>
              <th>Responsável</th>
              <th>Cloud</th>
            </tr>
          </thead>
          <tbody>
            {cloudsDuplicados.map((item, index) => (
              <tr key={index}>
                <td>{item.setor}</td>
                <td>{item.pessoa_responsavel}</td>
                <td>{item.cloud_utilizado}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h5 className="mt-4">Todos os Clouds Cadastrados</h5>
        <table className="table">
          <thead>
            <tr>
              <th>Setor</th>
              <th>Responsável</th>
              <th>Cloud</th>
            </tr>
          </thead>
          <tbody>
            {[...cloudsDuplicados, ...cloudsUnicos].map((item, index) => (
              <tr key={index}>
                <td>{item.setor}</td>
                <td>{item.pessoa_responsavel}</td>
                <td>{item.cloud_utilizado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ModalBody>
    </Modal>
  );
};

export default ModalCloud;
