import React from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import * as XLSX from 'xlsx';

const ModalLicenca = ({ isOpen, toggle, equipamentos }) => {
  const licencasFiltradas = equipamentos
    .filter(eq => eq.email_utilizado?.trim())
    .map(eq => ({
      setor: eq.setor,
      pessoa_responsavel: eq.pessoa_responsavel || "Não informado",
      email_utilizado: eq.email_utilizado.trim()
    }));

  // Ordena por setor e depois por responsável
  const licencasOrdenadas = licencasFiltradas.sort((a, b) => 
    a.setor.localeCompare(b.setor) || a.pessoa_responsavel.localeCompare(b.pessoa_responsavel)
  );

  const exportLicencasToExcel = () => {
    const worksheetData = [["Setor", "Responsável", "Email"]];
    
    licencasOrdenadas.forEach(({ setor, pessoa_responsavel, email_utilizado }) => {
      worksheetData.push([setor, pessoa_responsavel, email_utilizado]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Licenças Microsoft");
    
    XLSX.writeFile(workbook, "Licencas_Microsoft.xlsx");
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Detalhes das Licenças Microsoft</ModalHeader>
      <ModalBody>
        <Button color="success" onClick={exportLicencasToExcel}>Exportar para Excel</Button>

        <h5 className="mt-4">Setor, Responsável e Licença</h5>
        <table className="table">
          <thead>
            <tr>
              <th>Setor</th>
              <th>Responsável</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {licencasOrdenadas.map((item, index) => (
              <tr key={index}>
                <td>{item.setor}</td>
                <td>{item.pessoa_responsavel}</td>
                <td>{item.email_utilizado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ModalBody>
    </Modal>
  );
};

export default ModalLicenca;
