import React, { useState, useEffect } from "react";
import apiLocal from "../../../services/apiLocal";
import * as XLSX from "xlsx";
import { FaEdit, FaTrash } from "react-icons/fa"; // Ícones de ação
import ModalAdd from "./ModalAdd"; // Modal para adicionar custo
import ModalEdit from "./ModalEdit"; // Modal para editar custo
import ModalDel from "./ModalDel"; // Modal para excluir custo
import {
  Container,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  ExportButton,
  ActionButton
} from "./style";
import LoadingDots from "../../../components/Loading";

const CustosTabela = () => {
  const [custos, setCustos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDelOpen, setModalDelOpen] = useState(false);
  const [custoSelecionado, setCustoSelecionado] = useState(null);

  useEffect(() => {
    carregarCustosFrete();
  }, []);

  const carregarCustosFrete = async () => {
    try {
      setLoading(true);
      const response = await apiLocal.getCustosFrete();
      if (response.data) {
        setCustos(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar custos de frete:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportarParaExcel = () => {
    const dadosFormatados = custos.map((custo) => ({
      "Origem": custo.origem,
      "UF Origem": custo.uf_origem,
      "Destino": custo.destino,
      "UF Destino": custo.uf_destino,
      "Tipo Veículo": custo.tipo_veiculo,
      "Valor": `R$ ${parseFloat(custo.valor).toFixed(2)}`,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Custos de Frete");
    XLSX.writeFile(wb, "Custos_Frete.xlsx");
  };

  return (
    <Container>
      <h2 style={{ color: "#fff" }}>Tabela de Custos de Frete</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <ExportButton onClick={exportarParaExcel}>Exportar para Excel</ExportButton>
        <ExportButton onClick={() => setModalAddOpen(true)} style={{ background: "#007bff" }}>
          + Adicionar Custo
        </ExportButton>
      </div>

      {loading ? (
        <LoadingDots></LoadingDots>
      ) : custos.length > 0 ? (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Origem</TableHeader>
              <TableHeader>UF Origem</TableHeader>
              <TableHeader>Destino</TableHeader>
              <TableHeader>UF Destino</TableHeader>
              <TableHeader>Tipo Veículo</TableHeader>
              <TableHeader>Valor</TableHeader>
              <TableHeader>Distância (km)</TableHeader>

              <TableHeader>Ações</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {custos.map((custo, index) => (
              <TableRow key={index}>
                <TableCell>{custo.origem}</TableCell>
                <TableCell>{custo.uf_origem}</TableCell>
                <TableCell>{custo.destino}</TableCell>
                <TableCell>{custo.uf_destino}</TableCell>
                <TableCell>{custo.tipo_veiculo}</TableCell>
                <TableCell>R$ {parseFloat(custo.valor).toFixed(2)}</TableCell>
                <TableCell>{custo.distancia_km ?? "-"}</TableCell>

                <TableCell>
                  <ActionButton
                    style={{ background: "blue", color: "#fff" ,borderRadius: '5px 0px 0px 5px' }}
                    onClick={() => { setCustoSelecionado(custo); setModalEditOpen(true); }}
                  >
                    <FaEdit size={16} />
                  </ActionButton>
                  <ActionButton
                    style={{ background: "red", color: "#fff" ,borderRadius: '0px 5px 5px 0px'}}
                    onClick={() => { setCustoSelecionado(custo); setModalDelOpen(true); }}
                  >
                    <FaTrash size={16} />
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      ) : (
        <p style={{ color: "#000" }}>Nenhum custo de frete encontrado.</p>
      )}

      {/* Modal para Adicionar Novo Custo */}
      {modalAddOpen && (
        <ModalAdd
          onClose={() => setModalAddOpen(false)}
          onSave={carregarCustosFrete}
        />
      )}

      {/* Modal para Editar Custo */}
      {modalEditOpen && (
        <ModalEdit
          custo={custoSelecionado}
          onClose={() => setModalEditOpen(false)}
          onSave={carregarCustosFrete}
        />
      )}

      {/* Modal para Deletar Custo */}
      {modalDelOpen && (
        <ModalDel
          custo={custoSelecionado}
          onClose={() => setModalDelOpen(false)}
          onDelete={carregarCustosFrete}
        />
      )}
    </Container>
  );
};

export default CustosTabela;
