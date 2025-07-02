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
  Button
} from "reactstrap";
import { parse, getWeek, isValid } from 'date-fns';
import ChartViagem from "./ChartViagem";
import ChartRota from "./ChartRota";
import ChartPeso from "./ChartPeso";
import ChartRoi from "./ChartRoi";
import ModalReceita from "./ModalReceita";
import ModalDespesa from "./ModalDespesa";
import './style.css';
import { FaMoneyBillWave, FaPercentage, FaTruckMoving, FaUserTie } from "react-icons/fa";
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
        } else if (typeof raw === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(raw.trim())) {
          emissaoDate = parse(raw.trim(), "dd/MM/yyyy", new Date());
        }
        if (!isValid(emissaoDate)) emissaoDate = null;

        const mesAno = emissaoDate
          ? `${String(emissaoDate.getMonth() + 1).padStart(2, "0")}/${emissaoDate.getFullYear()}`
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

  let receitaTotal = 0, viagensMensais = 0, icmsTotal = 0, pisTotal = 0, cofinsTotal = 0, liquidoTotal = 0;

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
    for (let i = 0; i < veiculos.length; i++) {
      const v = veiculos[i];
      soma += v.custoMensal * v.quantidade;
      soma += v.kmMensal * v.custoKm * v.quantidade;
    }
    for (let i = 0; i < motoristas.length; i++) {
      const m = motoristas[i];
      soma += m.custoMensal * m.quantidade;
    }
    return soma;
  })();

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
                    <Button color="success" onClick={() => setModalReceitaOpen(true)}>
                      + Receita
                    </Button>
                  </Col>
                )}

              </Row>

              <Row className="mt-3">
  {/* Card 1 - Receita */}
  <Col md="4">
    <Card className="customcard" style={{ background: 'rgba(0, 255, 127, 0.35)' }}>
      <CardBody>
        <h5><FaMoneyBillWave /> Receita Total</h5>
        <h4>
          R$ <CountUp end={receitaTotal} duration={1.5} separator="." decimal="," decimals={2} />
        </h4>
        <hr />
        <p>ICMS: R$ <CountUp end={icmsTotal} duration={1} separator="." decimal="," decimals={2} /></p>
        <p>PIS: R$ <CountUp end={pisTotal} duration={1} separator="." decimal="," decimals={2} /></p>
        <p>COFINS: R$ <CountUp end={cofinsTotal} duration={1} separator="." decimal="," decimals={2} /></p>
        <p>Líquido: R$ <CountUp end={liquidoTotal} duration={1} separator="." decimal="," decimals={2} /></p>
      </CardBody>
    </Card>
  </Col>

  {/* Card 2 - Margem */}
  <Col md="4">
    <Card className="customcard" style={{ background: 'rgba(0, 0, 0, 0.35)' }}>
      <CardBody>
        <h5><BsGraphUp /> Margem de Lucro</h5>
        <h2 style={{ fontWeight: "bold" }}>
          <CountUp end={margem} duration={1.5} decimals={1} suffix="%" />
        </h2>
        <p>
          Lucro Bruto: <strong>R$ <CountUp end={lucroBruto} duration={1.5} separator="." decimal="," decimals={2} /></strong>
        </p>
        <p style={{ color: margem < 5 ? "#ff0000" : "#007f00" }}>{sugestao}</p>
        <p>Viagens distintas: <strong>{viagensMensais}</strong></p>
      </CardBody>
    </Card>
  </Col>

  {/* Card 3 - Custos */}
  <Col md="4">
    <Card className="customcard" style={{ background: 'rgba(255, 69, 0, 0.35)' }}>
      <CardBody>
        <h5><FaTruckMoving /> Custo Total</h5>
        <h4>
          R$ <CountUp end={custoTotal} duration={1.5} separator="." decimal="," decimals={2} />
        </h4>
        <Button color="danger" size="sm" className="mb-3 mt-2" onClick={() => setModalDespesaOpen(true)}>+ Despesa</Button>

        <h6><FaTruckMoving /> Veículos</h6>
        {veiculos.length === 0 && <p style={{ fontStyle: 'italic' }}>Nenhum veículo adicionado.</p>}
        {veiculos.map((v, idx) => (
          <p key={idx}>
            {v.tipo} | {v.quantidade} unid. | R$ {v.custoMensal.toLocaleString("pt-BR")} + {v.kmMensal}km × R$ {v.custoKm.toFixed(2)}
            <Button
              size="sm"
              color="warning"
              className="ms-2"
              onClick={() => {
                setVeiculoEditando({ ...v, index: idx });
                setModalDespesaOpen(true);
              }}
            >
              Editar
            </Button>
          </p>
        ))}

        <h6><FaUserTie /> Motoristas</h6>
        {motoristas.length === 0 && <p style={{ fontStyle: 'italic' }}>Nenhum motorista adicionado.</p>}
        {motoristas.map((m, idx) => (
          <p key={idx}>
            {m.quantidade} unid. | R$ {m.custoMensal.toLocaleString("pt-BR")} mensal
            <Button
              size="sm"
              color="warning"
              className="ms-2"
              onClick={() => {
                setMotoristaEditando({ ...m, index: idx });
                setModalDespesaOpen(true);
              }}
            >
              Editar
            </Button>
          </p>
        ))}
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
              />
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Cotacao;
