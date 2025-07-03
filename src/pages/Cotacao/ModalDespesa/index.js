import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Label, Row, Col
} from 'reactstrap';
import CardResumoCustos from './CardResumoCustos'; // ajuste o caminho conforme necessário


const frequencias = {
    mensal: 1,
    trimestral: 3,
    semestral: 6,
    anual: 12
};

const ModalDespesa = ({
    isOpen,
    setIsOpen,
    onSalvar,
    veiculos: veiculosInit = [],
    motoristas: motoristasInit = [],
    custosVariaveis: custosVariaveisInit = {},
    depreciacao: depreciacaoInit = { valorVenda: 0, anosUso: 5 },
    remuneracao: remuneracaoInit = { taxa: 1 },
    licenciamento: licenciamentoInit = 0,
    ipva: ipvaInit = 1.5,
    seguro: seguroInit = 0,
    outrosCustos: outrosCustosInit = []
    
}) => {
    const [veiculos, setVeiculos] = useState(veiculosInit);
    const [motoristas, setMotoristas] = useState(motoristasInit);
    const [custosVariaveis, setCustosVariaveis] = useState(custosVariaveisInit);
    const [depreciacao, setDepreciacao] = useState(depreciacaoInit);
    const [remuneracao, setRemuneracao] = useState(remuneracaoInit);
    const [licenciamento, setLicenciamento] = useState(licenciamentoInit);
    const [ipva, setIpva] = useState(ipvaInit);
    const [seguro, setSeguro] = useState(seguroInit);
    const [outrosCustos, setOutrosCustos] = useState(outrosCustosInit);

    useEffect(() => {
        if (isOpen) {
            setVeiculos(veiculosInit);
            setMotoristas(motoristasInit);
            setCustosVariaveis(custosVariaveisInit);
            setDepreciacao(depreciacaoInit);
            setRemuneracao(remuneracaoInit);
            setLicenciamento(licenciamentoInit);
            setIpva(ipvaInit);
            setSeguro(seguroInit);
            setOutrosCustos(outrosCustosInit);
        }
    }, [isOpen]);
    

    const kmTotal = (() => {
        let soma = 0;
        for (let i = 0; i < veiculos.length; i++) {
            const v = veiculos[i];
            soma += (v.kmMes || 0) * (v.quantidade || 1);
        }
        return soma;
    })();

    const valorVeiculos = (() => {
        let soma = 0;
        for (let i = 0; i < veiculos.length; i++) {
            const v = veiculos[i];
            soma += (v.valor || 0) * (v.quantidade || 1);
        }
        return soma;
    })();

    const calcularCustoOutros = (c) => {
        if (!c || !c.valor || !c.frequencia) return 0;
        const divisor = frequencias[c.frequencia] || 1;
        return c.valor / divisor;
    };

    const adicionarVeiculo = () => {
        setVeiculos([...veiculos, { tipo: '', valor: 0, kmMes: 0, quantidade: 1 }]);
    };

    const adicionarMotorista = () => {
        setMotoristas([...motoristas, { salario: 0, quantidade: 1 }]);
    };

    const adicionarOutroCusto = () => {
        setOutrosCustos([...outrosCustos, { nome: '', valor: 0, porcentagem: false, frequencia: 'mensal' }]);
    };
    const calcularCustoMensal = (veiculo) => {
        // Exemplo básico: amortização + IPVA mensal + manutenção
        const mesesUso = veiculo.anosUso ? veiculo.anosUso * 12 : 60;
        const depre = (veiculo.valor - (veiculo.valorVenda || 0)) / mesesUso;
        const manutencao = (veiculo.valor * 0.05) / 12; // 5% ao ano
        const ipva = (veiculo.valor * 0.015) / 12; // 1.5% ao ano

        return (depre || 0) + manutencao + ipva;
    };

    const calcularCustoKm = (veiculo) => {
        const consumo = custosVariaveis.combustivelConsumo || 7;
        const valorLitro = custosVariaveis.combustivelValor || 6;

        return valorLitro / consumo;
    };

    const custoMensalTotal = (
  ((kmTotal / (custosVariaveis.oleoKm || 1)) * (custosVariaveis.oleoValor || 0)) +
  ((kmTotal / (custosVariaveis.pneusKm || 1)) * (custosVariaveis.pneusValor || 0)) +
  ((kmTotal / (custosVariaveis.limpezaKm || 1)) * (custosVariaveis.limpezaValor || 0)) +
  (kmTotal > 0 && custosVariaveis.combustivelConsumo > 0
    ? (kmTotal / custosVariaveis.combustivelConsumo) * (custosVariaveis.combustivelValor || 0)
    : 0) +
  ((valorVeiculos - depreciacao.valorVenda) / ((depreciacao.anosUso || 5) * 12)) +
  ((valorVeiculos * (custosVariaveis.manutencaoPct || 5) / 100) / 12) +
  ((valorVeiculos * (remuneracao.taxa || 1)) / 100) +
  (licenciamento / 12) +
  ((valorVeiculos * ipva / 100) / 12) +
  seguro +
  outrosCustos.map(calcularCustoOutros).reduce((a, b) => a + b, 0)
);

const custoTotalKm = kmTotal > 0 ? custoMensalTotal / kmTotal : 0;


   const salvar = () => {
    const motoristasComCusto = motoristas.map(m => ({
        ...m,
        custoMensal: m.salario // ou aplique outros encargos aqui se necessário
    }));

    const veiculosComCusto = veiculos.map(v => {
        const custoMensal = calcularCustoMensal(v);
        const custoKm = calcularCustoKm(v);
        return {
            ...v,
            custoMensal,
            custoKm,
            kmMensal: v.kmMes // Garantir que o kmMensal está sendo enviado
        };
    });

    onSalvar({
        veiculos: veiculosComCusto,
        motoristas: motoristasComCusto,
        custosVariaveis,
        depreciacao,
        remuneracao,
        licenciamento,
        ipva,
        seguro,
        outrosCustos,
        custoMensalTotal, // Adiciona o total mensal calculado
        custoTotalKm      // Adiciona o custo por km calculado
    });
    setIsOpen(false);
};

    return (
        <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} size="xl">
            <ModalHeader toggle={() => setIsOpen(!isOpen)}>Cadastrar Despesas Operacionais</ModalHeader>
            <ModalBody style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>

                <h6>1. Veículo</h6>
                {veiculos.map((v, idx) => (
                    <Row key={idx} className="mb-2 border-bottom pb-2">
                        <Col md="3">
                            <Label>Tipo</Label>
                            <Input style={{marginBottom:5}} type="select" value={v.tipo} onChange={e => {
                                const novos = [...veiculos];
                                novos[idx].tipo = e.target.value;
                                setVeiculos(novos);
                            }}>
                                <option value="">Selecione</option>
                                <option value="Fiorino">Fiorino</option>
                                <option value="3/4">3/4</option>
                                <option value="Toco">Toco</option>
                                <option value="Truck">Truck</option>
                                <option value="Carreta">Carreta</option>
                            </Input>
                        </Col>
                        <Col md="2">
                            <Label>Valor do Veículo (R$)</Label>
                            <Input style={{marginBottom:5}} type="number" value={v.valor} onChange={e => {
                                const novos = [...veiculos];
                                novos[idx].valor = parseFloat(e.target.value);
                                setVeiculos(novos);
                            }} />
                        </Col>
                        <Col md="2">
                            <Label>KM/mês</Label>
                            <Input style={{marginBottom:5}} type="number" value={v.kmMes} onChange={e => {
                                const novos = [...veiculos];
                                novos[idx].kmMes = parseFloat(e.target.value);
                                setVeiculos(novos);
                            }} />
                        </Col>
                        <Col md="2">
                            <Label>Qtd</Label>
                            <Input style={{marginBottom:5}} type="number" value={v.quantidade} onChange={e => {
                                const novos = [...veiculos];
                                novos[idx].quantidade = parseInt(e.target.value);
                                setVeiculos(novos);
                            }} />
                        </Col>
                    </Row>
                ))}
                <Button color="primary" onClick={adicionarVeiculo}>+ Veículo</Button>

                <hr />
                <h6>2. Combustível</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>Valor do litro (R$)</Label>
                                <Input
style={{marginBottom:5}}                                     type="number"
                                    value={custosVariaveis.combustivelValor || ''}
                                    onChange={e => setCustosVariaveis({
                                        ...custosVariaveis,
                                        combustivelValor: parseFloat(e.target.value) || 0
                                    })}
                                />
                            </Col>
                            <Col md="6">
                                <Label>Consumo (km/l)</Label>
                                <Input
style={{marginBottom:5}}                                     type="number"
                                    value={custosVariaveis.combustivelConsumo || ''}
                                    onChange={e => setCustosVariaveis({
                                        ...custosVariaveis,
                                        combustivelConsumo: parseFloat(e.target.value) || 0
                                    })}
                                />
                            </Col>
                        </Row>
                    </Col>

                    <Col md="7">
                        <CardResumoCustos
                            titulo="Combustível"
                            custoKm={
                                custosVariaveis.combustivelValor && custosVariaveis.combustivelConsumo
                                    ? custosVariaveis.combustivelValor / custosVariaveis.combustivelConsumo
                                    : 0
                            }
                            custoMensal={
                                (() => {
                                    const kmTotal = veiculos.reduce((acc, v) => acc + (v.kmMes || 0) * v.quantidade, 0);
                                    const consumo = custosVariaveis.combustivelConsumo || 0;
                                    const valorLitro = custosVariaveis.combustivelValor || 0;
                                    if (kmTotal > 0 && consumo > 0) {
                                        return (kmTotal / consumo) * valorLitro;
                                    }
                                    return 0;
                                })()
                            }
                        />
                    </Col>
 <hr />
                </Row>


                <h6>3. Óleo do Motor</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>Troca a cada (km)</Label>
                                <Input
style={{marginBottom:5}}                                     type="number"
                                    value={custosVariaveis.oleoKm || ''}
                                    onChange={e => setCustosVariaveis({
                                        ...custosVariaveis,
                                        oleoKm: parseFloat(e.target.value) || 0
                                    })}
                                />
                            </Col>
                            <Col md="6">
                                <Label>Valor da troca (R$)</Label>
                                <Input
style={{marginBottom:5}}                                     type="number"
                                    value={custosVariaveis.oleoValor || ''}
                                    onChange={e => setCustosVariaveis({
                                        ...custosVariaveis,
                                        oleoValor: parseFloat(e.target.value) || 0
                                    })}
                                />
                            </Col>
                        </Row>
                    </Col>

                    <Col md="7">
                        <CardResumoCustos
                            titulo="Óleo"
                            custoKm={
                                custosVariaveis.oleoKm && custosVariaveis.oleoValor
                                    ? custosVariaveis.oleoValor / custosVariaveis.oleoKm
                                    : 0
                            }
                            custoMensal={
                                (() => {
                                    const kmTotal = veiculos.reduce((acc, v) => acc + (v.kmMes || 0) * v.quantidade, 0);
                                    if (kmTotal > 0 && custosVariaveis.oleoKm && custosVariaveis.oleoValor) {
                                        return (kmTotal / custosVariaveis.oleoKm) * custosVariaveis.oleoValor;
                                    }
                                    return 0;
                                })()
                            }
                        />
                    </Col>
 <hr />
                </Row>

                <h6>4. Limpeza</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>Feita a cada (km)</Label>
                                <Input style={{marginBottom:5}} type="number" value={custosVariaveis.limpezaKm || ''}
                                    onChange={e => setCustosVariaveis({ ...custosVariaveis, limpezaKm: parseFloat(e.target.value) })} />
                            </Col>
                            <Col md="6">
                                <Label>Valor (R$)</Label>
                                <Input style={{marginBottom:5}} type="number" value={custosVariaveis.limpezaValor || ''}
                                    onChange={e => setCustosVariaveis({ ...custosVariaveis, limpezaValor: parseFloat(e.target.value) })} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md="7">
                        <CardResumoCustos
                            titulo="Limpeza"
                            custoKm={custosVariaveis.limpezaValor / (custosVariaveis.limpezaKm || 1)}
                            custoMensal={(kmTotal / (custosVariaveis.limpezaKm || 1)) * (custosVariaveis.limpezaValor || 0)}
                        />
                    </Col>
 <hr />
                </Row>
                {/* 5. Pneus */}
                <h6>5. Pneus</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>Troca a cada (km)</Label>
                                <Input style={{marginBottom:5}} type="number" value={custosVariaveis.pneusKm || ''}
                                    onChange={e => setCustosVariaveis({ ...custosVariaveis, pneusKm: parseFloat(e.target.value) })} />
                            </Col>
                            <Col md="6">
                                <Label>Valor (R$)</Label>
                                <Input style={{marginBottom:5}} type="number" value={custosVariaveis.pneusValor || ''}
                                    onChange={e => setCustosVariaveis({ ...custosVariaveis, pneusValor: parseFloat(e.target.value) })} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md="7">
                        <CardResumoCustos
                            titulo="Pneus"
                            custoKm={custosVariaveis.pneusValor / (custosVariaveis.pneusKm || 1)}
                            custoMensal={(kmTotal / (custosVariaveis.pneusKm || 1)) * (custosVariaveis.pneusValor || 0)}
                        />
                    </Col>
 <hr />
                </Row>
                {/* 6. Manutenção */}
                <h6>6. Manutenção</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>Coeficiente do veículo (%)</Label>
                                <Input style={{marginBottom:5}} type="number" value={custosVariaveis.manutencaoPct || 5}
                                    onChange={e => setCustosVariaveis({ ...custosVariaveis, manutencaoPct: parseFloat(e.target.value) })} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md="7">
                        <CardResumoCustos
                            titulo="Manutenção"
                            custoKm={kmTotal > 0 ? ((valorVeiculos * (custosVariaveis.manutencaoPct || 5) / 100) / 12) / kmTotal : 0}

                            custoMensal={(valorVeiculos * (custosVariaveis.manutencaoPct || 5) / 100) / 12}
                        />
                    </Col>
 <hr />
                </Row>
                {/* 7. Depreciação */}
                <h6>7. Depreciação</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>Valor estimado de venda (R$)</Label>
                                <Input style={{marginBottom:5}} type="number" value={depreciacao.valorVenda || 0}
                                    onChange={e => setDepreciacao({ ...depreciacao, valorVenda: parseFloat(e.target.value) })} />
                            </Col>
                            <Col md="6">
                                <Label>Anos de uso</Label>
                                <Input style={{marginBottom:5}} type="number" value={depreciacao.anosUso || 5}
                                    onChange={e => setDepreciacao({ ...depreciacao, anosUso: parseInt(e.target.value) })} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md="7">
                        <CardResumoCustos
                            titulo="Depreciação"
                            custoKm={kmTotal > 0 ? ((valorVeiculos - depreciacao.valorVenda) / ((depreciacao.anosUso || 5) * 12)) / kmTotal : 0}

                            custoMensal={(valorVeiculos - depreciacao.valorVenda) / ((depreciacao.anosUso || 5) * 12)}
                        />
                    </Col>
 <hr />
                </Row>
                {/* 9. Remuneração */}
                <h6>9. Remuneração de Capital</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>% ao mês</Label>
                                <Input style={{marginBottom:5}} type="number" value={remuneracao.taxa || 1}
                                    onChange={e => setRemuneracao({ taxa: parseFloat(e.target.value) })} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md="7">
                        <CardResumoCustos
                            titulo="Remuneração de Capital"
                            custoKm={kmTotal > 0 ? ((valorVeiculos * (remuneracao.taxa || 1)) / 100) / kmTotal : 0}

                            custoMensal={(valorVeiculos * (remuneracao.taxa || 1)) / 100}
                        />
                    </Col>
 <hr />
                </Row>
                {/* 10. Licenciamento */}
                <h6>10. Licenciamento</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>Valor (R$)</Label>
                                <Input style={{marginBottom:5}} type="number" value={licenciamento}
                                    onChange={e => setLicenciamento(parseFloat(e.target.value))} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md="7">
                        <CardResumoCustos
                            titulo="Licenciamento"
                            custoKm={kmTotal > 0 ? (licenciamento / 12) / kmTotal : 0}

                            custoMensal={licenciamento / 12}
                        />
                    </Col>
 <hr />
                </Row>
                {/* 11. IPVA */}
                <h6>11. IPVA</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>% sobre valor do veículo</Label>
                                <Input style={{marginBottom:5}} type="number" value={ipva}
                                    onChange={e => setIpva(parseFloat(e.target.value))} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md="7">
                        <CardResumoCustos
                            titulo="IPVA"
                            custoKm={kmTotal > 0 ? ((valorVeiculos * ipva / 100) / 12) / kmTotal : 0}

                            custoMensal={(valorVeiculos * ipva / 100) / 12}
                        />
                    </Col>
 <hr />
                </Row>
                {/* 12. Seguro */}
                <h6>12. Seguro</h6>
                <Row className="align-items-center mb-2">

                    <Col md="5">
                        <Row>
                            <Col md="6">
                                <Label>Valor total (R$)</Label>
                                <Input style={{marginBottom:5}} type="number" value={seguro}
                                    onChange={e => setSeguro(parseFloat(e.target.value))} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md="7">
                        <CardResumoCustos
                            titulo="Seguro"
                            custoKm={kmTotal > 0 ? seguro / kmTotal : 0}

                            custoMensal={seguro}
                        />
                    </Col>
 <hr />
                </Row>
                {/* 13. Outros Custos */}
                <h6>13. Outros Custos</h6>
                {outrosCustos.map((c, idx) => (
                    <Row key={idx} className="align-items-center mb-2">
                        <Col md="5">
                            <Row>
                                <Col md="4">
                                    <Label>Nome</Label>
                                    <Input style={{marginBottom:5}} value={c.nome} onChange={e => {
                                        const novos = [...outrosCustos];
                                        novos[idx].nome = e.target.value;
                                        setOutrosCustos(novos);
                                    }} />
                                </Col>
                                <Col md="4">
                                    <Label>Valor</Label>
                                    <Input style={{marginBottom:5}} type="number" value={c.valor} onChange={e => {
                                        const novos = [...outrosCustos];
                                        novos[idx].valor = parseFloat(e.target.value);
                                        setOutrosCustos(novos);
                                    }} />
                                </Col>
                                <Col md="4">
                                    <Label>Frequência</Label>
                                    <Input style={{marginBottom:5}} type="select" value={c.frequencia} onChange={e => {
                                        const novos = [...outrosCustos];
                                        novos[idx].frequencia = e.target.value;
                                        setOutrosCustos(novos);
                                    }}>
                                        {Object.keys(frequencias).map(freq => (
                                            <option key={freq} value={freq}>{freq}</option>
                                        ))}
                                    </Input>
                                </Col>
                            </Row>
                        </Col>
                        <Col md="7">
                            <CardResumoCustos
                                titulo={c.nome || `Outro ${idx + 1}`}
                                custoKm={kmTotal > 0 ? calcularCustoOutros(c) / kmTotal : 0}

                                custoMensal={calcularCustoOutros(c)}
                            />
                        </Col>
                    </Row>
                ))}
  <Button color="primary" onClick={() => setOutrosCustos([...outrosCustos, { nome: '', valor: 0, frequencia: 'mensal' }])}>+ Custo</Button>
                <hr />
<Row className="mt-4">
  <Col md="5"></Col>
  <Col md="7">
    <CardResumoCustos
      titulo="Resumo Final"

      custoKm={custoTotalKm}
      custoMensal={custoMensalTotal}
      destaque
    />
  </Col>
</Row>



            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={salvar}>Salvar</Button>
                <Button color="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
            </ModalFooter>
        </Modal>
    );
};

export default ModalDespesa;
