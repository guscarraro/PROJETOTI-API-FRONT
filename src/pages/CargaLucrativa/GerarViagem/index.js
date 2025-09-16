import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  Container,
  InputContainer,
  Input,
  CardContainer,
  CheckboxContainer,
  Label,
  TextArea,
} from "./style";
import { fetchDocumento } from "../../../services/api";
import CardLucro from "./CardLucro";
import { Col, Row } from "reactstrap";
import { toast } from "react-toastify";
import LoadingDots from "../../../components/Loading";
import apiLocal from "../../../services/apiLocal";
import TableCTE from "./TableCTE";
import { useParams } from "react-router-dom";
import ModalSelectDoc from "./ModalSelectDoc"; // Caminho onde estiver seu modal


const tiposVeiculoOptions = [
  { value: "TRUCK", label: "TRUCK" },
  { value: "TOCO", label: "TOCO" },
  { value: " 3/4", label: " 3/4" },
  { value: "VAN", label: "VAN" },
  { value: "FIORINO", label: "FIORINO" },
  { value: "CARRETA", label: "CARRETA" },
];
// Obter o setor do usuário (já corrigido anteriormente)
// Obter o setor do usuário
const user = JSON.parse(localStorage.getItem("user"));
const setor = user?.setor;

// Definir as opções padrão
const tiposOperacaoPadrao = [
  { value: "MTZ - Transferencia CAS", label: "MTZ - Transferencia CAS" },
  { value: "MTZ - Transferencia GUA", label: "MTZ - Transferencia GUA" },
  { value: "MTZ - Transferencia IBI", label: "MTZ - Transferencia IBI" },
  { value: "MTZ - Transferencia MGA", label: "MTZ - Transferencia MGA" },
  { value: "MTZ - Transferencia PTO", label: "MTZ - Transferencia PTO" },
  { value: "MTZ", label: "MTZ" },
  { value: "MTZ - 1", label: "MTZ - 1" },
  { value: "MTZ - 2", label: "MTZ - 2" },
  { value: "MTZ - 3", label: "MTZ - 3" },
  { value: "MTZ - 4", label: "MTZ - 4" },
];

// Opções específicas para o setor PTO (7a84...)
const tiposOperacaoPTO = [
  { value: "PTO - 1", label: "PTO - 1" },
  { value: "PTO - 2", label: "PTO - 2" },
  { value: "PTO - 3", label: "PTO - 3" },
  { value: "PTO - 4", label: "PTO - 4" },
];

// Opções específicas para o setor MGA (9f5c...)
const tiposOperacaoMGA = [
  { value: "MGA - 1", label: "MGA - 1" },
  { value: "MGA - 2", label: "MGA - 2" },
  { value: "MGA - 3", label: "MGA - 3" },
  { value: "MGA - 4", label: "MGA - 4" },
];

// Definir as opções finais baseadas no setor
const todasOperacoes = [
  ...tiposOperacaoPadrao,
  ...tiposOperacaoPTO,
  ...tiposOperacaoMGA
];

const tiposOperacaoOptions =
  user?.tipo === "base.pto"
    ? tiposOperacaoPTO
    : user?.tipo === "base.mga"
      ? tiposOperacaoMGA
      : tiposOperacaoPadrao;


