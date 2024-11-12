const custoPessoalDepFrota = {
    base: "09/2024",
    total: "R$ 72.825,28",
    pessoas: [
        { tipo: "CLT", nome: "JEAN MARCEL", valor: "R$ 4.727,08", funcao:"Emissor CTE" },
        { tipo: "CLT", nome: "LEVI KARLAY", valor: "R$ 4.345,42", funcao:"Analista"},
        { tipo: "CLT", nome: "MARCOS AURELIO", valor: "R$ 4.525,17", funcao:"Analista"},
        { tipo: "CLT", nome: "VICTOR THIYLER", valor: "R$ 3.988,07", funcao:"Emissor CTE" },
        { tipo: "CLT", nome: "Emissor 4", valor: "R$ 3.988,07", funcao:"Emissor CTE" },
        { tipo: "PJ", nome: "FABIO DAMBROSKI", valor: "R$ 6.750,00", funcao:"Supervisão" },
        { tipo: "PJ", nome: "ISABELE CONFORTO", valor: "R$ 8.000,00", funcao:"Gestão Administrativa"},
        { tipo: "PJ", nome: "FABIANO SANTANA", valor: "R$ 7.583,33",funcao:"Gestão Manutenção" },
        { tipo: "PJ", nome: "MARCIO BALDON", valor: "R$ 13.433,35",funcao:"Gestão Manutenção" },
        { tipo: "PJ", nome: "PAULO CESAR", valor: "R$ 6.472,85",funcao:"Emissor CTE" },
        { tipo: "PJ", nome: "RAFAELA BARBOSA", valor: "R$ 5.958,33",funcao:"Supervisão" },
        { tipo: "PJ", nome: "SANDRO FERREIRA", valor: "R$ 7.041,67",funcao:"Operador Manutenção" }
    ]
};
const custoSoftware = {
    base: "09/2024",
    total: "R$ 95.343,88",
    despesas: [
        { despesa: "Gerenciamento de Risco GS CARGO", valor: "R$ 8.623,01", ativo: 's'},
        { despesa: "Gerenciamento de Risco FORZA", valor: "R$ 6.610,10",ativo: 's' },
        { despesa: "Gerenciamento de Risco GOBRAX", valor: "R$ 16.639,42",ativo: 's' },
        { despesa: "Gerenciamento de Risco ZALF", valor: "R$ 2.298,47",ativo: 's' },
        { despesa: "Gerenciamento de Risco GLOBAL", valor: "R$ 16.384,97",ativo: 's' },
        { despesa: "Gerenciamento de Risco SASCAR", valor: "R$ 641,12",ativo: 's' },
        { despesa: "Gerenciamento de Risco NACIONALSAT", valor: "R$ 15.388,00",ativo: 's' },
        { despesa: "Gerenciamento de Risco TRUCKS", valor: "R$ 22.344,22",ativo: 's' },
        { despesa: "Gerenciamento de Risco CHECKLIST", valor: "R$ 2.298,47",ativo: 's' },
        { despesa: "Escalasoft", valor: "R$ 1200,00",ativo: 's' },
        { despesa: "Auto de Infração/ Multas", valor: "R$ 613,66",ativo: 's' },
        { despesa: "Software Controle de Jornada", valor: "R$ 3.502,44",ativo: 's' },
        { despesa: "Investimento Software Carra", valor: "R$ 3.502,44", parcelas: 24,ativo: 'n'}
    ]
};

export  {custoPessoalDepFrota, custoSoftware}