import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FaCheckCircle, FaEye, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { Container, InputContainer, Input, CardContainer, RemoveButton, CheckboxContainer, Label, TextArea,Table,
  TableRow,
  TableCell,
  TableHeader,
  ActionButton } from "./style";
import { fetchDocumento, fetchViagem } from "../../../services/api";
import CardLucro from "./CardLucro";
import { Col, Row } from "reactstrap";
import { toast } from "react-toastify";
import LoadingDots from "../../../components/Loading";
import apiLocal from "../../../services/apiLocal";

const tiposVeiculoOptions = [
  { value: "TRUCK", label: "TRUCK" },
  { value: "TOCO", label: "TOCO" },
  { value: " 3/4", label: " 3/4" },
  { value: "VAN", label: "VAN" },
  { value: "FIORINO", label: "FIORINO" },
  { value: "CARRETA", label: "CARRETA" }
];

const GerarViagem = () => {
  const [numeroViagem, setNumeroViagem] = useState("");
  const [numeroCTE, setNumeroCTE] = useState("");
  const [custoViagem, setCustoViagem] = useState(0);
  const [custoTabela, setCustoTabela] = useState(0);
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
useEffect(() => {
  calcularCustoViagem();
}, [ctes, tipoVeiculo]);


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
            calcularCustoViagem();
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
const calcularCustoViagem = async () => {
  if (!tipoVeiculo || ctes.length === 0) {
      setCustoViagem(0);
      return;
  }

  try {
      const response = await apiLocal.getCustosFrete();

      if (!response.data || response.data.length === 0) {
          setCustoViagem(0);
          toast.warning("Nenhuma tabela de custos disponível.");
          return;
      }


      // 🔍 1. Pegando as cidades dos CTEs
      const destinosCtes = ctes.map(cte => cte.cidade?.trim().toUpperCase()).filter(Boolean);

      if (destinosCtes.length === 0) {
          setCustoViagem(0);
          toast.warning("Nenhuma cidade de destino válida encontrada nos CTEs.");
          return;
      }

      const tipoVeiculoFormatado = tipoVeiculo.trim().toUpperCase();

      // 🔍 2. Filtrar apenas os custos correspondentes ao veículo e à cidade dos CTEs
      const tarifasFiltradas = response.data.filter(item =>
          destinosCtes.includes(item.destino.trim().toUpperCase()) &&
          item.tipo_veiculo.trim().toUpperCase() === tipoVeiculoFormatado
      );


      if (tarifasFiltradas.length === 0) {
          setCustoViagem(0);
          toast.warning(`Nenhuma tarifa encontrada para "${tipoVeiculo}" nas cidades de destino dos CTEs.`);
          return;
      }

      // 🔍 3. Buscar as distâncias da tabela de custos
      const distanciasValidas = tarifasFiltradas
          .map(item => {
              let distancia = parseFloat(item.distancia_km);
              if (isNaN(distancia) || distancia <= 0) {
                  return 0;
              }
              return distancia;
          })
          .filter(dist => dist > 0);


      if (distanciasValidas.length === 0) {
          setCustoViagem(0);
          toast.warning("Nenhuma distância válida encontrada nos CTEs.");
          return;
      }

      // 🔍 4. Pegando a maior distância encontrada
      const maiorDistancia = Math.max(...distanciasValidas);

      // 🔍 5. Encontrar a tarifa correspondente a essa distância
      const tarifaEncontrada = tarifasFiltradas.find(
          item => parseFloat(item.distancia_km) === maiorDistancia
      );


      if (tarifaEncontrada) {
          setCustoViagem(tarifaEncontrada.valor);
setCustoTabela(tarifaEncontrada.valor); // Armazena o valor original da tabela

      } else {
          setCustoViagem(0);
          
          toast.warning(`Nenhuma tarifa encontrada para "${tipoVeiculo}" com ${maiorDistancia} km.`);
      }
  } catch (error) {
      console.error("❌ Erro ao buscar custo de frete:", error);
      setCustoViagem(0);
      toast.error("Erro ao buscar custo de frete.");
  }
};
const calcularCustoTabela = () => {
  if (!tipoVeiculo || ctes.length === 0) return 0;

  try {
    const response = apiLocal.getCustosFrete();
    if (!response.data || response.data.length === 0) return 0;

    const tipoVeiculoFormatado = tipoVeiculo.trim().toUpperCase();
    const destinosCtes = ctes.map(cte => cte.cidade?.trim().toUpperCase()).filter(Boolean);

    const tarifasFiltradas = response.data.filter(item =>
      destinosCtes.includes(item.destino.trim().toUpperCase()) &&
      item.tipo_veiculo.trim().toUpperCase() === tipoVeiculoFormatado
    );

    if (tarifasFiltradas.length === 0) return 0;

    const distanciasValidas = tarifasFiltradas.map(item => parseFloat(item.distancia_km) || 0).filter(dist => dist > 0);
    if (distanciasValidas.length === 0) return 0;

    const maiorDistancia = Math.max(...distanciasValidas);
    const tarifaEncontrada = tarifasFiltradas.find(item => parseFloat(item.distancia_km) === maiorDistancia);

    return tarifaEncontrada ? tarifaEncontrada.valor : 0;
  } catch (error) {
    console.error("Erro ao calcular custo da tabela:", error);
    return 0;
  }
};





const removerCTE = (index) => {
  setCtes((prevCtes) => {
      calcularCustoViagem();
      const novaLista = prevCtes.filter((_, i) => i !== index);

      if (novaLista.length === 0) {
          // Reseta os inputs caso todos os CTEs sejam removidos
          setFilialOrigem("");
          setFilialDestino("");
          setNumeroViagem("");
          setCustoViagem(0);
          setNumeroCTE("");
          setTipoVeiculo(null);
      }

      return novaLista;
  });
};


  return (
    <Container>
      <p style={{ textAlign: "start", width: "100%", fontSize: 50, fontWeight: 700 }}>Carga Lucrativa</p>
      <Row>
      <InputContainer>
      {/* <Col md="1">
        <Input 
          type="text" 
          placeholder="Número da Viagem (Opcional)" 
          value={numeroViagem} 
          onChange={(e) => setNumeroViagem(e.target.value)} 
          onKeyDown={(e) => (e.key === "Enter" || e.key === "Tab") && buscarCTE()}

        />
        </Col> */}
        <Col md="4">
        <div style={{ position: "relative", width: "100%" }}>
        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Número do CTE</label>

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
        <Col md="3">
        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Tipo de Veículo</label>

        <Select
    name="tipo_veiculo"
    options={tiposVeiculoOptions}
    placeholder="Selecione o Tipo de Veículo"
    value={tiposVeiculoOptions.find(option => option.value === tipoVeiculo)|| null}
    onChange={(selectedOption) => {
        setTipoVeiculo(selectedOption.value);
        calcularCustoViagem(); // Dispara o cálculo imediatamente
    }}
    isDisabled={ctes.length === 0}

          styles={{
            control: (provided) => ({
              ...provided,
              backgroundColor: ctes.length === 0 ? "#bcbcbc" : "#fff",
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
        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Filial Origem</label>

        <Input style={{background:'#bcbcbc'}} type="text" placeholder="Filial Origem" value={filialOrigem} disabled />
        </Col>
        <Col md="1">
        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Filial Destino</label>

        <Input style={{background:'#bcbcbc'}} type="text" placeholder="Filial Destino" value={filialDestino} disabled />
        </Col>
        

        <Col md="2">
        <label style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Custo da Viagem</label>

        <Input 
  style={{ background: custoManual ? '#fff' : '#bcbcbc' }} 
  type="number" 
  placeholder="Custo da Viagem" 
  value={custoViagem} 
  onChange={(e) => setCustoViagem(e.target.value ? parseFloat(e.target.value) : 0)} 
  disabled={!custoManual} 
/>

  </Col>
  <Col md="4">
  <label style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>Observações</label>

<TextArea
  placeholder="Observações (Opcional)"
  value={obs}
  onChange={(e) => setObs(e.target.value)}
  />
  </Col>

  <Col md="3">
        <CheckboxContainer>
          <Label>
          <input 
  type="checkbox" 
  checked={custoManual} 
  onChange={(e) => {
    if (!e.target.checked && custoViagem !== custoTabela) {
      toast.warning("Não é possível desativar Custo Manual sem redefinir o valor original.");
      return;
    }
    setCustoManual(e.target.checked);
  }} 
/>
            Custo Manual
          </Label>
          <Label>
          <input 
  type="checkbox" 
  checked={cargaDividida} 
  onChange={(e) => {
    const destinosUnicos = [...new Set(ctes.map(cte => cte.destino))];

    if (!e.target.checked && destinosUnicos.length > 1) {
      toast.warning("Não é possível desativar Carga Dividida com múltiplos destinos.");
      return;
    }
    
    setCargaDividida(e.target.checked);
  }} 
/>

            Carga Dividida
          </Label>
        </CheckboxContainer>
  </Col>
 
      </InputContainer>
      </Row>
      <CardContainer>
  <Row>
    <Col md="8">
      {ctes.length > 0 ? (
        <Table>
        <thead>
          <TableRow>
            <TableHeader>CTE</TableHeader>
            <TableHeader>Cliente</TableHeader>
            <TableHeader>Receita Total</TableHeader>
            <TableHeader>Qtd NF</TableHeader>
            <TableHeader>Prazo de Entrega</TableHeader>
            <TableHeader>Peso Total</TableHeader>
            <TableHeader>Volume</TableHeader>
            <TableHeader>Ações</TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {ctes.map((cte, index) => (
            <TableRow key={index}>
              <TableCell>
                <FaCheckCircle style={{ color: "green" }} /> <strong>{cte.numero_cte}</strong>
              </TableCell>
              <TableCell>{cte.tomador}</TableCell>
              <TableCell>R$ {cte.valor_receita_total.toFixed(2)}</TableCell>
              <TableCell>{cte.nfs.length}</TableCell>
              <TableCell>
                {cte.agendamento ? (
                  <span style={{ backgroundColor: "#007bff", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "15px", width: "100%" }}>
                    {cte.agendamento} Agendado
                  </span>
                ) : (
                  cte.prazo_entrega
                )}
              </TableCell>
              <TableCell>{cte.peso_total} kg</TableCell>
              <TableCell>{cte.volume}</TableCell>
              <TableCell>
                <ActionButton
                  style={{ background: "red", color: "#fff", borderRadius: "5px" }}
                  onClick={() => removerCTE(index)}
                >
                  <FaTrash size={16} />
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
      
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            padding: "20px",
            color:'#fff',
            borderRadius: "12px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
            textAlign: "center",
          }}
        >
          <FaExclamationTriangle size={40} color="#FF9800" style={{ marginBottom: "10px" }} />
          <h4 style={{ color: "#fff", fontWeight: "bold", marginBottom: "5px" }}>
            Nenhum registro encontrado
          </h4>
          <p style={{ color: "#fff", fontSize: "14px" }}>
            Adicione um CTE para visualizar os cálculos.
          </p>
        </div>
      )}
    </Col>
    <Col md="4">
      <CardLucro
        ctes={ctes}
        custoViagem={custoViagem}
        numeroViagem={numeroViagem}
        setCtes={setCtes}
        setNumeroViagem={setNumeroViagem}
        setNumeroCTE={setNumeroCTE}
        setCustoViagem={setCustoViagem}
      />
    </Col>
  </Row>
</CardContainer>


    </Container>
  );
};

export default GerarViagem;