const GerarViagem = ({ numeroViagemParam }) => {
  const { numero_viagem } = useParams(); // ✅ Pegando da URL, se existir
  const numeroViagemFinal = numeroViagemParam || numero_viagem || null;
  const [numeroViagem, setNumeroViagem] = useState("");
  const [numeroCTE, setNumeroCTE] = useState("");
  const [custoViagem, setCustoViagem] = useState(0);
  const [custoTabela, setCustoTabela] = useState(0);
  const [ctes, setCtes] = useState([]);
  const [tipoVeiculo, setTipoVeiculo] = useState(null);
  const [custoManual, setCustoManual] = useState(false);
  const [tabelaCustosFrete, setTabelaCustosFrete] = useState([]);
  const [tipoOperacao, setTipoOperacao] = useState(null);
  const [cargaDividida, setCargaDividida] = useState(false);
  const [obs, setObs] = useState("");
  const [anexoImg, setAnexoImg] = useState("");
  const [filialOrigem, setFilialOrigem] = useState("");
  const [filialDestino, setFilialDestino] = useState("");
  const [loadingCTE, setLoadingCTE] = useState(false);
  const [loadingViagem, setLoadingViagem] = useState(false);
  const [tiposOperacaoDinamico, setTiposOperacaoDinamico] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [opcoesCTE, setOpcoesCTE] = useState([]);


  useEffect(() => {
    if (numeroViagemFinal) {

      carregarViagem(numeroViagemFinal);
    }
  }, [numeroViagemFinal]);
  useEffect(() => {
    if (!numeroViagemFinal) {
      carregarProximoNumeroViagem();
    }
  }, [numeroViagemFinal]);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const tipo = user?.tipo;

    if (tipo === "base.pto") {
      setTiposOperacaoDinamico(tiposOperacaoPTO);
    } else if (tipo === "base.mga") {
      setTiposOperacaoDinamico(tiposOperacaoMGA);
    } else {
      setTiposOperacaoDinamico(tiposOperacaoPadrao);
    }
  }, []);

  const carregarProximoNumeroViagem = async () => {
    try {
      const response = await apiLocal.getProximoNumeroViagem();
      if (response.data?.proximo_numero_viagem) {
        setNumeroViagem(response.data.proximo_numero_viagem);
      }
    } catch (error) {
      console.error("Erro ao buscar o próximo número de viagem:", error);
      setNumeroViagem("V1");
    }
  };

  const carregarViagem = async (numeroViagem) => {
    setLoadingViagem(true);

    try {
      const response = await apiLocal.getViagemById(numeroViagem);
      

      if (response.data) {
        setNumeroViagem(response.data.numero_viagem);
        const ctesFormatados = (response.data.documentos_transporte || []).map(cte => ({
          ...cte,
          filialOrigem: cte.filialOrigem || cte.filial_origem || "",
          filialDestino: cte.filialDestino || cte.filial_destino || "",
        }));
        setCtes(ctesFormatados);


        // Corrige Filial Origem e Destino baseado nos CTEs caso venha vazio
        const filialOrigemCorrigida = response.data.filial_origem || [...new Set(ctes.map(cte => cte.filial_origem || cte.filialOrigem))].join("/");
        const filialDestinoCorrigida = response.data.filial_destino || [...new Set(ctes.map(cte => cte.filial_destino || cte.filialDestino))].join("/");

        setFilialOrigem(filialOrigemCorrigida);
        setFilialDestino(filialDestinoCorrigida);

        setTipoVeiculo(response.data.tipo_veiculo);
        setTipoOperacao(response.data.tipo_operacao || null);
        setObs(response.data.obs);
        setAnexoImg(response.data.anexo_imagem);

        // 🔥 Pegando o custo total da API (evita valores nulos)
        const custoAPI = response.data.total_custo ?? 0;

        // 🔥 Define o custo manual conforme a API antes de atualizar o custo
        const isCustoManual = response.data.custo_manual === "S";
        setCustoManual(isCustoManual);
        setCustoTabela(custoAPI); // Atualiza o custo vindo da API

        if (isCustoManual) {
          setCustoViagem(custoAPI);
        }

        // Ajusta o estado de 'cargaDividida' conforme as filiais de origem e destino
        const origemDestinoDiferentes = response.data.filial_origem !== response.data.filial_destino;
        setCargaDividida(origemDestinoDiferentes); // Se filiais forem diferentes, define cargaDividida como true
      } else {
        setCtes([]);
      }
      setLoadingViagem(false);
    } catch (error) {
      toast.error("Erro ao carregar viagem.");
      setCtes([]);
      setLoadingViagem(false);
    }
  };


  // 🚀 **useEffect para garantir que `custoViagem` seja atualizado corretamente**
  useEffect(() => {
    if (!custoManual && tabelaCustosFrete.length > 0) {

      calcularCustoViagem();
    }
  }, [custoManual, ctes.length, tipoVeiculo, tabelaCustosFrete]);


  useEffect(() => {
    const carregarTabelaFrete = async () => {
      try {
        const response = await apiLocal.getCustosFrete();
        if (response.data) {

          setTabelaCustosFrete(response.data);
          // ✅ Chama o cálculo APÓS carregar a tabela
          if (!custoManual) {
            calcularCustoViagem(response.data);
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar tabela de custos de frete.");
      }
    };
    carregarTabelaFrete();
  }, []);
  useEffect(() => {
    calcularCustoViagem();
  }, [ctes.length, tipoVeiculo]);


  const buscarCTE = async (cteDireto = null) => {
    if (!numeroCTE && !cteDireto) return;
    if (loadingCTE) return;

    setLoadingCTE(true);

    try {
      const response = cteDireto
        ? { detalhe: cteDireto }
        : await fetchDocumento(numeroCTE);

      if (Array.isArray(response) && response.length > 1) {
        setOpcoesCTE(response);
        setModalVisible(true);
        return;
      }

      const detalhe = Array.isArray(response) ? response[0] : response?.detalhe;

      if (!detalhe) {
        toast.error("CTE não encontrado.");
        return;
      }

      const novoCTE = {
        numero_cte: detalhe.docTransporte || numeroCTE,
        peso: detalhe.peso || 0,
        volume: detalhe.vol || 0,
        quantidade: detalhe.qtde || 0,
        tomador: detalhe.tomador,
        destino: detalhe.destino,
        cidade: detalhe.cidade,
        filialOrigem: detalhe.fil_ori,
        filialDestino: detalhe.fil_des,
        prazo_entrega: detalhe.prazo_entrega || "",
        agendamento: detalhe.agendamento || null,
        valor_receita_total: detalhe.valor_receita_total || 0,
        valor_frete: detalhe.valor_receita_sep?.valor_frete || 0,
        icms: detalhe.valor_receita_sep?.icms || 0,
        ad_valorem: detalhe.valor_receita_sep?.gris || 0,
        valor_mercadoria: detalhe.valor_mercadoria || 0,
        peso_total: detalhe.peso_total || 0,
        cubagem_total: detalhe.cubagem_total || 0,
        notas_fiscais: detalhe.nfs || [],

      };

      if (ctes.length === 0) {
        setFilialOrigem(detalhe.fil_ori || "");
        setFilialDestino(cargaDividida ? "GUA/PTO" : detalhe.fil_des || "");
      }

      if (cargaDividida) {
        setFilialOrigem((prev) => {
          const origens = new Set(prev.split("/").filter(Boolean));
          origens.add(detalhe.fil_ori);
          return Array.from(origens).join("/");
        });

        setFilialDestino((prev) => {
          const destinos = new Set(prev.split("/").filter(Boolean));
          destinos.add(detalhe.fil_des);
          return Array.from(destinos).join("/");
        });
      }

      if (!cargaDividida && ctes.length > 0 && detalhe.fil_ori !== filialOrigem) {
        toast.error("Filial de origem divergente! Todos os CTEs devem ter a mesma filial de origem.");
        return;
      }

      if (!cargaDividida && ctes.length > 0 && detalhe.fil_des !== filialDestino) {
        toast.error("Filial de destino divergente! Ative 'Carga Dividida' se necessário.");
        return;
      }

      const normalizarCTE = (numero) => String(numero).replace(/\D/g, "").replace(/^0+/, "");

      const cteDigitado = normalizarCTE(novoCTE.numero_cte);

      if (
        ctes.some((cte) => normalizarCTE(cte.numero_cte) === cteDigitado)
      ) {
        toast.warning("Esse CTE já está na viagem!");
        return;
      }


      setCtes((prev) => [...prev, novoCTE]);
      calcularCustoViagem();
      setNumeroCTE("");
      setTimeout(() => document.getElementById("inputCTE").focus(), 100);
      toast.success("CTE incluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao buscar CTE.");
      console.error(error);
    } finally {
      setLoadingCTE(false);
    }
  };


  useEffect(() => {
    if (!custoManual && tabelaCustosFrete.length > 0) {

      calcularCustoViagem();
    }
  }, [custoManual, ctes.length, tipoVeiculo, tabelaCustosFrete]);


  // 🚀 **Correção na função `calcularCustoViagem()`**
  const calcularCustoViagem = async (tabelaCustos = tabelaCustosFrete) => {
    if (custoManual) {

      return; // 🔥 Se custo manual estiver ativado, não sobrescreve o valor!
    }

    if (!tipoVeiculo || ctes.length === 0) {

      setCustoViagem(0);
      return;
    }

    try {
      if (!tabelaCustos || tabelaCustos.length === 0) {
        setCustoViagem(0);
        return;
      }

      // 🔍 1. Pegando as cidades dos CTEs
      const destinosCtes = ctes
        .map((cte) => cte.cidade?.trim().toUpperCase())
        .filter(Boolean);



      if (destinosCtes.length === 0) {

        setCustoViagem(0);
        toast.warning("Nenhuma cidade de destino válida encontrada nos CTEs.");
        return;
      }

      const tipoVeiculoFormatado = tipoVeiculo.trim().toUpperCase();


      // 🔍 2. Filtrar apenas os custos correspondentes ao veículo e às cidades dos CTEs
      const tarifasFiltradas = tabelaCustos.filter(
        (item) =>
          destinosCtes.includes(item.destino.trim().toUpperCase()) &&
          item.tipo_veiculo.trim().toUpperCase() === tipoVeiculoFormatado
      );



      if (tarifasFiltradas.length === 0) {

        setCustoViagem(0);
        toast.warning(`Nenhuma tarifa encontrada para "${tipoVeiculo}" nas cidades de destino.`);
        return;
      }

      // 🔍 3. Buscar a maior distância da tabela de custos
      const distanciasValidas = tarifasFiltradas
        .map((item) => {
          let distancia = parseFloat(item.distancia_km);
          return isNaN(distancia) || distancia <= 0 ? 0 : distancia;
        })
        .filter((dist) => dist > 0);



      if (distanciasValidas.length === 0) {

        setCustoViagem(0);
        toast.warning("Nenhuma distância válida encontrada nos CTEs.");
        return;
      }

      // 🔍 4. Pegando a maior distância encontrada
      const maiorDistancia = Math.max(...distanciasValidas);


      // 🔍 5. Encontrar a tarifa correspondente a essa distância
      const tarifaEncontrada = tarifasFiltradas.find(
        (item) => parseFloat(item.distancia_km) === maiorDistancia
      );

      if (tarifaEncontrada) {

        setCustoViagem(tarifaEncontrada.valor);
        setCustoTabela(tarifaEncontrada.valor); // Armazena o valor original da tabela
      } else {

        setCustoViagem(0);
        toast.warning(`Nenhuma tarifa encontrada para "${tipoVeiculo}" com ${maiorDistancia} km.`);
      }
    } catch (error) {
      console.error("🚨 Erro ao calcular custo de viagem:", error);
      setCustoViagem(0);
      toast.error("Erro ao buscar custo de frete.");
    }
  };


  const removerCTE = (index) => {
    setCtes((prevCtes) => {
      calcularCustoViagem();
      const novaLista = prevCtes.filter((_, i) => i !== index);

      if (cargaDividida) {
        setFilialOrigem((prevOrigem) => {
          const origensAtuais = new Set(
            novaLista.map((cte) => cte.filialOrigem).filter(Boolean)
          );
          return origensAtuais.size > 0 ? Array.from(origensAtuais).join("/") : "";
        });

        setFilialDestino((prevDestino) => {
          const destinosAtuais = new Set(
            novaLista.map((cte) => cte.filialDestino).filter(Boolean)
          );
          return destinosAtuais.size > 0 ? Array.from(destinosAtuais).join("/") : "";
        });
      }



      if (novaLista.length === 0) {
        // Reseta os inputs caso todos os CTEs sejam removidos
        setFilialOrigem("");
        setFilialDestino("");
        setNumeroViagem("");
        setCustoViagem(0);
        setNumeroCTE("");
        setTipoVeiculo(null);
        setTipoOperacao(null);
        setObs("");
      }

      return novaLista;
    });
  };

  return (
    <Container>
      <ModalSelectDoc
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        opcoes={opcoesCTE}
        onSelect={(cteSelecionado) => {
          setModalVisible(false);
          buscarCTE(cteSelecionado);
        }}
      />

      {numeroViagemFinal && loadingViagem ? (
        <>
          <LoadingDots />
        </>
      ) : (

        <>
          <p
            style={{
              textAlign: "start",
              width: "100%",
              fontSize: 50,
              fontWeight: 700,
            }}
          >
            Carga Lucrativa
          </p>
          <h4 style={{ textAlign: "start", fontSize: "20px", fontWeight: "600" }}>
            Número da Viagem: {numeroViagem || "N/A"}
          </h4>
          <Col md="3">
            <CheckboxContainer>
              <Label>
                <input
                  type="checkbox"
                  checked={custoManual}
                  onChange={(e) => {
                    if (!e.target.checked && custoViagem !== custoTabela) {
                      toast.warning(
                        "Não é possível desativar Custo Manual sem redefinir o valor original."
                      );
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
                    const destinosUnicos = [
                      ...new Set(ctes.map((cte) => cte.destino)),
                    ];

                    if (!e.target.checked && destinosUnicos.length > 1) {
                      toast.warning(
                        "Não é possível desativar Carga Dividida com múltiplos destinos."
                      );
                      return;
                    }

                    setCargaDividida(e.target.checked);
                  }}
                />
                Carga Dividida
              </Label>
            </CheckboxContainer>
          </Col>
          <Row>
            <InputContainer>
              <Col md="3">
                <label
                  style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}
                >
                  Tipo de Operação
                </label>

                <Select
                  name="tipo_operacao"
                  options={tiposOperacaoDinamico}
                  placeholder="Selecione o Tipo de Operação"
                  value={
                    tiposOperacaoOptions.find(
                      (option) => option.value === tipoOperacao
                    ) || null
                  }
                  onChange={(selectedOption) => setTipoOperacao(selectedOption.value)}
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

              <Col md="4">
                <div style={{ position: "relative", width: "100%" }}>
                  <label
                    style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}
                  >
                    Número do CTE
                  </label>

                  <Input
                    id="inputCTE"
                    type="text"
                    placeholder="Número do CTE"
                    value={numeroCTE}
                    onChange={(e) => setNumeroCTE(e.target.value)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === "Tab") && buscarCTE()
                    }
                    disabled={loadingCTE}
                    style={{
                      backgroundColor: loadingCTE ? "#e0e0e0" : "#fff",
                      cursor: loadingCTE ? "not-allowed" : "text",
                    }}
                  />
                  {loadingCTE && (
                    <div
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <LoadingDots />
                    </div>
                  )}
                </div>
              </Col>
              <Col md="3">
                <label
                  style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}
                >
                  Tipo de Veículo
                </label>

                <Select
                  name="tipo_veiculo"
                  options={tiposVeiculoOptions}
                  placeholder="Selecione o Tipo de Veículo"
                  value={
                    tiposVeiculoOptions.find(
                      (option) => option.value === tipoVeiculo
                    ) || null
                  }
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
                <label
                  style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}
                >
                  Filial Origem
                </label>

                <Input
                  style={{ background: "#bcbcbc" }}
                  type="text"
                  placeholder="Filial Origem"
                  value={filialOrigem}
                  disabled
                />
              </Col>
              <Col md="1">
                <label
                  style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}
                >
                  Filial Destino
                </label>

                <Input
                  style={{ background: "#bcbcbc" }}
                  type="text"
                  placeholder="Filial Destino"
                  value={filialDestino}
                  disabled
                />
              </Col>

              <Col md="2">
                <label
                  style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}
                >
                  Custo da Viagem
                </label>

                <Input
                  style={{ background: custoManual ? "#fff" : "#bcbcbc" }}
                  type="number"
                  placeholder="Custo da Viagem"
                  value={custoViagem}
                  onChange={(e) =>
                    setCustoViagem(e.target.value ? parseFloat(e.target.value) : 0)
                  }
                  disabled={!custoManual}
                />
              </Col>
              <Col md="4">
                <label
                  style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}
                >
                  Justificativa
                </label>

                <select
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                  }}
                >
                  <option value="">Selecione um motivo</option>
                  <option value="AGENDAMENTO PROXIMO">AGENDAMENTO PRÓXIMO</option>
                  <option value="FALTA NOTA">FALTA NOTA</option>
                  <option value="DATA DE ENTREGA PROXIMA">DATA DE ENTREGA PRÓXIMA</option>
                  <option value="LOTACAO MAXIMA">LOTAÇÃO MÁXIMA</option>
                </select>
              </Col>



            </InputContainer>
          </Row>
          <CardContainer>
            <Row>
              <Col md="8">
                <TableCTE ctes={ctes || []} tabelaCustosFrete={tabelaCustosFrete} removerCTE={removerCTE} />


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
                  setFilialOrigem={setFilialOrigem}
                  setFilialDestino={setFilialDestino}
                  setObs={setObs}
                  setAnexoImg={setAnexoImg}
                  setTipoVeiculo={setTipoVeiculo}
                  setTipoOperacao={setTipoOperacao}
                  tipoVeiculo={tipoVeiculo}
                  obs={obs}
                  anexoImg={anexoImg}
                  custoManual={custoManual}  // 🔥 Passando custoManual
                  cargaDividida={cargaDividida}
                  setCustoManual={setCustoManual}  // 🔥 Passando custoManual
                  setCargaDividida={setCargaDividida}
                  tipoOperacao={tipoOperacao}
                />
              </Col>
            </Row>
          </CardContainer>
        </>
      )}
    </Container>
  );
};

export default GerarViagem;
