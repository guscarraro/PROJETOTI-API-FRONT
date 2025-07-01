// Cotacao.jsx (refatorado com simulação futura vs. validação atual)
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
  Spinner
} from "reactstrap";
import { parse, getWeek, isValid } from 'date-fns';
import ChartViagem from "./ChartViagem";
import ChartRota from "./ChartRota";
import ChartPeso from "./ChartPeso";
import ChartRoi from "./ChartRoi";
import ModalReceita from "./ModalReceita";
import ModalDespesa from "./ModalDespesa";
import './style.css';

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

      const parsed = json.map((row) => {
        const bruto = parseFloat(String(row["Valor bruto"]).replace(/\./g, "").replace(",", ".")) || 0;
        const peso = parseFloat(row["Peso2"]) || 0;
        const rota = `${row["Origem"]} → ${row["Destino"]}`;

        let emissaoDate;
        const raw = row["Emissão"];
        if (raw instanceof Date) emissaoDate = raw;
        else if (typeof raw === 'number') {
          const parsed = XLSX.SSF.parse_date_code(raw);
          if (parsed) emissaoDate = new Date(parsed.y, parsed.m - 1, parsed.d);
        } else if (typeof raw === 'string') {
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw.trim())) {
            emissaoDate = parse(raw.trim(), 'dd/MM/yyyy', new Date());
          }
        }
        if (!isValid(emissaoDate)) emissaoDate = null;

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

let receitaTotal = 0;
let viagensMensais = 0;

