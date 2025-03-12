import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FaCheckCircle, FaEye, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { Container, InputContainer, Input, CardContainer, RemoveButton, CheckboxContainer, Label, TextArea } from "./style";
import { fetchDocumento, fetchViagem } from "../../../services/api";
import CardLucro from "./CardLucro";
import { Col, Row } from "reactstrap";
import { toast } from "react-toastify";
import LoadingDots from "../../../components/Loading";

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
  const [loadingCTE, setLoadingCTE] = useState(false);


//   const buscarViagem = async () => {
//     if (!numeroViagem) return;
//     try {
//       const response = await fetchViagem(numeroViagem);
//       if (response.data && response.data.detalhe) {
//         setCtes(response.data.detalhe.documentos_transporte || []);
//       }
//     } catch (error) {
//       console.error("Erro ao buscar viagem:", error);
//     }
//   };

const buscarCTE = async () => {
    if (!numeroCTE) return;
    if (loadingCTE) return; // Evita chamadas duplicadas
    setLoadingCTE(true);
    
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
                prazo_entrega: response.detalhe.prazo_entrega || "",
                agendamento: response.detalhe.agendamento || null,
                valor_receita_total: response.detalhe.valor_receita_total || 0,
                valor_frete: response.detalhe.valor_receita_sep.valor_frete || 0,
                icms: response.detalhe.valor_receita_sep.icms || 0,
                ad_valorem: response.detalhe.valor_receita_sep.gris || 0,
                valor_mercadoria: response.detalhe.valor_mercadoria || 0,
                peso_total: response.detalhe.peso_total || 0,
                cubagem_total: response.detalhe.cubagem_total || 0,
                nfs: response.detalhe.nfs || []
            };

            // Define a Filial Origem e Destino para o primeiro CTE incluído
            if (ctes.length === 0) {
                setFilialOrigem(response.detalhe.fil_ori || "");
                setFilialDestino(cargaDividida ? "GUA/PTO" : response.detalhe.fil_des || "");
            }

           // Verifica se a Filial Origem e Destino do novo CTE diverge da atual
           if (!cargaDividida && ctes.length > 0 && response.detalhe.fil_ori !== filialOrigem) {
            toast.error("Filial de origem divergente! Todos os CTEs devem ter a mesma filial de origem.");
            setLoadingCTE(false);
            return;
        }
        

// Se Carga Dividida estiver ativada, permite diferentes Filiais de Destino
if (cargaDividida) {
    setFilialDestino((prevDestino) => {
        const filiais = new Set(prevDestino.split("/").filter(Boolean)); // Converte em Set para evitar duplicações
        filiais.add(response.detalhe.fil_des); // Adiciona nova filial ao conjunto
        return Array.from(filiais).join("/"); // Retorna todas as filiais separadas por "/"
    });
} else {
    // Caso Carga Dividida NÃO esteja ativada, não permite divergências na Filial Destino
    if (ctes.length > 0 && response.detalhe.fil_des !== filialDestino) {
        toast.error("Filial de destino divergente! Ative 'Carga Dividida' se necessário.");
        setLoadingCTE(false);
        return;
    }
}


            // Impede duplicação do mesmo CTE na lista
            if (ctes.some(cte => cte.numero_cte === novoCTE.numero_cte)) {
                toast.warning("Já existe esse CTE nessa viagem!");
                setLoadingCTE(false);
                return;
            }

            // Adiciona o novo CTE à lista
            setCtes((prevCtes) => [...prevCtes, novoCTE]);
            setNumeroCTE(""); 
            setTimeout(() => document.getElementById("inputCTE").focus(), 100);
            toast.success("CTE incluído com sucesso!");
        }
    } catch (error) {
        toast.error("Erro ao buscar CTE:", error);
    } finally {
        setLoadingCTE(false);
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
          onKeyDown={(e) => (e.key === "Enter" || e.key === "Tab") && buscarCTE()}

        />
        </Col>
        <Col md="4">
        <div style={{ position: "relative", width: "100%" }}>
  <Input 
    id="inputCTE" 
    type="text" 
    placeholder="Número do CTE" 
    value={numeroCTE} 
    onChange={(e) => setNumeroCTE(e.target.value)} 
    onKeyDown={(e) => (e.key === "Enter" || e.key === "Tab") && buscarCTE()} 
    disabled={loadingCTE} 
    style={{ backgroundColor: loadingCTE ? "#e0e0e0" : "#fff", cursor: loadingCTE ? "not-allowed" : "text" }}
  />
  {loadingCTE && (
    <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}>
      <LoadingDots />
    </div>
  )}
</div>


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

  <Col md="2">
        <CheckboxContainer>
          <Label>
            <input type="checkbox" checked={custoManual} onChange={(e) => setCustoManual(e.target.checked ? "S" : null)} />
            Custo Manual
          </Label>
          <Label>
            <input type="checkbox" checked={cargaDividida} onChange={(e) => setCargaDividida(e.target.checked ? "S" : null)} />
            Carga Dividida
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
                <th>Qtd NF</th>
                <th>Prazo de Entrega</th>
                <th>Peso Total</th>
                <th>Volume</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ctes.map((cte, index) => (
                <tr key={index}>
                  <td><FaCheckCircle style={{ color: "green" }} /> <strong>{cte.numero_cte}</strong></td>
                  <td className="truncate">{cte.tomador}</td>
                  <td>R$ {cte.valor_receita_total.toFixed(2)}</td>
                  <td>{cte.nfs.length}</td>
                  <td>
  {cte.agendamento ? (
    <span style={{ 
      backgroundColor: "#007bff", 
      color: "white", 
      padding: "3px 8px", 
      borderRadius: "4px", 
      fontSize: "15px",  
      width:'100%'
    }}>
      {cte.agendamento} Agendado
    </span>
  ) : (
    cte.prazo_entrega
  )}
</td>


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

