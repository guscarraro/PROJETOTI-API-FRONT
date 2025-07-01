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
  Spinner,
} from "reactstrap";
import { parse, getWeek, isValid } from 'date-fns';
import ChartViagem from "./ChartViagem";
import ChartRota from "./ChartRota";
import ChartPeso from "./ChartPeso";
import ChartRoi from "./ChartRoi";
import "./style.css";

const Cotacao = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [tipoVeiculo, setTipoVeiculo] = useState("carreta");
  const [custoKm, setCustoKm] = useState(5);
  const [custoMensalVeiculo, setCustoMensalVeiculo] = useState(10000);
  const [diariaMotorista, setDiariaMotorista] = useState(350);
  const [comissao, setComissao] = useState(5);
  const [frota, setFrota] = useState("terceira");
  const [qtdVeiculos, setQtdVeiculos] = useState(5);
  const [qtdMotoristas, setQtdMotoristas] = useState(5);
  const [custoMensalMotorista, setCustoMensalMotorista] = useState(5500);
  const [custoFrotaTerceira, setCustoFrotaTerceira] = useState(1500);
  const [viagensMensais, setViagensMensais] = useState(100);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      const parsed = json.map((row) => {
        const bruto = parseFloat(String(row["Valor bruto"]).replace(/\./g, "").replace(",", ".")) || 0;
        const peso = parseFloat(row["Peso2"]) || 0;
        const rota = `${row["Origem"]} → ${row["Destino"]}`;

        let rawEmissao = row["Emissão"];
        let emissaoDate;

        if (rawEmissao instanceof Date) {
          emissaoDate = rawEmissao;
        } else if (typeof rawEmissao === 'number') {
          emissaoDate = XLSX.SSF.parse_date_code(rawEmissao);
          if (emissaoDate) {
            emissaoDate = new Date(
              emissaoDate.y,
              emissaoDate.m - 1,
              emissaoDate.d
            );
          } else {
            emissaoDate = null;
          }
        } else if (typeof rawEmissao === 'string') {
          const dataLimpa = rawEmissao.trim();
          const regexDataBR = /^\d{2}\/\d{2}\/\d{4}$/;

          if (regexDataBR.test(dataLimpa)) {
            emissaoDate = parse(dataLimpa, 'dd/MM/yyyy', new Date());
          } else {
            emissaoDate = null;
          }
        }

        if (!isValid(emissaoDate)) {
          emissaoDate = null;
        }

        const dataEmissaoFormatada = emissaoDate?.toLocaleDateString('pt-BR') || "";
        const mesAno = emissaoDate ? `${String(emissaoDate.getMonth() + 1).padStart(2, '0')}/${emissaoDate.getFullYear()}` : "";
        const semanaAno = emissaoDate ? `Semana ${getWeek(emissaoDate)}` : "";

        return {
          ...row,
          receita: bruto,
          peso,
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

  const receitaTotal = data.reduce((acc, r) => acc + r.receita, 0);

  const custoTotal = (() => {
    if (frota === 'terceira') {
      return viagensMensais * custoFrotaTerceira;
    } else {
      const fixoVeiculo = qtdVeiculos * custoMensalVeiculo;
      const fixoMotorista = qtdMotoristas * custoMensalMotorista;
      const variavelKm = viagensMensais * 450 * custoKm;
      const diariaTotal = viagensMensais * diariaMotorista;
      return fixoVeiculo + fixoMotorista + variavelKm + diariaTotal;
    }
  })();

  const lucroBruto = receitaTotal - custoTotal;
  const margem = receitaTotal > 0 ? (lucroBruto / receitaTotal) * 100 : 0;

  const sugestao = margem < 5
    ? "💡 Aumentar receita por viagem ou reduzir custos fixos para atingir 5% de lucro líquido."
    : "✅ Operação acima da meta de lucratividade.";

  return (
    <div className="ContainerPagina2">
      <div className="boxGeneral">
        <Container>
          <h2 className="mt-4 mb-4">Simulador de Operações - Cotações</h2>

          <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" />

          {loading ? (
            <Spinner color="light">Carregando...</Spinner>
          ) : data.length > 0 && (
            <>
              <Row className="mb-4">
                <Col md="2">
                  <Label>Tipo Veículo</Label>
                  <Input type="select" value={tipoVeiculo} onChange={(e) => setTipoVeiculo(e.target.value)}>
                    <option>carreta</option>
                    <option>truck</option>
                    <option>3/4</option>
                    <option>fiorino</option>
                  </Input>
                </Col>
                <Col md="2">
                  <Label>Frota</Label>
                  <Input type="select" value={frota} onChange={(e) => setFrota(e.target.value)}>
                    <option value="propria">Própria</option>
                    <option value="terceira">Terceira</option>
                  </Input>
                </Col>
                <Col md="2">
                  <Label>Qtd Viagens no Mês</Label>
                  <Input type="number" value={viagensMensais} onChange={(e) => setViagensMensais(parseInt(e.target.value))} />
                </Col>
                {frota === 'terceira' ? (
                  <Col md="2">
                    <Label>Custo por Viagem (R$)</Label>
                    <Input type="number" value={custoFrotaTerceira} onChange={(e) => setCustoFrotaTerceira(parseFloat(e.target.value))} />
                  </Col>
                ) : (
                  <>
                    <Col md="2">
                      <Label>Custo por km (R$)</Label>
                      <Input type="number" value={custoKm} onChange={(e) => setCustoKm(parseFloat(e.target.value))} />
                    </Col>
                    <Col md="2">
                      <Label>Diária Motorista</Label>
                      <Input type="number" value={diariaMotorista} onChange={(e) => setDiariaMotorista(parseFloat(e.target.value))} />
                    </Col>
                    <Col md="2">
                      <Label>Custo Mensal Veículo</Label>
                      <Input type="number" value={custoMensalVeiculo} onChange={(e) => setCustoMensalVeiculo(parseFloat(e.target.value))} />
                    </Col>
                    <Col md="2">
                      <Label>Qtd Veículos</Label>
                      <Input type="number" value={qtdVeiculos} onChange={(e) => setQtdVeiculos(parseInt(e.target.value))} />
                    </Col>
                    <Col md="2">
                      <Label>Qtd Motoristas</Label>
                      <Input type="number" value={qtdMotoristas} onChange={(e) => setQtdMotoristas(parseInt(e.target.value))} />
                    </Col>
                    <Col md="2">
                      <Label>Custo Mensal por Motorista (R$)</Label>
                      <Input type="number" value={custoMensalMotorista} onChange={(e) => setCustoMensalMotorista(parseFloat(e.target.value))} />
                    </Col>
                  </>
                )}
                {/* <Col md="2">
                  <Label>Comissão %</Label>
                  <Input type="number" value={comissao} onChange={(e) => setComissao(parseFloat(e.target.value))} />
                </Col> */}
              </Row>

              <Card className="custom-card">
                <CardBody>
                  <h5>📊 Resumo</h5>
                  <p><strong>Critérios de Cálculo:</strong></p>
                  <ul>
                    {frota === 'terceira' ? (
                      <li>Frota terceirizada: custo fixo por viagem x número de viagens mensais</li>
                    ) : (
                      <>
                        <li>Custo por km: {custoKm} (média 450 km por viagem)</li>
                        <li>Diária por motorista: R$ {diariaMotorista}</li>
                        <li>Custo mensal de veículos: R$ {custoMensalVeiculo} x {qtdVeiculos}</li>
                        <li>Custo mensal de motoristas: R$ {custoMensalMotorista} x {qtdMotoristas}</li>
                      </>
                    )}
                    <li>Qtd Viagens no mês: {viagensMensais}</li>
                    <li>Margem = (Receita - Custo) / Receita * 100</li>
                  </ul>
                  <p>Receita Total: <strong>R$ {receitaTotal.toFixed(2)}</strong></p>
                  <p>Viagens no mês: <strong>{viagensMensais}</strong></p>
                  <p>Custo Total: <strong>R$ {custoTotal.toFixed(2)}</strong></p>
                  <p>Lucro Bruto: <strong>R$ {lucroBruto.toFixed(2)}</strong></p>
                  <p>Margem: <strong>{margem.toFixed(1)}%</strong></p>
                  <p style={{ color: margem < 5 ? "#ff8080" : "#80ff80" }}>{sugestao}</p>
                </CardBody>
              </Card>

              <ChartViagem data={data} />
              <ChartRota data={data} />
              <ChartPeso data={data} />
              <ChartRoi receitaTotal={receitaTotal} custoTotal={custoTotal} />
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Cotacao;
