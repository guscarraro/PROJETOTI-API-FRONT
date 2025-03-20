import React, { useState, useEffect } from "react";
import apiLocal from "../../../services/apiLocal";
import * as XLSX from "xlsx";
import { FaEdit, FaTrash } from "react-icons/fa"; // Ícones de ação
import ModalEdit from "./ModalEdit"; // Modal para editar coleta
import ModalDel from "./ModalDel"; // Modal para excluir coleta
import {
  Container,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  ExportButton,
  ActionButton,
} from "./style";
import LoadingDots from "../../../components/Loading";

const RelatorioColetas = () => {
  const [coletas, setColetas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDelOpen, setModalDelOpen] = useState(false);
  const [coletaSelecionada, setColetaSelecionada] = useState(null);

  useEffect(() => {
    carregarColetas();
  }, []);

  const carregarColetas = async () => {
    try {
      setLoading(true);
      const response = await apiLocal.getColetas();
      if (response.data) {
        setColetas(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar coletas:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportarParaExcel = () => {
    const dadosFormatados = coletas.map((coleta) => ({
      "Data Coleta": new Date(coleta.data_coleta).toLocaleDateString(),
      "Motorista": coleta.motorista_id, // Pode ser ajustado para pegar o nome do motorista, se necessário
      "Cliente": coleta.cliente_id, // Pode ser ajustado para pegar o nome do cliente
      "Valor": `R$ ${parseFloat(coleta.valor).toFixed(2)}`,
      "Qtd Pallets": coleta.qtde_pallet,
      "Tipo Veículo": coleta.tp_veiculo,
      "Ordem Ref": coleta.ordem_ref ?? "-",
      "Observação": coleta.obs ?? "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Coletas");
    XLSX.writeFile(wb, "Relatorio_Coletas.xlsx");
  };

  return (
    <Container>
      <h2 style={{ color: "#fff" }}>Relatório de Coletas</h2>

      <ExportButton onClick={exportarParaExcel}>Exportar para Excel</ExportButton>

      {loading ? (
        <LoadingDots />
      ) : coletas.length > 0 ? (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Data Coleta</TableHeader>
              <TableHeader>Motorista</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Valor</TableHeader>
              <TableHeader>Qtd Pallets</TableHeader>
              <TableHeader>Tipo Veículo</TableHeader>
              <TableHeader>Ordem Ref</TableHeader>
              <TableHeader>Observação</TableHeader>
              <TableHeader>Ações</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {coletas.map((coleta, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(coleta.data_coleta).toLocaleDateString()}</TableCell>
                <TableCell>{coleta.motorista_id}</TableCell>
                <TableCell>{coleta.cliente_id}</TableCell>
                <TableCell>R$ {parseFloat(coleta.valor).toFixed(2)}</TableCell>
                <TableCell>{coleta.qtde_pallet}</TableCell>
                <TableCell>{coleta.tp_veiculo}</TableCell>
                <TableCell>{coleta.ordem_ref ?? "-"}</TableCell>
                <TableCell>{coleta.obs ?? "-"}</TableCell>

                <TableCell>
                  <ActionButton
                    style={{ background: "blue", color: "#fff", borderRadius: "5px 0px 0px 5px" }}
                    onClick={() => { setColetaSelecionada(coleta); setModalEditOpen(true); }}
                  >
                    <FaEdit size={16} />
                  </ActionButton>
                  <ActionButton
                    style={{ background: "red", color: "#fff", borderRadius: "0px 5px 5px 0px" }}
                    onClick={() => { setColetaSelecionada(coleta); setModalDelOpen(true); }}
                  >
                    <FaTrash size={16} />
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      ) : (
        <p style={{ color: "#fff" }}>Nenhuma coleta encontrada.</p>
      )}

      {modalEditOpen && (
        <ModalEdit
        coletaId={coletaSelecionada?.id} // ✅ Agora passando apenas o ID
        onClose={() => setModalEditOpen(false)}
        onSave={carregarColetas}
      />
      
      )}

      {modalDelOpen && (
        <ModalDel
          coleta={coletaSelecionada}
          onClose={() => setModalDelOpen(false)}
          onDelete={carregarColetas}
        />
      )}
    </Container>
  );
};

export default RelatorioColetas;
