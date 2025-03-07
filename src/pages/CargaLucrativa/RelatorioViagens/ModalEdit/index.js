import React, { useState } from "react";
import { 
  ModalContainer, 
  ModalContent, 
  CloseButton, 
  ActionButton, 
  Table, 
  TableRow, 
  TableCell, 
  TableHeader 
} from "./style";
import { FaTrash } from "react-icons/fa"; // Ícone de lixeira
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";

const ModalEdit = ({ viagem, onClose, onSave }) => {
  const [documentos, setDocumentos] = useState(viagem.documentos_transporte || []);

  // Função para remover um CTE da viagem
  const removerCTE = async (cteNumero) => {
    const novosDocumentos = documentos.filter(doc => doc.numero_cte !== cteNumero);
    setDocumentos(novosDocumentos);
  
    try {
      await apiLocal.updateViagem({
        numero_viagem: viagem.numero_viagem,
        remover_ctes: [cteNumero] // Mudança aqui para lista correta
      });
  
      toast.success(`CTE ${cteNumero} removido com sucesso!`);
      onSave(); // Atualiza o relatório
    } catch (error) {
      toast.error("Erro ao remover CTE:", error);
    }
  };
  

  return (
    <ModalContainer>
      <ModalContent>
        <h3 style={{ color: "#000", marginBottom: "15px" }}>
          Editar CTEs da Viagem <span style={{ color: "#007bff" }}>{viagem.numero_viagem}</span>
        </h3>

        {/* Tabela de CTEs */}
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Número do CTE</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Filial Destino</TableHeader>
              <TableHeader>Ação</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {documentos.length > 0 ? (
              documentos.map((cte) => (
                <TableRow key={cte.numero_cte}>
                  <TableCell>{cte.numero_cte}</TableCell>
                  <TableCell>{cte.tomador}</TableCell>
                  <TableCell>{cte.destino}</TableCell>
                  <TableCell>
                    <ActionButton onClick={() => removerCTE(cte.numero_cte)} style={{ color: "#fff", background: "red" }}>
                      <FaTrash />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4">Nenhum CTE cadastrado.</TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>

        {/* Botão de Fechar */}
        <CloseButton onClick={onClose}>Fechar</CloseButton>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalEdit;
