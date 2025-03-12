import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FaCheckCircle, FaEye, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { Container, InputContainer, Input, CardContainer, RemoveButton, CheckboxContainer, Label, TextArea } from "./style";
import { fetchDocumento, fetchViagem } from "../../../services/api";
import CardLucro from "./CardLucro";
import { Col, Row } from "reactstrap";

const tiposVeiculoOptions = [
  { value: "TRUCK", label: "TRUCK" },
  { value: "TOCO", label: "TOCO" },
  { value: "3/4", label: "3/4" },
  { value: "VAN", label: "VAN" },
  { value: "FIORINO", label: "FIORINO" },
  { value: "CARRETA", label: "CARRETA" }
];

const GerarViagem = () => {
  const [numeroViagem, setNumeroViagem] = useState("");
  const [numeroCTE, setNumeroCTE] = useState("");
  const [custoViagem, setCustoViagem] = useState(0);
  const [ctes, setCtes] = useState([]);
  const [tipoVeiculo, setTipoVeiculo] = useState(null);
  const [custoManual, setCustoManual] = useState(false);
  const [cargaDividida, setCargaDividida] = useState(false);
  const [obs, setObs] = useState("");
  const [filialOrigem, setFilialOrigem] = useState("");
  const [filialDestino, setFilialDestino] = useState("");

  const buscarViagem = async () => {
    if (!numeroViagem) return;
    try {
      const response = await fetchViagem(numeroViagem);
      if (response.data && response.data.detalhe) {
        setCtes(response.data.detalhe.documentos_transporte || []);
      }
    } catch (error) {
      console.error("Erro ao buscar viagem:", error);
    }
  };

  const buscarCTE = async () => {
    if (!numeroCTE) return;
    try {
      const response = await fetchDocumento(numeroCTE);
      if (response.detalhe) {
        const novoCTE = {
          numero_cte: response.detalhe.docTransporte || numeroCTE,
          peso: response.detalhe.peso || 0,
          volume: response.detalhe.vol || 0,
          quantidade: response.detalhe.qtde || 0,
          tomador: response.detalhe.tomador,
          destino: response.detalhe.destino,
          cidade: response.detalhe.cidade,
          prazo_entrega: response.detalhe.prazo_entrega || 0,
          valor_receita_total: response.detalhe.valor_receita_total || 0,
          valor_frete: response.detalhe.valor_receita_sep.valor_frete || 0,
          icms: response.detalhe.valor_receita_sep.icms || 0,
          ad_valorem: response.detalhe.valor_receita_sep.gris || 0,
          valor_mercadoria: response.detalhe.valor_mercadoria || 0,
          peso_total: response.detalhe.peso_total || 0,
          cubagem_total: response.detalhe.cubagem_total || 0,
          nfs: response.detalhe.nfs || []
        };

        // Define automaticamente a Filial Origem e Destino com base no primeiro CTE adicionado
        if (ctes.length === 0) {
          setFilialOrigem(response.detalhe.filial_origem || "");
          setFilialDestino(response.detalhe.filial_destino || "");
        }

        setCtes((prevCtes) => [...prevCtes, novoCTE]);
        setNumeroCTE(""); 
        setTimeout(() => document.getElementById("inputCTE").focus(), 100);
      }
    } catch (error) {
      console.error("Erro ao buscar CTE:", error);
    }
  };

  const removerCTE = (index) => {
    setCtes((prevCtes) => prevCtes.filter((_, i) => i !== index));
  };

  return (
    <Container>
      <p style={{ textAlign: "start", width: "100%", fontSize: 50, fontWeight: 700 }}>Carga Lucrativa</p>
      <Row>
      <InputContainer>
      <Col md="1">
        <Input 
          type="text" 
          placeholder="Número da Viagem (Opcional)" 
          value={numeroViagem} 
          onChange={(e) => setNumeroViagem(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && buscarViagem()} 
        />
        </Col>
        <Col md="5">
        <Input 
          id="inputCTE" 
          type="text" 
          placeholder="Número do CTE" 
          value={numeroCTE} 
          onChange={(e) => setNumeroCTE(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && buscarCTE()} 
        />
        </Col>
        <Col md="2">
        <Select
          name="tipo_veiculo"
          options={tiposVeiculoOptions}
          placeholder="Selecione o Tipo de Veículo"
          value={tiposVeiculoOptions.find(option => option.value === tipoVeiculo)}
          onChange={(selectedOption) => setTipoVeiculo(selectedOption.value)}
          styles={{
            control: (provided) => ({
              ...provided,
              backgroundColor: "#fff",
              borderColor: "#ccc",
              color: "#000",
              fontSize: "16px",
              height: "45px",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "#000",
            }),
            placeholder: (provided) => ({
              ...provided,
              color: "#555",
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "#fff",
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected ? "#ddd" : "#fff",
              color: "#000",
              fontSize: "16px",
            }),
          }}
        />
        </Col>
        <Col md="1">
        <Input style={{background:'#bcbcbc'}} type="text" placeholder="Filial Origem" value={filialOrigem} disabled />
        </Col>
        <Col md="1">
        <Input style={{background:'#bcbcbc'}} type="text" placeholder="Filial Destino" value={filialDestino} disabled />
        </Col>
        
        <Col md="2">
        <Input 
  style={{ background: custoManual ? '#fff' : '#bcbcbc' }} 
  type="number" 
  placeholder="Custo da Viagem" 
  value={custoViagem} 
  onChange={(e) => setCustoViagem(e.target.value ? parseFloat(e.target.value) : 0)} 
  disabled={!custoManual} 
/>

  </Col>

  <Col md="3">
        <CheckboxContainer>
          <Label>
            <input type="checkbox" checked={custoManual} onChange={(e) => setCustoManual(e.target.checked ? "S" : null)} />
            Custo Manual
          </Label>
          <Label>
            <input type="checkbox" checked={cargaDividida} onChange={(e) => setCargaDividida(e.target.checked ? "S" : null)} />
            Carga Dividida GUA/PTO
          </Label>
        </CheckboxContainer>
  </Col>
  <Col md="5">

        <TextArea
          placeholder="Observações (Opcional)"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          />
          </Col>
      </InputContainer>
      </Row>
      <CardContainer>
        <Row>
          <Col md="8">
          <table>
            <thead>
              <tr>
                <th>CTE</th>
                <th>Cliente</th>
                <th>Receita Total</th>
                <th>Quantidade de Notas</th>
                <th>Prazo de Entrega</th>
                <th>Peso Total</th>
                <th>Volume</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ctes.map((cte, index) => (
                <tr key={index}>
                  <td><FaCheckCircle style={{ color: "green" }} /> <strong>{cte.numero_cte}</strong></td>
                  <td className="truncate">{cte.tomador}</td>
                  <td>R$ {cte.valor_receita_total.toFixed(2)}</td>
                  <td>{cte.nfs.length}</td>
                  <td>{cte.prazo_entrega}</td>
                  <td>{cte.peso_total} kg</td>
                  <td>{cte.volume}</td>
                  <td><RemoveButton onClick={() => removerCTE(index)}><FaTrash size={16} /></RemoveButton></td>
                </tr>
              ))}
            </tbody>
          </table>
          </Col>
          <Col md="4">
<CardLucro ctes={ctes} custoViagem={custoViagem} numeroViagem={numeroViagem} setCtes={setCtes} setNumeroViagem={setNumeroViagem} setNumeroCTE={setNumeroCTE} setCustoViagem={setCustoViagem} />
          </Col>
        </Row>
      </CardContainer>
    </Container>
  );
};

export default GerarViagem;

