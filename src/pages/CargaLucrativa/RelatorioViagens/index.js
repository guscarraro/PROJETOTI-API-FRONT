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
import ModalInfo from "./ModalInfo";
import LoadingDots from "../../../components/Loading";

const RelatorioViagens = ({ setCurrentTab, setNumeroViagem }) => {
  const [viagens, setViagens] = useState([]);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDelOpen, setModalDelOpen] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState(null);
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const metas = {
    "MTZ - 1": 37,
    "MTZ - 2": 37,
    "MTZ - 3": 45,
    "MTZ - 4": 50,
    "MTZ": 25,
    "MTZ - Transferencia": 18,
    "PTO - 1": 20,
    "PTO - 2": 30,
    "PTO - 3": 40,
    "PTO - 4": 50,
    "MGA - 1": 20,
    "MGA - 2": 30,
    "MGA - 3": 40,
    "MGA - 4": 50
  };
  useEffect(() => {
    setLoading(true); 
    carregarViagens();
  }, []);

  const carregarViagens = async () => {
    setLoading(true);
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
    }finally {
      setLoading(false); // 🔥 Desativa o loading após a requisição
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
      "Margem (%)": `${viagem.margem_custo > 0 ? "+" : ""}${viagem.margem_custo
        }%`,
        "Tipo Veículo": viagem.tipo_veiculo,

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

  const user = JSON.parse(localStorage.getItem("user"));
  const setor = user?.setor;

  // Filtrar viagens de acordo com o setor
  const filtrarViagensPorSetor = (viagens) => {
    console.log(viagens);
    
    if (setor === "9f5c3e17-8e15-4a11-a89f-df77f3a8f0f4") { // PTO
      return viagens.filter(viagem => viagem.user_add === "base.pto");
    } else if (setor === "7a84e2cb-cb4c-4705-b676-9f0a0db5469a") { // MGA
      return viagens.filter(viagem => viagem.user_add === "base.mga");
    }
    return viagens;
  };

  // Viagens filtradas
  const viagensFiltradas = filtrarViagensPorSetor(viagens);
  return (
    <Container>
      <h2>Relatório de Viagens</h2>
      <ExportButton onClick={exportarParaExcel}>
        Exportar para Excel
      </ExportButton>
      {loading ? (
  <LoadingDots/> // 🔥 Substitua por <LoadingDots /> se desejar
) : viagensFiltradas.length > 0 ? (
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
              <TableHeader>Tipo Veículo</TableHeader>

              <TableHeader>Placa</TableHeader>
              <TableHeader>Motorista</TableHeader>
              <TableHeader>Filial Origem</TableHeader>
              <TableHeader>Filial Destino</TableHeader>
              <TableHeader></TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {viagensFiltradas.map((viagem, index) => {
              const margemCusto = parseFloat(viagem.margem_custo); // 🔥 Garante que é número
              return (
                <TableRow key={index}
                lucrativa={
                  margemCusto <= (metas[viagem.tipo_operacao] || 18)
                }
                  onClick={() => {
                    setViagemSelecionada(viagem); // Define a viagem selecionada
                    setModalInfoOpen(true); // Abre o modal de informações
                  }}
                  style={{ cursor: "pointer" }}>

                  <TableCell>{viagem.numero_viagem}</TableCell>
                  <TableCell>
                    {new Date(new Date(viagem.data_inclusao).getTime() - 3 * 60 * 60 * 1000).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>R$ {viagem.total_receita.toFixed(2)}</TableCell>
                  <TableCell>{viagem.total_entregas}</TableCell>
                  <TableCell>{viagem.total_peso} kg</TableCell>
                  <TableCell>R$ {viagem.total_custo.toFixed(2)}</TableCell>
                  <TableCell>{margemCusto}%</TableCell>
                  <TableCell>{viagem.tipo_veiculo}</TableCell>

                  <TableCell>{viagem.placa}</TableCell>
                  <TableCell>{viagem.motorista}</TableCell>
                  <TableCell>{viagem.filial_origem}</TableCell>
                  <TableCell>{viagem.filial_destino}</TableCell>

                  <TableCell>

                   
                  </TableCell>
                  <TableCell>
                    <ActionButton
                      style={{ background: "blue", color: "#fff", borderRadius: "5px 5px 0px 0px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViagemSelecionada({
                          id: viagem.id,
                          numero_viagem: viagem.numero_viagem,
                          total_custo: viagem.total_custo,
                          placa: viagem.placa,
                          motorista: viagem.motorista,
                          total_receita: viagem.total_receita,  // ✅ Passa a receita total
                          total_entregas: viagem.total_entregas,  // ✅ Passa a quantidade de entregas
                          total_peso: viagem.total_peso,  // ✅ Passa o peso total
                          documentos_transporte: viagem.documentos_transporte,

                        });
                        setModalEditOpen(true);
                      }}
                    >
                      <FaEdit size={16} />
                    </ActionButton>
                    <ActionButton
                      style={{ background: "red", color: "#fff", borderRadius: "0px 0px 5px 5px" }}
                      onClick={(e) => {
                        e.stopPropagation();
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
          setCurrentTab={setCurrentTab}   // 🔹 Adicionar esta linha
          setNumeroViagem={setNumeroViagem} // 🔹 Adicionar esta linha
        />

      )}
      {modalInfoOpen && (
        <ModalInfo
          viagem={viagemSelecionada}
          onClose={() => setModalInfoOpen(false)}
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