if (modoSimulacao === 'validar') {
  const mapaViagens = {};

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Agrupador de viagem – pode ajustar para o campo correto da sua planilha
    const viagemId = row["Viagem"] || row["Número Viagem"] || row["Número CTE"] || `VIAGEM-${i}`;

    const valor = parseFloat(row["Valor bruto"]) || row.receita || 0;

    if (!mapaViagens[viagemId]) {
      mapaViagens[viagemId] = {
        receita: 0
      };
      viagensMensais += 1; // Conta 1 viagem por agrupamento
    }

    mapaViagens[viagemId].receita += valor;
  }

  for (const key in mapaViagens) {
    receitaTotal += mapaViagens[key].receita;
  }
} else {
  for (let i = 0; i < receitas.length; i++) {
    receitaTotal += receitas[i].receitaTotal || 0;
    viagensMensais += (receitas[i].quantidadeSemanal || 0) * 4;
  }
}


  const custoTotal = (() => {
    const custoVeiculos = veiculos.reduce((soma, v) => soma + (v.custoMensal * v.quantidade), 0);
    const custoKm = veiculos.reduce((soma, v) => soma + (v.kmMensal * v.custoKm * v.quantidade), 0);
    const custoMotoristas = motoristas.reduce((soma, m) => soma + (m.custoMensal * m.quantidade), 0);
    return custoVeiculos + custoKm + custoMotoristas;
  })();

  const lucroBruto = receitaTotal - custoTotal;
  const margem = receitaTotal > 0 ? (lucroBruto / receitaTotal) * 100 : 0;
  const sugestao = margem < 5
    ? "💡 Aumentar receita ou reduzir custos para atingir 5% de lucro líquido."
    : "✅ Operação acima da meta de lucratividade.";

  return (
    <div className="ContainerPagina2">
      <div className="boxGeneral">
        <Container>
          <h2 className="mt-4 mb-4" style={{ color: '#fff' }}>Simulador de Operações - Cotações</h2>

          <Row className="mb-3">
            <Col md="4">
              <Label style={{ color: '#fff' }}>Escolha o tipo de cenário</Label>
              <Input type="select" value={modoSimulacao} onChange={(e) => setModoSimulacao(e.target.value)}>
                <option value="futuro">Simular cenário futuro</option>
                <option value="validar">Validar cenário atual</option>
              </Input>
            </Col>
          </Row>

          {modoSimulacao === 'validar' && (
            <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" />
          )}

          {!loading && (
            <>
              <Row className="mb-3">
                {modoSimulacao === "futuro" && (
                  <Col md="6">
                    <Button color="success" onClick={() => setModalReceitaOpen(true)}>+ Receita</Button>
                  </Col>
                )}
                <Col md={modoSimulacao === "futuro" ? "6" : "12"}>
                  <Button color="danger" onClick={() => setModalDespesaOpen(true)}>+ Despesa</Button>
                </Col>
              </Row>


              <Card className="custom-card">
                <CardBody>
                  <h5 style={{ color: '#fff' }}>📊 Resumo da Operação</h5>
                  <p style={{ color: '#fff' }}>Receita Total: <strong>R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                  <p style={{ color: '#fff' }}>Viagens no mês: <strong>{viagensMensais}</strong></p>
                  <p style={{ color: '#fff' }}>Custo Total: <strong>R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                  <p style={{ color: '#fff' }}>Lucro Bruto: <strong>R$ {lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                  <p style={{ color: '#fff' }}>Margem: <strong>{margem.toFixed(1)}%</strong></p>
                  <p style={{ color: margem < 5 ? "#ff8080" : "#80ff80" }}>{sugestao}</p>

                  <hr />

                  <h6 style={{ color: '#fff' }}>📦 Receitas Registradas:</h6>
                  {receitas.map((r, idx) => (
                    <div key={idx} style={{ color: '#fff' }}>
                      <strong>{r.rota}</strong> | UF: {r.estadoOrigem} → {r.estadoDestino}
                      <Button size="sm" color="warning" className="ms-2"
                        onClick={() => {
                          setReceitaEditando({ ...r, index: idx });
                          setModalReceitaOpen(true);
                        }}>
                        Editar
                      </Button>
                      <br />
                      Viagens/mês: {r.viagensMensais} | Frete: R$ {r.receitaFrete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <br />
                      Ad Valorem: R$ {r.valorAdValorem?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} |
                      GRIS: R$ {r.valorGris?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} |
                      ICMS: R$ {r.valorICMS?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <br />
                      <strong>Total:</strong> R$ {r.receitaTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <hr />
                    </div>
                  ))}



                  <h6 style={{ color: '#fff' }}>🚛 Veículos:</h6>
                  {veiculos.map((v, idx) => (
                    <p key={idx} style={{ color: '#fff' }}>
                      {v.tipo} | {v.quantidade} unid. | Custo R$ {v.custoMensal.toLocaleString('pt-BR')} + {v.kmMensal} km x R$ {v.custoKm.toFixed(2)}
                      <Button size="sm" color="warning" className="ms-2"
                        onClick={() => {
                          setVeiculoEditando({ ...v, index: idx });
                          setModalDespesaOpen(true);
                        }}>
                        Editar
                      </Button>
                    </p>
                  ))}

                  <h6 style={{ color: '#fff' }}>🧑‍✈️ Motoristas:</h6>
                  {motoristas.map((m, idx) => (
                    <p key={idx} style={{ color: '#fff' }}>
                      {m.quantidade} unid. | R$ {m.custoMensal.toLocaleString('pt-BR')} mensal
                      <Button size="sm" color="warning" className="ms-2"
                        onClick={() => {
                          setMotoristaEditando({ ...m, index: idx });
                          setModalDespesaOpen(true);
                        }}>
                        Editar
                      </Button>
                    </p>
                  ))}
                </CardBody>
              </Card>

              <ChartRoi receitaTotal={receitaTotal} custoTotal={custoTotal} />
              <ChartPeso data={data} />
              <ChartRota data={data} />
              <ChartViagem data={data} />

              <ModalReceita
                isOpen={modalReceitaOpen}
                setIsOpen={setModalReceitaOpen}
                setReceitas={setReceitas}
                receitas={receitas}
                receitaEditando={receitaEditando}
                setReceitaEditando={setReceitaEditando}
              />

              <ModalDespesa
                isOpen={modalDespesaOpen}
                setIsOpen={setModalDespesaOpen}
                setVeiculos={setVeiculos}
                setMotoristas={setMotoristas}
                veiculos={veiculos}
                motoristas={motoristas}
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
