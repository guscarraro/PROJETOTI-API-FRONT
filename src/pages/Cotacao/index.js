// Cotacao.jsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Container,
  Row,
  Col,
  Input,
  Label,
  Card,
  CardBody,
  Button,
} from "reactstrap";
import { parse, getWeek, isValid } from "date-fns";
import ChartViagem from "./ChartViagem";
import ChartRota from "./ChartRota";
import ChartPeso from "./ChartPeso";
import ChartRoi from "./ChartRoi";
import ModalReceita from "./ModalReceita";
import ModalDespesa from "./ModalDespesa";
import "./style.css";
import {
  FaMoneyBillWave,
  FaPercentage,
  FaTruckMoving,
  FaUserTie,
} from "react-icons/fa";
import { BsGraphUp } from "react-icons/bs";
import CountUp from "react-countup";

const Cotacao = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modoSimulacao, setModoSimulacao] = useState("validar");
  const [receitas, setReceitas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [modalReceitaOpen, setModalReceitaOpen] = useState(false);
  const [modalDespesaOpen, setModalDespesaOpen] = useState(false);
  const [receitaEditando, setReceitaEditando] = useState(null);
  const [motoristaEditando, setMotoristaEditando] = useState(null);
  const [veiculoEditando, setVeiculoEditando] = useState(null);
  const [custosVariaveis, setCustosVariaveis] = useState(null);
  const [depreciacao, setDepreciacao] = useState(null);
  const [remuneracao, setRemuneracao] = useState(null);
  const [licenciamento, setLicenciamento] = useState(0);
  const [ipva, setIpva] = useState(0);
  const [seguro, setSeguro] = useState(0);
  const [outrosCustos, setOutrosCustos] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const parseFloatPtBr = (val) =>
        parseFloat(String(val).replace(/\./g, "").replace(",", ".")) || 0;

      const parsed = json.map((row, i) => {
        const bruto = parseFloatPtBr(row["Valor bruto"]);
        const peso = parseFloatPtBr(row["Peso"]);
        const rota = `${row["Origem"]} → ${row["Destino"]}`;
        const icms = parseFloatPtBr(row["Vlr icms"]);
        const pis = parseFloatPtBr(row["Vlr pis"]);
        const cofins = parseFloatPtBr(row["Vlr cofins"]);
        const liquido = parseFloatPtBr(row["Vlr liquido"]);

        let emissaoDate;
        const raw = row["Data emissao"];
        if (raw instanceof Date) emissaoDate = raw;
        else if (typeof raw === "number") {
          const parsed = XLSX.SSF.parse_date_code(raw);
          if (parsed) emissaoDate = new Date(parsed.y, parsed.m - 1, parsed.d);
        } else if (
          typeof raw === "string" &&
          /^\d{2}\/\d{2}\/\d{4}$/.test(raw.trim())
        ) {
          emissaoDate = parse(raw.trim(), "dd/MM/yyyy", new Date());
        }
        if (!isValid(emissaoDate)) emissaoDate = null;

        const mesAno = emissaoDate
          ? `${String(emissaoDate.getMonth() + 1).padStart(
              2,
              "0"
            )}/${emissaoDate.getFullYear()}`
          : "";
        const semanaAno = emissaoDate ? `Semana ${getWeek(emissaoDate)}` : "";

        return {
          ...row,
          receita: bruto,
          peso,
          icms,
          pis,
          cofins,
          liquido,
          rota,
          mesAno,
          semanaAno,
          emissaoDate,
        };
      });

      setData(parsed);
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  let receitaTotal = 0,
    viagensMensais = 0,
    icmsTotal = 0,
    pisTotal = 0,
    cofinsTotal = 0,
    liquidoTotal = 0;

  viagensMensais = 0;

  if (modoSimulacao === "validar") {
    const viagensUnicas = new Set();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const viagemId = row["Viagem"] || row["Cte"] || `V-${i}`;

      receitaTotal += row.receita;
      icmsTotal += row.icms;
      pisTotal += row.pis;
      cofinsTotal += row.cofins;
      liquidoTotal += row.liquido;

      viagensUnicas.add(viagemId);
    }

    viagensMensais = viagensUnicas.size;
  } else {
    for (let i = 0; i < receitas.length; i++) {
      receitaTotal += receitas[i].receitaTotal || 0;
      viagensMensais += (receitas[i].quantidadeSemanal || 0) * 4;
    }
  }

  const custoTotal = (() => {
    let soma = 0;

    // Veículos
    for (let v of veiculos) {
      soma += (v.custoMensal || 0) * v.quantidade;
      soma += (v.kmMensal || 0) * (v.custoKm || 0) * v.quantidade;
    }

    // Motoristas
    for (let m of motoristas) {
      soma += (m.custoMensal || 0) * m.quantidade;
    }

    // Custos variáveis
    if (custosVariaveis) {
      const {
        combustivelValor,
        combustivelConsumo,
        oleoKm,
        oleoValor,
        limpezaKm,
        limpezaValor,
        pneusKm,
        pneusValor,
      } = custosVariaveis;
      const kmTotal = veiculos.reduce(
        (acc, v) => acc + (v.kmMensal || 0) * v.quantidade,
        0
      );

      if (kmTotal > 0) {
        if (combustivelValor && combustivelConsumo)
          soma += (kmTotal / combustivelConsumo) * combustivelValor;
        if (oleoKm && oleoValor) soma += (kmTotal / oleoKm) * oleoValor;
        if (limpezaKm && limpezaValor)
          soma += (kmTotal / limpezaKm) * limpezaValor;
        if (pneusKm && pneusValor) soma += (kmTotal / pneusKm) * pneusValor;
      }
    }

    // Depreciação
    if (depreciacao && depreciacao.valorVenda && depreciacao.anosUso) {
      soma += depreciacao.valorVenda / (depreciacao.anosUso * 12);
    }

    // Remuneração de capital (1% do valor total dos veículos por mês)
    if (remuneracao && remuneracao.taxa) {
      const valorTotal = veiculos.reduce(
        (acc, v) => acc + (v.valor || 0) * v.quantidade,
        0
      );
      soma += (remuneracao.taxa / 100) * valorTotal;
    }

    // IPVA (anual), Seguro (mensal), Licenciamento (anual)
    soma += veiculos.reduce((acc, v) => acc + ((v.valor || 0) * (ipva / 100)) / 12 * v.quantidade, 0);

    soma += seguro;
    soma += licenciamento / 12;

    // Outros custos
    if (Array.isArray(outrosCustos)) {
      for (let item of outrosCustos) {
        if (item.valor && item.periodicidade) {
          let divisor =
            {
              mensal: 1,
              trimestral: 3,
              semestral: 6,
              anual: 12,
            }[item.periodicidade.toLowerCase()] || 1;
          soma += item.valor / divisor;
        }
      }
    }

    return soma;
  })();
  const kmTotal = veiculos.reduce(
    (acc, v) => acc + (v.kmMensal || 0) * v.quantidade,
    0
  );
  
  const custoMensalTotal = veiculos.reduce(
    (acc, v) => acc + (v.custoMensal || 0) * v.quantidade,
    0
  ) + motoristas.reduce(
    (acc, m) => acc + (m.custoMensal || 0) * m.quantidade,
    0
  );
  
  const custoKmTotal = kmTotal > 0 ? custoMensalTotal / kmTotal : 0;
  

  const lucroBruto = receitaTotal - custoTotal;
  const margem = receitaTotal > 0 ? (lucroBruto / receitaTotal) * 100 : 0;
  const sugestao =
    margem < 5
      ? "💡 Aumentar receita ou reduzir custos para atingir 5% de lucro líquido."
      : "✅ Operação acima da meta de lucratividade.";

  return (
    <div className="ContainerPagina2">
      <div className="boxGeneral">
        <Container>
          <h2 className="mt-4 mb-4" style={{ color: "#fff" }}>
            Simulador de Operações - Cotações
          </h2>

          <Row className="mb-3">
            <Col md="4">
              <Label style={{ color: "#fff" }}>Escolha o tipo de cenário</Label>
              <Input
                type="select"
                value={modoSimulacao}
                onChange={(e) => setModoSimulacao(e.target.value)}
              >
                <option value="futuro">Simular cenário futuro</option>
                <option value="validar">Validar cenário atual</option>
              </Input>
            </Col>
          </Row>

          {modoSimulacao === "validar" && (
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="mb-4"
            />
          )}

          {!loading && (
            <>
              <Row className="mb-3">
                {modoSimulacao === "futuro" && (
                  <Col md="6">
                    <Button
                      color="success"
                      onClick={() => setModalReceitaOpen(true)}
                    >
                      + Receita
                    </Button>
                  </Col>
                )}
              </Row>

              <Row className="mt-3">
                {/* Card 1 - Receita */}
                <Col md="3">
                  <Card
                    className="customcard"
                    style={{ background: "rgba(0, 255, 127, 0.35)" }}
                  >
                    <CardBody>
                      <h5>
                        <FaMoneyBillWave /> Receita Total
                      </h5>
                      <h4>
                        R${" "}
                        <CountUp
                          end={receitaTotal}
                          duration={1.5}
                          separator="."
                          decimal=","
                          decimals={2}
                        />
                      </h4>
                      <hr />
                      <p>
                        ICMS: R${" "}
                        <CountUp
                          end={icmsTotal}
                          duration={1}
                          separator="."
                          decimal=","
                          decimals={2}
                        />
                      </p>
                      <p>
                        PIS: R${" "}
                        <CountUp
                          end={pisTotal}
                          duration={1}
                          separator="."
                          decimal=","
                          decimals={2}
                        />
                      </p>
                      <p>
                        COFINS: R${" "}
                        <CountUp
                          end={cofinsTotal}
                          duration={1}
                          separator="."
                          decimal=","
                          decimals={2}
                        />
                      </p>
                      <p>
                        Líquido: R${" "}
                        <CountUp
                          end={liquidoTotal}
                          duration={1}
                          separator="."
                          decimal=","
                          decimals={2}
                        />
                      </p>
                    </CardBody>
                  </Card>
                </Col>

                {/* Card 2 - Margem */}
                <Col md="3">
                  <Card
                    className="customcard"
                    style={{ background: "rgba(0, 0, 0, 0.35)" }}
                  >
                    <CardBody>
                      <h5>
                        <BsGraphUp /> Margem de Lucro
                      </h5>
                      <h2 style={{ fontWeight: "bold" }}>
                        <CountUp
                          end={margem}
                          duration={1.5}
                          decimals={1}
                          suffix="%"
                        />
                      </h2>
                      <p>
                        Lucro Bruto:{" "}
                        <strong>
                          R${" "}
                          <CountUp
                            end={lucroBruto}
                            duration={1.5}
                            separator="."
                            decimal=","
                            decimals={2}
                          />
                        </strong>
                      </p>
                      <p style={{ color: margem < 5 ? "#ff0000" : "#007f00" }}>
                        {sugestao}
                      </p>
                      <p>
                        Viagens distintas: <strong>{viagensMensais}</strong>
                      </p>
                    </CardBody>
                  </Card>
                </Col>

                {/* Card 3 - Custos */}
                <Col md="6">
                  <Card
                    className="customcard"
                    style={{ background: "rgba(255, 69, 0, 0.35)" }}
                  >
                    <CardBody>
                      <h5>
                        <FaTruckMoving /> Custo Total
                      </h5>
                      <h4>
                        R${" "}
                        <CountUp
                          end={custoTotal}
                          duration={1.5}
                          separator="."
                          decimal=","
                          decimals={2}
                        />
                      </h4>
                      <Button
                        color="warning"
                        size="sm"
                        className="mb-3 mt-2"
                        onClick={() => setModalDespesaOpen(true)}
                      >
                        ✏️ Editar Despesas
                      </Button>

                      <h6>
                        <FaTruckMoving /> Veículos
                      </h6>
                      {veiculos.length === 0 && (
                        <p style={{ fontStyle: "italic" }}>
                          Nenhum veículo adicionado.
                        </p>
                      )}
                      {veiculos.map((v, idx) => {
                        const custoMensalFormatado = v.custoMensal
                          ? `R$ ${v.custoMensal.toLocaleString("pt-BR")}`
                          : "R$ 0,00";

                        const custoKmFormatado = v.custoKm
                          ? `R$ ${v.custoKm.toFixed(2)}`
                          : "R$ 0,00";

                        return (
                          <p key={idx}>
                            {v.tipo} | {v.quantidade} unid. |{" "}
                            {custoMensalFormatado} + {v.kmMensal || 0}km ×{" "}
                            {custoKmFormatado}

                          </p>
                        );
                      })}
                      <hr />



                      <h6>
                        <FaUserTie /> Motoristas
                      </h6>
                      {motoristas.length === 0 && (
                        <p style={{ fontStyle: "italic" }}>
                          Nenhum motorista adicionado.
                        </p>
                      )}
                      {motoristas.map((m, idx) => (
                        <p key={idx}>
                          R${" "}
                          {typeof m.custoMensal === "number"
                            ? m.custoMensal.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })
                            : "0,00"}
                          
                        </p>
                      ))}
                      <Row>
  <Col xs="6">
    <p><strong>Km total/mês:</strong></p>
    <p><CountUp end={kmTotal} duration={1} separator="." /></p>
    <p><strong>Custo/km:</strong></p>
    <p>R$ <CountUp end={custoKmTotal} duration={1} separator="." decimal="," decimals={2} /></p>
  </Col>
  <Col xs="6">
    <p><strong>Custo mensal:</strong></p>
    <p>R$ <CountUp end={custoMensalTotal} duration={1} separator="." decimal="," decimals={2} /></p>
  </Col>
</Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <ChartRoi receitaTotal={receitaTotal} custoTotal={custoTotal} />
              <ChartPeso data={data} />
              <ChartRota data={data} />
              <ChartViagem data={data} />

              <ModalReceita
                isOpen={modalReceitaOpen}
                setIsOpen={setModalReceitaOpen}
                receitas={receitas}
                setReceitas={setReceitas}
                receitaEditando={receitaEditando}
                setReceitaEditando={setReceitaEditando}
              />
              <ModalDespesa
                isOpen={modalDespesaOpen}
                setIsOpen={setModalDespesaOpen}
                motoristas={motoristas}
                setMotoristas={setMotoristas}
                veiculos={veiculos}
                setVeiculos={setVeiculos}
                motoristaEditando={motoristaEditando}
                setMotoristaEditando={setMotoristaEditando}
                veiculoEditando={veiculoEditando}
                setVeiculoEditando={setVeiculoEditando}
                // ✅ Adicione esta função aqui!
                onSalvar={(dados) => {
                  setVeiculos(dados.veiculos || []);
                  setMotoristas(dados.motoristas || []);
                  setCustosVariaveis(dados.custosVariaveis || null);
                  setDepreciacao(dados.depreciacao || null);
                  setRemuneracao(dados.remuneracao || null);
                  setLicenciamento(dados.licenciamento || 0);
                  setIpva(dados.ipva || 0);
                  setSeguro(dados.seguro || 0);
                  setOutrosCustos(dados.outrosCustos || []);
                }}
              />
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Cotacao;
