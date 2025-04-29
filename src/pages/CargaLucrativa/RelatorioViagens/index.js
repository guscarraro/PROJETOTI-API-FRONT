import React, { useState, useEffect } from "react";
import apiLocal from "../../../services/apiLocal";
import * as XLSX from "xlsx";
import { FaEdit, FaTrash } from "react-icons/fa"; // Ícones de edição e exclusão
import ModalEdit from "./ModalEdit"; // Modal para editar CTEs
import ModalDel from "./ModalDel"; // Modal para excluir viagem
import { Button, Col, FormGroup, Input, Label, Row } from "reactstrap";
import Select from "react-select";
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
  const [filters, setFilters] = useState({
    dtInicio: "",
    dtFinal: "",
    filial_origem: [],
    filial_destino: [],
    tipo_veiculo: [],
    tipo_operacao: [],
  });
  const [filiaisOrigemOptions, setFiliaisOrigemOptions] = useState([]);
const [filiaisDestinoOptions, setFiliaisDestinoOptions] = useState([]);
const [tipoVeiculoOptions, setTipoVeiculoOptions] = useState([]);
const [tipoOperacaoOptions, setTipoOperacaoOptions] = useState([]);

  

  const metas = {
    "MTZ - 1": 37,
    "MTZ - 2": 37,
    "MTZ - 3": 45,
    "MTZ - 4": 50,
    "MTZ": 25,
    "MTZ - Transferencia CAS": 18,
    "MTZ - Transferencia GUA":18, 
    "MTZ - Transferencia IBI":18,
    "MTZ - Transferencia MGA":18, 
    "MTZ - Transferencia PTO":18, 
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

  useEffect(() => {
    async function carregarOpcoesFiltros() {
      try {
        const res = await apiLocal.getOpcoesFiltrosViagens();
  
        setFiliaisOrigemOptions(res.data.filial_origem.map(v => ({ value: v, label: v })));
        setFiliaisDestinoOptions(res.data.filial_destino.map(v => ({ value: v, label: v })));
        setTipoVeiculoOptions(res.data.tipo_veiculo.map(v => ({ value: v, label: v })));
        setTipoOperacaoOptions(res.data.tipo_operacao.map(v => ({ value: v, label: v })));
      } catch (err) {
        console.error("Erro ao carregar filtros:", err);
      }
    }
  
    carregarOpcoesFiltros();
  }, []);
  

  const carregarViagens = async () => {
    setLoading(true);
    try {
      const responseViagens = await apiLocal.getViagensFiltradas({
        ...filters,
        filial_origem: filters.filial_origem.map(f => f.value),
        filial_destino: filters.filial_destino.map(f => f.value),
        tipo_veiculo: filters.tipo_veiculo.map(t => t.value),
        tipo_operacao: filters.tipo_operacao.map(t => t.value),
      });
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
      <Row style={{ alignContent:'center', width:'100%'}}>
  <Col md={1}>
    <FormGroup>
      <Label>Data Início</Label>
      <Input
        type="date"
        value={filters.dtInicio}
        onChange={(e) => setFilters(prev => ({ ...prev, dtInicio: e.target.value }))}
      />
    </FormGroup>
  </Col>
  <Col md={1}>
    <FormGroup>
      <Label>Data Final</Label>
      <Input
        type="date"
        value={filters.dtFinal}
        onChange={(e) => setFilters(prev => ({ ...prev, dtFinal: e.target.value }))}
      />
    </FormGroup>
  </Col>
  <Col md={2}>
    <FormGroup>
      <Label>Filial Origem</Label>
      <Select
        isMulti
        options={filiaisOrigemOptions}
        value={filters.filial_origem}
        onChange={(value) => setFilters(prev => ({ ...prev, filial_origem: value }))}
        placeholder="Selecione"
        styles={{
          option: (provided) => ({ ...provided, color: "#000" }),
          singleValue: (provided) => ({ ...provided, color: "#000" }),
          multiValue: (provided) => ({ ...provided, color: "#000" }),
          placeholder: (provided) => ({ ...provided, color: "#888" }),
        }}
      />
    </FormGroup>
  </Col>
  <Col md={2}>
    <FormGroup>
      <Label>Filial Destino</Label>
      <Select
        isMulti
        options={filiaisDestinoOptions}
        value={filters.filial_destino}
        onChange={(value) => setFilters(prev => ({ ...prev, filial_destino: value }))}
        placeholder="Selecione"
        styles={{
          option: (provided) => ({ ...provided, color: "#000" }),
          singleValue: (provided) => ({ ...provided, color: "#000" }),
          multiValue: (provided) => ({ ...provided, color: "#000" }),
          placeholder: (provided) => ({ ...provided, color: "#888" }),
        }}
      />
    </FormGroup>
  </Col>

  <Col md={2}>
    <FormGroup>
      <Label>Tipo de Veículo</Label>
      <Select
        isMulti
        options={tipoVeiculoOptions}
        value={filters.tipo_veiculo}
        onChange={(value) => setFilters(prev => ({ ...prev, tipo_veiculo: value }))}
        placeholder="Selecione"
        styles={{
          option: (provided) => ({ ...provided, color: "#000" }),
          singleValue: (provided) => ({ ...provided, color: "#000" }),
          multiValue: (provided) => ({ ...provided, color: "#000" }),
          placeholder: (provided) => ({ ...provided, color: "#888" }),
        }}
      />
    </FormGroup>
  </Col>
  <Col md={2}>
    <FormGroup>
      <Label>Tipo de Operação</Label>
      <Select
        isMulti
        options={tipoOperacaoOptions}
        value={filters.tipo_operacao}
        onChange={(value) => setFilters(prev => ({ ...prev, tipo_operacao: value }))}
        placeholder="Selecione"
        styles={{
          option: (provided) => ({ ...provided, color: "#000" }),
          singleValue: (provided) => ({ ...provided, color: "#000" }),
          multiValue: (provided) => ({ ...provided, color: "#000" }),
          placeholder: (provided) => ({ ...provided, color: "#888" }),
        }}
      />
    </FormGroup>
  </Col>
  <Col md={2} style={{ display: "flex", alignItems: "center", marginTop:'15px' }}>
    <Button color="primary" onClick={carregarViagens} style={{ width: "100%" }} disabled={loading}>
     {loading ? <LoadingDots/> : "Aplicar Filtros"} 
    </Button>
  </Col>
</Row>

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
