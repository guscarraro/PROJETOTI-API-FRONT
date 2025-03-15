import React, { useState, useEffect } from "react";
import apiLocal from "../../../services/apiLocal";
import * as XLSX from "xlsx";
import { FaEdit, FaTrash } from "react-icons/fa"; // Ícones de edição e exclusão
import ModalEdit from "./ModalEdit"; // Modal para editar CTEs
import ModalDel from "./ModalDel"; // Modal para excluir viagem
import {
  Container,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  ExportButton,
  ActionButton,
} from "./style";

const RelatorioViagens = () => {
  const [viagens, setViagens] = useState([]);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDelOpen, setModalDelOpen] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState(null);

  useEffect(() => {
    carregarViagens();
  }, []);

  const carregarViagens = async () => {
    try {
      const responseViagens = await apiLocal.getViagens();
      const responseDocumentos = await apiLocal.getDocumentosTransporte(); // ✅ Obtém todos os documentos
  
      if (responseViagens.data && responseDocumentos.data) {
        // Criamos um mapa para associar documentos às suas viagens
        const documentosMap = {};
  
        responseDocumentos.data.forEach((doc) => {
          if (!documentosMap[doc.viagem_id]) {
            documentosMap[doc.viagem_id] = [];
          }
          documentosMap[doc.viagem_id].push(doc);
        });
  
        // Adicionamos os documentos ao array de viagens
        const viagensComDocumentos = responseViagens.data.map((viagem) => ({
          ...viagem,
          documentos_transporte: documentosMap[viagem.id] || [],
        }));
  
        setViagens(viagensComDocumentos);
      }
    } catch (error) {
      console.error("Erro ao buscar viagens:", error);
    }
  };
  
  

  const exportarParaExcel = () => {
    const dadosFormatados = viagens.map((viagem) => ({
      "Número da Viagem": viagem.numero_viagem,
      "Data Inclusão": new Date(viagem.data_inclusao).toLocaleString(),
      "Receita Total": `R$ ${viagem.total_receita.toFixed(2)}`,
      "Total Entregas": viagem.total_entregas,
      "Peso Total (kg)": viagem.total_peso,
      "Custo Total": `R$ ${viagem.total_custo.toFixed(2)}`,
      "Margem (%)": `${viagem.margem_custo > 0 ? "+" : ""}${
        viagem.margem_custo
      }%`,
      Placa: viagem.placa,
      Motorista: viagem.motorista,
      "Filial Origem": viagem.filial_origem,
      "Filial Destino": viagem.filial_destino,
      "CTEs Vinculados": viagem.documentos_transporte
        .map((cte) => cte.numero_cte)
        .join(", "), // Lista de CTEs
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Viagens");
    XLSX.writeFile(wb, "Relatorio_Viagens.xlsx");
  };

  return (
    <Container>
      <h2>Relatório de Viagens</h2>
      <ExportButton onClick={exportarParaExcel}>
        Exportar para Excel
      </ExportButton>

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
              <TableHeader>CTEs</TableHeader>
              <TableHeader>Ações</TableHeader>
            </TableRow>
          </thead>
          <tbody>
  {viagens.map((viagem, index) => {
    const margemCusto = parseFloat(viagem.margem_custo); // 🔥 Garante que é número
    return (
      <TableRow key={index} lucrativa={margemCusto <= 18}>
        <TableCell>{viagem.numero_viagem}</TableCell>
        <TableCell>{new Date(viagem.data_inclusao).toLocaleString()}</TableCell>
        <TableCell>R$ {viagem.total_receita.toFixed(2)}</TableCell>
        <TableCell>{viagem.total_entregas}</TableCell>
        <TableCell>{viagem.total_peso} kg</TableCell>
        <TableCell>R$ {viagem.total_custo.toFixed(2)}</TableCell>
        <TableCell>{margemCusto}%</TableCell>
        <TableCell>{viagem.placa}</TableCell>
        <TableCell>{viagem.motorista}</TableCell>
        <TableCell>{viagem.filial_origem}</TableCell>
        <TableCell>{viagem.filial_destino}</TableCell>
        <TableCell>
          {(viagem.documentos_transporte || []).map((cte, idx) => (
            <span key={cte.numero_cte || idx} style={{ 
              background: "white", 
              color: "black", 
              padding: "5px 10px", 
              borderRadius: "5px", 
              marginRight: "5px", 
              display: "inline-block" 
            }}>
              {cte.numero_cte}
            </span>
          ))}
        </TableCell>
        <TableCell>
          <ActionButton
            style={{ background: "blue", color: "#fff", borderRadius: "5px 5px 0px 0px" }}
            onClick={() => {
              setViagemSelecionada({
                id: viagem.id,
                numero_viagem: viagem.numero_viagem,
                placa: viagem.placa,
                motorista: viagem.motorista,
              });
              setModalEditOpen(true);
            }}
          >
            <FaEdit size={16} />
          </ActionButton>
          <ActionButton
            style={{ background: "red", color: "#fff", borderRadius: "0px 0px 5px 5px" }}
            onClick={() => {
              setViagemSelecionada(viagem);
              setModalDelOpen(true);
            }}
          >
            <FaTrash size={16} />
          </ActionButton>
        </TableCell>
      </TableRow>
    );
  })}
</tbody>

        </Table>
      ) : (
        <p>Nenhuma viagem encontrada.</p>
      )}

      {/* Modal para editar CTEs da viagem */}
      {modalEditOpen && (
        <ModalEdit
          viagem={viagemSelecionada}
          onClose={() => setModalEditOpen(false)}
          onSave={carregarViagens}
        />
      )}

      {/* Modal para excluir viagem */}
      {modalDelOpen && (
        <ModalDel
          viagem={viagemSelecionada}
          onClose={() => setModalDelOpen(false)}
          onDelete={carregarViagens}
        />
      )}
    </Container>
  );
};

export default RelatorioViagens;
